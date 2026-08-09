<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->query('search', ''));
        $promoFilter = $request->query('promo', 'all');

        $query = Product::with(['store.user', 'variants']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('store', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($promoFilter === 'promo') {
            $query->where('is_promo', true);
        } elseif ($promoFilter === 'regular') {
            $query->where('is_promo', false);
        }

        $products = $query->latest()->paginate(15)->withQueryString();

        $metrics = [
            'total_products' => Product::count(),
            'active_products' => Product::where('is_active', true)->count(),
            'promo_products' => Product::where('is_promo', true)->count(),
            'out_of_stock' => Product::where('stock', 0)->count(),
        ];

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'promo' => $promoFilter,
            ],
        ]);
    }

    public function toggleActive(Request $request, Product $product): RedirectResponse
    {
        $product->update([
            'is_active' => !$product->is_active,
        ]);

        $statusText = $product->is_active ? 'activé' : 'désactivé';
        return redirect()->back()->with('message', "Le produit {$product->title} a été {$statusText}.");
    }
}
