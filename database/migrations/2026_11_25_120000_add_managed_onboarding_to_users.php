<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Boutique créée et configurée par l'équipe Biolinko, puis remise au vendeur avec un lien d'accès. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('managed_by')->nullable()->after('role')->constrained('users')->nullOnDelete();
            $table->timestamp('claimed_at')->nullable()->after('managed_by');
            $table->string('claim_nonce', 64)->nullable()->after('claimed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('managed_by');
            $table->dropColumn(['claimed_at', 'claim_nonce']);
        });
    }
};
