<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function process(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'store_id' => ['required', 'exists:stores,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_whatsapp' => ['nullable', 'string', 'max:50'],
            'delivery_address' => ['required', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:500'],
            
            // Support for Single-item checkout
            'product_id' => ['nullable', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],

            // Support for Multi-item Cart Checkout
            'items' => ['nullable', 'array'],
            'items.*.product_id' => ['required_with:items', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
        ]);

        $store = Store::findOrFail($validated['store_id']);

        // Determine list of items to process
        $checkoutItems = [];
        if (!empty($validated['items']) && count($validated['items']) > 0) {
            $checkoutItems = $validated['items'];
        } elseif (!empty($validated['product_id'])) {
            $checkoutItems[] = [
                'product_id' => $validated['product_id'],
                'variant_id' => $validated['variant_id'] ?? null,
                'quantity' => $validated['quantity'] ?? 1,
            ];
        } else {
            return back()->withErrors(['product_id' => 'Aucun article sélectionné pour la commande.']);
        }

        $priceVendorTotal = 0;
        $saasMarginTotal = 0;
        $apiFeeTotal = 0;
        $totalClient = 0;

        $preparedOrderItems = [];

        foreach ($checkoutItems as $item) {
            $product = Product::where('store_id', $store->id)
                ->where('id', $item['product_id'])
                ->firstOrFail();

            $variant = null;
            if (!empty($item['variant_id'])) {
                $variant = ProductVariant::where('product_id', $product->id)
                    ->where('id', $item['variant_id'])
                    ->first();
            }

            $minQ = $product->min_order_quantity || 1;
            $quantity = max((int)$item['quantity'], $minQ);

            $currentPv = ($product->is_promo && $product->promo_price > 0) 
                ? (float) $product->promo_price 
                : (float) $product->price_vendor;

            $pbUnit = ceil($currentPv * 1.02);
            $tcUnit = ceil($pbUnit / 0.98);

            $itemVendorPrice = $currentPv * $quantity;
            $itemSaasMargin = ($pbUnit - $currentPv) * $quantity;
            $itemApiFee = ($tcUnit - $pbUnit) * $quantity;
            $itemTotalClient = $tcUnit * $quantity;

            $priceVendorTotal += $itemVendorPrice;
            $saasMarginTotal += $itemSaasMargin;
            $apiFeeTotal += $itemApiFee;
            $totalClient += $itemTotalClient;

            $variantLabel = $variant ? trim(($variant->size ? "Taille: {$variant->size} " : "") . ($variant->color ? "Couleur: {$variant->color}" : "")) : null;

            $preparedOrderItems[] = [
                'product_id' => $product->id,
                'variant_id' => $variant ? $variant->id : null,
                'product_title' => $product->title,
                'variant_label' => $variantLabel,
                'quantity' => $quantity,
                'unit_price_vendor' => $currentPv,
                'total_price_vendor' => $itemVendorPrice,
            ];
        }

        // Unique tracking code e.g. BLK-892471
        $trackingCode = 'BLK-' . strtoupper(Str::random(6));

        $extraNotes = [];
        if (!empty($validated['customer_whatsapp'])) {
            $extraNotes[] = "WhatsApp: {$validated['customer_whatsapp']}";
        }
        if (!empty($validated['notes'])) {
            $extraNotes[] = "Note: {$validated['notes']}";
        }

        $addressWithNotes = $validated['delivery_address'] . (count($extraNotes) > 0 ? " (" . implode(" | ", $extraNotes) . ")" : "");

        // Create Order
        $order = Order::create([
            'uuid' => (string) Str::uuid(),
            'tracking_code' => $trackingCode,
            'store_id' => $store->id,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => $validated['customer_email'] ?? null,
            'city' => $validated['delivery_address'],
            'address_details' => $addressWithNotes,
            'price_vendor' => $priceVendorTotal,
            'saas_margin' => $saasMarginTotal,
            'api_fee' => $apiFeeTotal,
            'total_client' => $totalClient,
            'status' => 'paid',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        // Create Order Items
        foreach ($preparedOrderItems as $itemData) {
            $order->items()->create($itemData);
        }

        // Automatically credit vendor's wallet balance
        $wallet = $store->wallet;
        if ($wallet) {
            $wallet->increment('balance_available', $priceVendorTotal);
        }

        return redirect()->route('order.track', $trackingCode)->with('message', 'Paiement Mobile Money validé avec succès !');
    }
}
