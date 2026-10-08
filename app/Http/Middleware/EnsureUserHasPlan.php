<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasPlan
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $plan = 'starter'): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        // Super-Admins bypass plan restrictions
        if ($user->isAdmin()) {
            return $next($request);
        }

        if (! $user->hasPlan($plan)) {
            $price = User::planPrice($plan);
            $requiredLabel = ucfirst($plan).($price > 0 ? ' ('.number_format($price, 0, ',', ' ').' FCFA/mois)' : '');

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return redirect()->route('seller.subscriptions.index')->with('warning', "Accès réservé au plan {$requiredLabel}. Veuillez mettre à jour votre abonnement.");
            }

            return redirect()->route('seller.subscriptions.index')->with('warning', "Accès réservé au plan {$requiredLabel}. Veuillez mettre à jour votre abonnement.");
        }

        return $next($request);
    }
}
