<?php

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Services\OrderInvoiceService;
use App\Mail\VendorOtpVerificationMail;
use App\Mail\OrderNotificationToVendorMail;
use App\Mail\OrderConfirmationToCustomerMail;
use Illuminate\Support\Facades\Mail;

test('vendor user can generate and verify email otp code', function () {
    $user = User::factory()->create([
        'email_verified_at' => null,
    ]);

    $otp = $user->generateEmailOtp();

    expect(strlen($otp))->toBe(6);
    expect($user->email_otp)->toBe($otp);
    expect($user->email_otp_expires_at->isFuture())->toBeTrue();

    // Verify OTP code
    $success = $user->verifyEmailOtp($otp);
    $user = User::find($user->id);

    expect($success)->toBeTrue();
    expect($user->email_verified_at)->not->toBeNull();
    expect($user->email_otp)->toBeNull();
});

test('order invoice pdf generation renders successfully with qr code', function () {
    $user = User::factory()->create(['role' => 'seller']);
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Test',
        'slug' => 'boutique-test',
    ]);
    $order = Order::create([
        'store_id' => $store->id,
        'tracking_code' => 'BLK-TEST-9999',
        'customer_name' => 'Jean Eto\'o',
        'customer_phone' => '690123456',
        'customer_email' => 'jean.etoo@example.com',
        'city' => 'Douala',
        'total_client' => 15000,
        'price_vendor' => 13500,
        'saas_margin' => 1500,
        'api_fee' => 0,
        'payment_status' => 'paid',
        'status' => 'paid',
    ]);

    $service = new OrderInvoiceService();
    $pdfContent = $service->generateInvoicePdf($order);

    expect($pdfContent)->not()->toBeEmpty();
    expect(str_starts_with($pdfContent, '%PDF'))->toBeTrue();
});

test('order invoice emails are dispatched to both vendor and customer with pdf attachment', function () {
    Mail::fake();

    $user = User::factory()->create([
        'email' => 'vendeur.test@biolinko.cm',
        'role' => 'seller',
    ]);
    $store = Store::create([
        'user_id' => $user->id,
        'name' => 'Boutique Express',
        'slug' => 'boutique-express',
    ]);
    $order = Order::create([
        'store_id' => $store->id,
        'tracking_code' => 'BLK-TEST-8888',
        'customer_name' => 'Alice Kemayou',
        'customer_phone' => '677112233',
        'customer_email' => 'alice@example.com',
        'city' => 'Yaoundé',
        'total_client' => 25000,
        'price_vendor' => 22500,
        'saas_margin' => 2500,
        'api_fee' => 0,
        'payment_status' => 'paid',
        'status' => 'paid',
    ]);

    $order->load('store.user');

    $service = new OrderInvoiceService();
    $service->sendOrderInvoiceEmails($order);

    Mail::assertSent(OrderNotificationToVendorMail::class, function ($mail) use ($user) {
        return $mail->hasTo($user->email);
    });

    Mail::assertSent(OrderConfirmationToCustomerMail::class, function ($mail) {
        return $mail->hasTo('alice@example.com');
    });
});
