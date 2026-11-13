<?php

use App\Models\PilotApplication;
use App\Models\User;
use App\Support\HelpCenter;

test('les pages d’information du site s’affichent', function (string $url) {
    $this->get($url)->assertOk();
})->with(['/a-propos', '/contact', '/paiement-et-securite', '/aide', '/programme-pilote', '/mentions-legales']);

test('chaque guide du centre d’aide s’affiche, un guide inconnu renvoie 404', function () {
    foreach (array_keys(HelpCenter::ARTICLES) as $slug) {
        $this->get('/aide/'.$slug)->assertOk()->assertInertia(fn ($p) => $p->component('Site/Help/Article')->where('article.slug', $slug));
    }
    $this->get('/aide/inexistant')->assertNotFound();
});

test('une candidature au programme pilote est enregistrée avec un numéro normalisé', function () {
    $this->post(route('site.pilot.store'), [
        'name' => 'Awa Mbarga', 'business_name' => 'Chez Awa', 'phone_whatsapp' => '699 12 34 56', 'city' => 'Douala',
        'category' => 'Vêtements', 'channels' => ['WhatsApp', 'Instagram'], 'monthly_orders' => '10 à 50',
    ])->assertRedirect()->assertSessionHas('pilot_sent', true);

    $a = PilotApplication::first();
    expect($a->phone_whatsapp)->toBe('+237699123456')->and($a->channels)->toBe(['WhatsApp', 'Instagram'])->and($a->status)->toBe('new');
});

test('le formulaire pilote refuse un numéro invalide et ignore les robots', function () {
    $this->post(route('site.pilot.store'), ['name' => 'A', 'business_name' => 'B', 'phone_whatsapp' => '123', 'city' => 'Douala', 'category' => 'X'])
        ->assertSessionHasErrors('phone_whatsapp');
    $this->post(route('site.pilot.store'), ['website' => 'spam.example', 'name' => 'Bot'])->assertSessionHas('pilot_sent', true);
    expect(PilotApplication::count())->toBe(0);
});

test('seul l’admin voit et met à jour les candidatures pilotes', function () {
    $a = PilotApplication::create(['name' => 'Awa', 'business_name' => 'Chez Awa', 'phone_whatsapp' => '+237699123456', 'city' => 'Douala', 'category' => 'Mode']);
    $seller = User::factory()->create(['role' => 'seller']);
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($seller)->get(route('admin.pilot.index'))->assertRedirect(); // le middleware de rôle renvoie vers l’espace vendeur
    $this->actingAs($admin)->get(route('admin.pilot.index'))->assertOk()->assertInertia(fn ($p) => $p->component('Admin/Pilot/Index')->has('applications.data', 1));
    $this->actingAs($admin)->patch(route('admin.pilot.update', $a), ['status' => 'contacted'])->assertRedirect();
    expect($a->fresh()->status)->toBe('contacted');
});

test('les adresses des pages du site sont réservées aux boutiques', function () {
    foreach (['a-propos', 'contact', 'aide', 'programme-pilote', 'mentions-legales', 'paiement-et-securite'] as $slug) {
        expect(in_array($slug, User::RESERVED_SLUGS, true))->toBeTrue();
    }
});
