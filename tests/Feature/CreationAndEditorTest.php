<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\StoreDesignVersion;
use App\Models\User;
use App\Support\StoreTemplates;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seller = User::factory()->create(['role' => 'seller', 'phone_whatsapp' => '+237677123456']);
    $this->store = $this->seller->ensureStore();
    // Valeurs génériques d'une boutique créée à l'inscription
    $this->store->forceFill(['opening_hours' => 'Lun - Sam: 08h00 - 18h00', 'announcement_header' => '⚡ Bienvenue sur la boutique officielle !'])->save();
});

function creation(array $data = [])
{
    return test()->actingAs(test()->seller)->post(route('seller.creation.store'), $data + [
        'business_type' => 'patisserie', 'template' => 'pat-douceur', 'name' => 'Les Douceurs d’Awa',
        'slug' => 'douceurs-awa', 'city_location' => 'Douala', 'phone_whatsapp' => '677 12 34 56',
    ]);
}

/* ------------------------------------------------------------------ Partie 6 : création */

test('un nouveau vendeur commence par créer sa boutique', function () {
    $this->actingAs($this->seller)->get(route('seller.dashboard'))->assertRedirect(route('seller.creation'));

    $this->actingAs($this->seller)->get(route('seller.creation'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Seller/Creation')
        ->has('activities', 14)
        ->has('activities.0.templates', 3));
});

test('le template choisi dans la galerie est présélectionné après l’inscription', function () {
    $this->get(route('register', ['template' => 'res-maquis']))->assertInertia(fn (Assert $page) => $page->where('intendedTemplate.name', 'Maquis'));

    $this->actingAs($this->seller)->get(route('seller.creation'))->assertInertia(fn (Assert $page) => $page
        ->where('initialTemplate', 'res-maquis')->where('initialActivity', 'restauration'));
});

test('la boutique est en ligne tout de suite, avec son template et 3 produits d’exemple en brouillon', function () {
    creation()->assertRedirect(route('seller.creation', ['fini' => 1]));

    $store = $this->store->fresh();
    expect($store->only(['business_type', 'slug', 'name', 'city_location', 'phone_whatsapp', 'is_published', 'design_engine', 'is_configured']))->toBe([
        'business_type' => 'patisserie', 'slug' => 'douceurs-awa', 'name' => 'Les Douceurs d’Awa', 'city_location' => 'Douala',
        'phone_whatsapp' => '+237677123456', 'is_published' => true, 'design_engine' => true, 'is_configured' => true,
    ])->and($store->design['template'])->toBe('pat-douceur')
        ->and($store->theme_color)->toBe(StoreTemplates::get('pat-douceur')['design']['style']['primary']);

    // Pas de textes génériques ni d'horaires inventés : ceux de l'activité, sinon rien
    expect($store->hero_title)->toBe('Des gâteaux faits pour vos plus beaux moments')
        ->and($store->opening_hours)->toBeNull()
        ->and($store->announcement_header)->toBeNull();

    $examples = Product::where('store_id', $store->id)->get();
    expect($examples)->toHaveCount(3)
        ->and($examples->every(fn ($p) => ! $p->is_active && $p->example_of === 'patisserie' && $p->stock === 0))->toBeTrue();

    // Les exemples restent invisibles pour les clients ; le vendeur arrive maintenant sur son tableau de bord
    $this->get('/douceurs-awa')->assertOk()->assertInertia(fn (Assert $page) => $page->has('products', 0));
    $this->actingAs($this->seller)->get(route('seller.dashboard'))->assertOk();
});

test('une création incohérente est refusée', function (array $data, string $field) {
    Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Prise', 'slug' => 'deja-prise']);
    creation($data)->assertSessionHasErrors($field);
})->with([
    'template d’une autre activité' => [['template' => 'res-maquis'], 'template'],
    'adresse prise' => [['slug' => 'deja-prise'], 'slug'],
    'adresse réservée' => [['slug' => 'templates'], 'slug'],
    'WhatsApp invalide' => [['phone_whatsapp' => '12'], 'phone_whatsapp'],
    'ville manquante' => [['city_location' => ''], 'city_location'],
]);

test('un vendeur qui a déjà des produits n’est pas renvoyé vers la création', function () {
    $this->store->products()->create(['title' => 'Robe', 'slug' => 'robe', 'price_vendor' => 5000, 'stock' => 2]);
    $this->actingAs($this->seller)->get(route('seller.dashboard'))->assertOk();
});

/* ------------------------------------------------------------------ Partie 7 : éditeur */

test('l’éditeur part de « Classique » aux couleurs d’une boutique existante', function () {
    $this->store->update(['theme_color' => '#0F766E', 'pattern' => 'autre-points', 'business_type' => 'autre']);

    // « Ma boutique » : l'éditeur, avec les infos et les avis sur la même page
    $this->actingAs($this->seller)->get(route('seller.editor'))->assertRedirect('/seller/appearance');
    $this->actingAs($this->seller)->get(route('appearance.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Seller/Editor')
        ->where('info.theme_color', '#0F766E')
        ->has('reviews')
        ->has('activities.patisserie')
        ->where('draft.template', 'classique')
        ->where('draft.style.primary', '#0F766E')
        ->where('draft.pattern.key', 'autre-points')
        ->where('published', null)
        ->has('templates', 4) // les 3 de l'activité + Classique
        ->has('catalog.hero.settings.title'));
});

test('le brouillon s’enregistre sans toucher à la boutique en ligne, et refuse une vitrine invalide', function () {
    $design = StoreTemplates::get('pat-fete')['design'];
    $this->actingAs($this->seller)->putJson(route('seller.editor.draft'), ['design' => $design])->assertOk();
    expect($this->store->fresh()->design_draft['template'])->toBe('pat-fete')
        ->and($this->store->fresh()->design_engine)->toBeFalse();

    $design['sections'] = array_values(array_filter($design['sections'], fn ($s) => $s['type'] !== 'products'));
    $this->actingAs($this->seller)->putJson(route('seller.editor.draft'), ['design' => $design])->assertStatus(422);
});

test('publier met la vitrine en ligne et garde la précédente dans l’historique', function () {
    $a = StoreTemplates::get('pat-fete')['design'];
    $b = StoreTemplates::get('pat-atelier')['design'];

    $this->actingAs($this->seller)->post(route('seller.editor.publish'), ['design' => $a])->assertSessionHasNoErrors();
    expect($this->store->fresh()->design_engine)->toBeTrue()->and(StoreDesignVersion::count())->toBe(0);

    $this->actingAs($this->seller)->post(route('seller.editor.publish'), ['design' => $b]);
    $store = $this->store->fresh();
    expect($store->design['template'])->toBe('pat-atelier')
        ->and($store->theme_color)->toBe($b['style']['primary'])
        ->and(StoreDesignVersion::where('store_id', $store->id)->count())->toBe(1);

    // Retour à la version précédente
    $version = StoreDesignVersion::first();
    $this->actingAs($this->seller)->post(route('seller.editor.restore', $version))->assertRedirect();
    expect($this->store->fresh()->design['template'])->toBe('pat-fete')
        ->and(StoreDesignVersion::first()->design['template'])->toBe('pat-atelier');
});

test('l’historique garde les 10 dernières versions', function () {
    $design = StoreTemplates::get('pat-fete')['design'];
    foreach (range(1, 13) as $i) {
        $this->actingAs($this->seller)->post(route('seller.editor.publish'), ['design' => $design]);
    }
    expect(StoreDesignVersion::count())->toBe(StoreDesignVersion::KEEP);
});

test('un vendeur ne peut pas restaurer la version d’une autre boutique', function () {
    $other = Store::create(['user_id' => User::factory()->create()->id, 'name' => 'Autre', 'slug' => 'autre-boutique']);
    $version = StoreDesignVersion::create(['store_id' => $other->id, 'design' => StoreTemplates::get('pat-fete')['design']]);

    $this->actingAs($this->seller)->post(route('seller.editor.restore', $version))->assertNotFound();
});

test('la photo d’une section est optimisée et utilisable dans la vitrine', function () {
    Storage::fake('public');
    $path = $this->actingAs($this->seller)->post(route('seller.editor.image'), ['image' => UploadedFile::fake()->image('accueil.jpg', 2000, 1200)])
        ->assertOk()->json('path');

    expect($path)->toStartWith('/storage/designs/opt/');
    $design = StoreTemplates::get('pat-douceur')['design'];
    $design['sections'][array_search('hero', array_column($design['sections'], 'type'))]['settings'] = ['image' => $path];
    $this->actingAs($this->seller)->putJson(route('seller.editor.draft'), ['design' => $design])->assertOk();
});

test('l’étape « Activité » de Ma boutique change les templates proposés', function () {
    $this->actingAs($this->seller)->post(route('seller.editor.activity'), ['business_type' => 'restauration'])->assertRedirect();
    expect($this->store->fresh()->business_type)->toBe('restauration')
        ->and($this->store->fresh()->category)->toBe('Restauration et plats cuisinés');

    $this->actingAs($this->seller)->get(route('appearance.index'))->assertInertia(fn (Assert $page) => $page
        ->where('templates.1.id', 'res-maquis')->where('info.business_type', 'restauration'));
    $this->actingAs($this->seller)->post(route('seller.editor.activity'), ['business_type' => 'inconnue'])->assertSessionHasErrors('business_type');
});
