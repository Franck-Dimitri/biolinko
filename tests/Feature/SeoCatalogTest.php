<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\StoreReview;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['app.url' => 'https://biolinko.link']);
    $this->mock(\App\Services\Whatsapp\WhatsappGatewayService::class)->shouldIgnoreMissing();
    $this->seller = User::factory()->create();
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Wax Shop', 'slug' => 'wax-shop', 'is_published' => true, 'city_location' => 'Douala', 'category' => 'Mode']);
    Wallet::create(['store_id' => $this->store->id]);
    $this->product = Product::create(['store_id' => $this->store->id, 'title' => 'Robe wax évasée', 'slug' => 'robe-wax', 'price_vendor' => 15000,
        'stock' => 4, 'is_active' => true, 'category' => 'Robes', 'description' => "Robe en <b>wax</b> 100 % coton.\nTailles S à XL.", 'image_url' => '/storage/products/robe.jpg']);
});

/** Balises JSON-LD de la page, décodées. */
function jsonLd(string $html): array
{
    preg_match_all('#<script type="application/ld\+json">(.*?)</script>#s', $html, $m);

    return array_map(fn ($j) => json_decode($j, true, flags: JSON_THROW_ON_ERROR), $m[1]);
}

test('la page produit expose titre, description, canonique, aperçu et données Product valides', function () {
    StoreReview::create(['store_id' => $this->store->id, 'product_id' => $this->product->id, 'customer_name' => 'Awa', 'rating' => 4, 'comment' => 'Très belle', 'is_featured' => true]);
    StoreReview::create(['store_id' => $this->store->id, 'product_id' => $this->product->id, 'customer_name' => 'Ines', 'rating' => 5, 'comment' => 'Parfaite', 'is_featured' => true]);

    $html = $this->get('/wax-shop/p/robe-wax')->assertOk()->getContent();

    expect($html)->toContain('<title inertia>Robe wax évasée | Wax Shop</title>')
        ->toContain('<meta name="robots" content="index, follow, max-image-preview:large">')
        ->toContain('<link rel="canonical" href="https://biolinko.link/wax-shop/p/robe-wax">')
        ->toContain('<meta property="og:image" content="https://biolinko.link/storage/products/robe.jpg">')
        ->toContain('<meta property="product:price:amount" content="15000">')
        ->toContain('Robe wax évasée à 15 000 FCFA chez Wax Shop (Douala). Robe en wax 100 % coton. Tailles S à XL.')
        ->toContain('<html lang="fr">');

    [$product, $crumbs] = jsonLd($html);
    expect($product['@type'])->toBe('Product')
        ->and($product['offers']['price'])->toBe('15000')
        ->and($product['offers']['priceCurrency'])->toBe('XAF')
        ->and($product['offers']['availability'])->toBe('https://schema.org/InStock')
        ->and($product['category'])->toBe('Robes')
        ->and($product['aggregateRating'])->toMatchArray(['ratingValue' => '4.5', 'reviewCount' => 2])
        ->and($product['review'])->toHaveCount(2)
        ->and($crumbs['itemListElement'])->toHaveCount(3)
        ->and($crumbs['itemListElement'][1]['name'])->toBe('Robes');
});

test('le titre et la description personnalisés du vendeur sont utilisés', function () {
    $this->product->update(['seo_title' => 'Robe wax Douala pas chère', 'seo_description' => 'Livrée en 24 h à Douala.']);
    $html = $this->get('/wax-shop/p/robe-wax')->getContent();
    expect($html)->toContain('<title inertia>Robe wax Douala pas chère</title>')->toContain('content="Livrée en 24 h à Douala."');
});

test('un produit épuisé est signalé OutOfStock', function () {
    $this->product->update(['stock' => 0]);
    expect(jsonLd($this->get('/wax-shop/p/robe-wax')->getContent())[0]['offers']['availability'])->toBe('https://schema.org/OutOfStock');
});

test('la boutique expose OnlineStore et la liste de ses produits', function () {
    $html = $this->get('/wax-shop')->assertOk()->getContent();
    expect($html)->toContain('<link rel="canonical" href="https://biolinko.link/wax-shop">')->toContain('Wax Shop : Mode à Douala | Biolinko');
    [$org, $list] = jsonLd($html);
    expect($org['@type'])->toBe('OnlineStore')->and($org['address']['addressLocality'])->toBe('Douala')
        ->and($list['itemListElement'][0]['url'])->toBe('https://biolinko.link/wax-shop/p/robe-wax');
});

