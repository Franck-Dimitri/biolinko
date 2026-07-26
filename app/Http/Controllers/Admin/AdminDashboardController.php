<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $totalVendors = User::where('role', 'seller')->orWhereNull('role')->count();
        $totalStores = Store::count();
        $totalProducts = Product::count();
        $totalOrders = Order::count();
        
        $totalGmv = (float) Order::where('status', 'paid')->sum('total_client');
        $totalSaasRevenue = (float) Order::where('status', 'paid')->sum('saas_margin');
        $pendingWithdrawalsCount = Withdrawal::where('status', 'pending')->count();

        $recentStores = Store::with('user')->latest()->take(5)->get();
        $pendingWithdrawals = Withdrawal::with('wallet.store')->where('status', 'pending')->latest()->take(5)->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'totalVendors' => $totalVendors,
                'totalStores' => $totalStores,
                'totalProducts' => $totalProducts,
                'totalOrders' => $totalOrders,
                'totalGmv' => $totalGmv,
                'totalSaasRevenue' => $totalSaasRevenue,
                'pendingWithdrawalsCount' => $pendingWithdrawalsCount,
            ],
            'recentStores' => $recentStores,
            'pendingWithdrawals' => $pendingWithdrawals,
        ]);
    }
}
