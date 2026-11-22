<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Motif décoratif de la vitrine (points, wax, confettis…), coloré avec la couleur de la boutique. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('pattern', 20)->nullable()->after('border_radius_style');
        });
    }

    public function down(): void
    {
        Schema::table('stores', fn (Blueprint $t) => $t->dropColumn('pattern'));
    }
};
