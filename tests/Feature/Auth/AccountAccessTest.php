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
        'password_confirmation' => 'password', 'phone_whatsapp' => '677445566',
        'terms' => '1',
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

test('l’inscription exige l’acceptation des CGU et la date est enregistrée', function () {
    $this->post('/register', ['name' => 'X', 'email' => 'x@example.com', 'password' => 'password', 'password_confirmation' => 'password', 'phone_whatsapp' => '677445566'])
        ->assertSessionHasErrors('terms');

    $this->post('/register', ['name' => 'X', 'email' => 'x@example.com', 'password' => 'password', 'password_confirmation' => 'password', 'terms' => '1', 'phone_whatsapp' => '677445566']);
    $user = \App\Models\User::where('email', 'x@example.com')->first();
    expect($user->terms_accepted_at)->not->toBeNull();
    expect($user->store)->not->toBeNull(); // boutique créée à l'inscription
});

test('l’inscription exige un numéro WhatsApp valide et l’enregistre au format international', function () {
    $base = ['name' => 'X', 'email' => 'wa@example.com', 'password' => 'password', 'password_confirmation' => 'password', 'terms' => '1'];
    $this->post('/register', $base)->assertSessionHasErrors('phone_whatsapp');
    $this->post('/register', $base + ['phone_whatsapp' => '12345'])->assertSessionHasErrors('phone_whatsapp');
    $this->post('/register', $base + ['phone_whatsapp' => '6 77 44 55 66']);
    expect(\App\Models\User::where('email', 'wa@example.com')->value('phone_whatsapp'))->toBe('+237677445566');
});
