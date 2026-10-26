<?php

use App\Mail\VendorOtpVerificationMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('un vendeur non vérifié est renvoyé vers la saisie du code', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)->get('/seller/products')->assertRedirect(route('verification.notice'));
});

test('l’inscription envoie un seul code OTP', function () {
    Mail::fake();

    $this->post('/register', [
        'name' => 'Awa',
        'email' => 'awa@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('verification.notice'));

    Mail::assertSent(VendorOtpVerificationMail::class, 1);
    expect(User::where('email', 'awa@example.com')->first()->email_otp)->toHaveLength(6);
});

test('le bon code vérifie le compte', function () {
    $user = User::factory()->unverified()->create();
    $otp = $user->generateEmailOtp();

    $this->actingAs($user)->post(route('verification.verify_otp'), ['otp' => $otp])->assertRedirect(route('dashboard'));
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});

test('la saisie du code est limitée', function () {
    $user = User::factory()->unverified()->create();
    $user->generateEmailOtp();

    foreach (range(1, 6) as $i) {
        $this->actingAs($user)->post(route('verification.verify_otp'), ['otp' => '000000']);
    }
    $this->actingAs($user)->post(route('verification.verify_otp'), ['otp' => '000000'])->assertSessionHasErrors('otp');
});

test('un compte banni ne peut pas se connecter', function () {
    $user = User::factory()->create(['is_banned' => true]);

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('un compte banni pendant sa session est déconnecté', function () {
    $user = User::factory()->create(['is_banned' => true]);

    $this->actingAs($user)->get('/seller/products')->assertRedirect(route('login'));
    $this->assertGuest();
});

test('mot de passe oublié ne révèle pas si l’adresse existe', function () {
    $this->post('/forgot-password', ['email' => 'inconnu@example.com'])->assertSessionHasNoErrors()->assertSessionHas('status');
});
