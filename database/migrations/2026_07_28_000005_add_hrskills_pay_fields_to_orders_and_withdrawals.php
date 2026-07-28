<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'hrskills_reference')) {
                $table->string('hrskills_reference')->nullable()->after('status');
            }
            if (!Schema::hasColumn('orders', 'hrskills_transaction_id')) {
                $table->string('hrskills_transaction_id')->nullable()->after('hrskills_reference');
            }
            if (!Schema::hasColumn('orders', 'payment_status')) {
                $table->string('payment_status')->default('pending')->after('hrskills_transaction_id');
            }
            if (!Schema::hasColumn('orders', 'payment_operator')) {
                $table->string('payment_operator')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('orders', 'payment_phone')) {
                $table->string('payment_phone')->nullable()->after('payment_operator');
            }
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            if (!Schema::hasColumn('withdrawals', 'hrskills_reference')) {
                $table->string('hrskills_reference')->nullable()->after('status');
            }
            if (!Schema::hasColumn('withdrawals', 'hrskills_transaction_id')) {
                $table->string('hrskills_transaction_id')->nullable()->after('hrskills_reference');
            }
            if (!Schema::hasColumn('withdrawals', 'payment_operator')) {
                $table->string('payment_operator')->nullable()->after('hrskills_transaction_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'hrskills_reference',
                'hrskills_transaction_id',
                'payment_status',
                'payment_operator',
                'payment_phone',
            ]);
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropColumn([
                'hrskills_reference',
                'hrskills_transaction_id',
                'payment_operator',
            ]);
        });
    }
};
