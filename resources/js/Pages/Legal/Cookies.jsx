import { Link } from '@inertiajs/react';
import LegalLayout, { Note } from '@/Layouts/LegalLayout';
import { openConsent } from '@/Components/consent';

const sections = [
    {
        id: 'definition',
        title: 'Qu’est-ce qu’un cookie ?',
        body: (
            <p>Un cookie est un petit fichier enregistré par votre navigateur lorsque vous visitez un site. Il permet par exemple de garder votre session ouverte ou de mémoriser vos préférences. Biolinko utilise aussi le stockage local de votre navigateur, qui fonctionne de façon similaire.</p>
        ),
    },
    {
        id: 'essentiels',
        title: 'Cookies et stockage essentiels',
        body: (
            <>
                <p>Ils sont indispensables au fonctionnement de Biolinko et ne peuvent pas être désactivés sans casser le service :</p>
                <ul>
                    <li><strong>Session et sécurité</strong> : maintiennent votre connexion au tableau de bord et protègent les formulaires contre les requêtes frauduleuses (jeton CSRF).</li>
                    <li><strong>Panier</strong> : conserve les articles ajoutés au panier d’une boutique (stockage local du navigateur).</li>
                    <li><strong>Coordonnées de commande</strong> : mémorisent votre nom et numéro pour pré-remplir vos prochaines commandes sur cet appareil (stockage local).</li>
                    <li><strong>Choix faits sur la page d’accueil</strong> : la formule ou l’adresse de boutique choisies avant l’inscription sont gardées le temps de la session, pour vous les proposer à la création du compte.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'choix',
        title: 'Votre choix',
        body: (
            <>
                <p>À votre première visite, un bandeau vous propose d’<strong>accepter</strong> ou de <strong>refuser</strong> les outils de mesure et de publicité. Refuser est aussi simple qu’accepter et ne vous empêche ni de naviguer ni de commander.</p>
                <p>Votre choix est gardé 6 mois dans un cookie <code>biolinko_consent</code>, valable sur le site et sur toutes les boutiques Biolinko. Vous pouvez le changer à tout moment :</p>
                <p><button type="button" onClick={openConsent} className="rounded-full border border-black/15 px-4 py-2 text-[14px] font-medium hover:border-black/40">Gérer mes cookies</button></p>
            </>
        ),
    },
    {
        id: 'mesure',
        title: 'Mesure d’audience de Biolinko',
        body: (
            <p>Biolinko compte les pages vues des boutiques et du site (pays, type d’appareil, site d’où vient la visite) pour donner leurs statistiques aux vendeurs et améliorer la plateforme. Cette mesure ne dépose aucun cookie et n’enregistre pas votre adresse IP : seule une empreinte anonyme, renouvelée chaque jour, permet de ne pas compter deux fois la même visite. Si vous refusez les cookies, vos visites ne sont pas comptées. Voir aussi notre <Link href={route('legal.privacy')} className="underline underline-offset-2">politique de confidentialité</Link>.</p>
        ),
    },
    {
        id: 'vendeurs',
        title: 'Outils activés par les vendeurs',
        body: (
            <Note>
                Un vendeur peut ajouter sur sa boutique des outils publicitaires ou de mesure (pixels Meta, TikTok ou Google). Ils ne sont chargés <strong>que si vous avez accepté les cookies</strong>. Ces services tiers déposent alors leurs propres cookies ; leur usage relève de la politique du vendeur et de ces services. Biolinko n’utilise pas ces cookies pour son propre compte.
            </Note>
        ),
    },
    {
        id: 'duree',
        title: 'Durée de conservation',
        body: (
            <p>Les cookies de session expirent à la fermeture du navigateur ou à la déconnexion. Votre choix sur les cookies est gardé 6 mois, puis le bandeau vous est proposé à nouveau. Le panier et les coordonnées enregistrés localement restent sur votre appareil jusqu’à ce que vous les effaciez.</p>
        ),
    },
    {
        id: 'gerer',
        title: 'Gérer les cookies',
        body: (
            <>
                <p>Vous pouvez à tout moment supprimer ou bloquer les cookies et le stockage local depuis les réglages de votre navigateur :</p>
                <ul>
                    <li><strong>Chrome</strong> : Paramètres › Confidentialité et sécurité › Cookies et autres données des sites.</li>
                    <li><strong>Safari</strong> : Réglages › Safari › Avancé › Données de sites web.</li>
                    <li><strong>Firefox</strong> : Paramètres › Vie privée et sécurité › Cookies et données de sites.</li>
                </ul>
                <p>Bloquer les cookies essentiels peut empêcher la connexion ou le passage de commande.</p>
            </>
        ),
    },
];

export default function Cookies() {
    return (
        <LegalLayout
            title="Politique cookies"
            intro="Les cookies et le stockage utilisés sur Biolinko, à quoi ils servent et comment les contrôler."
            updatedAt="24 novembre 2026"
            sections={sections}
        />
    );
}
