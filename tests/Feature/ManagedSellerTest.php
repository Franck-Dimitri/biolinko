<?php

use App\Models\User;
use App\Support\ManagedAccount;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->payload = ['name' => 'Awa Ngono', 'email' => 'awa@example.com', 'phone_whatsapp' => '690000000', 'store_name' => 'Chez Awa',
        'store_slug' => 'chez-awa', 'business_type' => 'patisserie', 'pilot' => true];
});

function createManaged($test): User
{
    $test->actingAs($test->admin)->post(route('admin.users.managed.store'), $test->payload)->assertSessionHasNoErrors();

    return User::where('email', 'awa@example.com')->sole();
}

test('l’admin crée le compte et la boutique d’un vendeur, avec Growth offert', function () {
    $seller = createManaged($this);

    expect($seller->role)->toBe('seller')->and($seller->managed_by)->toBe($this->admin->id)->and($seller->isManaged())->toBeTrue()
        ->and($seller->email_verified_at)->not->toBeNull()->and($seller->plan)->toBe('growth')
        ->and($seller->store->slug)->toBe('chez-awa')->and($seller->store->business_type)->toBe('patisserie');
});

test('un vendeur ne peut pas créer de boutique gérée ni configurer celle d’un autre', function () {
    $seller = User::factory()->create(['role' => 'seller']);
    $this->actingAs($seller)->post(route('admin.users.managed.store'), $this->payload);
    expect(User::where('email', 'awa@example.com')->exists())->toBeFalse();
});

test('en configuration, l’admin agit dans l’espace du vendeur mais pas sur l’argent ni le mot de passe', function () {
    $seller = createManaged($this);

    $this->actingAs($this->admin)->post(route('admin.users.configure', $seller))->assertRedirect(route('seller.dashboard'));
    $this->assertAuthenticatedAs($seller);
    $this->get(route('seller.creation'))->assertOk()->assertInertia(fn ($p) => $p->where('managing.store', 'Chez Awa'));

    $this->post(route('wallet.payout.save'), ['operator' => 'mtn', 'phone' => '690000001'])->assertSessionHas('error');
    $this->put(route('password.update'), ['current_password' => 'x', 'password' => 'Nouveau-pass-2026', 'password_confirmation' => 'Nouveau-pass-2026'])->assertSessionHas('error');
    $this->delete(route('profile.destroy'), ['password' => 'x'])->assertSessionHas('error');
    expect(User::whereKey($seller->id)->exists())->toBeTrue();

    $this->post(route('managed.stop'))->assertRedirect(route('admin.users.show', $seller));
    $this->assertAuthenticatedAs($this->admin);
});

test('le vendeur prend la main avec son lien : mot de passe choisi, accès de l’équipe fermé, lien à usage unique', function () {
    $seller = createManaged($this);
    $link = ManagedAccount::accessLink($seller);
    auth()->logout();

    $this->get($link)->assertOk()->assertInertia(fn ($p) => $p->component('Auth/ClaimAccount')->where('storeName', 'Chez Awa'));
    $this->post($link, ['password' => 'Mon-pass-2026!', 'password_confirmation' => 'Mon-pass-2026!', 'terms' => true])->assertRedirect(route('seller.dashboard'));

    $seller->refresh();
    $this->assertAuthenticatedAs($seller);
    expect($seller->isManaged())->toBeFalse()->and(Hash::check('Mon-pass-2026!', $seller->password))->toBeTrue()->and($seller->terms_accepted_at)->not->toBeNull();

    auth()->logout();
    $this->get($link)->assertRedirect(route('login'));
    $this->actingAs($this->admin)->post(route('admin.users.configure', $seller))->assertSessionHas('error');
    $this->assertAuthenticatedAs($this->admin);
});

test('un nouveau lien annule l’ancien, et un lien modifié est refusé', function () {
    $seller = createManaged($this);
    $old = ManagedAccount::accessLink($seller);
    $new = ManagedAccount::accessLink($seller->fresh());
    auth()->logout();

    $this->get($old)->assertRedirect(route('login'));
    $this->get($new)->assertOk();
    $this->get(str_replace('signature=', 'signature=x', $new))->assertForbidden();
});

test('si le vendeur prend la main pendant la configuration, la session de l’équipe se ferme', function () {
    $seller = createManaged($this);
    $this->actingAs($this->admin)->post(route('admin.users.configure', $seller));
    ManagedAccount::markClaimed($seller);

    $this->get(route('seller.dashboard'))->assertRedirect(route('login'));
    $this->assertGuest();
});

test('« mot de passe oublié » vaut prise en main', function () {
    $seller = createManaged($this);
    event(new PasswordReset($seller));
    expect($seller->fresh()->isManaged())->toBeFalse();
});
