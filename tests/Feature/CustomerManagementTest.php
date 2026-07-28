<?php

use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

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
        'customer_phone' => '699887766',
        'customer_email' => 'alice@test.com',
        'customer_whatsapp' => '+237 699 88 77 66',
        'delivery_address' => 'Douala Akwa',
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->assertDatabaseHas('customers', [
        'name' => 'Alice Client',
        'phone' => '237699887766',
        'email' => 'alice@test.com',
    ]);

    $customer = Customer::where('phone', '237699887766')->first();
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
        'phone' => '237674455667',
        'email' => 'bob@test.com',
        'whatsapp' => '+237 674 45 56 67',
        'delivery_address' => 'Yaoundé Bastos',
        'city' => 'Yaoundé',
    ]);

    $response = $this->get(route('checkout.lookupCustomer', ['phone' => '237674455667']));

    $response->assertStatus(200);
    $response->assertJson([
        'found' => true,
        'customer' => [
            'name' => 'Bob Testeur',
            'phone' => '237674455667',
            'email' => 'bob@test.com',
            'delivery_address' => 'Yaoundé Bastos',
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
        'phone' => '237692233445',
    ]);
    $store->customers()->attach($customer->id, [
        'total_orders_count' => 2,
        'total_spent' => 25000,
        'last_order_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('customers.index'));

    $response->assertStatus(200);
});
