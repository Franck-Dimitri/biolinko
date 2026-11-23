<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sections métier : horaires par jour et minimum de commande (restaurants), durée et caractéristiques
 * des produits (services, électronique, santé), rappel la veille et panier de la semaine (alimentation).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->json('opening_schedule')->nullable()->after('opening_hours');
            $table->decimal('min_order_amount', 12, 2)->nullable()->after('delivery_free_from');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedSmallInteger('duration_minutes')->nullable()->after('lead_time_hours');
            $table->json('specs')->nullable()->after('custom_fields');
        });

        Schema::create('recurring_baskets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('first_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('token', 64)->unique();
            $table->string('customer_name');
            $table->string('customer_phone', 30);
            $table->string('customer_whatsapp', 30)->nullable();
            $table->string('customer_email')->nullable();
            $table->string('city')->nullable();
            $table->string('address_details', 600)->nullable();
            $table->json('items');
            $table->string('desired_slot', 20)->nullable();
            $table->timestamp('next_run_at')->index();
            $table->boolean('active')->default(true);
            $table->string('stopped_reason', 40)->nullable();
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->timestamp('reminder_sent_at')->nullable()->after('payment_reminded_at');
            $table->foreignId('recurring_basket_id')->nullable()->after('parent_order_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('recurring_basket_id');
            $table->dropColumn('reminder_sent_at');
        });
        Schema::dropIfExists('recurring_baskets');
        Schema::table('products', fn (Blueprint $t) => $t->dropColumn(['duration_minutes', 'specs']));
        Schema::table('stores', fn (Blueprint $t) => $t->dropColumn(['opening_schedule', 'min_order_amount']));
    }
};
