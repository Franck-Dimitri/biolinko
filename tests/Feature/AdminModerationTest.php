<?php

use App\Mail\ModerationNotificationMail;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('super admin can delete a product with reason and seller is notified by email', function () {
    Mail::fake();

    $admin = User::factory()->create(['role' => 'admin']);
    $seller = User::factory()->create([
        'role' => 'seller',
        'email' => 'seller.mod@example.com',
        'phone_whatsapp' => '237690001122',
    ]);

    $store = Store::create([
        'user_id' => $seller->id,
        'name' => 'Boutique Test',
        'slug' => 'boutique-test',
        'is_published' => true,
    ]);

    $product = Product::create([
        'store_id' => $store->id,
        'title' => 'Sneakers Contrefaçon',
        'slug' => 'sneakers-contrefacon',
        'price_vendor' => 10000,
        'stock' => 5,
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->delete(route('admin.products.destroy', $product->id), [
        'reason' => 'Produit contrefait non conforme aux règles commerciales de la plateforme.',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseMissing('products', ['id' => $product->id]);

    Mail::assertSent(ModerationNotificationMail::class, function ($mail) use ($seller) {
        return $mail->hasTo('seller.mod@example.com')
            && $mail->type === 'product_deleted'
            && str_contains($mail->itemName, 'Sneakers Contrefaçon')
            && str_contains($mail->reason, 'Produit contrefait');
    });
});

test('deleting a product requires a valid reason of at least 5 characters', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $seller = User::factory()->create(['role' => 'seller']);
    $store = Store::create([
        'user_id' => $seller->id,
        'name' => 'Store 1',
        'slug' => 'store-1',
    ]);
    $product = Product::create([
        'store_id' => $store->id,
        'title' => 'Product 1',
        'slug' => 'product-1',
        'price_vendor' => 5000,
    ]);

    $response = $this->actingAs($admin)->delete(route('admin.products.destroy', $product->id), [
        'reason' => 'abc',
    ]);

    $response->assertSessionHasErrors('reason');
    $this->assertDatabaseHas('products', ['id' => $product->id]);
});

test('super admin can suspend store with reason and notify seller', function () {
    Mail::fake();

    $admin = User::factory()->create(['role' => 'admin']);
    $seller = User::factory()->create([
        'role' => 'seller',
        'email' => 'store.suspend@example.com',
    ]);
    $store = Store::create([
        'user_id' => $seller->id,
        'name' => 'Boutique Suspendue',
        'slug' => 'boutique-suspendue',
        'is_published' => true,
    ]);

    $response = $this->actingAs($admin)->post(route('admin.stores.moderate', $store->id), [
        'action' => 'suspend',
        'reason' => 'Suspicion de fraude sur plusieurs commandes non honorées.',
    ]);

    $response->assertRedirect();
    $store->refresh();
    expect($store->is_published)->toBeFalse();

    Mail::assertSent(ModerationNotificationMail::class, function ($mail) {
        return $mail->hasTo('store.suspend@example.com')
            && $mail->type === 'store_suspended';
    });
});

test('super admin can ban user with reason, store is unpublished and user notified', function () {
    Mail::fake();

    $admin = User::factory()->create(['role' => 'admin']);
    $seller = User::factory()->create([
        'role' => 'seller',
        'name' => 'Fraudeur Test',
        'email' => 'fraudeur@example.com',
        'is_banned' => false,
    ]);
    $store = Store::create([
        'user_id' => $seller->id,
        'name' => 'Boutique Fraudeur',
        'slug' => 'boutique-fraudeur',
        'is_published' => true,
    ]);

    $response = $this->actingAs($admin)->post(route('admin.users.toggleBan', $seller->id), [
        'reason' => 'Escroquerie confirmée et plaintes déposées.',
    ]);

    $response->assertRedirect();
    $seller->refresh();
    $store->refresh();

    expect($seller->is_banned)->toBeTrue();
    expect($store->is_published)->toBeFalse();

    Mail::assertSent(ModerationNotificationMail::class, function ($mail) {
        return $mail->hasTo('fraudeur@example.com')
            && $mail->type === 'account_banned';
    });
});

test('non-admin cannot perform moderation actions', function () {
    $regularUser = User::factory()->create(['role' => 'seller']);
    $seller = User::factory()->create(['role' => 'seller']);
    $store = Store::create(['user_id' => $seller->id, 'name' => 'S1', 'slug' => 's1']);
    $product = Product::create(['store_id' => $store->id, 'title' => 'P1', 'slug' => 'p1', 'price_vendor' => 1000]);

    $response = $this->actingAs($regularUser)->delete(route('admin.products.destroy', $product->id), [
        'reason' => 'Tentative non autorisée',
    ]);
    $response->assertRedirect(route('seller.dashboard'));
    $this->assertDatabaseHas('products', ['id' => $product->id]);
});
