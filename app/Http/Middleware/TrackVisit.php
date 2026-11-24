<?php

namespace App\Http\Middleware;

use App\Models\Order;
use App\Models\PageVisit;
use App\Models\Store;
use App\Support\TemplateStats;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

use function Illuminate\Support\defer;

/**
 * Compte les pages publiques vues (boutiques, paiement, suivi, site Biolinko), après la réponse :
 * le visiteur n'attend jamais. Robots, vendeur sur sa propre boutique et admins ne sont pas comptés.
 */
class TrackVisit
{
    /** Nom de route → type de page. */
    private const PAGES = [
        'storefront.show' => 'home', 'storefront.product.show' => 'product',
        'order.payment' => 'checkout', 'order.track' => 'track',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Décidé sur la requête routée (celle des boutiques est réécrite), écrit après l'envoi de la réponse
        try {
            if ($visit = $this->visit($request, $response)) {
                defer(fn () => PageVisit::create($visit));
            }
        } catch (\Throwable $e) {
            report($e); // une mesure ne doit jamais casser une page
        }

        return $response;
    }

    private function visit(Request $request, Response $response): ?array
    {
        if (! $request->isMethod('GET') || $response->getStatusCode() !== 200 || $request->header('X-Inertia-Partial-Data')) {
            return null;
        }
        $name = (string) $request->route()?->getName();
        $page = self::PAGES[$name] ?? ($name === 'welcome' || str_starts_with($name, 'site.') ? 'site' : null);
        if (! $page || TemplateStats::isBot($request->userAgent()) || $request->has('apercu') || $request->cookie('biolinko_consent') === 'refused') {
            return null;
        }

        $storeId = null;
        if (in_array($page, ['home', 'product'], true)) {
            $storeId = Store::where('slug', $request->route('store_slug'))->value('id');
        } elseif (in_array($page, ['checkout', 'track'], true)) {
            $storeId = Order::where('tracking_code', $request->route('tracking_code'))->value('store_id');
        }
        if ($page !== 'site' && ! $storeId) {
            return null;
        }

        // Le vendeur qui regarde sa boutique et les admins ne gonflent pas les chiffres
        $user = $request->user();
        if ($user && ($user->isAdmin() || ($storeId && $user->store?->id === $storeId))) {
            return null;
        }

        $day = now()->toDateString();

        return [
            'store_id' => $storeId,
            'day' => $day,
            'page' => $page,
            'path' => mb_substr('/'.ltrim($request->path(), '/'), 0, 190),
            'country' => static::country($request),
            'device' => static::device((string) $request->userAgent()),
            'source' => static::source($request),
            'visitor' => substr(hash('sha256', $request->ip().'|'.$request->userAgent().'|'.$day.'|'.config('app.key')), 0, 16),
        ];
    }

    /** Pays : en-tête de Cloudflare en production, sinon la région de la langue du navigateur (fr-CM → CM). */
    public static function country(Request $request): ?string
    {
        $code = strtoupper((string) ($request->header('CF-IPCountry') ?: $request->header('X-Country-Code')));
        if (preg_match('/^[A-Z]{2}$/', $code) && ! in_array($code, ['XX', 'T1'], true)) {
            return $code;
        }
        if (preg_match('/^[a-z]{2,3}-([A-Z]{2})\b/', (string) $request->header('Accept-Language'), $m)) {
            return $m[1];
        }

        return null;
    }

    public static function device(string $ua): string
    {
        if (preg_match('/iPad|Tablet|Nexus (7|9|10)|SM-T/i', $ua)) {
            return 'tablet';
        }

        return preg_match('/Mobile|Android|iPhone|iPod|Opera Mini|IEMobile/i', $ua) ? 'mobile' : 'desktop';
    }

    /** Source : paramètre utm_source, sinon le site d'où vient le visiteur. */
    public static function source(Request $request): string
    {
        $hint = strtolower((string) ($request->query('utm_source') ?: parse_url((string) $request->header('referer'), PHP_URL_HOST)));
        $own = parse_url((string) config('app.url'), PHP_URL_HOST);
        foreach (['whatsapp' => 'whatsapp|wa\.me', 'facebook' => 'facebook|fb\.|m\.me', 'instagram' => 'instagram', 'tiktok' => 'tiktok', 'google' => 'google'] as $source => $pattern) {
            if (preg_match('/'.$pattern.'/', $hint)) {
                return $source;
            }
        }
        if ($hint === '' || $hint === $own || str_contains($hint, 'biolinko')) {
            return 'direct';
        }

        return 'other';
    }
}
