<?php

use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use Database\Seeders\AdminUserSeeder;

test('admin user seeder creates default super admin', function () {
    $this->seed(AdminUserSeeder::class);

    $admin = User::where('email', 'admin@biolinko.app')->first();
    expect($admin)->not->toBeNull();
    expect($admin->isAdmin())->toBeTrue();
    expect($admin->role)->toBe('admin');
});

test('super admin can access admin dashboard', function () {
    $this->seed(AdminUserSeeder::class);

    $admin = User::where('email', 'admin@biolinko.app')->first();

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));
    $response->assertStatus(200);
});

test('seller cannot access admin dashboard and is redirected to seller dashboard', function () {
    $seller = User::factory()->create(['role' => 'seller']);

    $response = $this->actingAs($seller)->get(route('admin.dashboard'));
    $response->assertRedirect(route('seller.dashboard'));
});

test('authenticated seller can access seller dashboard and products', function () {
    $seller = User::factory()->create(['role' => 'seller']);
    $store = Store::create([
        'user_id' => $seller->id,
        'name' => 'Boutique Test Role',
        'slug' => 'boutique-test-role',
    ]);
    Wallet::create(['store_id' => $store->id]);

    $response = $this->actingAs($seller)->get(route('seller.dashboard'));
    $response->assertStatus(200);

    $productsResponse = $this->actingAs($seller)->get(route('products.index'));
    $productsResponse->assertStatus(200);
});
