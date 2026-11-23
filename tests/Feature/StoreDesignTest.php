<?php

use App\Models\Store;
use App\Models\User;
use App\Support\StoreDesign;
use App\Support\StoreTemplates;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;

function classique(): array
{
    return StoreTemplates::get('classique')['design'];
}

function designStore(array $attrs = []): Store
{
    return Store::create($attrs + [
        'user_id' => User::factory()->create()->id,
        'name' => 'Douceurs de Mia',
        'slug' => 'douceurs-de-mia',
        'theme_color' => '#C93A6B',
        'is_published' => true,
    ]);
}

test('le template Classique est une vitrine valide', function () {
    $design = StoreDesign::validate(classique());

    expect($design['template'])->toBe('classique')
        ->and($design['version'])->toBe(StoreDesign::VERSION)
        ->and(collect($design['sections'])->pluck('type')->all())->toContain('hero', 'products', 'footer');
});

test('chaque template n’utilise que des sections et des variantes du catalogue', function () {
    foreach (StoreTemplates::all() as $id => $template) {
        expect(fn () => StoreDesign::validate($template['design']))->not->toThrow(ValidationException::class, "Template {$id}");
        expect($template['design']['template'])->toBe($id);
    }
});

test('une vitrine invalide est refusée', function (callable $break, string $field) {
    $design = classique();
    $break($design);

    try {
        StoreDesign::validate($design);
        $this->fail('La vitrine aurait dû être refusée.');
    } catch (ValidationException $e) {
        expect(array_keys($e->errors()))->toContain($field);
    }
})->with([
    'variante inconnue' => [function (&$d) {
        $d['sections'][2]['variant'] = 'carrousel-3d';
    }, 'sections.2.variant'],
    'type inconnu' => [function (&$d) {
        $d['sections'][2]['type'] = 'video';
    }, 'sections.2.type'],
    'deux accueils' => [function (&$d) {
        $d['sections'][] = ['id' => 'hero-2', 'type' => 'hero', 'variant' => 'classic', 'enabled' => true];
    }, 'sections'],
    'identifiants en double' => [function (&$d) {
        $d['sections'][4]['id'] = 'hero';
    }, 'sections.4.id'],
    'sans catalogue' => [function (&$d) {
        $d['sections'] = array_values(array_filter($d['sections'], fn ($s) => $s['type'] !== 'products'));
    }, 'sections'],
    'catalogue masqué' => [function (&$d) {
        foreach ($d['sections'] as &$s) {
            if ($s['type'] === 'products') {
                $s['enabled'] = false;
            }
        }
    }, 'sections'],
    'couleur invalide' => [function (&$d) {
        $d['style']['primary'] = 'red; background:url(x)';
    }, 'style.primary'],
    'police non proposée' => [function (&$d) {
        $d['style']['font_body'] = "x'} body{display:none}";
    }, 'style.font_body'],
    'motif inconnu' => [function (&$d) {
        $d['pattern']['key'] = 'licorne';
    }, 'pattern.key'],
    'réglages trop longs' => [function (&$d) {
        $d['sections'][2]['settings'] = ['title' => str_repeat('a', 1001)];
    }, 'sections.2.settings'],
    'clé de réglage invalide' => [function (&$d) {
        $d['sections'][2]['settings'] = ['<script>' => 'x'];
    }, 'sections.2.settings'],
]);

test('la validation ne garde que les champs connus', function () {
    $design = classique();
    $design['style']['primary'] = '#c93a6b';
    $design['style']['injection'] = 'x';
    $design['sections'][2]['settings'] = ['title' => 'Le gâteau dont on parlera demain'];
    $design['extra'] = true;

    $clean = StoreDesign::validate($design);

    expect($clean)->not->toHaveKey('extra')
        ->and($clean['style'])->not->toHaveKey('injection')
        ->and($clean['style']['primary'])->toBe('#C93A6B')
        ->and((array) $clean['sections'][2]['settings'])->toBe(['title' => 'Le gâteau dont on parlera demain']);
});

test('sans moteur, la boutique reste sur Classique calculé depuis ses réglages', function () {
    $store = designStore();
    StoreDesign::publish($store, classique());

    // Une vitrine enregistrée ne s’affiche pas tant que le moteur est coupé
    expect(StoreDesign::forStore($store->refresh()))->toBeNull();

    $this->get('/douceurs-de-mia')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Storefront/Boutique')
        ->where('store.storefront_design', null)
        ->missing('store.design')
        ->missing('store.design_draft')
        ->missing('store.design_engine'));
});

test('avec le moteur, la vitrine publiée est envoyée à la boutique et à la fiche produit', function () {
    $store = designStore();
    $design = classique();
    $design['sections'][2]['settings'] = ['title' => 'Bienvenue'];
    StoreDesign::publish($store, $design);
    $store->forceFill(['design_engine' => true])->save();
    $product = $store->products()->create(['title' => 'Gâteau', 'slug' => 'gateau', 'price_vendor' => 15000, 'is_active' => true]);

    $this->get('/douceurs-de-mia')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('store.storefront_design.template', 'classique')
        ->where('store.storefront_design.sections.2.settings.title', 'Bienvenue')
        ->missing('store.design_draft'));

    $this->get('/douceurs-de-mia/p/'.$product->slug)->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Storefront/[slug]')
        ->where('store.storefront_design.template', 'classique'));
});

