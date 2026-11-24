<?php

use App\Models\Store;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Route;

/** Pages GET sans paramètre d'un préfixe (admin/…, seller/…). */
function getRoutes(string $prefix): array
{
    return collect(Route::getRoutes())->filter(fn ($r) => in_array('GET', $r->methods()) && str_starts_with($r->uri(), $prefix.'/') && ! str_contains($r->uri(), '{'))
        ->map(fn ($r) => '/'.$r->uri())->values()->all();
}

test('un admin n’accède pas aux pages vendeur et n’y reçoit aucune boutique', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    foreach (['/seller/appearance', '/seller/dashboard', '/seller/wallet', '/seller/creation'] as $url) {
        $this->actingAs($admin)->get($url)->assertRedirect(route('admin.dashboard'));
    }
    expect(Store::where('user_id', $admin->id)->exists())->toBeFalse();
});

test('un vendeur n’accède à aucune page admin', function () {
    $seller = User::factory()->create(['role' => 'seller']);

    foreach (getRoutes('admin') as $url) {
        $res = $this->actingAs($seller)->get($url);
        expect($res->status())->not->toBe(200, "Le vendeur a pu ouvrir {$url}");
    }
});

test('toutes les pages admin s’ouvrent sans erreur', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $seller = User::factory()->create(['role' => 'seller']);
    $store = Store::create(['user_id' => $seller->id, 'name' => 'Boutique', 'slug' => 'boutique-test', 'is_published' => true]);
    Wallet::create(['store_id' => $store->id]);

    foreach (getRoutes('admin') as $url) {
        $status = $this->actingAs($admin)->get($url)->status();
        expect($status)->toBeLessThan(500, "Erreur {$status} sur {$url}");
    }
});

test('un visiteur non connecté est renvoyé vers la connexion', function () {
    foreach (['/admin/settings', '/admin/wallet', '/seller/appearance'] as $url) {
        $this->get($url)->assertRedirect(route('login'));
    }
});
