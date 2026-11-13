<?php

namespace App\Payments\Gateways;

use App\Payments\Countries;
use App\Payments\HostedCheckout;
use App\Payments\PaymentException;
use App\Payments\PaymentGateway;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Mercy Pay (revendeur pawaPay), API v1 telle que documentée sur docs.mercy-pay.com (novembre 2026).
 *
 * - Page de paiement hébergée : POST /api/v1/checkout_sessions (id cs_…), aux couleurs Biolinko
 *   réglées dans « Image de marque » du tableau de bord Mercy Pay (pas de champ par requête).
 * - Demande directe sur le téléphone : POST /api/v1/payments (id pay_…, Idempotency-Key obligatoire).
 * - Virements : POST /api/v1/payouts (id po_…), uniquement en live (KYC approuvé).
 * La référence Biolinko sert d'Idempotency-Key ; l'id renvoyé par Mercy Pay est enregistré sur l'opération.
 */
class MercyPayGateway implements PaymentGateway, HostedCheckout
{
    // Opérateur Mercy Pay → opérateur Biolinko
    private const OPERATORS = ['MTN_MOMO' => 'MTN', 'ORANGE' => 'ORANGE', 'AIRTEL' => 'AIRTEL', 'MOOV' => 'MOOV', 'VODACOM_MPESA' => 'MPESA', 'FREE' => 'FREE'];

    public function name(): string
    {
        return 'mercypay';
    }

