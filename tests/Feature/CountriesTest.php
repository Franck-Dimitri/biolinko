<?php

use App\Payments\Countries;
use App\Payments\PaymentManager;
use Illuminate\Support\Facades\Http;

test('les numéros de test de chaque pays sont acceptés et reconnus', function (string $country, string $phone) {
    expect(Countries::formatPhone($country, $phone))->toBe($phone);
})->with([
    ['CM', '237653456789'], ['CG', '242063456789'], ['BJ', '22951345789'], ['CI', '2250503456789'], ['SN', '221773456789'],
    ['CD', '243813456789'], ['RW', '250783456789'], ['SL', '23276123456'], ['UG', '256783456789'], ['ZM', '260763456789'], ['GH', '233593456789'],
]);

test('un numéro saisi en local est complété avec l’indicatif', function () {
    expect(Countries::formatPhone('CI', '0503456789'))->toBe('2250503456789'); // le 0 ivoirien est gardé
    expect(Countries::formatPhone('CM', '0699887766'))->toBe('237699887766'); // le 0 en trop est retiré
    expect(Countries::formatPhone('GH', '0593456789'))->toBe('233593456789');
});

test('Mercy Pay reçoit les montants en unités mineures selon la devise', function () {
    config(['payments.mercypay.key' => 'mp_sandbox_test']);
    Http::fake(['mercy-pay.com/*' => Http::response(['data' => ['uuid' => 'x', 'status' => 'pending']], 201)]);
    $g = app(PaymentManager::class)->driver('mercypay');

    $g->deposit(['reference' => 'a', 'amount' => 1035, 'currency' => 'XAF', 'country' => 'CM', 'phone' => '237653456789', 'operator' => 'MTN']);
    $g->deposit(['reference' => 'b', 'amount' => 25.5, 'currency' => 'GHS', 'country' => 'GH', 'phone' => '233593456789', 'operator' => 'MTN']);

    Http::assertSent(fn ($r) => $r['currency'] === 'XAF' && $r['amount'] === 1035);
    Http::assertSent(fn ($r) => $r['currency'] === 'GHS' && $r['amount'] === 2550 && $r['country'] === 'GHA' && $r['provider'] === 'MTN_MOMO_GHA');
});

test('chaque pays a un minimum de commande dans sa devise', function () {
    expect(Countries::minOrder('CM'))->toBe(1000);
    expect(Countries::minOrder('UG'))->toBeGreaterThan(1000);
    expect(Countries::minOrder('GH'))->toBeLessThan(100);
});
