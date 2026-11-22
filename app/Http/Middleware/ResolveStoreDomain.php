<?php

namespace App\Http\Middleware;

use App\Support\StoreUrl;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Boutiques sur leur propre domaine : <nom>.biolinko.store.
 * Avant le routage, l'adresse est réécrite vers les routes existantes (/ → /<nom>, /p/x → /<nom>/p/x).
 * Seul le parcours d'achat est servi sur ce domaine ; le reste (connexion, tableau de bord…) renvoie vers le site.
 * Le domaine des boutiques n'a ainsi jamais accès aux sessions des vendeurs.
 */
class ResolveStoreDomain
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! StoreUrl::enabled()) {
            return $next($request);
        }

        $app = rtrim((string) config('app.url'), '/');

        if (StoreUrl::isApexHost($request)) {
            return redirect()->away($app.'/', 301);
        }

        $slug = StoreUrl::slugFromHost($request);
        if (! $slug) {
            return $next($request);
        }

        $path = '/'.ltrim($request->path(), '/');
        $path = $path === '//' ? '/' : $path;
        $relative = ltrim($path, '/');

        if ($path === '/' || str_starts_with($path, '/p/') || in_array($path, ['/reviews', '/signaler'], true)) {
            $target = '/'.$slug.($path === '/' ? '' : $path);
        } elseif ($path === '/'.$slug || str_starts_with($path, '/'.$slug.'/') || str_starts_with($path, '/store/'.$slug.'/')) {
            $target = $path; // adresses générées par route() : déjà au format /<nom>/…
        } elseif (collect(StoreUrl::BUYER_PATHS)->contains(fn ($p) => str_starts_with($relative, $p))) {
            $target = $path;
        } else {
            // Connexion, tableau de bord, pages du site… : servis uniquement sur le domaine principal
            $query = $request->getQueryString();

            return redirect()->away($app.$path.($query ? '?'.$query : ''));
        }

        $original = $request->getRequestUri();
        if ($target !== $path) {
            $query = $request->getQueryString();
            $request = $request->duplicate(server: array_merge($request->server->all(), [
                'REQUEST_URI' => $target.($query ? '?'.$query : ''),
            ]));
        }
        $request->attributes->set('store_host', $slug);
        $request->attributes->set('store_original_uri', $original);

        return $next($request);
    }
}
