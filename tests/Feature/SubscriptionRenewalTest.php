<?php

use App\Mail\SubscriptionRenewalMail;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

beforeEach(function () {
    Mail::fake();
    $this->user = User::factory()->create(['plan' => 'pro', 'subscription_expires_at' => now()->addDays(2)]);
    $this->store = Store::create(['user_id' => $this->user->id, 'name' => 'B', 'slug' => 'b']);
    $this->wallet = Wallet::create(['store_id' => $this->store->id, 'balance_available' => 10000, 'balance_pending' => 0]);
});

test('3 jours avant l’échéance, le vendeur est prévenu une seule fois', function () {
    $this->artisan('subscriptions:renew')->assertSuccessful();
    $this->artisan('subscriptions:renew');
    Mail::assertSent(SubscriptionRenewalMail::class, 1);
    Mail::assertSent(SubscriptionRenewalMail::class, fn ($m) => $m->type === 'upcoming' && $m->amount == 2500 && $m->balance == 10000);
    expect((float) $this->wallet->fresh()->balance_available)->toBe(10000.0);
});

test('à l’échéance, le mois est prélevé sur le solde et le plan prolongé', function () {
    $end = now()->addMinutes(30);
    $this->user->update(['subscription_expires_at' => $end]);

    $this->artisan('subscriptions:renew');
    $this->artisan('subscriptions:renew'); // pas de double prélèvement

    expect((float) $this->wallet->fresh()->balance_available)->toBe(7500.0);
    $u = $this->user->fresh();
    expect($u->plan)->toBe('pro')->and($u->subscription_expires_at->toDateString())->toBe($end->copy()->addMonth()->toDateString());
    expect(Subscription::where('payment_provider', 'wallet')->where('payment_status', 'paid')->count())->toBe(1);
    Mail::assertSent(SubscriptionRenewalMail::class, fn ($m) => $m->type === 'renewed');
});

test('solde insuffisant : rien n’est prélevé, le vendeur est prévenu, et on réessaie quand l’argent arrive', function () {
    $this->wallet->update(['balance_available' => 1000]);
    $this->user->update(['subscription_expires_at' => now()->subHour()]);

    $this->artisan('subscriptions:renew');
    $this->artisan('subscriptions:renew');
    Mail::assertSent(SubscriptionRenewalMail::class, fn ($m) => $m->type === 'failed');
    Mail::assertSent(SubscriptionRenewalMail::class, 1);
    expect((float) $this->wallet->fresh()->balance_available)->toBe(1000.0)->and($this->user->fresh()->effectivePlan())->toBe('starter');

    $this->wallet->update(['balance_available' => 6000]);
    $this->artisan('subscriptions:renew');
    expect($this->user->fresh()->effectivePlan())->toBe('pro')->and((float) $this->wallet->fresh()->balance_available)->toBe(3500.0);
});

test('prélèvement désactivé : rien n’est prélevé', function () {
    $this->user->update(['subscription_expires_at' => now()->addMinutes(10), 'auto_renew' => false]);
    $this->artisan('subscriptions:renew');
    expect((float) $this->wallet->fresh()->balance_available)->toBe(10000.0);
    Mail::assertNotSent(SubscriptionRenewalMail::class, fn ($m) => $m->type === 'renewed');
});

test('le vendeur active ou désactive le prélèvement', function () {
    $this->actingAs($this->user)->post(route('seller.subscriptions.autoRenew'))->assertSessionHasNoErrors();
    expect($this->user->fresh()->auto_renew)->toBeFalse();
    $this->actingAs($this->user)->post(route('seller.subscriptions.autoRenew'));
    expect($this->user->fresh()->auto_renew)->toBeTrue();
});

test('paiement manuel avec le solde : immédiat, refusé si le solde ne suffit pas', function () {
    $this->actingAs($this->user)->postJson(route('seller.subscriptions.subscribe'), ['plan' => 'growth', 'method' => 'wallet', 'cycle' => 1])
        ->assertOk()->assertJson(['paid' => true]);
    expect($this->user->fresh()->plan)->toBe('growth')->and((float) $this->wallet->fresh()->balance_available)->toBe(3000.0);

    $this->actingAs($this->user)->postJson(route('seller.subscriptions.subscribe'), ['plan' => 'business', 'method' => 'wallet', 'cycle' => 12])
        ->assertStatus(422)->assertJsonFragment(['error' => 'Solde insuffisant : il faut 122 400 FCFA disponibles, vous avez 3 000 FCFA. Payez par Mobile Money.']);
    expect((float) $this->wallet->fresh()->balance_available)->toBe(3000.0);

    $this->actingAs($this->user)->get(route('seller.wallet.index'))->assertInertia(fn ($p) => $p->where('ledger.0.type', 'subscription')->where('ledger.0.amount', -7000));
});

test('rappels à J-7, J-4 et J-2, un seul par étape, puis prélèvement le jour J', function () {
    $due = now()->addDays(7)->subHour();
    $this->user->update(['subscription_expires_at' => $due]);
    $stages = fn () => Mail::sent(SubscriptionRenewalMail::class)->map(fn ($m) => $m->daysLeft)->all();

    $this->artisan('subscriptions:renew');
    $this->artisan('subscriptions:renew');
    expect($stages())->toBe([7]);

    $this->travelTo($due->copy()->subDays(4)->addMinute());
    $this->artisan('subscriptions:renew');
    $this->artisan('subscriptions:renew');
    expect($stages())->toBe([7, 4]);

    $this->travelTo($due->copy()->subDays(2)->addMinute());
    $this->artisan('subscriptions:renew');
    expect($stages())->toBe([7, 4, 2]);
    expect((float) $this->wallet->fresh()->balance_available)->toBe(10000.0);

    $this->travelTo($due->copy()->subMinutes(10));
    $this->artisan('subscriptions:renew');
    expect((float) $this->wallet->fresh()->balance_available)->toBe(7500.0);
    Mail::assertSent(SubscriptionRenewalMail::class, fn ($m) => $m->type === 'renewed');

    // Nouvelle échéance : les rappels repartent
    $this->travelTo($this->user->fresh()->subscription_expires_at->copy()->subDays(7)->addHours(2));
    $this->artisan('subscriptions:renew');
    expect(array_slice($stages(), -1))->toBe([7]);
});
