<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Store;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappGatewayService
{
    protected string $baseUrl;
    protected string $apiKey;
    protected string $defaultInstance;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.whatsapp_gateway.base_url', 'https://evolutionapi.mrdims.dev'), '/');
        $this->apiKey = config('services.whatsapp_gateway.api_key', 'Biolinko_EvoApi_9f83a7c41d2e5b60e7f8a9c0');
        $this->defaultInstance = config('services.whatsapp_gateway.default_instance', 'test_dims');
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
     * Send raw text message via Evolution API v2.
     */
    public function sendMessage(string $phone, string $message, ?string $instanceName = null): array
    {
        $formattedPhone = $this->formatPhone($phone);
        $instance = $instanceName ?: $this->defaultInstance;

        try {
            $url = "{$this->baseUrl}/message/sendText/{$instance}";
            
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(12)->post($url, [
                'number' => $formattedPhone,
                'text' => $message,
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
     * Send Order Placed / Pending notification to Customer and Merchant.
     */
    public function notifyOrderPlaced(Order $order): void
    {
        $order->loadMissing(['store.user', 'items']);
        $store = $order->store;
        $trackingUrl = route('order.track', $order->tracking_code);
        $totalFormatted = number_format($order->total_client, 0, ',', ' ');

        // 1. Notification au Client
        if ($order->customer_phone) {
            $customerMsg = "🛍️ *Commande enregistrée chez {$store->name} !*\n\n"
                . "Bonjour *{$order->customer_name}*,\n"
                . "Votre commande *#{$order->tracking_code}* d'un montant de *{$totalFormatted} FCFA* a bien été initiée.\n\n"
                . "📍 *Suivre votre commande en temps réel :*\n"
                . "{$trackingUrl}\n\n"
                . "En cas de question, vous pouvez contacter directement la boutique au : {$store->phone_whatsapp}.\n\n"
                . "Merci de votre confiance ! ✨";

            $this->sendMessage($order->customer_phone, $customerMsg);
        }

        // 2. Notification au Vendeur
        $vendorPhone = $store->phone_whatsapp ?: ($store->user->phone ?? null);
        if ($vendorPhone) {
            $vendorMsg = "🔔 *Nouvelle commande sur votre boutique {$store->name} !*\n\n"
                . "Réf : *#{$order->tracking_code}*\n"
                . "Client : *{$order->customer_name}* ({$order->customer_phone})\n"
                . "Montant : *{$totalFormatted} FCFA*\n"
                . "Statut actuel : " . strtoupper($order->status) . "\n\n"
                . "👉 Accédez à vos commandes : " . route('orders.index');

            $this->sendMessage($vendorPhone, $vendorMsg);
        }
    }

    /**
     * Send Order Payment Confirmed notification with invoice download link.
     */
    public function notifyOrderPaid(Order $order): void
    {
        $order->loadMissing(['store.user', 'items']);
        $store = $order->store;
        $trackingUrl = route('order.track', $order->tracking_code);
        $invoiceUrl = route('seller.invoices.download', $order->id);
        $totalFormatted = number_format($order->total_client, 0, ',', ' ');
        $vendorGain = number_format($order->price_vendor, 0, ',', ' ');

        // 1. Notification au Client (Reçu + Facture)
        if ($order->customer_phone) {
            $customerMsg = "✅ *Paiement Validé avec Succès — {$store->name}*\n\n"
                . "Merci *{$order->customer_name}* !\n"
                . "Votre paiement de *{$totalFormatted} FCFA* pour la commande *#{$order->tracking_code}* a été validé avec succès.\n\n"
                . "📦 Vos articles sont désormais en cours de préparation pour livraison.\n\n"
                . "📄 *Télécharger votre Facture PDF officielle :*\n"
                . "{$invoiceUrl}\n\n"
                . "📍 *Suivi de livraison en direct :*\n"
                . "{$trackingUrl}\n\n"
                . "À très bientôt sur {$store->name} !";

            $this->sendMessage($order->customer_phone, $customerMsg);
        }

        // 2. Alerte Gain au Vendeur
        $vendorPhone = $store->phone_whatsapp ?: ($store->user->phone ?? null);
        if ($vendorPhone) {
            $vendorMsg = "🎉 *VENTE CONFIRMÉE & ENCAISSÉE — {$store->name} !*\n\n"
                . "La commande *#{$order->tracking_code}* de *{$order->customer_name}* ({$order->customer_phone}) est PAYÉE !\n\n"
                . "💰 *+{$vendorGain} FCFA* viennent d'être crédités sur votre portefeuille vendeur disponible.\n"
                . "📍 Destination : {$order->customer_city} - {$order->customer_delivery_address}\n\n"
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

        $statusLabels = [
            'in_delivery' => '🚚 En cours de livraison / Expédiée',
            'delivered' => '🎉 Livrée avec succès',
            'cancelled' => '❌ Annulée',
        ];

        $label = $statusLabels[$status] ?? ucfirst($status);

        $msg = "📦 *Mise à jour de votre commande #{$order->tracking_code} — {$store->name}*\n\n"
            . "Bonjour *{$order->customer_name}*,\n"
            . "Le statut de votre commande est désormais : *{$label}*.\n\n";

        if ($customNote) {
            $msg .= "💬 *Note de la boutique :* {$customNote}\n\n";
        }

        $msg .= "📍 *Voir les détails en direct :*\n"
            . "{$trackingUrl}\n\n"
            . "Merci de commander chez {$store->name} !";

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

        $reminderMsg = "Bonjour *{$order->customer_name}* ! 👋\n\n"
            . "Vous avez récemment initié une commande sur notre boutique *{$store->name}* pour un montant de *{$totalFormatted} FCFA* (Réf: *#{$order->tracking_code}*).\n\n"
            . "Vos articles sont actuellement réservés. Souhaitez-vous de l'aide pour finaliser votre paiement Mobile Money ou organiser la livraison ?\n\n"
            . "👉 *Cliquez ici pour finaliser ou voir votre commande :*\n"
            . "{$trackingUrl}\n\n"
            . "Nous sommes à votre disposition directement sur ce numéro WhatsApp. À très vite ! ✨";

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
     * Generate or retrieve QR Code session for vendor WhatsApp instance.
     */
    public function getQrCode(string $instanceName = 'test_dims'): array
    {
        try {
            $url = "{$this->baseUrl}/instance/connect/{$instanceName}";
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
            ])->timeout(8)->get($url);

            if ($response->successful()) {
                $json = $response->json();
                return [
                    'success' => true,
                    'qr_code' => $json['base64'] ?? null,
                    'pairing_code' => $json['pairingCode'] ?? null,
                    'state' => $json['instance']['state'] ?? 'connecting',
                ];
            }

            return ['success' => false, 'error' => 'Impossible de récupérer la session QR Code.'];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}

