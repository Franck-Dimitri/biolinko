<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\SmartLink;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $store = $request->user()->store;

        if (!$store) {
            abort(404, 'Boutique introuvable pour cet utilisateur.');
        }

        // Get all customers linked to this store via store_customer pivot
        $customers = $store->customers()
            ->latest('store_customer.last_order_at')
            ->get();

        $totalCustomers = $customers->count();
        $repeatCustomersCount = $customers->filter(function ($c) {
            return $c->pivot->total_orders_count >= 2;
        })->count();

        // 3rd Card: Total Amount of Completed/Delivered Sales
        $completedSalesRevenue = (float) Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'delivered', 'completed'])
            ->sum('price_vendor');

        // Total Revenue across all customer pivots for Average Order Value
        $totalRevenueFromCustomers = $customers->sum(function ($c) {
            return (float) $c->pivot->total_spent;
        });
        $totalOrdersSum = max(1, $customers->sum('pivot.total_orders_count'));
        $averageOrderValue = $totalCustomers > 0 ? ($totalRevenueFromCustomers / $totalOrdersSum) : 0;

        // Top 5 Loyal Customers
        $top5Customers = $customers->sortByDesc(fn($c) => (float) $c->pivot->total_spent)
            ->take(5)
            ->values();

        // Abandoned Carts / Pending Orders
        $abandonedOrders = Order::with('items')
            ->where('store_id', $store->id)
            ->whereIn('status', ['pending'])
            ->latest()
            ->take(20)
            ->get();

        // Products & SmartLinks for WhatsApp Broadcast Attachment
        $products = Product::where('store_id', $store->id)
            ->get(['id', 'title', 'price_vendor', 'image_url']);

        $smartLinks = SmartLink::where('store_id', $store->id)
            ->where('is_active', true)
            ->get(['id', 'title', 'code', 'total_amount']);

        return Inertia::render('Customers/Index', [
            'store' => $store,
            'customers' => $customers,
            'top5Customers' => $top5Customers,
            'abandonedOrders' => $abandonedOrders,
            'products' => $products,
            'smartLinks' => $smartLinks,
            'metrics' => [
                'totalCustomers' => $totalCustomers,
                'repeatCustomersCount' => $repeatCustomersCount,
                'completedSalesRevenue' => $completedSalesRevenue,
                'averageOrderValue' => (float) $averageOrderValue,
            ],
        ]);
    }
}
