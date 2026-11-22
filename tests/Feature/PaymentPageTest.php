<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Payments\Gateways\TestGateway;
use App\Payments\PaymentException;
use App\Services\Whatsapp\WhatsappGatewayService;

beforeEach(function () {
    config(['payments.driver' => 'test']);
    $this->mock(WhatsappGatewayService::class)->shouldIgnoreMissing();
    $this->seller = User::factory()->create();
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Wax Shop', 'slug' => 'wax-shop', 'is_published' => true]);
    Wallet::create(['store_id' => $this->store->id]);
    $this->product = Product::create(['store_id' => $this->store->id, 'title' => 'Robe', 'slug' => 'robe', 'price_vendor' => 10000, 'stock' => 5]);
});

test('le panier crée la commande puis envoie vers la page de paiement Biolinko', function () {
    $res = $this->postJson(route('checkout.process'), [
        'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '677123456', 'delivery_address' => 'Akwa',
        'delivery_city' => 'Douala', 'defer_payment' => true, 'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
    ])->assertOk();

    $order = Order::first();
    expect($order->payment_reference)->toBeNull()
        ->and($res->json('payment_url'))->toBe(route('order.payment', $order->tracking_code));

    $this->get(route('order.payment', $order->tracking_code))->assertOk()
        ->assertInertia(fn ($page) => $page->component('Payment/Show')->where('order.tracking_code', $order->tracking_code)->where('country.dial', '237'));
});

test('en mode test, le paiement est validé après quelques secondes et la commande passe payée', function () {
    $this->postJson(route('checkout.process'), [
        'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '677123456', 'delivery_address' => 'Akwa',
        'delivery_city' => 'Douala', 'defer_payment' => true, 'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
    ]);
    $order = Order::first();

    $this->postJson(route('order.pay', $order->tracking_code), ['phone' => '237690112233', 'operator' => 'ORANGE', 'email' => 'awa@example.test'])->assertOk();
    expect($order->fresh()->customer_email)->toBe('awa@example.test');

    $this->getJson(route('checkout.status', $order->tracking_code))->assertJson(['paid' => false]);
    $this->travel(TestGateway::DELAY_SECONDS + 1)->seconds();
    $this->getJson(route('checkout.status', $order->tracking_code))->assertJson(['paid' => true]);
    expect($order->fresh()->payment_status)->toBe('paid');

    // Une commande payée renvoie vers son suivi
    $this->get(route('order.payment', $order->tracking_code))->assertRedirect();
});

test('un numéro de test qui finit par 0000 simule un paiement refusé', function () {
    $this->postJson(route('checkout.process'), [
        'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '677123456', 'delivery_address' => 'Akwa',
        'delivery_city' => 'Douala', 'defer_payment' => true, 'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
    ]);
    $order = Order::first();
    $this->postJson(route('order.pay', $order->tracking_code), ['phone' => '237670000000', 'operator' => 'MTN'])->assertOk();
    $this->travel(TestGateway::DELAY_SECONDS + 1)->seconds();
    $this->getJson(route('checkout.status', $order->tracking_code))->assertJson(['paid' => false]);
    expect($order->fresh()->payment_status)->toBe('failed');
});

test('le mode test est refusé en production', function () {
    app()->detectEnvironment(fn () => 'production');
    expect(fn () => app(TestGateway::class)->deposit(['reference' => 'r', 'phone' => '237677123456', 'operator' => 'MTN']))
        ->toThrow(PaymentException::class);
});
