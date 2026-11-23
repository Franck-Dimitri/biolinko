<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Support\StoreUrl;

beforeEach(function () {
    config(['biolinko.store_domain' => 'biolinko.store', 'app.url' => 'https://biolinko.app']);
    $this->seller = User::factory()->create();
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Chez Awa', 'slug' => 'chez-awa', 'is_published' => true]);
});

test('la boutique répond sur son sous-domaine, avec l’adresse d’origine dans le navigateur', function () {
    $this->get('https://chez-awa.biolinko.store/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('Storefront/Boutique')->where('store.slug', 'chez-awa')->url('/'));
});

test('la page produit répond sur /p/<produit> du sous-domaine', function () {
    Product::create(['store_id' => $this->store->id, 'title' => 'Robe', 'slug' => 'robe', 'price_vendor' => 10000, 'stock' => 3, 'is_active' => true]);

    $this->get('https://chez-awa.biolinko.store/p/robe')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('product.slug', 'robe')->url('/p/robe'));
});

test('l’ancienne adresse biolinko.app/<nom> redirige définitivement vers le sous-domaine', function () {
    $this->get('https://biolinko.app/chez-awa?ref=ig')->assertRedirect('https://chez-awa.biolinko.store/?ref=ig')->assertStatus(301);
    $this->get('https://biolinko.app/chez-awa/p/robe')->assertRedirect('https://chez-awa.biolinko.store/p/robe');
});

test('l’aperçu du vendeur reste sur le site principal', function () {
    $this->actingAs($this->seller)->get('https://biolinko.app/chez-awa?apercu=1')->assertOk();
});

test('le domaine des boutiques ne sert ni la connexion ni le tableau de bord', function () {
    $this->get('https://chez-awa.biolinko.store/login')->assertRedirect('https://biolinko.app/login');
    $this->get('https://chez-awa.biolinko.store/dashboard')->assertRedirect('https://biolinko.app/dashboard');
    $this->get('https://biolinko.store/')->assertRedirect('https://biolinko.app/');
});

test('une boutique ne peut pas afficher une autre boutique sous son domaine', function () {
    Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Autre', 'slug' => 'autre', 'is_published' => true]);

    // /autre n'est pas un chemin d'achat : renvoyé vers le site, qui redirige vers autre.biolinko.store
    $this->get('https://chez-awa.biolinko.store/autre')->assertRedirect('https://biolinko.app/autre');
});

test('le suivi de commande et la caisse fonctionnent sur le domaine de la boutique', function () {
    $order = Order::create([
        'uuid' => 'u-1', 'tracking_code' => 'BLK-SUB1', 'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237699887766',
        'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 10000, 'saas_margin' => 300, 'api_fee' => 0, 'total_client' => 10300,
        'status' => 'pending', 'payment_status' => 'pending',
    ]);

    $this->get('https://chez-awa.biolinko.store/track/BLK-SUB1')->assertOk();
    expect(StoreUrl::track($order))->toBe('https://chez-awa.biolinko.store/track/BLK-SUB1');
});

test('chaque boutique a son plan du site, le site principal n’en liste aucune', function () {
    $this->get('https://chez-awa.biolinko.store/sitemap.xml')->assertOk()->assertSee('https://chez-awa.biolinko.store/', false);
    $this->get('https://chez-awa.biolinko.store/robots.txt')->assertSee('Sitemap: https://chez-awa.biolinko.store/sitemap.xml', false);
    $this->get('https://biolinko.app/sitemap.xml')->assertOk()->assertDontSee('chez-awa', false);
});

test('les adresses de boutique sont des sous-domaines valides', function () {
    foreach (['Chez_Awa', '-awa', 'awa-', 'ab', 'www'] as $bad) {
        $this->actingAs($this->seller)->post(route('appearance.update'), ['name' => 'Chez Awa', 'slug' => $bad, 'theme_color' => '#FFCC00'])
            ->assertSessionHasErrors('slug');
    }
});

test('sans domaine des boutiques (local), tout reste sur le site', function () {
    config(['biolinko.store_domain' => null]);
    $this->get('https://biolinko.app/chez-awa')->assertOk();
    expect(StoreUrl::home('chez-awa'))->toBe('https://biolinko.app/chez-awa');
});
