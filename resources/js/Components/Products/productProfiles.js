/**
 * Formulaire produit adapté à l'activité de la boutique : exemples, champs utiles et options proposées.
 * Un champ absent d'une activité n'est jamais affiché (ex. pas de stock pour une prestation).
 *
 * made     : produit préparé à la demande par défaut (délai au lieu du stock)
 * service  : prestation (durée, pas de stock)
 * variants : libellés des variantes (b: null = une seule colonne), null = pas de variantes
 * specs    : titre et exemples des lignes « libellé : valeur », null = pas proposé
 * open     : options ouvertes d'office pour un nouveau produit
 * extras   : options proposées en « + Ajouter »
 */
const COMMON = ['promo', 'category', 'seo'];

const PROFILES = {
    mode: {
        name: 'Ex. Robe pagne évasée', desc: 'Matière, coupe, conseils d’entretien…',
        variants: { title: 'Tailles et couleurs', a: 'Taille (M, 42…)', b: 'Couleur' },
        specs: { title: 'Matière et entretien', ex: ['Matière', 'Coton wax'] },
        open: ['variants'], extras: ['variants', 'specs', ...COMMON, 'min_qty', 'made_to_order'],
    },
    accessoires: {
        name: 'Ex. Sac à main en cuir', desc: 'Matière, dimensions, finitions…',
        variants: { title: 'Tailles et couleurs', a: 'Taille ou pointure', b: 'Couleur' },
        specs: { title: 'Caractéristiques', ex: ['Matière', 'Cuir véritable'] },
        open: [], extras: ['variants', 'specs', ...COMMON, 'min_qty'],
    },
    beaute: {
        name: 'Ex. Beurre de karité 250 ml', desc: 'Bienfaits, mode d’emploi, type de peau…',
        variants: { title: 'Formats', a: 'Format (100 ml, 250 ml…)', b: 'Parfum ou teinte' },
        specs: { title: 'Composition', ex: ['Ingrédients', 'Beurre de karité pur'] },
        open: [], extras: ['specs', 'variants', ...COMMON, 'min_qty'],
    },
    electronique: {
        name: 'Ex. iPhone 13 128 Go', desc: 'État (neuf, reconditionné), garantie, accessoires fournis…',
        variants: { title: 'Modèles', a: 'Capacité (128 Go…)', b: 'Couleur' },
        specs: { title: 'Caractéristiques techniques', ex: ['Stockage', '128 Go'] },
        open: ['specs'], extras: ['specs', 'variants', ...COMMON, 'min_qty'],
    },
    alimentation: {
        name: 'Ex. Riz parfumé 5 kg', desc: 'Origine, conservation, conditionnement…',
        variants: { title: 'Formats', a: 'Format (1 kg, 5 kg…)', b: null },
        specs: { title: 'Composition', ex: ['Origine', 'Cameroun'] },
        open: [], extras: ['variants', 'specs', ...COMMON, 'min_qty'],
    },
    maison: {
        name: 'Ex. Table basse en bois', desc: 'Matière, dimensions, montage…',
        variants: { title: 'Dimensions et couleurs', a: 'Dimension', b: 'Couleur' },
        specs: { title: 'Caractéristiques', ex: ['Dimensions', '120 × 60 cm'] },
        open: [], extras: ['specs', 'variants', ...COMMON, 'min_qty', 'made_to_order'],
    },
    sante: {
        name: 'Ex. Tisane détox 30 sachets', desc: 'Bienfaits, conseils d’utilisation, précautions…',
        variants: { title: 'Formats', a: 'Format (30 sachets…)', b: null },
        specs: { title: 'Composition', ex: ['Ingrédients', 'Citronnelle, gingembre'] },
        open: [], extras: ['specs', 'variants', ...COMMON, 'min_qty'],
    },
    enfants: {
        name: 'Ex. Ensemble bébé 6-12 mois', desc: 'Âge conseillé, matière, entretien…',
        variants: { title: 'Âges et couleurs', a: 'Âge ou taille', b: 'Couleur' },
        specs: { title: 'Caractéristiques', ex: ['Âge conseillé', '3 ans et plus'] },
        open: [], extras: ['variants', 'specs', ...COMMON, 'min_qty'],
    },
    patisserie: {
        made: true, name: 'Ex. Gâteau d’anniversaire au chocolat', desc: 'Parfums, décoration, pour combien de personnes…',
        variants: null,
        specs: { title: 'Ingrédients et allergènes', ex: ['Allergènes', 'Œufs, lait, gluten'] },
        open: ['client_fields'], extras: ['client_fields', 'capacity', 'specs', ...COMMON, 'in_stock'],
    },
    restauration: {
        made: true, name: 'Ex. Poulet DG et plantain', desc: 'Accompagnement, quantité, niveau d’épices…',
        variants: { title: 'Portions', a: 'Portion (simple, double…)', b: null },
        specs: { title: 'Ingrédients et allergènes', ex: ['Allergènes', 'Arachide'] },
        open: [], extras: ['variants', 'client_fields', 'capacity', 'specs', ...COMMON],
    },
    couture: {
        made: true, name: 'Ex. Robe de soirée sur mesure', desc: 'Tissu, finitions, ce qui est compris…',
        variants: null,
        specs: { title: 'Détails de confection', ex: ['Tissu', 'Wax ou bazin'] },
        open: ['client_fields'], extras: ['client_fields', 'capacity', 'specs', ...COMMON, 'in_stock'],
    },
    artisanat: {
        made: true, name: 'Ex. Tableau personnalisé', desc: 'Matière, dimensions, personnalisation possible…',
        variants: { title: 'Tailles et couleurs', a: 'Taille', b: 'Couleur' },
        specs: { title: 'Caractéristiques', ex: ['Dimensions', '40 × 60 cm'] },
        open: ['client_fields'], extras: ['client_fields', 'variants', 'capacity', 'specs', ...COMMON, 'in_stock'],
    },
    services: {
        made: true, service: true, name: 'Ex. Tresses africaines', desc: 'Ce qui est compris, lieu, matériel fourni…', price: 'Prix de la prestation',
        variants: { title: 'Formules', a: 'Formule (courte, longue…)', b: null },
        specs: null,
        open: [], extras: ['variants', 'client_fields', 'capacity', ...COMMON],
    },
    autre: {
        name: 'Ex. Nom de votre produit', desc: 'Ce qui le rend utile, ce qui est compris…',
        variants: { title: 'Variantes', a: 'Taille, format…', b: 'Couleur' },
        specs: { title: 'Caractéristiques', ex: ['Matière', 'Coton'] },
        open: [], extras: ['variants', 'specs', ...COMMON, 'min_qty', 'made_to_order'],
    },
};

export const productProfile = (businessType) => PROFILES[businessType] || PROFILES.autre;

/** Libellé des boutons « + Ajouter ». */
export const EXTRA_LABELS = {
    variants: null, // pris dans le profil (« Tailles et couleurs », « Formats »…)
    specs: null,
    promo: 'Promotion',
    category: 'Catégorie',
    seo: 'Référencement Google',
    min_qty: 'Quantité minimum',
    made_to_order: 'Fabriqué sur commande',
    in_stock: 'Déjà prêt, en stock',
    capacity: 'Limite de commandes par jour',
    client_fields: 'Infos demandées au client',
};
