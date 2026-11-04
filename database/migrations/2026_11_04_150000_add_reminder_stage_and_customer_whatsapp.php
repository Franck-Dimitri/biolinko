<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Dernier rappel envoyé pour l'échéance en cours : 7, 4 ou 2 jours avant
        Schema::table('users', fn (Blueprint $t) => $t->unsignedTinyInteger('renewal_reminder_stage')->nullable());
        // Numéro WhatsApp du client pour la commande (peut différer du numéro Mobile Money)
        Schema::table('orders', fn (Blueprint $t) => $t->string('customer_whatsapp', 30)->nullable());
    }

    public function down(): void
    {
        Schema::table('orders', fn (Blueprint $t) => $t->dropColumn('customer_whatsapp'));
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('renewal_reminder_stage'));
    }
};
