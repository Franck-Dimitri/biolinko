<?php

namespace App\Support;

/**
 * Centre d'aide : liste des guides (titre, résumé, rubrique). Le contenu de chaque guide
 * est rédigé côté interface (resources/js/Components/Landing/helpArticles.jsx), sous la même clé.
 */
class HelpCenter
{
    public const CATEGORIES = [
        'demarrer' => 'Bien démarrer',
        'vendre' => 'Vendre',
        'argent' => 'Paiements et argent',
        'compte' => 'Compte et formule',
    ];

    public const ARTICLES = [
        'creer-sa-boutique' => ['demarrer', 'Créer sa boutique', 'Inscription, adresse de la boutique, logo et couleurs, publication.'],
        'ajouter-un-produit' => ['demarrer', 'Ajouter un produit', 'Photos, prix, stock, tailles et couleurs, promotions.'],
        'partager-et-vendre' => ['vendre', 'Partager sa boutique et vendre sur les réseaux', 'Votre lien sur WhatsApp, Instagram, TikTok et Facebook, liens de paiement et packs.'],
        'livraison-et-commandes' => ['vendre', 'Livraison et suivi des commandes', 'Zones de livraison, statuts de commande, ce que voit votre client.'],
        'comment-le-client-paie' => ['argent', 'Comment votre client paie', 'Mobile Money, frais de paiement, acompte, facture et suivi.'],
        'recevoir-son-argent' => ['argent', 'Recevoir son argent et faire un retrait', 'Solde en attente et disponible, délai de sécurité, retrait gratuit.'],
        'rembourser-et-signalements' => ['argent', 'Rembourser un client et gérer un signalement', 'Remboursement total ou partiel, signalement de problème.'],
        'formules-et-abonnement' => ['compte', 'Formules, commissions et abonnement', 'Commission selon la formule, abonnement payé depuis le solde, rappels.'],
    ];

    public static function list(): array
    {
        return collect(static::ARTICLES)->map(fn ($a, $slug) => [
            'slug' => $slug, 'category' => $a[0], 'title' => $a[1], 'summary' => $a[2],
        ])->values()->all();
    }

    public static function find(string $slug): ?array
    {
        $a = static::ARTICLES[$slug] ?? null;

        return $a ? ['slug' => $slug, 'category' => $a[0], 'title' => $a[1], 'summary' => $a[2]] : null;
    }
}
