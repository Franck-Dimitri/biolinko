<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Refund;
use App\Models\Subscription;
use App\Models\Withdrawal;
use App\Payments\OrderPayments;
use App\Payments\PaymentManager;
use App\Payments\SubscriptionPayments;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Webhooks Mercy Pay : signature HMAC-SHA256 (X-MercyPay-Signature) vérifiée sur le corps brut,
 * puis statut redemandé à Mercy Pay avant d'agir. Chaque événement n'est traité qu'une fois.
 */
class MercyPayWebhookController extends Controller
{
    public function handle(Request $request, OrderPayments $orders, SubscriptionPayments $subscriptions, PaymentManager $payments): JsonResponse
    {
        $secret = config('payments.mercypay.webhook_secret');
        $received = (string) $request->header('X-MercyPay-Signature');

        if (! $secret || ! hash_equals(hash_hmac('sha256', $request->getContent(), $secret), $received)) {
            Log::warning('Mercy Pay webhook: signature invalide');

            return response()->json(['error' => 'INVALID_SIGNATURE'], 401);
        }

        $eventId = (string) $request->input('id');
        if ($eventId && ! Cache::add('mercypay_evt_'.$eventId, true, now()->addDays(3))) {
            return response()->json(['status' => 'duplicate']);
        }

        $type = (string) $request->input('type');
        $uuid = (string) $request->input('data.uuid');

        if (str_starts_with($type, 'payment.')) {
            if ($order = Order::where('payment_reference', $uuid)->where('payment_provider', 'mercypay')->first()) {
                $orders->refresh($order);
            } elseif ($subscription = Subscription::where('payment_reference', $uuid)->where('payment_provider', 'mercypay')->first()) {
                $subscriptions->refresh($subscription);
            }
        } elseif (str_starts_with($type, 'payout.')) {
            if ($withdrawal = Withdrawal::where('payment_reference', $uuid)->where('payment_provider', 'mercypay')->first()) {
                $status = $payments->driver('mercypay')->payoutStatus($uuid);
                if ($status['status'] !== 'PENDING') {
                    $withdrawal->settle($status['status'] === 'SUCCESS', $status['transaction_id'] ?? null);
                }
            } elseif ($refund = Refund::where('payment_reference', $uuid)->where('payment_provider', 'mercypay')->first()) {
                $status = $payments->driver('mercypay')->payoutStatus($uuid);
                if ($status['status'] !== 'PENDING') {
                    $refund->settle($status['status'] === 'SUCCESS', $status['transaction_id'] ?? null);
                }
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
