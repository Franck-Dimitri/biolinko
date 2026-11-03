<?php

use App\Models\Order;
use App\Models\User;

test('une facture manuelle créée depuis le formulaire est enregistrée avec son numéro et son PDF', function () {
    $seller = User::factory()->create(['role' => 'seller']);
    $seller->ensureStore();

    $res = $this->actingAs($seller)->post(route('seller.invoices.storeManual'), [
        'customer_name' => 'Client Bureau', 'customer_phone' => '699001122', 'customer_email' => '', 'customer_city' => '',
        'delivery_address' => '', 'due_at' => '', 'notes' => '', 'mark_paid' => false,
        'items' => [['description' => 'Robe sur mesure', 'quantity' => '2', 'unit_price' => '15000']],
    ]);
    $res->assertSessionHasNoErrors();

    $order = Order::where('is_manual', true)->first();
    expect($order)->not->toBeNull();
    expect((float) $order->total_client)->toBe(30000.0);

    $this->actingAs($seller)->get(route('seller.invoices.download', $order))->assertOk()->assertHeader('content-type', 'application/pdf');
});