    public function checkout(array $payment): array
    {
        $response = $this->http($payment['reference'])->post('/api/v1/checkout_sessions', array_filter([
            'amount' => Countries::toMinorUnits($payment['country'] ?? 'CM', $payment['amount']),
            'currency' => $payment['currency'],
            'description' => isset($payment['description']) ? mb_substr($payment['description'], 0, 500) : null,
            'payer_name' => $payment['payer_name'] ?? null,
            'payer_phone' => isset($payment['payer_phone']) ? '+'.ltrim($payment['payer_phone'], '+') : null,
            'payer_email' => $payment['payer_email'] ?? null,
            'success_url' => $payment['success_url'] ?? null,
            'cancel_url' => $payment['cancel_url'] ?? null,
            'metadata' => $this->metadata($payment['metadata'] ?? []),
        ], fn ($v) => $v !== null && $v !== []));

        if ($response->successful() && ($id = $response->json('data.id')) && ($url = $response->json('data.checkout_url'))) {
            return ['reference' => $id, 'checkout_url' => $url, 'status' => 'PENDING', 'operator' => null, 'transaction_id' => null];
        }

        $this->logRejected('checkout_session', $payment['reference'], $response);

        throw new PaymentException($this->human($response));
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
            'metadata' => $this->metadata($payment['metadata'] ?? []),
        ], fn ($v) => $v !== null && $v !== []));

        return $this->created($response, $payment, 'payment');
    }

    /** Statut d'une session de paiement hébergée (cs_…) ou d'un paiement direct (pay_…). */
    public function depositStatus(string $reference): array
    {
        if (str_starts_with($reference, 'cs_')) {
            return $this->sessionStatus($reference);
        }

        $response = $this->http()->get('/api/v1/payments/'.$reference);
        if (! $response->successful()) {
            return ['status' => 'PENDING'];
        }

        return $this->paymentResult((array) $response->json('data'));
    }

    /**
     * Mercy Pay retient 2 % du montant demandé : on demande assez pour que le vendeur reçoive exactement $payout['amount'].
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
                'failed', 'rejected', 'canceled' => 'FAILED',
                default => 'PENDING', // requested, approved, processing
            },
            'transaction_id' => $response->json('data.id'),
            'message' => $response->json('data.failure_reason'),
        ];
    }

    private function sessionStatus(string $id): array
    {
        $response = $this->http()->get('/api/v1/checkout_sessions/'.$id, ['expand' => ['payment']]);
        if (! $response->successful()) {
            return ['status' => 'PENDING'];
        }

        $session = (array) $response->json('data');
        $payment = is_array($session['payment'] ?? null) ? $session['payment'] : null;

        return match ($session['status'] ?? null) {
            'completed' => ['status' => 'SUCCESS'] + ($payment ? array_diff_key($this->paymentResult($payment), ['status' => 1]) : ['transaction_id' => is_string($session['payment'] ?? null) ? $session['payment'] : null]),
            'expired', 'cancelled', 'canceled' => ['status' => 'FAILED', 'transaction_id' => null, 'message' => 'La page de paiement a expiré ou a été annulée.'],
            default => ['status' => 'PENDING'], // created, pending_payment
        };
    }

    private function paymentResult(array $payment): array
    {
        return [
            'status' => match ($payment['status'] ?? null) {
                'succeeded' => 'SUCCESS',
                'failed', 'canceled', 'expired' => 'FAILED',
                default => 'PENDING', // pending, processing
            },
            'transaction_id' => $payment['id'] ?? null,
            'operator' => $this->operatorFromProvider($payment['mobile_money_provider'] ?? null),
            'message' => $payment['failure_reason'] ?? null,
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

    /** Métadonnées Mercy Pay : 50 clés au plus, valeurs texte de 500 caractères au plus. */
    private function metadata(array $metadata): array
    {
        return array_map(fn ($v) => $v === null ? null : mb_substr((string) $v, 0, 500), array_slice($metadata, 0, 50, true));
    }

    private function provider(string $country, string $operator): string
    {
        $provider = Countries::get($country)['operators'][strtoupper($operator)] ?? null;
        if (! $provider) {
            throw new PaymentException(Countries::operatorLabel($operator).' n’est pas disponible dans ce pays.');
        }

        return $provider;
    }

    /** MTN_MOMO_CMR → MTN, ORANGE_CMR → ORANGE… */
    private function operatorFromProvider(?string $provider): ?string
    {
        if (! $provider) {
            return null;
        }
        $prefix = preg_replace('/_[A-Z]{3}$/', '', $provider);

        return self::OPERATORS[$prefix] ?? null;
    }

    private function created(Response $response, array $payload, string $type): array
    {
        $id = $response->json('data.id') ?? $response->json('data.uuid');
        if ($response->successful() && $id) {
            if ($response->json('data.status') === 'failed') {
                throw new PaymentException($this->human($response));
            }

            return ['reference' => $id, 'status' => 'PENDING', 'operator' => strtoupper($payload['operator']), 'transaction_id' => null];
        }

        $this->logRejected($type, $payload['reference'], $response);

        throw new PaymentException($this->human($response));
    }

    private function logRejected(string $type, string $reference, Response $response): void
    {
        Log::warning("Mercy Pay {$type} rejected", [
            'reference' => $reference, 'status' => $response->status(),
            'code' => $response->json('error.code'), 'message' => $response->json('error.message'),
            'request_id' => $response->json('error.request_id') ?? $response->header('Request-Id'),
        ]);
    }

    /** Message pour le client, d'après le code d'erreur stable (jamais d'après le texte). */
    private function human(Response $response): string
    {
        $code = $response->json('error.code') ?? $response->json('data.failure_code');

        return match ($code) {
            'api_key_missing', 'api_key_invalid', 'merchant_suspended', 'live_mode_requires_kyc', 'forbidden' => 'Le paiement Mobile Money n’est pas disponible pour le moment.',
            'payouts_not_allowed' => 'Le virement ne peut pas être effectué pour le moment. L’équipe Biolinko est prévenue.',
            'insufficient_balance' => 'Solde Mobile Money insuffisant. Rechargez votre compte puis réessayez.',
            'invalid_phone_number', 'payer_not_found' => 'Ce numéro n’est pas reconnu par l’opérateur. Vérifiez-le puis réessayez.',
            'payer_limit_reached' => 'Votre plafond Mobile Money est atteint. Réessayez plus tard ou avec un autre numéro.',
            'provider_temporarily_unavailable' => 'L’opérateur est momentanément indisponible. Réessayez dans quelques minutes.',
            'rate_limited' => 'Trop de demandes en même temps. Réessayez dans un instant.',
            default => 'Le paiement Mobile Money n’a pas pu aboutir. Vérifiez le numéro et l’opérateur, puis réessayez.',
        };
    }
}
