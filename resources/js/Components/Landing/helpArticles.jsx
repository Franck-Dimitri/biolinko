/*
 * Contenu des guides du centre d'aide, par clé (même clé que App\Support\HelpCenter::ARTICLES).
 * Blocs : { h } sous-titre, { p } paragraphe, { steps } étapes numérotées, { list } liste, { tip } encadré.
 * Ne décrire que ce que l'application fait réellement.
 */
export const ARTICLES = {
    'creer-sa-boutique': [
        { p: 'Créer une boutique Biolinko est gratuit et prend quelques minutes, depuis votre téléphone.' },
        { h: 'Créer votre compte' },
        { steps: [
            'Sur l’accueil de biolinko.app, tapez l’adresse que vous voulez pour votre boutique (par exemple chez-awa.biolinko.store) : le site vous dit tout de suite si elle est libre.',
            'Appuyez sur « Créer ma boutique », puis indiquez votre nom, votre e-mail, votre numéro WhatsApp et un mot de passe.',
            'Vous recevez un code par e-mail : tapez-le pour confirmer votre adresse.',
        ] },
        { tip: 'Votre numéro WhatsApp est obligatoire : Biolinko s’en sert pour vous prévenir de vos ventes et vous assister.' },
        { h: 'Personnaliser votre boutique' },
        { p: 'Dans le menu, ouvrez « Apparence » :' },
        { list: [
            'votre logo et votre bannière ;',
            'vos couleurs et votre police ;',
            'les sections affichées (bandeau d’annonce, présentation, promotions, avis, à propos…) ;',
            'votre ville, vos horaires et vos réseaux sociaux.',
        ] },
        { h: 'Publier' },
        { p: 'Tant qu’elle n’est pas publiée, vous seul voyez votre boutique (aperçu privé). Quand vos premiers produits sont prêts, appuyez sur « Publier ma boutique » depuis l’accueil de votre tableau de bord.' },
    ],

    'ajouter-un-produit': [
        { p: 'Vos produits se gèrent dans le menu « Produits ».' },
        { steps: [
            'Appuyez sur « Nouveau produit ».',
            'Ajoutez une ou plusieurs photos, le nom, la description, le prix et la quantité en stock.',
            'Choisissez une catégorie pour que vos clients filtrent votre vitrine.',
            'Enregistrez : le produit apparaît dans votre boutique.',
        ] },
        { h: 'Tailles, couleurs et options' },
        { p: 'Un produit peut avoir des options (taille, couleur…), chacune avec son prix et son stock. La formule Starter permet une option par produit ; les formules payantes en permettent davantage.' },
        { h: 'Promotions' },
        { p: 'Avec une formule payante, indiquez un prix promo et, si vous le souhaitez, une date de début et une date de fin : le prix barré s’affiche et disparaît tout seul aux dates choisies.' },
        { h: 'Le stock' },
        { p: 'Le stock baisse automatiquement à chaque vente payée. À zéro, le produit s’affiche comme épuisé et ne peut plus être acheté.' },
        { tip: 'Le nombre de produits et de photos dépend de votre formule. Vous voyez votre limite dans « Abonnement ».' },
    ],

    'partager-et-vendre': [
        { p: 'Votre boutique a une adresse unique, votre-boutique.biolinko.store. C’est ce lien que vous partagez partout où sont vos clients.' },
        { list: [
            'WhatsApp : dans vos discussions, vos statuts et votre profil professionnel ;',
            'Instagram et TikTok : dans votre bio et vos stories ;',
            'Facebook : dans vos publications, vos groupes et Messenger.',
        ] },
        { h: 'Le lien d’un produit' },
        { p: 'Chaque produit a sa propre page. Sur la fiche produit, le bouton de partage copie son lien : envoyez-le au client qui vous demande le prix, il pourra commander et payer directement.' },
        { h: 'Les liens de paiement et les packs' },
        { p: 'Dans « Liens de paiement », créez un lien pour un produit ou un lot de produits à prix réduit. Collez-le dans une discussion : le client paie ce montant sans passer par la boutique.' },
        { tip: 'Quand un client vous écrit sur WhatsApp, répondez avec le lien du produit plutôt qu’avec votre numéro Mobile Money : le paiement est confirmé par l’opérateur, le client reçoit sa facture et un lien de suivi.' },
    ],

    'livraison-et-commandes': [
        { h: 'Vos tarifs de livraison' },
        { p: 'Dans « Livraison & promos », fixez un tarif par ville, un tarif pour les autres villes et, si vous voulez, un montant à partir duquel la livraison est offerte. Les frais de livraison vous reviennent entièrement : Biolinko ne prend aucune commission dessus.' },
        { h: 'Suivre vos commandes' },
        { p: 'Chaque commande payée apparaît dans « Commandes » et vous êtes prévenu. Faites-la avancer en un geste :' },
        { list: ['Payée : le client a payé, préparez la commande ;', 'En livraison : la commande est partie ;', 'Livrée : le client l’a reçue.'] },
        { h: 'Ce que voit votre client' },
        { p: 'Le client reçoit un lien de suivi et sa facture. Il voit l’état de sa commande à chaque étape, sans créer de compte, et peut vous contacter depuis cette page.' },
    ],

    'comment-le-client-paie': [
        { p: 'Vos clients paient avec MTN Mobile Money ou Orange Money, sans quitter votre boutique et sans application à installer.' },
        { steps: [
            'Le client remplit ses coordonnées et son adresse de livraison.',
            'Il choisit son moyen de paiement (MTN ou Orange) et le numéro à débiter.',
            'Il appuie sur « Payer » : une demande arrive sur son téléphone et il la valide avec son code secret.',
            'Dès que l’opérateur confirme, il arrive sur sa page de suivi avec sa facture.',
        ] },
        { h: 'Les frais de paiement' },
        { p: 'Des frais de paiement Mobile Money de 3,5 % sont ajoutés au prix, payés par le client. Ils sont affichés dans son récapitulatif avant qu’il paie.' },
        { h: 'L’acompte' },
        { p: 'Dans « Livraison & promos », vous pouvez proposer un acompte : le client paie une partie en ligne et le reste en espèces au livreur.' },
        { tip: 'Si la demande n’arrive pas sur le téléphone du client, il peut la relancer depuis sa page de suivi.' },
    ],

    'recevoir-son-argent': [
        { h: 'Votre portefeuille' },
        { p: 'Chaque vente payée apparaît tout de suite dans « Portefeuille », d’abord en attente. Pour protéger vos clients, elle devient disponible une fois la commande reçue :' },
        { list: ['dès que le client confirme la réception depuis son suivi de commande ;', '3 jours après que vous avez marqué la commande « Livrée », si le client ne signale aucun problème ;', 'au plus tard 14 jours après le paiement.'] },
        { p: 'Marquez vos commandes « Livrée » dès la livraison : c’est ce qui déclenche le versement. Si un client signale un problème, seule la vente concernée reste en attente.' },
        { h: 'Avant votre premier retrait' },
        { steps: [
            'Faites vérifier votre identité : une pièce d’identité et un selfie, depuis « Portefeuille ». La vérification prend 24 à 48 h.',
            'Enregistrez votre numéro de retrait, à votre nom. Vos retraits partiront uniquement vers ce numéro.',
        ] },
        { p: 'Pour votre sécurité, un changement de numéro de retrait ne prend effet qu’après 48 h, et vous êtes prévenu par e-mail.' },
        { h: 'Faire un retrait' },
        { steps: [
            'Dans « Portefeuille », appuyez sur « Retirer ».',
            'Indiquez le montant (1 000 FCFA minimum) : l’argent part vers votre numéro de retrait enregistré.',
            'Appuyez sur « Demander le retrait » : après vérification, le virement part sur votre numéro Mobile Money.',
        ] },
        { tip: 'Les retraits sont gratuits : vous recevez la totalité du montant retiré. Si un virement échoue, l’argent revient sur votre solde.' },
    ],

    'rembourser-et-signalements': [
        { h: 'Rembourser un client' },
        { p: 'Ouvrez la commande dans « Commandes », puis appuyez sur « Rembourser le client ». Choisissez le montant (tout ou partie de la vente) et la raison.' },
        { list: [
            'le montant est renvoyé sur le Mobile Money du client ;',
            'il est débité de votre solde ;',
            'la commission Biolinko correspondante vous est rendue ;',
            'les frais de paiement payés par le client ne sont pas remboursés.',
        ] },
        { h: 'Quand un client signale un problème' },
        { p: 'Tant que l’argent de la vente est en attente, le client peut signaler un problème depuis sa page de suivi. Vous êtes prévenu et vous recevez son numéro pour trouver une solution avec lui.' },
        { steps: [
            'Répondez au signalement depuis la commande.',
            'Réglez le problème avec le client (échange, livraison, remboursement…).',
            'La vente est libérée dès que le client indique que c’est résolu, ou automatiquement s’il ne réagit pas dans les 3 jours suivant votre réponse.',
        ] },
    ],

    'formules-et-abonnement': [
        { h: 'Une seule commission par vente' },
        { p: 'Biolinko prend une commission sur le prix de vos articles, selon votre formule : 10 % en Starter (gratuit), 8 % en Pro, 6 % en Growth et 4 % en Business. Pas de commission sur la livraison, et les retraits sont gratuits.' },
        { p: 'Les formules payantes donnent aussi plus de produits, de photos, de liens de paiement et de codes promo, les options de produit, les pixels publicitaires et les campagnes WhatsApp.' },
        { h: 'Payer son abonnement' },
        { p: 'Dans « Abonnement », choisissez votre formule et sa durée (1 mois, 1 an ou 2 ans), puis payez par Mobile Money ou avec votre solde Biolinko.' },
        { h: 'Le renouvellement' },
        { list: [
            'à l’échéance, un mois est payé automatiquement depuis votre solde s’il est suffisant ;',
            'vous êtes prévenu 7, 4 et 2 jours avant ;',
            'vous pouvez désactiver le renouvellement automatique à tout moment et payer vous-même.',
        ] },
        { tip: 'Sans paiement, votre boutique repasse sur la formule Starter : vous ne perdez ni vos produits ni vos ventes.' },
    ],
};
