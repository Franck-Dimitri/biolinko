<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Moteur de vitrine : la vitrine devient un document (style, motif, sections à variantes).
 * design = version publiée, design_draft = brouillon de l'éditeur, design_engine = interrupteur par boutique.
 * Sans design (ou interrupteur éteint), la boutique reste sur le template « Classique » calculé
 * depuis ses réglages actuels : aucune boutique ne change d'apparence.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->json('design')->nullable()->after('sections_json');
            $table->json('design_draft')->nullable()->after('design');
            $table->boolean('design_engine')->default(false)->after('design_draft');
            // Certains noms de motifs dépassent 20 caractères (patisserie-gourmandises)
            $table->string('pattern', 40)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn(['design', 'design_draft', 'design_engine']);
        });
    }
};
