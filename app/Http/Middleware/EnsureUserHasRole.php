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
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $userRole = !empty($user->role) ? $user->role : 'seller';

        // Normalize 'vendor' to 'seller'
        if ($userRole === 'vendor') {
            $userRole = 'seller';
        }

        // Allow Admin users to access both admin and seller routes
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Check if user has required role
        if (in_array($userRole, $roles, true)) {
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
