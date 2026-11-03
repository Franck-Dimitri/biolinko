<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Date d'acceptation des CGU et de la politique de confidentialité à l'inscription (preuve en cas de litige)
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->timestamp('terms_accepted_at')->nullable());
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('terms_accepted_at'));
    }
};
