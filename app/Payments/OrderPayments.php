<?php

namespace App\Payments;

use App\Models\Order;
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
        $country = $order->payment_country ?: 'CM';
        $phone = Countries::formatPhone($country, $rawPhone);
        $operator = strtoupper($operator ?: Countries::detectOperator($country, $phone));
        $gateway = $this->payments->driver();

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
            'amount' => max(100, (int) round($order->total_client)),
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
            'amount' => max(100, (int) round($order->total_client)),
            'operator' => $operator,
            'phone' => $phone,
            'redirect_url' => route('order.track', $order->tracking_code),
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
            $order->markAsPaid($status['transaction_id'] ?? null);
        } elseif ($status['status'] === 'FAILED') {
            Order::whereKey($order->id)->where('payment_status', '!=', 'paid')->update(['status' => 'cancelled', 'payment_status' => 'failed']);
        }

        return $status['status'];
    }
}
