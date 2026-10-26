<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Agrégateur et référence de paiement génériques (pawaPay, HR-Skills…)
        foreach (['orders', 'subscriptions', 'withdrawals'] as $table) {
            Schema::table($table, function (Blueprint $t) {
                $t->string('payment_provider', 20)->nullable();
                $t->string('payment_reference', 100)->nullable()->index();
            });
            DB::table($table)->whereNotNull('hrskills_reference')->update([
                'payment_provider' => 'hrskills',
                'payment_reference' => DB::raw('hrskills_reference'),
            ]);
        }

        // Commission Biolinko figée au paiement, selon le plan du vendeur à ce moment-là
        Schema::table('orders', function (Blueprint $t) {
            $t->decimal('commission_rate', 5, 2)->default(0);
            $t->decimal('commission_amount', 12, 2)->default(0);
            $t->string('currency', 3)->default('XAF');
            $t->string('payment_country', 2)->default('CM');
        });

        // Frais de retrait : le vendeur reçoit le montant net
        Schema::table('withdrawals', function (Blueprint $t) {
            $t->decimal('fee', 12, 2)->default(0);
            $t->decimal('net_amount', 12, 2)->nullable();
        });
        DB::table('withdrawals')->update(['net_amount' => DB::raw('amount')]);

        Schema::table('stores', function (Blueprint $t) {
            $t->string('country', 2)->default('CM');
            $t->string('currency', 3)->default('XAF');
        });
    }

    public function down(): void
    {
        Schema::table('stores', fn (Blueprint $t) => $t->dropColumn(['country', 'currency']));
        Schema::table('withdrawals', fn (Blueprint $t) => $t->dropColumn(['fee', 'net_amount']));
        Schema::table('orders', fn (Blueprint $t) => $t->dropColumn(['commission_rate', 'commission_amount', 'currency', 'payment_country']));
        foreach (['orders', 'subscriptions', 'withdrawals'] as $table) {
            Schema::table($table, fn (Blueprint $t) => $t->dropColumn(['payment_provider', 'payment_reference']));
        }
    }
};
