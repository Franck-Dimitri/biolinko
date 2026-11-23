<?php

use App\Http\Controllers\Account\ProfileController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminPilotController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminSettingController;
use App\Http\Controllers\Admin\AdminStoreController;
use App\Http\Controllers\Admin\AdminStoreReportController;
use App\Http\Controllers\Admin\AdminSubscriptionController;
use App\Http\Controllers\Admin\AdminTransactionController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminVerificationController;
use App\Http\Controllers\Admin\AdminWalletController;
use App\Http\Controllers\Admin\AdminWithdrawalController;
use App\Http\Controllers\Seller\AppearanceController;
use App\Http\Controllers\Seller\CustomerController;
use App\Http\Controllers\Seller\DashboardController;
use App\Http\Controllers\Seller\MarketingController;
use App\Http\Controllers\Seller\OrderController;
use App\Http\Controllers\Seller\ProductController;
use App\Http\Controllers\Seller\SalesReportController;
use App\Http\Controllers\Seller\SellerInvoiceController;
use App\Http\Controllers\Seller\SellingController;
use App\Http\Controllers\Seller\SmartLinkController;
use App\Http\Controllers\Seller\StoreController;
use App\Http\Controllers\Seller\SubscriptionController;
use App\Http\Controllers\Seller\ToolPluginController;
use App\Http\Controllers\Seller\VerificationController;
use App\Http\Controllers\Seller\WalletController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\OrderTrackingController;
use App\Http\Controllers\Storefront\SeoController;
use App\Http\Controllers\Storefront\SiteController;
use App\Http\Controllers\Storefront\TemplateGalleryController;
use App\Http\Controllers\Storefront\StorefrontController;
use App\Http\Controllers\Webhooks\HrSkillsPayWebhookController;
use App\Http\Controllers\Webhooks\MercyPayWebhookController;
use App\Http\Controllers\Webhooks\PawapayWebhookController;
use App\Http\Controllers\Webhooks\WhatsappCloudWebhookController;
use App\Support\PlanIntent;
use App\Support\Seo;
use App\Support\ShopIntent;
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
    ])->withViewData(['meta' => Seo::landing()]);
});

// Smart Dashboard Redirector based on user role
Route::middleware(['auth', 'verified'])->get('/dashboard', function (Request $request) {
    $user = $request->user();
    if ($user->isAdmin()) {
        return redirect()->route('admin.dashboard');
    }

    // Plan choisi sur la landing avant connexion / inscription : on reprend l'abonnement
    if ($plan = PlanIntent::pull($request)) {
        return redirect()->route('seller.subscriptions.index', ['plan' => $plan]);
    }

    return redirect()->route('seller.dashboard');
})->name('dashboard');

