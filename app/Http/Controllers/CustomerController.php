<?php

namespace App\Http\Controllers;

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

        $totalRevenueFromCustomers = $customers->sum(function ($c) {
            return (float) $c->pivot->total_spent;
        });

        $averageOrderValue = $totalCustomers > 0 ? ($totalRevenueFromCustomers / max(1, $customers->sum('pivot.total_orders_count'))) : 0;

        return Inertia::render('Customers/Index', [
            'store' => $store,
            'customers' => $customers,
            'metrics' => [
                'totalCustomers' => $totalCustomers,
                'repeatCustomersCount' => $repeatCustomersCount,
                'totalRevenueFromCustomers' => (float) $totalRevenueFromCustomers,
                'averageOrderValue' => (float) $averageOrderValue,
            ],
        ]);
    }
}
