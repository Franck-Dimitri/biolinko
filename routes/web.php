<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\AppearanceController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HrSkillsPayWebhookController;
use App\Http\Controllers\MarketingController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\StorefrontController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\ToolPluginController;
use App\Http\Controllers\SellerInvoiceController;
use App\Http\Controllers\SmartLinkController;
use App\Http\Controllers\WalletController;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Smart Dashboard Redirector based on user role
Route::middleware(['auth', 'verified'])->get('/dashboard', function (Request $request) {
    $user = $request->user();
    if ($user->isAdmin()) {
        return redirect()->route('admin.dashboard');
    }
    return redirect()->route('seller.dashboard');
})->name('dashboard');

// 1. SUPER-ADMIN ROUTES (Prefix: /admin, Middleware: role:admin)
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
});

// 2. SELLER / VENDOR ROUTES (Prefix: /seller, Middleware: role:seller)
Route::middleware(['auth', 'verified', 'role:seller'])->prefix('seller')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('seller.dashboard');
    Route::post('/store', [StoreController::class, 'update'])->name('store.update');
    Route::post('/store/publish', [StoreController::class, 'togglePublish'])->name('store.togglePublish');

    // Appearance / Store Customization
    Route::get('/appearance', [AppearanceController::class, 'index'])->name('appearance.index');
    Route::post('/appearance', [AppearanceController::class, 'update'])->name('appearance.update');
    Route::post('/appearance/reviews', [AppearanceController::class, 'storeReview'])->name('appearance.reviews.store');
    Route::patch('/appearance/reviews/{review}/toggle', [AppearanceController::class, 'toggleReviewFeatured'])->name('appearance.reviews.toggle');
    Route::delete('/appearance/reviews/{review}', [AppearanceController::class, 'destroyReview'])->name('appearance.reviews.destroy');

    // Products Catalogue CRUD
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::post('/products/{product}', [ProductController::class, 'update'])->name('products.update.post');
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Orders Management
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.updateStatus');

    // Wallet & Cashout Management
    Route::get('/wallet', [WalletController::class, 'index'])->name('seller.wallet.index');
    Route::post('/wallet/withdraw', [WalletController::class, 'requestWithdrawal'])->name('wallet.withdraw');

    // Invoices Management
    Route::get('/invoices', [SellerInvoiceController::class, 'index'])->name('seller.invoices.index');
    Route::post('/invoices/manual', [SellerInvoiceController::class, 'storeManualInvoice'])->name('seller.invoices.storeManual');
    Route::post('/invoices/{order}/remind', [SellerInvoiceController::class, 'sendReminder'])->name('seller.invoices.sendReminder');
    Route::get('/invoices/{order}/download', [SellerInvoiceController::class, 'download'])->name('seller.invoices.download');
    Route::get('/invoices/{order}/preview', [SellerInvoiceController::class, 'preview'])->name('seller.invoices.preview');

    // SmartLinks Management
    Route::get('/smartlinks', [SmartLinkController::class, 'index'])->name('seller.smartlinks.index');
    Route::post('/smartlinks', [SmartLinkController::class, 'store'])->name('seller.smartlinks.store');
    Route::patch('/smartlinks/{smartLink}/toggle', [SmartLinkController::class, 'toggleActive'])->name('seller.smartlinks.toggle');
    Route::delete('/smartlinks/{smartLink}', [SmartLinkController::class, 'destroy'])->name('seller.smartlinks.destroy');

    // Customers Directory
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');

    // Marketing & Pixels
    Route::get('/marketing', [MarketingController::class, 'index'])->name('seller.marketing.index');
    Route::post('/marketing', [MarketingController::class, 'update'])->name('seller.marketing.update');

    // Outils & Plugins
    Route::get('/tools', [ToolPluginController::class, 'index'])->name('seller.tools.index');

    // Subscriptions Management
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('seller.subscriptions.index');
    Route::post('/subscriptions/subscribe', [SubscriptionController::class, 'subscribe'])->name('seller.subscriptions.subscribe');
    Route::get('/subscriptions/status/{reference}', [SubscriptionController::class, 'checkStatus'])->name('seller.subscriptions.status');
});

// Shared User Profile Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Public Client Fast Checkout & Order Tracking & Customer Lookup
Route::get('/checkout/lookup-customer', [CheckoutController::class, 'lookupCustomer'])->name('checkout.lookupCustomer');
Route::post('/checkout', [CheckoutController::class, 'process'])->name('checkout.process');
Route::get('/checkout/status/{reference}', [CheckoutController::class, 'checkStatus'])->name('checkout.status');
Route::get('/track/{tracking_code}', [OrderTrackingController::class, 'show'])->name('order.track');

// Public SmartLink Fast Checkout Pages
Route::get('/pay/{code}', [SmartLinkController::class, 'showPublic'])->name('smartlink.show');
Route::get('/pay/sl/{code}', [SmartLinkController::class, 'showPublic']);
Route::get('/store/{store_slug}/pay/sl/{code}', [SmartLinkController::class, 'showPublicByStore'])->name('smartlink.showByStore');
Route::get('/{store_slug}/pay/sl/{code}', [SmartLinkController::class, 'showPublicByStore']);
Route::post('/pay/{code}/checkout', [SmartLinkController::class, 'processPublicCheckout'])->name('smartlink.checkout');

// HR-Skills Pay Webhook Callback Route (Exclude CSRF)
Route::post('/api/webhooks/hrskills-pay', [HrSkillsPayWebhookController::class, 'handle'])->name('webhooks.hrskills-pay');

// Load auth routes BEFORE public catch-all
require __DIR__.'/auth.php';

// Public Storefront Catch-All (MUST BE ABSOLUTELY LAST)
Route::post('/{store_slug}/reviews', [StorefrontController::class, 'submitReview'])->name('storefront.reviews.store');
Route::get('/{store_slug}/p/{product_slug}', [StorefrontController::class, 'showProduct'])->name('storefront.product.show');
Route::get('/{store_slug}', [StorefrontController::class, 'show'])->name('storefront.show');