// 1. SUPER-ADMIN ROUTES (Prefix: /admin, Middleware: role:admin)
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->group(function () {
    // 1. Dashboard Super-Admin
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // 2. Boutiques Réseau
    Route::get('/stores', [AdminStoreController::class, 'index'])->name('admin.stores.index');
    Route::get('/templates', [\App\Http\Controllers\Admin\AdminTemplateController::class, 'index'])->name('admin.templates.index');
    Route::post('/stores/{store}/toggle-status', [AdminStoreController::class, 'toggleStatus'])->name('admin.stores.toggleStatus');
    Route::post('/stores/{store}/plan', [AdminStoreController::class, 'updatePlan'])->name('admin.stores.plan');
    Route::post('/stores/{store}/design-engine', [AdminStoreController::class, 'toggleDesignEngine'])->name('admin.stores.designEngine');
    Route::post('/stores/{store}/moderate', [AdminStoreController::class, 'moderateStore'])->name('admin.stores.moderate');

    // 3. Vendeurs & Utilisateurs
    Route::get('/users', [AdminUserController::class, 'index'])->name('admin.users.index');
    Route::get('/users/{user}', [AdminUserController::class, 'show'])->name('admin.users.show');
    Route::post('/users/{user}/plan', [AdminUserController::class, 'updatePlan'])->name('admin.users.plan');
    Route::post('/users/{user}/pilot', [AdminUserController::class, 'startPilot'])->name('admin.users.pilot');
    Route::post('/users/{user}/toggle-ban', [AdminUserController::class, 'toggleBan'])->name('admin.users.toggleBan');
    Route::post('/users/{user}/toggle-store', [AdminUserController::class, 'toggleStore'])->name('admin.users.toggleStore');

    // 4. Abonnements SaaS
    Route::get('/subscriptions', [AdminSubscriptionController::class, 'index'])->name('admin.subscriptions.index');
    Route::post('/subscriptions/{user}/update-plan', [AdminSubscriptionController::class, 'updatePlan'])->name('admin.subscriptions.updatePlan');

    // 5. Catalogue Produits Réseau
    Route::get('/products', [AdminProductController::class, 'index'])->name('admin.products.index');
    Route::post('/products/{product}/toggle-active', [AdminProductController::class, 'toggleActive'])->name('admin.products.toggleActive');
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->name('admin.products.destroy');

    // 6. Retraits Mobile Money
    Route::get('/withdrawals', [AdminWithdrawalController::class, 'index'])->name('admin.withdrawals.index');
    Route::post('/withdrawals/{withdrawal}/approve', [AdminWithdrawalController::class, 'approve'])->name('admin.withdrawals.approve');
    Route::post('/withdrawals/{withdrawal}/reject', [AdminWithdrawalController::class, 'reject'])->name('admin.withdrawals.reject');

    // 6 bis. Vérification d'identité des vendeurs et signalements de boutiques
    Route::get('/verifications', [AdminVerificationController::class, 'index'])->name('admin.verifications.index');
    Route::get('/verifications/{verification}/file/{kind}', [AdminVerificationController::class, 'file'])->whereIn('kind', ['front', 'back', 'selfie'])->name('admin.verifications.file');
    Route::post('/verifications/{verification}/approve', [AdminVerificationController::class, 'approve'])->name('admin.verifications.approve');
    Route::post('/verifications/{verification}/reject', [AdminVerificationController::class, 'reject'])->name('admin.verifications.reject');
    Route::get('/store-reports', [AdminStoreReportController::class, 'index'])->name('admin.storeReports.index');
    Route::post('/store-reports/{report}/close', [AdminStoreReportController::class, 'close'])->name('admin.storeReports.close');

    // 7. Portefeuille Admin & Gains Plateforme
    Route::get('/wallet', [AdminWalletController::class, 'index'])->name('admin.wallet.index');

    // 8. Ventes & Transactions
    Route::get('/transactions', [AdminTransactionController::class, 'index'])->name('admin.transactions.index');
    Route::post('/transactions/{order}/refund', [AdminTransactionController::class, 'refund'])->middleware('throttle:10,1')->name('admin.transactions.refund');

    // 9. Paramètres Plateforme & API
    Route::get('/settings', [AdminSettingController::class, 'index'])->name('admin.settings.index');

    // 10. Candidatures au programme pilote
    Route::get('/pilote', [AdminPilotController::class, 'index'])->name('admin.pilot.index');
    Route::patch('/pilote/{application}', [AdminPilotController::class, 'update'])->name('admin.pilot.update');
    Route::get('/settings/whatsapp-templates', [AdminSettingController::class, 'whatsappTemplates'])->name('admin.settings.whatsapp.templates');
    Route::post('/settings/whatsapp-test', [AdminSettingController::class, 'testWhatsappMessage'])->name('admin.settings.whatsapp.test');
});

