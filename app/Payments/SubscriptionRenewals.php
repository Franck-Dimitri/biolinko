<?php

namespace App\Payments;

use App\Mail\SubscriptionRenewalMail;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Paiement d'un abonnement avec le solde du portefeuille (manuel ou renouvellement automatique à l'échéance).
 */
class SubscriptionRenewals
{
    /** Rappels avant l'échéance (jours) ; le prélèvement a lieu le jour J. */
    public const REMIND_STAGES = [7, 4, 2];

    /** Après l'échéance, on retente le prélèvement pendant ce délai (le temps que des ventes arrivent). */
    public const RETRY_DAYS = 3;

    public static function cyclePrice(string $plan, int $months): int
    {
        $rate = match ($months) { 12 => 0.15, 24 => 0.20, default => 0.0 };

        return (int) round(User::planPrice($plan) * $months * (1 - $rate));
    }

    public static function balance(User $user): float
    {
        return (float) (Wallet::where('store_id', $user->store?->id)->value('balance_available') ?? 0);
    }

    /**
     * Débite le solde disponible et active l'abonnement, sous verrou (pas de double prélèvement, pas de solde négatif).
     *
     * @throws PaymentException
     */
    public function payWithWallet(User $user, string $plan, int $months = 1): Subscription
    {
        $amount = static::cyclePrice($plan, $months);
        if ($amount <= 0) {
            throw new PaymentException('Ce plan est gratuit.');
        }

        $subscription = DB::transaction(function () use ($user, $plan, $months, $amount) {
            $wallet = Wallet::where('store_id', $user->store?->id)->lockForUpdate()->first();
            if (! $wallet || (float) $wallet->balance_available < $amount) {
                throw new PaymentException('Solde insuffisant : il faut '.number_format($amount, 0, ',', ' ').' FCFA disponibles, vous avez '
                    .number_format((float) ($wallet->balance_available ?? 0), 0, ',', ' ').' FCFA. Payez par Mobile Money.');
            }
            $wallet->update(['balance_available' => (float) $wallet->balance_available - $amount]);

            return Subscription::create([
                'user_id' => $user->id, 'plan' => $plan, 'billing_cycle' => $months, 'amount' => $amount,
                'payment_status' => 'pending', 'payment_provider' => 'wallet', 'payment_reference' => 'WAL-'.Str::upper(Str::random(12)),
                'starts_at' => now(), 'ends_at' => now()->addMonths($months),
            ]);
        });

        $subscription->activate();
        $user->store?->update(['plan_type' => $plan]);

        return $subscription->fresh();
    }

    /**
     * Tâche planifiée : rappel avant l'échéance, puis prélèvement automatique à l'échéance.
     * Renvoie [rappels, renouvellements, échecs].
     */
    public function run(): array
    {
        $counts = [0, 0, 0];

        // 1. Rappels à J-7, J-4 et J-2 : un seul e-mail par étape et par échéance
        User::whereNotIn('plan', ['starter'])->whereNotNull('subscription_expires_at')
            ->whereBetween('subscription_expires_at', [now()->addHour(), now()->addDays(max(static::REMIND_STAGES))])
            ->each(function (User $u) use (&$counts) {
                $stage = static::stageFor($u->subscription_expires_at);
                $sameDue = $u->renewal_reminded_for && $u->renewal_reminded_for->equalTo($u->subscription_expires_at);
                if ($stage === null || ($sameDue && $u->renewal_reminder_stage !== null && $u->renewal_reminder_stage <= $stage)) {
                    return;
                }
                $this->mail($u, 'upcoming', static::cyclePrice($u->plan, 1), $stage);
                $u->update(['renewal_reminded_for' => $u->subscription_expires_at, 'renewal_reminder_stage' => $stage]);
                $counts[0]++;
            });

        // 2. Échéance atteinte : prélèvement d'un mois si le vendeur l'a laissé activé
        User::whereNotIn('plan', ['starter'])->where('auto_renew', true)->whereNotNull('subscription_expires_at')
            ->whereBetween('subscription_expires_at', [now()->subDays(static::RETRY_DAYS), now()->addHour()])
            ->each(function (User $u) use (&$counts) {
                $due = $u->subscription_expires_at;
                try {
                    $sub = $this->payWithWallet($u, $u->plan, 1);
                    $this->mail($u->fresh(), 'renewed', (float) $sub->amount);
                    $counts[1]++;
                } catch (PaymentException $e) {
                    if (! $u->renewal_failed_for || ! $u->renewal_failed_for->equalTo($due)) {
                        $this->mail($u, 'failed', static::cyclePrice($u->plan, 1));
                        $u->update(['renewal_failed_for' => $due]);
                        $counts[2]++;
                    }
                }
            });

        return $counts;
    }

    /** Étape de rappel atteinte : la plus proche de l'échéance parmi 7, 4 et 2 jours (null si plus de 7 jours). */
    public static function stageFor(\DateTimeInterface $due): ?int
    {
        $daysLeft = now()->diffInHours($due, false) / 24;
        $reached = array_filter(static::REMIND_STAGES, fn ($s) => $daysLeft <= $s);

        return $reached ? min($reached) : null;
    }

    private function mail(User $user, string $type, float $amount, ?int $daysLeft = null): void
    {
        try {
            Mail::to($user->email)->send(new SubscriptionRenewalMail($user, $type, $amount, static::balance($user), $daysLeft));
        } catch (\Throwable $e) {
            Log::warning('Subscription renewal mail failed', ['user_id' => $user->id, 'err' => $e->getMessage()]);
        }
    }
}
