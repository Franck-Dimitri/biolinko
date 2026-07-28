<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasPlan
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $plan = 'starter'): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Super-Admins bypass plan restrictions
        if ($user->isAdmin()) {
            return $next($request);
        }

        if (!$user->hasPlan($plan)) {
            $planLabels = [
                'starter' => 'Starter',
                'pro' => 'Pro (15 000 FCFA/mois)',
                'growth' => 'Growth (35 000 FCFA/mois)',
                'business' => 'Business (75 000 FCFA/mois)',
            ];

            $requiredLabel = $planLabels[$plan] ?? ucfirst($plan);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return redirect()->route('seller.subscriptions.index')->with('warning', "Accès réservé au plan {$requiredLabel}. Veuillez mettre à jour votre abonnement.");
            }

            return redirect()->route('seller.subscriptions.index')->with('warning', "Accès réservé au plan {$requiredLabel}. Veuillez mettre à jour votre abonnement.");
        }

        return $next($request);
    }
}
