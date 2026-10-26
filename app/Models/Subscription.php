<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_provider',
        'payment_reference',
        'user_id',
        'plan',
        'billing_cycle',
        'amount',
        'hrskills_reference',
        'hrskills_transaction_id',
        'payment_status',
        'payment_phone',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Marque l'abonnement payé et prolonge le plan, une seule fois même si plusieurs contrôles arrivent en même temps.
     * Renvoie false si l'abonnement était déjà activé.
     */
    public function activate(): bool
    {
        return DB::transaction(function () {
            $sub = static::whereKey($this->id)->lockForUpdate()->first();
            if (! $sub || $sub->payment_status === 'paid') {
                return false;
            }

            $sub->update(['payment_status' => 'paid']);

            $user = User::whereKey($sub->user_id)->lockForUpdate()->first();
            $months = (int) ($sub->billing_cycle ?: 1);

            // Même plan encore actif : on prolonge depuis l'échéance. Autre plan : on repart d'aujourd'hui
            // et les jours restants de l'ancien plan sont convertis en jours offerts (User::planConversionDays)
            $samePlanActive = $user->plan === $sub->plan && $user->subscription_expires_at && $user->subscription_expires_at->isFuture();
            $from = $samePlanActive ? $user->subscription_expires_at : now();
            $bonusDays = $samePlanActive ? 0 : $user->planConversionDays($sub->plan);

            $user->update([
                'plan' => $sub->plan,
                'subscription_expires_at' => $from->copy()->addMonths($months)->addDays($bonusDays),
            ]);

            return true;
        });
    }
}
