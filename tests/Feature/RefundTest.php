<?php

use App\Models\Order;
use App\Models\OrderReport;
use App\Models\Refund;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->mock(\App\Services\Whatsapp\WhatsappGatewayService::class)->shouldIgnoreMissing();
    $this->seller = User::factory()->create();
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'B', 'slug' => 'b', 'is_published' => true]);
    $this->wallet = Wallet::create(['store_id' => $this->store->id, 'balance_available' => 0, 'balance_pending' => 0]);
    $this->order = Order::create([
        'tracking_code' => 'BLK-R1', 'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677123456',
        'payment_phone' => '237677123456', 'payment_operator' => 'MTN', 'city' => 'Douala', 'address_details' => 'Akwa',
        'price_vendor' => 10000, 'saas_margin' => 350, 'api_fee' => 0, 'total_client' => 10350, 'status' => 'pending', 'payment_status' => 'pending',
    ]);
    $this->order->markAsPaid(); // Starter 10 % : commission 1 000, 9 000 en attente
    $this->order->refresh();
});

function fakePayout(string $status = 'ACCEPTED')
{
    Http::fake(['api.sandbox.pawapay.io/v2/payouts' => Http::response(['status' => $status], 200), '*' => Http::response([], 200)]);
}

test('remboursement total : virement au client, vendeur débité, commission rendue, commande annulée', function () {
    fakePayout();
    $this->actingAs($this->seller)->post(route('orders.refund', $this->order), ['amount' => 10000, 'reason' => 'Rupture de stock'])
        ->assertSessionHasNoErrors();

    $r = Refund::first();
    expect((float) $r->amount)->toBe(10000.0)->and((float) $r->commission_refunded)->toBe(1000.0)->and((float) $r->seller_debit)->toBe(9000.0)
        ->and($r->status)->toBe('processing');
    $o = $this->order->fresh();
    expect($o->payment_status)->toBe('refunded')->and($o->status)->toBe('cancelled')->and((float) $o->commission_amount)->toBe(0.0);
    expect((float) $this->wallet->fresh()->balance_held)->toBe(0.0);
    Http::assertSent(fn ($req) => str_contains($req->url(), '/payouts') && $req['amount'] === '10000');

    // La libération des fonds ne crédite plus rien
    expect($o->releaseFunds())->toBeFalse();
});

test('remboursement partiel : la commission est rendue au prorata et la vente reste payée', function () {
    fakePayout();
    $this->actingAs($this->seller)->post(route('orders.refund', $this->order), ['amount' => 4000, 'reason' => 'Un article manquant']);

    $o = $this->order->fresh();
    expect($o->payment_status)->toBe('paid')->and((float) $o->refunded_amount)->toBe(4000.0)->and((float) $o->commission_amount)->toBe(600.0)
        ->and($o->sellerNet())->toBe(5400.0)
        ->and((float) $this->wallet->fresh()->balance_held)->toBe(5400.0);

    $o->releaseFunds();
    expect((float) $this->wallet->fresh()->balance_available)->toBe(5400.0)->and((float) $this->wallet->fresh()->balance_held)->toBe(0.0);
});

test('un virement échoué remet tout en place', function () {
    fakePayout();
    $this->actingAs($this->seller)->post(route('orders.refund', $this->order), ['amount' => 10000, 'reason' => 'Annulation']);
    Refund::first()->settle(false);

    $o = $this->order->fresh();
    expect($o->payment_status)->toBe('paid')->and($o->status)->toBe('paid')->and((float) $o->refunded_amount)->toBe(0.0)
        ->and((float) $o->commission_amount)->toBe(1000.0)
        ->and((float) $this->wallet->fresh()->balance_held)->toBe(9000.0);
});

test('un refus immédiat de l’agrégateur annule le remboursement', function () {
    fakePayout('REJECTED');
    $this->actingAs($this->seller)->post(route('orders.refund', $this->order), ['amount' => 10000, 'reason' => 'Annulation']);
    expect(Refund::first()->status)->toBe('failed')->and($this->order->fresh()->payment_status)->toBe('paid');
});

test('montant trop élevé, solde insuffisant, double remboursement et autre vendeur sont refusés', function () {
    fakePayout();
    $this->actingAs($this->seller)->post(route('orders.refund', $this->order), ['amount' => 10001, 'reason' => 'x x x'])->assertSessionHasErrors('refund');
    $this->actingAs($this->seller)->post(route('orders.refund', $this->order), ['amount' => 3000, 'reason' => 'Premier']);
    $this->actingAs($this->seller)->post(route('orders.refund', $this->order), ['amount' => 1000, 'reason' => 'Second'])->assertSessionHasErrors('refund');

    // Fonds libérés puis retirés : plus rien sur le portefeuille
    Refund::first()->settle(true);
    $this->order->fresh()->releaseFunds();
    $this->wallet->fresh()->update(['balance_available' => 0]);
    $this->actingAs($this->seller)->post(route('orders.refund', $this->order), ['amount' => 1000, 'reason' => 'Trop tard'])->assertSessionHasErrors('refund');

    $intrus = User::factory()->create();
    Store::create(['user_id' => $intrus->id, 'name' => 'I', 'slug' => 'i']);
    $this->actingAs($intrus)->post(route('orders.refund', $this->order), ['amount' => 100, 'reason' => 'vol'])->assertForbidden();
});

test('acompte : seule la part payée en ligne est remboursable', function () {
    fakePayout();
    $this->order->update(['price_vendor' => 20000, 'balance_due' => 10000]);
    $this->actingAs($this->seller)->post(route('orders.refund', $this->order), ['amount' => 10001, 'reason' => 'x x x'])->assertSessionHasErrors('refund');
});

test('l’admin rembourse un litige et le signalement est clos', function () {
    fakePayout();
    OrderReport::create(['order_id' => $this->order->id, 'store_id' => $this->store->id, 'customer_phone' => '237677123456', 'reason' => 'not_received', 'message' => 'Rien reçu', 'status' => 'open']);
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)->post(route('admin.transactions.refund', $this->order), ['amount' => 10000, 'reason' => 'Litige : non livrée'])->assertSessionHasNoErrors();
    expect($this->order->fresh()->report->status)->toBe('refunded');
    // Un vendeur n'a pas accès à la route admin (redirigé, rien n'est remboursé)
    $this->actingAs($this->seller)->post(route('admin.transactions.refund', $this->order), ['amount' => 1, 'reason' => 'abc']);
    expect(Refund::count())->toBe(1);
});

test('la notification de virement pawaPay finalise le remboursement', function () {
    Http::fake([
        'api.sandbox.pawapay.io/v2/payouts/*' => Http::response(['status' => 'FOUND', 'data' => ['status' => 'COMPLETED']]),
        'api.sandbox.pawapay.io/v2/payouts' => Http::response(['status' => 'ACCEPTED']),
    ]);
    $this->actingAs($this->seller)->post(route('orders.refund', $this->order), ['amount' => 10000, 'reason' => 'Annulation']);
    $r = Refund::first();

    $this->postJson('/api/webhooks/pawapay/payouts', ['payoutId' => $r->payment_reference, 'status' => 'COMPLETED'])->assertOk();
    expect($r->fresh()->status)->toBe('completed');
});
