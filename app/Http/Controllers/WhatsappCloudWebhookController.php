<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\WhatsappGatewayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
                        $this->respondToCustomer($from, $name, $gateway);
                    } catch (\Throwable $e) {
                        Log::warning('WhatsApp Cloud auto-reply failed', ['error' => $e->getMessage()]);
                    }
                }
            }
        }

        // Meta renvoie le webhook tant qu'il ne reçoit pas 200
        return response()->json(['status' => 'ok']);
    }

    private function respondToCustomer(string $phone, string $pushName, WhatsappGatewayService $gateway): void
    {
        // Une seule réponse automatique par numéro et par jour : pas de ping-pong avec un client qui écrit plusieurs fois
        if (! Cache::add('wa_autoreply_'.$phone, true, now()->addDay())) {
            return;
        }

        // Extract the last 8 digits of the phone number to reliably match database formats
        $shortPhone = substr($phone, -8);

        $order = Order::with('store.user')
            ->where('customer_phone', 'LIKE', "%{$shortPhone}%")
            ->latest()
            ->first();

        if ($order && $order->store) {
            $store = $order->store;
            $vendorPhone = $store->phone_whatsapp ?: ($store->user->phone ?? null);
            $trackingUrl = route('order.track', $order->tracking_code);

            $reply = "👋 Bonjour *{$pushName}* !\n\n"
                . "Merci pour votre message. Je suis le bot d'assistance automatique de *Biolinko*.\n\n"
                . "📦 Concernant votre commande *#{$order->tracking_code}* chez *{$store->name}* :\n"
                . "👉 *Suivre votre livraison en direct :*\n{$trackingUrl}\n\n";

            if ($vendorPhone) {
                $reply .= "💬 Pour échanger directement avec votre vendeur *{$store->name}*, vous pouvez le joindre ici : {$vendorPhone}\n\n";
            }

            $reply .= "L'équipe Biolinko reste à votre entière disposition ! ✨\n"
                . "_Biolinko — ".preg_replace('#^https?://#', '', config('app.url'))."_";
        } else {
            $reply = "👋 Bonjour *{$pushName}* !\n\n"
                . "Merci d'avoir contacté le service officiel de notifications *Biolinko*.\n\n"
                . "Nous avons bien reçu votre message. Pour suivre une commande en cours ou créer votre boutique en ligne avec encaissement Mobile Money, rendez-vous sur :\n"
                . "👉 ".config('app.url')."\n\n"
                . "Pour contacter le support officiel : support@biolinko.link\n"
                . "Belle journée ! ✨";
        }

        $gateway->sendMessage($phone, $reply);
    }
}
