<?php

use App\Models\User;
use App\Support\BusinessTypes;
use App\Support\StoreDesign;
use App\Support\StoreTemplates;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;

test('chaque activité a exactement 3 templates valides, avec un motif de son activité', function () {
    foreach (StoreTemplates::byBusinessType() as $type => $templates) {
        expect($templates)->toHaveCount(3, "Activité {$type}");
        foreach ($templates as $t) {
            expect(fn () => StoreDesign::validate($t['design']))->not->toThrow(ValidationException::class, $t['id']);
            expect($t['design']['template'])->toBe($t['id'])
                ->and($t['business_types'])->toBe([$type])
                ->and($t['name'])->not->toBeEmpty()
                ->and($t['pitch'])->not->toBeEmpty()
                ->and(BusinessTypes::PATTERNS_BY_TYPE[$type])->toContain($t['design']['pattern']['key']);
            $types = array_column($t['design']['sections'], 'type');
            expect($types)->toContain('header', 'footer')
                ->and(array_intersect($types, ['products', 'services']))->not->toBeEmpty();
        }
    }
    expect(StoreTemplates::all())->toHaveCount(43); // 42 + Classique (boutiques existantes)
});

test('les templates ne promettent rien que Biolinko ne fait pas', function () {
    $text = collect(StoreTemplates::all())->map(fn ($t) => json_encode([$t['pitch'] ?? '', $t['who'] ?? '', $t['preview'] ?? []], JSON_UNESCAPED_UNICODE))->implode(' ')
        .json_encode(array_map(fn ($type) => StoreTemplates::demo($type), BusinessTypes::keys()), JSON_UNESCAPED_UNICODE);

    expect($text)->not->toMatch('/WhatsApp|abonne|alerte/i');
});

test('le contenu d’exemple de chaque activité existe et ses photos sont créditées', function () {
    $credited = collect(StoreTemplates::photoCredits())->pluck('file')->all();
    foreach (BusinessTypes::keys() as $type) {
        $demo = StoreTemplates::demo($type);
        expect($demo)->not->toBeNull($type)->and($demo['products'])->not->toBeEmpty();
        $images = collect($demo['products'])->pluck('image_url')->push($demo['banner'])->merge(collect($demo['categories'])->pluck('image'))->filter();
        foreach ($images as $image) {
            expect(is_file(public_path(ltrim($image, '/'))))->toBeTrue("Photo absente : {$image}");
            if (str_starts_with($image, '/images/templates/')) {
                expect($credited)->toContain(basename($image));
            }
        }
    }
});

test('la galerie publique liste les activités et leurs templates', function () {
    $this->get('/templates')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Site/Templates/Index')
        ->has('activities', count(BusinessTypes::keys()))
        ->has('activities.0.templates', 3)
        ->has('credits'));
});

test('chaque template se voit en grand avec un contenu d’exemple', function () {
    $this->get('/templates/pat-douceur')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('Site/Templates/Show')
        ->where('template.name', 'Douceur')
        ->where('store.storefront_design.template', 'pat-douceur')
        ->has('siblings', 3)
        ->has('products'));

    $this->get('/templates/inconnu')->assertNotFound();
    $this->get('/templates/classique')->assertNotFound();
});

test('les templates figurent dans le plan du site et l’adresse « templates » est réservée', function () {
    $this->get('/sitemap.xml')->assertOk()->assertSee('/templates/pat-douceur', false);
    expect(User::RESERVED_SLUGS)->toContain('templates');
});
