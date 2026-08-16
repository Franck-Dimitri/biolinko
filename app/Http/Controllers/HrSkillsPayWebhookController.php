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
            \Illuminate\Support\Facades\DB::transaction(function () use ($order, $event, $status, $data, $reference) {
                // Lock row to prevent race conditions
                $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->first();
                if (!$lockedOrder) return;

                if ($event === 'payment.succeeded' || $status === 'SUCCESS') {
                    if ($lockedOrder->payment_status !== 'paid') {
                        $lockedOrder->update([
                            'status' => 'paid',
                            'payment_status' => 'paid',
                            'paid_at' => now(),
                            'hrskills_transaction_id' => $data['transaction_id'] ?? $lockedOrder->hrskills_transaction_id,
                        ]);

                        // Credit vendor Wallet (solde disponible)
                        $wallet = $lockedOrder->store->wallet;
                        if ($wallet) {
                            $wallet->lockForUpdate();
                            $wallet->increment('balance_available', (float) $lockedOrder->price_vendor);
                        }

                        // Generate & Send PDF Invoice Emails to Vendor & Customer
                        $this->invoiceService->sendOrderInvoiceEmails($lockedOrder);

                        Log::info('Order Payment Succeeded via Webhook', ['order_id' => $lockedOrder->id, 'reference' => $reference]);
                    }
                } elseif ($event === 'payment.failed' || $status === 'FAILED') {
                    if ($lockedOrder->payment_status !== 'paid') {
                        $lockedOrder->update([
                            'status' => 'cancelled',
                            'payment_status' => 'failed',
                        ]);
                        Log::info('Order Payment Failed via Webhook', ['order_id' => $lockedOrder->id, 'reference' => $reference]);
                    }
                }
            });

            return response()->json(['status' => 'PROCESSED_ORDER'], 200);
        }

        // 2. Process Withdrawal (Cash-Out)
        $withdrawal = Withdrawal::where('hrskills_reference', $reference)->first();
        if ($withdrawal) {
            \Illuminate\Support\Facades\DB::transaction(function () use ($withdrawal, $event, $status, $data) {
                $lockedWithdrawal = Withdrawal::where('id', $withdrawal->id)->lockForUpdate()->first();
                if (!$lockedWithdrawal) return;

                if ($event === 'payment.succeeded' || $status === 'SUCCESS') {
                    if ($lockedWithdrawal->status !== 'approved') {
                        $lockedWithdrawal->update([
                            'status' => 'approved',
                            'processed_at' => now(),
                            'hrskills_transaction_id' => $data['transaction_id'] ?? $lockedWithdrawal->hrskills_transaction_id,
                        ]);
                        Log::info('Withdrawal Payout Succeeded via Webhook', ['withdrawal_id' => $lockedWithdrawal->id]);
                    }
                } elseif ($event === 'payment.failed' || $status === 'FAILED') {
                    if ($lockedWithdrawal->status !== 'rejected') {
                        $lockedWithdrawal->update([
                            'status' => 'rejected',
                        ]);
                        // Restore vendor wallet balance if payout failed
                        if ($lockedWithdrawal->wallet) {
                            $lockedWithdrawal->wallet->lockForUpdate();
                            $lockedWithdrawal->wallet->increment('balance_available', (float) $lockedWithdrawal->amount);
                        }
                        Log::info('Withdrawal Payout Failed via Webhook', ['withdrawal_id' => $lockedWithdrawal->id]);
                    }
                }
            });

            return response()->json(['status' => 'PROCESSED_WITHDRAWAL'], 200);
        }

        return response()->json(['status' => 'REF_NOT_FOUND'], 200);
    }
}
