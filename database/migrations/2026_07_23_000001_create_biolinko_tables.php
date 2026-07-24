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
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_configured')->default(false);
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->text('about_text')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('banner_url')->nullable();
            $table->string('theme_color')->default('#FFCC00');
            $table->string('plan_type')->default('starter');
            $table->string('phone_whatsapp')->nullable();
            $table->string('city_location')->nullable();
            $table->string('opening_hours')->nullable();
            $table->string('announcement_header')->nullable();
            $table->string('instagram_link')->nullable();
            $table->string('tiktok_link')->nullable();
            $table->string('facebook_link')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->decimal('price_vendor', 12, 2);
            
            // Promotion & Discount fields
            $table->boolean('is_promo')->default(false);
            $table->decimal('promo_price', 12, 2)->nullable();
            $table->date('promo_start_at')->nullable();
            $table->date('promo_end_at')->nullable();

            // MOQ Minimum Order Quantity
            $table->integer('min_order_quantity')->default(1);

            $table->string('image_url')->nullable();
            $table->json('images')->nullable(); // Up to 5 images list
            $table->integer('stock')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['store_id', 'slug']);
        });

        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('size')->nullable();
            $table->string('color')->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->timestamps();
        });

        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->decimal('balance_available', 12, 2)->default(0.00);
            $table->decimal('balance_pending', 12, 2)->default(0.00);
            $table->decimal('total_withdrawn', 12, 2)->default(0.00);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('tracking_code')->unique();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->string('city');
            $table->text('address_details')->nullable();
            $table->decimal('price_vendor', 12, 2);
            $table->decimal('saas_margin', 12, 2);
            $table->decimal('api_fee', 12, 2);
            $table->decimal('total_client', 12, 2);
            $table->string('status')->default('pending');
            $table->string('payment_status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->onDelete('set null');
            $table->string('product_title');
            $table->string('variant_label')->nullable();
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price_vendor', 12, 2);
            $table->decimal('total_price_vendor', 12, 2);
            $table->timestamps();
        });

        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('operator');
            $table->string('phone_number');
            $table->string('status')->default('pending');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('stores');
    }
};
