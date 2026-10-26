<?php

namespace App\Payments;

use App\Payments\Gateways\HrSkillsGateway;
use App\Payments\Gateways\PawapayGateway;
use InvalidArgumentException;

/**
 * Choisit l'agrégateur : celui configuré pour les nouvelles opérations,
 * ou celui qui a traité une opération existante (payment_provider).
 */
class PaymentManager
{
    public function driver(?string $name = null): PaymentGateway
    {
        return match ($name ?? config('payments.driver')) {
            'pawapay' => app(PawapayGateway::class),
            'hrskills' => app(HrSkillsGateway::class),
            default => throw new InvalidArgumentException('Agrégateur de paiement inconnu : '.$name),
        };
    }

    public function payoutDriver(): PaymentGateway
    {
        return $this->driver(config('payments.payout_driver'));
    }
}
