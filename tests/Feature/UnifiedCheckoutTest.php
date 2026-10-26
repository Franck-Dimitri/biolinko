<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SmartLink;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    Http::fake([
        '*transaction-token*' => Http::response(['transaction_token' => 'tok'], 200),
        'api.sandbox.pawapay.io/v2/deposits' => Http::response(['status' => 'ACCEPTED'], 200),
        '*' => Http::response([], 200),
    ]);

    $this->store = Store::create([
        'user_id' => User::factory()->create()->id,
        'name' => 'Boutique Unifiée',
        'slug' => 'boutique-unifiee',
        'is_published' => true,
    ]);
    Wallet::create(['store_id' => $this->store->id]);

    $this->product = Product::create([
        'store_id' => $this->store->id,
        'title' => 'Robe Wax',
        'slug' => 'robe-wax',
        'price_vendor' => 10000,
        'min_order_quantity' => 1,
        'stock' => 10,
    ]);

    $this->customer = [
        'customer_name' => 'Awa Mbarga',
        'customer_phone' => '677123456',
        'delivery_address' => 'Bonamoussadi, près de la pharmacie',
        'delivery_city' => 'Douala',
        'operator' => 'MTN',
    ];
});

test('checkout stores the delivery city separately from the address', function () {
    $this->postJson(route('checkout.process'), $this->customer + [
        'store_id' => $this->store->id,
        'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
    ])->assertOk()->assertJson(['success' => true]);

    $order = Order::first();
    expect($order->city)->toBe('Douala');
    expect((float) $order->total_client)->toBe(10350.0);
});

test('checkout charges the variant price when the variant has one', function () {
    $variant = ProductVariant::create([
        'product_id' => $this->product->id,
        'size' => 'XL',
        'price' => 12000,
        'stock_quantity' => 5,
    ]);

    $this->postJson(route('checkout.process'), $this->customer + [
        'store_id' => $this->store->id,
        'items' => [['product_id' => $this->product->id, 'variant_id' => $variant->id, 'quantity' => 1]],
    ])->assertOk();

    expect((float) Order::first()->price_vendor)->toBe(12000.0);
});

test('smartlink checkout uses the pack price and the unified order engine', function () {
    $link = SmartLink::create([
        'store_id' => $this->store->id,
        'title' => 'Pack Duo',
        'code' => 'sl_pack1234',
        'subtotal_amount' => 20000,
        'total_amount' => 18000,
        'items' => [[
            'product_id' => $this->product->id,
            'product_name' => 'Robe Wax',
            'unit_price' => 10000,
            'quantity' => 2,
            'line_total' => 20000,
        ]],
        'is_active' => true,
    ]);

    $this->postJson(route('smartlink.checkout', $link->code), $this->customer)
        ->assertOk()
        ->assertJson(['success' => true]);

    $order = Order::with('items')->first();
    expect((float) $order->price_vendor)->toBe(18000.0);
    expect((float) $order->total_client)->toBe(18630.0);
    expect($order->items)->toHaveCount(1);
    expect($order->items->first()->product_title)->toBe('Robe Wax');
    // Le compteur n'avance qu'au paiement
    expect($link->fresh()->sales_count)->toBe(0);
    $order->markAsPaid();
    expect($link->fresh()->sales_count)->toBe(1);
});
