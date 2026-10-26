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
        $digits = preg_replace('/\D/', '', $raw);
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }
        if (strlen($digits) === $c['digits'] + strlen($c['dial']) && str_starts_with($digits, $c['dial'])) {
            $digits = substr($digits, strlen($c['dial']));
        }
        // Un 0 de tête en trop (ex. 0699…) est retiré ; en Côte d'Ivoire et au Bénin, il fait partie du numéro
        if (strlen($digits) === $c['digits'] + 1 && str_starts_with($digits, '0')) {
            $digits = substr($digits, 1);
        }

        if (strlen($digits) !== $c['digits']) {
            throw new InvalidArgumentException("Numéro invalide pour le {$c['name']} : {$c['digits']} chiffres attendus après +{$c['dial']}.");
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

    public static function operatorLabel(string $operator): string
    {
        return [
            'MTN' => 'MTN MoMo', 'ORANGE' => 'Orange Money', 'MOOV' => 'Moov Money', 'AIRTEL' => 'Airtel Money',
            'FREE' => 'Free Money', 'MPESA' => 'M-Pesa', 'VODACOM' => 'M-Pesa', 'TIGO' => 'Tigo Pesa', 'HALOTEL' => 'HaloPesa',
        ][strtoupper($operator)] ?? $operator;
    }
}
