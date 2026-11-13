<?php

namespace App\Payments;

/**
 * Agrégateur capable d'héberger la page de paiement : le client y est redirigé,
 * choisit son moyen de paiement et revient sur Biolinko (success_url / cancel_url).
 *
 * Paramètres : reference (idempotence), amount, currency, description, payer_name, payer_phone,
 * payer_email, success_url, cancel_url, metadata.
 * Résultat : ['reference' => id de session, 'checkout_url' => …, 'status' => 'PENDING', 'operator' => null].
 */
interface HostedCheckout
{
    public function checkout(array $payment): array;
}
