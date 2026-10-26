<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\Subscription;
use App\Models\Withdrawal;
use App\Payments\OrderPayments;
use App\Payments\PaymentManager;
use App\Payments\SubscriptionPayments;
use Illuminate\Console\Command;

/**
 * Filet de sécurité : interroge l'agrégateur pour les paiements et virements restés en attente,
 * au cas où une notification se serait perdue.
 */
class SyncPayments extends Command
{
    protected $signature = 'payments:sync';

    protected $description = 'Met à jour les paiements et virements en attente auprès de l’agrégateur';

    public function handle(OrderPayments $orders, SubscriptionPayments $subscriptions, PaymentManager $payments): int
    {
        $window = [now()->subDay(), now()->subMinutes(2)];
        $done = 0;

        Order::where('payment_status', 'pending')->whereNotNull('payment_reference')->whereBetween('updated_at', $window)
            ->each(function (Order $o) use ($orders, &$done) { $done += (int) ($orders->refresh($o) !== 'PENDING'); });

        Subscription::where('payment_status', 'pending')->whereNotNull('payment_reference')->where('payment_provider', '!=', 'simulation')
            ->whereBetween('updated_at', $window)
            ->each(function (Subscription $s) use ($subscriptions, &$done) { $done += (int) ($subscriptions->refresh($s) !== 'PENDING'); });

        Withdrawal::where('status', 'processing')->whereNotNull('payment_reference')->where('updated_at', '<', now()->subMinutes(2))
            ->each(function (Withdrawal $w) use ($payments, &$done) {
                $status = $payments->driver($w->payment_provider)->payoutStatus($w->payment_reference);
                if ($status['status'] !== 'PENDING') {
                    $done += (int) $w->settle($status['status'] === 'SUCCESS', $status['transaction_id'] ?? null);
                }
            });

        $this->info("{$done} opération(s) mise(s) à jour.");

        return self::SUCCESS;
    }
}
