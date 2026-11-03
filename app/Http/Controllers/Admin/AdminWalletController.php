<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Subscription;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Revenus Biolinko : uniquement l'argent réellement encaissé (pas d'estimation à partir des plans),
 * moins une estimation des frais de l'agrégateur.
 */
class AdminWalletController extends Controller
{
    public function index(Request $request): Response
    {
        $cost = config('payments.gateway_cost_percent');

        $period = function (?Carbon $from, ?Carbon $to) use ($cost) {
            $orders = Order::where('payment_status', 'paid')
                ->when($from, fn ($q) => $q->where('paid_at', '>=', $from))->when($to, fn ($q) => $q->where('paid_at', '<', $to));
            $withdrawals = Withdrawal::where('status', 'completed')
                ->when($from, fn ($q) => $q->where('processed_at', '>=', $from))->when($to, fn ($q) => $q->where('processed_at', '<', $to));
            $subs = Subscription::where('payment_status', 'paid')->where(fn ($q) => $q->whereNull('payment_provider')->orWhereNotIn('payment_provider', ['simulation', 'admin']))
                ->when($from, fn ($q) => $q->where('updated_at', '>=', $from))->when($to, fn ($q) => $q->where('updated_at', '<', $to));

            $collected = (float) (clone $orders)->sum('total_client') + (float) (clone $subs)->sum('amount');
            $paidOut = (float) (clone $withdrawals)->sum('net_amount');

            $r = [
                'commissions' => (float) (clone $orders)->sum('commission_amount'),
                'client_fees' => (float) (clone $orders)->sum('saas_margin'),
                'withdrawal_fees' => (float) (clone $withdrawals)->sum('fee'),
                'subscriptions' => (float) (clone $subs)->sum('amount'),
                'gateway_cost' => round($collected * $cost['collection'] / 100 + $paidOut * $cost['payout'] / 100),
                'gmv' => (float) (clone $orders)->sum('total_client'),
                'orders' => (clone $orders)->count(),
            ];
            $r['gross'] = $r['commissions'] + $r['client_fees'] + $r['withdrawal_fees'] + $r['subscriptions'];
            $r['net'] = $r['gross'] - $r['gateway_cost'];

            return $r;
        };

        $months = collect(range(5, 0))->map(function ($i) use ($period) {
            $start = now()->startOfMonth()->subMonths($i);

            return ['label' => ucfirst($start->locale('fr')->translatedFormat('M Y')), 'key' => $start->format('Y-m')] + $period($start, $start->copy()->addMonth());
        });

        return Inertia::render('Admin/Wallet/Index', [
            'total' => $period(null, null),
            'thisMonth' => $period(now()->startOfMonth(), null),
            'months' => $months,
            'gatewayCost' => $cost,
            'latestSales' => Order::with('store:id,name')->where('payment_status', 'paid')->latest('paid_at')->take(10)
                ->get(['id', 'store_id', 'tracking_code', 'total_client', 'saas_margin', 'commission_amount', 'commission_rate', 'paid_at']),
            'latestSubscriptions' => Subscription::with('user:id,name')->where('payment_status', 'paid')->where(fn ($q) => $q->whereNull('payment_provider')->orWhereNotIn('payment_provider', ['simulation', 'admin']))
                ->latest()->take(10)->get(['id', 'user_id', 'plan', 'billing_cycle', 'amount', 'updated_at']),
        ]);
    }
}
