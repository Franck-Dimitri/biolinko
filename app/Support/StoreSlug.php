<?php

namespace App\Support;

use App\Models\Store;
use App\Models\StoreSlugRedirect;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/**
 * Adresse d'une boutique = son sous-domaine (<adresse>.biolinko.store) : mêmes règles partout
 * (inscription, création, Ma boutique). Une adresse est prise si une boutique l'utilise, si elle est
 * réservée, ou si c'est l'ancienne adresse d'une autre boutique (redirigée vers sa nouvelle adresse).
 */
class StoreSlug
{
    public const PATTERN = '/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/';

    public const MESSAGES = [
        'regex' => 'L’adresse doit faire 3 à 40 caractères : lettres minuscules, chiffres et tirets, sans tiret au début ni à la fin.',
        'unique' => 'Cette adresse est déjà prise, choisissez-en une autre.',
        'not_in' => 'Cette adresse est réservée, choisissez-en une autre.',
    ];

    /** « Chez Awa ! » → « chez-awa » (3 à 40 caractères), ou null si trop court. */
    public static function normalize(?string $value): ?string
    {
        $slug = trim(substr(Str::slug(Str::limit((string) $value, 60, '')), 0, 40), '-');

        return strlen($slug) >= 3 ? $slug : null;
    }

    /** Règles de validation de l'adresse (la boutique peut garder ou reprendre ses propres adresses). */
    public static function rules(?Store $store = null): array
    {
        return [
            'required', 'string', 'regex:'.self::PATTERN,
            Rule::unique('stores', 'slug')->ignore($store?->id),
            Rule::notIn(User::RESERVED_SLUGS),
            function ($attribute, $value, $fail) use ($store) {
                if (StoreSlugRedirect::where('old_slug', $value)->when($store, fn ($q) => $q->where('store_id', '!=', $store->id))->exists()) {
                    $fail(self::MESSAGES['unique']);
                }
            },
        ];
    }

    /** Messages de validation pour un champ d'adresse. */
    public static function messages(string $field = 'slug'): array
    {
        return collect(self::MESSAGES)->mapWithKeys(fn ($m, $rule) => ["{$field}.{$rule}" => $m])->all();
    }

    public static function available(?string $slug, ?Store $for = null): bool
    {
        if (! $slug || ! preg_match(self::PATTERN, $slug) || in_array($slug, User::RESERVED_SLUGS, true)) {
            return false;
        }
        if (Store::where('slug', $slug)->when($for, fn ($q) => $q->where('id', '!=', $for->id))->exists()) {
            return false;
        }

        return ! StoreSlugRedirect::where('old_slug', $slug)->when($for, fn ($q) => $q->where('store_id', '!=', $for->id))->exists();
    }

    /** Adresses proches et libres, à proposer quand celle demandée est prise. */
    public static function suggestions(string $slug, int $count = 3, ?Store $for = null): array
    {
        $base = substr(trim($slug, '-'), 0, 30);
        $candidates = [
            "{$base}-shop", "chez-{$base}", "{$base}-store", "{$base}-boutique", "{$base}-officiel", "{$base}-cm", "{$base}-237",
            "{$base}-douala", "{$base}-yaounde", "maison-{$base}",
        ];
        $out = [];
        foreach ($candidates as $c) {
            $c = trim(substr($c, 0, 40), '-');
            if (count($out) < $count && self::available($c, $for)) {
                $out[] = $c;
            }
        }
        for ($i = 2; count($out) < $count && $i < 1000; $i++) {
            if (self::available("{$base}-{$i}", $for)) {
                $out[] = "{$base}-{$i}";
            }
        }

        return $out;
    }
}
