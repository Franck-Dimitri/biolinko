<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SmartLink;

use App\Services\HrSkillsPayService;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

use Inertia\Inertia;
use Inertia\Response;

class SmartLinkController extends Controller
{
    protected HrSkillsPayService $hrSkillsPay;

    public function __construct(HrSkillsPayService $hrSkillsPay)
    {
        $this->hrSkillsPay = $hrSkillsPay;
    }

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
        ]);
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
            'store' => $smartLink->store,
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
     */
    public function processPublicCheckout(Request $request, string $code)
    {
        $smartLink = SmartLink::where('code', $code)->firstOrFail();

        if (!$smartLink->isValid()) {
            return response()->json([
                'status' => 'ERROR',
                'message' => 'Ce lien de commande est expiré ou n\'est plus disponible.',
            ], 422);
        }

        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:35',
            'customer_email' => 'nullable|email|max:255',
            'customer_city' => 'required|string|max:255',
            'customer_address' => 'required|string|max:500',
            'operator' => 'required|in:MTN,ORANGE',
        ]);

        $trackingCode = 'BLK-' . strtoupper(Str::random(6));
        $totalAmount = (float) $smartLink->total_amount;

        // Initiate HR-Skills Pay USSD Cash-In
        $payResult = $this->hrSkillsPay->initiatePayment([
            'amount' => $totalAmount,
            'phone' => $validated['customer_phone'],
            'operator' => $validated['operator'],
            'reference' => 'smart_' . $trackingCode,
            'description' => "Achat Pack {$smartLink->title} ({$smartLink->store->name})",
        ]);

        if (empty($payResult['success'])) {
            return response()->json([
                'status' => 'PAYMENT_FAILED',
                'message' => $payResult['message'] ?? 'Échec de l\'initialisation du paiement Mobile Money.',
            ], 400);
        }

        // Create Order Record
        $order = Order::create([
            'store_id' => $smartLink->store_id,
            'tracking_code' => $trackingCode,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'],
            'customer_email' => $validated['customer_email'] ?? null,
            'customer_city' => $validated['customer_city'],
            'customer_address' => $validated['customer_address'],
            'total_client' => $totalAmount,
            'price_vendor' => $totalAmount,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => $validated['operator'],
            'payment_reference' => $payResult['reference'] ?? 'smart_' . $trackingCode,
            'hrskills_reference' => $payResult['reference'] ?? 'smart_' . $trackingCode,
        ]);

        // Create Order Items
        foreach ($smartLink->items as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'] ?? null,
                'product_name' => $item['product_name'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'line_total' => $item['line_total'],
            ]);
        }

        // Increment SmartLink sales count
        $smartLink->increment('sales_count');

        return response()->json([
            'status' => 'SUCCESS',
            'message' => 'Demande USSD envoyée avec succès !',
            'reference' => $payResult['reference'] ?? 'smart_' . $trackingCode,
            'tracking_code' => $order->tracking_code,
            'redirect_url' => route('order.track', $order->tracking_code),
        ]);
    }
}
