<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seller = User::factory()->create();
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'B', 'slug' => 'b', 'is_published' => true]);
    Wallet::create(['store_id' => $this->store->id, 'balance_available' => 0, 'balance_pending' => 0]);
    $this->product = Product::create(['store_id' => $this->store->id, 'title' => 'Sac', 'slug' => 'sac', 'price_vendor' => 10000, 'stock' => 5, 'min_order_quantity' => 1, 'is_active' => true]);
    $this->customer = Customer::create(['name' => 'Awa', 'phone' => '237699887766']);
    $this->store->customers()->attach($this->customer->id, ['total_orders_count' => 0, 'total_spent' => 0, 'last_order_at' => now()]);

    $this->order = Order::create([
        'uuid' => 'u-1', 'tracking_code' => 'BLK-CMD-TEST', 'store_id' => $this->store->id, 'customer_id' => $this->customer->id,
        'customer_name' => 'Awa', 'customer_phone' => '237699887766', 'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 20000, 'saas_margin' => 600,
        'api_fee' => 0, 'total_client' => 20600, 'status' => 'pending', 'payment_status' => 'pending', 'payment_provider' => 'hrskills', 'payment_reference' => 'REF-1',
    ]);
    $this->order->items()->create(['product_id' => $this->product->id, 'product_title' => 'Sac', 'quantity' => 2, 'unit_price_vendor' => 10000, 'total_price_vendor' => 20000]);
});

test('un paiement validé deux fois ne crédite qu’une fois', function () {
    expect($this->order->markAsPaid())->toBeTrue();
    expect($this->order->fresh()->markAsPaid())->toBeFalse();

    expect((float) Wallet::first()->balance_held)->toBe(18600.0); // 20 000 − 7 % de commission Starter, en attente pendant le délai
    expect((float) Wallet::first()->balance_available)->toBe(0.0);
    expect($this->product->fresh()->stock)->toBe(3);
    $pivot = $this->store->customers()->first()->pivot;
    expect($pivot->total_orders_count)->toBe(1);
});

test('un webhook non signé est refusé quand un secret est configuré', function () {
    config(['services.hrskills_pay.webhook_secret' => 'secret']);

    $this->postJson('/api/webhooks/hrskills-pay', ['data' => ['reference' => 'REF-1', 'status' => 'SUCCESS']])->assertStatus(401);
    expect($this->order->fresh()->payment_status)->toBe('pending');
});

test('un webhook signé valide la commande', function () {
    config(['services.hrskills_pay.webhook_secret' => 'secret']);
    $body = json_encode(['data' => ['reference' => 'REF-1', 'status' => 'SUCCESS']]);

    $this->call('POST', '/api/webhooks/hrskills-pay', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_HUB_SIGNATURE' => 'sha256='.hash_hmac('sha256', $body, 'secret'),
    ], $body)->assertOk();

    expect($this->order->fresh()->payment_status)->toBe('paid');
});

test('une boutique non publiée ne prend pas de commande', function () {
    $this->store->update(['is_published' => false]);

    $this->postJson(route('checkout.process'), [
        'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '699887766',
        'delivery_address' => 'Akwa', 'product_id' => $this->product->id, 'quantity' => 1,
    ])->assertStatus(422);
});

test('un produit désactivé ne peut pas être commandé', function () {
    $this->product->update(['is_active' => false]);

    $this->postJson(route('checkout.process'), [
        'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '699887766',
        'delivery_address' => 'Akwa', 'product_id' => $this->product->id, 'quantity' => 1,
    ])->assertStatus(422);
});

test('un abonnement activé deux fois ne prolonge qu’une fois', function () {
    $sub = Subscription::create(['user_id' => $this->seller->id, 'plan' => 'pro', 'billing_cycle' => 1, 'amount' => 2500, 'payment_status' => 'pending']);

    expect($sub->activate())->toBeTrue();
    expect($sub->activate())->toBeFalse();

    $expires = $this->seller->fresh()->subscription_expires_at;
    expect((int) round(now()->diffInDays($expires)))->toBeLessThanOrEqual(31);
});

test('le paiement simulé est impossible en production', function () {
    app()->detectEnvironment(fn () => 'production');
    config(['services.hrskills_pay.subscription_mode' => 'simulation']);

    $method = new ReflectionMethod(\App\Http\Controllers\SubscriptionController::class, 'isSimulation');
    expect($method->invoke(app(\App\Http\Controllers\SubscriptionController::class)))->toBeFalse();
});

test('le plan Starter est limité en liens de paiement actifs', function () {
    foreach (range(1, 2) as $i) {
        \App\Models\SmartLink::create(['store_id' => $this->store->id, 'title' => "L$i", 'code' => "C$i", 'items' => [], 'total_amount' => 1000, 'is_active' => true]);
    }

    $this->actingAs($this->seller)->post(route('seller.smartlinks.store'), [
        'title' => 'L3', 'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
    ])->assertSessionHasErrors('title');
    expect(\App\Models\SmartLink::count())->toBe(2);
});

test('un produit en promo se crée sans erreur sur un plan payant', function () {
    $this->seller->update(['plan' => 'pro', 'subscription_expires_at' => now()->addMonth()]);

    $this->actingAs($this->seller)->post(route('products.store'), [
        'title' => 'Robe', 'price_vendor' => 5000, 'stock' => 2, 'min_order_quantity' => 1,
        'is_promo' => true, 'promo_price' => 4000,
    ])->assertSessionHasNoErrors();
    expect(Product::where('title', 'Robe')->value('is_promo'))->toBeTruthy();
});

