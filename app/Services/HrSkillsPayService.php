<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class HrSkillsPayService
{
    protected string $baseUrl;
    protected ?string $publicKey;
    protected ?string $secretKey;
    protected string $country;
    protected string $currency;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.hrskills_pay.base_url', 'https://api.hrskills-pay.com'), '/');
        $this->publicKey = config('services.hrskills_pay.public_key');
        $this->secretKey = config('services.hrskills_pay.secret_key');
        $this->country = config('services.hrskills_pay.country', 'CM');
        $this->currency = config('services.hrskills_pay.currency', 'XAF');
    }

    /**
     * Format any Cameroon phone number to 2376XXXXXXXX (12 digits, no plus).
     * Rejects non-Cameroon numbers strictly.
     */
    public function formatCameroonPhone(string $phone): string
    {
        // Strip non-numeric characters
        $cleaned = preg_replace('/[^0-9]/', '', $phone);

        // Remove leading double zero if present
        if (str_starts_with($cleaned, '00')) {
            $cleaned = substr($cleaned, 2);
        }

        // If 9 digits starting with 6 (e.g. 699123456)
        if (strlen($cleaned) === 9 && str_starts_with($cleaned, '6')) {
            $cleaned = '237' . $cleaned;
        }

        // Must be exactly 12 digits starting with 2376
        if (strlen($cleaned) !== 12 || !str_starts_with($cleaned, '2376')) {
            throw new \InvalidArgumentException('Seuls les numéros Mobile Money du Cameroun (+237 6XX XXX XXX) sont acceptés.');
        }

        return $cleaned;
    }

    /**
     * Detect Cameroon Mobile Money Operator (MTN vs ORANGE).
     */
    public function detectOperator(string $formattedPhone): string
    {
        $localNum = substr($formattedPhone, 3); // Remove 237, get 9 digits

        // Orange prefixes in Cameroon: 69, 64, 655, 656, 657, 658, 659
        if (preg_match('/^6(9|4|55|56|57|58|59)/', $localNum)) {
            return 'ORANGE';
        }

        // MTN prefixes: 67, 650, 651, 652, 653, 654, 68
        return 'MTN';
    }

    /**
     * Retrieve or cache JWT Transaction Token (TTL 45 min).
     */
    public function getTransactionToken(): string
    {
        return Cache::remember('hrsk_transaction_token', 2400, function () {
            $url = $this->baseUrl . '/v1/auth/transaction-token';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->publicKey,
                'Content-Type' => 'application/json',
            ])->post($url, [
                'api_secret' => $this->secretKey,
            ]);

            if ($response->failed()) {
                Log::error('HR-Skills Pay Token Auth Failed', ['response' => $response->body()]);
                throw new \RuntimeException('Impossible d\'obtenir le jeton d\'authentification HR-Skills Pay.');
            }

            $json = $response->json();
            return $json['transaction_token'] ?? $json['data']['transaction_token'] ?? throw new \RuntimeException('Format de réponse token invalide.');
        });
    }

    /**
     * Initiate Mobile Money Cash-In (Collect payment from customer).
     */
    public function initiatePayin(Order $order, string $rawPhone, ?string $operatorChoice = null): array
    {
        $formattedPhone = $this->formatCameroonPhone($rawPhone);
        $operator = $operatorChoice ? strtoupper($operatorChoice) : $this->detectOperator($formattedPhone);
        $token = $this->getTransactionToken();
        $idempotencyKey = (string) Str::uuid();

        // Orange/MTN Cameroon require a strict minimum amount of 100 FCFA for Cash-In
        $amount = max(100, (int) round($order->total_client));

        $url = $this->baseUrl . '/api/v1/payin/mobile-money';

        $payload = [
            'operator' => $operator,
            'country' => $this->country,
            'phone_number' => $formattedPhone,
            'amount' => $amount,
            'currency' => $this->currency,
            'description' => 'Paiement Commande BIOLINKO #' . $order->tracking_code,
            'metadata' => [
                'order_id' => $order->id,
                'tracking_code' => $order->tracking_code,
                'customer_name' => $order->customer_name,
            ],
        ];

        Log::info('Initiating HR-Skills Payin', ['order_id' => $order->id, 'payload' => $payload]);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->publicKey,
            'X-Transaction-Token' => $token,
            'Idempotency-Key' => $idempotencyKey,
            'Content-Type' => 'application/json',
        ])->post($url, $payload);

        if ($response->failed()) {
            Log::error('HR-Skills Payin Request Failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $json = $response->json();
            $msg = $json['message'] ?? $json['error'] ?? 'Échec d\'initiation du paiement USSD.';
            throw new \RuntimeException($msg);
        }

        $resJson = $response->json();
        $data = $resJson['data'] ?? $resJson;

        return [
            'reference' => $data['reference'] ?? null,
            'transaction_id' => $data['transaction_id'] ?? null,
            'status' => $data['status'] ?? 'PENDING',
            'operator' => $operator,
            'phone_number' => $formattedPhone,
            'amount' => $amount,
        ];
    }

    /**
     * Check payment status by reference.
     */
    public function checkPaymentStatus(string $reference): array
    {
        $url = $this->baseUrl . '/v1/payments/' . $reference;
        $token = $this->getTransactionToken();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->publicKey,
            'X-Transaction-Token' => $token,
        ])->get($url);

        if ($response->failed()) {
            Log::warning('HR-Skills Check Payment Status Failed', ['ref' => $reference, 'body' => $response->body()]);
            return ['status' => 'PENDING'];
        }

        $res = $response->json();
        return $res['data'] ?? $res;
    }

    /**
     * Initiate Mobile Money Cash-Out (Send withdrawal funds to vendor).
     */
    public function initiatePayout(Withdrawal $withdrawal, string $rawPhone, ?string $operatorChoice = null): array
    {
        $formattedPhone = $this->formatCameroonPhone($rawPhone);
        $operator = $operatorChoice ? strtoupper($operatorChoice) : $this->detectOperator($formattedPhone);
        $token = $this->getTransactionToken();
        $idempotencyKey = (string) Str::uuid();

        $amount = (int) round($withdrawal->amount);

        $url = $this->baseUrl . '/api/v1/payout/mobile-money';

        $payload = [
            'operator' => $operator,
            'country' => $this->country,
            'phone_number' => $formattedPhone,
            'amount' => $amount,
            'currency' => $this->currency,
        ];

        Log::info('Initiating HR-Skills Payout', ['withdrawal_id' => $withdrawal->id, 'payload' => $payload]);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->publicKey,
            'X-Transaction-Token' => $token,
            'Idempotency-Key' => $idempotencyKey,
            'Content-Type' => 'application/json',
        ])->post($url, $payload);

        if ($response->failed()) {
            Log::error('HR-Skills Payout Request Failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $json = $response->json();
            $msg = $json['message'] ?? $json['error'] ?? 'Échec du virement Mobile Money.';
            throw new \RuntimeException($msg);
        }

        $resJson = $response->json();
        $data = $resJson['data'] ?? $resJson;

        return [
            'reference' => $data['reference'] ?? null,
            'transaction_id' => $data['transaction_id'] ?? null,
            'status' => $data['status'] ?? 'PENDING',
            'operator' => $operator,
            'phone_number' => $formattedPhone,
        ];
    }
}
