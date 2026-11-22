import { Link } from '@inertiajs/react';
import LegalLayout, { Note } from '@/Layouts/LegalLayout';

const sections = [
    {
        id: 'objet',
        title: 'Objet',
        body: (
            <>
                <p>Biolinko est une plateforme en ligne qui permet aux vendeurs de créer une boutique, de gérer leurs produits, commandes, factures et clients, de partager des liens de paiement et d’encaisser leurs ventes par Mobile Money.</p>
                <p>Les présentes conditions d’utilisation (« CGU ») s’appliquent à toute personne qui utilise Biolinko, qu’elle vende (« vendeur ») ou achète sur une boutique (« acheteur »). Créer un compte ou passer une commande vaut acceptation des CGU.</p>
            </>
        ),
    },
    {
        id: 'compte',
        title: 'Compte vendeur',
        body: (
            <>
                <p>Pour ouvrir une boutique, le vendeur fournit des informations exactes : nom, adresse e-mail et <strong>numéro WhatsApp</strong> (obligatoire, il sert à l’alerter de ses ventes et à l’assister). Il confirme son adresse e-mail avec un code reçu par e-mail.</p>
                <p>Chaque compte dispose d’une seule boutique, accessible à une adresse de la forme <strong>nom-de-la-boutique.biolinko.store</strong>. Une adresse choisie à l’inscription est attribuée si elle est libre ; à défaut, une adresse proche est proposée. Certaines adresses sont réservées au fonctionnement de la plateforme.</p>
                <p>Le vendeur est responsable de la confidentialité de ses identifiants : toute action réalisée depuis son compte est réputée faite par lui.</p>
            </>
        ),
    },
    {
        id: 'role',
        title: 'Rôle de Biolinko',
        body: (
            <>
                <Note>Biolinko fournit l’outil technique. <strong>Biolinko n’est pas le vendeur</strong> des produits proposés sur les boutiques.</Note>
                <p>Chaque vendeur est seul responsable de ses produits, de leurs descriptions et prix, de ses stocks, de la livraison, du service après-vente et du respect des lois applicables à son activité.</p>
                <p>La vente est conclue directement entre le vendeur et l’acheteur. Biolinko agit comme intermédiaire technique et n’est pas responsable des litiges, pertes ou dommages liés à une vente (non-livraison, non-conformité, retard). Les outils décrits ci-dessous (délai de disponibilité, signalement) sont un service d’aide à la confiance, <strong>pas une garantie de remboursement</strong>.</p>
            </>
        ),
    },
    {
        id: 'paiements',
        title: 'Paiements et frais',
        body: (
            <>
                <p>Les acheteurs paient par Mobile Money (MTN Mobile Money et Orange Money au Cameroun). Le paiement est confirmé lorsque l’acheteur valide la demande sur son téléphone.</p>
                <ul>
                    <li>Des <strong>frais de paiement Mobile Money de 3,5 %</strong> sont ajoutés au montant payé par l’acheteur. Ils couvrent les frais de l’opérateur de paiement.</li>
                    <li>Sur chaque vente payée, Biolinko prélève une <strong>commission</strong> sur le prix fixé par le vendeur, selon sa formule au moment du paiement : <strong>10 %</strong> (Starter), <strong>8 %</strong> (Pro), <strong>6 %</strong> (Growth) et <strong>4 %</strong> (Business). Cette commission est la seule rémunération de Biolinko sur la vente : elle ne porte pas sur les frais de livraison, qui reviennent entièrement au vendeur. Le montant net est indiqué sur chaque commande.</li>
                    <li>Les retraits vers Mobile Money sont <strong>gratuits</strong> : le vendeur reçoit la totalité du montant retiré. Si le virement échoue, la totalité est rendue au solde du vendeur.</li>
                    <li>Les sommes encaissées sont créditées sur le solde Biolinko du vendeur. Pour protéger l’acheteur, chaque vente devient retirable <strong>une fois la commande reçue</strong> : dès que l’acheteur confirme la réception, ou <strong>3 jours</strong> après que le vendeur l’a marquée livrée sans signalement, et au plus tard <strong>14 jours</strong> après le paiement. Un signalement de l’acheteur suspend ce délai. Le premier retrait est subordonné à la <strong>vérification de l’identité</strong> du vendeur (pièce d’identité et photo), et les retraits sont versés uniquement sur le numéro Mobile Money enregistré par le vendeur à son nom ; tout changement de ce numéro prend effet après 48 heures.</li>
                    <li>Pendant ce délai, l’acheteur peut <strong>signaler un problème</strong> depuis la page de suivi de sa commande. La vente concernée reste alors en attente le temps que le vendeur et l’acheteur trouvent une solution entre eux. Elle est libérée dès que l’acheteur indique que le problème est résolu, ou automatiquement si l’acheteur ne réagit pas dans les 3 jours suivant la réponse du vendeur. Biolinko ne tranche pas les litiges entre vendeurs et acheteurs.</li>
                    <li>Une boutique qui reçoit des signalements répétés peut voir ses retraits vérifiés plus attentivement, suspendus, ou son compte fermé en cas d’abus manifeste.</li>
                    <li>Les retraits sont traités après les vérifications de sécurité nécessaires.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'commandes',
        title: 'Commandes, livraison et remboursements',
        body: (
            <>
                <ul>
                    <li><strong>Commande :</strong> l’acheteur indique son nom, son numéro Mobile Money, son <strong>numéro WhatsApp</strong>, sa ville et son adresse de livraison. Il reçoit un lien de suivi et une facture établie au nom du vendeur.</li>
                    <li><strong>Livraison :</strong> le vendeur fixe librement ses frais de livraison (par ville, livraison offerte à partir d’un montant, ou à convenir). Ces frais lui reviennent intégralement et ne supportent pas de commission.</li>
                    <li><strong>Acompte :</strong> si le vendeur l’active, l’acheteur peut payer une partie en ligne et le reste en espèces au livreur. La commission porte sur la totalité de la vente et est prélevée sur la part payée en ligne.</li>
                    <li><strong>Codes promo et promotions :</strong> les réductions sont définies par le vendeur, qui en fixe les conditions et la durée.</li>
                    <li><strong>Remboursement :</strong> le vendeur peut rembourser tout ou partie d’une vente payée en ligne. Le montant est renvoyé sur le Mobile Money de l’acheteur et débité du solde du vendeur ; la commission correspondante est annulée en proportion. Les frais de paiement Mobile Money payés par l’acheteur ne sont pas remboursés.</li>
                    <li><strong>Commandes impayées :</strong> une commande non payée peut faire l’objet de rappels, puis être annulée automatiquement après un délai.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'abonnements',
        title: 'Abonnements',
        body: (
            <>
                <p>Le plan <strong>Starter</strong> est gratuit. Les plans <strong>Pro</strong>, <strong>Growth</strong> et <strong>Business</strong> donnent accès à des fonctionnalités et limites supplémentaires, décrites sur la page <Link href="/#tarifs" className="underline underline-offset-2">Tarifs</Link>.</p>
                <ul>
                    <li>Durées proposées : 1 mois, 1 an (−15 %) ou 2 ans (−20 %), payées en une fois par Mobile Money.</li>
                    <li>Un plan en cours peut être prolongé à tout moment : la nouvelle durée s’ajoute à l’échéance actuelle.</li>
                    <li><strong>Renouvellement automatique :</strong> par défaut, à l’échéance, un mois du même plan est payé automatiquement depuis le solde Biolinko du vendeur, s’il est suffisant. Le vendeur est prévenu <strong>7, 4 et 2 jours</strong> avant l’échéance.</li>
                    <li>Le vendeur peut <strong>désactiver le renouvellement automatique</strong> à tout moment depuis son espace et payer lui-même, par Mobile Money ou avec son solde.</li>
                    <li>Si le solde est insuffisant, le prélèvement est retenté pendant quelques jours. Sans paiement, la boutique repasse sur les limites du plan Starter, sans perte de ses données.</li>
                    <li>Les sommes payées pour une période commencée ne sont pas remboursables, sauf erreur de notre part.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'interdits',
        title: 'Produits et contenus interdits',
        body: (
            <>
                <p>Il est interdit de vendre ou de promouvoir sur Biolinko :</p>
                <ul>
                    <li>des produits illégaux, contrefaits ou volés ;</li>
                    <li>des contenus violents, pornographiques ou haineux ;</li>
                    <li>des médicaments ou substances dangereuses sans autorisation ;</li>
                    <li>toute arnaque, hameçonnage ou usurpation d’identité.</li>
                </ul>
                <p>En cas de manquement, Biolinko peut suspendre la boutique, bloquer le compte et retenir à titre conservatoire les fonds liés aux ventes litigieuses.</p>
            </>
        ),
    },
    {
        id: 'avis',
        title: 'Avis clients',
        body: (
            <>
                <p>Les acheteurs peuvent laisser un avis (note et commentaire) sur une boutique ou un produit. L’avis doit être sincère, porter sur une expérience réelle et respecter les règles de la section précédente.</p>
                <p>Le vendeur peut mettre en avant ou retirer les avis publiés sur sa boutique. Biolinko peut supprimer un avis manifestement faux, injurieux ou illicite.</p>
            </>
        ),
    },
    {
        id: 'donnees',
        title: 'Données et amélioration du service',
        body: (
            <>
                <p>Biolinko traite les données des vendeurs et des acheteurs conformément à sa <Link href={route('legal.privacy')} className="underline underline-offset-2">politique de confidentialité</Link>.</p>
                <p>En utilisant la plateforme, vous acceptez que les données d’utilisation et de vente soient <strong>exploitées par Biolinko à des fins d’optimisation et d’amélioration de la plateforme</strong> (performance, nouvelles fonctionnalités, statistiques globales), dans les conditions décrites dans la politique de confidentialité.</p>
            </>
        ),
    },
    {
        id: 'propriete',
        title: 'Propriété intellectuelle',
        body: (
            <p>La plateforme Biolinko (code, interfaces, marque, logo) appartient à Biolinko. Le vendeur reste propriétaire des contenus qu’il publie (photos, textes, logo) et autorise Biolinko à les afficher pour faire fonctionner sa boutique.</p>
        ),
    },
    {
        id: 'responsabilite',
        title: 'Disponibilité et responsabilité',
        body: (
            <p>Biolinko met tout en œuvre pour que la plateforme soit disponible et fiable, sans pouvoir garantir une absence totale d’interruption, notamment en cas de panne des opérateurs Mobile Money ou de nos prestataires techniques.</p>
        ),
    },
    {
        id: 'modifications',
        title: 'Modifications et résiliation',
        body: (
            <>
                <p>Biolinko peut faire évoluer les CGU. Les changements importants sont annoncés sur la plateforme avant leur entrée en vigueur.</p>
                <p>Le vendeur peut fermer son compte à tout moment depuis son espace ou en nous écrivant.</p>
            </>
        ),
    },
    {
        id: 'droit',
        title: 'Droit applicable',
        body: (
            <p>Les CGU sont soumises au droit camerounais. En cas de litige, les parties recherchent d’abord une solution amiable avant de saisir les juridictions compétentes.</p>
        ),
    },
];

export default function Terms() {
    return (
        <LegalLayout
            title="Conditions d’utilisation"
            intro="Les règles qui encadrent l’utilisation de Biolinko par les vendeurs et les acheteurs."
            updatedAt="12 novembre 2026"
            sections={sections}
        />
    );
}
