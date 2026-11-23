<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Mesures par template (lancement) : visites et ajouts au panier par jour, template de chaque commande. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('template_stats', function (Blueprint $table) {
            $table->id();
            $table->date('day');
            $table->string('template', 40);
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('carts')->default(0);
            $table->unique(['day', 'template']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('design_template', 40)->nullable()->after('recurring_basket_id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('orders', fn (Blueprint $t) => $t->dropColumn('design_template'));
        Schema::dropIfExists('template_stats');
    }
};
