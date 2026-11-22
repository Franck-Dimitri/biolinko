<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Protection de l'acheteur : l'argent d'une vente n'est libéré qu'après la livraison
 * (confirmation du client, ou quelques jours après « livrée » sans signalement).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('delivered_at')->nullable()->after('funds_released_at');
            $table->timestamp('received_confirmed_at')->nullable()->after('delivered_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', fn (Blueprint $t) => $t->dropColumn(['delivered_at', 'received_confirmed_at']));
    }
};
