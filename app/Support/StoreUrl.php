<?php

namespace App\Support;

use App\Models\Order;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Adresses publiques des boutiques.
 * Avec BIOLINKO_STORE_DOMAIN (production) : https://<nom>.biolinko.store/…, l'acheteur ne quitte jamais ce domaine.
 * Sans (développement local) : APP_URL/<nom>/…, comme avant.
 */
class StoreUrl
{
    /** Pages servies telles quelles sur le domaine d'une boutique (parcours d'achat de l'acheteur). */
    public const BUYER_PATHS = ['track/', 'checkout', 'pay/', 'sitemap.xml', 'robots.txt', 'llms.txt', 'indexnow-', 'build/', 'storage/', 'images/', 'favicon', 'up'];

    public static function domain(): ?string
    {
        $domain = strtolower(trim((string) config('biolinko.store_domain'), ". \t"));

        return $domain !== '' ? $domain : null;
    }

    /** Domaine affiché aux vendeurs (<nom>.biolinko.store), même en local où les liens restent APP_URL/<nom>. */
    public static function displayDomain(): string
    {
        return static::domain() ?? 'biolinko.store';
    }

    public static function enabled(): bool
    {
        return static::domain() !== null;
    }

    private static function scheme(): string
    {
        return parse_url((string) config('app.url'), PHP_URL_SCHEME) ?: 'https';
    }

    private static function slugOf(Store|string $store): string
    {
        return $store instanceof Store ? $store->slug : $store;
    }

    /** Adresse d'une page de la boutique : $path = '', '/p/<produit>', '?tab=cart'… */
    public static function home(Store|string $store, string $path = ''): string
    {
        $slug = static::slugOf($store);
        if ($path !== '' && ! str_starts_with($path, '/')) {
            $path = '/'.$path;
        }

        if (static::enabled()) {
            return static::scheme().'://'.$slug.'.'.static::domain().($path === '' ? '/' : $path);
        }

        return rtrim((string) config('app.url'), '/').'/'.$slug.$path;
    }

    public static function product(Store|string $store, string $productSlug): string
    {
        return static::home($store, '/p/'.$productSlug);
    }

    /** Page de suivi de commande, sur le domaine de la boutique. */
    public static function track(Order $order): string
    {
        $store = $order->relationLoaded('store') ? $order->store : $order->store()->first(['id', 'slug']);
        if (! static::enabled() || ! $store) {
            return route('order.track', $order->tracking_code);
        }

        return static::home($store, '/track/'.$order->tracking_code);
    }

    /** Page de paiement d'une commande (sur le domaine de la boutique). */
    public static function payment(Order $order): string
    {
        $store = $order->relationLoaded('store') ? $order->store : $order->store()->first(['id', 'slug']);
        if (! static::enabled() || ! $store) {
            return route('order.payment', $order->tracking_code);
        }

        return static::home($store, '/track/'.$order->tracking_code.'/paiement');
    }

    /** Adresse affichée (sans https://) : awa.biolinko.store ou biolinko.app/awa. */
    public static function display(Store|string $store): string
    {
        $slug = static::slugOf($store);

        return static::enabled() ? $slug.'.'.static::domain() : preg_replace('#^https?://#', '', rtrim((string) config('app.url'), '/')).'/'.$slug;
    }

    /** Nom de la boutique d'après l'hôte de la requête (null si ce n'est pas un domaine de boutique). */
    public static function slugFromHost(Request $request): ?string
    {
        $domain = static::domain();
        $host = strtolower($request->getHost());
        if (! $domain || ! str_ends_with($host, '.'.$domain)) {
            return null;
        }
        $label = substr($host, 0, -strlen('.'.$domain));

        return preg_match('/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/', $label) && $label !== 'www' ? $label : null;
    }

    /** Le domaine nu (biolinko.store ou www.biolinko.store) : redirigé vers le site. */
    public static function isApexHost(Request $request): bool
    {
        $domain = static::domain();
        $host = strtolower($request->getHost());

        return $domain && ($host === $domain || $host === 'www.'.$domain);
    }

    /** Ancienne adresse APP_URL/<nom> sur le site : redirection permanente vers le domaine de la boutique. */
    public static function redirectFromApp(Request $request, Store $store, string $path = ''): ?RedirectResponse
    {
        if (! static::enabled() || $request->attributes->get('store_host') || $request->has('apercu') || ! $request->isMethod('GET')) {
            return null;
        }
        $query = $request->getQueryString();

        return redirect()->away(static::home($store, $path).($query ? '?'.$query : ''), 301);
    }
}
