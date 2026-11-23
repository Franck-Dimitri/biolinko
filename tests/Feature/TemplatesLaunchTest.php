<?php

use App\Models\Order;
use App\Models\User;
use App\Models\Wallet;
use App\Services\Whatsapp\WhatsappGatewayService;
use App\Support\StoreDesign;
use App\Support\StoreTemplates;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seller = User::factory()->create(['role' => 'seller']);
    $this->store = $this->seller->ensureStore();
});

/* ------------------------------------------------------------------ Ouverture progressive */

test('en mode pilote, seuls les vendeurs de l’offre pilote ont les templates', function () {
    config(['biolinko.templates.rollout' => 'pilot']);

    // Vendeur ordinaire : pas de création imposée, ni d'éditeur
    $this->actingAs($this->seller)->get(route('seller.dashboard'))->assertOk()->assertInertia(fn (Assert $p) => $p->where('templatesOpen', false)->where('templateInvite', null));
    $this->actingAs($this->seller)->get(route('seller.creation'))->assertRedirect(route('appearance.index'));
    $this->actingAs($this->seller)->get(route('appearance.index'))->assertOk()->assertInertia(fn (Assert $p) => $p->component('Appearance/Index'));
    $this->actingAs($this->seller)->post(route('seller.editor.publish'), ['design' => StoreTemplates::get('pat-fete')['design']])->assertForbidden();

    // Vendeur pilote
    $this->seller->forceFill(['pilot_started_at' => now()])->save();
    $this->actingAs($this->seller->fresh())->get(route('seller.dashboard'))->assertRedirect(route('seller.creation'));
});

test('les activités peuvent être ouvertes une par une', function () {
    config(['biolinko.templates.rollout' => 'all', 'biolinko.templates.activities' => 'patisserie,restauration']);

    $this->actingAs($this->seller)->get(route('seller.creation'))->assertInertia(fn (Assert $p) => $p->has('activities', 2));
    $this->actingAs($this->seller)->post(route('seller.creation.store'), [
        'business_type' => 'mode', 'template' => 'mod-wax', 'name' => 'Wax', 'slug' => 'wax-shop', 'city_location' => 'Douala', 'phone_whatsapp' => '677123456',
    ])->assertSessionHasErrors('business_type');
});

test('une boutique déjà passée sur un template garde son éditeur même si le lancement est fermé', function () {
    config(['biolinko.templates.rollout' => 'off']);
    StoreDesign::publish($this->store, StoreTemplates::get('pat-fete')['design']);
    $this->store->forceFill(['design_engine' => true])->save();

    $this->actingAs($this->seller)->get(route('appearance.index'))->assertOk()->assertInertia(fn (Assert $p) => $p->component('Seller/Editor'));
});

test('une boutique existante est invitée à essayer les templates de son activité', function () {
    $this->store->forceFill(['is_configured' => true, 'business_type' => 'beaute'])->save();

    $this->actingAs($this->seller)->get(route('seller.dashboard'))->assertInertia(fn (Assert $p) => $p
        ->where('templateInvite.count', 3)->where('templateInvite.activity', 'Beauté et cosmétiques'));
});

/* ------------------------------------------------------------------ Mesures par template */

test('les visites, ajouts au panier et commandes sont comptés par template', function () {
    $this->store->forceFill(['is_published' => true, 'is_configured' => true, 'slug' => 'mesures'])->save();
    StoreDesign::publish($this->store, StoreTemplates::get('pat-douceur')['design']);
    $this->store->forceFill(['design_engine' => true])->save();
    $browser = ['User-Agent' => 'Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile'];

    $this->withHeaders($browser)->get('/mesures')->assertOk();
    $this->withHeaders($browser)->get('/mesures')->assertOk();
    $this->withHeaders(['User-Agent' => 'WhatsApp/2.23'])->get('/mesures')->assertOk(); // aperçu de lien : pas une visite
    $this->actingAs($this->seller)->withHeaders($browser)->get('/mesures')->assertOk(); // le vendeur lui-même
    auth()->logout();
    $this->withHeaders($browser)->post(route('stats.cart', $this->store))->assertNoContent();

    $row = DB::table('template_stats')->where('template', 'pat-douceur')->first();
    expect([(int) $row->views, (int) $row->carts])->toBe([2, 1]);

    Order::create(['store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '237677123456', 'city' => 'Douala', 'address_details' => 'Akwa',
        'price_vendor' => 12000, 'saas_margin' => 420, 'api_fee' => 0, 'total_client' => 12420, 'status' => 'paid', 'payment_status' => 'paid', 'paid_at' => now(), 'design_template' => 'pat-douceur']);

    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin)->get(route('admin.templates.index'))->assertOk()->assertInertia(fn (Assert $p) => $p
        ->component('Admin/Templates/Index')
        ->where('rows.0.id', 'pat-douceur')
        ->where('rows.0.views', 2)->where('rows.0.carts', 1)->where('rows.0.orders', 1)->where('rows.0.stores', 1)
        ->where('rows.0.conversion', 50)
        ->where('rollout.mode', 'all'));
});

test('une commande retient le template affiché au moment de l’achat', function () {
    $this->mock(WhatsappGatewayService::class)->shouldIgnoreMissing();
    Http::fake(['*' => Http::response(['status' => 'ACCEPTED'], 200)]);
    $this->store->forceFill(['is_published' => true])->save();
    Wallet::firstOrCreate(['store_id' => $this->store->id]);
    $p = $this->store->products()->create(['title' => 'Savon', 'slug' => 'savon', 'price_vendor' => 3000, 'stock' => 5, 'is_active' => true]);

    $this->postJson(route('checkout.process'), ['store_id' => $this->store->id, 'customer_name' => 'Awa', 'customer_phone' => '677123456',
        'delivery_address' => 'Akwa', 'delivery_city' => 'Douala', 'operator' => 'MTN', 'items' => [['product_id' => $p->id, 'quantity' => 1]]])->assertOk();

    expect(Order::first()->design_template)->toBe('classique');
});
