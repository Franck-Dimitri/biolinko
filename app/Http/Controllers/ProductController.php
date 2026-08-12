<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store;

        if (!$store) {
            $store = $user->store()->create([
                'name' => 'Boutique de ' . $user->name,
                'slug' => Str::slug($user->name . '-' . rand(100, 999)),
                'is_published' => false,
            ]);
        }

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

        if (!$store) {
            $store = $user->store()->create([
                'name' => 'Boutique de ' . $user->name,
                'slug' => Str::slug($user->name . '-' . rand(100, 999)),
                'is_published' => false,
            ]);
        }

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

        $requestedStock = (int) $request->input('stock', 0);
        if ($userPlan === 'starter') {
            if ($requestedStock > 10) {
                return redirect()->back()->withErrors([
                    'stock' => "Sur le plan Starter (Gratuit), la quantité en stock d'un produit ne peut pas dépasser 10 unités. Passez au plan Pro pour un stock illimité.",
                ]);
            }

            $currentStoreTotalStock = (int) $store->products()->sum('stock');
            if (($currentStoreTotalStock + $requestedStock) > 10) {
                $remainingStock = max(0, 10 - $currentStoreTotalStock);
                return redirect()->back()->withErrors([
                    'stock' => "Quota de stock atteint ! Sur le plan Starter (Gratuit), le stock cumulé total de votre boutique ne peut pas dépasser 10 unités. (Quantité restante disponible : {$remainingStock} unité(s)). Réduisez le stock d'autres produits ou passez au plan Pro.",
                ]);
            }
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

        if (empty($imagePaths)) {
            $imagePaths[] = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';
        }

        $slug = Str::slug($validated['title']) . '-' . Str::random(4);

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
            'images' => $imagePaths,
            'main_image' => $imagePaths[0] ?? null,
        ]);

        // Process Variants if provided
        if (!empty($validated['variants']) && is_array($validated['variants'])) {
            foreach ($validated['variants'] as $varData) {
                if (!empty($varData['name'])) {
                    $product->variants()->create([
                        'name' => $varData['name'],
                        'price' => !empty($varData['price']) ? (float) $varData['price'] : null,
                        'stock' => isset($varData['stock']) ? (int) $varData['stock'] : 0,
                    ]);
                }
            }
        }

        return redirect()->back()->with('message', 'Produit ajouté avec succès au catalogue !');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $store = $request->user()->store;
        if (!$store || $product->store_id !== $store->id) {
            abort(403, 'Action non autorisée.');
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

        if (array_key_exists('stock', $validated) && $userPlan === 'starter') {
            $newStock = (int) $validated['stock'];
            if ($newStock > 10) {
                return redirect()->back()->withErrors([
                    'stock' => "Sur le plan Starter (Gratuit), le stock d'un produit ne peut pas dépasser 10 unités. Passez au plan Pro pour un stock illimité.",
                ]);
            }

            $otherProductsStock = (int) $store->products()->where('id', '!=', $product->id)->sum('stock');
            if (($otherProductsStock + $newStock) > 10) {
                $remainingStock = max(0, 10 - $otherProductsStock);
                return redirect()->back()->withErrors([
                    'stock' => "Quota de stock atteint ! Sur le plan Starter (Gratuit), le stock cumulé total de votre boutique ne peut pas dépasser 10 unités. (Quantité max disponible pour ce produit : {$remainingStock} unité(s)). Réduisez le stock d'autres produits ou passez au plan Pro.",
                ]);
            }
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
            $updateData['images'] = $imagePaths;
            $updateData['main_image'] = $imagePaths[0] ?? null;
        }

        $product->update($updateData);

        // Update variants if provided
        if (array_key_exists('variants', $validated)) {
            $product->variants()->delete();
            if (is_array($validated['variants'])) {
                foreach ($validated['variants'] as $varData) {
                    if (!empty($varData['name'])) {
                        $product->variants()->create([
                            'name' => $varData['name'],
                            'price' => !empty($varData['price']) ? (float) $varData['price'] : null,
                            'stock' => isset($varData['stock']) ? (int) $varData['stock'] : 0,
                        ]);
                    }
                }
            }
        }

        return redirect()->back()->with('message', 'Produit mis à jour avec succès !');
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $store = $request->user()->store;
        if (!$store || $product->store_id !== $store->id) {
            abort(403, 'Action non autorisée.');
        }

        $product->delete();

        return redirect()->back()->with('message', 'Produit supprimé du catalogue avec succès.');
    }
}
