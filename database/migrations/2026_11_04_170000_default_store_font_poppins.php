<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {
        // « Inter » était la valeur par défaut, mais les boutiques s'affichaient en Poppins : on aligne la valeur sur le rendu réel
        DB::table('stores')->where('font_family', 'Inter')->orWhereNull('font_family')->update(['font_family' => 'Poppins']);
        Schema::table('stores', fn (Blueprint $t) => $t->string('font_family')->default('Poppins')->nullable()->change());
    }

    public function down(): void
    {
        Schema::table('stores', fn (Blueprint $t) => $t->string('font_family')->default('Inter')->nullable()->change());
    }
};