test('la commande store:design applique un template et active le moteur', function () {
    $store = designStore();

    $this->artisan('store:design', ['slug' => 'douceurs-de-mia', '--template' => 'classique', '--enable' => true])
        ->expectsOutputToContain('Moteur actif')
        ->assertSuccessful();

    $store->refresh();
    expect($store->design_engine)->toBeTrue()
        ->and($store->design['template'])->toBe('classique')
        ->and($store->design_draft)->toBe($store->design);

    $this->artisan('store:design', ['slug' => 'douceurs-de-mia', '--disable' => true])->expectsOutputToContain('Moteur inactif')->assertSuccessful();
    expect($store->refresh()->design_engine)->toBeFalse();
});

test('la commande store:design refuse un template inconnu ou une vitrine invalide', function () {
    designStore();
    $this->artisan('store:design', ['slug' => 'douceurs-de-mia', '--template' => 'inconnu'])->assertFailed();

    $bad = classique();
    $bad['sections'][3]['variant'] = 'nope';
    $file = tempnam(sys_get_temp_dir(), 'design');
    file_put_contents($file, json_encode($bad));
    $this->artisan('store:design', ['slug' => 'douceurs-de-mia', '--from' => $file])->expectsOutputToContain('Vitrine refusée')->assertFailed();
    unlink($file);

    expect(Store::where('slug', 'douceurs-de-mia')->value('design'))->toBeNull();
});

test('seul un admin peut activer le moteur de vitrine d’une boutique', function () {
    $store = designStore();
    $seller = $store->user;

    $this->actingAs($seller)->post(route('admin.stores.designEngine', $store))->assertRedirect();
    expect($store->refresh()->design_engine)->toBeFalse();

    $admin = User::factory()->create(['role' => 'admin']);
    $this->actingAs($admin)->post(route('admin.stores.designEngine', $store))->assertRedirect();
    expect($store->refresh()->design_engine)->toBeTrue();

    $this->actingAs($admin)->get(route('admin.stores.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('stores.data.0.design_engine', true)
        ->missing('stores.data.0.design_draft'));
});

test('chaque disposition du catalogue peut être utilisée dans une vitrine', function () {
    foreach (StoreDesign::SECTIONS as $type => $def) {
        foreach (array_keys($def['variants']) as $variant) {
            $design = classique();
            $design['sections'][] = ['id' => "test-{$type}", 'type' => $type, 'variant' => $variant, 'enabled' => true, 'settings' => []];
            if (in_array($type, StoreDesign::SINGLE, true)) {
                $design['sections'] = array_values(array_filter($design['sections'], fn ($s) => $s['type'] !== $type || $s['id'] === "test-{$type}"));
            }
            expect(fn () => StoreDesign::validate($design))->not->toThrow(ValidationException::class, "{$type}:{$variant}");
        }
    }
});

test('les réglages déclarés par les sections sont acceptés', function () {
    $design = classique();
    $design['sections'][] = ['id' => 'faq', 'type' => 'faq', 'variant' => 'simple', 'enabled' => true, 'settings' => [
        'title' => 'Vos questions',
        'items' => [['question' => 'Livrez-vous le dimanche ?', 'answer' => 'Oui, sur commande la veille.']],
    ]];
    $design['sections'][] = ['id' => 'steps', 'type' => 'steps', 'variant' => 'cards', 'enabled' => true, 'settings' => [
        'items' => [['title' => 'Choisissez', 'text' => 'Le modèle et la date.'], ['title' => 'Payez']],
    ]];
    $design['sections'][2]['settings'] = ['title' => 'Bienvenue', 'image' => '/storage/banners/opt/photo.webp', 'button' => ''];
    $design['sections'][3]['variant'] = 'list';
    $design['sections'][3]['settings'] = ['leaders' => true, 'limit' => 12];

    $clean = StoreDesign::validate($design);

    expect((array) $clean['sections'][3]['settings'])->toBe(['leaders' => true, 'limit' => 12]);
});

test('des réglages hors catalogue sont refusés', function (string $type, string $variant, array $settings) {
    $design = classique();
    $design['sections'][] = ['id' => 'test', 'type' => $type, 'variant' => $variant, 'enabled' => true, 'settings' => $settings];

    expect(fn () => StoreDesign::validate($design))->toThrow(ValidationException::class);
})->with([
    'trop de questions' => ['faq', 'simple', ['items' => array_fill(0, 9, ['question' => 'Q', 'answer' => 'R'])]],
    'champ inconnu dans une question' => ['faq', 'simple', ['items' => [['question' => 'Q', 'answer' => 'R', 'onclick' => 'x']]]],
    'liste qui n’en est pas une' => ['steps', 'line', ['items' => ['a' => ['title' => 'x']]]],
    'photo hébergée ailleurs' => ['story', 'split', ['image' => 'https://exemple.com/photo.jpg']],
    'chemin de photo détourné' => ['story', 'split', ['image' => '/storage/../../.env']],
    'nombre hors limites' => ['products', 'grid', ['limit' => 500]],
    'booléen attendu' => ['products', 'list', ['leaders' => 'oui']],
    'réglage d’une autre section' => ['cta', 'band', ['items' => []]],
]);
