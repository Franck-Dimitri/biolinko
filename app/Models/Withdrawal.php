<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_provider',
        'payment_reference',
        'fee',
        'net_amount',
        'wallet_id',
        'amount',
        'operator',
        'phone_number',
        'status',
        'hrskills_reference',
        'hrskills_transaction_id',
        'payment_operator',
        'processed_at',
    ];

    protected $casts = [
        'fee' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    /** Frais de retrait (config payments.withdrawal_fee_percent), arrondis à l'unité supérieure. */
    public static function feeFor(float $amount): float
    {
        return ceil($amount * config('payments.withdrawal_fee_percent') / 100);
    }

    /**
     * Résultat final du virement (agrégateur) : payé, ou échoué et remboursé sur le solde disponible.
     * Une seule fois, verrouillé.
     */
    public function settle(bool $success, ?string $transactionId = null): bool
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($success, $transactionId) {
            $w = static::whereKey($this->id)->lockForUpdate()->first();
            if (! $w || in_array($w->status, ['completed', 'rejected'], true)) {
                return false;
            }

            $w->update([
                'status' => $success ? 'completed' : 'rejected',
                'processed_at' => now(),
                'hrskills_transaction_id' => $transactionId ?? $w->hrskills_transaction_id,
            ]);

            if ($wallet = Wallet::whereKey($w->wallet_id)->lockForUpdate()->first()) {
                $amount = (float) $w->amount;
                $wallet->update(array_filter([
                    'balance_pending' => max(0, (float) $wallet->balance_pending - $amount),
                    // Virement échoué : le vendeur récupère la totalité, frais compris
                    'balance_available' => $success ? null : (float) $wallet->balance_available + $amount,
                ], fn ($v) => $v !== null));
            }

            return true;
        });
    }
}
