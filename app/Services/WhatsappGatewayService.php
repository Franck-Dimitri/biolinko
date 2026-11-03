<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderReport;
use App\Models\User;

/**
 * Notifications WhatsApp automatiques, par l'API officielle de Meta uniquement.
 * En veille tant que WHATSAPP_DRIVER n'est pas "cloud" : les vendeurs contactent alors leurs clients
 * en 1 clic depuis leur propre WhatsApp, et chaque méthode ci-dessous ne fait rien.
 */
class WhatsappGatewayService
{
    public static function automatic(): bool
    {
        return config('services.whatsapp_driver') === 'cloud'
            && filled(config('services.whatsapp_cloud.token'))
            && filled(config('services.whatsapp_cloud.phone_number_id'));
    }

    public function cloud(): ?WhatsappCloudService
    {
        return self::automatic() ? app(WhatsappCloudService::class) : null;
    }

    public function formatPhone(string $phone): string
    {
        $cleaned = preg_replace('/[^0-9]/', '', $phone);

        if (str_starts_with($cleaned, '00')) {
            $cleaned = substr($cleaned, 2);
        }

        // Numéro camerounais à 9 chiffres (ex. 676383986)
        if (strlen($cleaned) === 9 && str_starts_with($cleaned, '6')) {
            $cleaned = '237'.$cleaned;
        }

        return $cleaned;
    }

    /** Texte libre : accepté par Meta seulement en réponse à un client (fenêtre de 24 h). */
    public function sendMessage(string $phone, string $message): array
    {
        $cloud = $this->cloud();

        return $cloud
            ? $cloud->sendText($this->formatPhone($phone), $message)
            : ['success' => false, 'disabled' => true, 'error' => 'Notifications WhatsApp automatiques en veille.'];
    }

    public function notifyOrderPlaced(Order $order): void
    {
        $cloud = $this->cloud();
        if (! $cloud || ! $order->customer_phone) {
            return;
        }
        $order->loadMissing('store');

        $cloud->sendTemplate($this->formatPhone($order->customer_phone), 'biolinko_commande_enregistree',
            [$order->customer_name, $order->tracking_code, $this->money($order->total_client), $order->store->name], $order->tracking_code);
    }

    public function notifyOrderPaid(Order $order): void
    {
        $cloud = $this->cloud();
        if (! $cloud) {
            return;
        }
        $order->loadMissing('store.user');
        $store = $order->store;

        if ($order->customer_phone) {
            $cloud->sendTemplate($this->formatPhone($order->customer_phone), 'biolinko_paiement_confirme',
                [$order->customer_name, $this->money($order->total_client), $order->tracking_code, $store->name], $order->tracking_code);
        }

        if ($vendorPhone = $this->vendorPhone($order)) {
            $cloud->sendTemplate($this->formatPhone($vendorPhone), 'biolinko_vente_payee_v2', [
                $store->name, $order->tracking_code, $order->customer_name,
                $this->money($order->sellerNet()), ($order->funds_release_at ?? now())->format('d/m/Y'),
            ]);
        }
    }

    public function notifyOrderShippingUpdate(Order $order, string $status): void
    {
        $cloud = $this->cloud();
        if (! $cloud || ! $order->customer_phone) {
            return;
        }
        $order->loadMissing('store');
        $label = ['in_delivery' => 'en cours de livraison', 'delivered' => 'livrée', 'cancelled' => 'annulée'][$status] ?? $status;

        $cloud->sendTemplate($this->formatPhone($order->customer_phone), 'biolinko_suivi_commande',
            [$order->customer_name, $order->tracking_code, $order->store->name, $label], $order->tracking_code);
    }

    public function sendPaymentReminder(Order $order): array
    {
        $cloud = $this->cloud();
        if (! $cloud || ! $order->customer_phone) {
            return ['success' => false, 'disabled' => true];
        }
        $order->loadMissing('store');

        return $cloud->sendTemplate($this->formatPhone($order->customer_phone), 'biolinko_rappel_paiement_v2',
            [$order->customer_name, $order->tracking_code, $this->money($order->total_client), $order->store->name], $order->tracking_code);
    }

    public function notifyModerationAction(User $user, string $type, string $itemName, string $reason): void
    {
        $cloud = $this->cloud();
        $phone = $user->phone_whatsapp ?: ($user->store?->phone_whatsapp ?? null);
        if (! $cloud || ! $phone) {
            return;
        }

        $action = match ($type) {
            'product_deleted' => "votre produit {$itemName} a été retiré de la plateforme",
            'store_suspended' => "votre vitrine {$itemName} a été suspendue et repassée en brouillon",
            'account_banned' => 'l’accès à votre compte vendeur a été suspendu',
            'account_unbanned' => 'votre compte vendeur a été réactivé',
            default => 'une décision de modération a été prise sur votre compte',
        };

        $cloud->sendTemplate($this->formatPhone($phone), 'biolinko_moderation_v2', [$action, rtrim($reason, '.')]);
    }

    public function notifyOrderReported(Order $order, OrderReport $report): void
    {
        $cloud = $this->cloud();
        $vendorPhone = $this->vendorPhone($order);
        if (! $cloud || ! $vendorPhone) {
            return;
        }

        $cloud->sendTemplate($this->formatPhone($vendorPhone), 'biolinko_signalement',
            [$order->tracking_code, $order->customer_name, $report->reason_label, $order->customer_phone]);
    }

    private function vendorPhone(Order $order): ?string
    {
        $order->loadMissing('store.user');

        return $order->store->phone_whatsapp ?: ($order->store->user->phone_whatsapp ?? null);
    }

    private function money($amount): string
    {
        return number_format((float) $amount, 0, ',', ' ');
    }
}