test('une boutique non publiée, le suivi de commande et l’espace vendeur ne sont pas indexés', function () {
    $this->store->update(['is_published' => false]);
    $this->actingAs($this->seller)->get('/wax-shop')->assertSee('noindex, nofollow', false)->assertDontSee('application/ld+json', false);
    $this->actingAs($this->seller)->get(route('seller.dashboard'))->assertSee('noindex, nofollow', false);
});

test('l’accueil est indexable avec son aperçu de partage', function () {
    $this->get('/')->assertSee('og:image" content="https://biolinko.link/images/brand/og-biolinko.jpg', false)
        ->assertSee('index, follow', false)->assertSee('"@type":"Organization"', false);
});

test('le plan du site liste les boutiques publiées et leurs produits actifs, avec images', function () {
    Product::create(['store_id' => $this->store->id, 'title' => 'Caché', 'slug' => 'cache', 'price_vendor' => 1000, 'stock' => 1, 'is_active' => false]);
    $banned = User::factory()->create(['is_banned' => true]);
    Store::create(['user_id' => $banned->id, 'name' => 'Bannie', 'slug' => 'bannie', 'is_published' => true]);
    Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Brouillon', 'slug' => 'brouillon', 'is_published' => false]);

    $xml = $this->get('/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8')->getContent();
    expect(simplexml_load_string($xml))->not->toBeFalse();
    expect($xml)->toContain('<loc>https://biolinko.link/wax-shop</loc>')
        ->toContain('<loc>https://biolinko.link/wax-shop/p/robe-wax</loc>')
        ->toContain('<image:loc>https://biolinko.link/storage/products/robe.jpg</image:loc>')
        ->not->toContain('/p/cache')->not->toContain('/bannie')->not->toContain('/brouillon');
});

test('robots.txt bloque les espaces privés et indique le plan du site', function () {
    $this->get('/robots.txt')->assertOk()->assertSee('Disallow: /seller/')->assertSee('Disallow: /track/')
        ->assertSee('Sitemap: https://biolinko.link/sitemap.xml');
});

test('le vendeur enregistre une catégorie et le référencement de ses produits et de sa boutique', function () {
    $this->actingAs($this->seller)->post(route('products.update.post', $this->product), ['category' => '  Sacs ', 'seo_title' => 'Sac cuir', 'seo_description' => null])
        ->assertSessionHasNoErrors();
    expect($this->product->fresh()->only('category', 'seo_title'))->toBe(['category' => 'Sacs', 'seo_title' => 'Sac cuir']);

    $this->actingAs($this->seller)->post(route('seller.seo.update'), ['seo_title' => str_repeat('a', 71)])->assertSessionHasErrors('seo_title');
    $this->actingAs($this->seller)->post(route('seller.seo.update'), ['seo_title' => 'Pagnes wax à Douala', 'seo_description' => ''])->assertSessionHasNoErrors();
    expect($this->store->fresh()->seo_title)->toBe('Pagnes wax à Douala')->and($this->store->fresh()->seo_description)->toBeNull();
});

test('avis produit : « Achat vérifié » seulement avec une commande payée contenant ce produit', function () {
    $order = Order::create(['tracking_code' => 'BLK-CMD-AVIS', 'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677123456',
        'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 15000, 'saas_margin' => 525, 'api_fee' => 0, 'total_client' => 15525,
        'status' => 'pending', 'payment_status' => 'pending']);
    $order->items()->create(['product_id' => $this->product->id, 'product_title' => 'Robe', 'quantity' => 1, 'unit_price_vendor' => 15000, 'total_price_vendor' => 15000]);

    $review = fn ($code) => $this->post(route('storefront.reviews.store', 'wax-shop'), ['product_id' => $this->product->id, 'customer_name' => 'Awa', 'rating' => 5, 'comment' => 'Superbe robe', 'tracking_code' => $code]);

    $review('BLK-CMD-AVIS');
    expect(StoreReview::latest('id')->first()->is_verified)->toBeFalse(); // commande pas encore payée

    $order->markAsPaid();
    $review('BLK-CMD-AVIS');
    $last = StoreReview::latest('id')->first();
    expect($last->is_verified)->toBeTrue()->and($last->product_id)->toBe($this->product->id);

    $other = Product::create(['store_id' => $this->store->id, 'title' => 'Sac', 'slug' => 'sac', 'price_vendor' => 5000, 'stock' => 3, 'is_active' => true]);
    $this->post(route('storefront.reviews.store', 'wax-shop'), ['product_id' => $other->id, 'customer_name' => 'Awa', 'rating' => 5, 'comment' => 'Bien', 'tracking_code' => 'BLK-CMD-AVIS']);
    expect(StoreReview::latest('id')->first()->is_verified)->toBeFalse();

    $this->get('/wax-shop/p/robe-wax')->assertInertia(fn ($p) => $p->where('rating.count', 2)->has('productReviews', 2));
});

