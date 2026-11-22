<?php

namespace App\Support;

/**
 * Modèles de boutique par activité : vocabulaire de la vitrine, type de produit par défaut
 * et champs suggérés. Une pâtissière, une couturière ou un prestataire de services ont ainsi
 * une boutique adaptée, pas seulement les vendeurs d'articles en stock.
 */
class BusinessTypes
{
    public const SLOTS = ['matin' => 'Matin (8 h - 12 h)', 'midi' => 'Midi (12 h - 14 h)', 'apres-midi' => 'Après-midi (14 h - 18 h)', 'soir' => 'Soir (18 h - 21 h)'];

    /**
     * Motifs de chaque activité (au moins 3, jamais partagés entre activités), dessinés avec de vraies icônes
     * dans Components/Storefront/patterns.jsx. Le premier est celui du style de l'activité.
     */
    public const PATTERNS_BY_TYPE = [
        'mode' => ['mode-wax', 'mode-vetements', 'mode-etiquettes'],
        'accessoires' => ['accessoires-montres', 'accessoires-bijoux', 'accessoires-sacs'],
        'beaute' => ['beaute-fleurs', 'beaute-eclat', 'beaute-soins'],
        'electronique' => ['electronique-appareils', 'electronique-audio', 'electronique-tech'],
        'alimentation' => ['alimentation-fruits', 'alimentation-potager', 'alimentation-epicerie'],
        'maison' => ['maison-mobilier', 'maison-deco', 'maison-foyer'],
        'sante' => ['sante-nature', 'sante-forme', 'sante-soin'],
        'enfants' => ['enfants-jouets', 'enfants-bebe', 'enfants-fete'],
        'patisserie' => ['patisserie-croissants', 'patisserie-gateaux', 'patisserie-gourmandises'],
        'restauration' => ['restauration-couverts', 'restauration-cuisine', 'restauration-plats'],
        'couture' => ['couture-ciseaux', 'couture-mesure', 'couture-boutons'],
        'artisanat' => ['artisanat-peinture', 'artisanat-outils', 'artisanat-creation'],
        'services' => ['services-reparation', 'services-rendezvous', 'services-contact'],
        'autre' => ['autre-points', 'autre-grille', 'autre-vagues'],
    ];

    /** Tous les motifs acceptés (« none » = sans motif). */
    public static function patterns(): array
    {
        return ['none', ...array_merge(...array_values(self::PATTERNS_BY_TYPE))];
    }

    public const FONTS = ['Poppins', 'Inter', 'Roboto', 'Playfair Display'];

    /** Ordre des sections pour les boutiques sur commande et de services : le catalogue et la confiance d'abord. */
    private const SECTIONS_STOCK = [['banner', true], ['hero', true], ['products', true], ['promotions', true], ['smartlinks', true], ['benefits', true], ['reviews', true], ['about', true]];

    private const SECTIONS_ORDER = [['banner', true], ['hero', true], ['products', true], ['reviews', true], ['benefits', true], ['about', true], ['promotions', true], ['smartlinks', false]];

    private const SECTIONS_SERVICES = [['banner', true], ['hero', true], ['products', true], ['benefits', true], ['reviews', true], ['about', true], ['promotions', false], ['smartlinks', false]];

    /**
     * Style de chaque activité : couleur, police, forme, motif, ordre des sections, avantages et textes d'accueil suggérés.
     * Le vendeur l'applique en un clic depuis « Apparence », puis peut tout changer.
     */
    private static function style(string $color, string $font, string $radius, array $sections, ?array $benefits = null, ?array $hero = null): array
    {
        return [
            'style' => ['theme_color' => $color, 'font_family' => $font, 'border_radius_style' => $radius, 'pattern' => null], // motif : premier de PATTERNS_BY_TYPE
            'sections' => array_map(fn ($s) => ['id' => $s[0], 'enabled' => $s[1]], $sections),
            'benefits' => $benefits,
            'hero' => $hero,
        ];
    }

