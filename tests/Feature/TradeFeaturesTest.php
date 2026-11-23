<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\RecurringBasket;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Whatsapp\WhatsappGatewayService;
use App\Support\OpeningHours;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Http::fake(['api.sandbox.pawapay.io/v2/deposits' => Http::response(['status' => 'ACCEPTED'], 200), '*' => Http::response([], 200)]);
    $this->whatsapp = $this->mock(WhatsappGatewayService::class)->shouldIgnoreMissing();
    $this->seller = User::factory()->create(['role' => 'seller']);
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Chez Lina', 'slug' => 'chez-lina', 'is_published' => true, 'business_type' => 'patisserie']);
    Wallet::create(['store_id' => $this->store->id]);

    $this->checkout = fn (array $items, array $extra = []) => $this->postJson(route('checkout.process'), $extra + [
        'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '677123456',
        'delivery_address' => 'Akwa', 'delivery_city' => 'Douala', 'operator' => 'MTN', 'items' => $items,
    ]);
});

/* ------------------------------------------------------------------ Horaires */

$week = ['mon' => ['open' => '11:00', 'close' => '23:00'], 'tue' => ['open' => '11:00', 'close' => '23:00'], 'wed' => ['open' => '11:00', 'close' => '23:00'],
    'thu' => ['open' => '11:00', 'close' => '23:00'], 'fri' => ['open' => '18:00', 'close' => '02:00'], 'sat' => null, 'sun' => ['open' => '12:00', 'close' => '22:00']];

test('les horaires sont résumés en texte lisible', function () use ($week) {
    expect(OpeningHours::summary(OpeningHours::normalize($week)))->toBe('Lun – Jeu · 11 h – 23 h ; Ven · 18 h – 2 h ; Dim · 12 h – 22 h')
        ->and(OpeningHours::normalize(['mon' => ['open' => '25:00', 'close' => '10:00']]))->toBeNull();
});

test('le statut ouvert ou fermé suit l’heure du Cameroun', function (string $at, bool $open, string $label) use ($week) {
    $now = Carbon::parse($at, OpeningHours::TIMEZONE);
    expect(OpeningHours::status(OpeningHours::normalize($week), $now))->toBe(['open' => $open, 'label' => $label]);
})->with([
    'lundi midi' => ['2026-11-23 12:00', true, 'Ouvert · ferme à 23 h'],
    'lundi matin' => ['2026-11-23 09:30', false, 'Fermé · ouvre à 11 h'],
    'jeudi soir' => ['2026-11-26 23:30', false, 'Fermé · ouvre demain à 18 h'],
    'nuit de vendredi' => ['2026-11-28 01:00', true, 'Ouvert · ferme à 2 h'],
    'samedi' => ['2026-11-28 15:00', false, 'Fermé · ouvre demain à 12 h'],
    'dimanche soir' => ['2026-11-29 22:30', false, 'Fermé · ouvre demain à 11 h'],
]);

test('le vendeur règle ses horaires et son minimum de commande, affichés sur la vitrine', function () use ($week) {
    $this->actingAs($this->seller)->post(route('appearance.update'), [
        'name' => 'Chez Lina', 'slug' => 'chez-lina', 'theme_color' => '#C93A6B',
        'opening_schedule' => json_encode($week), 'min_order_amount' => 3000,
    ])->assertSessionHasNoErrors();

    $store = $this->store->fresh();
    expect($store->opening_hours)->toBe('Lun – Jeu · 11 h – 23 h ; Ven · 18 h – 2 h ; Dim · 12 h – 22 h')
        ->and($store->min_order_amount)->toBe(3000.0);

    $this->travelTo(Carbon::parse('2026-11-23 12:00', OpeningHours::TIMEZONE));
    $this->get('/chez-lina')->assertOk()->assertInertia(fn (Assert $page) => $page->where('store.opening_status.open', true));
});

/* ------------------------------------------------------------------ Configurateur, durée, caractéristiques */

