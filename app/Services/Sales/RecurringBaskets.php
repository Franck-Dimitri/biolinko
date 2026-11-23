<?php

namespace App\Services\Sales;

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\RecurringBasket;
use App\Models\Store;
use App\Payments\Countries;
use App\Services\Whatsapp\WhatsappGatewayService;
use App\Support\OpeningHours;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Panier de la semaine : créé au paiement d'une commande cochée « chaque semaine », puis recréé
 * 2 jours avant chaque livraison avec les prix du moment. Le client reçoit un lien de paiement sur WhatsApp.
 * Arrêté par le client, ou automatiquement après 2 paniers non payés ou si plus rien n'est disponible.
 */
class RecurringBaskets
{
    /** Jours entre la création du panier et sa livraison : le temps de le payer. */
    public const LEAD_DAYS = 2;

    public const MAX_UNPAID = 2;

    public static function eligible(?Store $store): bool
    {
        return $store?->business_type === 'alimentation';
    }

    /** Commande cochée « chaque semaine » : le panier attend son premier paiement. */
    public function prepare(Order $order, array $items): RecurringBasket
    {
        $basket = RecurringBasket::create([
            'store_id' => $order->store_id, 'customer_id' => $order->customer_id, 'first_order_id' => $order->id,
            'token' => Str::random(40), 'customer_name' => $order->customer_name, 'customer_phone' => $order->customer_phone,
            'customer_whatsapp' => $order->customer_whatsapp, 'customer_email' => $order->customer_email,
            'city' => $order->city, 'address_details' => $order->address_details, 'desired_slot' => $order->desired_slot,
            'items' => array_values(array_map(fn ($it) => [
                'product_id' => (int) $it['product_id'], 'variant_id' => $it['variant_id'] ?? null, 'quantity' => (int) $it['quantity'],
            ], $items)),
            'next_run_at' => now(), 'active' => false,
        ]);
        $order->update(['recurring_basket_id' => $basket->id]);

        return $basket;
    }

    /** Premier paiement reçu : le panier revient chaque semaine, le même jour de livraison. */
    public function activate(Order $order): void
    {
        $basket = $order->recurring_basket_id ? RecurringBasket::find($order->recurring_basket_id) : null;
        if (! $basket || $basket->active || $basket->stopped_reason || $basket->first_order_id !== $order->id) {
            return;
        }
        $delivery = $order->desired_date ? Carbon::parse($order->desired_date, OpeningHours::TIMEZONE) : now(OpeningHours::TIMEZONE);
        $basket->update(['active' => true, 'next_run_at' => $this->runFor($delivery->copy()->addWeek())]);
    }

    /** Recrée les paniers arrivés à échéance. Renvoie le nombre de commandes créées. */
    public function renewDue(): int
    {
        $created = 0;
        RecurringBasket::with('store')->where('active', true)->where('next_run_at', '<=', now())->chunkById(100, function ($baskets) use (&$created) {
            foreach ($baskets as $basket) {
                $created += (int) (bool) $this->renew($basket);
            }
        });

        return $created;
    }

    public function renew(RecurringBasket $basket): ?Order
    {
        $store = $basket->store;
        $delivery = $basket->next_run_at->copy()->setTimezone(OpeningHours::TIMEZONE)->addDays(self::LEAD_DAYS)->startOfDay();
        $basket->update(['next_run_at' => $this->runFor($delivery->copy()->addWeek())]);

        $unpaid = $basket->orders()->where('id', '!=', $basket->first_order_id)->latest('id')->take(self::MAX_UNPAID)->get();
        if ($unpaid->count() === self::MAX_UNPAID && $unpaid->every(fn ($o) => $o->payment_status !== 'paid')) {
            return $this->stop($basket, 'unpaid');
        }
        if (! $store?->is_published || $store->user?->is_banned) {
            return $this->stop($basket, 'store');
        }

        // Prix du moment ; un article qui n'est plus disponible est simplement retiré du panier
        $lines = [];
        foreach ($basket->items as $item) {
            $product = Product::where('store_id', $store->id)->where('is_active', true)->find($item['product_id']);
            $variant = $item['variant_id'] ? ProductVariant::where('product_id', $product?->id)->find($item['variant_id']) : null;
            if (! $product || (! $product->isMadeToOrder() && $product->stock < $item['quantity'])) {
                continue;
            }
            $unit = $variant && (float) $variant->price > 0 ? (float) $variant->price : ($product->promoActive() ? (float) $product->promo_price : (float) $product->price_vendor);
            $lines[] = ['product' => $product, 'variant' => $variant, 'quantity' => $item['quantity'], 'unit' => $unit];
        }
        $goods = array_sum(array_map(fn ($l) => $l['unit'] * $l['quantity'], $lines));
        if (! $lines || $goods < (float) Countries::minOrder($store->country ?: 'CM')) {
            return $this->stop($basket, 'unavailable');
        }
        $deliveryFee = $store->deliveryFeeFor((string) $basket->city, $goods);
        if ($deliveryFee === null) {
            return $this->stop($basket, 'delivery');
        }

        $vendor = $goods + $deliveryFee;
        $fee = Order::clientFee($vendor);
        $order = Order::create([
            'store_id' => $store->id, 'customer_id' => $basket->customer_id, 'recurring_basket_id' => $basket->id,
            'customer_name' => $basket->customer_name, 'customer_phone' => $basket->customer_phone, 'customer_whatsapp' => $basket->customer_whatsapp,
            'customer_email' => $basket->customer_email, 'city' => $basket->city, 'address_details' => $basket->address_details,
            'desired_date' => $delivery->toDateString(), 'desired_slot' => $basket->desired_slot,
            'price_vendor' => $vendor, 'subtotal' => $goods, 'discount_amount' => 0, 'delivery_fee' => $deliveryFee, 'balance_due' => 0,
            'saas_margin' => $fee, 'api_fee' => 0, 'total_client' => $vendor + $fee, 'status' => 'pending', 'payment_status' => 'pending',
            'payment_phone' => $basket->customer_phone, 'currency' => $store->currency ?: 'XAF', 'payment_country' => $store->country ?: 'CM',
        ]);
        foreach ($lines as $l) {
            $order->items()->create([
                'product_id' => $l['product']->id, 'variant_id' => $l['variant']?->id, 'product_title' => $l['product']->title,
                'variant_label' => $l['variant'] ? ($l['variant']->name ?: trim($l['variant']->size.' '.$l['variant']->color)) : null,
                'quantity' => $l['quantity'], 'unit_price_vendor' => $l['unit'], 'total_price_vendor' => $l['unit'] * $l['quantity'],
            ]);
        }

        try {
            app(WhatsappGatewayService::class)->notifyRecurringBasket($order);
        } catch (\Throwable $e) {
            report($e);
        }

        return $order;
    }

    public function stop(RecurringBasket $basket, string $reason): null
    {
        $basket->update(['active' => false, 'stopped_reason' => $reason]);

        return null;
    }

    /** Création du panier : 2 jours avant la livraison, à 9 h (heure du Cameroun), au plus tôt maintenant. */
    private function runFor(Carbon $delivery): Carbon
    {
        $run = $delivery->copy()->setTimezone(OpeningHours::TIMEZONE)->startOfDay()->subDays(self::LEAD_DAYS)->setTime(9, 0);

        return $run->isPast() ? now() : $run->setTimezone(config('app.timezone'));
    }
}
