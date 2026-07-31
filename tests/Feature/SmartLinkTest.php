<?php

use App\Models\Product;
use App\Models\SmartLink;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('seller can view smartlinks dashboard page', function () {
    $user = User::factory()->create(['role' => 'seller']);
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Store Test',
        'slug' => 'store-test',
    ]);

    $response = $this->actingAs($user)->get(route('seller.smartlinks.index'));

    $response->assertStatus(200);
});

test('seller can create a smartlink with multiple products and discount', function () {
    $user = User::factory()->create(['role' => 'seller']);
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Store Test 2',
        'slug' => 'store-test-2',
    ]);

    $p1 = Product::create([
        'store_id' => $store->id,
        'name' => 'Parfum Homme',
        'title' => 'Parfum Homme',
        'slug' => 'parfum-homme',
        'price' => 5000,
        'price_vendor' => 5000,
        'stock' => 10,
    ]);

    $p2 = Product::create([
        'store_id' => $store->id,
        'name' => 'Savon Bio',
        'title' => 'Savon Bio',
        'slug' => 'savon-bio',
        'price' => 2000,
        'price_vendor' => 2000,
        'stock' => 20,
    ]);

    $response = $this->actingAs($user)->post(route('seller.smartlinks.store'), [
        'title' => 'Pack Découverte Promo',
        'items' => [
            ['product_id' => $p1->id, 'quantity' => 1],
            ['product_id' => $p2->id, 'quantity' => 2],
        ],
        'discount_type' => 'fixed',
        'discount_value' => 1500,
    ]);

    $response->assertRedirect(route('seller.smartlinks.index'));

    $this->assertDatabaseHas('smart_links', [
        'store_id' => $store->id,
        'title' => 'Pack Découverte Promo',
        'subtotal_amount' => 9000.00, // 5000 + (2000 * 2) = 9000
        'total_amount' => 7500.00,    // 9000 - 1500 = 7500
    ]);
});

test('public user can view smartlink fast checkout page', function () {
    $user = User::factory()->create(['role' => 'seller']);
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Store Test 3',
        'slug' => 'store-test-3',
    ]);

    $smartLink = SmartLink::create([
        'store_id' => $store->id,
        'title' => 'Offre Spéciale Flash',
        'code' => 'sl_test123',
        'discount_type' => 'fixed',
        'discount_value' => 1000,
        'subtotal_amount' => 5000,
        'total_amount' => 4000,
        'items' => [
            [
                'product_id' => 1,
                'product_name' => 'Produit Test',
                'unit_price' => 5000,
                'quantity' => 1,
                'line_total' => 5000,
            ],
        ],
        'is_active' => true,
    ]);

    $response = $this->get(route('smartlink.show', 'sl_test123'));

    $response->assertStatus(200);

    expect($smartLink->fresh()->views_count)->toBe(1);
});

