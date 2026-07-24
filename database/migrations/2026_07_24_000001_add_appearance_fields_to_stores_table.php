<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            if (!Schema::hasColumn('stores', 'hero_badge_text')) {
                $table->string('hero_badge_text')->nullable()->default('PROMOTIONS & TENDANCES');
            }
            if (!Schema::hasColumn('stores', 'hero_title')) {
                $table->string('hero_title')->nullable()->default('Découvrez nos Produits d\'Exception');
            }
            if (!Schema::hasColumn('stores', 'hero_subtitle')) {
                $table->text('hero_subtitle')->nullable();
            }
            if (!Schema::hasColumn('stores', 'hero_cta_text')) {
                $table->string('hero_cta_text')->nullable()->default('Acheter Maintenant');
            }
            if (!Schema::hasColumn('stores', 'benefits_json')) {
                $table->json('benefits_json')->nullable();
            }
            if (!Schema::hasColumn('stores', 'location_address')) {
                $table->string('location_address')->nullable();
            }
            if (!Schema::hasColumn('stores', 'support_email')) {
                $table->string('support_email')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'hero_badge_text',
                'hero_title',
                'hero_subtitle',
                'hero_cta_text',
                'benefits_json',
                'location_address',
                'support_email',
            ]);
        });
    }
};
