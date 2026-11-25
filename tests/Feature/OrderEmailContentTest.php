<?php

use App\Mail\ModerationNotificationMail;
use App\Mail\OrderConfirmationToCustomerMail;
use App\Mail\OrderNotificationToVendorMail;
use App\Mail\VendorOtpVerificationMail;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Store;
use App\Models\User;

beforeEach(function () {
    $this->seller = User::factory()->create(['role' => 'seller', 'email' => 'awa@example.com']);
    $this->store = Store::create(['user_id' => $this->seller->id, 'name' => 'Douceurs Awa', 'slug' => 'douceurs-awa', 'theme_color' => '#B4235A', 'phone_whatsapp' => '+237690000000']);
    $this->order = Order::create(['store_id' => $this->store->id, 'tracking_code' => 'BLK-TEST-0001', 'customer_name' => 'Jean Mbarga', 'customer_phone' => '690123456',
        'customer_email' => 'jean@example.com', 'city' => 'Douala', 'address_details' => 'Bonamoussadi', 'subtotal' => 20000, 'delivery_fee' => 1000,
        'total_client' => 21700, 'price_vendor' => 21000, 'saas_margin' => 0, 'api_fee' => 700, 'commission_amount' => 2000, 'payment_operator' => 'MTN',
        'payment_status' => 'paid', 'status' => 'paid', 'paid_at' => now()]);
    OrderItem::create(['order_id' => $this->order->id, 'product_title' => 'Gâteau chocolat', 'variant_label' => '12 parts', 'quantity' => 1, 'unit_price_vendor' => 15000, 'total_price_vendor' => 15000]);
    OrderItem::create(['order_id' => $this->order->id, 'product_title' => 'Cupcakes vanille', 'quantity' => 5, 'unit_price_vendor' => 1000, 'total_price_vendor' => 5000]);
});

test('le mail de nouvelle commande liste les articles commandés et ce que touche le vendeur', function () {
    $mail = new OrderNotificationToVendorMail($this->order->fresh(), '%PDF');

    $mail->assertHasSubject('Nouvelle commande BLK-TEST-0001 : 21 700 FCFA')
        ->assertSeeInHtml('Gâteau chocolat')->assertSeeInHtml('12 parts')->assertSeeInHtml('Cupcakes vanille')
        ->assertSeeInHtml('Quantité : 5 × 1 000 FCFA')->assertSeeInHtml('19 000 FCFA') // 21 000 − 2 000 de commission
        ->assertSeeInHtml('Bonamoussadi, Douala')->assertSeeInHtml('#B4235A');
});

test('le mail du client est aux couleurs de la boutique, envoyé en son nom, réponse au vendeur', function () {
    $mail = new OrderConfirmationToCustomerMail($this->order->fresh(), '%PDF');

    $mail->assertFrom(config('mail.from.address'), 'Douceurs Awa')->assertHasReplyTo('awa@example.com')
        ->assertHasSubject('Votre commande chez Douceurs Awa est confirmée')
        ->assertSeeInHtml('Merci pour votre commande, Jean')->assertSeeInHtml('Gâteau chocolat')->assertSeeInHtml('Suivre ma commande')
        ->assertSeeInHtml('#B4235A')->assertSeeInHtml('+237690000000');
});

test('les e-mails ne gardent ni émojis ni filigrane', function () {
    $html = (new OrderConfirmationToCustomerMail($this->order->fresh(), '%PDF'))->render()
        .(new OrderNotificationToVendorMail($this->order->fresh(), '%PDF'))->render()
        .(new VendorOtpVerificationMail($this->seller, '123456'))->render()
        .(new ModerationNotificationMail($this->seller, 'store_suspended', 'Douceurs Awa', 'Photos interdites'))->render();

    expect($html)->not->toContain('🇨🇲')->not->toContain('🎉')->not->toContain('⚡')->not->toContain('FILIGRANE')->not->toContain('mrdims.dev')
        ->toContain('123456')->toContain('Photos interdites');
});
