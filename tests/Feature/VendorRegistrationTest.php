<?php

use App\Models\User;
use App\Models\Store;
use App\Models\Wallet;

test('new user registration automatically creates store and wallet and redirects to OTP verification', function () {
    $response = $this->post('/register', [
        'name' => 'Boutique Glamour',
        'email' => 'glamour@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice'));

    $user = User::where('email', 'glamour@example.com')->first();
    expect($user)->not->toBeNull();

    $store = Store::where('user_id', $user->id)->first();
    expect($store)->not->toBeNull();
    expect($store->slug)->toBe('boutique-glamour');

    $wallet = Wallet::where('store_id', $store->id)->first();
    expect($wallet)->not->toBeNull();
    expect((float) $wallet->balance_available)->toBe(0.0);
});
