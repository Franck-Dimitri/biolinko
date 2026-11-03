<?php

namespace App\Payments;

use App\Models\Order;
use App\Models\Refund;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Remboursement d'une commande payée en ligne : virement Mobile Money vers le numéro qui a payé.
 * Montant remboursable = part payée en ligne pour le vendeur (hors frais de service, hors solde d'acompte).
 * La commission est rendue au prorata ; le vendeur est débité du reste, d'abord sur l'argent en attente de la vente.
 */
class OrderRefunds
{
    public function __construct(private PaymentManager $payments)
    {
    }

    public static function refundable(Order $order): float
    {
        if ($order->payment_status !== 'paid' || $order->is_manual) {
            return 0;
        }

        return max(0, (float) $order->price_vendor - (float) $order->balance_due - (float) $order->refunded_amount);
    }

    /**
     * @throws PaymentException
     */
    public function refund(Order $order, float $amount, string $reason, ?User $by = null): Refund
    {
        $refund = DB::transaction(function () use ($order, $amount, $reason, $by) {
            $o = Order::whereKey($order->id)->lockForUpdate()->first();
            $refundable = static::refundable($o);
            $amount = round($amount);

            if ($amount < 1 || $amount > $refundable) {
                throw new PaymentException($refundable > 0
                    ? 'Le montant remboursable est de '.number_format($refundable, 0, ',', ' ').' FCFA au maximum.'
                    : 'Cette commande ne peut pas être remboursée en ligne.');
            }
            if (Refund::where('order_id', $o->id)->where('status', 'processing')->exists()) {
                throw new PaymentException('Un remboursement est déjà en cours pour cette commande.');
            }

            // Commission rendue au prorata de la part en ligne remboursée
            $onlinePart = max(1, (float) $o->price_vendor - (float) $o->balance_due - (float) $o->refunded_amount);
            $commissionBack = round((float) $o->commission_amount * $amount / $onlinePart);
            $debit = max(0, $amount - $commissionBack);

            $wallet = Wallet::where('store_id', $o->store_id)->lockForUpdate()->first();
            $bucket = $o->funds_released_at ? 'balance_available' : 'balance_held';
            if (! $wallet || (float) $wallet->{$bucket} < $debit) {
                throw new PaymentException('Solde insuffisant sur le portefeuille pour ce remboursement ('.number_format($debit, 0, ',', ' ').' FCFA nécessaires).');
            }
            $wallet->update([$bucket => (float) $wallet->{$bucket} - $debit]);

            $full = $amount >= $refundable;
            $previous = $o->status;
            $o->update(array_filter([
                'refunded_amount' => (float) $o->refunded_amount + $amount,
                'commission_amount' => max(0, (float) $o->commission_amount - $commissionBack),
                'payment_status' => $full ? 'refunded' : null,
                'status' => $full ? 'cancelled' : null,
            ], fn ($v) => $v !== null));

            // Remboursement total : un signalement ouvert est clos
            if ($full && $o->report && $o->report->isOpen()) {
                $o->report->update(['status' => 'refunded', 'closed_at' => now()]);
            }

            return Refund::create([
                'order_id' => $o->id, 'initiated_by' => $by?->id, 'amount' => $amount, 'commission_refunded' => $commissionBack,
                'seller_debit' => $debit, 'wallet_bucket' => $bucket, 'previous_status' => $previous, 'reason' => $reason,
                'phone' => $o->payment_phone ?: $o->customer_phone, 'operator' => $o->payment_operator, 'status' => 'processing',
                'payment_reference' => (string) Str::uuid(),
            ]);
        });

        // Virement hors transaction : la référence est déjà enregistrée, l'opération reste retrouvable
        $gateway = $this->payments->payoutDriver();
        $refund->update(['payment_provider' => $gateway->name()]);
        $country = $order->payment_country ?: 'CM';

        try {
            $result = $gateway->payout([
                'reference' => $refund->payment_reference,
                'amount' => (int) $refund->amount,
                'currency' => $order->currency ?: 'XAF',
                'country' => $country,
                'phone' => Countries::formatPhone($country, $refund->phone),
                'operator' => $refund->operator ?: Countries::detectOperator($country, $refund->phone),
                'description' => 'Remboursement '.$order->tracking_code,
                'client_reference' => 'REMB-'.$refund->id,
                'metadata' => ['refund' => (string) $refund->id, 'order' => $order->tracking_code],
            ]);
            if ($result['reference'] !== $refund->payment_reference) {
                $refund->update(['payment_reference' => $result['reference']]);
            }
            if (($result['status'] ?? 'PENDING') !== 'PENDING') {
                $refund->settle($result['status'] === 'SUCCESS', $result['transaction_id'] ?? null);
            }
        } catch (\Throwable $e) {
            Log::error('Refund payout failed', ['refund_id' => $refund->id, 'err' => $e->getMessage()]);
            $refund->settle(false);

            throw new PaymentException('Le virement de remboursement n’a pas pu être envoyé : '.$e->getMessage());
        }

        return $refund->fresh();
    }
}
