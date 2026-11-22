<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Boutiques pour toutes les activités : activité de la boutique (modèle), produits « sur commande »
 * (délai de préparation, capacité par jour, champs personnalisés), date souhaitée et personnalisations des commandes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('business_type', 30)->nullable()->after('category');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->string('fulfillment', 20)->default('stock')->after('stock');
            $table->unsignedSmallInteger('lead_time_hours')->nullable()->after('fulfillment');
            $table->unsignedSmallInteger('daily_capacity')->nullable()->after('lead_time_hours');
            $table->json('custom_fields')->nullable()->after('daily_capacity');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->date('desired_date')->nullable()->after('city');
            $table->string('desired_slot', 20)->nullable()->after('desired_date');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->json('customizations')->nullable()->after('variant_label');
        });

        // Activité déduite de l'ancienne catégorie libre
        $map = [
            'Mode et vêtements' => 'mode', 'Beauté et cosmétiques' => 'beaute', 'Accessoires' => 'accessoires', 'Chaussures' => 'accessoires',
            'Électronique' => 'electronique', 'Alimentation' => 'alimentation', 'Maison et déco' => 'maison', 'Santé et bien-être' => 'sante',
            'Enfants' => 'enfants', 'Services' => 'services', 'Autre' => 'autre',
        ];
        foreach ($map as $category => $type) {
            DB::table('stores')->where('category', $category)->whereNull('business_type')->update(['business_type' => $type]);
        }
    }

    public function down(): void
    {
        Schema::table('order_items', fn (Blueprint $t) => $t->dropColumn('customizations'));
        Schema::table('orders', fn (Blueprint $t) => $t->dropColumn(['desired_date', 'desired_slot']));
        Schema::table('products', fn (Blueprint $t) => $t->dropColumn(['fulfillment', 'lead_time_hours', 'daily_capacity', 'custom_fields']));
        Schema::table('stores', fn (Blueprint $t) => $t->dropColumn('business_type'));
    }
};
