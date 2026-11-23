<?php

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Services\Whatsapp\WhatsappGatewayService;
use App\Support\InvoiceTheme;
use App\Support\StoreDesign;
use App\Support\StoreTemplates;

beforeEach(function () {
    $this->mock(WhatsappGatewayService::class)->shouldIgnoreMissing();
    $this->store = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Douceurs', 'slug' => 'douceurs', 'theme_color' => '#0F766E', 'pattern' => 'patisserie-gateaux']);
});

function designWith(array $style, ?string $pattern = 'patisserie-croissants', string $intensity = 'soft'): array
{
    $design = StoreTemplates::get('classique')['design'];
    $design['style'] = array_merge($design['style'], $style);
    $design['pattern'] = ['key' => $pattern, 'intensity' => $intensity];

    return $design;
}

test('la facture d’une boutique Classique reprend sa couleur et son motif', function () {
    $theme = InvoiceTheme::for($this->store);

    expect($theme['accent'])->toBe('#0F766E')
        ->and($theme['accent_ink'])->toBe('#0F766E')
        ->and($theme['pattern'])->toStartWith('data:image/svg+xml;base64,')
        ->and(base64_decode(substr($theme['pattern'], 26)))->toContain('<svg');
});

test('avec le moteur, la facture suit le template : une couleur claire reste lisible sur papier blanc', function () {
    StoreDesign::publish($this->store, designWith(['primary' => '#E7C08A']));
    $this->store->forceFill(['design_engine' => true])->save();

    $theme = InvoiceTheme::for($this->store->fresh());

    expect($theme['accent'])->toBe('#E7C08A')
        ->and($theme['accent_ink'])->toBe('#141412')
        ->and($theme['on_accent'])->toBe('#141412');
});

test('sans motif choisi, la facture n’en affiche pas', function () {
    StoreDesign::publish($this->store, designWith([], 'patisserie-croissants', 'none'));
    $this->store->forceFill(['design_engine' => true])->save();

    expect(InvoiceTheme::for($this->store->fresh())['pattern'])->toBeNull();
});

test('sans accès aux polices, la facture garde la police par défaut et se génère', function () {
    config(['invoices.font_path' => sys_get_temp_dir().'/biolinko-fonts-'.uniqid()]);
    StoreDesign::publish($this->store, designWith(['font_display' => 'Fraunces', 'font_body' => 'DM Sans']));
    $this->store->forceFill(['design_engine' => true])->save();
    $order = Order::create(['tracking_code' => 'BLK-F1', 'store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237699887766',
        'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 5000, 'saas_margin' => 175, 'api_fee' => 0, 'total_client' => 5175,
        'status' => 'pending', 'payment_status' => 'pending']);
    $order->markAsPaid();

    $theme = InvoiceTheme::for($this->store->fresh());
    expect($theme['fonts'])->toBe([])->and($theme['display'])->toBeNull();

    $this->get(route('order.invoice', 'BLK-F1'))->assertOk()->assertHeader('Content-Type', 'application/pdf');
});
