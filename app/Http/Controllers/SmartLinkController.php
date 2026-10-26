<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\SmartLink;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

use Inertia\Inertia;
use Inertia\Response;

class SmartLinkController extends Controller
{

    /**
     * Seller SmartLinks dashboard page.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store) {
            return Inertia::render('Seller/SmartLinks/Index', [
                'smartLinks' => [],
                'products' => [],
                'stats' => [
                    'total_links' => 0,
                    'total_sales' => 0,
                    'total_revenue' => 0,
                ],
            ]);
        }

        $smartLinks = SmartLink::where('store_id', $store->id)
            ->latest()
            ->get();

        $products = Product::where('store_id', $store->id)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->title,
                    'price' => (float) ($p->is_promo && $p->promo_price ? $p->promo_price : $p->price_vendor),
                    'original_price' => (float) $p->price_vendor,
                    'image_url' => $p->image_url,
                ];
            });

        $stats = [
            'total_links' => $smartLinks->count(),
            'total_sales' => $smartLinks->sum('sales_count'),
            'total_revenue' => (float) $smartLinks->sum(function ($sl) {
                return $sl->sales_count * $sl->total_amount;
            }),
        ];

        $topSmartLinks = SmartLink::where('store_id', $store->id)
            ->orderByDesc('sales_count')
            ->take(5)
            ->get();

        return Inertia::render('Seller/SmartLinks/Index', [
            'smartLinks' => $smartLinks,
            'topSmartLinks' => $topSmartLinks,
            'products' => $products,
            'stats' => $stats,
            'maxActiveLinks' => $user->planLimit('smartlinks'),
        ]);
    }

    /**
     * Nombre de liens actifs autorisé par le plan atteint ? (null = illimité)
     */
    private function activeLinksLimitReached($user, $store): ?string
    {
        $max = $user->planLimit('smartlinks');
        if ($max !== null && SmartLink::where('store_id', $store->id)->where('is_active', true)->count() >= $max) {
            return "Votre plan permet {$max} liens de paiement actifs. Désactivez-en un ou passez au plan supérieur.";
        }

        return null;
    }

    /**
     * Create a new SmartLink.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store) {
            return back()->with('error', 'Boutique introuvable.');
        }

        if ($limit = $this->activeLinksLimitReached($user, $store)) {
            return back()->withErrors(['title' => $limit])->with('error', $limit);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'discount_type' => 'nullable|in:fixed,percent',
            'discount_value' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date|after:now',
        ]);

        // Process Items & Calculate Subtotal
        $subtotal = 0.00;
        $processedItems = [];

        foreach ($validated['items'] as $itemData) {
            $product = Product::where('store_id', $store->id)->find($itemData['product_id']);
            if (!$product) {
                continue;
            }

            $qty = (int) $itemData['quantity'];
            $unitPrice = (float) ($product->is_promo && $product->promo_price ? $product->promo_price : $product->price_vendor);
            $lineSubtotal = $unitPrice * $qty;
            $subtotal += $lineSubtotal;

            $processedItems[] = [
                'product_id' => $product->id,
                'product_name' => $product->title,
                'image_url' => $product->image_url,
                'unit_price' => $unitPrice,
                'quantity' => $qty,
                'line_total' => $lineSubtotal,
            ];
        }

        if (empty($processedItems)) {
            return back()->with('error', 'Veuillez sélectionner au moins un produit valide.');
        }

        // Calculate Discount and Total Amount (Discount is optional)
        $discountType = $validated['discount_type'] ?? 'fixed';
        $discountValue = (float) ($validated['discount_value'] ?? 0);
        if ($discountType === 'percent' && $discountValue > 0) {
            $discountAmount = $subtotal * (min(100, $discountValue) / 100);
        } elseif ($discountValue > 0) {
            $discountAmount = min($subtotal, $discountValue);
        } else {
            $discountAmount = 0.00;
        }

        $totalAmount = max(0, $subtotal - $discountAmount);

        // Generate Unique Code
        $code = 'sl_' . Str::random(8);

        SmartLink::create([
            'store_id' => $store->id,
            'title' => $validated['title'],
            'code' => $code,
            'discount_type' => $discountType,
            'discount_value' => $discountValue,
            'subtotal_amount' => $subtotal,
            'total_amount' => $totalAmount,
            'items' => $processedItems,
            'max_uses' => $validated['max_uses'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'is_active' => true,
        ]);

        return redirect()->route('seller.smartlinks.index')
            ->with('success', 'SmartLink créé avec succès !');
    }

    /**
     * Toggle active state of a SmartLink.
     */
    public function toggleActive(SmartLink $smartLink)
    {
        $user = Auth::user();
        if ($smartLink->store_id !== $user->store->id) {
            abort(403);
        }

        if (! $smartLink->is_active && ($limit = $this->activeLinksLimitReached($user, $user->store))) {
            return back()->with('error', $limit);
        }

        $smartLink->update([
            'is_active' => !$smartLink->is_active,
        ]);

        return back()->with('success', 'Statut du SmartLink mis à jour.');
    }

    /**
     * Delete a SmartLink.
     */
    public function destroy(SmartLink $smartLink)
    {
        $user = Auth::user();
        if ($smartLink->store_id !== $user->store->id) {
            abort(403);
        }

        $smartLink->delete();

        return redirect()->route('seller.smartlinks.index')
            ->with('success', 'SmartLink supprimé avec succès.');
    }

    /**
     * Public Fast Checkout Page for a SmartLink.
     */
    public function showPublic(string $code): Response
    {
        $smartLink = SmartLink::with(['store.user'])
            ->where('code', $code)
            ->firstOrFail();

        // Increment Views
        $smartLink->increment('views_count');

        $isValid = $smartLink->isValid();

        return Inertia::render('SmartLink/Show', [
            'smartLink' => $smartLink,
            'store' => $smartLink->store->forPublic(),
            'isValid' => $isValid,
        ]);
    }

    /**
     * Public Fast Checkout Page for a SmartLink via Store Slug.
     */
    public function showPublicByStore(string $store_slug, string $code): Response
    {
        return $this->showPublic($code);
    }

    /**
     * Process Public Mobile Money Checkout for a SmartLink.
     * Délègue au tunnel unique (CheckoutController) pour avoir les mêmes règles partout.
     */
    public function processPublicCheckout(Request $request, string $code)
    {
        $smartLink = SmartLink::where('code', $code)->firstOrFail();

        $request->merge([
            'store_id' => $smartLink->store_id,
            'smart_link_code' => $smartLink->code,
        ]);

        return app(CheckoutController::class)->process($request);
    }
}
