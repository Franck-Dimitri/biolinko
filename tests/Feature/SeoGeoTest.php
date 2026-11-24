<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Support\IndexNow;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['app.url' => 'https://biolinko.app', 'biolinko.store_domain' => 'biolinko.store']);
    $this->seller = User::factory()->create(['role' => 'seller']);
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Douceurs Awa', 'slug' => 'douceurs-awa', 'is_published' => true, 'city_location' => 'Douala',
        'business_type' => 'patisserie', 'location_address' => 'Akwa, rue Joffre', 'phone_whatsapp' => '+237690000000',
        'opening_schedule' => ['mon' => ['open' => '08:00', 'close' => '18:00'], 'sun' => null]]);
    Wallet::create(['store_id' => $this->store->id]);
    $this->cake = Product::create(['store_id' => $this->store->id, 'title' => 'Gâteau chocolat', 'slug' => 'gateau-chocolat', 'price_vendor' => 12000, 'stock' => 0,
        'fulfillment' => 'made_to_order', 'lead_time_hours' => 48, 'is_active' => true, 'description' => 'Chocolat noir, 8 parts.']);
});

function ldOf(string $html): array
{
    preg_match_all('#<script type="application/ld\+json">(.*?)</script>#s', $html, $m);

    return array_map(fn ($j) => json_decode($j, true), $m[1]);
}

function ldType(array $blocks, string $type): ?array
{
    return collect($blocks)->first(fn ($b) => in_array($type, (array) $b['@type'], true));
}

test('l’accueil décrit Biolinko : logiciel avec ses vraies formules et la FAQ affichée', function () {
    $ld = ldOf($this->get('https://biolinko.app/')->assertOk()->getContent());

    $app = ldType($ld, 'SoftwareApplication');
    expect(collect($app['offers'])->pluck('price', 'name')->all())->toBe(['Starter' => '0', 'Pro' => '2500', 'Growth' => '7000', 'Business' => '12000'])
        ->and(ldType($ld, 'Organization')['email'])->toBe('contact@biolinko.app');
    $faq = json_decode(file_get_contents(resource_path('data/faq.json')), true);
    expect(ldType($ld, 'FAQPage')['mainEntity'])->toHaveCount(count($faq))
        ->and(ldType($ld, 'FAQPage')['mainEntity'][0]['name'])->toBe($faq[0]['q']);
});

test('un produit sur commande est « sur commande », pas en rupture, et les variantes donnent une fourchette de prix', function () {
    ProductVariant::create(['product_id' => $this->cake->id, 'size' => '12 parts', 'price' => 18000, 'stock_quantity' => 10]);

    $offer = ldType(ldOf($this->get('https://douceurs-awa.biolinko.store/p/gateau-chocolat')->assertOk()->getContent()), 'Product')['offers'];
    expect($offer['@type'])->toBe('AggregateOffer')
        ->and($offer['availability'])->toBe('https://schema.org/MadeToOrder')
        ->and([$offer['lowPrice'], $offer['highPrice']])->toBe(['12000', '18000']);
});

test('une boutique avec adresse et horaires est aussi un commerce local', function () {
    $shop = ldType(ldOf($this->get('https://douceurs-awa.biolinko.store/')->assertOk()->getContent()), 'OnlineStore');

    expect($shop['@type'])->toBe(['OnlineStore', 'LocalBusiness'])
        ->and($shop['telephone'])->toBe('+237690000000')
        ->and($shop['address']['streetAddress'])->toBe('Akwa, rue Joffre')
        ->and($shop['openingHoursSpecification'])->toHaveCount(1)
        ->and($shop['openingHoursSpecification'][0]['dayOfWeek'])->toBe('https://schema.org/Monday')
        ->and($shop['paymentAccepted'])->toContain('Mobile Money');
});

test('robots.txt accueille les moteurs IA et relie chaque boutique au plan de toutes les boutiques', function () {
    $main = $this->get('https://biolinko.app/robots.txt')->assertOk()->getContent();
    expect($main)->toContain('User-agent: GPTBot')->toContain('User-agent: ClaudeBot')->toContain('User-agent: PerplexityBot')
        ->toContain('Disallow: /seller/')->toContain('Sitemap: https://biolinko.app/sitemap.xml');

    $shop = $this->get('https://douceurs-awa.biolinko.store/robots.txt')->assertOk()->getContent();
    expect($shop)->toContain('Sitemap: https://douceurs-awa.biolinko.store/sitemap.xml')->toContain('Sitemap: https://biolinko.app/sitemap-boutiques.xml');
});

test('le plan du site est un index ; celui des boutiques liste les sous-domaines publiés seulement', function () {
    $hidden = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Brouillon', 'slug' => 'brouillon', 'is_published' => false]);

    expect($this->get('https://biolinko.app/sitemap.xml')->assertOk()->getContent())->toContain('<sitemapindex')->toContain('https://biolinko.app/sitemap-boutiques.xml');
    expect($this->get('https://biolinko.app/sitemap-pages.xml')->getContent())->toContain('https://biolinko.app/aide/')->toContain('/politique-des-cookies');
    expect($this->get('https://biolinko.app/sitemap-boutiques.xml')->getContent())
        ->toContain('https://douceurs-awa.biolinko.store/')->toContain('https://douceurs-awa.biolinko.store/p/gateau-chocolat')
        ->not->toContain('brouillon');
});

test('llms.txt résume Biolinko et chaque boutique pour les assistants IA', function () {
    expect($this->get('https://biolinko.app/llms.txt')->assertOk()->getContent())->toStartWith('# Biolinko')
        ->toContain('Pro : 2 500 FCFA par mois, commission de 8 % par vente')->toContain('## Centre d’aide')->toContain('## Questions fréquentes');

    expect($this->get('https://douceurs-awa.biolinko.store/llms.txt')->assertOk()->getContent())->toStartWith('# Douceurs Awa')
        ->toContain('- Ville : Douala')->toContain('[Gâteau chocolat](https://douceurs-awa.biolinko.store/p/gateau-chocolat) : 12 000 FCFA · sur commande');

    $this->store->update(['is_published' => false]);
    $this->get('https://douceurs-awa.biolinko.store/llms.txt')->assertNotFound();
});

test('IndexNow envoie les adresses par domaine, avec la clé servie par chaque domaine', function () {
    config(['services.indexnow.key' => 'cle-test-1234']);
    app()->detectEnvironment(fn () => 'production');
    Http::fake();

    IndexNow::queue('https://douceurs-awa.biolinko.store/p/gateau-chocolat', 'https://douceurs-awa.biolinko.store/', 'https://biolinko.app/');
    IndexNow::flush();

    Http::assertSentCount(2);
    Http::assertSent(fn ($r) => $r['host'] === 'douceurs-awa.biolinko.store' && count($r['urlList']) === 2
        && $r['keyLocation'] === 'https://douceurs-awa.biolinko.store/indexnow-cle-test-1234.txt');
    app()->detectEnvironment(fn () => 'testing');

    $this->get('https://douceurs-awa.biolinko.store/indexnow-cle-test-1234.txt')->assertOk()->assertSee('cle-test-1234');
    $this->get('https://biolinko.app/indexnow-autre-cle-999.txt')->assertNotFound();
});
