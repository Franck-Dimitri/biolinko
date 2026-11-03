<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $planFilter = $request->query('plan', 'all'); // all | paid | starter | pro | growth | business | expiring | expired
        $search = trim($request->query('search', ''));
        $sellers = fn () => User::where(fn ($q) => $q->where('role', 'seller')->orWhereNull('role'));

        $query = $sellers()->with('store:id,user_id,name,slug');
        match ($planFilter) {
            'paid' => $query->whereIn('plan', ['pro', 'growth', 'business'])->where('subscription_expires_at', '>', now()),
            'expiring' => $query->whereIn('plan', ['pro', 'growth', 'business'])->whereBetween('subscription_expires_at', [now(), now()->addDays(7)]),
            'expired' => $query->whereIn('plan', ['pro', 'growth', 'business'])->where(fn ($q) => $q->whereNull('subscription_expires_at')->orWhere('subscription_expires_at', '<=', now())),
            'starter' => $query->where(fn ($q) => $q->where('plan', 'starter')->orWhereNull('plan')),
            'all' => null,
            default => $query->where('plan', $planFilter),
        };

        if ($search !== '') {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")
                ->orWhereHas('store', fn ($sq) => $sq->where('name', 'like', "%{$search}%")));
        }

        $active = fn ($plan) => $sellers()->where('plan', $plan)->where('subscription_expires_at', '>', now())->count();
        $counts = ['pro' => $active('pro'), 'growth' => $active('growth'), 'business' => $active('business')];

        return Inertia::render('Admin/Subscriptions/Index', [
            'vendors' => $query->orderByRaw('subscription_expires_at is null')->orderBy('subscription_expires_at')->paginate(20)->withQueryString(),
            'metrics' => [
                'sellers' => $sellers()->count(),
                'active_paid' => array_sum($counts),
                'counts' => $counts,
                'expiring' => $sellers()->whereIn('plan', ['pro', 'growth', 'business'])->whereBetween('subscription_expires_at', [now(), now()->addDays(7)])->count(),
                // Revenu mensuel si chaque abonnement actif était renouvelé au mois
                'mrr' => collect($counts)->map(fn ($n, $plan) => $n * User::planPrice($plan))->sum(),
            ],
            'filters' => ['plan' => $planFilter, 'search' => $search],
        ]);
    }


    public function updatePlan(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:starter,pro,growth,business'],
            'months' => ['nullable', 'integer', 'in:1,3,6,12'],
        ]);

        $user->grantPlan($validated['plan'], (int) ($validated['months'] ?? 1));

        return redirect()->back()->with('message', "Abonnement de {$user->name} mis à jour : ".ucfirst($validated['plan']).'.');
    }
}
