<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Withdrawal;
use App\Services\OrderInvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        Log::info('HR-Skills Pay Webhook Received', [
            'signature' => $signature,
            'body' => $request->all(),
        ]);

        // Optional HMAC signature verification if secret configured
        if ($webhookSecret && $signature) {
            $expected = 'sha256=' . hash_hmac('sha256', $rawPayload, $webhookSecret);
            if (!hash_equals($expected, $signature)) {
                Log::warning('HR-Skills Pay Webhook Invalid Signature', ['received' => $signature, 'expected' => $expected]);
                return response()->json(['error' => 'INVALID_SIGNATURE'], 401);
            }
        }

        $event = $request->input('event') ?? $request->input('type');
        $data = $request->input('data') ?? $request->all();

        $reference = $data['reference'] ?? null;
        $status = strtoupper($data['status'] ?? '');

        if (!$reference) {
            return response()->json(['status' => 'IGNORED_NO_REF'], 200);
        }

        // 1. Process Order (Cash-In)
        $order = Order::where('hrskills_reference', $reference)->first();
        if ($order) {
            if ($event === 'payment.succeeded' || $status === 'SUCCESS') {
                if ($order->payment_status !== 'paid') {
                    $order->update([
                        'status' => 'paid',
                        'payment_status' => 'paid',
                        'paid_at' => now(),
                        'hrskills_transaction_id' => $data['transaction_id'] ?? $order->hrskills_transaction_id,
                    ]);

                    // Credit vendor Wallet (solde disponible)
                    $wallet = $order->store->wallet;
                    if ($wallet) {
                        $wallet->increment('balance_available', (float) $order->price_vendor);
                    }

                    // Generate & Send PDF Invoice Emails to Vendor & Customer
                    $this->invoiceService->sendOrderInvoiceEmails($order);

                    Log::info('Order Payment Succeeded via Webhook', ['order_id' => $order->id, 'reference' => $reference]);
                }
            } elseif ($event === 'payment.failed' || $status === 'FAILED') {
                $order->update([
                    'status' => 'cancelled',
                    'payment_status' => 'failed',
                ]);
                Log::info('Order Payment Failed via Webhook', ['order_id' => $order->id, 'reference' => $reference]);
            }
            return response()->json(['status' => 'PROCESSED_ORDER'], 200);
        }

        // 2. Process Withdrawal (Cash-Out)
        $withdrawal = Withdrawal::where('hrskills_reference', $reference)->first();
        if ($withdrawal) {
            if ($event === 'payment.succeeded' || $status === 'SUCCESS') {
                $withdrawal->update([
                    'status' => 'approved',
                    'processed_at' => now(),
                    'hrskills_transaction_id' => $data['transaction_id'] ?? $withdrawal->hrskills_transaction_id,
                ]);
                Log::info('Withdrawal Payout Succeeded via Webhook', ['withdrawal_id' => $withdrawal->id]);
            } elseif ($event === 'payment.failed' || $status === 'FAILED') {
                $withdrawal->update([
                    'status' => 'rejected',
                ]);
                // Restore vendor wallet balance if payout failed
                if ($withdrawal->wallet) {
                    $withdrawal->wallet->increment('balance', (float) $withdrawal->amount);
                }
                Log::info('Withdrawal Payout Failed via Webhook', ['withdrawal_id' => $withdrawal->id]);
            }
            return response()->json(['status' => 'PROCESSED_WITHDRAWAL'], 200);
        }

        return response()->json(['status' => 'REF_NOT_FOUND'], 200);
    }
}
