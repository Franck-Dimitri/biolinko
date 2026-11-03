<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Livraison : zones [{name, fee}], tarif des autres villes (null = non livrées), livraison offerte dès X
        Schema::table('stores', function (Blueprint $table) {
            $table->json('delivery_zones')->nullable();
            $table->decimal('delivery_other_fee', 12, 2)->nullable();
            $table->decimal('delivery_free_from', 12, 2)->nullable();
        });

        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('code', 30);
            $table->enum('type', ['percent', 'fixed']);
            $table->decimal('value', 12, 2);
            $table->decimal('min_subtotal', 12, 2)->nullable();
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->dateTime('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['store_id', 'code']);
        });

        // Détail du montant vendeur : price_vendor = subtotal - discount_amount + delivery_fee
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('subtotal', 12, 2)->nullable();
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->foreignId('promo_code_id')->nullable()->constrained()->nullOnDelete();
            $table->string('promo_code', 30)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('promo_code_id');
            $table->dropColumn(['subtotal', 'discount_amount', 'delivery_fee', 'promo_code']);
        });
        Schema::dropIfExists('promo_codes');
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn(['delivery_zones', 'delivery_other_fee', 'delivery_free_from']);
        });
    }
};
