<?php

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Payments\Orders\OrderPayments;
use App\Payments\PaymentManager;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['payments.mercypay.key' => 'mp_sandbox_test', 'payments.mercypay.webhook_secret' => 'whsec_test', 'payments.driver' => 'mercypay', 'payments.payout_driver' => 'mercypay', 'payments.mercypay.checkout' => 'direct']);
    $this->mock(\App\Services\Whatsapp\WhatsappGatewayService::class)->shouldIgnoreMissing();
});

/** Signature Mercy Pay : t=<horodatage>,v1=HMAC-SHA256("{t}.{corps}") */
function mercySign(string $body, ?int $t = null, string $secret = 'whsec_test'): string
{
    $t ??= time();

    return 't='.$t.',v1='.hash_hmac('sha256', $t.'.'.$body, $secret);
}

function mercyWebhook($test, string $body, string $signature)
{
    return $test->call('POST', '/api/webhooks/mercypay', [], [], [], ['CONTENT_TYPE' => 'application/json', 'HTTP_MERCYPAY_SIGNATURE' => $signature], $body);
}

function mercyOrder(array $attrs = []): Order
{
    $seller = User::factory()->create();
    $store = Store::create(['user_id' => $seller->id, 'name' => 'B', 'slug' => 'b-'.uniqid(), 'is_published' => true]);
    Wallet::create(['store_id' => $store->id, 'balance_available' => 0, 'balance_pending' => 0]);

    return Order::create($attrs + ['uuid' => (string) Str::uuid(), 'tracking_code' => 'BLK-M'.random_int(100, 999), 'store_id' => $store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677000000',
        'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 10000, 'saas_margin' => 350, 'api_fee' => 0, 'total_client' => 10350,
        'status' => 'pending', 'payment_status' => 'pending', 'payment_provider' => 'mercypay']);
}

test('un paiement direct part chez Mercy Pay au bon format, avec l’idempotence', function () {
    Http::fake(['mercy-pay.com/api/v1/payments' => Http::response(['data' => ['id' => 'pay_1', 'object' => 'payment', 'status' => 'pending']], 201)]);

    $res = app(PaymentManager::class)->driver('mercypay')->deposit([
        'reference' => 'ref-1', 'amount' => 10350, 'currency' => 'XAF', 'country' => 'CM', 'phone' => '237677000000', 'operator' => 'MTN', 'description' => 'Commande test',
    ]);

    expect($res['reference'])->toBe('pay_1');
    Http::assertSent(fn ($r) => $r->hasHeader('Idempotency-Key', 'ref-1') && $r->hasHeader('Authorization', 'Bearer mp_sandbox_test')
        && $r['country'] === 'CMR' && $r['provider'] === 'MTN_MOMO_CMR' && $r['amount'] === 10350 && $r['payment_method'] === 'mobile_money');
});

test('une commande ouvre la page de paiement Mercy Pay aux couleurs Biolinko', function () {
    config(['payments.mercypay.checkout' => 'hosted']);
    Http::fake(['mercy-pay.com/api/v1/checkout_sessions' => Http::response(['data' => ['id' => 'cs_1', 'status' => 'created', 'checkout_url' => 'https://mercy-pay.com/paiement/cs_1']], 201)]);
    $order = mercyOrder(['payment_provider' => null]);

    $res = app(OrderPayments::class)->start($order, '677000000');

    expect($res['checkout_url'])->toBe('https://mercy-pay.com/paiement/cs_1')
        ->and($order->fresh()->payment_reference)->toBe('cs_1')
        ->and($order->fresh()->payment_provider)->toBe('mercypay');
    Http::assertSent(fn ($r) => str_ends_with($r->url(), '/api/v1/checkout_sessions') && $r['amount'] === 10350 && $r['currency'] === 'XAF'
        && $r['payer_phone'] === '+237677000000' && str_contains($r['success_url'], '/track/'.$order->tracking_code)
        && $r['metadata']['order'] === $order->tracking_code && $r->hasHeader('Idempotency-Key'));
});

test('une session payée valide la commande et récupère l’opérateur', function () {
    $order = mercyOrder(['payment_reference' => 'cs_9']);
    Http::fake(['mercy-pay.com/api/v1/checkout_sessions/cs_9*' => Http::response(['data' => ['id' => 'cs_9', 'status' => 'completed',
        'payment' => ['id' => 'pay_9', 'status' => 'succeeded', 'mobile_money_provider' => 'ORANGE_CMR']]])]);

    expect(app(OrderPayments::class)->refresh($order))->toBe('SUCCESS');
    expect($order->fresh()->payment_status)->toBe('paid')->and($order->fresh()->payment_operator)->toBe('ORANGE');
});

