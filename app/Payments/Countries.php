<?php

namespace App\Payments;

use InvalidArgumentException;

/**
 * Pays couverts (config/payments.php) : format des numéros, opérateurs, devise.
 */
class Countries
{
    public static function get(string $code): array
    {
        $country = config('payments.countries.'.strtoupper($code));
        if (! $country) {
            throw new InvalidArgumentException("Pays non pris en charge : {$code}");
        }

        return $country + ['code' => strtoupper($code)];
    }

    /** @return array<string, array> pays ouverts aux boutiques et aux paiements */
    public static function enabled(): array
    {
        return collect(config('payments.countries'))->filter(fn ($c) => $c['enabled'])->map(fn ($c, $code) => $c + ['code' => $code])->all();
    }

    public static function isEnabled(string $code): bool
    {
        return (bool) config('payments.countries.'.strtoupper($code).'.enabled');
    }

    /**
     * Numéro au format international sans « + » (ex. 237699887766), ou exception si invalide pour ce pays.
     */
    public static function formatPhone(string $code, string $raw): string
    {
        $c = self::get($code);
        $lengths = (array) $c['digits'];
        $digits = preg_replace('/\D/', '', $raw);
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }
        if (str_starts_with($digits, $c['dial']) && in_array(strlen($digits) - strlen($c['dial']), $lengths, true)) {
            $digits = substr($digits, strlen($c['dial']));
        }
        // Un 0 de tête en trop (ex. 0699…) est retiré ; quand le 0 fait partie du numéro (Côte d'Ivoire), il est gardé
        if (! in_array(strlen($digits), $lengths, true) && str_starts_with($digits, '0') && in_array(strlen($digits) - 1, $lengths, true)) {
            $digits = substr($digits, 1);
        }

        if (! in_array(strlen($digits), $lengths, true)) {
            throw new InvalidArgumentException("Numéro invalide pour le {$c['name']} : ".implode(' ou ', $lengths)." chiffres attendus après +{$c['dial']}.");
        }
        if ($code === 'CM' && ! str_starts_with($digits, '6')) {
            throw new InvalidArgumentException('Seuls les numéros Mobile Money du Cameroun (+237 6XX XXX XXX) sont acceptés.');
        }

        return $c['dial'].$digits;
    }

    /** Opérateur probable d'un numéro (code court : MTN, ORANGE…), à défaut le premier du pays. */
    public static function detectOperator(string $code, string $formattedPhone): string
    {
        $c = self::get($code);
        $local = substr($formattedPhone, strlen($c['dial']));
        foreach ($c['prefixes'] ?? [] as $operator => $prefixes) {
            foreach ($prefixes as $prefix) {
                if (str_starts_with($local, $prefix)) {
                    return $operator;
                }
            }
        }

        return array_key_first($c['operators']);
    }

    /** Minimum de commande dans la devise du pays. */
    public static function minOrder(string $code): int
    {
        return (int) (config('payments.countries.'.strtoupper($code).'.min_order') ?? config('payments.min_order'));
    }

    /** Montant en unités mineures de la devise (ex. 10 GHS => 1000). */
    public static function toMinorUnits(string $code, float $amount): int
    {
        return (int) round($amount * 10 ** (int) (config('payments.countries.'.strtoupper($code).'.decimals') ?? 0));
    }

    public static function operatorLabel(string $operator): string
    {
        return [
            'MTN' => 'MTN MoMo', 'ORANGE' => 'Orange Money', 'MOOV' => 'Moov Money', 'AIRTEL' => 'Airtel Money',
            'FREE' => 'Free Money', 'MPESA' => 'M-Pesa', 'VODACOM' => 'M-Pesa', 'TELECEL' => 'Telecel Cash', 'AIRTELTIGO' => 'AirtelTigo Money',
        ][strtoupper($operator)] ?? $operator;
    }
}
