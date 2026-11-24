<?php

use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seller = User::factory()->create(['role' => 'seller', 'plan' => 'starter']);
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Chez Awa', 'slug' => 'chez-awa', 'business_type' => 'mode']);
    $this->example = fn (string $title) => Product::create(['store_id' => $this->store->id, 'title' => $title, 'slug' => Str::slug($title),
        'price_vendor' => 5000, 'stock' => 0, 'is_active' => false, 'example_of' => 'mode']);
});

test('le vendeur supprime un exemple, ou tous les exemples d’un coup sans toucher à ses produits', function () {
    $one = ($this->example)('Robe exemple');
    ($this->example)('Sac exemple');
    ($this->example)('Chemise exemple');
    $own = Product::create(['store_id' => $this->store->id, 'title' => 'Ma robe', 'slug' => 'ma-robe', 'price_vendor' => 9000, 'stock' => 3, 'is_active' => true]);

    $this->actingAs($this->seller)->delete(route('products.destroy', $one))->assertRedirect();
    expect(Product::whereNotNull('example_of')->count())->toBe(2);

    $this->actingAs($this->seller)->delete(route('products.examples.destroy'))->assertRedirect();
    expect(Product::whereNotNull('example_of')->count())->toBe(0)->and($own->fresh())->not->toBeNull();
});

test('un vendeur ne peut pas supprimer les exemples d’une autre boutique', function () {
    $other = ($this->example)('Robe exemple');
    $intruder = User::factory()->create(['role' => 'seller']);
    Store::create(['user_id' => $intruder->id, 'name' => 'Autre', 'slug' => 'autre-boutique']);

    $this->actingAs($intruder)->delete(route('products.destroy', $other))->assertForbidden();
    $this->actingAs($intruder)->delete(route('products.examples.destroy'));
    expect($other->fresh())->not->toBeNull();
});

test('un exemple modifié devient un vrai produit, et les exemples ne comptent pas dans la limite du plan', function () {
    foreach (range(1, 5) as $i) {
        ($this->example)("Exemple {$i}");
    }
    // Starter : 5 produits ; les 5 exemples ne bloquent pas l'ajout
    $this->actingAs($this->seller)->post(route('products.store'), ['title' => 'Mon premier produit', 'price_vendor' => 7000, 'stock' => 2, 'min_order_quantity' => 1, 'is_active' => true])
        ->assertSessionHasNoErrors();
    expect(Product::whereNull('example_of')->count())->toBe(1);

    $example = Product::whereNotNull('example_of')->first();
    $this->actingAs($this->seller)->post(route('products.update.post', $example), ['title' => 'Robe retouchée', 'price_vendor' => 8000, 'stock' => 1, 'min_order_quantity' => 1, 'is_active' => true])
        ->assertSessionHasNoErrors();
    expect($example->fresh()->example_of)->toBeNull();
});
