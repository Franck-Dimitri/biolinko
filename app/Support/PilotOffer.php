<?php

namespace App\Support;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Offre du programme pilote : formule Growth offerte 1 mois, puis prolongée d'un mois à chaque palier
 * de commandes payées dans l'app (STEP), jusqu'à 1 + MAX_BONUS mois au total.
 * La prolongation n'a lieu que si l'offre est encore en cours (Growth actif) : un vendeur qui n'a pas
 * atteint le palier à l'échéance repasse au Starter, sans prélèvement (plan offert, voir User::grantPlan).
 */
class PilotOffer
{
    public const PLAN = 'growth';

    public const STEP = 10;

    public const MAX_BONUS = 2;

    public static function start(User $user): void
    {
        $user->grantPlan(static::PLAN, 1);
        $user->forceFill(['pilot_started_at' => now(), 'pilot_bonus_months' => 0])->save();
    }

    /** Commandes payées en ligne depuis le début de l'offre. */
    public static function paidSales(User $user): int
    {
        if (! $user->pilot_started_at || ! $user->store) {
            return 0;
        }

        return Order::where('store_id', $user->store->id)->where('payment_status', 'paid')
            ->where(fn ($q) => $q->where('is_manual', false)->orWhereNull('is_manual'))
            ->where('paid_at', '>=', $user->pilot_started_at)->count();
    }

    public static function isActive(User $user): bool
    {
        return (bool) $user->pilot_started_at && $user->plan === static::PLAN && $user->subscription_expires_at?->isFuture();
    }

    /** Progression affichée au vendeur, ou null s'il n'a pas l'offre en cours. */
    public static function progress(User $user): ?array
    {
        if (! static::isActive($user)) {
            return null;
        }

        $bonus = (int) $user->pilot_bonus_months;

        return [
            'paid' => static::paidSales($user),
            'target' => $bonus < static::MAX_BONUS ? ($bonus + 1) * static::STEP : null,
            'step' => static::STEP,
            'months_earned' => 1 + $bonus,
            'months_max' => 1 + static::MAX_BONUS,
            'ends_at' => $user->subscription_expires_at?->toDateString(),
        ];
    }

    /** Appelé après chaque paiement validé : prolonge l'offre d'un mois si le palier suivant est atteint. */
    public static function recordSale(Order $order): void
    {
        $user = $order->store?->user;
        if (! $user || ! static::isActive($user) || $order->is_manual) {
            return;
        }

        DB::transaction(function () use ($user) {
            $u = User::whereKey($user->id)->lockForUpdate()->first();
            $bonus = (int) $u->pilot_bonus_months;
            if ($bonus >= static::MAX_BONUS || static::paidSales($u) < ($bonus + 1) * static::STEP) {
                return;
            }

            $u->grantPlan(static::PLAN, 1); // même plan encore actif : le mois s'ajoute à l'échéance
            $u->forceFill(['pilot_bonus_months' => $bonus + 1])->save();
        });
    }
}
