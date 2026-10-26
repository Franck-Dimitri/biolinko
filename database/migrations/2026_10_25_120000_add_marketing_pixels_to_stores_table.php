<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            // Identifiants des outils de mesure publicitaire du vendeur (plan Pro et plus)
            $table->string('facebook_pixel_id', 100)->nullable();
            $table->string('tiktok_pixel_id', 100)->nullable();
            $table->string('google_analytics_id', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn(['facebook_pixel_id', 'tiktok_pixel_id', 'google_analytics_id']);
        });
    }
};
