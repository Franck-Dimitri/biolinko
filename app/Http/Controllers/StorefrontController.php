<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function show(string $slug): Response
    {
        $store = Store::where('slug', $slug)
            ->with(['reviews' => function ($q) {
                $q->latest();
            }])
            ->firstOrFail();

        $products = $store->products()
            ->where('is_active', true)
            ->with('variants')
            ->latest()
            ->get()
            ->map(function ($product) {
                $pv = (float) $product->price_vendor;
                
                if ($product->is_promo && $product->promo_price > 0) {
                    $promoPv = (float) $product->promo_price;
                    $pb = ceil($promoPv * 1.02); // New Promo Base Price
                    $originalPb = ceil($pv * 1.02); // Original Base Price before discount
                    $savings = $originalPb - $pb;

                    $product->price_display = $pb;
                    $product->original_price_display = $originalPb;
                    $product->savings_display = $savings;
                    $product->discount_percentage = $originalPb > 0 ? round(($savings / $originalPb) * 100) : 0;
                } else {
                    $pb = ceil($pv * 1.02);
                    $product->price_display = $pb;
                    $product->original_price_display = null;
                    $product->savings_display = 0;
                    $product->discount_percentage = 0;
                }

                $tc = ceil($pb / 0.98); // Total Checkout Price with MoMo fee
                $product->price_client_total = $tc;
                $product->api_fee_unit = $tc - $pb;
                return $product;
            });

        return Inertia::render('Storefront/Show', [
            'store' => $store,
            'products' => $products,
            'appUrl' => config('app.url', 'http://localhost:8000'),
        ]);
    }
}