    private static function benefits(array $pairs): array
    {
        return array_map(fn ($p) => ['title' => $p[0], 'subtitle' => $p[1]], $pairs);
    }

    /** Délais de préparation proposés (heures). */
    public const LEAD_TIMES = [0 => 'Prêt tout de suite', 2 => '2 heures', 24 => '24 heures', 48 => '48 heures', 72 => '3 jours', 168 => '1 semaine', 336 => '2 semaines'];

    public static function all(): array
    {
        $stock = ['fulfillment' => 'stock', 'cta' => 'Ajouter au panier', 'lead_time_hours' => null, 'date_label' => null, 'fields' => []];
        $order = ['fulfillment' => 'made_to_order', 'cta' => 'Commander', 'date_label' => 'Date de livraison ou de retrait souhaitée'];

        $pay = ['Paiement Mobile Money', 'MTN MoMo et Orange Money, validé sur votre téléphone'];
        $track = ['Suivi de commande', 'Un lien pour suivre votre commande à tout moment'];
        $styles = [
            'mode' => static::style('#141412', 'Inter', 'square', self::SECTIONS_STOCK),
            'accessoires' => static::style('#B45309', 'Poppins', 'rounded', self::SECTIONS_STOCK),
            'beaute' => static::style('#BE185D', 'Playfair Display', 'rounded', self::SECTIONS_STOCK),
            'electronique' => static::style('#2563EB', 'Inter', 'square', self::SECTIONS_STOCK),
            'alimentation' => static::style('#16A34A', 'Poppins', 'rounded', self::SECTIONS_STOCK),
            'maison' => static::style('#A16207', 'Playfair Display', 'rounded', self::SECTIONS_STOCK),
            'sante' => static::style('#0D9488', 'Poppins', 'rounded', self::SECTIONS_STOCK),
            'enfants' => static::style('#F97316', 'Poppins', 'rounded', self::SECTIONS_STOCK),
            'patisserie' => static::style('#BE185D', 'Playfair Display', 'rounded', self::SECTIONS_ORDER,
                static::benefits([['Fait maison, sur commande', 'Préparé pour la date que vous choisissez'], ['Personnalisable', 'Message, parfum, nombre de parts'], $pay, ['Livraison soignée', 'Livré ou à retirer, au créneau choisi']]),
                ['badge' => 'Fait maison', 'title' => 'Des gâteaux faits pour vos plus beaux moments', 'subtitle' => 'Commandez en ligne : choisissez la date, le nombre de parts et votre message.', 'cta' => 'Commander un gâteau']),
            'restauration' => static::style('#DC2626', 'Poppins', 'rounded', self::SECTIONS_ORDER,
                static::benefits([['Préparé à la commande', 'Cuisiné frais, pour l’heure choisie'], ['Livraison rapide', 'Livré chez vous ou à emporter'], $pay, $track]),
                ['badge' => 'Cuisiné à la commande', 'title' => 'Vos plats préférés, préparés pour vous', 'subtitle' => 'Commandez en ligne, payez en Mobile Money et recevez votre repas à l’heure choisie.', 'cta' => 'Voir le menu']),
            'couture' => static::style('#7C3AED', 'Playfair Display', 'square', self::SECTIONS_ORDER,
                static::benefits([['Sur mesure', 'Cousu selon vos mensurations'], ['Tissu au choix', 'Indiquez vos préférences à la commande'], $pay, $track]),
                ['badge' => 'Sur mesure', 'title' => 'Des tenues cousues à vos mesures', 'subtitle' => 'Choisissez votre modèle, donnez vos mensurations et suivez la confection.', 'cta' => 'Commander une tenue']),
            'artisanat' => static::style('#B45309', 'Playfair Display', 'rounded', self::SECTIONS_ORDER,
                static::benefits([['Fait main', 'Chaque pièce est préparée pour vous'], ['Personnalisable', 'Prénom, texte, couleurs à votre goût'], $pay, $track]),
                ['badge' => 'Fait main', 'title' => 'Des créations uniques, faites pour vous', 'subtitle' => 'Commandez une pièce personnalisée et payez en Mobile Money.', 'cta' => 'Voir les créations']),
            'services' => static::style('#0F766E', 'Inter', 'rounded', self::SECTIONS_SERVICES,
                static::benefits([['Réservation en ligne', 'Choisissez la prestation et la date'], ['Confirmation rapide', 'Le prestataire vous recontacte sur WhatsApp'], $pay, ['Reçu automatique', 'Votre reçu envoyé après le paiement']]),
                ['badge' => 'Sur réservation', 'title' => 'Réservez votre prestation en quelques clics', 'subtitle' => 'Choisissez la prestation, la date qui vous convient et payez en Mobile Money.', 'cta' => 'Réserver']),
            'autre' => static::style('#FFCC00', 'Poppins', 'rounded', self::SECTIONS_STOCK),
        ];

        $types = [
            'mode' => ['label' => 'Mode et vêtements'] + $stock,
            'accessoires' => ['label' => 'Accessoires et chaussures'] + $stock,
            'beaute' => ['label' => 'Beauté et cosmétiques'] + $stock,
            'electronique' => ['label' => 'Électronique et high-tech'] + $stock,
            'alimentation' => ['label' => 'Alimentation et épicerie'] + $stock,
            'maison' => ['label' => 'Maison et déco'] + $stock,
            'sante' => ['label' => 'Santé et bien-être'] + $stock,
            'enfants' => ['label' => 'Enfants et bébés'] + $stock,
            'patisserie' => ['label' => 'Pâtisserie, gâteaux et traiteur', 'lead_time_hours' => 48, 'fields' => [
                ['label' => 'Message sur le gâteau', 'type' => 'text', 'required' => false, 'options' => []],
                ['label' => 'Nombre de parts', 'type' => 'select', 'required' => true, 'options' => ['6 parts', '8 parts', '10 parts', '12 parts', '20 parts']],
                ['label' => 'Parfum', 'type' => 'text', 'required' => false, 'options' => []],
            ]] + $order,
            'restauration' => ['label' => 'Restauration et plats cuisinés', 'lead_time_hours' => 2, 'fields' => [
                ['label' => 'Précisions (épices, accompagnement…)', 'type' => 'text', 'required' => false, 'options' => []],
            ]] + $order,
            'couture' => ['label' => 'Couture et confection sur mesure', 'lead_time_hours' => 168, 'fields' => [
                ['label' => 'Mensurations', 'type' => 'text', 'required' => true, 'options' => []],
                ['label' => 'Tissu ou couleur souhaités', 'type' => 'text', 'required' => false, 'options' => []],
            ]] + $order,
            'artisanat' => ['label' => 'Artisanat et créations personnalisées', 'lead_time_hours' => 72, 'fields' => [
                ['label' => 'Personnalisation (prénom, texte…)', 'type' => 'text', 'required' => false, 'options' => []],
            ]] + $order,
            'services' => ['label' => 'Services et prestations', 'cta' => 'Réserver', 'lead_time_hours' => 24, 'date_label' => 'Date souhaitée pour la prestation', 'fields' => [
                ['label' => 'Précisions sur votre demande', 'type' => 'text', 'required' => false, 'options' => []],
            ]] + $order,
            'autre' => ['label' => 'Autre activité'] + $stock,
        ];

        foreach ($types as $key => $type) {
            $types[$key] = $type + $styles[$key];
            $types[$key]['patterns'] = self::PATTERNS_BY_TYPE[$key];
            $types[$key]['style']['pattern'] = self::PATTERNS_BY_TYPE[$key][0];
        }

        return $types;
    }

    public static function get(?string $type): array
    {
        return static::all()[$type ?? 'autre'] ?? static::all()['autre'];
    }

    public static function keys(): array
    {
        return array_keys(static::all());
    }
}
