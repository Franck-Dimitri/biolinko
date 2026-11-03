<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\PromoCode;
use App\Models\SmartLink;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    Http::fake([
        'api.sandbox.pawapay.io/v2/deposits' => Http::response(['status' => 'ACCEPTED'], 200),
        '*' => Http::response([], 200),
    ]);
    $this->mock(\App\Services\WhatsappGatewayService::class)->shouldIgnoreMissing();

    $this->seller = User::factory()->create();
    $this->store = Store::create([
        'user_id' => $this->seller->id, 'name' => 'Wax Shop', 'slug' => 'wax-shop', 'is_published' => true,
        'delivery_zones' => [['name' => 'Douala', 'fee' => 1000], ['name' => 'Yaoundé', 'fee' => 2000]],
        'delivery_other_fee' => null,
        'delivery_free_from' => 30000,
    ]);
    Wallet::create(['store_id' => $this->store->id]);
    $this->product = Product::create(['store_id' => $this->store->id, 'title' => 'Robe', 'slug' => 'robe', 'price_vendor' => 10000, 'min_order_quantity' => 1, 'stock' => 10]);

    $this->checkout = fn (array $extra = []) => $this->postJson(route('checkout.process'), $extra + [
        'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '677123456',
        'delivery_address' => 'Akwa', 'delivery_city' => 'Douala', 'operator' => 'MTN',
        'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
    ]);
});

test('la livraison de la zone s’ajoute et les frais de service portent sur le total', function () {
    ($this->checkout)(['delivery_city' => 'yaoundé'])->assertOk();

    $o = Order::first();
    expect((float) $o->subtotal)->toBe(10000.0)
        ->and((float) $o->delivery_fee)->toBe(2000.0)
        ->and((float) $o->price_vendor)->toBe(12000.0)
        ->and((float) $o->saas_margin)->toBe(420.0)
        ->and((float) $o->total_client)->toBe(12420.0);
});

test('une ville hors zones est refusée quand le vendeur ne livre pas ailleurs', function () {
    ($this->checkout)(['delivery_city' => 'Garoua'])->assertStatus(422)->assertJsonFragment(['error' => 'Wax Shop ne livre pas à Garoua. Choisissez une ville de livraison proposée.']);
    expect(Order::count())->toBe(0);
});

test('les autres villes paient le tarif « autres villes »', function () {
    $this->store->update(['delivery_other_fee' => 3000]);
    ($this->checkout)(['delivery_city' => 'Garoua'])->assertOk();
    expect((float) Order::first()->delivery_fee)->toBe(3000.0);
});

test('la livraison est offerte au-delà du seuil', function () {
    ($this->checkout)(['items' => [['product_id' => $this->product->id, 'quantity' => 3]]])->assertOk();
    expect((float) Order::first()->delivery_fee)->toBe(0.0);
});

test('un code promo en pourcentage réduit les articles, pas la livraison', function () {
    PromoCode::create(['store_id' => $this->store->id, 'code' => 'NOEL10', 'type' => 'percent', 'value' => 10]);

    ($this->checkout)(['promo_code' => ' noel10 '])->assertOk();

    $o = Order::first();
    expect((float) $o->discount_amount)->toBe(1000.0)
        ->and($o->promo_code)->toBe('NOEL10')
        ->and((float) $o->price_vendor)->toBe(10000.0) // 10 000 − 1 000 + 1 000 de livraison
        ->and((float) $o->total_client)->toBe(10350.0);
});

test('la commission ne porte pas sur la livraison et le code n’est compté qu’au paiement', function () {
    $promo = PromoCode::create(['store_id' => $this->store->id, 'code' => 'FIX', 'type' => 'fixed', 'value' => 2000]);
    ($this->checkout)(['promo_code' => 'FIX'])->assertOk();
    $o = Order::first();
    expect($promo->fresh()->used_count)->toBe(0);

    $o->markAsPaid();
    $o->refresh();

    // Articles 8 000 (après remise) × 7 % Starter = 560 ; livraison 1 000 exclue
    expect((float) $o->commission_amount)->toBe(560.0)
        ->and($o->sellerNet())->toBe(8440.0)
        ->and($promo->fresh()->used_count)->toBe(1);
});

