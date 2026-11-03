<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Acompte : % payé en ligne à la commande, le solde est réglé au livreur (null = paiement complet uniquement)
        Schema::table('stores', function (Blueprint $table) {
            $table->unsignedTinyInteger('deposit_percent')->nullable();
        });

        // price_vendor reste le montant total de la vente ; balance_due = part réglée en espèces à la livraison
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('balance_due', 12, 2)->default(0);
            $table->dateTime('balance_collected_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', fn (Blueprint $t) => $t->dropColumn(['balance_due', 'balance_collected_at']));
        Schema::table('stores', fn (Blueprint $t) => $t->dropColumn('deposit_percent'));
    }
};
