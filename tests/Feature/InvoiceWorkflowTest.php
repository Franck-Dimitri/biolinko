<?php

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create(['role' => 'seller']);
    $this->store = Store::create(['user_id' => $this->user->id, 'name' => 'Atelier Test', 'slug' => 'atelier-test']);
});

test('a manual invoice with several lines gets a sequential number and the right total', function () {
    $payload = fn ($name) => [
        'customer_name' => $name,
        'customer_phone' => '677123456',
        'customer_city' => 'Yaoundé',
        'items' => [
            ['description' => 'Robe sur mesure', 'quantity' => 1, 'unit_price' => 25000],
            ['description' => 'Retouches', 'quantity' => 2, 'unit_price' => 1500],
        ],
    ];

    $this->actingAs($this->user)->post(route('seller.invoices.storeManual'), $payload('Awa'))->assertRedirect();
    $this->actingAs($this->user)->post(route('seller.invoices.storeManual'), $payload('Jean'))->assertRedirect();

    $invoices = Order::where('store_id', $this->store->id)->orderBy('id')->get();
    $year = now()->year;

    expect($invoices->pluck('invoice_number')->all())->toBe(["F-{$year}-0001", "F-{$year}-0002"]);
    expect((float) $invoices->first()->total_client)->toBe(28000.0);
    expect($invoices->first()->items)->toHaveCount(2);
    expect($invoices->first()->city)->toBe('Yaoundé');
});

test('an online order receives its invoice number only once paid', function () {
    $order = Order::create([
        'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677123456', 'city' => 'Douala',
        'price_vendor' => 10000, 'saas_margin' => 300, 'api_fee' => 0, 'total_client' => 10300, 'status' => 'pending', 'payment_status' => 'pending',
    ]);
    expect($order->invoice_number)->toBeNull();

    $order->update(['status' => 'paid', 'payment_status' => 'paid']);
    expect($order->fresh()->invoice_number)->toStartWith('F-');
});

test('the payment status of an online sale cannot be changed by hand', function () {
    $order = Order::create([
        'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677123456', 'city' => 'Douala',
        'price_vendor' => 10000, 'saas_margin' => 300, 'api_fee' => 0, 'total_client' => 10300, 'status' => 'pending', 'payment_status' => 'pending',
    ]);

    $this->actingAs($this->user)->patch(route('seller.invoices.updateStatus', $order->id), ['status' => 'paid']);

    expect($order->fresh()->status)->toBe('pending');
});
