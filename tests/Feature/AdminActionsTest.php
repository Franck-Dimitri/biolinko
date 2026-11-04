<?php

use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;

beforeEach(function () {
    $this->mock(\App\Services\Whatsapp\WhatsappGatewayService::class)->shouldIgnoreMissing();
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->seller = User::factory()->create(['role' => 'seller']);
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'B', 'slug' => 'b', 'is_published' => true]);
    $this->wallet = Wallet::create(['store_id' => $this->store->id, 'balance_available' => 0, 'balance_pending' => 10000]);
});

test('un plan attribué par l’admin a une vraie échéance et s’applique', function () {
    $this->actingAs($this->admin)->post(route('admin.users.plan', $this->seller), ['plan' => 'growth', 'months' => 3])->assertSessionHasNoErrors();

    $seller = $this->seller->fresh();
    expect($seller->effectivePlan())->toBe('growth');
    expect((int) round(now()->diffInDays($seller->subscription_expires_at)))->toBeGreaterThanOrEqual(89);
    expect(Subscription::where('user_id', $seller->id)->value('payment_provider'))->toBe('admin');
});

test('les trois écrans admin de changement de plan donnent le même résultat', function () {
    $this->actingAs($this->admin)->post(route('admin.stores.plan', $this->store), ['plan_type' => 'pro']);
    expect($this->seller->fresh()->effectivePlan())->toBe('pro');

    $this->actingAs($this->admin)->post(route('admin.subscriptions.updatePlan', $this->seller), ['plan' => 'starter']);
    expect($this->seller->fresh()->subscription_expires_at)->toBeNull();
});

test('un retrait marqué payé à la main ne débite qu’une fois, même avec un double clic', function () {
    $w = Withdrawal::create(['wallet_id' => $this->wallet->id, 'amount' => 10000, 'fee' => 300, 'net_amount' => 9700, 'operator' => 'MTN', 'phone_number' => '237677000000', 'status' => 'pending']);

    $this->actingAs($this->admin)->post(route('admin.withdrawals.approve', $w), ['manual' => 1]);
    $this->actingAs($this->admin)->post(route('admin.withdrawals.approve', $w), ['manual' => 1]);

    expect($w->fresh()->status)->toBe('completed');
    expect((float) $this->wallet->fresh()->balance_pending)->toBe(0.0);
});

test('un retrait rejeté rend le montant au vendeur', function () {
    $w = Withdrawal::create(['wallet_id' => $this->wallet->id, 'amount' => 10000, 'fee' => 300, 'net_amount' => 9700, 'operator' => 'MTN', 'phone_number' => '237677000000', 'status' => 'pending']);

    $this->actingAs($this->admin)->post(route('admin.withdrawals.reject', $w));

    expect($w->fresh()->status)->toBe('rejected');
    expect((float) $this->wallet->fresh()->balance_available)->toBe(10000.0);
});

test('suspendre une boutique la dépublie sans la supprimer', function () {
    $this->actingAs($this->admin)->post(route('admin.stores.moderate', $this->store), ['reason' => 'Photos non conformes'])->assertSessionHasNoErrors();

    expect($this->store->fresh()->is_published)->toBeFalse();
    expect(Store::find($this->store->id))->not->toBeNull();
});

test('les pages admin refaites s’ouvrent avec des filtres', function () {
    foreach ([
        route('admin.stores.index', ['status' => 'reported']),
        route('admin.subscriptions.index', ['plan' => 'expiring']),
        route('admin.transactions.index', ['status' => 'failed']),
        route('admin.withdrawals.index', ['status' => 'processing']),
        route('admin.users.show', $this->seller),
        route('admin.wallet.index'),
        route('admin.settings.index'),
    ] as $url) {
        $this->actingAs($this->admin)->get($url)->assertOk();
    }
});