// 2. SELLER / VENDOR ROUTES (Prefix: /seller, Middleware: role:seller)
Route::middleware(['auth', 'verified', 'role:seller'])->prefix('seller')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('seller.dashboard');
    // Création de la boutique : activité, template, nom, adresse, ville et WhatsApp
    Route::get('/creation', [\App\Http\Controllers\Seller\CreationController::class, 'show'])->name('seller.creation');
    Route::post('/creation', [\App\Http\Controllers\Seller\CreationController::class, 'store'])->name('seller.creation.store');
    // Éditeur visuel de la vitrine
    // L'éditeur fait partie de « Ma boutique » (ancienne adresse gardée)
    Route::redirect('/vitrine', '/seller/appearance')->name('seller.editor');
    Route::put('/vitrine/brouillon', [\App\Http\Controllers\Seller\EditorController::class, 'saveDraft'])->middleware('throttle:60,1')->name('seller.editor.draft');
    Route::post('/vitrine/publier', [\App\Http\Controllers\Seller\EditorController::class, 'publish'])->name('seller.editor.publish');
    Route::post('/vitrine/versions/{version}/restaurer', [\App\Http\Controllers\Seller\EditorController::class, 'restore'])->name('seller.editor.restore');
    Route::post('/vitrine/image', [\App\Http\Controllers\Seller\EditorController::class, 'image'])->middleware('throttle:20,1')->name('seller.editor.image');
    Route::post('/store', [StoreController::class, 'update'])->name('store.update');
    Route::post('/store/publish', [StoreController::class, 'togglePublish'])->name('store.togglePublish');

    // Appearance / Store Customization
    Route::get('/appearance', [AppearanceController::class, 'index'])->name('appearance.index');
    Route::post('/appearance', [AppearanceController::class, 'update'])->name('appearance.update');
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
    Route::get('/orders/export', [SalesReportController::class, 'export'])->middleware('plan:business')->name('orders.export');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.updateStatus');
    Route::post('/orders/{order}/refund', [OrderController::class, 'refund'])->middleware('throttle:10,1')->name('orders.refund');
    Route::post('/orders/{order}/report/respond', [OrderController::class, 'respondToReport'])->name('orders.report.respond');

    // Wallet & Cashout Management
    Route::get('/wallet', [WalletController::class, 'index'])->name('seller.wallet.index');
    Route::post('/wallet/withdraw', [WalletController::class, 'requestWithdrawal'])->name('wallet.withdraw');
    Route::post('/wallet/payout-account', [WalletController::class, 'savePayoutAccount'])->middleware('throttle:6,1')->name('wallet.payout.save');
    Route::delete('/wallet/payout-account/pending', [WalletController::class, 'cancelPendingPayout'])->name('wallet.payout.cancel');
    Route::get('/verification', [VerificationController::class, 'index'])->name('seller.verification.index');
    Route::post('/verification', [VerificationController::class, 'store'])->middleware('throttle:6,1')->name('seller.verification.store');

    // Invoices Management
    Route::get('/invoices', [SellerInvoiceController::class, 'index'])->name('seller.invoices.index');
    Route::post('/invoices/manual', [SellerInvoiceController::class, 'storeManualInvoice'])->name('seller.invoices.storeManual');
    Route::patch('/invoices/{order}/status', [SellerInvoiceController::class, 'updateStatus'])->name('seller.invoices.updateStatus');
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
    Route::post('/customers/abandoned/{order}/reminded', [CustomerController::class, 'markReminded'])->name('customers.abandoned.reminded');
    Route::post('/customers/campaign', [CustomerController::class, 'storeCampaign'])->name('customers.campaign.store');

    // Livraison & codes promo
    Route::get('/livraison-promos', [SellingController::class, 'index'])->name('seller.selling.index');
    Route::post('/livraison', [SellingController::class, 'updateDelivery'])->name('seller.delivery.update');
    Route::post('/acompte', [SellingController::class, 'updateDeposit'])->name('seller.deposit.update');
    Route::post('/promo-codes', [SellingController::class, 'storePromo'])->name('seller.promos.store');
    Route::patch('/promo-codes/{promoCode}/toggle', [SellingController::class, 'togglePromo'])->name('seller.promos.toggle');
    Route::delete('/promo-codes/{promoCode}', [SellingController::class, 'destroyPromo'])->name('seller.promos.destroy');

    // Marketing & Pixels
    Route::get('/marketing', [MarketingController::class, 'index'])->name('seller.marketing.index');
    Route::post('/marketing', [MarketingController::class, 'update'])->name('seller.marketing.update');
    Route::post('/marketing/seo', [MarketingController::class, 'updateSeo'])->name('seller.seo.update');

    // Outils & Plugins
    Route::get('/tools', [ToolPluginController::class, 'index'])->name('seller.tools.index');

    // Subscriptions Management
    Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('seller.subscriptions.index');
    Route::post('/subscriptions/subscribe', [SubscriptionController::class, 'subscribe'])->name('seller.subscriptions.subscribe');
    Route::post('/subscriptions/auto-renew', [SubscriptionController::class, 'toggleAutoRenew'])->name('seller.subscriptions.autoRenew');
    Route::get('/subscriptions/status/{reference}', [SubscriptionController::class, 'checkStatus'])->middleware('throttle:30,1')->name('seller.subscriptions.status');
});

