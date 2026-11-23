<?php

namespace App\Console\Commands;

use App\Services\Sales\RecurringBaskets;
use Illuminate\Console\Command;

class RenewRecurringBaskets extends Command
{
    protected $signature = 'baskets:renew';

    protected $description = 'Recrée les paniers de la semaine arrivés à échéance et envoie le lien de paiement';

    public function handle(RecurringBaskets $baskets): int
    {
        $this->info($baskets->renewDue().' panier(s) de la semaine créé(s).');

        return self::SUCCESS;
    }
}
