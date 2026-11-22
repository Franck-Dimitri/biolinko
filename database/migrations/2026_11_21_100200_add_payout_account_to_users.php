<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Numéro de retrait enregistré une fois : les retraits partent uniquement vers lui.
 * Un changement ne prend effet qu'après un délai, pour qu'un compte volé ne puisse pas vider le solde.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('payout_phone', 30)->nullable()->after('pilot_bonus_months');
            $table->string('payout_operator', 20)->nullable()->after('payout_phone');
            $table->string('payout_name')->nullable()->after('payout_operator');
            $table->string('payout_pending_phone', 30)->nullable()->after('payout_name');
            $table->string('payout_pending_operator', 20)->nullable()->after('payout_pending_phone');
            $table->string('payout_pending_name')->nullable()->after('payout_pending_operator');
            $table->timestamp('payout_pending_effective_at')->nullable()->after('payout_pending_name');
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn([
            'payout_phone', 'payout_operator', 'payout_name',
            'payout_pending_phone', 'payout_pending_operator', 'payout_pending_name', 'payout_pending_effective_at',
        ]));
    }
};
