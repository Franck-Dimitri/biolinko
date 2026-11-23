<?php

namespace App\Support;

use Illuminate\Support\Carbon;

/**
 * Horaires d'ouverture par jour (restaurants, salons…) : { mon: { open: "11:00", close: "23:00" }, tue: null… }.
 * Une fermeture avant l'ouverture passe minuit (ex. 18:00 → 02:00). Heure du Cameroun.
 */
class OpeningHours
{
    public const DAYS = ['mon' => 'Lun', 'tue' => 'Mar', 'wed' => 'Mer', 'thu' => 'Jeu', 'fri' => 'Ven', 'sat' => 'Sam', 'sun' => 'Dim'];

    private const FULL = ['mon' => 'lundi', 'tue' => 'mardi', 'wed' => 'mercredi', 'thu' => 'jeudi', 'fri' => 'vendredi', 'sat' => 'samedi', 'sun' => 'dimanche'];

    public const TIMEZONE = 'Africa/Douala';

    /** Horaires valides et rangés, ou null si aucun jour n'est ouvert. */
    public static function normalize(mixed $schedule): ?array
    {
        if (! is_array($schedule)) {
            return null;
        }
        $out = [];
        foreach (array_keys(self::DAYS) as $day) {
            $d = $schedule[$day] ?? null;
            $ok = is_array($d) && self::isTime($d['open'] ?? null) && self::isTime($d['close'] ?? null) && $d['open'] !== $d['close'];
            $out[$day] = $ok ? ['open' => $d['open'], 'close' => $d['close']] : null;
        }

        return array_filter($out) ? $out : null;
    }

    /** « Lun – Sam · 11 h – 23 h ; Dim · 12 h – 22 h » : jours consécutifs aux mêmes horaires regroupés. */
    public static function summary(array $schedule): string
    {
        $groups = [];
        foreach (array_keys(self::DAYS) as $day) {
            $slot = $schedule[$day] ?? null;
            $last = count($groups) - 1;
            if ($slot && $last >= 0 && $groups[$last]['slot'] == $slot && $groups[$last]['to'] === self::previous($day)) {
                $groups[$last]['to'] = $day;
            } elseif ($slot) {
                $groups[] = ['from' => $day, 'to' => $day, 'slot' => $slot];
            }
        }

        return implode(' ; ', array_map(fn ($g) => ($g['from'] === $g['to'] ? self::DAYS[$g['from']] : self::DAYS[$g['from']].' – '.self::DAYS[$g['to']])
            .' · '.self::hour($g['slot']['open']).' – '.self::hour($g['slot']['close']), $groups));
    }

    /** Ouvert ou fermé maintenant, avec la prochaine heure utile : { open, label }. */
    public static function status(?array $schedule, ?Carbon $now = null): ?array
    {
        if (! $schedule) {
            return null;
        }
        $now = ($now ?? now())->copy()->setTimezone(self::TIMEZONE);
        $keys = array_keys(self::DAYS);
        $today = $keys[$now->dayOfWeekIso - 1];
        $time = $now->format('H:i');

        // Encore ouvert depuis la veille (horaires qui passent minuit)
        $yesterday = $schedule[self::previous($today)] ?? null;
        if ($yesterday && $yesterday['close'] < $yesterday['open'] && $time < $yesterday['close']) {
            return ['open' => true, 'label' => 'Ouvert · ferme à '.self::hour($yesterday['close'])];
        }
        $slot = $schedule[$today] ?? null;
        if ($slot && $time >= $slot['open'] && ($slot['close'] < $slot['open'] || $time < $slot['close'])) {
            return ['open' => true, 'label' => 'Ouvert · ferme à '.self::hour($slot['close'])];
        }
        if ($slot && $time < $slot['open']) {
            return ['open' => false, 'label' => 'Fermé · ouvre à '.self::hour($slot['open'])];
        }
        for ($i = 1; $i <= 7; $i++) {
            $day = $keys[($now->dayOfWeekIso - 1 + $i) % 7];
            if ($next = $schedule[$day] ?? null) {
                return ['open' => false, 'label' => 'Fermé · ouvre '.($i === 1 ? 'demain' : self::FULL[$day]).' à '.self::hour($next['open'])];
            }
        }

        return null;
    }

    private static function isTime(mixed $t): bool
    {
        return is_string($t) && preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $t) === 1;
    }

    private static function previous(string $day): string
    {
        $keys = array_keys(self::DAYS);

        return $keys[(array_search($day, $keys, true) + 6) % 7];
    }

    /** « 11 h », « 11 h 30 ». */
    private static function hour(string $t): string
    {
        [$h, $m] = explode(':', $t);

        return (int) $h.' h'.($m !== '00' ? ' '.$m : '');
    }
}