// Shared User Profile Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Webhook Endpoints (CSRF Exempted in bootstrap/app.php)
Route::post('/api/webhooks/mercypay', [MercyPayWebhookController::class, 'handle'])->name('webhooks.mercypay');
Route::post('/api/webhooks/pawapay/deposits', [PawapayWebhookController::class, 'deposits'])->name('webhooks.pawapay.deposits');
Route::post('/api/webhooks/pawapay/payouts', [PawapayWebhookController::class, 'payouts'])->name('webhooks.pawapay.payouts');
Route::post('/api/webhooks/pawapay/refunds', [PawapayWebhookController::class, 'refunds'])->name('webhooks.pawapay.refunds');
Route::post('/api/webhooks/hrskills-pay', [HrSkillsPayWebhookController::class, 'handle'])->name('webhooks.hrskills-pay');
Route::get('/api/webhooks/whatsapp-cloud', [WhatsappCloudWebhookController::class, 'verify'])->name('webhooks.whatsapp-cloud.verify');
Route::post('/api/webhooks/whatsapp-cloud', [WhatsappCloudWebhookController::class, 'handle'])->name('webhooks.whatsapp-cloud');

// Mesures de lancement : un ajout au panier sur une vitrine (compteur par template, sans donnée personnelle)
Route::post('/t/panier/{store}', function (\App\Models\Store $store) {
    if ($store->is_published && ! \App\Support\TemplateStats::isBot(request()->userAgent())) {
        \App\Support\TemplateStats::hit($store, 'carts');
    }

    return response()->noContent();
})->whereNumber('store')->middleware('throttle:30,1')->name('stats.cart');

// Landing : l'adresse biolinko.app/<boutique> est-elle libre ?
Route::get('/boutique-disponible', function (Request $request) {
    $slug = ShopIntent::normalize($request->query('slug'));

    return response()->json(['slug' => $slug, 'available' => $slug !== null && ShopIntent::isAvailable($slug)]);
})->middleware('throttle:30,1')->name('shop.available');

// Public Client Fast Checkout & Order Tracking & Customer Lookup
Route::get('/checkout/lookup-customer', [CheckoutController::class, 'lookupCustomer'])->middleware('throttle:20,1')->name('checkout.lookupCustomer');
Route::post('/checkout/promo', [CheckoutController::class, 'checkPromo'])->middleware('throttle:20,1')->name('checkout.promo');
Route::post('/checkout', [CheckoutController::class, 'process'])->middleware('throttle:10,1')->name('checkout.process');
Route::get('/checkout/status/{reference}', [CheckoutController::class, 'checkStatus'])->middleware('throttle:30,1')->name('checkout.status');
Route::get('/track/{tracking_code}', [OrderTrackingController::class, 'show'])->name('order.track');
Route::get('/track/{tracking_code}/facture', [OrderTrackingController::class, 'invoice'])->middleware('throttle:20,1')->name('order.invoice');
Route::post('/track/{tracking_code}/report', [OrderTrackingController::class, 'report'])->middleware('throttle:3,1')->name('order.report');
Route::post('/panier-semaine/{token}/arreter', [OrderTrackingController::class, 'stopBasket'])->middleware('throttle:10,1')->name('basket.stop');
Route::post('/track/{tracking_code}/ajout', [OrderTrackingController::class, 'addon'])->middleware('throttle:10,1')->name('order.addon');
Route::post('/track/{tracking_code}/received', [OrderTrackingController::class, 'confirmReceipt'])->middleware('throttle:5,1')->name('order.received');
Route::post('/track/{tracking_code}/report/resolve', [OrderTrackingController::class, 'resolve'])->middleware('throttle:5,1')->name('order.report.resolve');
Route::get('/track/{tracking_code}/paiement', [OrderTrackingController::class, 'payment'])->name('order.payment');
Route::post('/track/{tracking_code}/pay', [OrderTrackingController::class, 'pay'])->middleware('throttle:5,1')->name('order.pay');

