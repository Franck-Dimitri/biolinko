<?php

use App\Models\Order;
use App\Models\OrderReport;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Whatsapp\WhatsappGatewayService;
use App\Support\StoreUrl;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mock(WhatsappGatewayService::class)->shouldIgnoreMissing();
    $this->seller = User::factory()->create();
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Douceurs', 'slug' => 'douceurs', 'is_published' => true]);
    Wallet::create(['store_id' => $this->store->id, 'balance_available' => 0, 'balance_pending' => 0]);
    $this->gateau = Product::create(['store_id' => $this->store->id, 'title' => 'Gâteau', 'slug' => 'gateau', 'price_vendor' => 15000, 'stock' => 5, 'is_active' => true]);
    $this->bougies = Product::create(['store_id' => $this->store->id, 'title' => 'Bougies', 'slug' => 'bougies', 'price_vendor' => 500, 'stock' => 20, 'is_active' => true]);
    $this->carte = Product::create(['store_id' => $this->store->id, 'title' => 'Carte', 'slug' => 'carte', 'price_vendor' => 1500, 'stock' => 20, 'is_active' => true]);

    $this->order = Order::create([
        'tracking_code' => 'BLK-CMD-PARENT', 'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237699887766',
        'payment_phone' => '237699887766', 'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 17000, 'subtotal' => 15000,
        'delivery_fee' => 2000, 'saas_margin' => 600, 'api_fee' => 0, 'total_client' => 17600, 'status' => 'pending', 'payment_status' => 'pending',
    ]);
    $this->order->items()->create(['product_id' => $this->gateau->id, 'product_title' => 'Gâteau', 'quantity' => 1, 'unit_price_vendor' => 15000, 'total_price_vendor' => 15000]);
    $this->order->markAsPaid();
});

function addon(array $data = [])
{
    return test()->postJson(route('order.addon', 'BLK-CMD-PARENT'), $data + ['product_id' => test()->carte->id, 'quantity' => 1]);
}

