<?php

use App\Models\User;

test('un vendeur qui vient de s’inscrire peut ouvrir toutes ses pages', function () {
    $user = User::factory()->create(['role' => 'seller']);
    $failures = [];
    foreach (['/dashboard', '/seller/dashboard', '/seller/appearance', '/seller/products', '/seller/orders', '/seller/wallet', '/seller/invoices',
        '/seller/smartlinks', '/seller/customers', '/seller/marketing', '/seller/tools', '/seller/subscriptions', '/profile'] as $url) {
        $res = $this->actingAs($user)->get($url);
        if (! in_array($res->status(), [200, 302], true)) {
            $failures[] = $url.' => '.$res->status();
        }
    }
    expect($failures)->toBe([]);
});
