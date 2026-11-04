<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;

use App\Models\Order;
use App\Models\Subscription;
use App\Models\Withdrawal;
use App\Payments\Orders\OrderPayments;
use App\Payments\PaymentManager;
use App\Payments\Subscriptions\SubscriptionPayments;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Notifications pawaPay (dépôts, virements, remboursements).
 * Le contenu n'est jamais cru tel quel : on redemande le statut à pawaPay avant d'agir,
 * donc une notification forgée ne peut rien valider.
 */
class PawapayWebhookController extends Controller
{
    public function deposits(Request $request, OrderPayments $orders, SubscriptionPayments $subscriptions): JsonResponse
    {
        $id = (string) $request->input('depositId');
        if (! preg_match('/^[0-9a-f-]{36}$/i', $id)) {
            return response()->json(['status' => 'ignored'], 200);
        }

        if ($order = Order::where('payment_reference', $id)->where('payment_provider', 'pawapay')->first()) {
            $orders->refresh($order);
        } elseif ($subscription = Subscription::where('payment_reference', $id)->where('payment_provider', 'pawapay')->first()) {
            $subscriptions->refresh($subscription);
        } else {
            Log::info('pawaPay deposit callback for unknown reference', ['depositId' => $id]);
        }

        return response()->json(['status' => 'ok'], 200);
    }

    public function payouts(Request $request, PaymentManager $payments): JsonResponse
    {
        $id = (string) $request->input('payoutId');
        $withdrawal = preg_match('/^[0-9a-f-]{36}$/i', $id)
            ? Withdrawal::where('payment_reference', $id)->where('payment_provider', 'pawapay')->first()
            : null;

        // Retrait vendeur ou remboursement client (les deux sont des virements)
        $operation = $withdrawal ?? (preg_match('/^[0-9a-f-]{36}$/i', $id)
            ? \App\Models\Refund::where('payment_reference', $id)->where('payment_provider', 'pawapay')->first()
            : null);

        if ($operation) {
            $status = $payments->driver('pawapay')->payoutStatus($id);
            if ($status['status'] !== 'PENDING') {
                $operation->settle($status['status'] === 'SUCCESS', $status['transaction_id'] ?? null);
            }
        }

        return response()->json(['status' => 'ok'], 200);
    }

    /** Pas encore de remboursement depuis Biolinko : la notification est seulement journalisée. */
    public function refunds(Request $request): JsonResponse
    {
        Log::info('pawaPay refund callback', ['refundId' => $request->input('refundId'), 'status' => $request->input('status')]);

        return response()->json(['status' => 'ok'], 200);
    }
}
