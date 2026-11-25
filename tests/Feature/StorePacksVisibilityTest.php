<?php

use App\Models\SmartLink;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Support\StoreTemplates;

/*
 * Packs d'un vendeur sur une vitrine dont le template ne prévoit pas de section « Packs » :
 * la vitrine reçoit les packs actifs, et l'affichage ajoute la section (tests/js/commerce.test.mjs).
 */
test('les packs actifs arrivent sur la vitrine même si le template n’a pas de section Packs', function () {
    $design = StoreTemplates::get('pat-douceur')['design'];
    expect(collect($design['sections'])->pluck('type'))->not->toContain('packs');

    $seller = User::factory()->create(['role' => 'seller']);
    $store = Store::create(['user_id' => $seller->id, 'name' => 'Les Délices', 'slug' => 'les-delices', 'is_published' => true,
        'business_type' => 'patisserie', 'design_engine' => true, 'design' => $design]);
    Wallet::create(['store_id' => $store->id]);
    SmartLink::create(['store_id' => $store->id, 'title' => 'Pack fêtes', 'code' => 'FETES01', 'total_amount' => 25000, 'items' => [], 'is_active' => true]);
    SmartLink::create(['store_id' => $store->id, 'title' => 'Pack désactivé', 'code' => 'OFF01', 'total_amount' => 9000, 'items' => [], 'is_active' => false]);

    $this->get('/les-delices')->assertOk()->assertInertia(fn ($p) => $p->component('Storefront/Boutique')
        ->has('activeSmartLinks', 1)->where('activeSmartLinks.0.title', 'Pack fêtes'));
});
