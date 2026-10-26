<?php

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Services\WhatsappGatewayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

uses(RefreshDatabase::class);

beforeEach(function () {
    config([
        'services.whatsapp_driver' => 'cloud',
        'services.whatsapp_cloud.token' => 'tok',
        'services.whatsapp_cloud.phone_number_id' => '111',
        'services.whatsapp_cloud.app_secret' => 'appsecret',
        'services.whatsapp_cloud.verify_token' => 'verif',
    ]);
});

test('une notification de paiement part en modèle approuvé, avec le bouton de suivi', function () {
    Http::fake(['graph.facebook.com/*' => Http::response(['messages' => [['id' => 'wamid.1']]])]);

    $store = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Chez Awa', 'slug' => 'awa', 'phone_whatsapp' => '677000000']);
    $order = Order::create(['uuid' => 'u', 'tracking_code' => 'BLK-CMD-X1', 'store_id' => $store->id, 'customer_name' => 'Paul',
        'customer_phone' => '699887766', 'city' => 'Douala', 'address_details' => 'Akwa', 'price_vendor' => 10000, 'saas_margin' => 300,
        'api_fee' => 0, 'total_client' => 10300, 'status' => 'paid', 'payment_status' => 'paid']);

    app(WhatsappGatewayService::class)->notifyOrderPaid($order);

    Http::assertSent(fn ($r) => str_contains($r->url(), '/111/messages')
        && $r['to'] === '237699887766'
        && $r['template']['name'] === 'biolinko_paiement_confirme'
        && $r['template']['language']['code'] === 'fr'
        && $r['template']['components'][1]['parameters'][0]['text'] === 'BLK-CMD-X1');
    Http::assertSent(fn ($r) => $r['template']['name'] === 'biolinko_vente_payee' && $r['to'] === '237677000000');
});

test('Meta peut vérifier l’URL de rappel avec le bon jeton seulement', function () {
    $this->get('/api/webhooks/whatsapp-cloud?hub.mode=subscribe&hub.verify_token=verif&hub.challenge=12345')->assertOk()->assertSee('12345');
    $this->get('/api/webhooks/whatsapp-cloud?hub.mode=subscribe&hub.verify_token=faux&hub.challenge=12345')->assertForbidden();
});

test('un webhook WhatsApp non signé est refusé', function () {
    $this->postJson('/api/webhooks/whatsapp-cloud', ['entry' => []])->assertStatus(401);

    $body = json_encode(['entry' => []]);
    $this->call('POST', '/api/webhooks/whatsapp-cloud', [], [], [], [
        'CONTENT_TYPE' => 'application/json',
        'HTTP_X_HUB_SIGNATURE_256' => 'sha256='.hash_hmac('sha256', $body, 'appsecret'),
    ], $body)->assertOk();
});

test('sans configuration, aucun appel n’est fait', function () {
    config(['services.whatsapp_cloud.token' => null]);
    Http::fake();

    $res = app(\App\Services\WhatsappCloudService::class)->sendText('237699887766', 'Bonjour');

    expect($res['success'])->toBeFalse();
    Http::assertNothingSent();
});
