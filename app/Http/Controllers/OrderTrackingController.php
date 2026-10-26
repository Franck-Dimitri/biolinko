<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderReport;
use App\Services\WhatsappGatewayService;
use Illuminate\Http\RedirectResponse;
use App\Payments\OrderPayments;
use App\Payments\PaymentException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackingController extends Controller
{
    public function show(string $tracking_code): Response
    {
        $order = Order::where('tracking_code', $tracking_code)
            ->with(['store', 'items.product', 'items.variant', 'report'])
            ->firstOrFail();

        return Inertia::render('OrderTracking/Show', [
            'order' => $order,
            'canReport' => $order->canBeReported() && ! $order->report,
            'reportReasons' => OrderReport::REASONS,
            'store' => $order->store->forPublic(),
        ]);
    }

    /**
     * Relance le paiement Mobile Money d'une commande encore en attente (lien reçu par WhatsApp, demande expirée…).
     */
    public function pay(Request $request, string $tracking_code, OrderPayments $orderPayments): JsonResponse
    {
        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:50'],
            'operator' => ['nullable', 'string', 'in:MTN,ORANGE,mtn,orange'],
        ]);

        $order = Order::where('tracking_code', $tracking_code)->with(['store.user', 'items.product'])->firstOrFail();

        if ($order->payment_status !== 'pending' || $order->status !== 'pending') {
            return response()->json(['error' => 'Cette commande ne peut plus être payée. Refaites-la depuis la boutique.'], 422);
        }
        if (! $order->store->is_published || $order->store->user?->is_banned) {
            return response()->json(['error' => 'Cette boutique n’accepte pas de paiement pour le moment.'], 422);
        }
        foreach ($order->items as $item) {
            if ($item->product && $item->product->stock < $item->quantity) {
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
}
