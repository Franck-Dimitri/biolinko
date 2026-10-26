<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

dataset('plans', ['starter', 'pro', 'growth', 'business']);

test('toutes les pages vendeur s’ouvrent', function (string $plan) {
    $user = User::factory()->create(['role' => 'seller', 'plan' => $plan, 'subscription_expires_at' => $plan === 'starter' ? null : now()->addMonth()]);
    $store = Store::create(['user_id' => $user->id, 'name' => 'Smoke', 'slug' => 'smoke', 'is_published' => true]);
    Wallet::create(['store_id' => $store->id, 'balance_available' => 0, 'balance_pending' => 0]);
    Product::create(['store_id' => $store->id, 'title' => 'P', 'slug' => 'p', 'price_vendor' => 100, 'stock' => 1, 'min_order_quantity' => 1, 'is_active' => true]);

    foreach (['/seller/dashboard', '/seller/appearance', '/seller/products', '/seller/orders', '/seller/wallet', '/seller/invoices',
        '/seller/smartlinks', '/seller/customers', '/seller/marketing', '/seller/tools', '/seller/subscriptions', '/profile'] as $url) {
        $this->actingAs($user)->get($url)->assertOk();
    }

    $this->get('/smoke')->assertOk();
    $this->get('/smoke/p/p')->assertOk();
})->with('plans');

test('toutes les pages admin s’ouvrent', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    foreach (['/admin/dashboard', '/admin/users', '/admin/stores', '/admin/products', '/admin/subscriptions', '/admin/transactions',
        '/admin/wallet', '/admin/withdrawals', '/admin/settings'] as $url) {
        $this->actingAs($admin)->get($url)->assertOk();
    }
});

test('les pages publiques s’ouvrent', function () {
    foreach (['/', '/login', '/register', '/forgot-password', '/conditions-generales', '/politique-de-confidentialite', '/politique-des-cookies'] as $url) {
        $this->get($url)->assertOk();
    }
});
