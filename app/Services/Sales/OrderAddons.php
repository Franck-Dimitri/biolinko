<?php

namespace App\Services\Sales;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Payments\Countries;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Ajout après paiement : sur la page de confirmation, le client ajoute un article à sa commande payée.
 * Il est livré avec elle, sans frais de livraison, et payé à part en Mobile Money (petite commande liée).
 * Seuls les articles ajoutables en un geste sont proposés : disponibles à temps, sans précision obligatoire.
 */
class OrderAddons
{
    public const MAX_QUANTITY = 10;

    /** Articles proposés pour une commande (au plus $limit), les moins chers d'abord. */
    public function offers(Order $order, int $limit = 4): Collection
    {
        if (! $order->canTakeAddons()) {
            return collect();
        }
        $min = $this->minOrder($order);
        // Ni ce qui est déjà commandé, ni ce qui vient d'être ajouté (payé ou en attente de paiement)
        $already = $order->items->pluck('product_id')
            ->merge(OrderItem::whereHas('order', fn ($q) => $q->where('parent_order_id', $order->id)->whereIn('payment_status', ['paid', 'pending']))->pluck('product_id'))
            ->filter()->unique()->all();

        return Product::where('store_id', $order->store_id)->where('is_active', true)
            ->whereNotIn('id', $already)->with('variants')->get()
            ->filter(fn (Product $p) => $this->unavailableReason($order, $p, null, 1) === null)
            ->map(function (Product $p) use ($min) {
                $price = $this->unitPrice($p, null);
                // Petit article : quantité minimale pour atteindre le montant minimum d'un paiement
                $quantity = max(1, (int) ceil($min / max(1, $price)));

                return $quantity > self::MAX_QUANTITY ? null : [
                    'id' => $p->id,
                    'title' => $p->title,
                    'slug' => $p->slug,
                    'image' => $p->image_url ?: ($p->images[0] ?? null),
                    'price' => $price,
                    'min_quantity' => $quantity,
                    'variants' => $p->variants->map(fn ($v) => ['id' => $v->id, 'label' => $this->variantLabel($v), 'price' => $this->unitPrice($p, $v)])->values(),
                ];
            })
            ->filter()->sortBy('price')->take($limit)->values();
    }

    /** Pourquoi un article ne peut pas être ajouté (null = possible). */
    public function unavailableReason(Order $order, Product $product, ?ProductVariant $variant, int $quantity): ?string
    {
        if (! $order->canTakeAddons()) {
            return 'Votre commande est déjà en route : il n’est plus possible d’y ajouter un article.';
        }
        if ($product->store_id !== $order->store_id || ! $product->is_active) {
            return 'Cet article n’est plus disponible.';
        }
        if (collect($product->customFields())->contains(fn ($f) => ! empty($f['required']))) {
            return "« {$product->title} » demande des précisions : commandez-le depuis la boutique.";
        }
        if ($product->isMadeToOrder()) {
            // Préparé à temps pour partir avec la commande : la date souhaitée doit laisser le délai de préparation
            $lead = (int) $product->lead_time_hours;
            $date = $order->desired_date ? Carbon::parse($order->desired_date)->endOfDay() : null;
            if ($lead > 0 && (! $date || $date->lt(now()->addHours($lead)))) {
                return "« {$product->title} » ne peut pas être prêt à temps pour partir avec votre commande.";
            }
            if ($date && $product->daily_capacity) {
                $booked = OrderItem::where('product_id', $product->id)
                    ->whereHas('order', fn ($q) => $q->whereDate('desired_date', $date->toDateString())->where('payment_status', 'paid'))->sum('quantity');
                if ($booked + $quantity > $product->daily_capacity) {
                    return "Plus de place pour « {$product->title} » ce jour-là.";
                }
            }
        } elseif ((int) $product->stock < $quantity) {
            return "Il ne reste pas assez de « {$product->title} ».";
        }
        if ($variant && $variant->stock_quantity !== null && (int) $variant->stock_quantity < $quantity) {
            return 'Cette option n’est plus disponible en quantité suffisante.';
        }

        return null;
    }

    /**
     * Crée l'ajout (commande liée, en attente de paiement) : mêmes coordonnées et même date que la commande,
     * livraison offerte puisqu'il part avec elle.
     *
     * @return array{0: ?Order, 1: ?string}
     */
    public function create(Order $order, Product $product, ?ProductVariant $variant, int $quantity): array
    {
        if ($quantity < 1 || $quantity > self::MAX_QUANTITY) {
            return [null, 'Choisissez une quantité entre 1 et '.self::MAX_QUANTITY.'.'];
        }
        if ($reason = $this->unavailableReason($order, $product, $variant, $quantity)) {
            return [null, $reason];
        }

        $unit = $this->unitPrice($product, $variant);
        $goods = $unit * $quantity;
        $min = $this->minOrder($order);
        if ($goods < $min) {
            return [null, 'Le montant minimum d’un paiement est de '.number_format($min, 0, ',', ' ').' FCFA : augmentez la quantité.'];
        }

        $fee = Order::clientFee($goods);
        $addon = Order::create([
            'parent_order_id' => $order->id,
            'store_id' => $order->store_id,
            'customer_id' => $order->customer_id,
            'customer_name' => $order->customer_name,
            'customer_phone' => $order->customer_phone,
            'customer_email' => $order->customer_email,
            'customer_whatsapp' => $order->customer_whatsapp,
            'city' => $order->city,
            'address_details' => $order->address_details,
            'desired_date' => $order->desired_date,
            'desired_slot' => $order->desired_slot,
            'price_vendor' => $goods,
            'subtotal' => $goods,
            'discount_amount' => 0,
            'delivery_fee' => 0,
            'balance_due' => 0,
            'saas_margin' => $fee,
            'api_fee' => 0,
            'total_client' => $goods + $fee,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_phone' => $order->payment_phone ?: $order->customer_phone,
            'payment_operator' => $order->payment_operator,
            'currency' => $order->currency,
            'payment_country' => $order->payment_country,
        ]);
        $addon->items()->create([
            'product_id' => $product->id,
            'variant_id' => $variant?->id,
            'product_title' => $product->title,
            'variant_label' => $variant ? $this->variantLabel($variant) : null,
            'quantity' => $quantity,
            'unit_price_vendor' => $unit,
            'total_price_vendor' => $goods,
        ]);

        return [$addon, null];
    }

    private function unitPrice(Product $product, ?ProductVariant $variant): float
    {
        if ($variant && (float) $variant->price > 0) {
            return (float) $variant->price;
        }

        return $product->promoActive() ? (float) $product->promo_price : (float) $product->price_vendor;
    }

    private function variantLabel(ProductVariant $v): string
    {
        return $v->name ?: trim(($v->size ? "Taille: {$v->size} " : '').($v->color ? "Couleur: {$v->color}" : ''));
    }

    private function minOrder(Order $order): float
    {
        return (float) Countries::minOrder($order->payment_country ?: 'CM');
    }
}
