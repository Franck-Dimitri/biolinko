<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Anciennes adresses des boutiques : quand un vendeur change d'adresse, l'ancienne redirige
 * vers la nouvelle (liens déjà partagés) et reste réservée à sa boutique.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_slug_redirects', function (Blueprint $table) {
            $table->id();
            $table->string('old_slug', 60)->unique();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_slug_redirects');
    }
};
