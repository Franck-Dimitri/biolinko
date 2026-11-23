<?php

use App\Models\Store;
use App\Models\User;
use App\Support\ImageUpload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(fn () => Storage::fake('public'));

test('une photo est enregistrée en WebP, en grande et petite taille', function () {
    $path = ImageUpload::store(UploadedFile::fake()->image('robe.jpg', 3000, 2000), 'products');

    expect($path)->toMatch('#^products/opt/[A-Za-z0-9]{40}\.webp$#');
    Storage::disk('public')->assertExists($path);
    Storage::disk('public')->assertExists(ImageUpload::small('/storage/'.$path) ? substr($path, 0, -5).'-sm.webp' : 'absent');

    [$w, $h] = getimagesizefromstring(Storage::disk('public')->get($path));
    expect([$w, $h])->toBe([1600, 1067]);
    [$sw] = getimagesizefromstring(Storage::disk('public')->get(substr($path, 0, -5).'-sm.webp'));
    expect($sw)->toBe(640);
});

test('une petite photo n’est pas agrandie', function () {
    $path = ImageUpload::store(UploadedFile::fake()->image('logo.png', 300, 300), 'logos');

    [$w, $h] = getimagesizefromstring(Storage::disk('public')->get($path));
    expect([$w, $h])->toBe([300, 300]);
});

test('un fichier qui ne peut pas être converti est gardé tel quel', function () {
    $path = ImageUpload::store(UploadedFile::fake()->image('anime.gif', 200, 200), 'products');

    expect($path)->toEndWith('.gif')->not->toContain('/opt/');
    Storage::disk('public')->assertExists($path);
});

test('les photos de produits envoyées par le vendeur sont optimisées', function () {
    $vendor = User::factory()->create(['role' => 'seller', 'plan' => 'pro', 'subscription_expires_at' => now()->addMonth()]);
    $store = Store::create(['user_id' => $vendor->id, 'name' => 'Photos', 'slug' => 'photos']);

    $this->actingAs($vendor)->post(route('products.store'), [
        'title' => 'Sac en raphia', 'price_vendor' => 9000, 'stock' => 3, 'min_order_quantity' => 1,
        'images_files' => [UploadedFile::fake()->image('sac.jpg', 2400, 2400)],
    ])->assertSessionHasNoErrors();

    $image = $store->products()->first()->image_url;
    expect($image)->toStartWith('/storage/products/opt/')->toEndWith('.webp');
    Storage::disk('public')->assertExists(substr($image, strlen('/storage/'), -5).'-sm.webp');
});
