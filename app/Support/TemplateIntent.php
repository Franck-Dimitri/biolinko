<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Template choisi dans la galerie (« Choisir ce template » → register?template=<id>), gardé en session
 * jusqu'à la création de la boutique, où il est présélectionné.
 */
class TemplateIntent
{
    public const SESSION_KEY = 'intended_template';

    public static function remember(Request $request): ?array
    {
        $id = (string) $request->query('template', '');
        if ($id !== '' && self::valid($id)) {
            $request->session()->put(self::SESSION_KEY, $id);
        }

        return self::get($request);
    }

    public static function get(Request $request): ?array
    {
        $id = $request->session()->get(self::SESSION_KEY);

        return $id && self::valid($id) ? StoreTemplates::get($id) : null;
    }

    public static function forget(Request $request): void
    {
        $request->session()->forget(self::SESSION_KEY);
    }

    private static function valid(string $id): bool
    {
        $t = StoreTemplates::get($id);

        return $t && ! in_array('*', $t['business_types'], true);
    }
}
