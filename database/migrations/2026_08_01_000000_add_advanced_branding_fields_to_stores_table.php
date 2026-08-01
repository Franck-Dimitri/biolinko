<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('accent_color')->default('#F97316')->nullable()->after('theme_color');
            $table->string('font_family')->default('Inter')->nullable()->after('accent_color');
            $table->string('border_radius_style')->default('rounded')->nullable()->after('font_family');
            $table->string('theme_mode')->default('light')->nullable()->after('border_radius_style');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'accent_color',
                'font_family',
                'border_radius_style',
                'theme_mode',
            ]);
        });
    }
};
