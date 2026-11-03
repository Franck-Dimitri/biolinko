<?php

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Payments\PaymentManager;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['payments.mercypay.key' => 'mp_sandbox_test', 'payments.mercypay.webhook_secret' => 'whsec', 'payments.driver' => 'mercypay', 'payments.payout_driver' => 'mercypay']);
    $this->mock(\App\Services\WhatsappGatewayService::class)->shouldIgnoreMissing();
});

test('un paiement part chez Mercy Pay au bon format, avec l’idempotence', function () {
    Http::fake(['mercy-pay.com/api/v1/payments' => Http::response(['data' => ['uuid' => 'mp-uuid-1', 'status' => 'pending']], 201)]);

    $res = app(PaymentManager::class)->driver('mercypay')->deposit([
        'reference' => 'ref-1', 'amount' => 10350, 'currency' => 'XAF', 'country' => 'CM', 'phone' => '237677000000', 'operator' => 'MTN', 'description' => 'Commande test',
    ]);

    expect($res['reference'])->toBe('mp-uuid-1');
    Http::assertSent(fn ($r) => $r->hasHeader('Idempotency-Key', 'ref-1') && $r->hasHeader('Authorization', 'Bearer mp_sandbox_test')
        && $r['country'] === 'CMR' && $r['provider'] === 'MTN_MOMO_CMR' && $r['amount'] === 10350 && $r['payment_method'] === 'mobile_money');
});

test('le virement compense les 2 % retenus par Mercy Pay', function () {
    Http::fake(['mercy-pay.com/api/v1/payouts' => Http::response(['data' => ['uuid' => 'po-1', 'status' => 'requested']], 201)]);

    app(PaymentManager::class)->driver('mercypay')->payout(['reference' => 'w-1', 'amount' => 9800, 'currency' => 'XAF', 'country' => 'CM', 'phone' => '237677000000', 'operator' => 'ORANGE']);

    // 10 000 demandés − 2 % = 9 800 reçus par le vendeur
    Http::assertSent(fn ($r) => $r['amount'] === 10000 && $r['destination']['provider'] === 'ORANGE_CMR' && $r['destination']['country'] === 'CMR');
});

test('le webhook Mercy Pay signé valide la commande, une seule fois', function () {
    $seller = User::factory()->create();
    $store = Store::create(['user_id' => $seller->id, 'name' => 'B', 'slug' => 'b', 'is_published' => true]);
    Wallet::create(['store_id' => $store->id, 'balance_available' => 0, 'balance_pending' => 0]);
    $order = Order::create(['uuid' => 'u', 'tracking_code' => 'BLK-M1', 'store_id' => $store->id, 'customer_name' => 'A', 'customer_phone' => '237677000000',
        'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 10000, 'saas_margin' => 350, 'api_fee' => 0, 'total_client' => 10350,
        'status' => 'pending', 'payment_status' => 'pending', 'payment_provider' => 'mercypay', 'payment_reference' => 'mp-uuid-9']);
    Http::fake(['mercy-pay.com/api/v1/payments/mp-uuid-9' => Http::response(['data' => ['uuid' => 'mp-uuid-9', 'status' => 'succeeded', 'psp_reference' => 'psp']])]);

    $body = json_encode(['id' => 'evt_1', 'type' => 'payment.succeeded', 'data' => ['uuid' => 'mp-uuid-9', 'status' => 'succeeded']]);
    $send = fn ($sig) => $this->call('POST', '/api/webhooks/mercypay', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_MERCYPAY_SIGNATURE' => $sig], $body);

    $send('mauvaise-signature')->assertStatus(401);
    expect($order->fresh()->payment_status)->toBe('pending');

    $send(hash_hmac('sha256', $body, 'whsec'))->assertOk();
    $send(hash_hmac('sha256', $body, 'whsec'))->assertOk()->assertJson(['status' => 'duplicate']);
    expect($order->fresh()->payment_status)->toBe('paid');
    expect((float) Wallet::first()->balance_held)->toBe(9300.0);
});

test('un virement Mercy Pay refusé rend l’argent au vendeur', function () {
    $store = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'C', 'slug' => 'c']);
    $wallet = Wallet::create(['store_id' => $store->id, 'balance_available' => 0, 'balance_pending' => 10000]);
    $w = Withdrawal::create(['wallet_id' => $wallet->id, 'amount' => 10000, 'fee' => 300, 'net_amount' => 9700, 'operator' => 'MTN', 'phone_number' => '237677000000',
        'status' => 'processing', 'payment_provider' => 'mercypay', 'payment_reference' => 'po-9']);
    Http::fake(['mercy-pay.com/api/v1/payouts/po-9' => Http::response(['data' => ['uuid' => 'po-9', 'status' => 'rejected']])]);

    $body = json_encode(['id' => 'evt_2', 'type' => 'payout.failed', 'data' => ['uuid' => 'po-9']]);
    $this->call('POST', '/api/webhooks/mercypay', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_X_MERCYPAY_SIGNATURE' => hash_hmac('sha256', $body, 'whsec')], $body)->assertOk();

    expect($w->fresh()->status)->toBe('rejected');
    expect((float) $wallet->fresh()->balance_available)->toBe(10000.0);
});
