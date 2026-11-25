<?php

use App\Models\Store;
use App\Models\User;
use App\Support\InvoiceLogo;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->store = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Chez Awa', 'slug' => 'chez-awa']);
});

/** Image enregistrée sur le disque public, au format demandé. */
function storeImage(string $path, int $w, int $h, string $format): string
{
    $img = imagecreatetruecolor($w, $h);
    imagefill($img, 0, 0, imagecolorallocate($img, 200, 30, 60));
    ob_start();
    $format === 'webp' ? imagewebp($img) : imagepng($img);
    Storage::disk('public')->put($path, ob_get_clean());

    return '/storage/'.$path;
}

test('un logo WebP (logos optimisés) est converti en PNG pour la facture', function () {
    $this->store->logo_url = storeImage('logos/opt/logo.webp', 300, 300, 'webp');
    $logo = InvoiceLogo::for($this->store);

    expect($logo['src'])->toStartWith('data:image/png;base64,')
        ->and([$logo['width'], $logo['height']])->toBe([54, 54]);
});

test('un logo en largeur garde ses proportions au lieu d’être écrasé dans un carré', function () {
    $this->store->logo_url = storeImage('logos/large.png', 600, 200, 'png');
    $logo = InvoiceLogo::for($this->store);

    expect([$logo['width'], $logo['height']])->toBe([150, 50]);
});

test('sans fichier exploitable, la facture affiche l’initiale de la boutique', function () {
    foreach ([null, '/storage/logos/absent.png', 'https://exemple.com/logo.png', '/storage/../.env'] as $url) {
        $this->store->logo_url = $url;
        expect(InvoiceLogo::for($this->store))->toBeNull();
    }
});
