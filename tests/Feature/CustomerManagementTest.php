<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;

test('checkout creates customer record and links to store_customer pivot table', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Alpha',
        'slug' => 'boutique-alpha',
    ]);
    Wallet::create(['store_id' => $store->id]);

    $product = Product::create([
        'store_id' => $store->id,
        'title' => 'Sac Luxe',
        'slug' => 'sac-luxe',
        'price_vendor' => 10000,
        'min_order_quantity' => 1,
        'stock' => 10,
    ]);

    $response = $this->post(route('checkout.process'), [
        'store_id' => $store->id,
        'customer_name' => 'Alice Client',
        'customer_phone' => '0199887766',
        'customer_email' => 'alice@test.com',
        'customer_whatsapp' => '+229 97 99 88 77',
        'delivery_address' => 'Cotonou Cadjehoun',
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('customers', [
        'name' => 'Alice Client',
        'phone' => '0199887766',
        'email' => 'alice@test.com',
    ]);

    $customer = Customer::where('phone', '0199887766')->first();
    expect($customer)->not->toBeNull();

    $this->assertDatabaseHas('store_customer', [
        'store_id' => $store->id,
        'customer_id' => $customer->id,
        'total_orders_count' => 1,
    ]);
});

test('customer lookup API endpoint returns saved customer profile', function () {
    $customer = Customer::create([
        'name' => 'Bob Testeur',
        'phone' => '0144556677',
        'email' => 'bob@test.com',
        'whatsapp' => '+229 90 11 22 33',
        'delivery_address' => 'Porto-Novo Centre',
        'city' => 'Porto-Novo',
    ]);

    $response = $this->get(route('checkout.lookupCustomer', ['phone' => '0144556677']));

    $response->assertStatus(200);
    $response->assertJson([
        'found' => true,
        'customer' => [
            'name' => 'Bob Testeur',
            'phone' => '0144556677',
            'email' => 'bob@test.com',
            'delivery_address' => 'Porto-Novo Centre',
        ]
    ]);
});

test('vendor can view customer directory dashboard page', function () {
    $user = User::factory()->create();
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Beta',
        'slug' => 'boutique-beta',
    ]);
    Wallet::create(['store_id' => $store->id]);

    $customer = Customer::create([
        'name' => 'Chantal Client',
        'phone' => '0122334455',
    ]);
    $store->customers()->attach($customer->id, [
        'total_orders_count' => 2,
        'total_spent' => 25000,
        'last_order_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('customers.index'));

    $response->assertStatus(200);
});
