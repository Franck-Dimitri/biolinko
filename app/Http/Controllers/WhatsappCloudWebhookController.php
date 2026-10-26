<?php

namespace App\Http\Controllers;

use App\Services\WhatsappGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Webhook de l'API WhatsApp officielle (Meta).
 * GET : vérification de l'URL de rappel dans l'Espace App. POST : messages entrants et statuts d'envoi.
 */
class WhatsappCloudWebhookController extends Controller
{
    public function verify(Request $request)
    {
        $token = config('services.whatsapp_cloud.verify_token');

        if ($token && $request->query('hub_mode') === 'subscribe' && hash_equals($token, (string) $request->query('hub_verify_token'))) {
            return response((string) $request->query('hub_challenge'), 200)->header('Content-Type', 'text/plain');
        }

        return response('Forbidden', 403);
    }

    public function handle(Request $request, WhatsappGatewayService $gateway)
    {
        $secret = config('services.whatsapp_cloud.app_secret');
        $signature = (string) $request->header('X-Hub-Signature-256');

        if (! $secret || ! hash_equals('sha256='.hash_hmac('sha256', $request->getContent(), $secret), $signature)) {
            Log::warning('WhatsApp Cloud webhook: signature invalide');

            return response()->json(['error' => 'INVALID_SIGNATURE'], 401);
        }

        foreach ($request->input('entry', []) as $entry) {
            foreach ($entry['changes'] ?? [] as $change) {
                $value = $change['value'] ?? [];

                // Statuts : un message refusé par Meta (modèle non approuvé, numéro invalide…) est journalisé
                foreach ($value['statuses'] ?? [] as $status) {
                    if (($status['status'] ?? '') === 'failed') {
                        Log::warning('WhatsApp Cloud: message non délivré', [
                            'to' => $status['recipient_id'] ?? null,
                            'error' => $status['errors'][0]['title'] ?? null,
                        ]);
                    }
                }

                // Message d'un client : la fenêtre de 24 h s'ouvre, on peut lui répondre en texte libre
                foreach ($value['messages'] ?? [] as $message) {
                    $from = preg_replace('/\D/', '', (string) ($message['from'] ?? ''));
                    if (! $from) {
                        continue;
                    }
                    $name = collect($value['contacts'] ?? [])->firstWhere('wa_id', $message['from'])['profile']['name'] ?? 'Client';

                    try {
                        app(WhatsappWebhookController::class)->respondToCustomer($from, $name, $gateway);
                    } catch (\Throwable $e) {
                        Log::warning('WhatsApp Cloud auto-reply failed', ['error' => $e->getMessage()]);
                    }
                }
            }
        }

        // Meta renvoie le webhook tant qu'il ne reçoit pas 200
        return response()->json(['status' => 'ok']);
    }
}
