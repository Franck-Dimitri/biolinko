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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->unique();
            $table->string('email')->nullable();
            $table->string('whatsapp')->nullable();
            $table->text('delivery_address')->nullable();
            $table->string('city')->nullable();
            $table->timestamps();
        });

        Schema::create('store_customer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->integer('total_orders_count')->default(1);
            $table->decimal('total_spent', 12, 2)->default(0.00);
            $table->timestamp('last_order_at')->nullable();
            $table->timestamps();

            $table->unique(['store_id', 'customer_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('customer_id')->nullable()->after('store_id')->constrained('customers')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
        });

        Schema::dropIfExists('store_customer');
        Schema::dropIfExists('customers');
    }
};
