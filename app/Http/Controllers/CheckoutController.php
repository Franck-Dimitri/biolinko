<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\SmartLink;
use App\Models\Store;
use App\Payments\Countries;
use App\Payments\OrderPayments;
use App\Payments\PaymentException;
use App\Services\OrderInvoiceService;
use App\Services\WhatsappGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    protected OrderPayments $orderPayments;
    protected OrderInvoiceService $invoiceService;
    protected WhatsappGatewayService $whatsappService;

    public function __construct(
        OrderPayments $orderPayments,
        OrderInvoiceService $invoiceService,
        WhatsappGatewayService $whatsappService
    ) {
        $this->orderPayments = $orderPayments;
        $this->invoiceService = $invoiceService;
        $this->whatsappService = $whatsappService;
    }


    public function lookupCustomer(Request $request): JsonResponse
    {
        // Pré-remplissage limité à un client qui a déjà commandé dans CETTE boutique, avec le numéro exact :
        // une recherche large exposait les coordonnées de n'importe quel client de la plateforme.
        try {
            $formatted = Countries::formatPhone('CM', (string) $request->query('phone', ''));
        } catch (\InvalidArgumentException $e) {
            return response()->json(['found' => false]);
        }

        $storeId = (int) $request->query('store_id');
        $customer = $storeId
            ? Customer::where('phone', $formatted)->whereHas('stores', fn ($q) => $q->where('stores.id', $storeId))->first()
            : null;

        if (! $customer) {
            return response()->json(['found' => false]);
        }

        return response()->json([
            'found' => true,
            'customer' => [
                'name' => $customer->name,
                'delivery_address' => $customer->delivery_address,
                'city' => $customer->city,
            ],
        ]);
    }

    public function checkStatus(Request $request, string $reference): JsonResponse
    {
        $order = Order::where('payment_reference', $reference)
            ->orWhere('tracking_code', $reference)
            ->first();

        if (! $order) {
            return response()->json(['status' => 'NOT_FOUND', 'paid' => false], 404);
        }

        $status = $this->orderPayments->refresh($order);

        if ($status === 'SUCCESS') {
            return response()->json([
                'status' => 'SUCCESS',
                'paid' => true,
                'tracking_code' => $order->tracking_code,
                'redirect_url' => route('order.track', $order->tracking_code),
            ]);
        }

        if ($status === 'FAILED') {
            return response()->json([
                'status' => 'FAILED',
                'paid' => false,
                'message' => 'Le paiement Mobile Money n’a pas abouti. Vous pouvez réessayer.',
            ]);
        }

        return response()->json(['status' => 'PENDING', 'paid' => false]);
    }

    public function process(Request $request)
    {
        $validated = $request->validate([
            'store_id' => ['required', 'exists:stores,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:255'],
            'customer_whatsapp' => ['nullable', 'string', 'max:50'],
            'delivery_address' => ['required', 'string', 'max:500'],
            'delivery_city' => ['nullable', 'string', 'max:120'],
            'smart_link_code' => ['nullable', 'string', 'exists:smart_links,code'],
            'notes' => ['nullable', 'string', 'max:500'],
            'operator' => ['nullable', 'string', 'in:MTN,ORANGE,mtn,orange'],
            
            // Single-item checkout
            'product_id' => ['nullable', 'exists:products,id'],
            'variant_id' => ['nullable', 'exists:product_variants,id'],
            'quantity' => ['nullable', 'integer', 'min:1'],

            // Multi-item Cart Checkout
            'items' => ['nullable', 'array'],
            'items.*.product_id' => ['required_with:items', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
        ]);

        $store = Store::with('user')->findOrFail($validated['store_id']);

        if (! $store->is_published || $store->user?->is_banned) {
            return response()->json(['error' => 'Cette boutique n’accepte pas de commandes pour le moment.'], 422);
        }

        // Numéro Mobile Money au format du pays de la boutique
        try {
            $formattedPhone = Countries::formatPhone($store->country ?: 'CM', $validated['customer_phone']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage(), 'errors' => ['customer_phone' => [$e->getMessage()]]], 422);
        }

        // Determine items
        // Pack (SmartLink) : les articles et le prix viennent du lien, pas du client
        $smartLink = null;
        if (!empty($validated['smart_link_code'])) {
            $smartLink = SmartLink::where('code', $validated['smart_link_code'])
                ->where('store_id', $store->id)
                ->first();

            if (!$smartLink || !$smartLink->isValid()) {
                return response()->json(['error' => 'Ce lien de commande est expiré ou n\'est plus disponible.'], 422);
            }

            $validated['items'] = collect($smartLink->items)->map(fn ($it) => [
                'product_id' => $it['product_id'],
                'variant_id' => null,
                'quantity' => $it['quantity'],
            ])->all();
        }

        $checkoutItems = [];
        if (!empty($validated['items']) && count($validated['items']) > 0) {
            $checkoutItems = $validated['items'];
        } elseif (!empty($validated['product_id'])) {
            $checkoutItems[] = [
                'product_id' => $validated['product_id'],
                'variant_id' => $validated['variant_id'] ?? null,
                'quantity' => $validated['quantity'] ?? 1,
            ];
        } else {
            return back()->withErrors(['product_id' => 'Aucun article sélectionné pour la commande.']);
        }

        $priceVendorTotal = 0;
        $saasMarginTotal = 0;
        $apiFeeTotal = 0;
        $totalClient = 0;

        $preparedOrderItems = [];

        foreach ($checkoutItems as $item) {
            $product = Product::where('store_id', $store->id)
                ->where('id', $item['product_id'])
                ->where('is_active', true)
                ->first();

            if (! $product) {
                return response()->json(['error' => 'Un article de votre panier n’est plus disponible.'], 422);
            }

            $variant = null;
            if (!empty($item['variant_id'])) {
                $variant = ProductVariant::where('product_id', $product->id)
                    ->where('id', $item['variant_id'])
                    ->first();
            }

            $minQ = $smartLink ? 1 : ($product->min_order_quantity ?: 1);
            $quantity = max((int)$item['quantity'], $minQ);

            // Stock Check Enforcement
            if ($product->stock <= 0) {
                $errMsg = "Désolé, le produit '{$product->title}' est actuellement en rupture de stock (Stock Épuisé).";
                if ($request->wantsJson() || $request->header('X-Inertia')) {
                    return response()->json(['error' => $errMsg], 422);
                }
                return back()->withErrors(['product_id' => $errMsg]);
            }

            if ($quantity > $product->stock) {
                $errMsg = "Désolé, il ne reste que {$product->stock} article(s) disponible(s) en stock pour '{$product->title}'.";
                if ($request->wantsJson() || $request->header('X-Inertia')) {
                    return response()->json(['error' => $errMsg], 422);
                }
                return back()->withErrors(['quantity' => $errMsg]);
            }

            if ($variant && $variant->stock_quantity !== null && $quantity > (int) $variant->stock_quantity) {
                $errMsg = "Il ne reste que {$variant->stock_quantity} article(s) pour cette option de '{$product->title}'.";
                if ($request->wantsJson() || $request->header('X-Inertia')) {
                    return response()->json(['error' => $errMsg], 422);
                }
                return back()->withErrors(['quantity' => $errMsg]);
            }

            $currentPv = ($product->is_promo && $product->promo_price > 0) 
                ? (float) $product->promo_price 
                : (float) $product->price_vendor;

            if ($variant && (float) $variant->price > 0) {
                $currentPv = (float) $variant->price;
            }

            // Frais de service payés par le client (config payments.client_fee_percent)
            $saasMarginUnit = Order::clientFee($currentPv);
            $tcUnit = $currentPv + $saasMarginUnit;

            $itemVendorPrice = $currentPv * $quantity;
            $itemSaasMargin = $saasMarginUnit * $quantity;
            $itemApiFee = 0;
            $itemTotalClient = $tcUnit * $quantity;

            $priceVendorTotal += $itemVendorPrice;
            $saasMarginTotal += $itemSaasMargin;
            $apiFeeTotal += $itemApiFee;
            $totalClient += $itemTotalClient;

            $variantLabel = $variant ? trim(($variant->size ? "Taille: {$variant->size} " : "") . ($variant->color ? "Couleur: {$variant->color}" : "")) : null;

            $preparedOrderItems[] = [
                'product_id' => $product->id,
                'variant_id' => $variant ? $variant->id : null,
                'product_title' => $product->title,
                'variant_label' => $variantLabel,
                'quantity' => $quantity,
                'unit_price_vendor' => $currentPv,
                'total_price_vendor' => $itemVendorPrice,
            ];
        }

        // Frais calculés sur le total, exactement comme le panier côté client
        $saasMarginTotal = Order::clientFee($priceVendorTotal);
        $totalClient = $priceVendorTotal + $saasMarginTotal;

        // Le pack a son propre prix (remise incluse) : on recalcule les totaux dessus
        if ($smartLink) {
            $priceVendorTotal = (float) $smartLink->total_amount;
            $saasMarginTotal = Order::clientFee($priceVendorTotal);
            $totalClient = $priceVendorTotal + $saasMarginTotal;
        }

        $city = trim($validated['delivery_city'] ?? '') ?: $validated['delivery_address'];

        // 1. SAVE OR UPDATE CUSTOMER
        $customer = Customer::firstOrNew(['phone' => $formattedPhone]);
        $customer->name = $validated['customer_name'];
        if (!empty($validated['customer_email'])) {
            $customer->email = $validated['customer_email'];
        }
        if (!empty($validated['customer_whatsapp'])) {
            $customer->whatsapp = $validated['customer_whatsapp'];
        }
        $customer->delivery_address = $validated['delivery_address'];
        $customer->city = $city;
        $customer->save();

        // 2. Rattache le client à la boutique (ses totaux sont mis à jour au paiement, voir Order::markAsPaid)
        if (! $store->customers()->where('customer_id', $customer->id)->exists()) {
            $store->customers()->attach($customer->id, ['total_orders_count' => 0, 'total_spent' => 0, 'last_order_at' => now()]);
        }

        $trackingCode = 'BLK-CMD-' . strtoupper(Str::random(10));

        $extraNotes = [];
        if (!empty($validated['customer_whatsapp'])) {
            $extraNotes[] = "WhatsApp: {$validated['customer_whatsapp']}";
        }
        if (!empty($validated['notes'])) {
            $extraNotes[] = "Note: {$validated['notes']}";
        }

        $addressWithNotes = $validated['delivery_address'] . (count($extraNotes) > 0 ? " (" . implode(" | ", $extraNotes) . ")" : "");

        // Create Order with PENDING status for Mobile Money USSD
        $order = Order::create([
            'uuid' => (string) Str::uuid(),
            'tracking_code' => $trackingCode,
            'store_id' => $store->id,
            'smart_link_id' => $smartLink?->id,
            'customer_id' => $customer->id,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $formattedPhone,
            'customer_email' => $validated['customer_email'] ?? null,
            'city' => $city,
            'address_details' => $addressWithNotes,
            'price_vendor' => $priceVendorTotal,
            'saas_margin' => $saasMarginTotal,
            'api_fee' => $apiFeeTotal,
            'total_client' => $totalClient,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_phone' => $formattedPhone,
            'currency' => $store->currency ?: 'XAF',
            'payment_country' => $store->country ?: 'CM',
        ]);

        foreach ($preparedOrderItems as $itemData) {
            $order->items()->create($itemData);
        }


        // Notify Customer & Vendor via WhatsApp that order has been initiated
        try {
            $this->whatsappService->notifyOrderPlaced($order);
        } catch (\Exception $e) {
            Log::warning('WhatsApp notifyOrderPlaced failed', ['order_id' => $order->id, 'err' => $e->getMessage()]);
        }


        // Demande de paiement Mobile Money sur le téléphone du client (agrégateur configuré)
        try {
            $payment = $this->orderPayments->start($order, $formattedPhone, $validated['operator'] ?? null);
        } catch (PaymentException|\InvalidArgumentException $e) {
            Log::warning('Checkout payment start failed', ['order_id' => $order->id, 'err' => $e->getMessage()]);
            $order->update(['status' => 'cancelled', 'payment_status' => 'failed']);

            return response()->json(['success' => false, 'error' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            report($e);
            $order->update(['status' => 'cancelled', 'payment_status' => 'failed']);

            return response()->json(['success' => false, 'error' => 'La demande de paiement n’a pas pu être envoyée. Réessayez dans un instant.'], 422);
        }

        return response()->json(['success' => true, 'requires_ussd' => true] + $payment);
    }
}