test('le vendeur enregistre des suppléments par choix, une durée et des caractéristiques', function () {
    $this->seller->update(['plan' => 'pro', 'subscription_expires_at' => now()->addMonth()]);
    $this->actingAs($this->seller)->post(route('products.store'), [
        'title' => 'Gâteau', 'price_vendor' => 15000, 'stock' => 0, 'min_order_quantity' => 1,
        'fulfillment' => 'made_to_order', 'lead_time_hours' => 48, 'duration_minutes' => 90,
        'custom_fields' => [['label' => 'Nombre de parts', 'type' => 'select', 'required' => 1, 'options' => ['8 parts', '', '12 parts'], 'prices' => [0, 999, 6000]]],
        'specs' => [['label' => 'Allergènes', 'value' => 'Lait, œufs'], ['label' => '', 'value' => 'ignoré']],
    ])->assertSessionHasNoErrors();

    $p = Product::first();
    expect($p->custom_fields[0]['options'])->toBe(['8 parts', '12 parts'])
        ->and($p->custom_fields[0]['prices'])->toBe([0, 6000])
        ->and($p->duration_minutes)->toBe(90)
        ->and($p->specs)->toBe([['label' => 'Allergènes', 'value' => 'Lait, œufs']]);
});

test('le supplément d’un choix est ajouté au prix par le serveur', function () {
    $cake = Product::create(['store_id' => $this->store->id, 'title' => 'Gâteau', 'slug' => 'gateau', 'price_vendor' => 15000, 'stock' => 0, 'fulfillment' => 'made_to_order', 'lead_time_hours' => 0,
        'custom_fields' => [['label' => 'Nombre de parts', 'type' => 'select', 'required' => true, 'options' => ['8 parts', '12 parts'], 'prices' => [0, 6000]]]]);

    ($this->checkout)([['product_id' => $cake->id, 'quantity' => 2, 'customizations' => [['label' => 'Nombre de parts', 'value' => '12 parts', 'price' => 1]]]],
        ['desired_date' => now()->addDay()->format('Y-m-d')])->assertOk();

    $item = Order::first()->items()->first();
    expect((float) $item->unit_price_vendor)->toBe(21000.0)
        ->and((float) $item->total_price_vendor)->toBe(42000.0)
        ->and($item->customizations)->toBe([['label' => 'Nombre de parts', 'value' => '12 parts', 'price' => 6000]]);
});

test('une commande sous le minimum de la boutique est refusée', function () {
    $this->store->update(['min_order_amount' => 5000]);
    $p = Product::create(['store_id' => $this->store->id, 'title' => 'Croissant', 'slug' => 'croissant', 'price_vendor' => 1500, 'stock' => 20, 'is_active' => true]);

    ($this->checkout)([['product_id' => $p->id, 'quantity' => 2]])->assertStatus(422)->assertJsonFragment(['error' => 'La commande minimum chez Chez Lina est de 5 000 FCFA. Ajoutez un article.']);
    ($this->checkout)([['product_id' => $p->id, 'quantity' => 4]])->assertOk();
});

/* ------------------------------------------------------------------ Rappel la veille */

test('la veille, le client reçoit un seul rappel de sa commande à date fixe', function () {
    config(['services.whatsapp_driver' => 'cloud', 'services.whatsapp_cloud.token' => 't', 'services.whatsapp_cloud.phone_number_id' => '1']);
    $this->travelTo(Carbon::parse('2026-11-27 18:00', OpeningHours::TIMEZONE));
    $make = fn (string $date, string $status = 'paid') => Order::create(['store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677123456',
        'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 15000, 'saas_margin' => 525, 'api_fee' => 0, 'total_client' => 15525,
        'status' => $status, 'payment_status' => $status === 'paid' ? 'paid' : 'pending', 'desired_date' => $date, 'desired_slot' => 'matin']);
    $due = $make('2026-11-28');
    $make('2026-11-29');
    $make('2026-11-28', 'pending');

    $this->whatsapp->shouldReceive('notifyAppointmentReminder')->once()->withArgs(fn ($o, $when) => $o->id === $due->id && $when === 'samedi 28 novembre, le matin');
    $this->artisan('orders:remind-tomorrow')->assertSuccessful();
    $this->artisan('orders:remind-tomorrow')->assertSuccessful();

    expect($due->fresh()->reminder_sent_at)->not->toBeNull();
});

