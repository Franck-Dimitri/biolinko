<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderReport;
use App\Models\Subscription;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $paid = fn () => Order::where('payment_status', 'paid');
        $since = now()->subDays(30);

        // Revenus Biolinko : frais client + commissions + frais de retrait + abonnements payés
        $revenue = fn ($from = null) => [
            'client_fees' => (float) $paid()->when($from, fn ($q) => $q->where('paid_at', '>=', $from))->sum('saas_margin'),
            'commissions' => (float) $paid()->when($from, fn ($q) => $q->where('paid_at', '>=', $from))->sum('commission_amount'),
            'withdrawal_fees' => (float) Withdrawal::where('status', 'completed')->when($from, fn ($q) => $q->where('processed_at', '>=', $from))->sum('fee'),
            'subscriptions' => (float) Subscription::where('payment_status', 'paid')->where(fn ($q) => $q->whereNull('payment_provider')->orWhereNotIn('payment_provider', ['simulation', 'admin']))
                ->when($from, fn ($q) => $q->where('updated_at', '>=', $from))->sum('amount'),
        ];

        // Ventes des 30 derniers jours, jour par jour
        $daily = $paid()->where('paid_at', '>=', $since)->get(['paid_at', 'total_client'])
            ->groupBy(fn ($o) => $o->paid_at->toDateString())->map->sum('total_client');
        $chart = collect(range(29, 0))->map(fn ($i) => [
            'date' => now()->subDays($i)->toDateString(),
            'total' => (float) ($daily[now()->subDays($i)->toDateString()] ?? 0),
        ]);

        $underReview = Store::has('reports', '>=', OrderReport::REVIEW_THRESHOLD)->withCount('reports')->get(['id', 'name', 'slug']);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'sellers' => User::where('role', 'seller')->orWhereNull('role')->count(),
                'new_sellers' => User::where(fn ($q) => $q->where('role', 'seller')->orWhereNull('role'))->where('created_at', '>=', $since)->count(),
                'stores_published' => Store::where('is_published', true)->count(),
                'stores' => Store::count(),
                'products' => Product::count(),
                'orders_paid' => $paid()->count(),
                'gmv' => (float) $paid()->sum('total_client'),
                'gmv_30' => (float) $paid()->where('paid_at', '>=', $since)->sum('total_client'),
                'orders_30' => $paid()->where('paid_at', '>=', $since)->count(),
            ],
            'revenue' => $revenue(),
            'revenue30' => $revenue($since),
            'chart' => $chart,
            'planCounts' => [
                'starter' => User::where(fn ($q) => $q->where('role', 'seller')->orWhereNull('role'))->where(fn ($q) => $q->where('plan', 'starter')->orWhereNull('plan'))->count(),
                'pro' => User::where('plan', 'pro')->count(),
                'growth' => User::where('plan', 'growth')->count(),
                'business' => User::where('plan', 'business')->count(),
            ],
            'todo' => [
                'withdrawals' => Withdrawal::where('status', 'pending')->count(),
                'withdrawals_amount' => (float) Withdrawal::where('status', 'pending')->sum('amount'),
                'reports' => OrderReport::whereIn('status', ['open', 'answered'])->count(),
                'under_review' => $underReview,
                'unpublished' => Store::where('is_published', false)->count(),
            ],
            'recentStores' => Store::with('user:id,name,email,plan')->latest()->take(6)->get(['id', 'user_id', 'name', 'slug', 'is_published', 'created_at', 'logo_url']),
            'pendingWithdrawals' => Withdrawal::with('wallet.store:id,name,slug')->where('status', 'pending')->latest()->take(6)->get(),
        ]);
    }
}