test('le Starter est bloqué au-delà de 5 produits', function () {
    foreach (range(1, 4) as $i) {
        Product::create(['store_id' => $this->store->id, 'title' => "P$i", 'slug' => "p$i", 'price_vendor' => 100, 'stock' => 1, 'min_order_quantity' => 1]);
    }

    $this->actingAs($this->seller)->post(route('products.store'), [
        'title' => 'Sixième', 'price_vendor' => 100, 'stock' => 1, 'min_order_quantity' => 1,
    ])->assertSessionHasErrors('title');
});

test('les commandes non payées depuis 24 h sont annulées, pas les factures manuelles', function () {
    $this->order->forceFill(['created_at' => now()->subHours(25)])->save();
    $manual = $this->order->replicate(['invoice_number']);
    $manual->forceFill(['uuid' => 'u-2', 'tracking_code' => 'BLK-MAN', 'hrskills_reference' => null, 'is_manual' => true, 'created_at' => now()->subDays(3)])->save();

    $this->artisan('orders:expire-unpaid')->assertSuccessful();

    expect($this->order->fresh()->status)->toBe('cancelled');
    expect($manual->fresh()->status)->toBe('pending');
});

test('la boutique publique ne divulgue pas le compte du vendeur et filtre les pixels selon le plan', function () {
    $this->store->update(['facebook_pixel_id' => '123456789012']);

    $props = $this->get('/b')->assertOk()->viewData('page')['props']['store'];
    expect($props)->not->toHaveKey('user');
    expect($props)->not->toHaveKey('facebook_pixel_id'); // Starter : pas de pixels

    $this->seller->update(['plan' => 'pro', 'subscription_expires_at' => now()->addMonth()]);
    $props = $this->get('/b')->viewData('page')['props']['store'];
    expect($props['facebook_pixel_id'])->toBe('123456789012');
});

test('un identifiant de pixel invalide est refusé', function () {
    $this->seller->update(['plan' => 'pro', 'subscription_expires_at' => now()->addMonth()]);

    $this->actingAs($this->seller)->post(route('seller.marketing.update'), ['facebook_pixel_id' => '<script>'])
        ->assertSessionHasErrors('facebook_pixel_id');
});

test('la relance n’envoie qu’un rappel, seulement pour un vendeur Growth', function () {
    $sent = 0;
    $this->mock(\App\Services\WhatsappGatewayService::class, function ($m) use (&$sent) {
        $m->shouldReceive('send1ClickReminder')->andReturnUsing(function () use (&$sent) { $sent++; return ['success' => true]; });
    });
    $this->order->forceFill(['created_at' => now()->subHours(2)])->save();

    $this->artisan('orders:remind-unpaid')->assertSuccessful();
    expect($sent)->toBe(0); // Starter : pas de relance

    $this->seller->update(['plan' => 'growth', 'subscription_expires_at' => now()->addMonth()]);
    $this->artisan('orders:remind-unpaid')->assertSuccessful();
    $this->artisan('orders:remind-unpaid')->assertSuccessful();
    expect($sent)->toBe(1);
    expect($this->order->fresh()->payment_reminded_at)->not->toBeNull();
});

test('une commande en attente peut être payée depuis sa page de suivi', function () {
    $remote = 'FAILED'; // statut renvoyé par pawaPay pour la demande précédente
    \Illuminate\Support\Facades\Http::fake(function ($request) use (&$remote) {
        if ($request->method() === 'GET') {
            return \Illuminate\Support\Facades\Http::response(['status' => 'FOUND', 'data' => ['status' => $remote]]);
        }

        return \Illuminate\Support\Facades\Http::response(['status' => 'ACCEPTED']);
    });

    $this->order->update(['payment_provider' => 'pawapay', 'payment_reference' => '00000000-0000-0000-0000-000000000001']);

    $res = $this->postJson(route('order.pay', 'BLK-CMD-TEST'))->assertOk()->json();
    expect($this->order->fresh()->payment_reference)->toBe($res['reference']);
    expect($this->order->fresh()->payment_provider)->toBe('pawapay');

    // La demande vient d'être envoyée et attend la validation : pas de deuxième demande tout de suite
    $remote = 'PROCESSING';
    $this->postJson(route('order.pay', 'BLK-CMD-TEST'))->assertStatus(422);

    $this->order->update(['payment_status' => 'paid', 'status' => 'paid']);
    $this->postJson(route('order.pay', 'BLK-CMD-TEST'))->assertStatus(422);
});

test('changer de plan convertit les jours restants en jours offerts', function () {
    $this->travelTo(now()->startOfDay());
    $this->seller->update(['plan' => 'pro', 'subscription_expires_at' => now()->addDays(14)]); // 14 j × 2 500 = 35 000
    $sub = Subscription::create(['user_id' => $this->seller->id, 'plan' => 'growth', 'billing_cycle' => 1, 'amount' => 7000, 'payment_status' => 'pending']);

    $bonus = $this->seller->planConversionDays('growth');
    expect($bonus)->toBe((int) floor(14 * 2500 / 7000));

    $sub->activate();
    $user = $this->seller->fresh();
    expect($user->plan)->toBe('growth');
    expect($user->subscription_expires_at->toDateString())->toBe(now()->addMonth()->addDays($bonus)->toDateString());
});

test('prolonger le même plan ne compte pas de conversion', function () {
    $this->travelTo(now()->startOfDay());
    $this->seller->update(['plan' => 'pro', 'subscription_expires_at' => now()->addDays(10)]);
    Subscription::create(['user_id' => $this->seller->id, 'plan' => 'pro', 'billing_cycle' => 1, 'amount' => 2500, 'payment_status' => 'pending'])->activate();

    expect($this->seller->fresh()->subscription_expires_at->toDateString())->toBe(now()->addDays(10)->addMonth()->toDateString());
});
