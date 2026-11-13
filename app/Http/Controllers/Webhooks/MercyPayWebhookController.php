<?php

namespace App\Http\Controllers\Webhooks;

use App\Http\Controllers\Controller;

use App\Models\Order;
use App\Models\Refund;
use App\Models\Subscription;
use App\Models\Withdrawal;
use App\Payments\Orders\OrderPayments;
use App\Payments\PaymentManager;
use App\Payments\Subscriptions\SubscriptionPayments;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Webhooks Mercy Pay (docs.mercy-pay.com, novembre 2026).
 *
 * Signature : en-tête « MercyPay-Signature: t=<horodatage>,v1=<hex> », HMAC-SHA256 de « {t}.{corps brut} »
 * avec le secret whsec_ de l'endpoint ; refusée si l'horodatage a plus de 5 minutes. Pendant une rotation
 * de secret, plusieurs v1 peuvent être présents : un seul doit correspondre.
 * Le contenu n'est jamais cru tel quel : on redemande le statut à Mercy Pay avant d'agir, une seule fois par événement.
 */
class MercyPayWebhookController extends Controller
{
    private const TOLERANCE = 300;

    public function handle(Request $request, OrderPayments $orders, SubscriptionPayments $subscriptions, PaymentManager $payments): JsonResponse
    {
        if (! $this->validSignature($request)) {
            Log::warning('Mercy Pay webhook: signature invalide');

            return response()->json(['error' => 'INVALID_SIGNATURE'], 401);
        }

        $eventId = (string) ($request->input('id') ?: $request->header('MercyPay-Event-Id'));
        if ($eventId && ! Cache::add('mercypay_evt_'.$eventId, true, now()->addDays(4))) {
            return response()->json(['status' => 'duplicate']);
        }

        $type = (string) ($request->input('type') ?: $request->header('MercyPay-Event-Type'));
        $data = (array) $request->input('data', []);

        if (str_starts_with($type, 'payment.') || $type === 'checkout_session.completed') {
            // Paiement direct (pay_…) ou payé depuis la page hébergée (rattaché à sa session cs_…)
            $refs = array_values(array_filter([
                $data['id'] ?? null,
                is_string($data['checkout_session'] ?? null) ? $data['checkout_session'] : ($data['checkout_session']['id'] ?? null),
                is_string($data['payment'] ?? null) ? $data['payment'] : ($data['payment']['id'] ?? null),
                $data['uuid'] ?? null, // anciens paiements
            ]));

            if ($refs && ($order = Order::whereIn('payment_reference', $refs)->where('payment_provider', 'mercypay')->first())) {
                $orders->refresh($order);
            } elseif ($refs && ($subscription = Subscription::whereIn('payment_reference', $refs)->where('payment_provider', 'mercypay')->first())) {
                $subscriptions->refresh($subscription);
            }
        } elseif (str_starts_with($type, 'payout.')) {
            $id = (string) ($data['id'] ?? $data['uuid'] ?? '');
            $operation = $id
                ? (Withdrawal::where('payment_reference', $id)->where('payment_provider', 'mercypay')->first()
                    ?? Refund::where('payment_reference', $id)->where('payment_provider', 'mercypay')->first())
                : null;

            if ($operation) {
                $status = $payments->driver('mercypay')->payoutStatus($id);
                if ($status['status'] !== 'PENDING') {
                    $operation->settle($status['status'] === 'SUCCESS', $status['transaction_id'] ?? null);
                }
            }
        }

        return response()->json(['status' => 'ok']);
    }

    private function validSignature(Request $request): bool
    {
        $secret = (string) config('payments.mercypay.webhook_secret');
        $header = (string) $request->header('MercyPay-Signature');
        if ($secret === '' || $header === '') {
            return false;
        }

        $timestamp = null;
        $signatures = [];
        foreach (explode(',', $header) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
            if ($key === 't') {
                $timestamp = $value;
            } elseif ($key === 'v1' && $value !== '') {
                $signatures[] = $value;
            }
        }

        if (! ctype_digit((string) $timestamp) || abs(time() - (int) $timestamp) > self::TOLERANCE || ! $signatures) {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$request->getContent(), $secret);
        foreach ($signatures as $signature) {
            if (hash_equals($expected, $signature)) {
                return true;
            }
        }

        return false;
    }
}