test('la page de suivi d’une commande payée propose des articles à ajouter', function () {
    $this->get(route('order.track', 'BLK-CMD-PARENT'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('OrderTracking/Show')
        // Les bougies (500 FCFA) se prennent par 2 pour atteindre le minimum d’un paiement ; le gâteau est déjà commandé
        ->where('addonOffers.0.title', 'Bougies')->where('addonOffers.0.min_quantity', 2)
        ->where('addonOffers.1.title', 'Carte')->where('addonOffers.1.min_quantity', 1)
        ->has('addonOffers', 2));
});

test('un ajout crée une commande liée, livrée avec la commande et sans frais de livraison', function () {
    $response = addon(['quantity' => 2])->assertOk();

    $child = Order::where('parent_order_id', $this->order->id)->firstOrFail();
    expect($response->json('payment_url'))->toBe(StoreUrl::payment($child))
        ->and((float) $child->delivery_fee)->toBe(0.0)
        ->and((float) $child->price_vendor)->toBe(3000.0)
        ->and((float) $child->total_client)->toBe(3000 + Order::clientFee(3000))
        ->and($child->payment_status)->toBe('pending')
        ->and($child->city)->toBe('Douala')
        ->and($child->items()->first()->product_title)->toBe('Carte');

    // Une fois payé, le client revient sur le suivi de la commande d’origine
    $child->markAsPaid();
    $this->getJson(route('checkout.status', $child->tracking_code))->assertJson(['paid' => true, 'redirect_url' => StoreUrl::track($this->order)]);
    $this->get(route('order.track', 'BLK-CMD-PARENT'))->assertInertia(fn (Assert $page) => $page->where('addons.0.paid', true));
});

test('un article déjà ajouté n’est plus proposé', function () {
    addon()->assertOk();

    $this->get(route('order.track', 'BLK-CMD-PARENT'))->assertInertia(fn (Assert $page) => $page
        ->has('addonOffers', 1)->where('addonOffers.0.title', 'Bougies')->where('addons.0.paid', false));
});

test('un ajout est refusé une fois la commande partie en livraison', function () {
    $this->actingAs($this->seller)->patch(route('orders.updateStatus', $this->order->id), ['status' => 'in_delivery']);

    addon()->assertStatus(422)->assertJsonFragment(['error' => 'Votre commande est déjà en route : il n’est plus possible d’y ajouter un article.']);
    $this->get(route('order.track', 'BLK-CMD-PARENT'))->assertInertia(fn (Assert $page) => $page->has('addonOffers', 0));
});

test('un ajout en attente ne peut plus être payé si la commande est partie entre-temps', function () {
    addon()->assertOk();
    $child = Order::where('parent_order_id', $this->order->id)->first();
    $this->actingAs($this->seller)->patch(route('orders.updateStatus', $this->order->id), ['status' => 'in_delivery']);
    auth()->logout();

    $this->get(route('order.payment', $child->tracking_code))->assertRedirect(StoreUrl::track($this->order));
    $this->postJson(route('order.pay', $child->tracking_code))->assertStatus(422);
});

test('les ajouts impossibles sont refusés', function (callable $setup, array $data, string $error) {
    $setup($this);
    addon($data)->assertStatus(422)->assertJsonFragment(['error' => $error]);
})->with([
    'montant sous le minimum' => [fn ($t) => $t->carte = $t->bougies, ['quantity' => 1], 'Le montant minimum d’un paiement est de 1 000 FCFA : augmentez la quantité.'],
    'article d’une autre boutique' => [function ($t) {
        $other = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Autre', 'slug' => 'autre']);
        $t->carte = Product::create(['store_id' => $other->id, 'title' => 'Ailleurs', 'slug' => 'ailleurs', 'price_vendor' => 5000, 'stock' => 3, 'is_active' => true]);
    }, [], 'Cet article n’est plus disponible.'],
    'précision obligatoire' => [fn ($t) => $t->carte->update(['custom_fields' => [['label' => 'Prénom', 'type' => 'text', 'required' => true, 'options' => []]]]), [], '« Carte » demande des précisions : commandez-le depuis la boutique.'],
    'épuisé' => [fn ($t) => $t->carte->update(['stock' => 0]), [], 'Il ne reste pas assez de « Carte ».'],
    'sur commande sans date' => [fn ($t) => $t->carte->update(['fulfillment' => 'made_to_order', 'lead_time_hours' => 48]), [], '« Carte » ne peut pas être prêt à temps pour partir avec votre commande.'],
]);

test('trois ajouts payés au plus par commande', function () {
    foreach (range(1, Order::MAX_ADDONS) as $i) {
        addon()->assertOk();
        Order::where('parent_order_id', $this->order->id)->latest('id')->first()->markAsPaid();
    }
    addon()->assertStatus(422);
});

test('les ajouts payés suivent la livraison et la confirmation de la commande', function () {
    addon()->assertOk();
    $child = Order::where('parent_order_id', $this->order->id)->first();
    $child->markAsPaid();

    $this->actingAs($this->seller)->patch(route('orders.updateStatus', $this->order->id), ['status' => 'delivered'])->assertSessionHasNoErrors();
    $child->refresh();
    expect($child->status)->toBe('delivered')
        ->and($child->delivered_at)->not->toBeNull()
        ->and((int) round(now()->diffInDays($child->funds_release_at)))->toBe(Order::RELEASE_AFTER_DELIVERY_DAYS);

    auth()->logout();
    $this->post(route('order.received', 'BLK-CMD-PARENT'))->assertSessionHasNoErrors();
    expect($child->fresh()->received_confirmed_at)->not->toBeNull()
        ->and($child->fresh()->funds_released_at)->not->toBeNull();
});

test('un signalement sur la commande garde aussi ses ajouts bloqués', function () {
    addon()->assertOk();
    $child = Order::where('parent_order_id', $this->order->id)->first();
    $child->markAsPaid();
    OrderReport::create(['order_id' => $this->order->id, 'store_id' => $this->store->id, 'customer_phone' => '237699887766', 'reason' => 'not_received', 'message' => 'Rien reçu du tout.']);

    $this->travel(Order::MAX_HOLD_DAYS + 1)->days();
    $this->artisan('funds:release');

    expect($child->fresh()->funds_released_at)->toBeNull();
});

test('le vendeur voit qu’une commande est un ajout à livrer avec une autre', function () {
    addon()->assertOk();
    Order::where('parent_order_id', $this->order->id)->first()->markAsPaid();

    $this->actingAs($this->seller)->get(route('orders.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('orders.data.0.parent.tracking_code', 'BLK-CMD-PARENT')
        ->where('orders.data.1.paid_addons_count', 1));
});