// Public SmartLink Fast Checkout Pages
Route::get('/pay/{code}', [SmartLinkController::class, 'showPublic'])->name('smartlink.show');
Route::get('/pay/sl/{code}', [SmartLinkController::class, 'showPublic']);
Route::get('/store/{store_slug}/pay/sl/{code}', [SmartLinkController::class, 'showPublicByStore'])->name('smartlink.showByStore');
Route::get('/{store_slug}/pay/sl/{code}', [SmartLinkController::class, 'showPublicByStore']);
Route::post('/pay/{code}/checkout', [SmartLinkController::class, 'processPublicCheckout'])->middleware('throttle:10,1')->name('smartlink.checkout');

// Référencement : plan du site et robots.txt (avant les routes de boutique)
Route::get('/sitemap.xml', [SeoController::class, 'sitemap'])->name('seo.sitemap');
Route::get('/robots.txt', [SeoController::class, 'robots'])->name('seo.robots');

// Pages d'information du site public
Route::controller(SiteController::class)->group(function () {
    Route::get('/a-propos', 'about')->name('site.about');
    Route::get('/contact', 'contact')->name('site.contact');
    Route::get('/paiement-et-securite', 'security')->name('site.security');
    Route::get('/aide', 'help')->name('site.help');
    Route::get('/aide/{article}', 'helpArticle')->where('article', '[a-z0-9-]+')->name('site.help.article');
    Route::get('/programme-pilote', 'pilot')->name('site.pilot');
    Route::post('/programme-pilote', 'storePilot')->middleware('throttle:5,1')->name('site.pilot.store');
    Route::get('/mentions-legales', 'legalNotice')->name('legal.notice');
});

// Galerie publique des templates de boutique
Route::get('/templates', [TemplateGalleryController::class, 'index'])->name('site.templates');
Route::get('/templates/{template}', [TemplateGalleryController::class, 'show'])->where('template', '[a-z0-9-]+')->name('site.templates.show');

// Public Legal Pages (Terms, Privacy, Cookies)
Route::get('/conditions-generales', function () {
    return Inertia::render('Legal/Terms')->withViewData(['meta' => Seo::page('Conditions générales', 'Conditions générales d’utilisation et de vente de Biolinko, la plateforme de boutiques en ligne payées en Mobile Money.', '/conditions-generales')]);
})->name('legal.terms');

Route::get('/terms', function () {
    return redirect()->route('legal.terms');
});

Route::get('/politique-de-confidentialite', function () {
    return Inertia::render('Legal/Privacy')->withViewData(['meta' => Seo::page('Politique de confidentialité', 'Comment Biolinko collecte, utilise et protège les données des vendeurs et de leurs clients.', '/politique-de-confidentialite')]);
})->name('legal.privacy');

Route::get('/privacy', function () {
    return redirect()->route('legal.privacy');
});

Route::get('/politique-des-cookies', function () {
    return Inertia::render('Legal/Cookies')->withViewData(['meta' => Seo::page('Politique des cookies', 'Les cookies utilisés sur Biolinko et comment les gérer.', '/politique-des-cookies')]);
})->name('legal.cookies');

Route::get('/cookies', function () {
    return redirect()->route('legal.cookies');
});

// Load auth routes BEFORE public catch-all
require __DIR__.'/auth.php';

// Public Storefront Catch-All (MUST BE ABSOLUTELY LAST)
Route::post('/{store_slug}/signaler', [StorefrontController::class, 'reportStore'])->middleware('throttle:3,1')->name('storefront.report');
Route::post('/{store_slug}/reviews', [StorefrontController::class, 'submitReview'])->middleware('throttle:5,1')->name('storefront.reviews.store');
Route::get('/{store_slug}/p/{product_slug}', [StorefrontController::class, 'showProduct'])->name('storefront.product.show');
Route::get('/{store_slug}', [StorefrontController::class, 'show'])->name('storefront.show');
