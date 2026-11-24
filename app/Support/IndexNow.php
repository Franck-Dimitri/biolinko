<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

use function Illuminate\Support\defer;

/**
 * IndexNow : prévient Bing (dont l'index alimente aussi ChatGPT et Copilot), Yandex et Seznam dès qu'une page
 * publique change, au lieu d'attendre leur prochain passage. Actif seulement en production avec INDEXNOW_KEY.
 * Envoi groupé une fois la réponse partie : le vendeur n'attend jamais.
 */
class IndexNow
{
    private static array $pending = [];

    public static function key(): ?string
    {
        $key = (string) config('services.indexnow.key');

        return preg_match('/^[a-zA-Z0-9-]{8,128}$/', $key) ? $key : null;
    }

    public static function enabled(): bool
    {
        return static::key() !== null && app()->environment('production');
    }

    public static function keyPath(): string
    {
        return '/indexnow-'.static::key().'.txt';
    }

    /** Ajoute des adresses à signaler (envoyées ensemble à la fin de la requête). */
    public static function queue(string ...$urls): void
    {
        if (! static::enabled()) {
            return;
        }
        $first = static::$pending === [];
        foreach ($urls as $url) {
            static::$pending[$url] = true;
        }
        if ($first) {
            defer(fn () => static::flush());
        }
    }

    public static function flush(): void
    {
        $urls = array_keys(static::$pending);
        static::$pending = [];
        // Une requête par domaine : la clé doit être servie par ce même domaine
        foreach (collect($urls)->groupBy(fn ($u) => parse_url($u, PHP_URL_HOST)) as $host => $list) {
            try {
                Http::timeout(5)->asJson()->post('https://api.indexnow.org/indexnow', [
                    'host' => $host, 'key' => static::key(), 'keyLocation' => 'https://'.$host.static::keyPath(), 'urlList' => $list->values()->all(),
                ]);
            } catch (\Throwable $e) {
                Log::info('IndexNow indisponible', ['host' => $host, 'err' => $e->getMessage()]);
            }
        }
    }
}
