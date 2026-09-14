<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontController extends Controller
{
    public function show(string $slug)
    {
        $store = Store::where('slug', $slug)
            ->with(['user', 'reviews' => function ($q) {
                $q->where('is_featured', true)->latest();
            }])
            ->first();

        // 1. Boutique inexistante
        if (!$store) {
            return Inertia::render('Errors/StoreUnavailable', [
                'reason' => 'not_found',
                'slug' => $slug,
            ])->toResponse(request())->setStatusCode(404);
        }

        // 2. Compte vendeur banni / suspendu
        if ($store->user && $store->user->is_banned) {
            return Inertia::render('Errors/StoreUnavailable', [
                'reason' => 'banned',
                'storeName' => $store->name,
                'slug' => $slug,
            ])->toResponse(request())->setStatusCode(403);
        }

        // 3. Boutique non publiée (privée / en brouillon)
        $isOwnerOrAdmin = auth()->check() && (auth()->id() === $store->user_id || (method_exists(auth()->user(), 'isAdmin') && auth()->user()->isAdmin()));
        if (!$store->is_published && !$isOwnerOrAdmin) {
            return Inertia::render('Errors/StoreUnavailable', [
                'reason' => 'unpublished',
                'storeName' => $store->name,
                'slug' => $slug,
            ])->toResponse(request())->setStatusCode(403);
        }

        $products = $store->products()
            ->where('is_active', true)
            ->with('variants')
            ->latest()
            ->get()
            ->map(function ($product) {
                $pv = (float) $product->price_vendor;
                
                if ($product->is_promo && $product->promo_price > 0) {
                    $promoPv = (float) $product->promo_price;
                    $pb = $promoPv; // Promo Base Vendor Price
                    $originalPb = $pv; // Original Base Vendor Price
                    $savings = $originalPb - $pb;

                    $product->price_display = $pb;
                    $product->original_price_display = $originalPb;
                    $product->savings_display = $savings;
                    $product->discount_percentage = $originalPb > 0 ? round(($savings / $originalPb) * 100) : 0;
                } else {
                    $pb = $pv;
                    $product->price_display = $pb;
                    $product->original_price_display = null;
                    $product->savings_display = 0;
                    $product->discount_percentage = 0;
                }

                $tc = ceil($pb * 1.03); // Total Checkout Price with 3% platform fee
                $product->price_client_total = $tc;
                $product->api_fee_unit = $tc - $pb;
                return $product;
            });

        $activeSmartLinks = \App\Models\SmartLink::where('store_id', $store->id)
            ->where('is_active', true)
            ->latest()
            ->get();

        if (empty($store->sections_json)) {
            $store->sections_json = Store::getDefaultSections();
        }

        return Inertia::render('Storefront/Boutique', [
            'store' => $store,
            'products' => $products,
            'activeSmartLinks' => $activeSmartLinks,
            'appUrl' => request()->getSchemeAndHttpHost() ?: config('app.url', 'http://localhost:8000'),
            'isPreview' => !$store->is_published && $isOwnerOrAdmin,
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

    public function showProduct(string $slug, string $product_slug)
    {
        $store = Store::where('slug', $slug)->with(['user', 'reviews'])->first();

        // 1. Boutique inexistante
        if (!$store) {
            return Inertia::render('Errors/StoreUnavailable', [
                'reason' => 'not_found',
                'slug' => $slug,
            ])->toResponse(request())->setStatusCode(404);
        }

        // 2. Compte vendeur banni / suspendu
        if ($store->user && $store->user->is_banned) {
            return Inertia::render('Errors/StoreUnavailable', [
                'reason' => 'banned',
                'storeName' => $store->name,
                'slug' => $slug,
            ])->toResponse(request())->setStatusCode(403);
        }

        // 3. Boutique non publiée
        $isOwnerOrAdmin = auth()->check() && (auth()->id() === $store->user_id || (method_exists(auth()->user(), 'isAdmin') && auth()->user()->isAdmin()));
        if (!$store->is_published && !$isOwnerOrAdmin) {
            return Inertia::render('Errors/StoreUnavailable', [
                'reason' => 'unpublished',
                'storeName' => $store->name,
                'slug' => $slug,
            ])->toResponse(request())->setStatusCode(403);
        }

        // 4. Produit inexistant ou inactif
        $product = $store->products()
            ->where('slug', $product_slug)
            ->where('is_active', true)
            ->with('variants')
            ->first();

        if (!$product) {
            return Inertia::render('Errors/ProductUnavailable', [
                'store' => [
                    'name' => $store->name,
                    'slug' => $store->slug,
                    'logo_url' => $store->logo_url,
                ],
                'productSlug' => $product_slug,
            ])->toResponse(request())->setStatusCode(404);
        }

        $store->load(['products' => function ($q) {
            $q->where('is_active', true)->latest();
        }]);

        $store->products->transform(function ($p) {
            $pv = (float) $p->price_vendor;
            if ($p->is_promo && $p->promo_price > 0) {
                $p->price_display = (float) $p->promo_price;
            } else {
                $p->price_display = $pv;
            }
            return $p;
        });

        $pv = (float) $product->price_vendor;
        if ($product->is_promo && $product->promo_price > 0) {
            $promoPv = (float) $product->promo_price;
            $pb = $promoPv;
            $originalPb = $pv;
            $savings = $originalPb - $pb;

            $product->price_display = $pb;
            $product->original_price_display = $originalPb;
            $product->savings_display = $savings;
            $product->discount_percentage = $originalPb > 0 ? round(($savings / $originalPb) * 100) : 0;
        } else {
            $pb = $pv;
            $product->price_display = $pb;
            $product->original_price_display = null;
            $product->savings_display = 0;
            $product->discount_percentage = 0;
        }

        $tc = ceil($pb * 1.03);
        $product->price_client_total = $tc;
        $product->api_fee_unit = $tc - $pb;

        return Inertia::render('Storefront/[slug]', [
            'store' => $store,
            'product' => $product,
            'appUrl' => request()->getSchemeAndHttpHost() ?: config('app.url', 'http://localhost:8000'),
            'isPreview' => !$store->is_published && $isOwnerOrAdmin,
        ]);
    }
}
