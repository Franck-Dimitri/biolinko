<?php

use App\Models\Store;
use App\Models\User;

test('la landing vérifie si une adresse de boutique est libre', function () {
    Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Prise', 'slug' => 'maison-ngono']);

    $this->getJson(route('shop.available', ['slug' => 'Maison Ngono']))->assertJson(['slug' => 'maison-ngono', 'available' => false]);
    $this->getJson(route('shop.available', ['slug' => 'Click Shop']))->assertJson(['slug' => 'click-shop', 'available' => true]);
    $this->getJson(route('shop.available', ['slug' => 'admin']))->assertJson(['available' => false]);
    $this->getJson(route('shop.available', ['slug' => 'ab']))->assertJson(['slug' => null, 'available' => false]);
});

test('l’adresse réservée sur la landing devient celle de la boutique à l’inscription', function () {
    $this->get(route('register', ['boutique' => 'Chez Awa']))
        ->assertInertia(fn ($page) => $page->where('intendedShop.slug', 'chez-awa')->where('intendedShop.available', true));

    $this->post(route('register'), [
        'name' => 'Awa Mbarga', 'email' => 'awa@example.com', 'phone_whatsapp' => '677000000',
        'password' => 'password-solide-123', 'password_confirmation' => 'password-solide-123', 'terms' => true,
    ])->assertRedirect();

    $store = User::where('email', 'awa@example.com')->first()->store;
    expect($store->slug)->toBe('chez-awa')->and($store->name)->toBe('Chez Awa');
});