/* ------------------------------------------------------------------ Panier de la semaine */

test('le panier de la semaine revient chaque semaine jusqu’à ce que le client l’arrête', function () {
    $this->store->update(['business_type' => 'alimentation']);
    $legumes = Product::create(['store_id' => $this->store->id, 'title' => 'Panier de légumes', 'slug' => 'legumes', 'price_vendor' => 8000, 'stock' => 50, 'is_active' => true]);
    $this->travelTo(Carbon::parse('2026-11-23 10:00', OpeningHours::TIMEZONE)); // lundi

    ($this->checkout)([['product_id' => $legumes->id, 'quantity' => 1]], ['recurring' => true])->assertOk();
    $first = Order::first();
    $basket = RecurringBasket::first();
    expect($first->recurring_basket_id)->toBe($basket->id)->and($basket->active)->toBeFalse();

    // Le premier paiement met le panier en route : création 2 jours avant la livraison de la semaine suivante
    $first->markAsPaid();
    $basket->refresh();
    expect($basket->active)->toBeTrue()
        ->and($basket->next_run_at->setTimezone(OpeningHours::TIMEZONE)->format('Y-m-d H:i'))->toBe('2026-11-28 09:00');

    $this->whatsapp->shouldReceive('notifyRecurringBasket')->once();
    $this->travelTo(Carbon::parse('2026-11-28 09:30', OpeningHours::TIMEZONE));
    $this->artisan('baskets:renew')->assertSuccessful();
    $second = Order::latest('id')->first();
    expect($second->id)->not->toBe($first->id)
        ->and($second->recurring_basket_id)->toBe($basket->id)
        ->and($second->payment_status)->toBe('pending')
        ->and($second->desired_date->format('Y-m-d'))->toBe('2026-11-30')
        ->and((float) $second->subtotal)->toBe(8000.0);

    $this->get(route('order.track', $second->tracking_code))->assertInertia(fn (Assert $page) => $page->where('basket.active', true));
    $this->post(route('basket.stop', $basket->token))->assertRedirect();
    expect($basket->fresh()->active)->toBeFalse();
    $this->travel(8)->days();
    $this->artisan('baskets:renew');
    expect(Order::count())->toBe(2);
});

test('le panier de la semaine s’arrête après deux paniers non payés', function () {
    $this->store->update(['business_type' => 'alimentation']);
    $p = Product::create(['store_id' => $this->store->id, 'title' => 'Fruits', 'slug' => 'fruits', 'price_vendor' => 6000, 'stock' => 50, 'is_active' => true]);
    ($this->checkout)([['product_id' => $p->id, 'quantity' => 1]], ['recurring' => true])->assertOk();
    Order::first()->markAsPaid();

    foreach (range(1, 3) as $week) {
        $this->travel(7)->days();
        $this->artisan('baskets:renew');
    }

    expect(Order::count())->toBe(3) // la commande payée + 2 paniers non payés, puis arrêt
        ->and(RecurringBasket::first()->stopped_reason)->toBe('unpaid');
});

test('le panier de la semaine n’est proposé qu’en alimentation', function () {
    $p = Product::create(['store_id' => $this->store->id, 'title' => 'Croissant', 'slug' => 'croissant', 'price_vendor' => 5000, 'stock' => 20, 'is_active' => true]);
    ($this->checkout)([['product_id' => $p->id, 'quantity' => 1]], ['recurring' => true])->assertOk();

    expect(RecurringBasket::count())->toBe(0);
});
