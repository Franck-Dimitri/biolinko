<?php

namespace App\Support;

use App\Models\Store;
use Illuminate\Support\Facades\DB;

/** Compteurs par template et par jour : visites de vitrine et ajouts au panier (mesures de lancement). */
class TemplateStats
{
    public static function templateOf(Store $store): string
    {
        return StoreDesign::forStore($store)['template'] ?? 'classique';
    }

    public static function hit(Store $store, string $metric): void
    {
        if (! in_array($metric, ['views', 'carts'], true)) {
            return;
        }
        $key = ['day' => now(OpeningHours::TIMEZONE)->toDateString(), 'template' => self::templateOf($store)];
        try {
            DB::table('template_stats')->insertOrIgnore($key + ['views' => 0, 'carts' => 0]);
            DB::table('template_stats')->where($key)->increment($metric);
        } catch (\Throwable $e) {
            report($e); // une mesure ne bloque jamais la vitrine
        }
    }

    /** Robots et aperçus de liens (WhatsApp, Facebook…) : pas des visites. */
    public static function isBot(?string $userAgent): bool
    {
        return ! $userAgent || preg_match('/bot|crawl|spider|slurp|facebookexternalhit|whatsapp|preview|headless|curl|wget|python|monitor/i', $userAgent) === 1;
    }
}
