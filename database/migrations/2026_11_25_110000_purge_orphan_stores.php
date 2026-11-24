<?php

use App\Support\AccountDeletion;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/** Boutiques restées après la suppression du compte de leur vendeur : elles bloquaient leur adresse. */
return new class extends Migration
{
    public function up(): void
    {
        $orphans = DB::table('stores')->whereNotIn('user_id', DB::table('users')->select('id'))->pluck('id')->all();
        AccountDeletion::purgeStores($orphans);
    }

    public function down(): void
    {
        // Données supprimées : rien à restaurer
    }
};
