<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Subscription;
use App\Models\Withdrawal;
use App\Services\OrderInvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HrSkillsPayWebhookController extends Controller
{
    protected OrderInvoiceService $invoiceService;

    public function __construct(OrderInvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function handle(Request $request): JsonResponse
    {
        $rawPayload = $request->getContent();
        $signature = $request->header('X-Hub-Signature');
        $webhookSecret = config('services.hrskills_pay.webhook_secret');

        Log::info('HR-Skills Pay Webhook Received', ['reference' => $request->input('data.reference') ?? $request->input('reference')]);

        // Signature obligatoire : sans elle, n'importe qui pourrait marquer une commande payée.
        // Seul l'environnement local accepte un webhook non signé quand aucun secret n'est configuré.
        if ($webhookSecret) {
            $expected = 'sha256=' . hash_hmac('sha256', $rawPayload, $webhookSecret);
            if (! $signature || ! hash_equals($expected, $signature)) {
                Log::warning('HR-Skills Pay Webhook Invalid Signature');
                return response()->json(['error' => 'INVALID_SIGNATURE'], 401);
            }
        } elseif (! app()->environment('local', 'testing')) {
            Log::error('HR-Skills Pay Webhook refusé : HRSKILLS_PAY_WEBHOOK_SECRET manquant');
            return response()->json(['error' => 'WEBHOOK_NOT_CONFIGURED'], 503);
        }

        $event = $request->input('event') ?? $request->input('type');
        $data = $request->input('data') ?? $request->all();

        $reference = $data['reference'] ?? null;
        $status = strtoupper($data['status'] ?? '');

        if (!$reference) {
            return response()->json(['status' => 'IGNORED_NO_REF'], 200);
        }

        $succeeded = in_array($event, ['payment.success', 'payment.succeeded', 'payout.success'], true) || $status === 'SUCCESS';
        $failed = in_array($event, ['payment.failed', 'payout.failed'], true) || in_array($status, ['FAILED', 'CANCELLED'], true);

        // 1. Commande (encaissement)
        $order = Order::where('payment_reference', $reference)->where('payment_provider', 'hrskills')->first();
        if ($order) {
            if ($succeeded) {
                $order->markAsPaid($data['transaction_id'] ?? null);
            } elseif ($failed) {
                Order::whereKey($order->id)->where('payment_status', '!=', 'paid')
                    ->update(['status' => 'cancelled', 'payment_status' => 'failed']);
            }

            return response()->json(['status' => 'PROCESSED_ORDER'], 200);
        }

        // 2. Abonnement : active le plan même si le vendeur a fermé la page de paiement
        $subscription = Subscription::where('payment_reference', $reference)->where('payment_provider', 'hrskills')->first();
        if ($subscription) {
            if ($succeeded) {
                $subscription->activate();
            } elseif ($failed) {
                Subscription::whereKey($subscription->id)->where('payment_status', 'pending')->update(['payment_status' => 'failed']);
            }

            return response()->json(['status' => 'PROCESSED_SUBSCRIPTION'], 200);
        }

        // 3. Retrait (décaissement)
        $withdrawal = Withdrawal::where('payment_reference', $reference)->where('payment_provider', 'hrskills')->first();
        if ($withdrawal) {
            if ($succeeded || $failed) {
                $withdrawal->settle($succeeded, $data['transaction_id'] ?? null);
            }

            return response()->json(['status' => 'PROCESSED_WITHDRAWAL'], 200);
        }

        return response()->json(['status' => 'REF_NOT_FOUND'], 200);
    }
}
