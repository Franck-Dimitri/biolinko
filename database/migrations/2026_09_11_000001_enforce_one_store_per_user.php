<?php

use App\Models\Store;
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
        // 1. Clean up duplicate stores per user
        $duplicateUserIds = DB::table('stores')
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('user_id');

        foreach ($duplicateUserIds as $userId) {
            $userStores = Store::where('user_id', $userId)
                ->withCount(['products', 'orders'])
                ->orderByDesc('products_count')
                ->orderByDesc('orders_count')
                ->orderByDesc('is_published')
                ->orderByDesc('is_configured')
                ->orderBy('id')
                ->get();

            if ($userStores->count() <= 1) {
                continue;
            }

            // The first one is the keeper based on our ordering priority
            $keeper = $userStores->first();
            $duplicates = $userStores->slice(1);

            foreach ($duplicates as $dup) {
                // Reassign any products or orders to keeper
                DB::table('products')->where('store_id', $dup->id)->update(['store_id' => $keeper->id]);
                DB::table('orders')->where('store_id', $dup->id)->update(['store_id' => $keeper->id]);
                DB::table('smart_links')->where('store_id', $dup->id)->update(['store_id' => $keeper->id]);
                DB::table('store_reviews')->where('store_id', $dup->id)->update(['store_id' => $keeper->id]);

                // Delete associated wallet if empty
                DB::table('wallets')->where('store_id', $dup->id)->delete();

                // Delete the duplicate store
                $dup->delete();
            }
        }

        // 2. Enforce strict 1-to-1 unique constraint at database level
        Schema::table('stores', function (Blueprint $table) {
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropUnique(['user_id']);
        });
    }
};
