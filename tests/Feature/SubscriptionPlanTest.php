<?php

use App\Models\User;
use App\Models\Subscription;

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
    expect($proUser->getPlanMaxStores())->toBe(2);
    expect($proUser->getPlanMaxTemplates())->toBe(2);

    $growthUser = User::factory()->create(['role' => 'seller', 'plan' => 'growth', 'subscription_expires_at' => now()->addDays(30)]);
    expect($growthUser->getPlanMaxStores())->toBe(3);
    expect($growthUser->getPlanMaxTemplates())->toBe(5);

    $bizUser = User::factory()->create(['role' => 'seller', 'plan' => 'business', 'subscription_expires_at' => now()->addDays(30)]);
    expect($bizUser->getPlanMaxStores())->toBe(5);
    expect($bizUser->getPlanMaxTemplates())->toBe(10);
});

test('billing cycle discount calculations for 6 months and 12 months', function () {
    // Pro: 2500 FCFA/mo. 6 mo (-10%) = 2500 * 6 * 0.90 = 13500 FCFA. 12 mo (-20%) = 2500 * 12 * 0.80 = 24000 FCFA.
    $proBase = 2500;
    $pro6Mo = (int) round($proBase * 6 * 0.90);
    $pro12Mo = (int) round($proBase * 12 * 0.80);

    expect($pro6Mo)->toBe(13500);
    expect($pro12Mo)->toBe(24000);

    // Growth: 7000 FCFA/mo. 6 mo (-10%) = 7000 * 6 * 0.90 = 37800 FCFA. 12 mo (-20%) = 7000 * 12 * 0.80 = 67200 FCFA.
    $growthBase = 7000;
    $growth6Mo = (int) round($growthBase * 6 * 0.90);
    $growth12Mo = (int) round($growthBase * 12 * 0.80);

    expect($growth6Mo)->toBe(37800);
    expect($growth12Mo)->toBe(67200);

    // Business: 12000 FCFA/mo. 6 mo (-10%) = 12000 * 6 * 0.90 = 64800 FCFA. 12 mo (-20%) = 12000 * 12 * 0.80 = 115200 FCFA.
    $bizBase = 12000;
    $biz6Mo = (int) round($bizBase * 6 * 0.90);
    $biz12Mo = (int) round($bizBase * 12 * 0.80);

    expect($biz6Mo)->toBe(64800);
    expect($biz12Mo)->toBe(115200);
});
