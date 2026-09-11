<?php

use App\Models\User;
use App\Models\Store;
use App\Models\Product;
use App\Models\Order;
use App\Models\Wallet;

test('super admin can view detailed merchant page with products and metrics', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $seller = User::factory()->create(['role' => 'seller', 'name' => 'Vendeur Pro', 'plan' => 'pro']);

    $store = Store::create([
        'user_id' => $seller->id,
        'name' => 'Boutique Pro',
        'slug' => 'boutique-pro',
        'is_published' => true,
    ]);

    Wallet::create([
        'store_id' => $store->id,
        'balance_available' => 25000,
        'balance_pending' => 5000,
    ]);

    Product::create([
        'store_id' => $store->id,
        'title' => 'Sneakers Nike',
        'slug' => 'sneakers-nike',
        'price_vendor' => 15000,
        'stock' => 10,
        'is_active' => true,
    ]);

    Order::create([
        'store_id' => $store->id,
        'customer_name' => 'Acheteur Test',
        'customer_phone' => '237699999999',
        'city' => 'Douala',
        'address_details' => 'Akwa',
        'price_vendor' => 15000,
        'saas_margin' => 300,
        'api_fee' => 300,
        'total_client' => 15600,
        'status' => 'delivered',
        'payment_status' => 'paid',
        'hrskills_reference' => 'ref_order_test_999',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.users.show', $seller->id));
    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Users/Show')
        ->has('vendor')
        ->has('stats')
        ->where('stats.total_revenue', 15600)
        ->where('stats.products_count', 1)
        ->where('stats.wallet_available', 25000)
    );
});

test('super admin can toggle store publication status from user show page', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $seller = User::factory()->create(['role' => 'seller']);

    $store = Store::create([
        'user_id' => $seller->id,
        'name' => 'Boutique Mode',
        'slug' => 'boutique-mode',
        'is_published' => true,
    ]);

    $response = $this->actingAs($admin)->post(route('admin.users.toggleStore', $seller->id));
    $response->assertRedirect();

    $store->refresh();
    expect($store->is_published)->toBeFalse();
});

test('non-admin user cannot access admin merchant show page', function () {
    $regularUser = User::factory()->create(['role' => 'seller']);
    $otherSeller = User::factory()->create(['role' => 'seller']);

    $response = $this->actingAs($regularUser)->get(route('admin.users.show', $otherSeller->id));
    $response->assertRedirect(route('seller.dashboard'));
});
