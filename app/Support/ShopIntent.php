<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Adresse de boutique choisie sur la landing (biolinko.app/<slug>), gardée en session
 * jusqu'à la création du compte, puis utilisée pour nommer la boutique.
 */
class ShopIntent
{
    public const SESSION_KEY = 'intended_shop';

    /** Normalise une saisie libre en adresse valide (minuscules, tirets, 3 à 40 caractères). */
    public static function normalize(?string $value): ?string
    {
        return StoreSlug::normalize($value);
    }

    public static function isAvailable(string $slug): bool
    {
        return StoreSlug::available($slug);
    }

    public static function remember(Request $request): ?string
    {
        $slug = self::normalize($request->query('boutique'));
        if ($slug) {
            $request->session()->put(self::SESSION_KEY, $slug);
        }

        return $slug ?? $request->session()->get(self::SESSION_KEY);
    }

    public static function pull(Request $request): ?string
    {
        return self::normalize($request->session()->pull(self::SESSION_KEY));
    }

    /** « maison-ngono » → « Maison Ngono » */
    public static function displayName(string $slug): string
    {
        return Str::title(str_replace('-', ' ', $slug));
    }
}
