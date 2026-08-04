<?php

use App\Models\User;
use App\Models\Store;
use App\Models\WhatsappCampaign;
use App\Models\SmartLink;

test('starter plan vendor is limited to 1 whatsapp campaign per month and 10 recipients max', function () {
    $user = User::factory()->create(['role' => 'seller', 'plan' => 'starter']);
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Starter',
        'slug' => 'boutique-starter',
    ]);

    // 1. Create first valid campaign
    $response = $this->actingAs($user)->post(route('customers.campaign.store'), [
        'title' => 'Promo Découverte',
        'message_template' => 'Bonjour {prenom}, profitez de notre promo !',
        'recipients' => [
            ['name' => 'Mariam', 'phone' => '699001122'],
            ['name' => 'Armel', 'phone' => '677112233'],
        ],
    ]);

    $response->assertRedirect();
    expect(WhatsappCampaign::where('store_id', $store->id)->count())->toBe(1);

    // 2. Attempting second campaign on starter plan should be blocked
    $secondResponse = $this->actingAs($user)->post(route('customers.campaign.store'), [
        'title' => 'Deuxième Promo',
        'message_template' => 'Deuxième essai',
        'recipients' => [['name' => 'Jean', 'phone' => '699887766']],
    ]);

    $secondResponse->assertSessionHasErrors('campaign');
    expect(WhatsappCampaign::where('store_id', $store->id)->count())->toBe(1);
});

test('pro plan vendor can create up to 4 campaigns per month with smartlinks', function () {
    $user = User::factory()->create(['role' => 'seller', 'plan' => 'pro']);
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Pro',
        'slug' => 'boutique-pro',
    ]);

    $smartLink = SmartLink::create([
        'store_id' => $store->id,
        'title' => 'Pack Solde',
        'code' => 'SOLDE123',
        'total_amount' => 15000,
        'items' => [],
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('customers.campaign.store'), [
        'title' => 'Campagne Pro 1',
        'message_template' => 'Bonjour {prenom}, voici votre offre {lien_produit}',
        'recipients' => [
            ['name' => 'Alice', 'phone' => '699001111'],
        ],
        'smart_link_id' => $smartLink->id,
    ]);

    $response->assertRedirect();
    expect(WhatsappCampaign::where('store_id', $store->id)->count())->toBe(1);
    $campaign = WhatsappCampaign::where('store_id', $store->id)->first();
    expect($campaign->smart_link_id)->toBe($smartLink->id);
});
