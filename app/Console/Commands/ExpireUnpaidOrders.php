<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;

/**
 * Annule les commandes restées sans paiement : elles encombrent la liste du vendeur et faussent ses chiffres.
 * Un paiement confirmé plus tard par l'opérateur reste accepté (Order::markAsPaid ne regarde que « payé »).
 */
class ExpireUnpaidOrders extends Command
{
    protected $signature = 'orders:expire-unpaid {--hours=24 : Délai avant annulation}';

    protected $description = 'Annule les commandes en attente de paiement depuis trop longtemps';

    public function handle(): int
    {
        $count = Order::where('payment_status', 'pending')
            ->where('status', 'pending')
            ->where(fn ($q) => $q->where('is_manual', false)->orWhereNull('is_manual')) // une facture manuelle peut être réglée plus tard
            ->where('created_at', '<', now()->subHours((int) $this->option('hours')))
            ->update(['status' => 'cancelled', 'payment_status' => 'failed']);

        $this->info("{$count} commande(s) non payée(s) annulée(s).");

        return self::SUCCESS;
    }
}