test('le virement compense les 2 % retenus par Mercy Pay', function () {
    Http::fake(['mercy-pay.com/api/v1/payouts' => Http::response(['data' => ['id' => 'po_1', 'status' => 'requested']], 201)]);

    $res = app(PaymentManager::class)->driver('mercypay')->payout(['reference' => 'w-1', 'amount' => 9800, 'currency' => 'XAF', 'country' => 'CM', 'phone' => '237677000000', 'operator' => 'ORANGE']);

    // 10 000 demandés − 2 % = 9 800 reçus par le vendeur
    expect($res['reference'])->toBe('po_1');
    Http::assertSent(fn ($r) => $r['amount'] === 10000 && $r['destination']['provider'] === 'ORANGE_CMR' && $r['destination']['country'] === 'CMR');
});

test('le webhook Mercy Pay signé (t, v1) valide une commande payée sur la page hébergée, une seule fois', function () {
    $order = mercyOrder(['payment_reference' => 'cs_7']);
    Http::fake(['mercy-pay.com/api/v1/checkout_sessions/cs_7*' => Http::response(['data' => ['id' => 'cs_7', 'status' => 'completed', 'payment' => ['id' => 'pay_7', 'status' => 'succeeded']]])]);

    $body = json_encode(['id' => 'evt_1', 'object' => 'event', 'type' => 'payment.succeeded', 'data' => ['id' => 'pay_7', 'object' => 'payment', 'checkout_session' => 'cs_7', 'status' => 'succeeded']]);

    mercyWebhook($this, $body, 't='.time().',v1=mauvaise')->assertStatus(401);
    mercyWebhook($this, $body, mercySign($body, time() - 600))->assertStatus(401); // trop ancien : rejeu refusé
    mercyWebhook($this, $body, hash_hmac('sha256', $body, 'whsec_test'))->assertStatus(401); // ancien format
    expect($order->fresh()->payment_status)->toBe('pending');

    mercyWebhook($this, $body, mercySign($body))->assertOk();
    mercyWebhook($this, $body, mercySign($body))->assertOk()->assertJson(['status' => 'duplicate']);
    expect($order->fresh()->payment_status)->toBe('paid');
    expect((float) Wallet::where('store_id', $order->store_id)->first()->balance_held)->toBe(9000.0);
});

test('pendant une rotation de secret, une des signatures v1 suffit', function () {
    $order = mercyOrder(['payment_reference' => 'pay_5']);
    Http::fake(['mercy-pay.com/api/v1/payments/pay_5' => Http::response(['data' => ['id' => 'pay_5', 'status' => 'succeeded']])]);
    $body = json_encode(['id' => 'evt_5', 'type' => 'payment.succeeded', 'data' => ['id' => 'pay_5', 'checkout_session' => null]]);
    $t = time();

    mercyWebhook($this, $body, 't='.$t.',v1='.hash_hmac('sha256', $t.'.'.$body, 'ancien').',v1='.hash_hmac('sha256', $t.'.'.$body, 'whsec_test'))->assertOk();
    expect($order->fresh()->payment_status)->toBe('paid');
});

test('un virement Mercy Pay refusé rend l’argent au vendeur', function () {
    $store = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'C', 'slug' => 'c']);
    $wallet = Wallet::create(['store_id' => $store->id, 'balance_available' => 0, 'balance_pending' => 10000]);
    $w = Withdrawal::create(['wallet_id' => $wallet->id, 'amount' => 10000, 'fee' => 0, 'net_amount' => 10000, 'operator' => 'MTN', 'phone_number' => '237677000000',
        'status' => 'processing', 'payment_provider' => 'mercypay', 'payment_reference' => 'po_9']);
    Http::fake(['mercy-pay.com/api/v1/payouts/po_9' => Http::response(['data' => ['id' => 'po_9', 'status' => 'rejected']])]);

    $body = json_encode(['id' => 'evt_2', 'type' => 'payout.failed', 'data' => ['id' => 'po_9', 'object' => 'payout']]);
    mercyWebhook($this, $body, mercySign($body))->assertOk();

    expect($w->fresh()->status)->toBe('rejected');
    expect((float) $wallet->fresh()->balance_available)->toBe(10000.0);
});

test('une erreur Mercy Pay est traduite d’après son code, jamais d’après le texte', function () {
    Http::fake(['mercy-pay.com/api/v1/payments' => Http::response(['error' => ['type' => 'authentication_error', 'code' => 'live_mode_requires_kyc', 'message' => 'Compte non vérifié']], 403)]);

    expect(fn () => app(PaymentManager::class)->driver('mercypay')->deposit([
        'reference' => 'ref-2', 'amount' => 1000, 'currency' => 'XAF', 'country' => 'CM', 'phone' => '237677000000', 'operator' => 'MTN',
    ]))->toThrow(\App\Payments\PaymentException::class, 'Le paiement Mobile Money n’est pas disponible pour le moment.');
});
