<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('orders', 'is_manual')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->boolean('is_manual')->default(false)->after('status');
            });
        }

        // Set is_manual = true for existing orders where tracking_code starts with BLK-FAC-
        DB::table('orders')
            ->where('tracking_code', 'like', 'BLK-FAC-%')
            ->update(['is_manual' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('orders', 'is_manual')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('is_manual');
            });
        }
    }
};
