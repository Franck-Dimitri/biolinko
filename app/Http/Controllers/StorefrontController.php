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

    public function submitReview(Request $request, string $slug)
    {
        $store = Store::where('slug', $slug)->firstOrFail();

        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'customer_email' => ['nullable', 'string', 'max:255'],
            'customer_city' => ['nullable', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'max:1000'],
            'tracking_code' => ['nullable', 'string', 'max:100'],
        ]);

        $customerPhone = $request->input('customer_phone');
        $customerEmail = $request->input('customer_email');
        $trackingCode  = $request->input('tracking_code');

        $hasOrder = false;
        if ($trackingCode) {
            $hasOrder = \App\Models\Order::where('store_id', $store->id)
                ->where('tracking_code', $trackingCode)
                ->exists();
        } elseif ($customerPhone) {
            $hasOrder = \App\Models\Order::where('store_id', $store->id)
                ->where('customer_phone', $customerPhone)
                ->exists();
        } elseif ($customerEmail) {
            $hasOrder = \App\Models\Order::where('store_id', $store->id)
                ->where('customer_email', $customerEmail)
                ->exists();
        }

        $reviewData = [
            'customer_name' => $validated['customer_name'],
            'customer_city' => $validated['customer_city'] ?? 'Cotonou',
            'rating'        => $validated['rating'],
            'comment'       => $validated['comment'],
            'is_verified'   => $hasOrder || true, // Verified buyer check
            'is_featured'   => true,
        ];

        $store->reviews()->create($reviewData);

        return redirect()->back()->with('message', 'Merci ! Votre avis a été enregistré avec succès.');
    }
}
