<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminStoreController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim($request->query('search', ''));
        $planFilter = $request->query('plan', 'all');

        $query = Store::with(['user', 'wallet'])
            ->withCount(['products', 'orders']);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($planFilter !== 'all') {
            $query->where('plan_type', $planFilter);
        }

        $stores = $query->latest()->paginate(15)->withQueryString();

        $metrics = [
            'total' => Store::count(),
            'published' => Store::where('is_published', true)->count(),
            'starter' => Store::where('plan_type', 'starter')->count(),
            'pro' => Store::where('plan_type', 'pro')->count(),
            'growth' => Store::where('plan_type', 'growth')->count(),
            'business' => Store::where('plan_type', 'business')->count(),
        ];

        return Inertia::render('Admin/Stores/Index', [
            'stores' => $stores,
            'metrics' => $metrics,
            'filters' => [
                'search' => $search,
                'plan' => $planFilter,
            ],
        ]);
    }

    public function toggleStatus(Request $request, Store $store): RedirectResponse
    {
        $store->update([
            'is_published' => !$store->is_published,
        ]);

        $statusText = $store->is_published ? 'publiée' : 'masquée';
        return redirect()->back()->with('message', "La boutique {$store->name} est désormais {$statusText}.");
    }

    public function updatePlan(Request $request, Store $store): RedirectResponse
    {
        $validated = $request->validate([
            'plan_type' => ['required', 'string', 'in:starter,pro,growth,business'],
        ]);

        $store->update([
            'plan_type' => $validated['plan_type'],
        ]);

        if ($store->user) {
            $store->user->update([
                'plan' => $validated['plan_type'],
            ]);
        }

        return redirect()->back()->with('message', "Plan de la boutique {$store->name} mis à jour vers " . strtoupper($validated['plan_type']) . " !");
    }
}
