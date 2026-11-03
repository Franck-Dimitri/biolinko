<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Payments\Countries;
use App\Services\WhatsappGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Paramètres : état réel de la configuration (paiements, WhatsApp, système), en lecture.
 * Les valeurs se règlent dans .env et config/payments.php, jamais depuis le navigateur.
 */
class AdminSettingController extends Controller
{
    public function index(): Response
    {
        $cloud = config('services.whatsapp_cloud');

        return Inertia::render('Admin/Settings/Index', [
            'payments' => [
                'driver' => config('payments.driver'),
                'payout_driver' => config('payments.payout_driver'),
                'pawapay_env' => config('payments.pawapay.env'),
                'pawapay_configured' => filled(config('payments.pawapay.token')),
                'mercypay_configured' => filled(config('payments.mercypay.key')),
                'mercypay_live' => str_starts_with((string) config('payments.mercypay.key'), 'mp_live_'),
                'mercypay_webhook_secret' => filled(config('payments.mercypay.webhook_secret')),
                'hrskills_configured' => filled(config('services.hrskills_pay.public_key')) && filled(config('services.hrskills_pay.secret_key')),
                'hrskills_webhook_secret' => filled(config('services.hrskills_pay.webhook_secret')),
                'subscription_simulation' => config('services.hrskills_pay.subscription_mode') === 'simulation' && ! app()->environment('production'),
                'client_fee_percent' => config('payments.client_fee_percent'),
                'withdrawal_fee_percent' => config('payments.withdrawal_fee_percent'),
                'min_withdrawal' => config('payments.min_withdrawal'),
                'commission_percent' => config('payments.commission_percent'),
                'countries' => collect(config('payments.countries'))->map(fn ($c, $code) => [
                    'code' => $code, 'name' => $c['name'], 'currency' => $c['currency'], 'enabled' => $c['enabled'],
                    'operators' => array_map([Countries::class, 'operatorLabel'], array_keys($c['operators'])),
                ])->values(),
            ],
            'whatsapp' => [
                'driver' => config('services.whatsapp_driver'),
                'configured' => filled($cloud['token'] ?? null) && filled($cloud['phone_number_id'] ?? null),
                'phone_number_id' => $cloud['phone_number_id'] ?? null,
                'app_secret' => filled($cloud['app_secret'] ?? null),
                'verify_token' => filled($cloud['verify_token'] ?? null),
                'webhook_url' => url('/api/webhooks/whatsapp-cloud'),
            ],
            'system' => [
                'env' => app()->environment(),
                'debug' => (bool) config('app.debug'),
                'url' => config('app.url'),
                'mailer' => config('mail.default'),
                'mail_from' => config('mail.from.address'),
                'queue' => config('queue.default'),
                'schedule' => [
                    ['orders:expire-unpaid', 'Toutes les heures', 'Annule les commandes non payées après 24 h'],
                    ['orders:remind-unpaid', 'Toutes les 15 min', 'Relance WhatsApp des paniers (Growth et plus)'],
                    ['funds:release', 'Toutes les 15 min', 'Rend l’argent des ventes retirable après le délai'],
                    ['payments:sync', 'Toutes les 5 min', 'Vérifie les paiements et virements en attente'],
                ],
            ],
        ]);
    }

    /** Statut des modèles WhatsApp chez Meta (mis en cache 10 minutes). */
    public function whatsappTemplates(): JsonResponse
    {
        $waba = config('services.whatsapp_cloud.business_account_id');
        $token = config('services.whatsapp_cloud.token');
        if (! $waba || ! $token) {
            return response()->json(['templates' => [], 'error' => 'API WhatsApp non configurée.']);
        }

        $templates = Cache::get('admin_wa_templates');
        if ($templates === null) {
            $res = Http::withToken($token)->timeout(10)
                ->get('https://graph.facebook.com/'.config('services.whatsapp_cloud.version').'/'.$waba.'/message_templates', ['fields' => 'name,status,category,language', 'limit' => 200]);
            if ($res->failed()) {
                return response()->json(['templates' => [], 'error' => 'Meta refuse la requête : '.($res->json('error.message') ?? 'HTTP '.$res->status())]);
            }
            $templates = collect($res->json('data', []))->filter(fn ($t) => str_starts_with($t['name'], 'biolinko_'))->values()->all();
            Cache::put('admin_wa_templates', $templates, 600);
        }

        return response()->json(['templates' => $templates]);
    }

    /** Message de test : modèle hello_world de Meta (accepté même sans conversation ouverte). */
    public function testWhatsappMessage(Request $request, WhatsappGatewayService $gateway): JsonResponse
    {
        $request->validate(['phone' => ['required', 'string', 'max:30']]);
        $phone = $gateway->formatPhone($request->input('phone'));

        $cloud = $gateway->cloud();

        return response()->json($cloud
            ? $cloud->sendTemplate($phone, 'hello_world', [], null, 'en_US')
            : ['success' => false, 'error' => 'Notifications WhatsApp automatiques en veille.']);
    }
}
