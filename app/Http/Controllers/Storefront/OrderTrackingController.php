<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderReport;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\RecurringBasket;
use App\Payments\Countries;
use App\Payments\Orders\OrderPayments;
use App\Payments\PaymentException;
use App\Services\Sales\OrderAddons;
use App\Services\Sales\OrderInvoiceService;
use App\Services\Whatsapp\WhatsappGatewayService;
use App\Support\StoreUrl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackingController extends Controller
{
    public function show(string $tracking_code, OrderAddons $addons): Response
    {
        $order = Order::where('tracking_code', $tracking_code)
            ->with(['store', 'items.product', 'items.variant', 'report', 'parent:id,tracking_code', 'recurringBasket'])
            ->firstOrFail();

        return Inertia::render('OrderTracking/Show', [
            'order' => $order,
            // Ajouts après paiement : ceux déjà faits (payés ou en attente) et les articles proposés
            'addons' => $order->addons()->with('items.product')
                ->where(fn ($q) => $q->where('payment_status', 'paid')->orWhere(fn ($q) => $q->where('payment_status', 'pending')->where('created_at', '>', now()->subDay())))
                ->latest()->get()
                ->map(fn (Order $a) => [
                    'tracking_code' => $a->tracking_code, 'paid' => $a->payment_status === 'paid', 'total' => (float) $a->total_client,
                    'items' => $a->items->map(fn ($i) => ['title' => $i->product_title, 'variant' => $i->variant_label, 'quantity' => $i->quantity, 'image' => $i->product?->image_url]),
                    'payment_url' => $a->payment_status === 'paid' ? null : StoreUrl::payment($a),
                ]),
            'addonOffers' => $addons->offers($order),
            // Panier de la semaine : le client peut l'arrêter depuis n'importe laquelle de ses commandes
            'basket' => $order->recurringBasket ? [
                'active' => $order->recurringBasket->active || ! $order->recurringBasket->stopped_reason,
                'token' => $order->recurringBasket->token,
            ] : null,
            'canReport' => $order->canBeReported() && ! $order->report,
            'canPay' => $order->isRecoverable(),
            'canConfirmReceipt' => $order->canConfirmReceipt(),
            'protection' => ['after_delivery_days' => Order::RELEASE_AFTER_DELIVERY_DAYS, 'max_days' => Order::MAX_HOLD_DAYS],
            'reportReasons' => OrderReport::REASONS,
            'store' => $order->store->forPublic(),
        ]);
    }

    /**
     * Page de paiement Biolinko : récapitulatif à gauche, moyen de paiement et numéro à droite.
     * Le client ne quitte jamais Biolinko : la demande part directement sur son téléphone.
     */
    public function payment(string $tracking_code)
    {
        $order = Order::where('tracking_code', $tracking_code)->with(['store.user', 'items.product', 'parent.report'])->firstOrFail();

        // Un ajout se paie tant que la commande d'origine n'est pas partie ; on revient ensuite sur son suivi
        $trackOrder = $order->parent ?? $order;
        if ($order->payment_status === 'paid' || ! $order->isRecoverable() || ($order->parent && ! $order->parent->canTakeAddons())) {
            return redirect()->to(StoreUrl::track($trackOrder));
        }

        $country = $order->payment_country ?: 'CM';
        $c = Countries::get($country);

        return Inertia::render('Payment/Show', [
            'order' => $order->only(['tracking_code', 'customer_name', 'customer_email', 'customer_whatsapp', 'payment_phone', 'customer_phone', 'subtotal', 'discount_amount',
                'delivery_fee', 'saas_margin', 'total_client', 'balance_due', 'price_vendor', 'promo_code', 'desired_date', 'desired_slot', 'currency']),
            'items' => $order->items->map(fn ($i) => [
                'title' => $i->product_title, 'variant' => $i->variant_label, 'quantity' => $i->quantity, 'total' => (float) $i->total_price_vendor,
                'image' => $i->product?->image_url ?: ($i->product?->images[0] ?? null), 'customizations' => $i->customizations ?? [],
            ]),
            'store' => $order->store->forPublic(),
            'country' => ['code' => $country, 'dial' => $c['dial'], 'operators' => array_keys($c['operators']), 'prefixes' => $c['prefixes'] ?? []],
            'trackUrl' => StoreUrl::track($trackOrder),
            'addonOf' => $order->parent?->tracking_code,
            'storeHome' => StoreUrl::home($order->store),
        ]);
    }

    /** Le client arrête son panier de la semaine. */
    public function stopBasket(string $token): RedirectResponse
    {
        $basket = RecurringBasket::where('token', $token)->firstOrFail();
        $basket->update(['active' => false, 'stopped_reason' => 'customer']);

        return back()->with('success', 'C’est noté : vous ne recevrez plus ce panier chaque semaine.');
    }

    /**
     * Ajout après paiement : crée la petite commande liée puis envoie le client sur la page de paiement.
     */
    public function addon(Request $request, string $tracking_code, OrderAddons $addons): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer'],
            'variant_id' => ['nullable', 'integer'],
            'quantity' => ['required', 'integer', 'min:1', 'max:'.OrderAddons::MAX_QUANTITY],
        ]);

        $order = Order::where('tracking_code', $tracking_code)->with(['items', 'report'])->firstOrFail();
        $product = Product::where('store_id', $order->store_id)->find($validated['product_id']);
        if (! $product) {
            return response()->json(['error' => 'Cet article n’est plus disponible.'], 422);
        }
        $variant = null;
        if (! empty($validated['variant_id'])) {
            $variant = ProductVariant::where('product_id', $product->id)->find($validated['variant_id']);
            if (! $variant) {
                return response()->json(['error' => 'Cette option n’est plus disponible.'], 422);
            }
        } elseif ($product->variants()->exists()) {
            return response()->json(['error' => 'Choisissez une option.'], 422);
        }

        [$addon, $error] = $addons->create($order, $product, $variant, (int) $validated['quantity']);
        if ($error) {
            return response()->json(['error' => $error], 422);
        }

        return response()->json(['success' => true, 'payment_url' => StoreUrl::payment($addon)]);
    }

    /**
     * Relance le paiement Mobile Money d'une commande encore en attente (lien reçu par WhatsApp, demande expirée…).
     */
    public function pay(Request $request, string $tracking_code, OrderPayments $orderPayments): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:50'],
            'operator' => ['nullable', 'string', 'in:MTN,ORANGE,mtn,orange'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        $order = Order::where('tracking_code', $tracking_code)->with(['store.user', 'items.product'])->firstOrFail();
        if (! empty($validated['email'])) {
            $order->update(['customer_email' => $validated['email']]);
        }

        if (! $order->isRecoverable()) {
            return response()->json(['error' => 'Cette commande ne peut plus être payée. Refaites-la depuis la boutique.'], 422);
        }
        if ($order->parent_order_id && ! $order->parent?->canTakeAddons()) {
            return response()->json(['error' => 'Votre commande est déjà en route : cet ajout ne peut plus partir avec elle.'], 422);
        }
        // Paiement précédent échoué ou expiré : la commande redevient payable (relance du vendeur)
        if ($order->payment_status === 'failed') {
            Order::whereKey($order->id)->update(['status' => 'pending', 'payment_status' => 'pending']);
            $order->refresh();
        }
        if (! $order->store->is_published || $order->store->user?->is_banned) {
            return response()->json(['error' => 'Cette boutique n’accepte pas de paiement pour le moment.'], 422);
        }
        foreach ($order->items as $item) {
            if ($item->product && ! $item->product->isMadeToOrder() && $item->product->stock < $item->quantity) {
                return response()->json(['error' => "« {$item->product_title} » n’est plus disponible en quantité suffisante."], 422);
            }
        }

        // Demande précédente : déjà payée, ou encore en attente de validation sur le téléphone
        if ($order->payment_reference) {
            $previous = $orderPayments->refresh($order);
            if ($previous === 'SUCCESS') {
                return response()->json(['error' => 'Cette commande est déjà payée.', 'paid' => true], 422);
            }
            if ($previous === 'PENDING' && $order->updated_at->gt(now()->subMinutes(3))) {
                return response()->json(['error' => 'Une demande de paiement est déjà en cours sur votre téléphone. Validez-la ou patientez 3 minutes avant d’en relancer une.'], 422);
            }
            if ($previous === 'FAILED') {
                // La demande précédente a échoué : la commande reste payable
                Order::whereKey($order->id)->update(['status' => 'pending', 'payment_status' => 'pending']);
                $order->refresh();
            }
        }

        try {
            $payment = $orderPayments->start($order, $validated['phone'] ?? $order->payment_phone ?? $order->customer_phone, $validated['operator'] ?? $order->payment_operator);
        } catch (PaymentException|\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            Log::error('Order retry payment failed', ['order_id' => $order->id, 'err' => $e->getMessage()]);

            return response()->json(['error' => 'La demande de paiement n’a pas pu être envoyée. Réessayez dans un instant.'], 422);
        }

        return response()->json(['success' => true] + $payment);
    }

    /**
     * Le client signale un problème pendant le délai de sécurité : seule cette vente est gelée,
     * le vendeur est prévenu et reçoit le numéro du client pour trouver une solution avec lui.
     */
    public function report(Request $request, string $tracking_code, WhatsappGatewayService $whatsapp): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'in:'.implode(',', array_keys(OrderReport::REASONS))],
            'message' => ['required', 'string', 'min:10', 'max:1000'],
        ], ['message.min' => 'Décrivez le problème en quelques mots (10 caractères minimum).']);

        $order = Order::where('tracking_code', $tracking_code)->with(['store.user', 'report'])->firstOrFail();

        if ($order->report || ! $order->canBeReported()) {
            return back()->withErrors(['message' => 'Le délai pour signaler un problème sur cette commande est passé.']);
        }

        $report = $order->report()->create([
            'store_id' => $order->store_id,
            'customer_phone' => $order->customer_phone,
            'reason' => $validated['reason'],
            'message' => $validated['message'],
        ]);

        try {
            $whatsapp->notifyOrderReported($order, $report);
        } catch (\Throwable $e) {
            Log::warning('notifyOrderReported failed', ['order_id' => $order->id, 'err' => $e->getMessage()]);
        }

        return back()->with('success', 'Votre signalement a été envoyé à la boutique, qui va vous contacter.');
    }

    /** Le client confirme avoir bien reçu sa commande : l'argent de la vente est libéré pour le vendeur. */
    public function confirmReceipt(string $tracking_code): RedirectResponse
    {
        $order = Order::where('tracking_code', $tracking_code)->with('report')->firstOrFail();

        if (! $order->confirmReceipt()) {
            return back()->withErrors(['receipt' => 'Cette commande ne peut pas être confirmée.']);
        }

        return back()->with('success', 'Merci ! La réception de votre commande est confirmée.');
    }

    /** Le client indique que tout est réglé : l'argent de la vente est libéré pour le vendeur. */
    public function resolve(string $tracking_code): RedirectResponse
    {
        $order = Order::where('tracking_code', $tracking_code)->with('report')->firstOrFail();

        if (! $order->report || ! $order->report->isOpen()) {
            return back();
        }

        $order->report->update(['status' => 'resolved', 'closed_at' => now()]);
        $order->releaseFunds();

        return back()->with('success', 'Merci ! Le problème est marqué comme résolu.');
    }

    /**
     * Facture PDF de la commande pour le client (même document que celle du vendeur).
     * Le numéro de suivi sert de clé d'accès, comme pour la page de suivi. Une facture n'existe qu'une fois la commande payée.
     */
    public function invoice(string $tracking_code, OrderInvoiceService $invoices)
    {
        $order = Order::where('tracking_code', $tracking_code)->with(['store', 'items'])->firstOrFail();
        abort_unless($order->invoice_number, 404, 'La facture sera disponible une fois la commande payée.');

        return response($invoices->generateInvoicePdf($order), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="Facture_'.$order->invoice_number.'.pdf"',
            'X-Robots-Tag' => 'noindex, nofollow',
        ]);
    }
}
