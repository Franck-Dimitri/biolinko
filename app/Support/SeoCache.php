<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;

/** Plans du site et llms.txt mis en cache une heure : vidés dès qu'une boutique ou un produit change. */
class SeoCache
{
    public static function forget(?string $slug = null): void
    {
        foreach (['seo.sitemap', 'seo.sitemap.boutiques', 'seo.llms'] as $key) {
            Cache::forget($key);
        }
        if ($slug) {
            Cache::forget('seo.sitemap.'.$slug);
            Cache::forget('seo.llms.'.$slug);
        }
    }
}
