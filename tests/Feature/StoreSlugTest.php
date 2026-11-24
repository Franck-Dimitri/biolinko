<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\StoreSlugRedirect;
use App\Models\User;
use App\Support\StoreSlug;

beforeEach(function () {
    $this->seller = User::factory()->create(['role' => 'seller']);
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Chez Lina', 'slug' => 'chez-lina', 'is_published' => true]);
});

function register(array $data = [])
{
    return test()->post(route('register'), $data + [
        'name' => 'Awa Mbarga', 'store_name' => 'Maison Awa', 'store_slug' => 'maison-awa',
        'email' => 'awa@example.com', 'phone_whatsapp' => '677000000',
        'password' => 'password-solide-123', 'password_confirmation' => 'password-solide-123', 'terms' => true,
    ]);
}

/* ------------------------------------------------------------------ Redirection de l'ancienne adresse */

test('l’ancienne adresse redirige vers la nouvelle, pages produits et paramètres compris', function () {
    Product::create(['store_id' => $this->store->id, 'title' => 'Robe', 'slug' => 'robe', 'price_vendor' => 5000, 'stock' => 3, 'is_active' => true]);
    $this->store->update(['slug' => 'lina-couture']);

    expect(StoreSlugRedirect::where('old_slug', 'chez-lina')->value('store_id'))->toBe($this->store->id);
    $this->get('/chez-lina')->assertStatus(301)->assertRedirect('/lina-couture');
    $this->get('/chez-lina/p/robe?utm_source=whatsapp')->assertStatus(301)->assertRedirect('/lina-couture/p/robe?utm_source=whatsapp');
    $this->get('/lina-couture')->assertOk();
});

test('sur le domaine des boutiques, l’ancien sous-domaine renvoie vers le nouveau', function () {
    config(['biolinko.store_domain' => 'biolinko.store', 'app.url' => 'https://biolinko.app']);
    $this->store->update(['slug' => 'lina-couture']);

    $this->get('https://chez-lina.biolinko.store/?ref=ig')->assertStatus(301)->assertRedirect('https://lina-couture.biolinko.store/?ref=ig');
    $this->get('https://chez-lina.biolinko.store/p/robe')->assertStatus(301)->assertRedirect('https://lina-couture.biolinko.store/p/robe');
    // Ancienne adresse sur le site principal : directement vers le nouveau sous-domaine
    $this->get('https://biolinko.app/chez-lina')->assertStatus(301)->assertRedirect('https://lina-couture.biolinko.store/');
});

test('après plusieurs changements, toutes les anciennes adresses mènent à l’adresse actuelle', function () {
    $this->store->update(['slug' => 'lina-2']);
    $this->store->update(['slug' => 'lina-3']);

    $this->get('/chez-lina')->assertRedirect('/lina-3');
    $this->get('/lina-2')->assertRedirect('/lina-3');
});

test('l’ancienne adresse reste réservée à sa boutique, qui peut la reprendre', function () {
    $this->store->update(['slug' => 'lina-couture']);

    // Un autre vendeur ne peut pas la prendre
    expect(StoreSlug::available('chez-lina'))->toBeFalse();
    $other = User::factory()->create(['role' => 'seller']);
    $otherStore = Store::create(['user_id' => $other->id, 'name' => 'Autre', 'slug' => 'autre-boutique']);
    $this->actingAs($other)->post(route('appearance.update'), ['name' => 'Autre', 'slug' => 'chez-lina', 'theme_color' => '#C93A6B'])
        ->assertSessionHasErrors('slug');
    expect($otherStore->fresh()->slug)->toBe('autre-boutique');

    // Le propriétaire revient à son ancienne adresse : plus de redirection sur celle-ci
    $this->actingAs($this->seller)->post(route('appearance.update'), ['name' => 'Chez Lina', 'slug' => 'chez-lina', 'theme_color' => '#C93A6B'])
        ->assertSessionHasNoErrors();
    expect($this->store->fresh()->slug)->toBe('chez-lina')
        ->and(StoreSlugRedirect::where('old_slug', 'chez-lina')->exists())->toBeFalse();
    $this->get('/chez-lina')->assertOk();
    $this->get('/lina-couture')->assertRedirect('/chez-lina');
});

/* ------------------------------------------------------------------ Disponibilité et propositions */

test('une adresse prise est signalée avec 3 propositions libres', function () {
    Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Prise', 'slug' => 'chez-lina-shop']);

    $res = $this->getJson(route('shop.available', ['slug' => 'Chez Lina']))->assertOk()->json();
    expect($res['available'])->toBeFalse()
        ->and($res['suggestions'])->toHaveCount(3)
        ->and($res['suggestions'])->not->toContain('chez-lina-shop');
    foreach ($res['suggestions'] as $s) {
        expect(StoreSlug::available($s))->toBeTrue()->and(strlen($s))->toBeLessThanOrEqual(40);
    }

    $this->getJson(route('shop.available', ['slug' => 'nouvelle-boutique']))->assertJson(['available' => true, 'suggestions' => []]);
});

test('une ancienne adresse et une adresse réservée ne sont pas disponibles', function () {
    $this->store->update(['slug' => 'lina-couture']);

    $this->getJson(route('shop.available', ['slug' => 'chez-lina']))->assertJson(['available' => false]);
    $this->getJson(route('shop.available', ['slug' => 'admin']))->assertJsonPath('available', false)->assertJsonCount(3, 'suggestions');
    // Pour son propriétaire, ses anciennes adresses restent disponibles
    $this->actingAs($this->seller)->getJson(route('shop.available', ['slug' => 'chez-lina']))->assertJson(['available' => true]);
});

test('les propositions restent sous 40 caractères pour une adresse longue', function () {
    $long = str_repeat('a', 40);
    Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Long', 'slug' => $long]);

    foreach (StoreSlug::suggestions($long) as $s) {
        expect(strlen($s))->toBeLessThanOrEqual(40)->and(preg_match(StoreSlug::PATTERN, $s))->toBe(1);
    }
});

/* ------------------------------------------------------------------ Inscription */

test('à l’inscription, le nom du vendeur et celui de la boutique sont distincts', function () {
    register()->assertRedirect(route('verification.notice'));

    $user = User::where('email', 'awa@example.com')->first();
    expect($user->name)->toBe('Awa Mbarga')
        ->and($user->store->name)->toBe('Maison Awa')
        ->and($user->store->slug)->toBe('maison-awa');
});

test('l’inscription refuse une adresse déjà prise ou réservée', function (string $slug) {
    $this->store->update(['slug' => 'lina-couture']); // « chez-lina » devient une ancienne adresse

    register(['store_slug' => $slug])->assertSessionHasErrors('store_slug');
    expect(User::where('email', 'awa@example.com')->exists())->toBeFalse();
})->with(['adresse prise' => 'lina-couture', 'ancienne adresse' => 'chez-lina', 'réservée' => 'templates', 'invalide' => '-ab']);

test('l’inscription exige le nom complet et le nom de la boutique', function () {
    register(['name' => '', 'store_name' => ''])->assertSessionHasErrors(['name', 'store_name']);
});
