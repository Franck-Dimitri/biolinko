<?php

namespace App\Payments\Gateways;

use App\Payments\Countries;
use App\Payments\PaymentException;
use App\Payments\PaymentGateway;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * pawaPay (API v2). La référence Biolinko (UUID) est le depositId / payoutId :
 * renvoyer la même requête est sans risque de double débit.
 */
class PawapayGateway implements PaymentGateway
{
    public function name(): string
    {
        return 'pawapay';
    }

    public function deposit(array $payment): array
    {
        $response = $this->http()->post('/v2/deposits', $this->clean([
            'depositId' => $payment['reference'],
            'payer' => ['type' => 'MMO', 'accountDetails' => [
                'phoneNumber' => $payment['phone'],
                'provider' => $this->provider($payment['country'], $payment['operator']),
            ]],
            'amount' => (string) (int) $payment['amount'],
            'currency' => $payment['currency'],
            'clientReferenceId' => $payment['client_reference'] ?? null,
            'customerMessage' => $this->customerMessage($payment['description'] ?? null),
            'metadata' => $this->metadata($payment['metadata'] ?? []),
        ]));

        return $this->initiationResult($response, $payment, 'deposit');
    }

    public function depositStatus(string $reference): array
    {
        return $this->statusResult($this->http()->get('/v2/deposits/'.$reference));
    }

    public function payout(array $payout): array
    {
        $response = $this->http()->post('/v2/payouts', $this->clean([
            'payoutId' => $payout['reference'],
            'recipient' => ['type' => 'MMO', 'accountDetails' => [
                'phoneNumber' => $payout['phone'],
                'provider' => $this->provider($payout['country'], $payout['operator']),
            ]],
            'amount' => (string) (int) $payout['amount'],
            'currency' => $payout['currency'],
            'clientReferenceId' => $payout['client_reference'] ?? null,
            'customerMessage' => $this->customerMessage($payout['description'] ?? 'Retrait Biolinko'),
            'metadata' => $this->metadata($payout['metadata'] ?? []),
        ]));

        return $this->initiationResult($response, $payout, 'payout');
    }

    public function payoutStatus(string $reference): array
    {
        return $this->statusResult($this->http()->get('/v2/payouts/'.$reference));
    }

    private function http(): PendingRequest
    {
        $token = config('payments.pawapay.token');
        if (! $token) {
            throw new PaymentException('Le paiement Mobile Money n’est pas encore configuré.');
        }

        return Http::baseUrl(config('payments.pawapay.base_url'))->withToken($token)->acceptJson()->timeout(30)
            // Nouvel essai seulement si la connexion a coupé : même depositId/payoutId, donc jamais de double débit
            ->retry(2, 500, fn ($e) => $e instanceof \Illuminate\Http\Client\ConnectionException, throw: false);
    }

    private function provider(string $country, string $operator): string
    {
        $provider = Countries::get($country)['operators'][strtoupper($operator)] ?? null;
        if (! $provider) {
            throw new PaymentException(Countries::operatorLabel($operator).' n’est pas disponible dans ce pays.');
        }

        return $provider;
    }

    private function initiationResult($response, array $payload, string $type): array
    {
        $status = $response->json('status');

        if ($response->successful() && in_array($status, ['ACCEPTED', 'DUPLICATE_IGNORED'], true)) {
            return ['reference' => $payload['reference'], 'status' => 'PENDING', 'operator' => strtoupper($payload['operator']), 'transaction_id' => null];
        }

        $code = $response->json('failureReason.failureCode') ?? 'HTTP_'.$response->status();
        Log::warning("pawaPay {$type} rejected", ['reference' => $payload['reference'], 'code' => $code, 'message' => $response->json('failureReason.failureMessage')]);

        throw new PaymentException($this->humanError($code));
    }

    private function statusResult($response): array
    {
        if (! $response->successful() || $response->json('status') !== 'FOUND') {
            return ['status' => 'PENDING'];
        }

        $data = $response->json('data');

        return [
            'status' => match ($data['status'] ?? null) {
                'COMPLETED' => 'SUCCESS',
                'FAILED' => 'FAILED',
                default => 'PENDING',
            },
            'transaction_id' => $data['providerTransactionId'] ?? null,
            'message' => isset($data['failureReason']['failureCode']) ? $this->humanError($data['failureReason']['failureCode']) : null,
        ];
    }

    /** 4 à 22 caractères, lettres, chiffres et espaces seulement. */
    private function customerMessage(?string $text): ?string
    {
        $clean = trim(preg_replace('/\s+/', ' ', preg_replace('/[^A-Za-z0-9 ]/', ' ', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', (string) $text) ?: '')));
        $clean = mb_substr($clean, 0, 22);

        return strlen($clean) >= 4 ? $clean : null;
    }

    /** pawaPay refuse les champs vides : on les retire. */
    private function clean(array $body): array
    {
        return array_filter($body, fn ($v) => $v !== null && $v !== []);
    }

    private function metadata(array $meta): array
    {
        return collect($meta)->take(10)->map(fn ($v, $k) => [$k => (string) $v])->values()->all();
    }

    private function humanError(string $code): string
    {
        return match ($code) {
            'INVALID_PHONE_NUMBER', 'PAYER_NOT_FOUND' => 'Ce numéro n’est pas reconnu par l’opérateur. Vérifiez le numéro et l’opérateur choisi.',
            'AMOUNT_OUT_OF_BOUNDS' => 'Ce montant dépasse les limites autorisées par l’opérateur.',
            'INSUFFICIENT_BALANCE' => 'Solde Mobile Money insuffisant.',
            'PAYMENT_NOT_APPROVED' => 'Le paiement n’a pas été validé sur le téléphone.',
            'PAYER_LIMIT_REACHED', 'WALLET_LIMIT_REACHED' => 'La limite de transactions de ce compte Mobile Money est atteinte.',
            'PAYMENT_IN_PROGRESS' => 'Un autre paiement est déjà en cours sur ce numéro. Réessayez dans un instant.',
            'PROVIDER_TEMPORARILY_UNAVAILABLE' => 'L’opérateur est momentanément indisponible. Réessayez dans quelques minutes.',
            'PAWAPAY_WALLET_OUT_OF_FUNDS' => 'Le virement ne peut pas être effectué pour le moment. L’équipe Biolinko est prévenue.',
            'DEPOSITS_NOT_ALLOWED', 'PAYOUTS_NOT_ALLOWED', 'INVALID_PROVIDER', 'INVALID_CURRENCY' => 'Cet opérateur n’est pas encore disponible.',
            default => 'Le paiement Mobile Money n’a pas pu aboutir. Réessayez dans un instant.',
        };
    }
}
