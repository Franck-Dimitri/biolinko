<?php

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;

function makeSeller(string $plan, string $slug): array
{
    $vendor = User::factory()->create([
        'role' => 'seller',
        'plan' => $plan,
        'subscription_expires_at' => now()->addMonth(),
    ]);
    $store = Store::create(['user_id' => $vendor->id, 'name' => 'Boutique '.$slug, 'slug' => $slug]);
    Wallet::create(['store_id' => $store->id]);

    return [$vendor, $store];
}

function makeOrder(Store $store, array $attributes = []): Order
{
    $order = Order::create(array_merge([
        'store_id' => $store->id,
        'customer_name' => 'Awa Client',
        'customer_phone' => '690000000',
        'city' => 'Douala',
        'price_vendor' => 10000,
        'saas_margin' => 300,
        'api_fee' => 0,
        'total_client' => 10300,
        'status' => 'paid',
    ], $attributes));

    $order->items()->create([
        'product_title' => 'Robe Wax',
        'variant_label' => 'Taille M',
        'quantity' => 2,
        'unit_price_vendor' => 5000,
        'total_price_vendor' => 10000,
    ]);

    return $order;
}

test('business seller downloads a CSV of their own sales with totals', function () {
    [$vendor, $store] = makeSeller('business', 'boutique-biz');
    [, $otherStore] = makeSeller('business', 'autre-boutique');

    makeOrder($store);
    makeOrder($store, ['status' => 'delivered', 'customer_name' => 'Jean Livré']);
    makeOrder($store, ['status' => 'cancelled', 'customer_name' => 'Annulé Client']);
    makeOrder($otherStore, ['customer_name' => 'Client Concurrent']);

    $response = $this->actingAs($vendor)->get(route('orders.export'));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('text/csv');
    expect($response->headers->get('content-disposition'))->toContain('ventes-boutique-biz-');

    $csv = $response->streamedContent();

    expect($csv)->toStartWith("\xEF\xBB\xBF")
        ->toContain('"Date commande";"N° commande";Statut')
        ->toContain('Awa Client')
        ->toContain('Jean Livré')
        ->toContain('2× Robe Wax (Taille M)')
        ->not->toContain('Annulé Client')
        ->not->toContain('Client Concurrent')
        ->toContain('TOTAL;"2 commande(s)";;;;;;4;20000;600;20600');
});

test('scope all includes cancelled orders and date filter excludes older orders', function () {
    [$vendor, $store] = makeSeller('business', 'boutique-scope');

    makeOrder($store, ['status' => 'cancelled', 'customer_name' => 'Annulé Client']);
    $old = makeOrder($store, ['customer_name' => 'Ancien Client']);
    $old->forceFill(['created_at' => now()->subMonths(3)])->save();

    $csv = $this->actingAs($vendor)
        ->get(route('orders.export', ['from' => now()->startOfMonth()->toDateString(), 'to' => now()->toDateString(), 'scope' => 'all']))
        ->streamedContent();

    expect($csv)->toContain('Annulé Client')->not->toContain('Ancien Client');
});

test('customer data cannot inject spreadsheet formulas', function () {
    [$vendor, $store] = makeSeller('business', 'boutique-safe');
    makeOrder($store, ['customer_name' => '=HYPERLINK("http://evil.test")']);

    $csv = $this->actingAs($vendor)->get(route('orders.export'))->streamedContent();

    expect($csv)->toContain("'=HYPERLINK");
});

test('sellers below the business plan are redirected to subscriptions', function () {
    [$vendor] = makeSeller('growth', 'boutique-growth');

    $this->actingAs($vendor)
        ->get(route('orders.export'))
        ->assertRedirect(route('seller.subscriptions.index'));
});

test('invalid date range is rejected', function () {
    [$vendor] = makeSeller('business', 'boutique-dates');

    $this->actingAs($vendor)
        ->get(route('orders.export', ['from' => '2026-05-10', 'to' => '2026-05-01']))
        ->assertSessionHasErrors('to');
});
