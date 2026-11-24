<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\StoreSlugRedirect;
use App\Models\User;
use App\Support\StoreSlug;
use Illuminate\Support\Facades\DB;

function registerData(array $over = []): array
{
    return array_merge(['name' => 'Awa Test', 'email' => 'awa@example.com', 'phone_whatsapp' => '690000000', 'store_name' => 'Chez Awa', 'store_slug' => 'chez-awa',
        'password' => 'Password123!', 'password_confirmation' => 'Password123!', 'terms' => true], $over);
}

test('après suppression du compte, l’e-mail et l’adresse de boutique sont libres, même sans clés étrangères', function () {
    DB::statement('PRAGMA foreign_keys = OFF'); // comme une base où les contraintes ne jouent pas

    $this->post('/register', registerData())->assertRedirect(route('verification.notice'));
    $user = User::where('email', 'awa@example.com')->sole();
    $store = $user->store;
    StoreSlugRedirect::create(['old_slug' => 'ancienne-awa', 'store_id' => $store->id]);
    Product::create(['store_id' => $store->id, 'title' => 'Robe', 'slug' => 'robe', 'price_vendor' => 5000, 'is_active' => true]);

    $this->actingAs($user)->delete('/profile', ['password' => 'Password123!'])->assertRedirect('/');
    $this->assertGuest();

    expect(User::count())->toBe(0)->and(Store::count())->toBe(0)->and(Product::count())->toBe(0)->and(StoreSlugRedirect::count())->toBe(0);

    $this->post('/register', registerData(['store_slug' => 'ancienne-awa']))->assertSessionHasNoErrors();
    $this->post('/logout');
    $this->post('/register', registerData(['email' => 'autre@example.com', 'store_slug' => 'chez-awa']))->assertSessionHasNoErrors();
});

test('le compte n’est pas supprimé tant que le portefeuille contient de l’argent', function () {
    $this->post('/register', registerData());
    $user = User::sole();
    $user->store->wallet()->update(['balance_held' => 12000]);

    $this->actingAs($user)->delete('/profile', ['password' => 'Password123!'])->assertSessionHasErrors('password');
    expect(User::count())->toBe(1);
    $this->assertAuthenticatedAs($user);
});

test('mauvais mot de passe : rien n’est supprimé', function () {
    $this->post('/register', registerData());
    $this->actingAs(User::sole())->delete('/profile', ['password' => 'faux'])->assertSessionHasErrors('password');
    expect(User::count())->toBe(1)->and(Store::count())->toBe(1);
});

test('les boutiques orphelines sont purgées et libèrent leur adresse', function () {
    $owner = User::factory()->create(['role' => 'seller']);
    $store = Store::create(['user_id' => $owner->id, 'name' => 'Orpheline', 'slug' => 'orpheline']);
    DB::statement('PRAGMA foreign_keys = OFF');
    DB::table('users')->where('id', $owner->id)->delete();

    (require database_path('migrations/2026_11_25_110000_purge_orphan_stores.php'))->up();
    expect(Store::whereKey($store->id)->exists())->toBeFalse()->and(StoreSlug::available('orpheline'))->toBeTrue();
});
