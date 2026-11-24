<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Visites des pages publiques (boutiques et site Biolinko), sans donnée personnelle :
 * ni adresse IP ni identifiant, seulement un code de visiteur anonyme valable un jour.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->nullable()->constrained()->cascadeOnDelete(); // null = site Biolinko
            $table->date('day')->index();
            $table->string('page', 20);        // home, product, checkout, track, site
            $table->string('path', 190);
            $table->char('country', 2)->nullable();
            $table->string('device', 10);      // mobile, tablet, desktop
            $table->string('source', 20);      // whatsapp, facebook, instagram, tiktok, google, direct, other
            $table->char('visitor', 16);       // empreinte anonyme du jour
            $table->timestamp('created_at')->useCurrent();
            $table->index(['store_id', 'day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_visits');
    }
};
