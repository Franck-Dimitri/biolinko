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
        'saas_margin' => 300,
        'api_fee' => 0,
        'total_client' => 10300,
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
        'status' => 'pending',
    ]);

    $this->assertDatabaseHas('wallets', [
        'id' => $wallet->id,
        'balance_available' => 49900,
    ]);
});

test('an unpaid online order cannot be marked as paid by the seller', function () {
    $user = User::factory()->create();
    $store = Store::create(['user_id' => $user->id, 'name' => 'Boutique Garde', 'slug' => 'boutique-garde']);
    $order = Order::create([
        'store_id' => $store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677123456', 'city' => 'Douala',
        'price_vendor' => 5000, 'saas_margin' => 150, 'api_fee' => 0, 'total_client' => 5150, 'status' => 'pending',
    ]);

    $this->actingAs($user)->patch(route('orders.updateStatus', $order->id), ['status' => 'paid']);

    expect($order->fresh()->status)->toBe('pending');
});

test('admin rejecting a withdrawal puts the money back on the seller balance', function () {
    $seller = User::factory()->create();
    $store = Store::create(['user_id' => $seller->id, 'name' => 'Boutique Retrait', 'slug' => 'boutique-retrait']);
    $wallet = Wallet::create(['store_id' => $store->id, 'balance_available' => 20000, 'balance_pending' => 0]);
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($seller)->post(route('wallet.withdraw'), ['amount' => 15000, 'phone' => '677123456', 'payment_operator' => 'MTN']);
    $withdrawal = \App\Models\Withdrawal::first();
    expect((float) $wallet->fresh()->balance_pending)->toBe(15000.0);

    $this->actingAs($admin)->post(route('admin.withdrawals.reject', $withdrawal));

    $wallet->refresh();
    expect((float) $wallet->balance_available)->toBe(20000.0);
    expect((float) $wallet->balance_pending)->toBe(0.0);
    expect($withdrawal->fresh()->status)->toBe('rejected');
});

test('a failed payout never marks the withdrawal as paid', function () {
    Http::fake(['*' => Http::response(['message' => 'Service indisponible'], 500)]);
    $seller = User::factory()->create();
    $store = Store::create(['user_id' => $seller->id, 'name' => 'Boutique Echec', 'slug' => 'boutique-echec']);
    Wallet::create(['store_id' => $store->id, 'balance_available' => 20000, 'balance_pending' => 0]);
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($seller)->post(route('wallet.withdraw'), ['amount' => 10000, 'phone' => '677123456', 'payment_operator' => 'MTN']);
    $withdrawal = \App\Models\Withdrawal::first();

    $this->actingAs($admin)->post(route('admin.withdrawals.approve', $withdrawal));

    expect($withdrawal->fresh()->status)->toBe('pending');
});
