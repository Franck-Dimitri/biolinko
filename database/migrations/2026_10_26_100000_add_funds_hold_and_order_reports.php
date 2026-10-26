<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Ventes payées mais pas encore retirables (délai de sécurité de 2 ou 4 jours)
        Schema::table('wallets', function (Blueprint $table) {
            $table->decimal('balance_held', 12, 2)->default(0)->after('balance_pending');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('funds_release_at')->nullable()->after('paid_at');
            $table->timestamp('funds_released_at')->nullable()->after('funds_release_at');
        });

        // Les ventes déjà payées ont été créditées directement dans le solde disponible
        DB::table('orders')->where('payment_status', 'paid')->update([
            'funds_release_at' => DB::raw('paid_at'),
            'funds_released_at' => DB::raw('COALESCE(paid_at, updated_at)'),
        ]);

        Schema::create('order_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('customer_phone', 30)->index();
            $table->string('reason', 30); // not_received | not_conform | other
            $table->text('message');
            $table->string('status', 20)->default('open'); // open | answered | resolved | released
            $table->text('seller_response')->nullable();
            $table->timestamp('seller_responded_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_reports');
        Schema::table('orders', fn (Blueprint $t) => $t->dropColumn(['funds_release_at', 'funds_released_at']));
        Schema::table('wallets', fn (Blueprint $t) => $t->dropColumn('balance_held'));
    }
};
