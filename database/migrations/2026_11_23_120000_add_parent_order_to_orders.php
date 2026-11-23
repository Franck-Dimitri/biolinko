<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ajout après paiement : le client ajoute un article à une commande déjà payée, livré avec elle sans frais
 * de livraison. L'ajout est une petite commande liée (paiement, argent bloqué, facture et protections habituels).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('parent_order_id')->nullable()->after('smart_link_id')->constrained('orders')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_order_id');
        });
    }
};
