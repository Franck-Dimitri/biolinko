<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store;

        $products = Product::where('store_id', $store->id)
            ->latest()
            ->get()
            ->map(function ($product) {
                $pv = (float) $product->price_vendor;
                $product->price_display = ceil($pv * 1.02);
                return $product;
            });

        $productsCount = $products->count();
        $ordersCount = $store->orders()->count();
        $totalRevenue = $store->orders()->where('status', 'paid')->sum('price_vendor');
        $recentOrders = $store->orders()->with('items')->latest()->take(5)->get();

        $wallet = $store->wallet;

        // Completion score
        $checklist = [
            'store_created' => true,
            'whatsapp_added' => !empty($store->phone_whatsapp),
            'logo_added' => !empty($store->logo_url),
            'first_product' => $productsCount > 0,
        ];

        $completedCount = count(array_filter($checklist));
        $completionPercentage = round(($completedCount / count($checklist)) * 100);

        return Inertia::render('Dashboard', [
            'store' => $store,
            'wallet' => $wallet,
            'products' => $products,
            'productsCount' => $productsCount,
            'ordersCount' => $ordersCount,
            'totalRevenue' => $totalRevenue,
            'recentOrders' => $recentOrders,
            'setupChecklist' => $checklist,
            'completionPercentage' => $completionPercentage,
            'appUrl' => config('app.url', 'http://localhost:8000'),
        ]);
    }
}
