<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\OrderReport;
use Illuminate\Console\Command;

/**
 * Rend retirables les ventes dont le délai de sécurité est passé, sauf si un signalement est en cours.
 * Un signalement auquel le vendeur a répondu sans réaction du client pendant 3 jours est clos et libéré.
 */
class ReleaseHeldFunds extends Command
{
    protected $signature = 'funds:release';

    protected $description = 'Libère l’argent des ventes à la fin du délai de sécurité';

    public function handle(): int
    {
        $closed = OrderReport::where('status', 'answered')
            ->where('seller_responded_at', '<=', now()->subDays(OrderReport::CUSTOMER_REPLY_DAYS))
            ->get();
        foreach ($closed as $report) {
            $report->update(['status' => 'released', 'closed_at' => now()]);
        }

        $released = 0;
        Order::where('payment_status', 'paid')
            ->whereNull('funds_released_at')
            ->where('funds_release_at', '<=', now())
            ->whereDoesntHave('report', fn ($q) => $q->whereIn('status', ['open', 'answered']))
            ->chunkById(200, function ($orders) use (&$released) {
                foreach ($orders as $order) {
                    $released += (int) $order->releaseFunds();
                }
            });

        $this->info("{$released} vente(s) libérée(s), {$closed->count()} signalement(s) clos sans réponse du client.");

        return self::SUCCESS;
    }
}
