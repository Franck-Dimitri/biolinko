<?php

namespace App\Listeners;

use App\Models\Store;
use App\Models\Wallet;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateStoreAndWalletForNewVendor
{
    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        $user = $event->user;

        // Strict DB check: 1 user account = exactly 1 store
        $existingStore = Store::where('user_id', $user->id)->first();
        if ($existingStore) {
            Wallet::firstOrCreate(
                ['store_id' => $existingStore->id],
                ['balance_available' => 0.00, 'balance_pending' => 0.00]
            );
            return;
        }

        DB::transaction(function () use ($user) {
            // Generate base slug from name or fallback
            $baseSlug = Str::slug($user->name) ?: 'boutique';
            $slug = $baseSlug;
            $counter = 1;

            while (Store::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            // Initialize new vendor store in DRAFT mode (unpublished)
            $store = Store::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $user->name,
                    'slug' => $slug,
                    'is_configured' => false,
                    'is_published' => false,
                    'category' => 'Général',
                    'theme_color' => '#FFCC00',
                    'plan_type' => 'starter',
                    'phone_whatsapp' => $user->phone_whatsapp,
                    'announcement_header' => '⚡ Bienvenue sur la boutique officielle !',
                    'opening_hours' => 'Lun - Sam: 08h00 - 18h00',
                    'sections_json' => Store::getDefaultSections(),
                ]
            );

            // Create wallet
            Wallet::firstOrCreate(
                ['store_id' => $store->id],
                [
                    'balance_available' => 0.00,
                    'balance_pending' => 0.00,
                ]
            );
        });
    }
}
