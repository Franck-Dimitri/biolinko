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
            $table->string('logo_url')->nullable();
            $table->string('banner_url')->nullable();
            $table->string('theme_color')->default('#7C3AED'); // Purple default
            $table->string('plan_type')->default('starter'); // starter, premium, pro, growth
            $table->string('phone_whatsapp')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->decimal('price_vendor', 12, 2);
            $table->string('image_url')->nullable();
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

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('tracking_code')->unique(); // e.g. BLK-892471
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->string('city');
            $table->string('address_details')->nullable();
            $table->decimal('price_vendor', 12, 2)->default(0);
            $table->decimal('saas_margin', 12, 2)->default(0);
            $table->decimal('api_fee', 12, 2)->default(0);
            $table->decimal('total_client', 12, 2)->default(0);
            $table->string('status')->default('pending'); // pending, paid, processing, shipping, delivered, cancelled
            $table->string('payment_status')->default('pending'); // pending, paid, failed, abandoned
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->onDelete('set null');
            $table->string('product_title');
            $table->string('variant_label')->nullable(); // e.g. "XL / Rouge"
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price_vendor', 12, 2);
            $table->decimal('total_price_vendor', 12, 2);
            $table->timestamps();
        });

        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->decimal('balance_available', 12, 2)->default(0);
            $table->decimal('balance_pending', 12, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->onDelete('cascade');
            $table->decimal('amount_requested', 12, 2);
            $table->decimal('fee_api', 12, 2); // 1% HR-PAY
            $table->decimal('fee_saas', 12, 2); // 1% BIOLINKO
            $table->decimal('net_transferred', 12, 2); // 98%
            $table->string('phone_momo');
            $table->string('status')->default('pending'); // pending, approved, paid, rejected
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('withdrawals');
        Schema::dropIfExists('wallets');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
        Schema::dropIfExists('stores');
    }
};
