<?php

use App\Models\Order;
use App\Models\User;
use App\Support\PilotOffer;

beforeEach(function () {
    $this->mock(\App\Services\Whatsapp\WhatsappGatewayService::class)->shouldIgnoreMissing();
    // Pas de facture PDF ni d'e-mail pour chacune des dizaines de ventes simulées
    $this->mock(\App\Services\Sales\OrderInvoiceService::class)->shouldIgnoreMissing();
    $this->seller = User::factory()->create(['role' => 'seller']);
    $this->store = $this->seller->ensureStore();
});

function pilotSale($store, array $attrs = []): Order
{
    $order = Order::create($attrs + ['uuid' => (string) Str::uuid(), 'tracking_code' => 'BLK-P'.Str::random(6), 'store_id' => $store->id, 'customer_name' => 'A', 'customer_phone' => '237677000000',
        'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 5000, 'saas_margin' => 175, 'api_fee' => 0, 'total_client' => 5175,
        'status' => 'pending', 'payment_status' => 'pending', 'payment_provider' => 'mercypay']);
    $order->markAsPaid();

    return $order;
}

test('l’admin active l’offre pilote : un mois de Growth, sans renouvellement automatique', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin)->post(route('admin.users.pilot', $this->seller))->assertRedirect();

    $s = $this->seller->fresh();
    expect($s->plan)->toBe('growth')->and($s->subscription_expires_at->isSameDay(now()->addMonth()))->toBeTrue()
        ->and((bool) $s->auto_renew)->toBeFalse()->and($s->pilot_started_at)->not->toBeNull();
    expect(PilotOffer::progress($s))->toMatchArray(['paid' => 0, 'target' => 10, 'months_earned' => 1, 'months_max' => 3]);
});

test('chaque palier de 10 paiements dans l’app ajoute un mois, jusqu’à 3 mois', function () {
    PilotOffer::start($this->seller);
    $end = $this->seller->fresh()->subscription_expires_at;

    foreach (range(1, 9) as $i) pilotSale($this->store);
    expect($this->seller->fresh()->pilot_bonus_months)->toBe(0);

    pilotSale($this->store); // 10e paiement
    $s = $this->seller->fresh();
    expect($s->pilot_bonus_months)->toBe(1)->and($s->subscription_expires_at->isSameDay($end->copy()->addMonth()))->toBeTrue();

    foreach (range(1, 20) as $i) pilotSale($this->store); // 30 paiements au total
    $s = $this->seller->fresh();
    expect($s->pilot_bonus_months)->toBe(2)->and($s->subscription_expires_at->isSameDay($end->copy()->addMonths(2)))->toBeTrue();
    expect(PilotOffer::progress($s)['target'])->toBeNull(); // maximum atteint
});

test('les factures manuelles ne comptent pas pour l’offre', function () {
    PilotOffer::start($this->seller);
    foreach (range(1, 12) as $i) pilotSale($this->store, ['is_manual' => true]);

    expect($this->seller->fresh()->pilot_bonus_months)->toBe(0)->and(PilotOffer::paidSales($this->seller->fresh()))->toBe(0);
});

test('une offre terminée n’est plus prolongée', function () {
    PilotOffer::start($this->seller);
    $this->seller->forceFill(['plan' => 'starter', 'subscription_expires_at' => null])->save();
    foreach (range(1, 10) as $i) pilotSale($this->store);

    expect($this->seller->fresh()->plan)->toBe('starter')->and($this->seller->fresh()->pilot_bonus_months)->toBe(0);
});
