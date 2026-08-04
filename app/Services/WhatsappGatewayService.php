<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsappGatewayService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.whatsapp_gateway.base_url', 'http://127.0.0.1:8080'), '/');
        $this->apiKey = config('services.whatsapp_gateway.api_key', 'biolinko-secret-key-2026');
    }

    /**
     * Send a single WhatsApp text message via Evolution API gateway.
     */
    public function sendMessage(string $phone, string $message, string $instanceName = 'biolinko_vendor'): array
    {
        $formattedPhone = preg_replace('/[^0-9]/', '', $phone);
        
        // Ensure Cameroon international country code format if 9 digits starting with 6
        if (strlen($formattedPhone) === 9 && str_starts_with($formattedPhone, '6')) {
            $formattedPhone = '237' . $formattedPhone;
        }

        try {
            $url = "{$this->baseUrl}/message/sendText/{$instanceName}";
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(10)->post($url, [
                'number' => $formattedPhone,
                'options' => [
                    'delay' => rand(3000, 6000),
                    'presence' => 'composing',
                ],
                'textMessage' => [
                    'text' => $message,
                ],
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            Log::warning('WhatsApp Gateway send message failed', [
                'phone' => $formattedPhone,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => 'Échec de la réponse gateway : ' . $response->status(),
            ];
        } catch (\Exception $e) {
            Log::error('WhatsApp Gateway connection exception', [
                'phone' => $formattedPhone,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Erreur de connexion gateway : ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Generate or retrieve QR Code session for vendor WhatsApp instance.
     */
    public function getQrCode(string $instanceName = 'biolinko_vendor'): array
    {
        try {
            $url = "{$this->baseUrl}/instance/connect/{$instanceName}";
            $response = Http::withHeaders([
                'apikey' => $this->apiKey,
            ])->timeout(8)->get($url);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'qr_code' => $response->json()['base64'] ?? null,
                ];
            }

            return ['success' => false, 'error' => 'Impossible de générer le QR Code.'];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
