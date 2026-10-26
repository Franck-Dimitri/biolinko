import { Link } from '@inertiajs/react';
import LegalLayout, { Note } from '@/Components/LegalLayout';

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
                </ul>
            </>
        ),
    },
    {
        id: 'mesure',
        title: 'Mesure d’audience et optimisation',
        body: (
            <p>Biolinko peut mesurer l’utilisation de la plateforme (pages vues, parcours, performances) afin de l’optimiser et de l’améliorer, comme décrit dans notre <Link href={route('legal.privacy')} className="underline underline-offset-2">politique de confidentialité</Link>. Ces mesures sont exploitées sous forme agrégée.</p>
        ),
    },
    {
        id: 'vendeurs',
        title: 'Outils activés par les vendeurs',
        body: (
            <Note>
                Un vendeur peut choisir d’ajouter sur sa propre boutique des outils publicitaires ou de mesure (par exemple les pixels Facebook, TikTok ou Google). Dans ce cas, ces services tiers peuvent déposer leurs propres cookies lorsque vous visitez cette boutique ; leur usage relève de la politique du vendeur et de ces services. Biolinko n’utilise pas ces cookies pour son propre compte.
            </Note>
        ),
    },
    {
        id: 'duree',
        title: 'Durée de conservation',
        body: (
            <p>Les cookies de session expirent à la fermeture du navigateur ou à la déconnexion. Le panier et les coordonnées enregistrés localement restent sur votre appareil jusqu’à ce que vous les effaciez.</p>
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
            updatedAt="25 octobre 2026"
            sections={sections}
        />
    );
}
