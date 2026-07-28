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

test('user upgraded to pro plan gets 50 max products', function () {
    $user = User::factory()->create([
        'role' => 'seller',
        'plan' => 'pro',
        'subscription_expires_at' => now()->addDays(30),
    ]);

    expect($user->hasPlan('pro'))->toBeTrue();
    expect($user->getPlanMaxProducts())->toBe(50);
    expect($user->getPlanMaxImagesPerProduct())->toBe(5);
});
