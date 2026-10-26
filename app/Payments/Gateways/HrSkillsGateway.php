<?php

namespace App\Payments\Gateways;

use App\Payments\PaymentException;
use App\Payments\PaymentGateway;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * HR-Skills Pay, agrégateur de secours. La référence Biolinko sert d'Idempotency-Key ;
 * HR-Skills renvoie sa propre référence, enregistrée sur l'opération.
 */
class HrSkillsGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'hrskills';
    }

    public function deposit(array $payment): array
    {
        return $this->initiate('/api/v1/payin/mobile-money', $payment);
    }

    public function depositStatus(string $reference): array
    {
        return $this->status($reference);
    }

    public function payout(array $payout): array
    {
        return $this->initiate('/api/v1/payout/mobile-money', $payout);
    }

    public function payoutStatus(string $reference): array
    {
        return $this->status($reference);
    }

    private function initiate(string $path, array $p): array
    {
        $body = array_filter([
            'operator' => strtolower($p['operator']),
            'country' => $p['country'],
            'phone_number' => $p['phone'],
            'amount' => (int) $p['amount'],
            'currency' => $p['currency'],
            'description' => $p['description'] ?? null,
            'metadata' => $p['metadata'] ?? null,
        ], fn ($v) => $v !== null);

        $response = $this->send(fn ($token) => Http::withHeaders($this->headers($token) + ['Idempotency-Key' => $p['reference']])->timeout(30)->post($this->url($path), $body));

        if ($response->failed() || ! ($ref = $response->json('data.reference'))) {
            Log::warning('HR-Skills initiation failed', ['path' => $path, 'status' => $response->status(), 'code' => $response->json('code') ?? $response->json('error')]);

            throw new PaymentException('Le paiement Mobile Money n’a pas pu aboutir. Réessayez dans un instant.');
        }

        return ['reference' => $ref, 'status' => 'PENDING', 'operator' => strtoupper($p['operator']), 'transaction_id' => $response->json('data.transaction_id')];
    }

    private function status(string $reference): array
    {
        $response = $this->send(fn ($token) => Http::withHeaders($this->headers($token))->timeout(20)->get($this->url('/v1/payments/'.$reference)));
        if ($response->failed()) {
            return ['status' => 'PENDING'];
        }
        $data = $response->json('data') ?? $response->json();

        return [
            'status' => match (strtoupper($data['status'] ?? '')) {
                'SUCCESS', 'COMPLETED' => 'SUCCESS',
                'FAILED', 'CANCELLED' => 'FAILED',
                default => 'PENDING',
            },
            'transaction_id' => $data['transaction_id'] ?? null,
            'message' => null,
        ];
    }

    /** Jeton de transaction (45 min) renouvelé automatiquement s'il est refusé. */
    private function send(callable $request)
    {
        $response = $request($this->token());
        if ($response->status() === 401 && in_array($response->json('code') ?? $response->json('error'), ['invalid_transaction_token', 'missing_transaction_token'], true)) {
            Cache::forget('hrsk_transaction_token');
            $response = $request($this->token());
        }

        return $response;
    }

    private function token(): string
    {
        return Cache::remember('hrsk_transaction_token', 44 * 60, function () {
            $response = Http::withToken((string) config('services.hrskills_pay.public_key'))->timeout(20)
                ->post($this->url('/v1/auth/transaction-token'), ['api_secret' => config('services.hrskills_pay.secret_key')]);

            return $response->json('transaction_token') ?? $response->json('data.transaction_token')
                ?? throw new PaymentException('Le paiement Mobile Money n’est pas disponible pour le moment.');
        });
    }

    private function headers(string $token): array
    {
        return ['Authorization' => 'Bearer '.config('services.hrskills_pay.public_key'), 'X-Transaction-Token' => $token, 'Accept' => 'application/json'];
    }

    private function url(string $path): string
    {
        return rtrim((string) config('services.hrskills_pay.base_url'), '/').$path;
    }
}
