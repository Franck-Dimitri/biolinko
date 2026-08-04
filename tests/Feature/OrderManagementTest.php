<?php

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

test('authenticated vendor can view orders and wallet page', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Test',
        'slug' => 'boutique-test',
    ]);
    Wallet::create([
        'store_id' => $store->id,
        'balance_available' => 50000,
        'balance_pending' => 0,
    ]);

    $response = $this->actingAs($user)->get(route('orders.index'));

    $response->assertStatus(200);
});

test('vendor can update order status', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Test 2',
        'slug' => 'boutique-test-2',
    ]);
    $order = Order::create([
        'store_id' => $store->id,
        'customer_name' => 'John Doe',
        'customer_phone' => '237699123456',
        'city' => 'Douala',
        'price_vendor' => 10000,
        'saas_margin' => 200,
        'api_fee' => 200,
        'total_client' => 10400,
        'status' => 'paid',
    ]);

    $response = $this->actingAs($user)->patch(route('orders.updateStatus', $order->id), [
        'status' => 'delivered',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('orders', [
        'id' => $order->id,
        'status' => 'delivered',
    ]);
});

test('vendor can request mobile money withdrawal via hrskills pay', function () {
    Http::fake([
        'api.hrskills-pay.com/*' => Http::response([
            'transaction_token' => 'mock_token',
            'data' => [
                'reference' => 'ref_payout_123',
                'transaction_id' => 'tx_payout_123',
                'status' => 'PENDING',
            ]
        ], 200),
    ]);

    $user = User::factory()->create();
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Test 3',
        'slug' => 'boutique-test-3',
    ]);
    $wallet = Wallet::create([
        'store_id' => $store->id,
        'balance_available' => 100000,
        'balance_pending' => 0,
    ]);

    $response = $this->actingAs($user)->post(route('wallet.withdraw'), [
        'amount' => 50100,
        'phone' => '237680216505',
        'payment_operator' => 'MTN',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('withdrawals', [
        'wallet_id' => $wallet->id,
        'amount' => 50100,
        'phone_number' => '237680216505',
        'status' => 'PENDING',
    ]);

    $this->assertDatabaseHas('wallets', [
        'id' => $wallet->id,
        'balance_available' => 49900,
    ]);
});
