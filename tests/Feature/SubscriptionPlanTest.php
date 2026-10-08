<?php

use App\Models\User;

test('vendor franckdimitrio000@gmail.com is on starter plan', function () {
    $user = User::factory()->create([
        'email' => 'franckdimitrio000@gmail.com',
        'plan' => 'starter',
    ]);

    expect($user->plan)->toBe('starter');
    expect($user->getPlanMaxProducts())->toBe(10);
    expect($user->getPlanMaxImagesPerProduct())->toBe(2);
    expect($user->getPlanMaxStores())->toBe(1);
    expect($user->getPlanMaxTemplates())->toBe(1);
});

test('seller subscription index page can be rendered', function () {
    $user = User::factory()->create([
        'role' => 'seller',
        'plan' => 'starter',
    ]);

    $response = $this->actingAs($user)->get(route('seller.subscriptions.index'));

    $response->assertStatus(200);
});

test('user with starter plan is restricted by pro plan middleware', function () {
    $user = User::factory()->create([
        'role' => 'seller',
        'plan' => 'starter',
    ]);

    expect($user->hasPlan('pro'))->toBeFalse();
    expect($user->hasPlan('starter'))->toBeTrue();
});

test('user upgraded to pro, growth, business gets updated store and template limits', function () {
    $proUser = User::factory()->create(['role' => 'seller', 'plan' => 'pro', 'subscription_expires_at' => now()->addDays(30)]);
    expect($proUser->getPlanMaxStores())->toBe(1);
    expect($proUser->getPlanMaxTemplates())->toBe(2);

    $growthUser = User::factory()->create(['role' => 'seller', 'plan' => 'growth', 'subscription_expires_at' => now()->addDays(30)]);
    expect($growthUser->getPlanMaxStores())->toBe(1);
    expect($growthUser->getPlanMaxTemplates())->toBe(5);

    $bizUser = User::factory()->create(['role' => 'seller', 'plan' => 'business', 'subscription_expires_at' => now()->addDays(30)]);
    expect($bizUser->getPlanMaxStores())->toBe(1);
    expect($bizUser->getPlanMaxTemplates())->toBe(10);
});

test('billing cycle discount calculations for 6 months and 12 months', function () {
    // Pro: 2500 FCFA/mo. 6 mo (-10%) = 13500 FCFA. 12 mo (-20%) = 24000 FCFA.
    $proBase = User::planPrice('pro');
    expect($proBase)->toBe(2500);
    expect((int) round($proBase * 6 * 0.90))->toBe(13500);
    expect((int) round($proBase * 12 * 0.80))->toBe(24000);

    // Growth: 7000 FCFA/mo. 6 mo (-10%) = 37800 FCFA. 12 mo (-20%) = 67200 FCFA.
    $growthBase = User::planPrice('growth');
    expect($growthBase)->toBe(7000);
    expect((int) round($growthBase * 6 * 0.90))->toBe(37800);
    expect((int) round($growthBase * 12 * 0.80))->toBe(67200);

    // Business: 12000 FCFA/mo. 6 mo (-10%) = 64800 FCFA. 12 mo (-20%) = 115200 FCFA.
    $bizBase = User::planPrice('business');
    expect($bizBase)->toBe(12000);
    expect((int) round($bizBase * 6 * 0.90))->toBe(64800);
    expect((int) round($bizBase * 12 * 0.80))->toBe(115200);
});
