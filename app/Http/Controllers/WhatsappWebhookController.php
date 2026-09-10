<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\WhatsappGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsappWebhookController extends Controller
{
    /**
     * Handle incoming webhook notifications from Evolution API.
     */
    public function handle(Request $request, WhatsappGatewayService $gateway): JsonResponse
    {
        $payload = $request->all();
        $event = $payload['event'] ?? '';

        // We only listen for incoming customer messages (upsert)
        if (!in_array(strtolower($event), ['messages.upsert', 'messages_upsert'])) {
            return response()->json(['status' => 'ignored', 'reason' => 'Event not handled']);
        }

        $data = $payload['data'] ?? [];
        $key = $data['key'] ?? [];
        $fromMe = $key['fromMe'] ?? false;
        $remoteJid = $key['remoteJid'] ?? '';

        // Ignore messages sent by the bot itself or group messages / status broadcast
        if ($fromMe || empty($remoteJid) || str_ends_with($remoteJid, '@g.us') || str_contains($remoteJid, 'status@broadcast')) {
            return response()->json(['status' => 'ignored', 'reason' => 'Self or group message']);
        }

        $senderRaw = explode('@', $remoteJid)[0];
        $senderPhone = preg_replace('/[^0-9]/', '', $senderRaw);
        $pushName = $data['pushName'] ?? 'Client';

        $text = $data['message']['conversation'] 
            ?? $data['message']['extendedTextMessage']['text'] 
            ?? '';

        Log::info('WhatsApp Webhook Inbound Message Received', [
            'from' => $senderPhone,
            'pushName' => $pushName,
            'text' => substr($text, 0, 80),
        ]);

        // Anti-Ban Shield: Responding to incoming inquiries creates an active 2-way conversation
        // which drastically elevates the WhatsApp account trust rating.
        $this->respondToCustomer($senderPhone, $pushName, $gateway);

        return response()->json(['status' => 'processed']);
    }

    /**
     * Send automated contextual acknowledgment to customer reply.
     */
    protected function respondToCustomer(string $phone, string $pushName, WhatsappGatewayService $gateway): void
    {
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
                . "_[Notification officielle Biolinko — biolinko.mrdims.dev]_";
        } else {
            $reply = "👋 Bonjour *{$pushName}* !\n\n"
                . "Merci d'avoir contacté le service officiel de notifications *Biolinko*.\n\n"
                . "Nous avons bien reçu votre message. Pour suivre une commande en cours ou créer votre boutique en ligne avec encaissement Mobile Money, rendez-vous sur :\n"
                . "👉 https://biolinko.mrdims.dev\n\n"
                . "Pour contacter le support officiel : support@biolinko.app\n"
                . "Belle journée ! ✨";
        }

        try {
            $gateway->sendMessage($phone, $reply);
        } catch (\Exception $e) {
            Log::warning('WhatsApp Webhook auto-reply failed', ['error' => $e->getMessage()]);
        }
    }
}
