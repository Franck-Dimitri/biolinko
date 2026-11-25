<?php

namespace App\Http\Middleware;

use App\Support\ManagedAccount;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Pendant que l'équipe configure la boutique d'un vendeur : actions sensibles refusées (argent, identité,
 * mot de passe…), et fin du mode configuration dès que le vendeur a pris la main sur son compte.
 */
class GuardManagedSession
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->hasSession() || ! $request->session()->has(ManagedAccount::SESSION_KEY)) {
            return $next($request);
        }

        // Relu en base : le vendeur a pu prendre la main entre-temps
        $user = $request->user()?->fresh();
        if (! $user || ! $user->isManaged()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('error', 'Le vendeur a pris la main sur son compte : la configuration est terminée.');
        }

        if (! $request->isMethod('GET') && in_array($request->route()?->getName(), ManagedAccount::VENDOR_ONLY, true)) {
            return back()->with('error', 'Action réservée au vendeur : il la fera lui-même après avoir pris la main sur son compte.');
        }

        return $next($request);
    }
}
