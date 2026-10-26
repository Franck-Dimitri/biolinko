<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;

test('authenticated vendor can activate and deactivate product promotion', function () {
    $vendor = User::factory()->create(['role' => 'seller', 'plan' => 'pro', 'subscription_expires_at' => now()->addMonth()]);
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

test('a product without photo gets no stock image', function () {
    $vendor = User::factory()->create(['role' => 'seller']);
    $store = Store::create(['user_id' => $vendor->id, 'name' => 'Sans Photo', 'slug' => 'sans-photo']);

    $this->actingAs($vendor)->post(route('products.store'), ['title' => 'Savon noir', 'price_vendor' => 1500, 'stock' => 5, 'min_order_quantity' => 1]);

    $product = $store->products()->first();
    expect($product->image_url)->toBeNull();
    expect($product->images)->toBe([]);
});

test('editing keeps the photos the seller chose and adds the new ones', function () {
    \Illuminate\Support\Facades\Storage::fake('public');
    $vendor = User::factory()->create(['role' => 'seller', 'plan' => 'pro', 'subscription_expires_at' => now()->addMonth()]);
    $store = Store::create(['user_id' => $vendor->id, 'name' => 'Photos', 'slug' => 'photos']);
    $product = $store->products()->create(['title' => 'Sac', 'slug' => 'sac', 'price_vendor' => 9000, 'stock' => 3, 'image_url' => '/storage/a.jpg', 'images' => ['/storage/a.jpg', '/storage/b.jpg']]);

    $this->actingAs($vendor)->post(route('products.update.post', $product->id), [
        'title' => 'Sac',
        'kept_images' => ['/storage/b.jpg'],
        'images_files' => [\Illuminate\Http\UploadedFile::fake()->image('c.jpg')],
    ]);

    $images = $product->fresh()->images;
    expect($images)->toHaveCount(2);
    expect($images[0])->toBe('/storage/b.jpg');
    expect($product->fresh()->image_url)->toBe('/storage/b.jpg');
});
