<?php

namespace App\Payments;

/**
 * Contrat commun aux agrégateurs Mobile Money.
 *
 * Paramètres d'une opération : reference (UUID fourni par Biolinko, sert aussi d'idempotence),
 * amount (entier), currency, country (code ISO-2), phone (international sans +), operator (MTN, ORANGE…),
 * description, metadata.
 *
 * Résultat : ['reference' => …, 'status' => PENDING|SUCCESS|FAILED, 'operator' => …, 'transaction_id' => …, 'message' => …]
 */
interface PaymentGateway
{
    public function name(): string;

    /** Demande de paiement envoyée sur le téléphone du client. */
    public function deposit(array $payment): array;

    public function depositStatus(string $reference): array;

    /** Virement vers le Mobile Money d'un vendeur. */
    public function payout(array $payout): array;

    public function payoutStatus(string $reference): array;
}
