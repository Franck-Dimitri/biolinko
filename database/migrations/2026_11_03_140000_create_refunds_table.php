<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Remboursement = virement Mobile Money vers le numéro qui a payé (Mercy Pay n'a pas d'API de remboursement)
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('initiated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount', 12, 2);              // envoyé au client
            $table->decimal('commission_refunded', 12, 2); // part de commission rendue au vendeur
            $table->decimal('seller_debit', 12, 2);        // retiré du portefeuille du vendeur
            $table->string('wallet_bucket', 20);           // balance_held | balance_available
            $table->string('previous_status', 20)->nullable();
            $table->string('reason', 500);
            $table->string('phone', 30);
            $table->string('operator', 30)->nullable();
            $table->string('status', 20)->default('processing'); // processing | completed | failed
            $table->string('payment_provider', 30)->nullable();
            $table->string('payment_reference')->nullable()->index();
            $table->string('transaction_id')->nullable();
            $table->dateTime('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('refunded_amount', 12, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('orders', fn (Blueprint $t) => $t->dropColumn('refunded_amount'));
        Schema::dropIfExists('refunds');
    }
};
