<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->route('login');
        }

        $userRole = ! empty($user->role) ? $user->role : 'seller';

        // Normalize 'vendor' to 'seller'
        if ($userRole === 'vendor') {
            $userRole = 'seller';
        }

        // Chaque rôle reste dans son espace : un admin n'utilise pas les pages vendeur
        // (sinon une boutique lui serait créée et il éditerait une vitrine qui n'est pas la sienne)
        if ($user->isAdmin()) {
            return in_array('admin', $roles, true)
                ? $next($request)
                : redirect()->route('admin.dashboard')->with('error', 'Cette page est réservée aux vendeurs.');
        }

        // Check if user has required role
        if (in_array($userRole, $roles, true)) {
            // Un vendeur a toujours une boutique (créée en brouillon si elle manque)
            if ($userRole === 'seller') {
                $user->ensureStore();
            }

            return $next($request);
        }

        // Access denied: Determine target redirect route
        $targetRoute = ($userRole === 'admin') ? 'admin.dashboard' : 'seller.dashboard';

        // Prevent infinite redirect loop if request is already on target route
        if ($request->routeIs($targetRoute) || $request->routeIs('dashboard')) {
            abort(403, 'Accès non autorisé pour votre rôle.');
        }

        return redirect()->route($targetRoute)->with('error', 'Accès non autorisé pour votre rôle.');
    }
}
