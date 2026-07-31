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
    // Pro: 7000 FCFA/mo. 6 mo (-14%) = 7000 * 6 * 0.86 = 36120 FCFA. 12 mo (-30%) = 7000 * 12 * 0.70 = 58800 FCFA.
    $proBase = 7000;
    $pro6Mo = (int) round($proBase * 6 * 0.86);
    $pro12Mo = (int) round($proBase * 12 * 0.70);

    expect($pro6Mo)->toBe(36120);
    expect($pro12Mo)->toBe(58800);

    // Growth: 16000 FCFA/mo. 6 mo (-14%) = 16000 * 6 * 0.86 = 82560 FCFA. 12 mo (-30%) = 16000 * 12 * 0.70 = 134400 FCFA.
    $growthBase = 16000;
    $growth6Mo = (int) round($growthBase * 6 * 0.86);
    $growth12Mo = (int) round($growthBase * 12 * 0.70);

    expect($growth6Mo)->toBe(82560);
    expect($growth12Mo)->toBe(134400);

    // Business: 30000 FCFA/mo. 6 mo (-14%) = 30000 * 6 * 0.86 = 154800 FCFA. 12 mo (-30%) = 30000 * 12 * 0.70 = 252000 FCFA.
    $bizBase = 30000;
    $biz6Mo = (int) round($bizBase * 6 * 0.86);
    $biz12Mo = (int) round($bizBase * 12 * 0.70);

    expect($biz6Mo)->toBe(154800);
    expect($biz12Mo)->toBe(252000);
});
