<?php

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Services\HrSkillsPayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('hrskills pay service formats cameroon phone numbers correctly', function () {
    $service = new HrSkillsPayService();

    // 9 digits starting with 6
    expect($service->formatCameroonPhone('699123456'))->toBe('237699123456');

    // With +237
    expect($service->formatCameroonPhone('+237 677 88 99 00'))->toBe('237677889900');

    // Invalid non-cameroon number should throw exception
    expect(fn () => $service->formatCameroonPhone('22997000000'))
        ->toThrow(\InvalidArgumentException::class);
});

test('hrskills pay service detects mtn vs orange operator for cameroon', function () {
    $service = new HrSkillsPayService();

    // Orange Cameroon: 699, 655, 656, 657, 658, 659
    expect($service->detectOperator('237699123456'))->toBe('ORANGE');
    expect($service->detectOperator('237655001122'))->toBe('ORANGE');

    // MTN Cameroon: 677, 650, 651, 652, 653, 654, 680
    expect($service->detectOperator('237677123456'))->toBe('MTN');
    expect($service->detectOperator('237680123456'))->toBe('MTN');
});

test('webhook handles payment succeeded and credits vendor wallet', function () {
    $user = User::factory()->create(['role' => 'seller']);
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Test CM',
        'slug' => 'boutique-test-cm',
    ]);
    $wallet = Wallet::create([
        'store_id' => $store->id,
        'balance_available' => 0,
        'balance_pending' => 0,
    ]);

    $order = Order::create([
        'store_id' => $store->id,
        'customer_name' => 'Jean CM',
        'customer_phone' => '237699123456',
        'city' => 'Douala',
        'address_details' => 'Akwa',
        'price_vendor' => 15000,
        'saas_margin' => 300,
        'api_fee' => 300,
        'total_client' => 15600,
        'status' => 'pending',
        'payment_status' => 'pending',
        'hrskills_reference' => 'ref_test_webhook_123',
    ]);

    $response = $this->postJson('/api/webhooks/hrskills-pay', [
        'event' => 'payment.succeeded',
        'data' => [
            'reference' => 'ref_test_webhook_123',
            'transaction_id' => 'tx_999999',
            'status' => 'SUCCESS',
        ],
    ]);

    $response->assertStatus(200);

    $order->refresh();
    expect($order->payment_status)->toBe('paid');
    expect($order->status)->toBe('paid');

    $wallet->refresh();
    expect((float) $wallet->balance_available)->toBe(15000.0);
});
