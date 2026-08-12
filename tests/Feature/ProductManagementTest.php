<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;

test('authenticated vendor can activate and deactivate product promotion on pro plan', function () {
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

test('starter plan vendor cannot exceed stock limit of 10 units', function () {
    $vendor = User::factory()->create(['role' => 'seller', 'plan' => 'starter']);
    $store = Store::create([
        'user_id' => $vendor->id,
        'name' => 'Boutique Starter Test',
        'slug' => 'boutique-starter-test',
    ]);
    Wallet::create(['store_id' => $store->id]);

    // Attempt to create product with stock = 15 on starter plan
    $response = $this->actingAs($vendor)->post(route('products.store'), [
        'title' => 'Produit Trop De Stock',
        'price_vendor' => 5000,
        'stock' => 15,
        'min_order_quantity' => 1,
    ]);

    $response->assertSessionHasErrors(['stock']);

    // Create product with valid stock = 8
    $validResponse = $this->actingAs($vendor)->post(route('products.store'), [
        'title' => 'Produit Stock Ok',
        'price_vendor' => 5000,
        'stock' => 8,
        'min_order_quantity' => 1,
    ]);

    $validResponse->assertSessionHasNoErrors();
    expect(Product::where('store_id', $store->id)->count())->toBe(1);

    // Attempt to create another product with stock = 5 (Total would be 13 > 10)
    $overQuotaResponse = $this->actingAs($vendor)->post(route('products.store'), [
        'title' => 'Produit Surquota Stock',
        'price_vendor' => 3000,
        'stock' => 5,
        'min_order_quantity' => 1,
    ]);

    $overQuotaResponse->assertSessionHasErrors(['stock']);
});
