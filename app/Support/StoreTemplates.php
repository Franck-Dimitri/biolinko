<?php

namespace App\Support;

use Illuminate\Support\Facades\File;

/**
 * Templates de vitrine : un fichier JSON par template dans resources/store-templates,
 * versionné avec le code. Un template = une vitrine complète (style, motif, sections)
 * et les activités auxquelles il est proposé (« * » = toutes).
 */
class StoreTemplates
{
    private static ?array $cache = null;

    public static function all(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }

        $templates = [];
        foreach (File::glob(resource_path('store-templates/*.json')) as $file) {
            $t = json_decode(File::get($file), true, flags: JSON_THROW_ON_ERROR);
            $templates[$t['id']] = $t;
        }
        ksort($templates);

        return self::$cache = $templates;
    }

    public static function get(string $id): ?array
    {
        return self::all()[$id] ?? null;
    }

    /** Templates proposés pour une activité. */
    public static function forBusinessType(?string $type): array
    {
        return array_values(array_filter(self::all(), fn ($t) => in_array('*', $t['business_types'], true) || in_array($type, $t['business_types'], true)));
    }

    /** Templates par activité (dans l'ordre des activités), sans le template « Classique » d'origine. */
    public static function byBusinessType(): array
    {
        $out = [];
        foreach (BusinessTypes::keys() as $type) {
            $out[$type] = array_values(array_filter(self::all(), fn ($t) => in_array($type, $t['business_types'], true)));
        }

        return $out;
    }

    /** Contenu de démonstration d'une activité : uniquement pour la galerie publique des templates. */
    public static function demo(string $type): ?array
    {
        static $demos = null;
        $demos ??= json_decode((string) File::get(resource_path('data/template-demos.json')), true);

        return $demos[$type] ?? null;
    }

    public static function photoCredits(): array
    {
        return json_decode((string) File::get(resource_path('data/template-photo-credits.json')), true);
    }

    public static function flush(): void
    {
        self::$cache = null;
    }
}
