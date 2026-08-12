<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Services\HrSkillsPayService;
use App\Services\OrderInvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    protected HrSkillsPayService $hrSkillsPay;
    protected OrderInvoiceService $invoiceService;

    public function __construct(HrSkillsPayService $hrSkillsPay, OrderInvoiceService $invoiceService)
    {
        $this->hrSkillsPay = $hrSkillsPay;
        $this->invoiceService = $invoiceService;
    }

    public function lookupCustomer(Request $request): JsonResponse
    {
        $phone = trim($request->query('phone', ''));

        if (empty($phone) || strlen(preg_replace('/[^0-9]/', '', $phone)) < 6) {
            return response()->json(['found' => false]);
        }

        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);

        $customer = Customer::where('phone', $phone)
            ->orWhereRaw("REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') LIKE ?", ["%{$cleanPhone}%"])
            ->first();

        if (!$customer) {
            return response()->json(['found' => false]);
        }

        return response()->json([
            'found' => true,
            'customer' => [
                'name' => $customer->name,
                'phone' => $customer->phone,
                'email' => $customer->email,
                'whatsapp' => $customer->whatsapp,
                'delivery_address' => $customer->delivery_address,
                'city' => $customer->city,
            ]
        ]);
    }

    public function checkStatus(Request $request, string $reference): JsonResponse
    {
        $order = Order::where('hrskills_reference', $reference)
            ->orWhere('tracking_code', $reference)
            ->first();

        if (!$order) {
            return response()->json(['status' => 'NOT_FOUND', 'paid' => false], 404);
        }

        if ($order->payment_status === 'paid' || $order->status === 'paid') {
            return response()->json([
                'status' => 'SUCCESS',
                'paid' => true,
                'tracking_code' => $order->tracking_code,
                'redirect_url' => route('order.track', $order->tracking_code),
            ]);
        }

        if ($order->payment_status === 'failed' || $order->status === 'cancelled') {
            return response()->json([
                'status' => 'FAILED',
                'paid' => false,
                'message' => 'Le paiement Mobile Money a échoué ou a été annulé.',
            ]);
        }

        // Live Poll HR-Skills Pay API for update
        try {
            $liveData = $this->hrSkillsPay->checkPaymentStatus($reference);
            $liveStatus = strtoupper($liveData['status'] ?? 'PENDING');

            if ($liveStatus === 'SUCCESS') {
                if ($order->payment_status !== 'paid') {
                    $order->update([
                        'status' => 'paid',
                        'payment_status' => 'paid',
                        'paid_at' => now(),
                    ]);

                    // Credit vendor Wallet
                    $wallet = $order->store->wallet;
                    if ($wallet) {
                        $wallet->increment('balance_available', (float) $order->price_vendor);
                    }

                    // Generate & Send PDF Invoice Emails to Vendor & Customer
                    $this->invoiceService->sendOrderInvoiceEmails($order);
                }

                return response()->json([
                    'status' => 'SUCCESS',
                    'paid' => true,
                    'tracking_code' => $order->tracking_code,
                    'redirect_url' => route('order.track', $order->tracking_code),
                ]);
            }

            if ($liveStatus === 'FAILED') {
                $order->update([
                    'status' => 'cancelled',
                    'payment_status' => 'failed',
                ]);
                return response()->json([
                    'status' => 'FAILED',
                    'paid' => false,
                    'message' => 'Paiement décliné par l\'opérateur Mobile Money.',
                ]);
            }
        } catch (\Exception $e) {
            Log::warning('Error polling HR-Skills Pay status', ['ref' => $reference, 'err' => $e->getMessage()]);
        }

        return response()->json([
            'status' => 'PENDING',
            'paid' => false,
        ]);
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

        // Strictly validate & format Cameroon phone number
        try {
            $formattedPhone = $this->hrSkillsPay->formatCameroonPhone($validated['customer_phone']);
        } catch (\InvalidArgumentException $e) {
            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return response()->json(['error' => $e->getMessage()], 422);
            }
            return back()->withErrors(['customer_phone' => $e->getMessage()]);
        }

        $store = Store::findOrFail($validated['store_id']);

        // Determine items
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
                ->firstOrFail();

            $variant = null;
            if (!empty($item['variant_id'])) {
                $variant = ProductVariant::where('product_id', $product->id)
                    ->where('id', $item['variant_id'])
                    ->first();
            }

            $minQ = $product->min_order_quantity || 1;
            $quantity = max((int)$item['quantity'], $minQ);

            $currentPv = ($product->is_promo && $product->promo_price > 0) 
                ? (float) $product->promo_price 
                : (float) $product->price_vendor;

            // 1. BIOLINKO Net Margin (3% net, min 3 FCFA)
            $unitSaasMargin = max(3, (float) ceil($currentPv * 0.03));

            // 2. Mobile Money Gateway API Fee (2% deducted by HR-Skills Pay)
            $subtotalWithMargin = $currentPv + $unitSaasMargin;
            $unitTotalClient = (float) ceil($subtotalWithMargin / 0.98);
            $unitApiFee = $unitTotalClient - $subtotalWithMargin;

            $itemVendorPrice = $currentPv * $quantity;
            $itemSaasMargin = $unitSaasMargin * $quantity;
            $itemApiFee = $unitApiFee * $quantity;
            $itemTotalClient = $unitTotalClient * $quantity;

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
        $customer->city = $validated['delivery_address'];
        $customer->save();

        // 2. LINK CUSTOMER TO STORE
        $existingPivot = $store->customers()->where('customer_id', $customer->id)->first();
        if ($existingPivot) {
            $store->customers()->updateExistingPivot($customer->id, [
                'total_orders_count' => $existingPivot->pivot->total_orders_count + 1,
                'total_spent' => (float)$existingPivot->pivot->total_spent + $totalClient,
                'last_order_at' => now(),
            ]);
        } else {
            $store->customers()->attach($customer->id, [
                'total_orders_count' => 1,
                'total_spent' => $totalClient,
                'last_order_at' => now(),
            ]);
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
            'customer_id' => $customer->id,
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $formattedPhone,
            'customer_email' => $validated['customer_email'] ?? null,
            'city' => $validated['delivery_address'],
            'address_details' => $addressWithNotes,
            'price_vendor' => $priceVendorTotal,
            'saas_margin' => $saasMarginTotal,
            'api_fee' => $apiFeeTotal,
            'total_client' => $totalClient,
            'status' => 'pending',
            'payment_status' => 'pending',
            'payment_phone' => $formattedPhone,
        ]);

        foreach ($preparedOrderItems as $itemData) {
            $order->items()->create($itemData);
        }

        // INITIATE HR-SKILLS PAY CASH-IN (MOBILE MONEY USSD PUSH)
        try {
            $operatorChoice = $validated['operator'] ?? null;
            $payinData = $this->hrSkillsPay->initiatePayin($order, $formattedPhone, $operatorChoice);

            $order->update([
                'hrskills_reference' => $payinData['reference'],
                'hrskills_transaction_id' => $payinData['transaction_id'],
                'payment_operator' => $payinData['operator'],
            ]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'success' => true,
                    'requires_ussd' => true,
                    'reference' => $payinData['reference'],
                    'tracking_code' => $trackingCode,
                    'amount' => $payinData['amount'],
                    'operator' => $payinData['operator'],
                    'phone' => $formattedPhone,
                    'redirect_url' => route('order.track', $trackingCode),
                ]);
            }

            return redirect()->route('order.track', $trackingCode)->with('message', 'Paiement USSD initié ! Veuillez valider le code PIN sur votre téléphone.');

        } catch (\Exception $e) {
            Log::error('Checkout HR-Skills Payin Error', ['order_id' => $order->id, 'err' => $e->getMessage()]);

            if ($request->wantsJson() || $request->header('X-Inertia')) {
                return response()->json([
                    'success' => false,
                    'error' => 'Échec d\'initiation du paiement Mobile Money: ' . $e->getMessage(),
                ], 422);
            }

            return back()->withErrors(['customer_phone' => 'Échec du paiement MoMo : ' . $e->getMessage()]);
        }
    }
}
