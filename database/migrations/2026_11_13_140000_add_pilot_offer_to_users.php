<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Offre du programme pilote : Growth offert 1 mois, prolongé d'un mois par palier de ventes payées dans l'app.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('pilot_started_at')->nullable()->after('auto_renew');
            $table->unsignedTinyInteger('pilot_bonus_months')->default(0)->after('pilot_started_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['pilot_started_at', 'pilot_bonus_months']));
    }
};
