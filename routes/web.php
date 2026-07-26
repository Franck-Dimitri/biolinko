<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\AppearanceController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\StorefrontController;
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
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Orders & Wallet Management
    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.updateStatus');
    Route::post('/wallet/withdraw', [OrderController::class, 'requestWithdrawal'])->name('wallet.withdraw');

    // Customers Directory
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
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
Route::get('/track/{tracking_code}', [OrderTrackingController::class, 'show'])->name('order.track');

// Load auth routes BEFORE public catch-all
require __DIR__.'/auth.php';

// Public Storefront Catch-All (MUST BE ABSOLUTELY LAST)
Route::get('/{store_slug}', [StorefrontController::class, 'show'])->name('storefront.show');
