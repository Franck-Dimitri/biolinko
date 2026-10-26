<?php

use App\Models\User;

test('vendor franckdimitrio000@gmail.com is on starter plan', function () {
    $user = User::factory()->create([
        'email' => 'franckdimitrio000@gmail.com',
        'plan' => 'starter',
    ]);

    expect($user->plan)->toBe('starter');
    expect($user->getPlanMaxProducts())->toBe(5);
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

test('billing cycle discount calculations for 1 year and 2 years', function () {
    // 1 an : −15 %. 2 ans : −20 %.
    foreach (['pro' => 2500, 'growth' => 7000, 'business' => 12000] as $plan => $monthly) {
        expect(User::planPrice($plan))->toBe($monthly);
    }

    $user = User::factory()->create(['role' => 'seller', 'plan' => 'starter']);
    config(['services.hrskills_pay.subscription_mode' => 'simulation']);

    $this->actingAs($user)->postJson(route('seller.subscriptions.subscribe'), ['plan' => 'pro', 'phone_momo' => '677123456', 'cycle' => 12])
        ->assertJson(['amount' => (int) round(2500 * 12 * 0.85)]);
    $this->actingAs($user)->postJson(route('seller.subscriptions.subscribe'), ['plan' => 'pro', 'phone_momo' => '677123456', 'cycle' => 24])
        ->assertJson(['amount' => (int) round(2500 * 24 * 0.80)]);
    // L'ancienne durée de 6 mois n'existe plus
    $this->actingAs($user)->postJson(route('seller.subscriptions.subscribe'), ['plan' => 'pro', 'phone_momo' => '677123456', 'cycle' => 6]);
    expect(\App\Models\Subscription::where('billing_cycle', 6)->exists())->toBeFalse();
});

test('an expired paid plan falls back to starter limits', function () {
    $user = User::factory()->create(['role' => 'seller', 'plan' => 'business', 'subscription_expires_at' => now()->subDay()]);

    expect($user->effectivePlan())->toBe('starter');
    expect($user->getPlanMaxProducts())->toBe(5);
});
