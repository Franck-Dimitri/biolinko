<?php

use App\Http\Controllers\AppearanceController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\StorefrontController;
use Illuminate\Foundation\Application;
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

// Vendor Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/dashboard/store', [StoreController::class, 'update'])->name('store.update');

    // Appearance / Store Customization
    Route::get('/dashboard/appearance', [AppearanceController::class, 'index'])->name('appearance.index');
    Route::post('/dashboard/appearance', [AppearanceController::class, 'update'])->name('appearance.update');
    Route::post('/dashboard/appearance/reviews', [AppearanceController::class, 'storeReview'])->name('appearance.reviews.store');
    Route::patch('/dashboard/appearance/reviews/{review}/toggle', [AppearanceController::class, 'toggleReviewFeatured'])->name('appearance.reviews.toggle');
    Route::delete('/dashboard/appearance/reviews/{review}', [AppearanceController::class, 'destroyReview'])->name('appearance.reviews.destroy');

    // Products Catalogue CRUD
    Route::get('/dashboard/products', [ProductController::class, 'index'])->name('products.index');
    Route::post('/dashboard/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/dashboard/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/dashboard/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Orders & Wallet Management
    Route::get('/dashboard/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::patch('/dashboard/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.updateStatus');
    Route::post('/dashboard/wallet/withdraw', [OrderController::class, 'requestWithdrawal'])->name('wallet.withdraw');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Public Client Fast Checkout & Order Tracking
Route::post('/checkout', [CheckoutController::class, 'process'])->name('checkout.process');
Route::get('/track/{tracking_code}', [OrderTrackingController::class, 'show'])->name('order.track');

// Load auth routes BEFORE public catch-all
require __DIR__.'/auth.php';

// Public Storefront Catch-All (MUST BE ABSOLUTELY LAST)
Route::get('/{store_slug}', [StorefrontController::class, 'show'])->name('storefront.show');
