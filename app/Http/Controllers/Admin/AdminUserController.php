<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->query('search', ''));
        $roleFilter = $request->query('role', 'all');

        $query = User::with([
            'store' => function ($q) {
                $q->withCount(['products', 'orders'])->with('wallet');
            },
        ]);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_whatsapp', 'like', "%{$search}%");
            });
        }

        if ($roleFilter !== 'all') {
            $query->where('role', $roleFilter);
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        $metrics = [
            'total' => User::count(),
            'sellers' => User::where('role', 'seller')->orWhereNull('role')->count(),
            'admins' => User::where('role', 'admin')->count(),
            'banned' => User::where('is_banned', true)->count(),
            'pro_users' => User::whereIn('plan', ['pro', 'growth', 'business'])->count(),
        ];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
            ],
        ]);
    }

    /**
     * Display detailed profile, store, products, CA and activity for a specific user.
     */
    public function show(User $user): Response
    {
        $user->loadMissing([
            'store.wallet',
            'store.products' => function ($q) {
                $q->with('variants')->latest();
            },
            'store.orders' => function ($q) {
                $q->latest()->take(25);
            },
        ]);

        $store = $user->store;

        // Financial & Business Analytics
        $totalOrdersCount = $store ? $store->orders()->count() : 0;
        $paidOrders = $store ? $store->orders()->where('payment_status', 'paid')->get() : collect();
        $totalRevenue = (float) $paidOrders->sum('total_client');
        $vendorEarnings = (float) $paidOrders->sum('price_vendor');
        $productsCount = $store ? $store->products()->count() : 0;
        $activeProductsCount = $store ? $store->products()->where('is_active', true)->count() : 0;
        $walletAvailable = $store && $store->wallet ? (float) $store->wallet->balance_available : 0.0;
        $walletPending = $store && $store->wallet ? (float) $store->wallet->balance_pending : 0.0;

        // Breakdown of orders by status
        $ordersBreakdown = [
            'paid' => $store ? $store->orders()->where('payment_status', 'paid')->count() : 0,
            'pending' => $store ? $store->orders()->where('payment_status', 'pending')->count() : 0,
            'delivered' => $store ? $store->orders()->where('status', 'delivered')->count() : 0,
            'in_delivery' => $store ? $store->orders()->where('status', 'in_delivery')->count() : 0,
            'cancelled' => $store ? $store->orders()->where('status', 'cancelled')->count() : 0,
        ];

        $stats = [
            'total_revenue' => $totalRevenue,
            'vendor_earnings' => $vendorEarnings,
            'total_orders' => $totalOrdersCount,
            'orders_breakdown' => $ordersBreakdown,
            'products_count' => $productsCount,
            'active_products_count' => $activeProductsCount,
            'wallet_available' => $walletAvailable,
            'wallet_pending' => $walletPending,
        ];

        return Inertia::render('Admin/Users/Show', [
            'vendor' => $user,
            'stats' => $stats,
        ]);
    }

    public function updatePlan(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:starter,pro,growth,business'],
        ]);

        $user->update([
            'plan' => $validated['plan'],
        ]);

        if ($user->store) {
            $user->store->update([
                'plan_type' => $validated['plan'],
            ]);
        }

        return redirect()->back()->with('message', "Plan du vendeur {$user->name} mis à jour vers " . strtoupper($validated['plan']) . " !");
    }

    public function toggleBan(Request $request, User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            return redirect()->back()->withErrors(['user' => 'Impossible de bannir un compte administrateur.']);
        }

        $user->update([
            'is_banned' => !$user->is_banned,
        ]);

        $statusText = $user->is_banned ? 'banni' : 'réactivé';
        return redirect()->back()->with('message', "Le vendeur {$user->name} a été {$statusText} avec succès.");
    }

    public function toggleStore(Request $request, User $user): RedirectResponse
    {
        if (!$user->store) {
            return redirect()->back()->withErrors(['store' => 'Aucune boutique associée à ce vendeur.']);
        }

        $user->store->update([
            'is_published' => !$user->store->is_published,
        ]);

        $status = $user->store->is_published ? 'publiée en ligne' : 'passée en mode brouillon';
        return redirect()->back()->with('message', "La vitrine {$user->store->name} a été {$status} avec succès.");
    }
}
