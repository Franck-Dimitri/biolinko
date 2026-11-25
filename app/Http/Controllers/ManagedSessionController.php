<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\ManagedAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/** Fin de la configuration d'une boutique gérée : retour au compte admin. */
class ManagedSessionController extends Controller
{
    public function stop(Request $request): RedirectResponse
    {
        $adminId = $request->session()->pull(ManagedAccount::SESSION_KEY);
        $seller = $request->user();
        $admin = $adminId ? User::find($adminId) : null;

        if (! $admin || ! $admin->isAdmin()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();

            return redirect()->route('login');
        }

        Auth::login($admin);
        $request->session()->regenerate();

        return redirect()->route('admin.users.show', $seller)->with('success', 'Configuration enregistrée. Envoyez au vendeur son lien d’accès quand la boutique est prête.');
    }
}
