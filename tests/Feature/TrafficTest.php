<?php

use App\Models\PageVisit;
use App\Models\Store;
use App\Models\User;

beforeEach(function () {
    config(['biolinko.store_domain' => 'biolinko.store', 'app.url' => 'https://biolinko.app']);
    $this->seller = User::factory()->create(['role' => 'seller']);
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Chez Awa', 'slug' => 'chez-awa', 'is_published' => true]);
});

const PHONE = 'Mozilla/5.0 (Linux; Android 13; SM-A145F) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36';

test('une visite de boutique est comptée avec pays, appareil et source, sans IP', function () {
    $this->withHeaders(['User-Agent' => PHONE, 'CF-IPCountry' => 'CM', 'Referer' => 'https://l.facebook.com/'])
        ->get('https://chez-awa.biolinko.store/')->assertOk();

    $v = PageVisit::sole();
    expect($v->store_id)->toBe($this->store->id)
        ->and($v->page)->toBe('home')
        ->and($v->country)->toBe('CM')
        ->and($v->device)->toBe('mobile')
        ->and($v->source)->toBe('facebook')
        ->and(strlen($v->visitor))->toBe(16);
});

test('la source utm et WhatsApp sont reconnues', function () {
    $this->withHeaders(['User-Agent' => PHONE])->get('https://chez-awa.biolinko.store/?utm_source=whatsapp')->assertOk();
    expect(PageVisit::sole()->source)->toBe('whatsapp');
});

test('le vendeur, les admins, les robots et les aperçus ne sont pas comptés', function () {
    $this->actingAs($this->seller)->withHeaders(['User-Agent' => PHONE])->get('https://chez-awa.biolinko.store/')->assertOk();
    $this->actingAs(User::factory()->create(['role' => 'admin']))->withHeaders(['User-Agent' => PHONE])->get('https://chez-awa.biolinko.store/')->assertOk();
    auth()->logout();
    $this->withHeaders(['User-Agent' => 'Googlebot/2.1 (+http://www.google.com/bot.html)'])->get('https://chez-awa.biolinko.store/')->assertOk();
    $this->withHeaders(['User-Agent' => PHONE])->get('https://chez-awa.biolinko.store/?apercu=1')->assertOk();

    expect(PageVisit::count())->toBe(0);
});

test('l’admin voit le trafic de la plateforme, le vendeur celui de sa boutique', function () {
    foreach (['CM', 'CM', 'GA'] as $i => $c) {
        PageVisit::create(['store_id' => $this->store->id, 'day' => now()->toDateString(), 'page' => 'home', 'path' => '/', 'country' => $c, 'device' => 'mobile', 'source' => 'whatsapp', 'visitor' => str_pad((string) $i, 16, 'x')]);
    }

    $this->actingAs(User::factory()->create(['role' => 'admin']))->get('/admin/trafic?jours=7')->assertOk()
        ->assertInertia(fn ($p) => $p->component('Admin/Traffic/Index')->where('stats.visitors', 3)->where('stats.countries.0.key', 'CM')->where('stats.stores.0.slug', 'chez-awa'));

    $this->actingAs($this->seller)->get('/admin/trafic')->assertRedirect();
});
