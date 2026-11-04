<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Renouvellement par prélèvement sur le solde du portefeuille (activé par défaut, désactivable par le vendeur)
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('auto_renew')->default(true);
            $table->dateTime('renewal_reminded_for')->nullable(); // échéance pour laquelle le rappel est parti
            $table->dateTime('renewal_failed_for')->nullable();   // échéance pour laquelle l'échec a été signalé
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['auto_renew', 'renewal_reminded_for', 'renewal_failed_for']));
    }
};
