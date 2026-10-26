<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Coupe la session d'un vendeur banni pendant qu'il est connecté.
 */
class LogoutBannedUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->is_banned) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors(['email' => 'Ce compte a été suspendu. Contactez le support Biolinko.']);
        }

        return $next($request);
    }
}
