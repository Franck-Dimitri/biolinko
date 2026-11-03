<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status', 'all');
        $search = trim($request->query('search', ''));

        $query = Order::with(['store', 'items']);

        match ($statusFilter) {
            'paid' => $query->where('payment_status', 'paid'),
            'pending' => $query->where('payment_status', 'pending'),
            'failed' => $query->where(fn ($q) => $q->where('payment_status', 'failed')->orWhere('status', 'cancelled')),
            default => null,
        };

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('tracking_code', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('payment_reference', 'like', "%{$search}%")
                  ->orWhereHas('store', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->latest()->paginate(15)->withQueryString();

        $metrics = [
            'total_orders' => Order::count(),
            'paid_orders' => Order::where('payment_status', 'paid')->count(),
            'pending_orders' => Order::where('payment_status', 'pending')->count(),
            'cancelled_orders' => Order::where(fn ($q) => $q->where('payment_status', 'failed')->orWhere('status', 'cancelled'))->count(),
            'total_gmv' => (float) Order::where('payment_status', 'paid')->sum('total_client'),
            'total_saas_revenue' => (float) Order::where('payment_status', 'paid')->sum('saas_margin') + (float) Order::where('payment_status', 'paid')->sum('commission_amount'),
        ];

        return Inertia::render('Admin/Transactions/Index', [
            'orders' => $orders,
            'metrics' => $metrics,
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
            ],
        ]);
    }
}
