<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Candidatures au programme pilote (vendeurs qui veulent être accompagnés au lancement).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pilot_applications', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('business_name');
            $table->string('phone_whatsapp', 30);
            $table->string('email')->nullable();
            $table->string('city', 120);
            $table->string('category', 120);
            $table->json('channels')->nullable(); // WhatsApp, Instagram, TikTok, Facebook, boutique physique
            $table->string('monthly_orders', 40)->nullable();
            $table->text('message')->nullable();
            $table->string('status', 20)->default('new'); // new, contacted, onboarded, declined
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pilot_applications');
    }
};
