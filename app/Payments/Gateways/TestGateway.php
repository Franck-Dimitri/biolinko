<?php

namespace App\Payments\Gateways;

use App\Payments\PaymentException;
use App\Payments\PaymentGateway;
use Illuminate\Support\Facades\Cache;

/**
 * Paiements de test (PAYMENT_DRIVER=test) : aucun argent ne circule, aucun agrégateur n'est appelé.
 * Une demande est validée automatiquement quelques secondes après l'envoi ;
 * un numéro qui finit par 0000 simule un paiement refusé. Interdit en production.
 */
class TestGateway implements PaymentGateway
{
    public const DELAY_SECONDS = 5;

    public function name(): string
    {
        return 'test';
    }

    private function guard(): void
    {
        if (app()->isProduction()) {
            throw new PaymentException('Le mode de paiement de test est désactivé en production.');
        }
    }

    public function deposit(array $payment): array
    {
        $this->guard();
        $failed = str_ends_with((string) $payment['phone'], '0000');
        Cache::put('testpay:'.$payment['reference'], [
            'status' => $failed ? 'FAILED' : 'SUCCESS',
            'operator' => $payment['operator'] ?? null,
            'ready_at' => now()->addSeconds(self::DELAY_SECONDS)->timestamp,
        ], now()->addDay());

        return [
            'reference' => $payment['reference'],
            'status' => 'PENDING',
            'operator' => $payment['operator'] ?? null,
            'transaction_id' => 'test_'.$payment['reference'],
            'message' => 'Paiement de test : validé automatiquement dans quelques secondes.',
        ];
    }

    public function depositStatus(string $reference): array
    {
        $this->guard();
        $data = Cache::get('testpay:'.$reference);
        if (! $data) {
            return ['reference' => $reference, 'status' => 'FAILED', 'operator' => null, 'transaction_id' => null, 'message' => 'Paiement de test introuvable.'];
        }
        $status = now()->timestamp >= $data['ready_at'] ? $data['status'] : 'PENDING';

        return ['reference' => $reference, 'status' => $status, 'operator' => $data['operator'], 'transaction_id' => 'test_'.$reference, 'message' => null];
    }

    public function payout(array $payout): array
    {
        $this->guard();

        return ['reference' => $payout['reference'], 'status' => 'SUCCESS', 'operator' => $payout['operator'] ?? null, 'transaction_id' => 'test_'.$payout['reference'], 'message' => 'Virement de test.'];
    }

    public function payoutStatus(string $reference): array
    {
        $this->guard();

        return ['reference' => $reference, 'status' => 'SUCCESS', 'operator' => null, 'transaction_id' => 'test_'.$reference, 'message' => null];
    }
}
