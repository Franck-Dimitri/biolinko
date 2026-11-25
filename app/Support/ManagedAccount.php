<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

/** Comptes créés par l'équipe : mode configuration de l'admin et lien d'accès remis au vendeur. */
class ManagedAccount
{
    /** Session : identifiant de l'admin qui configure la boutique d'un vendeur. */
    public const SESSION_KEY = 'managed_by_admin';

    /**
     * Actions réservées au vendeur lui-même, refusées pendant la configuration par l'équipe :
     * argent, identité, abonnement payant, mot de passe, e-mail et suppression du compte.
     */
    public const VENDOR_ONLY = [
        'wallet.withdraw', 'wallet.payout.save', 'wallet.payout.cancel', 'seller.verification.store',
        'seller.subscriptions.subscribe', 'seller.subscriptions.autoRenew',
        'profile.update', 'profile.destroy', 'password.update',
    ];

    public const LINK_DAYS = 7;

    /** Lien signé, valable 7 jours et un seul usage : en générer un nouveau annule le précédent. */
    public static function accessLink(User $user): string
    {
        $nonce = Str::random(40);
        $user->forceFill(['claim_nonce' => hash('sha256', $nonce)])->save();

        return URL::temporarySignedRoute('account.claim', now()->addDays(static::LINK_DAYS), ['user' => $user->id, 'cle' => $nonce]);
    }

    public static function validNonce(User $user, ?string $nonce): bool
    {
        return $user->isManaged() && $nonce && $user->claim_nonce && hash_equals($user->claim_nonce, hash('sha256', $nonce));
    }

    /** Le vendeur a pris la main : l'équipe n'a plus accès à son espace. */
    public static function markClaimed(User $user): void
    {
        $user->forceFill(['claimed_at' => now(), 'claim_nonce' => null])->save();
    }
}
