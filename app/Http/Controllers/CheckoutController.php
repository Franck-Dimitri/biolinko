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
            'product_id' => ['required', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'address_details' => ['nullable', 'string', 'max:500'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $store = Store::findOrFail($validated['store_id']);
        $product = Product::where('store_id', $store->id)->where('id', $validated['product_id'])->firstOrFail();

        $variant = null;
        if (!empty($validated['variant_id'])) {
            $variant = ProductVariant::where('product_id', $product->id)->where('id', $validated['variant_id'])->first();
        }

        $quantity = (int) $validated['quantity'];
        $pvUnit = (float) $product->price_vendor;
        $pbUnit = $pvUnit * 1.02;
        $tcUnit = ceil($pbUnit / 0.98);

        $priceVendorTotal = $pvUnit * $quantity;
        $saasMarginTotal = ($pbUnit - $pvUnit) * $quantity;
        $apiFeeTotal = ($tcUnit - $pbUnit) * $quantity;
        $totalClient = $tcUnit * $quantity;

        // Unique tracking code e.g. BLK-892471
        $trackingCode = 'BLK-' . strtoupper(Str::random(6));

        // Create Order
        $order = Order::create([
            'uuid' => (string) Str::uuid(),
            'tracking_code' => $trackingCode,
            'store_id' => $store->id,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => $validated['customer_email'] ?? null,
            'city' => $validated['city'],
            'address_details' => $validated['address_details'] ?? null,
            'price_vendor' => $priceVendorTotal,
            'saas_margin' => $saasMarginTotal,
            'api_fee' => $apiFeeTotal,
            'total_client' => $totalClient,
            'status' => 'paid',
            'payment_status' => 'paid',
            'paid_at' => now(),
        ]);

        // Create Order Item
        $variantLabel = $variant ? trim(($variant->size ? "Taille: {$variant->size} " : "") . ($variant->color ? "Couleur: {$variant->color}" : "")) : null;

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'variant_id' => $variant ? $variant->id : null,
            'product_title' => $product->title,
            'variant_label' => $variantLabel,
            'quantity' => $quantity,
            'unit_price_vendor' => $pvUnit,
            'total_price_vendor' => $priceVendorTotal,
        ]);

        // Automatically credit vendor's wallet balance
        $wallet = $store->wallet;
        if ($wallet) {
            $wallet->increment('balance_available', $priceVendorTotal);
        }

        return redirect()->route('order.track', $trackingCode)->with('message', 'Paiement Mobile Money validé avec succès !');
    }
}
