<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Signalement d'une boutique par un visiteur (fausse boutique, arnaque, produit interdit…). */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('reason', 30);
            $table->text('message');
            $table->string('contact', 120)->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->string('status', 20)->default('open')->index();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_reports');
    }
};
