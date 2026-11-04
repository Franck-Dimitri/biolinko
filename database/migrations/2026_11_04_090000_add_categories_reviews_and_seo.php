<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('category', 60)->nullable()->index();
            $table->string('seo_title', 70)->nullable();
            $table->string('seo_description', 170)->nullable();
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->string('seo_title', 70)->nullable();
            $table->string('seo_description', 170)->nullable();
        });

        // Avis rattaché à un produit (null = avis sur la boutique)
        Schema::table('store_reviews', function (Blueprint $table) {
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('store_reviews', fn (Blueprint $t) => $t->dropConstrainedForeignId('product_id'));
        Schema::table('stores', fn (Blueprint $t) => $t->dropColumn(['seo_title', 'seo_description']));
        Schema::table('products', function (Blueprint $t) {
            $t->dropIndex(['category']);
            $t->dropColumn(['category', 'seo_title', 'seo_description']);
        });
    }
};
