<?php

namespace App\Console\Commands;

use App\Payments\Subscriptions\SubscriptionRenewals;
use Illuminate\Console\Command;

class RenewSubscriptions extends Command
{
    protected $signature = 'subscriptions:renew';

    protected $description = 'Prévient avant l’échéance et renouvelle les abonnements par prélèvement sur le portefeuille';

    public function handle(SubscriptionRenewals $renewals): int
    {
        [$reminded, $renewed, $failed] = $renewals->run();
        $this->info("{$reminded} rappel(s), {$renewed} renouvellement(s), {$failed} échec(s) faute de solde.");

        return self::SUCCESS;
    }
}
