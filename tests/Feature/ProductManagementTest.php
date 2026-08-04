<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;

test('authenticated vendor can activate and deactivate product promotion', function () {
    $vendor = User::factory()->create(['role' => 'seller', 'plan' => 'pro']);
    $store = Store::create([
        'user_id' => $vendor->id,
        'name' => 'Boutique Promo Test',
        'slug' => 'boutique-promo-test',
    ]);
    Wallet::create(['store_id' => $store->id]);

    $product = Product::create([
        'store_id' => $store->id,
        'title' => 'Article Test Promo',
        'slug' => 'article-test-promo',
        'price_vendor' => 15000,
        'stock' => 10,
        'is_promo' => false,
    ]);

    // Activate promotion
    $response = $this->actingAs($vendor)->put(route('products.update', $product->id), [
        'title' => 'Article Test Promo',
        'price_vendor' => 15000,
        'stock' => 10,
        'is_promo' => true,
        'promo_price' => 12000,
        'promo_start_at' => '',
        'promo_end_at' => '',
    ]);

    $response->assertRedirect();
    $product->refresh();
    expect($product->is_promo)->toBeTrue();
    expect((float)$product->promo_price)->toBe(12000.0);

    // Deactivate promotion
    $deactivateResponse = $this->actingAs($vendor)->put(route('products.update', $product->id), [
        'title' => 'Article Test Promo',
        'price_vendor' => 15000,
        'stock' => 10,
        'is_promo' => false,
        'promo_price' => null,
    ]);

    $deactivateResponse->assertRedirect();
    $product->refresh();
    expect($product->is_promo)->toBeFalse();
    expect($product->promo_price)->toBeNull();
});
