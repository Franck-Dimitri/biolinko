<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        $planFilter = $request->query('plan', 'all');
        $search = trim($request->query('search', ''));

        $query = User::with('store');

        if ($planFilter !== 'all') {
            $query->where('plan', $planFilter);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('store', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $vendors = $query->latest()->paginate(15)->withQueryString();

        $metrics = [
            'total_vendors' => User::where('role', 'seller')->orWhereNull('role')->count(),
            'starter_count' => User::where('plan', 'starter')->orWhereNull('plan')->count(),
            'pro_count' => User::where('plan', 'pro')->count(),
            'growth_count' => User::where('plan', 'growth')->count(),
            'business_count' => User::where('plan', 'business')->count(),
            'estimated_monthly_mrr' => (User::where('plan', 'pro')->count() * 2500) + 
                                       (User::where('plan', 'growth')->count() * 7000) + 
                                       (User::where('plan', 'business')->count() * 12000),
        ];

        return Inertia::render('Admin/Subscriptions/Index', [
            'vendors' => $vendors,
            'metrics' => $metrics,
            'filters' => [
                'plan' => $planFilter,
                'search' => $search,
            ],
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

        return redirect()->back()->with('message', "Abonnement de {$user->name} mis à jour vers " . strtoupper($validated['plan']) . " avec succès !");
    }
}
