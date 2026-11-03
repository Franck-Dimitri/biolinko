<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // Les paiements d'abonnement simulés (référence SIM-…) ne sont pas de vrais encaissements
    public function up(): void
    {
        DB::table('subscriptions')->where('payment_reference', 'like', 'SIM-%')->update(['payment_provider' => 'simulation']);
    }

    public function down(): void
    {
    }
};
