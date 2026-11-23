<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Historique des vitrines publiées : le vendeur revient à une version précédente en un clic. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_design_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->json('design');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['store_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_design_versions');
    }
};
