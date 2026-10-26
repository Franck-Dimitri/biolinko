<?php

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->mock(\App\Services\WhatsappGatewayService::class)->shouldIgnoreMissing();
    $this->seller = User::factory()->create();
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'B', 'slug' => 'b', 'is_published' => true]);
    $this->wallet = Wallet::create(['store_id' => $this->store->id, 'balance_available' => 0, 'balance_pending' => 0]);
    $this->order = Order::create([
        'uuid' => 'u-1', 'tracking_code' => 'BLK-E1', 'store_id' => $this->store->id, 'customer_name' => 'Awa',
        'customer_phone' => '237699887766', 'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 10000,
        'saas_margin' => 350, 'api_fee' => 0, 'total_client' => 10350, 'status' => 'pending', 'payment_status' => 'pending',
        'payment_provider' => 'pawapay', 'payment_reference' => '11111111-1111-1111-1111-111111111111',
    ]);
});

test('la commission dépend du plan du vendeur au moment du paiement', function (string $plan, float $rate, float $net) {
    $this->seller->update(['plan' => $plan, 'subscription_expires_at' => $plan === 'starter' ? null : now()->addMonth()]);

    $this->order->markAsPaid();
    $order = $this->order->fresh();

    expect((float) $order->commission_rate)->toBe($rate);
    expect($order->sellerNet())->toBe($net);
    expect((float) $this->wallet->fresh()->balance_held)->toBe($net);
})->with([
    ['starter', 7.0, 9300.0],
    ['pro', 4.0, 9600.0],
    ['growth', 2.5, 9750.0],
    ['business', 1.5, 9850.0],
]);

test('les frais client sont de 3,5 %', function () {
    expect(Order::clientFee(10000))->toBe(350.0);
});

test('un retrait prélève 3 % et le vendeur reçoit le net', function () {
    $this->wallet->update(['balance_available' => 10000]);

    $this->actingAs($this->seller)->post(route('wallet.withdraw'), ['amount' => 10000, 'payment_operator' => 'MTN', 'phone' => '677000000'])
        ->assertSessionHasNoErrors();

    $w = Withdrawal::first();
    expect((float) $w->fee)->toBe(300.0);
    expect((float) $w->net_amount)->toBe(9700.0);
    expect((float) $this->wallet->fresh()->balance_available)->toBe(0.0);
    expect((float) $this->wallet->fresh()->balance_pending)->toBe(10000.0);
});

test('une notification pawaPay forgée ne valide rien : le statut est redemandé à pawaPay', function () {
    Http::fake(['api.sandbox.pawapay.io/v2/deposits/*' => Http::response(['status' => 'FOUND', 'data' => ['status' => 'FAILED']])]);

    $this->postJson('/api/webhooks/pawapay/deposits', ['depositId' => $this->order->payment_reference, 'status' => 'COMPLETED'])->assertOk();

    expect($this->order->fresh()->payment_status)->toBe('failed');
    expect((float) $this->wallet->fresh()->balance_held)->toBe(0.0);
});

test('une notification pawaPay confirmée valide la commande', function () {
    Http::fake(['api.sandbox.pawapay.io/v2/deposits/*' => Http::response(['status' => 'FOUND', 'data' => ['status' => 'COMPLETED', 'providerTransactionId' => 'tx']])]);

    $this->postJson('/api/webhooks/pawapay/deposits', ['depositId' => $this->order->payment_reference])->assertOk();

    expect($this->order->fresh()->payment_status)->toBe('paid');
});

test('un virement échoué rend la totalité au vendeur, frais compris', function () {
    $this->wallet->update(['balance_pending' => 10000]);
    $w = Withdrawal::create(['wallet_id' => $this->wallet->id, 'amount' => 10000, 'fee' => 300, 'net_amount' => 9700, 'operator' => 'MTN',
        'phone_number' => '237677000000', 'status' => 'processing', 'payment_provider' => 'pawapay', 'payment_reference' => '22222222-2222-2222-2222-222222222222']);
    Http::fake(['api.sandbox.pawapay.io/v2/payouts/*' => Http::response(['status' => 'FOUND', 'data' => ['status' => 'FAILED']])]);

    $this->postJson('/api/webhooks/pawapay/payouts', ['payoutId' => $w->payment_reference])->assertOk();

    expect($w->fresh()->status)->toBe('rejected');
    expect((float) $this->wallet->fresh()->balance_available)->toBe(10000.0);
    expect((float) $this->wallet->fresh()->balance_pending)->toBe(0.0);
});

test('l’admin envoie le virement net par pawaPay', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->wallet->update(['balance_pending' => 10000]);
    $w = Withdrawal::create(['wallet_id' => $this->wallet->id, 'amount' => 10000, 'fee' => 300, 'net_amount' => 9700, 'operator' => 'MTN', 'phone_number' => '237677000000', 'status' => 'pending']);
    Http::fake(['api.sandbox.pawapay.io/v2/payouts' => Http::response(['status' => 'ACCEPTED'])]);

    $this->actingAs($admin)->post(route('admin.withdrawals.approve', $w))->assertSessionHasNoErrors();

    Http::assertSent(fn ($r) => $r['amount'] === '9700' && $r['recipient']['accountDetails']['provider'] === 'MTN_MOMO_CMR');
    expect($w->fresh()->status)->toBe('processing');
});
