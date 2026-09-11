<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guest accessing unpublished store is redirected to StoreUnavailable error page with 403', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Secrète',
        'slug' => 'boutique-secrete',
        'is_published' => false,
    ]);

    $response = $this->get('/boutique-secrete');

    $response->assertStatus(403);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Errors/StoreUnavailable')
        ->where('reason', 'unpublished')
        ->where('storeName', 'Boutique Secrète')
    );
});

test('owner accessing their unpublished store gets preview mode with 200', function () {
    $owner = User::factory()->create();
    $store = Store::create([
        'user_id' => $owner->id,
        'name' => 'Boutique Mon Espace',
        'slug' => 'boutique-mon-espace',
        'is_published' => false,
    ]);

    $response = $this->actingAs($owner)->get('/boutique-mon-espace');

    $response->assertStatus(200);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Storefront/Boutique')
        ->where('isPreview', true)
    );
});

test('accessing non existent store returns 404 with StoreUnavailable error page', function () {
    $response = $this->get('/slug-qui-nexiste-pas-du-tout');

    $response->assertStatus(404);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Errors/StoreUnavailable')
        ->where('reason', 'not_found')
    );
});

test('accessing store of a banned seller returns 403 with StoreUnavailable error page', function () {
    $bannedUser = User::factory()->create(['is_banned' => true]);
    $store = Store::create([
        'user_id' => $bannedUser->id,
        'name' => 'Boutique Suspendue',
        'slug' => 'boutique-suspendue',
        'is_published' => true,
    ]);

    $response = $this->get('/boutique-suspendue');

    $response->assertStatus(403);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Errors/StoreUnavailable')
        ->where('reason', 'banned')
    );
});

test('accessing non existent product on a store returns 404 with ProductUnavailable error page', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Test Prod',
        'slug' => 'boutique-test-prod',
        'is_published' => true,
    ]);

    $response = $this->get('/boutique-test-prod/p/produit-fantome');

    $response->assertStatus(404);
    $response->assertInertia(fn (Assert $page) => $page
        ->component('Errors/ProductUnavailable')
        ->where('productSlug', 'produit-fantome')
    );
});
