import LegalLayout, { Note } from '@/Components/LegalLayout';

const CONTACT = 'contact@biolinko.link';

const sections = [
    {
        id: 'donnees',
        title: 'Données que nous collectons',
        body: (
            <>
                <p>Biolinko collecte les informations nécessaires au fonctionnement de la plateforme : création de boutique, vente en ligne, encaissement et suivi des commandes.</p>
                <p><strong>Vendeurs :</strong></p>
                <ul>
                    <li>nom, adresse e-mail, mot de passe (stocké sous forme chiffrée) et numéro WhatsApp ;</li>
                    <li>informations de la boutique : nom, logo, description, ville, produits, prix et stocks ;</li>
                    <li>numéro Mobile Money utilisé pour les retraits et les abonnements ;</li>
                    <li>historique des ventes, factures, abonnements et retraits.</li>
                </ul>
                <p><strong>Acheteurs :</strong></p>
                <ul>
                    <li>nom, numéro de téléphone Mobile Money, ville, adresse de livraison et, si vous le fournissez, e-mail ;</li>
                    <li>commandes passées, montants et références de paiement.</li>
                </ul>
                <p><strong>Données d’utilisation :</strong> pages consultées, actions effectuées sur la plateforme (ajout au panier, commandes, vues des liens de paiement), type d’appareil et de navigateur, adresse IP, journaux techniques et temps de chargement.</p>
            </>
        ),
    },
    {
        id: 'finalites',
        title: 'Pourquoi nous les utilisons',
        body: (
            <>
                <ul>
                    <li><strong>Fournir le service :</strong> afficher les boutiques, enregistrer les commandes, générer factures et reçus, permettre au vendeur de livrer.</li>
                    <li><strong>Traiter les paiements :</strong> transmettre la demande de paiement Mobile Money à notre prestataire de paiement et à l’opérateur, créditer le solde du vendeur, exécuter ses retraits.</li>
                    <li><strong>Communiquer :</strong> envoyer les confirmations de commande, reçus et notifications par e-mail ou WhatsApp, et répondre aux demandes d’assistance.</li>
                    <li><strong>Sécuriser la plateforme :</strong> prévenir la fraude, les usurpations de numéros, les contenus illicites et les abus.</li>
                    <li><strong>Améliorer et optimiser la plateforme :</strong> voir la section suivante.</li>
                    <li><strong>Respecter nos obligations légales :</strong> comptabilité, fiscalité et réponses aux autorités compétentes.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'optimisation',
        title: 'Amélioration et optimisation de la plateforme',
        body: (
            <>
                <p>Les données collectées sur Biolinko, en particulier les données d’utilisation et les données de vente, peuvent être <strong>exploitées et analysées par Biolinko à des fins d’optimisation et d’amélioration de la plateforme</strong>. Cela comprend notamment :</p>
                <ul>
                    <li>mesurer l’utilisation des fonctionnalités et la performance technique (vitesse, erreurs, taux de réussite des paiements) ;</li>
                    <li>comprendre les parcours d’achat afin d’améliorer la conversion des boutiques et le tunnel de paiement ;</li>
                    <li>concevoir de nouvelles fonctionnalités, ajuster nos offres et nos tarifs ;</li>
                    <li>produire des statistiques et indicateurs globaux (par exemple : volume de ventes par ville ou par catégorie) ;</li>
                    <li>détecter les comportements anormaux et renforcer la sécurité.</li>
                </ul>
                <Note>
                    Ces analyses sont réalisées autant que possible sur des données <strong>agrégées ou pseudonymisées</strong>. Les statistiques que nous pourrions partager ou publier ne permettent pas d’identifier un vendeur ou un acheteur. Nous ne vendons pas vos données personnelles.
                </Note>
            </>
        ),
    },
    {
        id: 'partage',
        title: 'Avec qui nous les partageons',
        body: (
            <>
                <p>Biolinko <strong>ne vend pas et ne loue pas</strong> vos données personnelles. Elles ne sont transmises qu’aux personnes et prestataires qui en ont besoin :</p>
                <ul>
                    <li><strong>Le vendeur</strong> chez qui vous commandez reçoit vos coordonnées et votre adresse pour traiter et livrer la commande. Il est responsable de l’usage qu’il en fait pour sa propre activité.</li>
                    <li><strong>Notre prestataire de paiement</strong> et les <strong>opérateurs Mobile Money</strong> (MTN, Orange) reçoivent le numéro et le montant nécessaires au paiement.</li>
                    <li><strong>Nos prestataires techniques</strong> (hébergement, envoi d’e-mails, messagerie WhatsApp) agissent sur nos instructions.</li>
                    <li><strong>Les autorités</strong> lorsque la loi nous y oblige.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'securite',
        title: 'Sécurité',
        body: (
            <ul>
                <li>Les échanges entre votre appareil et Biolinko sont chiffrés (HTTPS).</li>
                <li>Les mots de passe sont stockés sous forme hachée, jamais en clair.</li>
                <li>L’accès aux données est limité aux personnes qui en ont besoin pour leur mission.</li>
            </ul>
        ),
    },
    {
        id: 'conservation',
        title: 'Durée de conservation',
        body: (
            <>
                <p>Les données du compte vendeur sont conservées tant que le compte est actif. Les données de commandes et de transactions sont conservées pendant la durée nécessaire à nos obligations comptables et fiscales, puis supprimées ou anonymisées.</p>
                <p>Les données anonymisées et les statistiques agrégées peuvent être conservées sans limite de durée, car elles ne permettent plus de vous identifier.</p>
            </>
        ),
    },
    {
        id: 'droits',
        title: 'Vos droits',
        body: (
            <>
                <p>Vous pouvez à tout moment demander à <strong>accéder</strong> à vos données, les <strong>corriger</strong>, les <strong>supprimer</strong>, ou vous <strong>opposer</strong> à certains traitements, notamment à l’analyse de vos données d’utilisation lorsqu’elle n’est pas nécessaire au service.</p>
                <p>Les vendeurs peuvent modifier leurs informations depuis leur compte. Pour toute autre demande, écrivez-nous à l’adresse ci-dessous ; nous répondons dans un délai raisonnable.</p>
            </>
        ),
    },
    {
        id: 'contact',
        title: 'Contact',
        body: (
            <Note>Pour toute question sur cette politique ou pour exercer vos droits : <a href={`mailto:${CONTACT}`} className="font-medium text-[#141412] underline underline-offset-2">{CONTACT}</a></Note>
        ),
    },
];

export default function Privacy() {
    return (
        <LegalLayout
            title="Politique de confidentialité"
            intro="Quelles données Biolinko collecte, pourquoi, avec qui elles sont partagées et comment vous gardez la main dessus."
            updatedAt="25 octobre 2026"
            sections={sections}
        />
    );
}
