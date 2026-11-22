<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\Whatsapp\WhatsappGatewayService;
use App\Support\StoreUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Sur le domaine d'une boutique, l'adresse a été réécrite avant le routage (/ → /<nom>) :
     * le navigateur doit garder l'adresse d'origine.
     */
    public function urlResolver()
    {
        return function (Request $request) {
            if ($original = $request->attributes->get('store_original_uri')) {
                return $original;
            }
            $url = Str::start(Str::after($request->fullUrl(), $request->getSchemeAndHttpHost()), '/');
            $raw = Str::before($request->getRequestUri(), '?');
            if (Str::endsWith($raw, '/') && $raw !== '/') {
                $q = Str::after($url, '?');

                return Str::finish(Str::before($url, '?'), '/').(str_contains($url, '?') ? '?'.$q : '');
            }

            return $url;
        };
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'appUrl' => $request->getSchemeAndHttpHost() ?: config('app.url'),
            'planPrices' => User::PLAN_PRICES,
            'planLimits' => User::PLAN_LIMITS,
            'whatsappAutomatic' => WhatsappGatewayService::automatic(),
            // Frais et commissions (config/payments.php) affichés sur la landing, la caisse et le tableau de bord
            // Contact et réseaux sociaux publics (config/biolinko.php)
            'site' => [
                // Boutiques sur <nom>.<domaine> en production ; vide en local (APP_URL/<nom>)
                'store_domain' => StoreUrl::domain(),
                'app_url' => rtrim((string) config('app.url'), '/'),
                'contact' => config('biolinko.contact'),
                'socials' => array_filter(config('biolinko.socials', [])),
            ],
            'payments' => [
                'client_fee_percent' => config('payments.client_fee_percent'),
                // Paiements simulés (local) : la page de paiement l'indique clairement
                'test_mode' => config('payments.driver') === 'test',
                'withdrawal_fee_percent' => config('payments.withdrawal_fee_percent'),
                'commission_percent' => config('payments.commission_percent'),
                'min_withdrawal' => config('payments.min_withdrawal'),
                // Paiement sur la page hébergée de l'agrégateur (choix de l'opérateur fait sur cette page)
                'hosted_checkout' => config('payments.driver') === 'mercypay' && config('payments.mercypay.checkout') === 'hosted',
                'min_order' => collect(config('payments.countries'))->map(fn ($c) => $c['min_order'] ?? config('payments.min_order')),
                // Moyens de paiement proposés à la caisse, par pays (clés de config/payments.php)
                'operators' => collect(config('payments.countries'))->map(fn ($c) => array_keys($c['operators'] ?? [])),
            ],
            // Messages de confirmation (->with('message', …)) affichés en notification dans le tableau de bord
            'flash' => fn () => [
                'message' => $request->session()->get('message'),
                'success' => $request->session()->get('success'),
                'warning' => $request->session()->get('warning'),
                'error' => $request->session()->get('error'),
                'pilot_sent' => $request->session()->get('pilot_sent'),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
