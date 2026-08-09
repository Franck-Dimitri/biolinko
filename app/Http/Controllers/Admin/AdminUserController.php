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

        $query = User::with('store');

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
}
