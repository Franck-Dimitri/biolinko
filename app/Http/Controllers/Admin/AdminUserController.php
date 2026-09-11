<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ModerationNotificationMail;
use App\Models\User;
use App\Services\WhatsappGatewayService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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

    public function toggleBan(Request $request, User $user, WhatsappGatewayService $whatsapp): RedirectResponse
    {
        if ($user->isAdmin()) {
            return redirect()->back()->withErrors(['user' => 'Impossible de bannir un compte administrateur.']);
        }

        $isCurrentlyBanned = $user->is_banned;
        $reason = $request->input('reason');

        if (!$isCurrentlyBanned) {
            // Banning user: require or default a clear reason
            $reason = $reason ?: 'Non-respect répété des conditions générales d\'utilisation et règles commerciales de la plateforme.';
            
            $user->update(['is_banned' => true]);

            // Suspend their store as well
            if ($user->store) {
                $user->store->update(['is_published' => false]);
            }

            // Send Email Notification
            if ($user->email) {
                try {
                    Mail::to($user->email)->send(new ModerationNotificationMail(
                        $user,
                        'account_banned',
                        $user->name,
                        $reason
                    ));
                } catch (\Exception $e) {
                    Log::warning('Failed to send account ban email', ['err' => $e->getMessage()]);
                }
            }

            // Send WhatsApp Notification
            try {
                $whatsapp->notifyModerationAction($user, 'account_banned', $user->name, $reason);
            } catch (\Exception $e) {
                Log::warning('Failed to send account ban WhatsApp', ['err' => $e->getMessage()]);
            }

            return redirect()->back()->with('message', "Le vendeur {$user->name} a été banni et notifié par email et WhatsApp.");
        } else {
            // Unbanning user
            $user->update(['is_banned' => false]);

            $unbanReason = $reason ?: 'Compte réexaminé et réactivé après mise en conformité.';

            // Send Email Notification
            if ($user->email) {
                try {
                    Mail::to($user->email)->send(new ModerationNotificationMail(
                        $user,
                        'account_unbanned',
                        $user->name,
                        $unbanReason
                    ));
                } catch (\Exception $e) {
                    Log::warning('Failed to send account unban email', ['err' => $e->getMessage()]);
                }
            }

            // Send WhatsApp Notification
            try {
                $whatsapp->notifyModerationAction($user, 'account_unbanned', $user->name, $unbanReason);
            } catch (\Exception $e) {
                Log::warning('Failed to send account unban WhatsApp', ['err' => $e->getMessage()]);
            }

            return redirect()->back()->with('message', "Le vendeur {$user->name} a été réactivé avec succès.");
        }
    }

    public function toggleStore(Request $request, User $user, WhatsappGatewayService $whatsapp): RedirectResponse
    {
        if (!$user->store) {
            return redirect()->back()->withErrors(['store' => 'Aucune boutique associée à ce vendeur.']);
        }

        $store = $user->store;
        $willBePublished = !$store->is_published;
        $reason = $request->input('reason');

        $store->update([
            'is_published' => $willBePublished,
        ]);

        if (!$willBePublished && $reason) {
            // Suspended with reason -> notify
            if ($user->email) {
                try {
                    Mail::to($user->email)->send(new ModerationNotificationMail(
                        $user,
                        'store_suspended',
                        $store->name,
                        $reason
                    ));
                } catch (\Exception $e) {
                    Log::warning('Failed to send store suspension email', ['err' => $e->getMessage()]);
                }
            }

            try {
                $whatsapp->notifyModerationAction($user, 'store_suspended', $store->name, $reason);
            } catch (\Exception $e) {
                Log::warning('Failed to send store suspension WhatsApp', ['err' => $e->getMessage()]);
            }
        }

        $status = $willBePublished ? 'publiée en ligne' : 'passée en mode brouillon';
        return redirect()->back()->with('message', "La vitrine {$store->name} a été {$status} avec succès.");
    }
}