test('un code expiré, épuisé, sous le minimum ou inconnu est refusé', function (array $attrs, string $message) {
    PromoCode::create(['store_id' => $this->store->id, 'code' => 'X', 'type' => 'percent', 'value' => 10] + $attrs);
    ($this->checkout)(['promo_code' => 'X'])->assertStatus(422)->assertJsonPath('errors.promo_code.0', $message);
})->with([
    [['ends_at' => now()->subDay()], 'Ce code promo a expiré.'],
    [['max_uses' => 2, 'used_count' => 2], 'Ce code promo a atteint son nombre maximum d’utilisations.'],
    [['min_subtotal' => 20000], 'Ce code est valable dès 20 000 FCFA d’achat.'],
    [['is_active' => false], 'Ce code promo n’est plus actif.'],
]);

test('un code d’une autre boutique n’existe pas ici', function () {
    $other = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'O', 'slug' => 'o']);
    PromoCode::create(['store_id' => $other->id, 'code' => 'AUTRE', 'type' => 'percent', 'value' => 50]);
    $this->postJson(route('checkout.promo'), ['store_id' => $this->store->id, 'code' => 'AUTRE', 'subtotal' => 10000])->assertJson(['valid' => false]);
});

test('la vérification depuis le panier renvoie la remise', function () {
    PromoCode::create(['store_id' => $this->store->id, 'code' => 'BIENVENUE', 'type' => 'fixed', 'value' => 1500]);
    $this->postJson(route('checkout.promo'), ['store_id' => $this->store->id, 'code' => 'bienvenue', 'subtotal' => 10000])
        ->assertJson(['valid' => true, 'code' => 'BIENVENUE', 'discount' => 1500]);
});

test('la remise ne peut pas faire passer la commande sous le minimum', function () {
    $this->store->update(['delivery_zones' => [], 'delivery_other_fee' => null]);
    PromoCode::create(['store_id' => $this->store->id, 'code' => 'GROS', 'type' => 'fixed', 'value' => 9500]);
    ($this->checkout)(['promo_code' => 'GROS'])->assertStatus(422);
});

test('un code promo ne s’applique pas à un pack', function () {
    PromoCode::create(['store_id' => $this->store->id, 'code' => 'NOEL10', 'type' => 'percent', 'value' => 10]);
    $link = SmartLink::create(['store_id' => $this->store->id, 'title' => 'Pack', 'code' => 'PK1', 'items' => [['product_id' => $this->product->id, 'quantity' => 1]], 'total_amount' => 9000, 'is_active' => true]);

    $this->postJson(route('smartlink.checkout', $link->code), [
        'customer_name' => 'Awa', 'customer_phone' => '677123456', 'delivery_address' => 'Akwa', 'delivery_city' => 'Douala', 'operator' => 'MTN', 'promo_code' => 'NOEL10',
    ])->assertOk();

    $o = Order::first();
    expect((float) $o->discount_amount)->toBe(0.0)->and((float) $o->price_vendor)->toBe(10000.0);
});

test('sans zones configurées la livraison n’est pas facturée', function () {
    $this->store->update(['delivery_zones' => null, 'delivery_other_fee' => null]);
    ($this->checkout)(['delivery_city' => 'Garoua'])->assertOk();
    expect((float) Order::first()->delivery_fee)->toBe(0.0);
});

