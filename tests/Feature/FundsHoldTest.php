<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderReport;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mock(\App\Services\WhatsappGatewayService::class)->shouldIgnoreMissing();
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

test('un nouveau vendeur attend 4 jours, un vendeur établi 2 jours', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();
    expect((int) round(now()->diffInHours($order->fresh()->funds_release_at)))->toBe(96);

    foreach (range(1, 10) as $i) {
        ($this->makeOrder)(['status' => 'delivered', 'payment_status' => 'paid']);
    }
    $other = ($this->makeOrder)();
    $other->markAsPaid();
    expect((int) round(now()->diffInHours($other->fresh()->funds_release_at)))->toBe(48);
});

test('l’argent devient retirable à la fin du délai', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();

    $this->artisan('funds:release');
    expect((float) Wallet::first()->balance_available)->toBe(0.0);

    $this->travel(5)->days();
    $this->artisan('funds:release');
    $wallet = Wallet::first();
    expect((float) $wallet->balance_available)->toBe(9300.0);
    expect((float) $wallet->balance_held)->toBe(0.0);
    expect($order->fresh()->funds_released_at)->not->toBeNull();
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
    expect((float) Wallet::first()->balance_available)->toBe(9300.0);
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
    expect((float) Wallet::first()->balance_available)->toBe(9300.0);
});

test('on ne peut signaler qu’une fois, et seulement pendant le délai', function () {
    $order = ($this->makeOrder)();
    $order->markAsPaid();
    $this->post(route('order.report', $order->tracking_code), ['reason' => 'other', 'message' => 'Un souci avec le colis.']);
    $this->post(route('order.report', $order->tracking_code), ['reason' => 'other', 'message' => 'Encore un souci ici.'])->assertSessionHasErrors('message');
    expect(OrderReport::count())->toBe(1);

    $late = ($this->makeOrder)();
    $late->markAsPaid();
    $this->travel(5)->days();
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
