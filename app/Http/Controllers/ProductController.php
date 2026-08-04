<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $store = $request->user()->store;

        $products = $store->products()
            ->with('variants')
            ->latest()
            ->get();

        // Stats Metrics
        $totalProducts = $products->count();
        $totalStockValue = $products->sum(function ($p) {
            return (float) $p->price_vendor * (int) $p->stock;
        });
        $lowStockCount = $products->filter(function ($p) {
            return (int) $p->stock <= 3;
        })->count();

        $topProduct = $products->sortByDesc('stock')->first();

        return Inertia::render('Products/Index', [
            'store' => $store,
            'products' => $products,
            'metrics' => [
                'totalProducts' => $totalProducts,
                'totalStockValue' => $totalStockValue,
                'lowStockCount' => $lowStockCount,
                'topProduct' => $topProduct,
            ],
            'appUrl' => config('app.url', 'http://localhost:8000'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        $store = $user->store;

        // Plan quota limits enforcement
        $userPlan = $user->plan ?? 'starter';
        $maxProductsMap = [
            'starter' => 10,
            'pro' => 50,
            'growth' => 200,
            'business' => 99999,
        ];
        $maxAllowed = $maxProductsMap[$userPlan] ?? 10;
        if ($store->products()->count() >= $maxAllowed) {
            return redirect()->back()->withErrors([
                'title' => "Limite de {$maxAllowed} produits atteinte pour le plan " . strtoupper($userPlan) . ". Veuillez passer au plan supérieur.",
            ]);
        }

        if ($request->input('promo_price') === '') {
            $request->merge(['promo_price' => null]);
        }
        if ($request->input('promo_start_at') === '') {
            $request->merge(['promo_start_at' => null]);
        }
        if ($request->input('promo_end_at') === '') {
            $request->merge(['promo_end_at' => null]);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_vendor' => ['required', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'min_order_quantity' => ['required', 'integer', 'min:1'],
            'is_promo' => ['nullable', 'boolean'],
            'promo_price' => ['nullable', 'numeric', 'min:0'],
            'promo_start_at' => ['nullable', 'date'],
            'promo_end_at' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
            'image_file' => ['nullable', 'image', 'max:5120'],
            'images_files' => ['nullable', 'array'],
            'images_files.*' => ['nullable', 'image', 'max:5120'],
            'image_url_input' => ['nullable', 'string'],
            'variants' => ['nullable', 'array'],
        ]);

        if ($request->boolean('is_promo') && $userPlan === 'starter') {
            return redirect()->back()->withErrors([
                'title' => "La mise en promotion des produits est réservée aux abonnements PRO, GROWTH et BUSINESS. Passez au plan Pro pour activer les promotions.",
            ]);
        }

        $imagePaths = [];

        if ($request->hasFile('images_files')) {
            foreach ($request->file('images_files') as $file) {
                if ($file && count($imagePaths) < 5) {
                    $path = $file->store('products', 'public');
                    $imagePaths[] = '/storage/' . $path;
                }
            }
        } elseif ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('products', 'public');
            $imagePaths[] = '/storage/' . $path;
        }

        if (!empty($validated['image_url_input'])) {
            $imagePaths[] = $validated['image_url_input'];
        }

        // Fallback default placeholder if no image provided
        if (empty($imagePaths)) {
            $imagePaths[] = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
        }

        $slug = \Illuminate\Support\Str::slug($validated['title']) . '-' . \Illuminate\Support\Str::random(4);

        $product = $store->products()->create([
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'price_vendor' => $validated['price_vendor'],
            'stock' => $validated['stock'],
            'min_order_quantity' => $validated['min_order_quantity'] ?? 1,
            'is_promo' => $request->boolean('is_promo'),
            'promo_price' => $validated['promo_price'] ?? null,
            'promo_start_at' => $validated['promo_start_at'] ?? null,
            'promo_end_at' => $validated['promo_end_at'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'image_url' => $imagePaths[0],
            'images' => $imagePaths,
        ]);

        if (!empty($validated['variants'])) {
            $validVariants = array_filter($validated['variants'], function($v) {
                return !empty($v['name']) || !empty($v['size']) || !empty($v['color']);
            });

            if ($userPlan === 'starter' && count($validVariants) > 1) {
                return redirect()->back()->withErrors([
                    'title' => "La formule STARTER est limitée à 1 seule variante par produit. Passez au plan PRO pour ajouter des variantes illimitées.",
                ]);
            }

            foreach ($validVariants as $v) {
                $product->variants()->create([
                    'name' => $v['name'] ?? null,
                    'size' => $v['size'] ?? null,
                    'color' => $v['color'] ?? null,
                    'price' => !empty($v['price']) ? (float) $v['price'] : null,
                    'stock_quantity' => isset($v['stock_quantity']) ? (int) $v['stock_quantity'] : 10,
                ]);
            }
        }

        return redirect()->back()->with('message', 'Produit créé avec succès !');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $store = $request->user()->store;
        if ($product->store_id !== $store->id) {
            abort(403);
        }

        // Convert empty string inputs to null for optional fields
        if ($request->input('promo_price') === '') {
            $request->merge(['promo_price' => null]);
        }
        if ($request->input('promo_start_at') === '') {
            $request->merge(['promo_start_at' => null]);
        }
        if ($request->input('promo_end_at') === '') {
            $request->merge(['promo_end_at' => null]);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_vendor' => ['sometimes', 'required', 'numeric', 'min:0'],
            'stock' => ['sometimes', 'required', 'integer', 'min:0'],
            'min_order_quantity' => ['nullable', 'integer', 'min:1'],
            'is_promo' => ['nullable', 'boolean'],
            'promo_price' => ['nullable', 'numeric', 'min:0'],
            'promo_start_at' => ['nullable', 'date'],
            'promo_end_at' => ['nullable', 'date'],
            'is_active' => ['sometimes', 'nullable', 'boolean'],
            'image_file' => ['nullable', 'image', 'max:5120'],
            'images_files' => ['nullable', 'array'],
            'images_files.*' => ['nullable', 'image', 'max:5120'],
            'variants' => ['nullable', 'array'],
        ]);

        $userPlan = $request->user()->plan ?? 'starter';
        if ($request->boolean('is_promo') && $userPlan === 'starter') {
            return redirect()->back()->withErrors([
                'title' => "La mise en promotion des produits est réservée aux abonnements PRO, GROWTH et BUSINESS. Passez au plan Pro pour activer les promotions.",
            ]);
        }

        $imagePaths = $product->images ?? [];

        if ($request->hasFile('images_files')) {
            $uploaded = [];
            foreach ($request->file('images_files') as $file) {
                if ($file && count($uploaded) < 5) {
                    $path = $file->store('products', 'public');
                    $uploaded[] = '/storage/' . $path;
                }
            }
            if (count($uploaded) > 0) {
                $imagePaths = $uploaded;
            }
        } elseif ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('products', 'public');
            $imagePaths = ['/storage/' . $path];
        }

        $updateData = [];

        if ($request->has('is_promo')) {
            $updateData['is_promo'] = $request->boolean('is_promo');
        }

        if (array_key_exists('promo_price', $validated)) {
            $updateData['promo_price'] = $validated['promo_price'];
        }
        if (array_key_exists('promo_start_at', $validated)) {
            $updateData['promo_start_at'] = $validated['promo_start_at'];
        }
        if (array_key_exists('promo_end_at', $validated)) {
            $updateData['promo_end_at'] = $validated['promo_end_at'];
        }
        if (array_key_exists('min_order_quantity', $validated)) {
            $updateData['min_order_quantity'] = $validated['min_order_quantity'];
        }

        if (array_key_exists('title', $validated)) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('description', $validated)) {
            $updateData['description'] = $validated['description'];
        }
        if (array_key_exists('price_vendor', $validated)) {
            $updateData['price_vendor'] = $validated['price_vendor'];
        }
        if (array_key_exists('stock', $validated)) {
            $updateData['stock'] = $validated['stock'];
        }
        if (array_key_exists('is_active', $validated)) {
            $updateData['is_active'] = (bool) $validated['is_active'];
        }

        if (!empty($imagePaths)) {
            $updateData['image_url'] = $imagePaths[0];
            $updateData['images'] = $imagePaths;
        }

        $product->update($updateData);

        // Sync Variants
        if ($request->has('variants')) {
            $existingIds = [];
            $variantsData = $request->input('variants', []);
            if (is_array($variantsData)) {
                foreach ($variantsData as $v) {
                    if (empty($v['name']) && empty($v['size']) && empty($v['color'])) {
                        continue;
                    }
                    if (!empty($v['id'])) {
                        $variant = $product->variants()->find($v['id']);
                        if ($variant) {
                            $variant->update([
                                'name' => $v['name'] ?? null,
                                'size' => $v['size'] ?? null,
                                'color' => $v['color'] ?? null,
                                'price' => !empty($v['price']) ? (float) $v['price'] : null,
                                'stock_quantity' => isset($v['stock_quantity']) ? (int) $v['stock_quantity'] : 10,
                            ]);
                            $existingIds[] = $variant->id;
                        }
                    } else {
                        $newVar = $product->variants()->create([
                            'name' => $v['name'] ?? null,
                            'size' => $v['size'] ?? null,
                            'color' => $v['color'] ?? null,
                            'price' => !empty($v['price']) ? (float) $v['price'] : null,
                            'stock_quantity' => isset($v['stock_quantity']) ? (int) $v['stock_quantity'] : 10,
                        ]);
                        $existingIds[] = $newVar->id;
                    }
                }
            }
            $product->variants()->whereNotIn('id', $existingIds)->delete();
        }

        return redirect()->back()->with('message', 'Produit mis à jour avec succès !');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $store = $request->user()->store;
        if ($product->store_id !== $store->id) {
            abort(403);
        }

        $product->delete();
        return redirect()->back()->with('message', 'Produit supprimé !');
    }
}