test('le vendeur gère ses zones et ses codes, dans la limite de son plan', function () {
    $this->actingAs($this->seller)->get(route('seller.selling.index'))->assertOk();

    $this->actingAs($this->seller)->post(route('seller.delivery.update'), [
        'zones' => [['name' => 'Douala', 'fee' => 500], ['name' => 'Kribi', 'fee' => 1500]], 'other_fee' => 2500, 'free_from' => null,
    ])->assertSessionHasNoErrors();
    expect($this->store->fresh()->delivery_zones)->toHaveCount(2)->and($this->store->fresh()->delivery_other_fee)->toBe(2500.0);

    $this->actingAs($this->seller)->post(route('seller.promos.store'), ['code' => 'noel 10', 'type' => 'percent', 'value' => 10])->assertSessionHasNoErrors();
    expect(PromoCode::first()->code)->toBe('NOEL10');

    // Starter : un seul code actif
    $this->actingAs($this->seller)->post(route('seller.promos.store'), ['code' => 'DEUX', 'type' => 'fixed', 'value' => 500])->assertSessionHasErrors('code');
    $this->actingAs($this->seller)->post(route('seller.promos.store'), ['code' => 'DEUX', 'type' => 'percent', 'value' => 95])->assertSessionHasErrors('value');
});

test('un vendeur ne touche pas aux codes d’un autre', function () {
    $other = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'O', 'slug' => 'o']);
    $promo = PromoCode::create(['store_id' => $other->id, 'code' => 'AUTRE', 'type' => 'percent', 'value' => 10]);
    $this->actingAs($this->seller)->delete(route('seller.promos.destroy', $promo))->assertForbidden();
    $this->actingAs($this->seller)->patch(route('seller.promos.toggle', $promo))->assertForbidden();
});

test('acompte : le client paie une partie en ligne, le reste au livreur, la commission porte sur toute la vente', function () {
    $this->store->update(['deposit_percent' => 30]);

    // 2 robes = 20 000 + 1 000 de livraison à Douala = 21 000 ; acompte 30 % = 6 300
    ($this->checkout)(['payment_mode' => 'deposit', 'items' => [['product_id' => $this->product->id, 'quantity' => 2]]])->assertOk();
    $o = Order::first();
    expect((float) $o->price_vendor)->toBe(21000.0)
        ->and((float) $o->balance_due)->toBe(14700.0)
        ->and((float) $o->saas_margin)->toBe(221.0)
        ->and((float) $o->total_client)->toBe(6521.0);

    $o->markAsPaid();
    $o->refresh();
    // Commission Starter 7 % sur 20 000 d'articles = 1 400, prélevée sur l'acompte
    expect((float) $o->commission_amount)->toBe(1400.0)
        ->and($o->sellerNet())->toBe(4900.0)
        ->and((float) Wallet::where('store_id', $this->store->id)->first()->balance_held)->toBe(4900.0);

    $o->update(['status' => 'paid']);
    $this->actingAs($this->seller)->patch(route('orders.updateStatus', $o), ['status' => 'delivered']);
    expect($o->fresh()->balance_collected_at)->not->toBeNull();
});

test('acompte : au moins 1 000 FCFA en ligne, et ignoré si le vendeur ne le propose pas', function () {
    $this->store->update(['deposit_percent' => 20, 'delivery_zones' => [], 'delivery_other_fee' => null]);
    $small = Product::create(['store_id' => $this->store->id, 'title' => 'Bijou', 'slug' => 'bijou', 'price_vendor' => 2000, 'min_order_quantity' => 1, 'stock' => 10]);
    ($this->checkout)(['payment_mode' => 'deposit', 'items' => [['product_id' => $small->id, 'quantity' => 1]]])->assertOk();
    expect((float) Order::latest('id')->first()->balance_due)->toBe(1000.0);

    $this->store->update(['deposit_percent' => null]);
    ($this->checkout)(['payment_mode' => 'deposit'])->assertOk();
    expect((float) Order::latest('id')->first()->balance_due)->toBe(0.0);
});

test('le vendeur règle son acompte entre 20 et 90 %', function () {
    $this->actingAs($this->seller)->post(route('seller.deposit.update'), ['deposit_percent' => 10])->assertSessionHasErrors('deposit_percent');
    $this->actingAs($this->seller)->post(route('seller.deposit.update'), ['deposit_percent' => 40])->assertSessionHasNoErrors();
    expect($this->store->fresh()->deposit_percent)->toBe(40);
    $this->actingAs($this->seller)->post(route('seller.deposit.update'), ['deposit_percent' => null])->assertSessionHasNoErrors();
    expect($this->store->fresh()->deposit_percent)->toBeNull();
});
