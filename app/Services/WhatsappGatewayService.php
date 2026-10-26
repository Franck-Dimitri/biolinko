<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Store;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappGatewayService
{
    protected bool $enabled;
    protected string $baseUrl;
    protected string $apiKey;
    protected string $defaultInstance;

    public function __construct()
    {
        $this->enabled = (bool) config('services.whatsapp_gateway.enabled', false);
        $this->baseUrl = rtrim((string) config('services.whatsapp_gateway.base_url'), '/');
        $this->apiKey = (string) config('services.whatsapp_gateway.api_key');
        $this->defaultInstance = config('services.whatsapp_gateway.default_instance', 'test_dims');
    }

    /** API officielle Meta si elle est choisie (WHATSAPP_DRIVER=cloud), sinon null → passerelle Evolution. */
    public function cloud(): ?WhatsappCloudService
    {
        return config('services.whatsapp_driver') === 'cloud' ? app(WhatsappCloudService::class) : null;
    }

    private function money($amount): string
    {
        return number_format((float) $amount, 0, ',', ' ');
    }

    /**
     * Format phone number strictly (removes spaces, adds 237 for Cameroon 9-digit numbers).
     */
    public function formatPhone(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($cleaned, '00')) {
            $cleaned = substr($cleaned, 2);
        }

        // If Cameroon 9-digit number starting with 6 (e.g. 676383986)
        if (strlen($cleaned) === 9 && str_starts_with($cleaned, '6')) {
            $cleaned = '237' . $cleaned;
        }

        return $cleaned;
    }

    /**
     * Generate polymorphic greeting variation (Anti-Ban unique SHA-256 fingerprint).
     */
    public function getPolymorphicGreeting(string $name): string
    {
        $cleanName = trim($name) ?: 'Client';
        $greetings = [
            "Bonjour *{$cleanName}* ! 👋",
            "Hello *{$cleanName}* ! ✨",
            "Salutations *{$cleanName}* ! 🛍️",
            "Ravi de vous retrouver, *{$cleanName}* ! ✨",
            "Bienvenue *{$cleanName}* ! 👋",
        ];

        return $greetings[array_rand($greetings)];
    }

    /**
     * Generate dynamic footer with timestamp and unique transaction token (Anti-Ban).
     */
    public function getPolymorphicFooter(Store $store, ?string $orderRef = null): string
    {
        $vendorPhone = $store->phone_whatsapp ?: ($store->user->phone ?? null);
        $dateStr = now()->format('d/m à H:i');
        $hash = substr(md5(($orderRef ?: 'ref') . microtime()), 0, 5);

        $footer = "—\n"
            . "📍 *Boutique :* {$store->name}\n";

        if ($vendorPhone) {
            $footer .= "📞 *Contact Vendeur :* {$vendorPhone}\n";
        }

        $footer .= "💬 _Répondez directement à ce message pour toute question._\n"
            . "🔒 _[Notification officielle Biolinko • {$dateStr} • #{$hash}]_";

        return $footer;
    }

    /**
     * Send raw text message via Evolution API v2 with Anti-Ban Human Presence Simulation.
     */
    public function sendMessage(string $phone, string $message, ?string $instanceName = null): array
    {
        $formattedPhone = $this->formatPhone($phone);
        $instance = $instanceName ?: $this->defaultInstance;

        if ($cloud = $this->cloud()) {
            return $cloud->sendText($formattedPhone, $message);
        }

        if (!$this->enabled) {
            Log::info('Passerelle WhatsApp désactivée pour protéger le numéro contre les suspensions Meta', [
                'phone' => $formattedPhone,
            ]);

            return [
                'success' => false,
                'disabled' => true,
                'message' => 'Passerelle WhatsApp en veille de sécurité pour protéger votre numéro contre les blocages Meta.',
            ];
        }

        try {
            $url = "{$this->baseUrl}/message/sendText/{$instance}";
            
            // Anti-Ban Simulation: delay + presence composing simulates real user typing
            // Deliberately between 2.5s and 4.8s to avoid heuristic bot detection
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(18)->post($url, [
                'number' => $formattedPhone,
                'text' => $message,
                'options' => [
                    'delay' => rand(2500, 4800),
                    'presence' => 'composing',
                    'linkPreview' => true,
                ],
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp Gateway sent message successfully', [
                    'phone' => $formattedPhone,
                    'instance' => $instance,
                ]);

                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::warning('WhatsApp Gateway send message rejected', [
                'phone' => $formattedPhone,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => 'Erreur Gateway HTTP ' . $response->status(),
                'details' => $response->json() ?? $response->body(),
            ];
        } catch (\Exception $e) {
            Log::error('WhatsApp Gateway Exception', [
                'phone' => $formattedPhone,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Retrieve status of a WhatsApp instance.
     */
    public function getInstanceStatus(?string $instanceName = null): array
    {
        $instance = $instanceName ?: $this->defaultInstance;
        try {
            $url = "{$this->baseUrl}/instance/connectionState/{$instance}";
            $response = Http::withHeaders(['apikey' => $this->apiKey])->timeout(8)->get($url);

            if ($response->successful()) {
                $json = $response->json();
                $state = $json['instance']['state'] ?? 'close';
                return [
                    'success' => true,
                    'instance' => $instance,
                    'state' => $state,
                ];
            }

            return ['success' => false, 'instance' => $instance, 'state' => 'close', 'error' => 'Statut inaccessible'];
        } catch (\Exception $e) {
            return ['success' => false, 'instance' => $instance, 'state' => 'close', 'error' => $e->getMessage()];
        }
    }

    /**
     * Connect or fetch active QR code or pairing code for instance.
     */
    public function connectInstance(?string $instanceName = null, ?string $phoneNumber = null): array
    {
        $instance = $instanceName ?: $this->defaultInstance;
        try {
            // 1. Check if instance exists first, if not create it
            $fetchUrl = "{$this->baseUrl}/instance/fetchInstances";
            $instancesRes = Http::withHeaders(['apikey' => $this->apiKey])->timeout(8)->get($fetchUrl);
            $exists = false;
            if ($instancesRes->successful()) {
                $all = $instancesRes->json();
                foreach ($all as $inst) {
                    if (($inst['name'] ?? '') === $instance) {
                        $exists = true;
                        break;
                    }
                }
            }

            if (!$exists) {
                Http::withHeaders([
                    'apikey' => $this->apiKey,
                    'Content-Type' => 'application/json',
                ])->timeout(10)->post("{$this->baseUrl}/instance/create", [
                    'instanceName' => $instance,
                    'qrcode' => true,
                    'integration' => 'WHATSAPP-BAILEYS',
                ]);
            }

            // 2. Fetch connect data (QR / state / pairingCode)
            $connectUrl = "{$this->baseUrl}/instance/connect/{$instance}";
            if (!empty($phoneNumber)) {
                $cleanPhone = $this->formatPhone($phoneNumber);
                $connectUrl .= "?number={$cleanPhone}";
            }

            $connectRes = Http::withHeaders(['apikey' => $this->apiKey])->timeout(10)->get($connectUrl);
            if ($connectRes->successful()) {
                $data = $connectRes->json();
                $state = $data['instance']['state'] ?? (!empty($data['base64']) ? 'connecting' : 'open');
                
                // Auto-configure the anti-ban webhook
                $this->configureWebhook($instance);

                return [
                    'success' => true,
                    'instance' => $instance,
                    'state' => $state,
                    'base64' => $data['base64'] ?? null,
                    'pairing_code' => $data['pairingCode'] ?? null,
                    'count' => $data['count'] ?? 1,
                ];
            }

            return ['success' => false, 'error' => 'Échec de connexion à la passerelle'];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Configure Evolution API webhook for 2-way conversation trust.
     */
    public function configureWebhook(?string $instanceName = null): bool
    {
        $instance = $instanceName ?: $this->defaultInstance;
        $webhookUrl = url('/api/webhooks/whatsapp');

        // On localhost, Evolution API cannot reach localhost directly unless public,
        // but on production VPS (biolinko.mrdims.dev) it connects directly.
        if (str_contains($webhookUrl, 'localhost') || str_contains($webhookUrl, '127.0.0.1')) {
            $webhookUrl = 'https://biolinko.mrdims.dev/api/webhooks/whatsapp';
        }

        try {
            $url = "{$this->baseUrl}/webhook/set/{$instance}";
            $res = Http::withHeaders([
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(8)->post($url, [
                'enabled' => true,
                'url' => $webhookUrl,
                'webhookByEvents' => false,
                'events' => [
                    'MESSAGES_UPSERT',
                ],
            ]);

            return $res->successful();
        } catch (\Exception $e) {
            Log::warning('Failed to configure WhatsApp Webhook in Evolution API', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Disconnect/Logout an instance.
     */
    public function disconnectInstance(?string $instanceName = null): array
    {
        $instance = $instanceName ?: $this->defaultInstance;
        try {
            $url = "{$this->baseUrl}/instance/logout/{$instance}";
            $res = Http::withHeaders(['apikey' => $this->apiKey])->timeout(10)->delete($url);
            return ['success' => $res->successful()];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send Order Placed notification (Polymorphic Anti-Ban Template).
     */
    public function notifyOrderPlaced(Order $order): void
    {
        $order->loadMissing(['store.user', 'items']);
        $store = $order->store;
        $trackingUrl = route('order.track', $order->tracking_code);
        $totalFormatted = number_format($order->total_client, 0, ',', ' ');

        // API officielle : le client seulement (le vendeur est prévenu au paiement, chaque message est facturé)
        if ($cloud = $this->cloud()) {
            if ($order->customer_phone) {
                $cloud->sendTemplate($this->formatPhone($order->customer_phone), 'biolinko_commande_enregistree',
                    [$order->customer_name, $order->tracking_code, $totalFormatted, $store->name], $order->tracking_code);
            }

            return;
        }

        // 1. Notification au Client (Polymorphe Anti-Ban)
        if ($order->customer_phone) {
            $greeting = $this->getPolymorphicGreeting($order->customer_name);
            $orderPhrases = [
                "Votre commande *#{$order->tracking_code}* d'un montant de *{$totalFormatted} FCFA* a bien été enregistrée.",
                "Nous confirmons la création de votre commande *#{$order->tracking_code}* (*{$totalFormatted} FCFA*) sur la boutique *{$store->name}*.",
                "Votre achat *#{$order->tracking_code}* d'un montant de *{$totalFormatted} FCFA* a été pris en compte avec succès.",
            ];
            $phrase = $orderPhrases[array_rand($orderPhrases)];

            $customerMsg = "🛍️ *Commande enregistrée chez {$store->name}*\n\n"
                . "{$greeting}\n\n"
                . "{$phrase}\n\n"
                . "📍 *Suivre votre commande en direct :*\n"
                . "{$trackingUrl}\n\n"
                . $this->getPolymorphicFooter($store, $order->tracking_code);

            $this->sendMessage($order->customer_phone, $customerMsg);
        }

        // 2. Notification au Vendeur
        $vendorPhone = $store->phone_whatsapp ?: ($store->user->phone ?? null);
        if ($vendorPhone) {
            $vendorMsg = "🔔 *Nouvelle commande reçue — {$store->name} !*\n\n"
                . "Réf : *#{$order->tracking_code}*\n"
                . "Client : *{$order->customer_name}* ({$order->customer_phone})\n"
                . "Total : *{$totalFormatted} FCFA*\n"
                . "Statut : " . strtoupper($order->status) . "\n\n"
                . "👉 Accédez à vos commandes : " . route('orders.index');

            $this->sendMessage($vendorPhone, $vendorMsg);
        }
    }

    /**
     * Send Order Payment Confirmed notification (Polymorphic Anti-Ban Template).
     */
    public function notifyOrderPaid(Order $order): void
    {
        $order->loadMissing(['store.user', 'items']);
        $store = $order->store;
        $trackingUrl = route('order.track', $order->tracking_code);
        $totalFormatted = number_format($order->total_client, 0, ',', ' ');
        $vendorGain = number_format($order->price_vendor, 0, ',', ' ');
        $vendorPhone = $store->phone_whatsapp ?: ($store->user->phone_whatsapp ?? null);

        if ($cloud = $this->cloud()) {
            if ($order->customer_phone) {
                $cloud->sendTemplate($this->formatPhone($order->customer_phone), 'biolinko_paiement_confirme',
                    [$order->customer_name, $totalFormatted, $order->tracking_code, $store->name], $order->tracking_code);
            }
            if ($vendorPhone) {
                $cloud->sendTemplate($this->formatPhone($vendorPhone), 'biolinko_vente_payee',
                    [$store->name, $order->tracking_code, $order->customer_name, $vendorGain]);
            }

            return;
        }

        // 1. Notification au Client (Reçu + Facture)
        if ($order->customer_phone) {
            $greeting = $this->getPolymorphicGreeting($order->customer_name);
            $paidPhrases = [
                "Votre paiement Mobile Money de *{$totalFormatted} FCFA* pour la commande *#{$order->tracking_code}* a été validé avec succès !",
                "Règlement confirmé : votre paiement de *{$totalFormatted} FCFA* pour la commande *#{$order->tracking_code}* a bien été reçu.",
                "Paiement validé ! Votre commande *#{$order->tracking_code}* d'un montant de *{$totalFormatted} FCFA* entre en préparation pour livraison.",
            ];
            $phrase = $paidPhrases[array_rand($paidPhrases)];

            $customerMsg = "✅ *Paiement Validé — {$store->name}*\n\n"
                . "{$greeting}\n\n"
                . "{$phrase}\n\n"
                . "📦 Vos articles sont désormais en cours de préparation.\n\n"
                . "📍 *Suivi de livraison en direct :*\n"
                . "{$trackingUrl}\n\n"
                . $this->getPolymorphicFooter($store, $order->tracking_code);

            $this->sendMessage($order->customer_phone, $customerMsg);
        }

        // 2. Alerte Gain au Vendeur
        if ($vendorPhone) {
            $vendorMsg = "🎉 *VENTE CONFIRMÉE & ENCAISSÉE — {$store->name} !*\n\n"
                . "La commande *#{$order->tracking_code}* de *{$order->customer_name}* ({$order->customer_phone}) est PAYÉE.\n\n"
                . "💰 *+{$vendorGain} FCFA* ont été crédités sur votre portefeuille vendeur disponible.\n"
                . "📍 Destination : {$order->city} - {$order->address_details}\n\n"
                . "👉 Préparez le colis : " . route('orders.index');

            $this->sendMessage($vendorPhone, $vendorMsg);
        }
    }

    /**
     * Send Order Shipping / Delivery Status Update to Customer.
     */
    public function notifyOrderShippingUpdate(Order $order, string $status, ?string $customNote = null): void
    {
        if (!$order->customer_phone) {
            return;
        }

        $order->loadMissing('store');
        $store = $order->store;
        $trackingUrl = route('order.track', $order->tracking_code);
        $greeting = $this->getPolymorphicGreeting($order->customer_name);

        $statusLabels = [
            'in_delivery' => '🚚 En cours de livraison / Expédiée',
            'delivered' => '🎉 Colis livré avec succès',
            'cancelled' => '❌ Commande annulée',
        ];

        $label = $statusLabels[$status] ?? ucfirst($status);

        if ($cloud = $this->cloud()) {
            $plain = ['in_delivery' => 'en cours de livraison', 'delivered' => 'livrée', 'cancelled' => 'annulée'][$status] ?? $status;
            $cloud->sendTemplate($this->formatPhone($order->customer_phone), 'biolinko_suivi_commande',
                [$order->customer_name, $order->tracking_code, $store->name, $plain], $order->tracking_code);

            return;
        }

        $msg = "📦 *Mise à jour de livraison — {$store->name}*\n\n"
            . "{$greeting}\n\n"
            . "Le statut de votre commande *#{$order->tracking_code}* est désormais :\n*{$label}*.\n\n";

        if ($customNote) {
            $msg .= "💬 *Note de la boutique :* {$customNote}\n\n";
        }

        $msg .= "📍 *Voir les détails en direct :*\n"
            . "{$trackingUrl}\n\n"
            . $this->getPolymorphicFooter($store, $order->tracking_code);

        $this->sendMessage($order->customer_phone, $msg);
    }

    /**
     * 1-Click WhatsApp Reminder for pending/unpaid orders.
     */
    public function send1ClickReminder(Order $order): array
    {
        if (!$order->customer_phone) {
            return ['success' => false, 'error' => 'Numéro de téléphone client introuvable.'];
        }

        $order->loadMissing('store');
        $store = $order->store;
        $trackingUrl = route('order.track', $order->tracking_code);
        $totalFormatted = number_format($order->total_client, 0, ',', ' ');

        if ($cloud = $this->cloud()) {
            return $cloud->sendTemplate($this->formatPhone($order->customer_phone), 'biolinko_rappel_paiement',
                [$order->customer_name, $order->tracking_code, $totalFormatted, $store->name], $order->tracking_code);
        }

        $greeting = $this->getPolymorphicGreeting($order->customer_name);

        $reminderPhrases = [
            "Vous avez récemment réservé des articles sur notre boutique *{$store->name}* pour un montant de *{$totalFormatted} FCFA* (Réf: *#{$order->tracking_code}*).",
            "Votre panier chez *{$store->name}* d'un montant de *{$totalFormatted} FCFA* (Réf: *#{$order->tracking_code}*) vous attend toujours !",
            "Rappel amical : votre commande sur *{$store->name}* (*{$totalFormatted} FCFA*, Réf: *#{$order->tracking_code}*) est prête à être finalisée.",
        ];
        $phrase = $reminderPhrases[array_rand($reminderPhrases)];

        $reminderMsg = "{$greeting}\n\n"
            . "{$phrase}\n\n"
            . "Vos articles sont encore réservés. Vous pouvez régler en un clic par MTN MoMo ou Orange Money.\n\n"
            . "👉 *Payer ma commande :*\n"
            . "{$trackingUrl}\n\n"
            . $this->getPolymorphicFooter($store, $order->tracking_code);

        return $this->sendMessage($order->customer_phone, $reminderMsg);
    }

    /**
     * Generate a direct wa.me link for manual merchant one-click opening.
     */
    public function getDirectWhatsappLink(string $phone, string $message): string
    {
        $formattedPhone = $this->formatPhone($phone);
        return "https://wa.me/{$formattedPhone}?text=" . rawurlencode($message);
    }

    /**
     * Send moderation notification via WhatsApp to merchant.
     */
    public function notifyModerationAction(\App\Models\User $user, string $type, string $itemName, string $reason): void
    {
        $phone = $user->phone_whatsapp ?: ($user->store?->phone_whatsapp ?? null);
        if (!$phone) {
            return;
        }

        $actionText = match ($type) {
            'product_deleted' => "Votre produit *{$itemName}* a été retiré et supprimé de la plateforme.",
            'store_deleted' => "Votre vitrine *{$itemName}* a été définitivement supprimée de la plateforme.",
            'store_suspended' => "Votre vitrine *{$itemName}* a été suspendue et repassée en brouillon.",
            'account_banned' => "L'accès à votre compte vendeur a été restreint/suspendu.",
            'account_unbanned' => "Votre compte vendeur a été réactivé avec succès.",
            default => "Une décision de modération a été prise sur votre compte.",
        };

        if ($cloud = $this->cloud()) {
            $cloud->sendTemplate($this->formatPhone($phone), 'biolinko_moderation',
                [$user->name, str_replace('*', '', $actionText), $reason]);

            return;
        }

        $msg = "⚠️ *Notification de Modération — BIOLINKO*\n\n"
            . "Bonjour *{$user->name}*,\n\n"
            . "{$actionText}\n\n"
            . "📋 *Motif communiqué :*\n"
            . "_{$reason}_\n\n"
            . "Pour toute réclamation ou question, vous pouvez écrire à support@biolinko.link ou répondre directement à ce message.\n\n"
            . "_[Équipe de Conformité & Modération BIOLINKO]_";

        $this->sendMessage($phone, $msg);
    }

    /** Prévient le vendeur qu'un client a signalé un problème : la vente reste gelée jusqu'à sa réponse. */
    public function notifyOrderReported(Order $order, \App\Models\OrderReport $report): void
    {
        $order->loadMissing('store.user');
        $store = $order->store;
        $vendorPhone = $store->phone_whatsapp ?: ($store->user->phone_whatsapp ?? null);
        if (! $vendorPhone) {
            return;
        }

        if ($cloud = $this->cloud()) {
            $cloud->sendTemplate($this->formatPhone($vendorPhone), 'biolinko_signalement',
                [$order->tracking_code, $order->customer_name, $report->reason_label, $order->customer_phone]);

            return;
        }

        $this->sendMessage($vendorPhone, "⚠️ *Signalement sur la commande #{$order->tracking_code}*\n\n"
            ."Client : *{$order->customer_name}* ({$order->customer_phone})\n"
            ."Motif : {$report->reason_label}\n"
            ."Message : _{$report->message}_\n\n"
            ."La vente reste en attente le temps de trouver une solution avec votre client. Répondez depuis vos commandes : ".route('orders.index'));
    }
}
