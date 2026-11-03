<?php

namespace App\Payments\Gateways;

use App\Payments\Countries;
use App\Payments\PaymentException;
use App\Payments\PaymentGateway;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Mercy Pay (revendeur pawaPay). La référence Biolinko sert d'Idempotency-Key ;
 * Mercy Pay renvoie son propre uuid, enregistré sur l'opération.
 * Les virements n'existent qu'en live (clé mp_live_ et KYC approuvé).
 */
class MercyPayGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'mercypay';
    }

    public function deposit(array $payment): array
    {
        $country = Countries::get($payment['country']);
        $response = $this->http($payment['reference'])->post('/api/v1/payments', array_filter([
            'amount' => Countries::toMinorUnits($payment['country'], $payment['amount']),
            'currency' => $payment['currency'],
            'payment_method' => 'mobile_money',
            'country' => $country['iso3'],
            'provider' => $this->provider($payment['country'], $payment['operator']),
            'phone' => $payment['phone'],
            'payer_name' => $payment['payer_name'] ?? null,
            'description' => $payment['description'] ?? null,
        ], fn ($v) => $v !== null));

        return $this->created($response, $payment, 'payment');
    }

    public function depositStatus(string $reference): array
    {
        $response = $this->http()->get('/api/v1/payments/'.$reference);
        if (! $response->successful()) {
            return ['status' => 'PENDING'];
        }

        return [
            'status' => match ($response->json('data.status')) {
                'succeeded' => 'SUCCESS',
                'failed', 'canceled', 'expired' => 'FAILED',
                default => 'PENDING',
            },
            'transaction_id' => $response->json('data.psp_reference'),
            'message' => $response->json('data.failure_reason'),
        ];
    }

    /**
     * Mercy Pay retient 2 % sur le montant demandé : on demande assez pour que le vendeur reçoive exactement $payout['amount'].
     */
    public function payout(array $payout): array
    {
        $gross = Countries::toMinorUnits($payout['country'], ceil($payout['amount'] * 100 / (100 - config('payments.mercypay.payout_fee_percent'))));
        $response = $this->http($payout['reference'])->post('/api/v1/payouts', [
            'amount' => $gross,
            'currency' => $payout['currency'],
            'destination' => [
                'type' => 'mobile_money',
                'country' => Countries::get($payout['country'])['iso3'],
                'provider' => $this->provider($payout['country'], $payout['operator']),
                'phone' => $payout['phone'],
            ],
        ]);

        return $this->created($response, $payout, 'payout');
    }

    public function payoutStatus(string $reference): array
    {
        $response = $this->http()->get('/api/v1/payouts/'.$reference);
        if (! $response->successful()) {
            return ['status' => 'PENDING'];
        }

        return [
            'status' => match ($response->json('data.status')) {
                'paid' => 'SUCCESS',
                'failed', 'rejected' => 'FAILED',
                default => 'PENDING', // requested, approved, processing
            },
            'transaction_id' => $response->json('data.psp_reference'),
            'message' => $response->json('data.failure_reason'),
        ];
    }

    private function http(?string $idempotencyKey = null): PendingRequest
    {
        $key = config('payments.mercypay.key');
        if (! $key) {
            throw new PaymentException('Le paiement Mobile Money n’est pas encore configuré.');
        }

        return Http::baseUrl(rtrim(config('payments.mercypay.base_url'), '/'))
            ->withToken($key)->acceptJson()->asJson()->timeout(30)
            ->when($idempotencyKey, fn ($h) => $h->withHeaders(['Idempotency-Key' => $idempotencyKey]))
            // Nouvel essai seulement si la connexion a coupé : même Idempotency-Key, donc jamais de doublon
            ->retry(2, 500, fn ($e) => $e instanceof ConnectionException, throw: false);
    }

    private function provider(string $country, string $operator): string
    {
        $provider = Countries::get($country)['operators'][strtoupper($operator)] ?? null;
        if (! $provider) {
            throw new PaymentException(Countries::operatorLabel($operator).' n’est pas disponible dans ce pays.');
        }

        return $provider;
    }

    private function created($response, array $payload, string $type): array
    {
        if ($response->successful() && ($uuid = $response->json('data.uuid'))) {
            if ($response->json('data.status') === 'failed') {
                throw new PaymentException($this->human($response->json('data.failure_reason')));
            }

            return ['reference' => $uuid, 'status' => 'PENDING', 'operator' => strtoupper($payload['operator']), 'transaction_id' => null];
        }

        Log::warning("Mercy Pay {$type} rejected", ['reference' => $payload['reference'], 'status' => $response->status(), 'message' => $response->json('message'), 'errors' => $response->json('errors')]);

        throw new PaymentException($this->human($response->json('message'), $response->status()));
    }

    private function human(?string $message, int $status = 422): string
    {
        if ($status === 401 || $status === 403) {
            return 'Le paiement Mobile Money n’est pas disponible pour le moment.';
        }
        if ($message && str_contains(mb_strtolower($message), 'solde')) {
            return 'Le virement ne peut pas être effectué pour le moment. L’équipe Biolinko est prévenue.';
        }

        return 'Le paiement Mobile Money n’a pas pu aboutir. Vérifiez le numéro et l’opérateur, puis réessayez.';
    }
}
