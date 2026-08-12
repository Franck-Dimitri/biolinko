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
        $paidQuery = function ($q) {
            $q->where('payment_status', 'paid')
              ->orWhereIn('status', ['paid', 'delivered', 'completed']);
        };

        $statusFilter = $request->query('status', 'all');
        $search = trim($request->query('search', ''));

        $query = Order::with(['store', 'items']);

        if ($statusFilter !== 'all') {
            if ($statusFilter === 'paid') {
                $query->where($paidQuery);
            } else {
                $query->where('status', $statusFilter);
            }
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('tracking_code', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('hrskills_reference', 'like', "%{$search}%")
                  ->orWhereHas('store', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->latest()->paginate(15)->withQueryString();

        $metrics = [
            'total_orders' => Order::count(),
            'paid_orders' => Order::where($paidQuery)->count(),
            'pending_orders' => Order::where('status', 'pending')->where('payment_status', '!=', 'paid')->count(),
            'cancelled_orders' => Order::where('status', 'cancelled')->count(),
            'total_gmv' => (float) Order::where($paidQuery)->sum('total_client'),
            'total_saas_revenue' => (float) Order::where($paidQuery)->sum('saas_margin'),
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
