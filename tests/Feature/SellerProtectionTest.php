<?php

use App\Models\SellerVerification;
use App\Models\Store;
use App\Models\StoreReport;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
    $this->seller = User::factory()->create(['password' => bcrypt('secret-pass')]);
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Boutique Awa', 'slug' => 'boutique-awa', 'is_published' => true]);
    $this->wallet = Wallet::create(['store_id' => $this->store->id, 'balance_available' => 20000, 'balance_pending' => 0]);
    $this->admin = User::factory()->create(['role' => 'admin']);
});

function kycPayload(array $overrides = []): array
{
    return array_merge([
        'full_name' => 'Awa Ngono',
        'id_type' => 'cni',
        'id_front' => UploadedFile::fake()->image('front.jpg'),
        'id_back' => UploadedFile::fake()->image('back.jpg'),
        'selfie' => UploadedFile::fake()->image('selfie.jpg'),
    ], $overrides);
}

test('sans identité vérifiée, aucun retrait n’est possible', function () {
    $this->seller->forceFill(['payout_phone' => '237677123456', 'payout_operator' => 'MTN', 'payout_name' => 'Awa'])->save();

    $this->actingAs($this->seller)->post(route('wallet.withdraw'), ['amount' => 5000])->assertSessionHasErrors('amount');
    expect(Withdrawal::count())->toBe(0);
});

test('le vendeur envoie ses documents, qui restent privés, puis l’admin les valide', function () {
    $this->actingAs($this->seller)->post(route('seller.verification.store'), kycPayload())->assertSessionHasNoErrors();

    $v = SellerVerification::first();
    expect($v->status)->toBe('pending');
    Storage::disk('local')->assertExists($v->id_front_path);
    Storage::disk('local')->assertExists($v->selfie_path);
    expect($v->toArray())->not->toHaveKey('id_front_path');

    // Le vendeur (non admin) ne peut pas lire les fichiers
    $this->actingAs($this->seller)->get(route('admin.verifications.file', [$v->id, 'front']))->assertRedirect();
    $this->actingAs($this->admin)->get(route('admin.verifications.file', [$v->id, 'front']))->assertOk();

    $this->actingAs($this->admin)->post(route('admin.verifications.approve', $v->id))->assertSessionHasNoErrors();
    expect($this->seller->fresh()->isVerified())->toBeTrue();
});

test('le verso est exigé pour une carte d’identité, pas pour un passeport', function () {
    $this->actingAs($this->seller)->post(route('seller.verification.store'), kycPayload(['id_back' => null]))->assertSessionHasErrors('id_back');
    $this->actingAs($this->seller)->post(route('seller.verification.store'), kycPayload(['id_type' => 'passport', 'id_back' => null]))->assertSessionHasNoErrors();
});

test('un refus supprime les documents et le vendeur peut en renvoyer', function () {
    $this->actingAs($this->seller)->post(route('seller.verification.store'), kycPayload());
    $v = SellerVerification::first();
    $front = $v->id_front_path;

    $this->actingAs($this->admin)->post(route('admin.verifications.reject', $v->id), ['reason' => 'Photo floue.'])->assertSessionHasNoErrors();
    expect($v->fresh()->status)->toBe('rejected');
    Storage::disk('local')->assertMissing($front);

    $this->actingAs($this->seller)->post(route('seller.verification.store'), kycPayload())->assertSessionHasNoErrors();
    expect($v->fresh()->status)->toBe('pending');
});

test('les retraits partent uniquement vers le numéro enregistré, jamais vers un numéro saisi', function () {
    readyToWithdraw($this->seller, '237677123456');

    $this->actingAs($this->seller)->post(route('wallet.withdraw'), ['amount' => 5000, 'phone' => '699999999', 'payment_operator' => 'ORANGE'])->assertSessionHasNoErrors();

    $w = Withdrawal::first();
    expect($w->phone_number)->toBe('237677123456');
    expect($w->operator)->toBe('MTN');
});

test('le premier numéro de retrait est immédiat, un changement attend 48 h et exige le mot de passe', function () {
    $this->actingAs($this->seller)->post(route('wallet.payout.save'), ['operator' => 'MTN', 'phone' => '677123456', 'name' => 'Awa Ngono', 'password' => 'mauvais'])
        ->assertSessionHasErrors('password');

    $this->actingAs($this->seller)->post(route('wallet.payout.save'), ['operator' => 'MTN', 'phone' => '677123456', 'name' => 'Awa Ngono', 'password' => 'secret-pass'])
        ->assertSessionHasNoErrors();
    expect($this->seller->fresh()->payout_phone)->toBe('237677123456');

    $this->actingAs($this->seller)->post(route('wallet.payout.save'), ['operator' => 'ORANGE', 'phone' => '699111222', 'name' => 'Awa Ngono', 'password' => 'secret-pass'])
        ->assertSessionHasNoErrors();
    $user = $this->seller->fresh();
    expect($user->payout_phone)->toBe('237677123456');
    expect($user->payout_pending_phone)->toBe('237699111222');

    $this->travel(User::PAYOUT_CHANGE_DELAY_HOURS + 1)->hours();
    $user->applyPendingPayout();
    expect($user->fresh()->payout_phone)->toBe('237699111222');
    expect($user->fresh()->payout_pending_phone)->toBeNull();
});

test('un changement de numéro en attente peut être annulé', function () {
    readyToWithdraw($this->seller, '237677123456');
    $this->seller->forceFill(['payout_pending_phone' => '237699111222', 'payout_pending_operator' => 'ORANGE', 'payout_pending_effective_at' => now()->addDay()])->save();

    $this->actingAs($this->seller)->delete(route('wallet.payout.cancel'))->assertSessionHasNoErrors();
    expect($this->seller->fresh()->payout_pending_phone)->toBeNull();
    expect($this->seller->fresh()->payout_phone)->toBe('237677123456');
});

test('un visiteur peut signaler une boutique ; les robots sont ignorés', function () {
    $this->post(route('storefront.report', 'boutique-awa'), ['reason' => 'scam', 'message' => 'J’ai payé et rien reçu depuis 2 semaines.'])
        ->assertSessionHasNoErrors();
    expect(StoreReport::count())->toBe(1);
    expect(StoreReport::first()->ip_hash)->not->toBeNull();

    $this->post(route('storefront.report', 'boutique-awa'), ['reason' => 'scam', 'message' => 'Message de robot automatique.', 'website' => 'spam.example']);
    expect(StoreReport::count())->toBe(1);

    $this->actingAs($this->admin)->post(route('admin.storeReports.close', StoreReport::first()->id));
    expect(StoreReport::first()->status)->toBe('closed');
});

test('la boutique affiche ses repères de confiance', function () {
    readyToWithdraw($this->seller);

    $this->get('/boutique-awa')->assertInertia(fn ($page) => $page->where('store.trust.verified', true)->where('store.trust.delivered', 0));
});
