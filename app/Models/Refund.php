<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class Refund extends Model
{
    protected $fillable = ['order_id', 'initiated_by', 'amount', 'commission_refunded', 'seller_debit', 'wallet_bucket', 'previous_status', 'reason',
        'phone', 'operator', 'status', 'payment_provider', 'payment_reference', 'transaction_id', 'processed_at'];

    protected $casts = ['amount' => 'decimal:2', 'commission_refunded' => 'decimal:2', 'seller_debit' => 'decimal:2', 'processed_at' => 'datetime'];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Résultat du virement, une seule fois. Échec : la commande et le portefeuille reviennent à leur état d'avant.
     */
    public function settle(bool $success, ?string $transactionId = null): bool
    {
        return DB::transaction(function () use ($success, $transactionId) {
            $r = static::whereKey($this->id)->lockForUpdate()->first();
            if (! $r || $r->status !== 'processing') {
                return false;
            }

            $r->update(['status' => $success ? 'completed' : 'failed', 'transaction_id' => $transactionId, 'processed_at' => now()]);

            if (! $success) {
                $order = Order::whereKey($r->order_id)->lockForUpdate()->first();
                $order->update(array_filter([
                    'refunded_amount' => max(0, (float) $order->refunded_amount - (float) $r->amount),
                    'commission_amount' => (float) $order->commission_amount + (float) $r->commission_refunded,
                    'payment_status' => $order->payment_status === 'refunded' ? 'paid' : null,
                    'status' => $order->payment_status === 'refunded' ? ($r->previous_status ?: 'paid') : null,
                ], fn ($v) => $v !== null));

                if ($wallet = Wallet::where('store_id', $order->store_id)->lockForUpdate()->first()) {
                    $wallet->increment($r->wallet_bucket, (float) $r->seller_debit);
                }
            }

            return true;
        });
    }
}
