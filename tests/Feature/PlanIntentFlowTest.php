<?php

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.hrskills_pay.subscription_mode' => 'simulation']);
});

test('a plan chosen on the landing survives login and opens the subscription page', function () {
    $user = User::factory()->create(['role' => 'seller', 'password' => bcrypt('secret-pass')]);

    $this->get(route('login', ['plan' => 'pro']))->assertOk();

    $this->post(route('login'), ['email' => $user->email, 'password' => 'secret-pass'])
        ->assertRedirect(route('dashboard', absolute: false));

    $this->get(route('dashboard'))
        ->assertRedirect(route('seller.subscriptions.index', ['plan' => 'pro']));

    // L'intention est consommée : le tableau de bord redevient normal ensuite
    $this->get(route('dashboard'))->assertRedirect(route('seller.dashboard'));
});

test('an unknown or free plan is ignored', function () {
    $this->get(route('register', ['plan' => 'starter']))->assertOk();
    expect(session('intended_plan'))->toBeNull();

    $this->get(route('register', ['plan' => 'hack']))->assertOk();
    expect(session('intended_plan'))->toBeNull();
});

test('simulated subscription payment activates the plan without calling the operator', function () {
    $user = User::factory()->create(['role' => 'seller', 'plan' => 'starter']);

    $res = $this->actingAs($user)->postJson(route('seller.subscriptions.subscribe'), [
        'plan' => 'growth',
        'phone_momo' => '677123456',
        'cycle' => 12,
    ])->assertOk()->assertJson(['simulated' => true, 'requires_ussd' => true]);

    $reference = $res->json('reference');
    expect($reference)->toStartWith('SIM-');

    // Tout de suite : encore en attente, comme une vraie demande USSD
    $this->actingAs($user)->getJson(route('seller.subscriptions.status', $reference))->assertJson(['paid' => false]);

    $this->travel(5)->seconds();

    $this->actingAs($user)->getJson(route('seller.subscriptions.status', $reference))->assertJson(['paid' => true]);

    $user->refresh();
    expect($user->plan)->toBe('growth');
    expect($user->subscription_expires_at->isFuture())->toBeTrue();
    expect(Subscription::first()->payment_status)->toBe('paid');
});

test('a seller cannot poll another seller subscription', function () {
    $owner = User::factory()->create(['role' => 'seller']);
    $other = User::factory()->create(['role' => 'seller']);

    $reference = $this->actingAs($owner)->postJson(route('seller.subscriptions.subscribe'), [
        'plan' => 'pro', 'phone_momo' => '677123456',
    ])->json('reference');

    $this->actingAs($other)->getJson(route('seller.subscriptions.status', $reference))->assertNotFound();
});

test('renewing the active plan adds the new period to the current expiry', function () {
    $expiry = now()->addDays(20)->startOfSecond();
    $user = User::factory()->create(['role' => 'seller', 'plan' => 'pro', 'subscription_expires_at' => $expiry]);

    $reference = $this->actingAs($user)->postJson(route('seller.subscriptions.subscribe'), [
        'plan' => 'pro', 'phone_momo' => '677123456', 'cycle' => 12,
    ])->assertOk()->json('reference');

    $this->travel(5)->seconds();
    $this->actingAs($user)->getJson(route('seller.subscriptions.status', $reference))->assertJson(['paid' => true]);

    expect($user->fresh()->subscription_expires_at->equalTo($expiry->copy()->addMonths(12)))->toBeTrue();
});
