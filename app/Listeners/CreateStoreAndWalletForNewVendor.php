<?php

namespace App\Listeners;

use App\Models\Store;
use App\Models\Wallet;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Str;

class CreateStoreAndWalletForNewVendor
{
    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        $user = $event->user;

        if ($user->store) {
            return;
        }

        // Generate base slug from name or user ID
        $baseSlug = Str::slug($user->name) ?: 'boutique';
        $slug = $baseSlug;
        $counter = 1;

        while (Store::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        // Create store
        $store = Store::create([
            'user_id' => $user->id,
            'name' => 'Boutique de ' . $user->name,
            'slug' => $slug,
            'theme_color' => '#7C3AED',
            'plan_type' => 'starter',
            'phone_whatsapp' => $user->phone_whatsapp,
        ]);

        // Create wallet
        Wallet::create([
            'store_id' => $store->id,
            'balance_available' => 0.00,
            'balance_pending' => 0.00,
        ]);
    }
}
