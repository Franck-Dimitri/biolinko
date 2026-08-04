<?php

use App\Models\User;
use App\Models\Store;

test('vendor can update store appearance including sections_json and benefits_json', function () {
    $user = User::factory()->create(['role' => 'seller']);
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Ma Super Boutique',
        'slug' => 'ma-super-boutique',
        'theme_color' => '#FFCC00',
        'is_published' => false,
    ]);

    $sections = [
        ['id' => 'banner', 'name' => "Bandeau d'Annonce", 'enabled' => true, 'locked' => true],
        ['id' => 'hero', 'name' => "Section Héro", 'enabled' => true, 'locked' => true],
        ['id' => 'products', 'name' => "Catalogue", 'enabled' => true, 'locked' => true],
        ['id' => 'benefits', 'name' => "Engagements", 'enabled' => false, 'locked' => false],
        ['id' => 'reviews', 'name' => "Avis Clients", 'enabled' => false, 'locked' => false],
        ['id' => 'about', 'name' => "À propos", 'enabled' => true, 'locked' => false],
    ];

    $benefits = [
        ['title' => 'Livraison 24h', 'subtitle' => 'Partout à Cotonou'],
        ['title' => 'Garantie Satisfait', 'subtitle' => '100% Vérifié'],
    ];

    $response = $this->actingAs($user)->post(route('appearance.update'), [
        'name' => 'Ma Super Boutique Modifiée',
        'slug' => 'ma-super-boutique',
        'category' => 'Mode & Accessoires',
        'theme_color' => '#059669',
        'accent_color' => '#10B981',
        'font_family' => 'Outfit',
        'sections_json' => $sections,
        'benefits_json' => $benefits,
    ]);

    $response->assertRedirect();

    $store->refresh();
    expect($store->name)->toBe('Ma Super Boutique Modifiée');
    expect($store->theme_color)->toBe('#059669');
    expect($store->font_family)->toBe('Outfit');
    expect($store->sections_json)->toBeArray();
    expect($store->sections_json[3]['enabled'])->toBeFalse();
    expect($store->sections_json[4]['enabled'])->toBeFalse();
    expect($store->benefits_json)->toBeArray();
    expect($store->benefits_json[0]['title'])->toBe('Livraison 24h');
});
