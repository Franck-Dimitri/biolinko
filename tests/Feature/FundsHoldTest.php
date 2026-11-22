<?php

use App\Models\Order;
use App\Models\OrderReport;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Whatsapp\WhatsappGatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mock(WhatsappGatewayService::class)->shouldIgnoreMissing();
    $this->seller = User::factory()->create();
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'B', 'slug' => 'b', 'is_published' => true]);
    Wallet::create(['store_id' => $this->store->id, 'balance_available' => 0, 'balance_pending' => 0]);
    $this->makeOrder = function (array $attrs = []) {
        static $n = 0;
        $n++;

        return Order::create(array_merge([
            'uuid' => "u-$n", 'tracking_code' => "BLK-T$n", 'store_id' => $this->store->id, 'customer_name' => 'Awa',
            'customer_phone' => '237699887766', 'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 10000,
            'saas_margin' => 300, 'api_fee' => 0, 'total_client' => 10300, 'status' => 'pending', 'payment_status' => 'pending',
        ], $attrs));
    };
});

test('l’argent reste bloqué jusqu’à la livraison, au plus 14 jours après le paiement', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();
    expect((int) round(now()->diffInDays($order->fresh()->funds_release_at)))->toBe(Order::MAX_HOLD_DAYS);

    $this->travel(5)->days();
    $this->artisan('funds:release');
    expect((float) Wallet::first()->balance_available)->toBe(0.0);

    $this->travel(10)->days();
    $this->artisan('funds:release');
    $wallet = Wallet::first();
    expect((float) $wallet->balance_available)->toBe(9000.0);
    expect((float) $wallet->balance_held)->toBe(0.0);
    expect($order->fresh()->funds_released_at)->not->toBeNull();
});

test('marquée livrée par le vendeur, la vente est libérée 3 jours plus tard sans signalement', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();

    $this->actingAs($this->seller)->patch(route('orders.updateStatus', $order->id), ['status' => 'delivered'])->assertSessionHasNoErrors();
    $order->refresh();
    expect($order->delivered_at)->not->toBeNull();
    expect((int) round(now()->diffInDays($order->funds_release_at)))->toBe(Order::RELEASE_AFTER_DELIVERY_DAYS);

    $this->travel(2)->days();
    $this->artisan('funds:release');
    expect((float) Wallet::first()->balance_available)->toBe(0.0);

    $this->travel(2)->days();
    $this->artisan('funds:release');
    expect((float) Wallet::first()->balance_available)->toBe(9000.0);
});

test('revenir de « livrée » à « en livraison » remet le délai sur le plafond', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();
    $this->actingAs($this->seller)->patch(route('orders.updateStatus', $order->id), ['status' => 'delivered']);
    $this->actingAs($this->seller)->patch(route('orders.updateStatus', $order->id), ['status' => 'in_delivery']);

    $order->refresh();
    expect($order->delivered_at)->toBeNull();
    expect($order->funds_release_at->equalTo($order->paid_at->copy()->addDays(Order::MAX_HOLD_DAYS)))->toBeTrue();
});

test('le client confirme la réception : la vente est libérée tout de suite', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();

    $this->post(route('order.received', $order->tracking_code))->assertSessionHasNoErrors();

    $order->refresh();
    expect($order->status)->toBe('delivered');
    expect($order->received_confirmed_at)->not->toBeNull();
    expect((float) Wallet::first()->balance_available)->toBe(9000.0);

    // Une seule fois
    $this->post(route('order.received', $order->tracking_code))->assertSessionHasErrors('receipt');
});

test('le client ne peut pas confirmer la réception tant qu’un signalement est ouvert, ni pour une commande non payée', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();
    $this->post(route('order.report', $order->tracking_code), ['reason' => 'not_received', 'message' => 'Rien reçu depuis lundi.']);
    $this->post(route('order.received', $order->tracking_code))->assertSessionHasErrors('receipt');
    expect((float) Wallet::first()->balance_available)->toBe(0.0);

    $unpaid = ($this->makeOrder)();
    $this->post(route('order.received', $unpaid->tracking_code))->assertSessionHasErrors('receipt');
});

test('un signalement gèle la vente jusqu’à ce que le client indique que c’est résolu', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();

    $this->post(route('order.report', $order->tracking_code), ['reason' => 'not_received', 'message' => 'Rien reçu depuis lundi.'])->assertSessionHasNoErrors();
    expect($order->report)->not->toBeNull();

    $this->travel(5)->days();
    $this->artisan('funds:release');
    expect((float) Wallet::first()->balance_available)->toBe(0.0); // gelée

    $this->post(route('order.report.resolve', $order->tracking_code));
    expect($order->report->fresh()->status)->toBe('resolved');
    expect((float) Wallet::first()->balance_available)->toBe(9000.0);
});

test('sans réaction du client 3 jours après la réponse du vendeur, la vente est libérée', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();
    $this->post(route('order.report', $order->tracking_code), ['reason' => 'not_conform', 'message' => 'Mauvaise taille reçue.']);

    $this->actingAs($this->seller)->post(route('orders.report.respond', $order->id), ['response' => 'Échange fait le 12.'])->assertSessionHasNoErrors();
    expect($order->report->fresh()->status)->toBe('answered');

    $this->travel(2)->days();
    $this->artisan('funds:release');
    expect((float) Wallet::first()->balance_available)->toBe(0.0);

    $this->travel(4)->days();
    $this->artisan('funds:release');
    expect($order->report->fresh()->status)->toBe('released');
    expect((float) Wallet::first()->balance_available)->toBe(9000.0);
});

test('on ne peut signaler qu’une fois, et seulement pendant le délai', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();
    $this->post(route('order.report', $order->tracking_code), ['reason' => 'other', 'message' => 'Un souci avec le colis.']);
    $this->post(route('order.report', $order->tracking_code), ['reason' => 'other', 'message' => 'Encore un souci ici.'])->assertSessionHasErrors('message');
    expect(OrderReport::count())->toBe(1);

    $late = ($this->makeOrder)();
    $late->markAsPaid();
    $this->travel(Order::MAX_HOLD_DAYS + 1)->days();
    $this->artisan('funds:release');
    $this->post(route('order.report', $late->tracking_code), ['reason' => 'other', 'message' => 'Trop tard pour ça.'])->assertSessionHasErrors('message');
});

test('un autre vendeur ne peut pas répondre au signalement', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();
    $this->post(route('order.report', $order->tracking_code), ['reason' => 'other', 'message' => 'Un souci avec le colis.']);

    $intruder = User::factory()->create();
    Store::create(['user_id' => $intruder->id, 'name' => 'X', 'slug' => 'x']);
    $this->actingAs($intruder)->post(route('orders.report.respond', $order->id), ['response' => 'Pas moi.'])->assertForbidden();
});

test('le solde retirable exclut l’argent en attente', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();

    $this->actingAs($this->seller)->post(route('wallet.withdraw'), ['amount' => 5000, 'phone_number' => '677000000'])
        ->assertSessionHasErrors();
});
