<?php

namespace App\Payments\Orders;

use App\Payments\HostedCheckout;
use App\Payments\PaymentException;
use App\Payments\PaymentManager;
use App\Payments\Countries;

use App\Models\Order;
use App\Payments\PaymentGateway;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Paiement Mobile Money d'une commande : lancement et suivi, quel que soit l'agrégateur.
 */
class OrderPayments
{
    public function __construct(private PaymentManager $payments)
    {
    }

    /**
     * Envoie la demande de paiement sur le téléphone du client.
     *
     * @throws PaymentException|\InvalidArgumentException
     */
    public function start(Order $order, string $rawPhone, ?string $operator = null): array
    {
        // Garde-fou pour toute commande payée en ligne (panier, lien de paiement, relance, facture)
        $minOrder = Countries::minOrder($order->payment_country ?: 'CM');
        if ((float) $order->price_vendor < $minOrder) {
            throw new PaymentException('Le paiement en ligne est possible à partir de '.number_format($minOrder, 0, ',', ' ').' FCFA.');
        }

        $country = $order->payment_country ?: 'CM';
        $gateway = $this->payments->driver();

        if ($gateway instanceof HostedCheckout && config('payments.'.$gateway->name().'.checkout') === 'hosted') {
            return $this->startHosted($order, $gateway, $country, $rawPhone);
        }

        $phone = Countries::formatPhone($country, $rawPhone);
        $operator = strtoupper($operator ?: Countries::detectOperator($country, $phone));

        // La référence est enregistrée avant l'appel : si la réponse se perd, le paiement reste retrouvable
        $reference = (string) Str::uuid();
        $order->update([
            'payment_provider' => $gateway->name(),
            'payment_reference' => $reference,
            'payment_operator' => $operator,
            'payment_phone' => $phone,
        ]);

        $result = $gateway->deposit([
            'reference' => $reference,
            'amount' => (float) $order->total_client,
            'currency' => $order->currency ?: 'XAF',
            'country' => $country,
            'phone' => $phone,
            'operator' => $operator,
            'description' => 'Commande '.$order->store?->name,
            'client_reference' => $order->tracking_code,
            'metadata' => ['order' => $order->tracking_code, 'store' => (string) $order->store_id],
        ]);

        if ($result['reference'] !== $reference) {
            $order->update(['payment_reference' => $result['reference']]);
        }

        return [
            'reference' => $result['reference'],
            'tracking_code' => $order->tracking_code,
            'amount' => (float) $order->total_client,
            'operator' => $operator,
            'phone' => $phone,
            'redirect_url' => route('order.track', $order->tracking_code),
        ];
    }

    /**
     * Page de paiement hébergée : le client y choisit son opérateur et valide, puis revient sur
     * la page de suivi de sa commande, qui vérifie le paiement. Seul le webhook ou la vérification
     * auprès de l'agrégateur marque la commande payée (jamais le simple retour sur success_url).
     */
    private function startHosted(Order $order, PaymentGateway $gateway, string $country, ?string $rawPhone): array
    {
        try {
            $phone = $rawPhone ? Countries::formatPhone($country, $rawPhone) : null;
        } catch (\InvalidArgumentException $e) {
            $phone = null; // le client le saisira sur la page de paiement
        }

        $reference = (string) Str::uuid();
        $order->update(['payment_provider' => $gateway->name(), 'payment_reference' => $reference, 'payment_phone' => $phone]);

        $track = route('order.track', $order->tracking_code);
        $result = $gateway->checkout([
            'reference' => $reference,
            'amount' => (float) $order->total_client,
            'currency' => $order->currency ?: 'XAF',
            'country' => $country,
            'description' => 'Commande '.$order->tracking_code.' · '.$order->store?->name,
            'payer_name' => $order->customer_name,
            'payer_phone' => $phone,
            'payer_email' => $order->customer_email,
            'success_url' => $track.'?paiement=retour',
            'cancel_url' => $track.'?paiement=annule',
            'metadata' => ['order' => $order->tracking_code, 'store' => (string) $order->store_id],
        ]);

        $order->update(['payment_reference' => $result['reference']]);

        return [
            'reference' => $result['reference'],
            'checkout_url' => $result['checkout_url'],
            'tracking_code' => $order->tracking_code,
            'amount' => (float) $order->total_client,
            'redirect_url' => $track,
        ];
    }

    /**
     * Interroge l'agrégateur et applique le résultat. Renvoie PENDING | SUCCESS | FAILED.
     */
    public function refresh(Order $order): string
    {
        if ($order->payment_status === 'paid') {
            return 'SUCCESS';
        }
        if ($order->payment_status === 'failed' || $order->status === 'cancelled') {
            return 'FAILED';
        }
        if (! $order->payment_reference || ! $order->payment_provider) {
            return 'PENDING';
        }

        try {
            $status = $this->payments->driver($order->payment_provider)->depositStatus($order->payment_reference);
        } catch (\Throwable $e) {
            Log::warning('Order payment status check failed', ['order_id' => $order->id, 'err' => $e->getMessage()]);

            return 'PENDING';
        }

        if ($status['status'] === 'SUCCESS') {
            if (! empty($status['operator'])) {
                $order->update(['payment_operator' => $status['operator']]);
            }
            $order->markAsPaid($status['transaction_id'] ?? null);
        } elseif ($status['status'] === 'FAILED') {
            Order::whereKey($order->id)->where('payment_status', '!=', 'paid')->update(['status' => 'cancelled', 'payment_status' => 'failed']);
        }

        return $status['status'];
    }
}
