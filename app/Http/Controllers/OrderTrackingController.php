<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackingController extends Controller
{
    public function show(string $tracking_code): Response
    {
        $order = Order::where('tracking_code', $tracking_code)
            ->with(['store', 'items.product', 'items.variant'])
            ->firstOrFail();

        return Inertia::render('OrderTracking/Show', [
            'order' => $order,
            'store' => $order->store,
        ]);
    }
}
