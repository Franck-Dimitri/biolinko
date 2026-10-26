<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * API WhatsApp officielle de Meta (Cloud API).
 * Un message envoyé à l'initiative de Biolinko doit utiliser un modèle approuvé dans le WhatsApp Manager ;
 * le texte libre n'est accepté que dans les 24 h qui suivent un message du client.
 */
class WhatsappCloudService
{
    public function isConfigured(): bool
    {
        return filled(config('services.whatsapp_cloud.token')) && filled(config('services.whatsapp_cloud.phone_number_id'));
    }

    /**
     * Envoie un modèle approuvé.
     *
     * @param  array<int, string>  $body  valeurs des variables {{1}}, {{2}}… du corps
     * @param  string|null  $buttonSuffix  partie variable de l'URL du bouton (ex. le numéro de commande)
     */
    public function sendTemplate(string $phone, string $template, array $body = [], ?string $buttonSuffix = null, ?string $language = null): array
    {
        $components = [];
        if ($body) {
            $components[] = [
                'type' => 'body',
                'parameters' => array_map(fn ($v) => ['type' => 'text', 'text' => $this->clean((string) $v)], array_values($body)),
            ];
        }
        if ($buttonSuffix !== null) {
            $components[] = [
                'type' => 'button',
                'sub_type' => 'url',
                'index' => '0',
                'parameters' => [['type' => 'text', 'text' => $buttonSuffix]],
            ];
        }

        return $this->post([
            'to' => $phone,
            'type' => 'template',
            'template' => [
                'name' => $template,
                'language' => ['code' => $language ?? config('services.whatsapp_cloud.language', 'fr')],
                'components' => $components,
            ],
        ]);
    }

    /** Texte libre : seulement en réponse à un client (fenêtre de 24 h). */
    public function sendText(string $phone, string $text): array
    {
        return $this->post([
            'to' => $phone,
            'type' => 'text',
            'text' => ['body' => $text, 'preview_url' => true],
        ]);
    }

    private function post(array $payload): array
    {
        if (! $this->isConfigured()) {
            return ['success' => false, 'disabled' => true, 'error' => 'API WhatsApp non configurée.'];
        }

        $url = sprintf('https://graph.facebook.com/%s/%s/messages',
            config('services.whatsapp_cloud.version', 'v23.0'), config('services.whatsapp_cloud.phone_number_id'));

        try {
            $response = Http::withToken(config('services.whatsapp_cloud.token'))
                ->timeout(15)
                ->post($url, ['messaging_product' => 'whatsapp', 'recipient_type' => 'individual'] + $payload);

            if ($response->successful()) {
                return ['success' => true, 'id' => $response->json('messages.0.id')];
            }

            Log::warning('WhatsApp Cloud API refused message', [
                'to' => $payload['to'], 'type' => $payload['type'],
                'template' => $payload['template']['name'] ?? null,
                'error' => $response->json('error.message'), 'code' => $response->json('error.code'),
            ]);

            return ['success' => false, 'error' => $response->json('error.message') ?? 'Erreur HTTP '.$response->status()];
        } catch (\Throwable $e) {
            Log::error('WhatsApp Cloud API exception', ['error' => $e->getMessage()]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /** Meta refuse les retours à la ligne, tabulations et plus de 4 espaces dans une variable. */
    private function clean(string $value): string
    {
        $value = preg_replace('/[\r\n\t]+/', ' ', $value);
        $value = preg_replace('/ {4,}/', '   ', $value);

        return mb_substr(trim($value) ?: '-', 0, 1000);
    }
}
