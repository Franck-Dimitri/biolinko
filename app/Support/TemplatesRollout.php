<?php

namespace App\Support;

use App\Models\User;

/**
 * Lancement des templates : d'abord les vendeurs de l'offre pilote (activité par activité si besoin),
 * puis tout le monde. Réglage dans .env :
 *   BIOLINKO_TEMPLATES=pilot|all|off
 *   BIOLINKO_TEMPLATES_ACTIVITIES=patisserie,restauration (vide = toutes)
 * Une boutique déjà passée sur un template garde toujours son éditeur.
 */
class TemplatesRollout
{
    public const MODES = ['off', 'pilot', 'all'];

    public static function mode(): string
    {
        $mode = (string) config('biolinko.templates.rollout', 'pilot');

        return in_array($mode, self::MODES, true) ? $mode : 'pilot';
    }

    /** Activités ouvertes (null = toutes). */
    public static function activities(): ?array
    {
        $list = array_values(array_filter(array_map('trim', explode(',', (string) config('biolinko.templates.activities', '')))));

        return $list ? array_values(array_intersect($list, BusinessTypes::keys())) : null;
    }

    public static function activityOpen(?string $type): bool
    {
        $list = self::activities();

        return $list === null || in_array($type ?: 'autre', $list, true);
    }

    /** Création de boutique et éditeur accessibles à ce vendeur ? */
    public static function openTo(?User $user): bool
    {
        if (! $user) {
            return false;
        }
        if ($user->isAdmin() || $user->store?->design_engine) {
            return true;
        }

        return match (self::mode()) {
            'all' => true,
            'pilot' => (bool) $user->pilot_started_at,
            default => false,
        };
    }
}
