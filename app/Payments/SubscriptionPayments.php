<?php

namespace App\Payments;

use App\Models\Subscription;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Paiement Mobile Money des abonnements vendeur, quel que soit l'agrégateur.
 */
class SubscriptionPayments
{
    public function __construct(private PaymentManager $payments)
    {
    }

    /** @throws PaymentException|\InvalidArgumentException */
    public function start(Subscription $subscription, string $phone, string $operator, string $country = 'CM'): array
    {
        $gateway = $this->payments->driver();
        $reference = (string) Str::uuid();
        $subscription->update(['payment_provider' => $gateway->name(), 'payment_reference' => $reference]);

        $result = $gateway->deposit([
            'reference' => $reference,
            'amount' => (int) $subscription->amount,
            'currency' => 'XAF',
            'country' => $country,
            'phone' => $phone,
            'operator' => $operator,
            'description' => 'Abonnement Biolinko',
            'client_reference' => 'ABO-'.$subscription->id,
            'metadata' => ['subscription' => (string) $subscription->id, 'plan' => $subscription->plan],
        ]);

        if ($result['reference'] !== $reference) {
            $subscription->update(['payment_reference' => $result['reference']]);
        }

        return $result + ['reference' => $result['reference']];
    }

    /** PENDING | SUCCESS | FAILED */
    public function refresh(Subscription $subscription): string
    {
        if ($subscription->payment_status === 'paid') {
            return 'SUCCESS';
        }
        if ($subscription->payment_status === 'failed') {
            return 'FAILED';
        }
        if (! $subscription->payment_reference || ! $subscription->payment_provider) {
            return 'PENDING';
        }

        try {
            $status = $this->payments->driver($subscription->payment_provider)->depositStatus($subscription->payment_reference);
        } catch (\Throwable $e) {
            Log::warning('Subscription payment status check failed', ['subscription_id' => $subscription->id, 'err' => $e->getMessage()]);

            return 'PENDING';
        }

        if ($status['status'] === 'SUCCESS') {
            $subscription->activate();
        } elseif ($status['status'] === 'FAILED') {
            Subscription::whereKey($subscription->id)->where('payment_status', 'pending')->update(['payment_status' => 'failed']);
        }

        return $status['status'];
    }
}
