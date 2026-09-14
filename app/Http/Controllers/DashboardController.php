<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SmartLink;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
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
        $totalRevenue = (float) $store->orders()->where('status', 'paid')->sum('price_vendor');
        $recentOrders = $store->orders()->with('items')->latest()->take(5)->get();

        $wallet = $store->wallet;

        // Daily Sales Chart Data (Last 14 Days) - Optimized to 1 grouped query
        $startDate = Carbon::now()->subDays(13)->startOfDay();
        $salesAggregates = $store->orders()
            ->where('status', 'paid')
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as order_date, SUM(price_vendor) as total_revenue, COUNT(*) as total_orders')
            ->groupBy('order_date')
            ->get()
            ->keyBy(function ($item) {
                return Carbon::parse($item->order_date)->format('Y-m-d');
            });

        $dailySales = [];
        for ($i = 13; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dateStr = $date->format('Y-m-d');
            $label = $date->format('d M');
            $entry = $salesAggregates->get($dateStr);

            $dailySales[] = [
                'date' => $label,
                'revenue' => $entry ? (float) $entry->total_revenue : 0.0,
                'orders' => $entry ? (int) $entry->total_orders : 0,
            ];
        }

        // Top 5 Selling Products
        $topProducts = OrderItem::select('product_title', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(total_price_vendor) as total_revenue'))
            ->whereHas('order', function ($q) use ($store) {
                $q->where('store_id', $store->id)->where('status', 'paid');
            })
            ->groupBy('product_title')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        // SmartLinks Analytics & Conversion
        $smartLinks = SmartLink::where('store_id', $store->id)->get();
        $totalViews = $smartLinks->sum('views_count');
        $totalSmartSales = $smartLinks->sum('sales_count');
        $conversionRate = $totalViews > 0 ? round(($totalSmartSales / $totalViews) * 100, 1) : 0;

        // Pending Orders Followups Count
        $pendingFollowupsCount = $store->orders()->where('status', 'pending')->count();

        // Onboarding Completion Score (4 key activation steps)
        $checklist = [
            'store_created' => true,
            'appearance_configured' => !empty($store->logo_url) || !empty($store->banner_url) || (bool) $store->is_configured,
            'first_product' => $productsCount > 0,
            'is_published' => (bool) $store->is_published,
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
            'analytics' => [
                'dailySales' => $dailySales,
                'topProducts' => $topProducts,
                'totalViews' => $totalViews,
                'totalSmartSales' => $totalSmartSales,
                'conversionRate' => $conversionRate,
                'pendingFollowupsCount' => $pendingFollowupsCount,
            ],
            'appUrl' => $request->getSchemeAndHttpHost() ?: config('app.url', 'http://localhost:8000'),
        ]);
    }
}