test('un avis sur un produit d’une autre boutique est refusé', function () {
    $other = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'O', 'slug' => 'o']);
    $foreign = Product::create(['store_id' => $other->id, 'title' => 'X', 'slug' => 'x', 'price_vendor' => 1000, 'stock' => 1, 'is_active' => true]);
    $this->post(route('storefront.reviews.store', 'wax-shop'), ['product_id' => $foreign->id, 'customer_name' => 'A', 'rating' => 1, 'comment' => 'Faux avis'])
        ->assertSessionHasErrors('product_id');
    expect(StoreReview::count())->toBe(0);
});

test('panier abandonné : un paiement échoué reste relançable 7 jours et la relance est mesurée', function () {
    Http::fake(['api.sandbox.pawapay.io/v2/deposits' => Http::response(['status' => 'ACCEPTED']), '*' => Http::response([], 200)]);
    $order = Order::create(['tracking_code' => 'BLK-CMD-ABAN', 'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677123456',
        'payment_phone' => '237677123456', 'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 15000, 'saas_margin' => 525, 'api_fee' => 0,
        'total_client' => 15525, 'status' => 'cancelled', 'payment_status' => 'failed', 'payment_country' => 'CM']);
    $order->items()->create(['product_id' => $this->product->id, 'product_title' => 'Robe', 'quantity' => 1, 'unit_price_vendor' => 15000, 'total_price_vendor' => 15000]);

    $this->actingAs($this->seller)->get(route('customers.index'))->assertInertia(fn ($p) => $p->has('abandonedOrders', 1));
    $this->actingAs($this->seller)->post(route('customers.abandoned.reminded', $order))->assertRedirect();
    expect($order->fresh()->payment_reminded_at)->not->toBeNull();

    $this->get('/track/BLK-CMD-ABAN')->assertInertia(fn ($p) => $p->where('canPay', true));
    $this->postJson(route('order.pay', 'BLK-CMD-ABAN'))->assertOk();
    expect($order->fresh()->only('status', 'payment_status'))->toBe(['status' => 'pending', 'payment_status' => 'pending']);

    $order->fresh()->markAsPaid();
    $this->actingAs($this->seller)->get(route('customers.index'))
        ->assertInertia(fn ($p) => $p->has('abandonedOrders', 0)->where('recovery.count', 1)->where('recovery.amount', 15000));
});

test('panier abandonné : trop ancien, annulé par le vendeur, ou client ayant payé depuis : plus relançable', function () {
    $base = ['store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677123456', 'city' => 'Douala', 'address_details' => 'Akwa',
        'price_vendor' => 15000, 'saas_margin' => 525, 'api_fee' => 0, 'total_client' => 15525];
    $old = Order::create($base + ['tracking_code' => 'BLK-OLD', 'status' => 'cancelled', 'payment_status' => 'failed']);
    $old->forceFill(['created_at' => now()->subDays(8)])->save();
    Order::create($base + ['tracking_code' => 'BLK-SELLER', 'status' => 'cancelled', 'payment_status' => 'pending']);
    expect($old->fresh()->isRecoverable())->toBeFalse();
    $this->postJson(route('order.pay', 'BLK-OLD'))->assertStatus(422);

    $recent = Order::create($base + ['tracking_code' => 'BLK-REC', 'status' => 'pending', 'payment_status' => 'pending']);
    $this->actingAs($this->seller)->get(route('customers.index'))->assertInertia(fn ($p) => $p->has('abandonedOrders', 1));
    $paid = Order::create($base + ['tracking_code' => 'BLK-PAID', 'status' => 'pending', 'payment_status' => 'pending']);
    $paid->forceFill(['created_at' => now()->addMinute()])->save();
    $paid->markAsPaid();
    $this->actingAs($this->seller)->get(route('customers.index'))->assertInertia(fn ($p) => $p->has('abandonedOrders', 0));
});

test('le client télécharge la vraie facture PDF depuis le suivi, seulement une fois payée', function () {
    $order = Order::create(['tracking_code' => 'BLK-CMD-FACT', 'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677123456',
        'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 15000, 'saas_margin' => 525, 'api_fee' => 0, 'total_client' => 15525,
        'status' => 'pending', 'payment_status' => 'pending']);
    $this->get(route('order.invoice', 'BLK-CMD-FACT'))->assertNotFound();

    $order->markAsPaid();
    $res = $this->get(route('order.invoice', 'BLK-CMD-FACT'))->assertOk()->assertHeader('Content-Type', 'application/pdf');
    expect(substr($res->getContent(), 0, 4))->toBe('%PDF');
    $this->get(route('order.invoice', 'BLK-INCONNU'))->assertNotFound();
});
