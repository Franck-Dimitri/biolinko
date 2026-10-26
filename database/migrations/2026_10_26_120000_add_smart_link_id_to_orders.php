<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Lien de paiement à l'origine de la commande : son compteur de ventes n'avance qu'au paiement
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('smart_link_id')->nullable()->after('store_id')->constrained('smart_links')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('smart_link_id');
        });
    }
};
