<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Numéro de facture suivi par boutique (ex. F-2026-0007), attribué à l'émission
            $table->string('invoice_number', 30)->nullable()->after('tracking_code');
            $table->timestamp('invoice_issued_at')->nullable()->after('invoice_number');
            $table->date('invoice_due_at')->nullable()->after('invoice_issued_at');
            $table->text('invoice_notes')->nullable()->after('invoice_due_at');

            $table->unique(['store_id', 'invoice_number']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['store_id', 'invoice_number']);
            $table->dropColumn(['invoice_number', 'invoice_issued_at', 'invoice_due_at', 'invoice_notes']);
        });
    }
};
