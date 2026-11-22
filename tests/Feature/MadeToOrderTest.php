<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Whatsapp\WhatsappGatewayService;
use App\Support\BusinessTypes;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Http::fake([
        'api.sandbox.pawapay.io/v2/deposits' => Http::response(['status' => 'ACCEPTED'], 200),
        '*' => Http::response([], 200),
    ]);
    $this->mock(WhatsappGatewayService::class)->shouldIgnoreMissing();

    $this->seller = User::factory()->create();
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Gâteaux de Lina', 'slug' => 'gateaux-lina', 'is_published' => true, 'business_type' => 'patisserie']);
    Wallet::create(['store_id' => $this->store->id]);
    $this->cake = Product::create([
        'store_id' => $this->store->id, 'title' => 'Gâteau d’anniversaire', 'slug' => 'gateau', 'price_vendor' => 15000, 'stock' => 0,
        'fulfillment' => 'made_to_order', 'lead_time_hours' => 48, 'daily_capacity' => 2,
        'custom_fields' => [
            ['label' => 'Message sur le gâteau', 'type' => 'text', 'required' => false, 'options' => []],
            ['label' => 'Nombre de parts', 'type' => 'select', 'required' => true, 'options' => ['8 parts', '12 parts']],
        ],
    ]);

    $this->checkout = fn (array $extra = [], array $item = []) => $this->postJson(route('checkout.process'), $extra + [
        'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '677123456',
        'delivery_address' => 'Akwa', 'delivery_city' => 'Douala', 'operator' => 'MTN',
        'desired_date' => now()->addDays(3)->format('Y-m-d'), 'desired_slot' => 'soir',
        'items' => [$item + ['product_id' => $this->cake->id, 'quantity' => 1, 'customizations' => [
            ['label' => 'Message sur le gâteau', 'value' => 'Joyeux anniversaire Awa'],
            ['label' => 'Nombre de parts', 'value' => '12 parts'],
        ]]],
    ]);
});

test('un produit sur commande se commande sans stock, avec la date et les précisions du client', function () {
    ($this->checkout)()->assertOk();

    $order = Order::with('items')->first();
    expect($order->desired_date->format('Y-m-d'))->toBe(now()->addDays(3)->format('Y-m-d'))
        ->and($order->desired_slot)->toBe('soir')
        ->and($order->items[0]->customizations)->toBe([
            ['label' => 'Message sur le gâteau', 'value' => 'Joyeux anniversaire Awa'],
            ['label' => 'Nombre de parts', 'value' => '12 parts'],
        ]);

    // Le paiement ne touche pas au stock d'un produit sur commande
    $order->markAsPaid();
    expect($this->cake->fresh()->stock)->toBe(0);
});

test('la date est obligatoire et doit respecter le délai de préparation', function () {
    ($this->checkout)(['desired_date' => null])->assertStatus(422)->assertJsonValidationErrors('desired_date');
    ($this->checkout)(['desired_date' => now()->format('Y-m-d')])->assertStatus(422)->assertJsonValidationErrors('desired_date');
    expect(Order::count())->toBe(0);
});

test('une précision obligatoire manquante ou un choix invalide est refusé', function () {
    ($this->checkout)([], ['customizations' => [['label' => 'Message sur le gâteau', 'value' => 'Bravo']]])
        ->assertStatus(422)->assertJsonFragment(['error' => 'Précisez « Nombre de parts » pour « Gâteau d’anniversaire ».']);
    ($this->checkout)([], ['customizations' => [['label' => 'Nombre de parts', 'value' => '100 parts']]])->assertStatus(422);
    expect(Order::count())->toBe(0);
});

test('la capacité par jour est respectée', function () {
    ($this->checkout)()->assertOk();
    ($this->checkout)([], ['quantity' => 2])->assertStatus(422)->assertJsonValidationErrors('desired_date');
    ($this->checkout)(['desired_date' => now()->addDays(4)->format('Y-m-d')], ['quantity' => 2])->assertOk();
});

test('le vendeur crée un produit sur commande avec ses champs', function () {
    $this->actingAs($this->seller)->post(route('products.store'), [
        'title' => 'Tarte', 'price_vendor' => 8000, 'stock' => 0, 'min_order_quantity' => 1, 'is_active' => true,
        'fulfillment' => 'made_to_order', 'lead_time_hours' => 24, 'daily_capacity' => 5,
        'custom_fields' => [
            ['label' => 'Parfum', 'type' => 'select', 'required' => 1, 'options' => ['Fraise', 'Citron']],
            ['label' => 'Choix incomplet', 'type' => 'select', 'required' => 0, 'options' => ['Seul']],
        ],
    ])->assertSessionHasNoErrors();

    $p = Product::where('title', 'Tarte')->first();
    expect($p->isMadeToOrder())->toBeTrue()
        ->and($p->lead_time_hours)->toBe(24)
        ->and($p->customFields())->toHaveCount(1) // une liste avec un seul choix est ignorée
        ->and($p->customFields()[0]['options'])->toBe(['Fraise', 'Citron']);
});

test('l’activité choisie règle la catégorie et le vocabulaire de la vitrine', function () {
    $this->actingAs($this->seller)->post(route('appearance.update'), ['name' => 'Gâteaux de Lina', 'slug' => 'gateaux-lina', 'theme_color' => '#FFCC00', 'business_type' => 'services'])
        ->assertSessionHasNoErrors();
    expect($this->store->fresh()->category)->toBe('Services et prestations');

    $this->get('/gateaux-lina')->assertInertia(fn ($page) => $page->where('store.template.cta', 'Réserver'));
});

test('le style de l’activité (motif, police) s’enregistre et s’affiche sur la vitrine', function () {
    $this->actingAs($this->seller)->post(route('appearance.update'), [
        'name' => 'Gâteaux de Lina', 'slug' => 'gateaux-lina', 'theme_color' => '#BE185D', 'business_type' => 'patisserie',
        'font_family' => 'Playfair Display', 'pattern' => 'patisserie-croissants',
    ])->assertSessionHasNoErrors();

    $this->get('/gateaux-lina')->assertInertia(fn ($page) => $page->where('store.pattern', 'patisserie-croissants')->where('store.font_family', 'Playfair Display'));

    $this->actingAs($this->seller)->post(route('appearance.update'), ['name' => 'X', 'slug' => 'gateaux-lina', 'theme_color' => '#BE185D', 'pattern' => 'inconnu'])
        ->assertSessionHasErrors('pattern');
});

test('chaque activité a un style complet', function () {
    foreach (BusinessTypes::all() as $key => $t) {
        expect($t['style']['theme_color'])->toMatch('/^#[0-9A-F]{6}$/i', $key)
            ->and(BusinessTypes::FONTS)->toContain($t['style']['font_family'])
            ->and($t['patterns'])->toHaveCount(3)
            ->and($t['style']['pattern'])->toBe($t['patterns'][0])
            ->and($t['sections'])->toHaveCount(8);
    }
    // Aucun motif partagé entre deux activités
    $all = array_merge(...array_values(BusinessTypes::PATTERNS_BY_TYPE));
    expect($all)->toHaveCount(count(array_unique($all)));
});
