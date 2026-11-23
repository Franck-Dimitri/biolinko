<?php

namespace App\Support;

use App\Models\Store;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Format d'une vitrine : un style (couleurs, polices, arrondis), un motif et une liste ordonnée
 * de sections. Chaque section a un type et une variante dessinée par nous : le vendeur peut
 * réordonner, masquer ou changer de variante, jamais produire une page cassée.
 *
 * Le rendu React lit le même catalogue (Components/Storefront/Design/registry.jsx).
 */
class StoreDesign
{
    public const VERSION = 1;

    /**
     * Types de sections, variantes et réglages. « classic » reprend l'apparence Biolinko d'origine.
     * Les réglages décrivent les champs modifiables par le vendeur : ils servent à valider la vitrine
     * et à générer le formulaire de l'éditeur. Un réglage vide = texte par défaut de la boutique.
     */
    public const SECTIONS = [
        'announce' => ['label' => 'Bandeau d’annonce', 'variants' => ['simple' => 'Simple'], 'settings' => [
            'text' => ['type' => 'text', 'label' => 'Message', 'max' => 120],
        ]],
        'header' => ['label' => 'En-tête', 'variants' => ['classic' => 'Classique', 'simple' => 'Logo à gauche', 'center' => 'Logo centré', 'app' => 'Façon appli', 'bold' => 'Grand nom'], 'settings' => []],
        'hero' => ['label' => 'Accueil', 'variants' => [
            'classic' => 'Classique', 'split' => 'Photo à côté', 'full' => 'Plein écran', 'editorial' => 'Grand titre', 'collage' => 'Collage',
            'menu' => 'Bannière resto', 'booking' => 'Créneaux', 'profile' => 'Profil', 'type' => 'Typo géante', 'banner' => 'Bannière promo',
        ], 'settings' => [
            'badge' => ['type' => 'text', 'label' => 'Petite étiquette', 'max' => 40],
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 90],
            'subtitle' => ['type' => 'textarea', 'label' => 'Sous-titre', 'max' => 220],
            'button' => ['type' => 'text', 'label' => 'Texte du bouton', 'max' => 40],
            'image' => ['type' => 'image', 'label' => 'Photo'],
        ]],
        'cats' => ['label' => 'Catégories', 'variants' => ['chips' => 'Pastilles', 'circles' => 'Ronds', 'tiles' => 'Tuiles photo'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
        ]],
        'products' => ['label' => 'Produits', 'variants' => ['classic' => 'Classique', 'grid' => 'Grille', 'list' => 'Liste type carte', 'carousel' => 'Carrousel', 'lookbook' => 'Lookbook', 'specs' => 'Fiches détaillées'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
            'limit' => ['type' => 'number', 'label' => 'Nombre de produits affichés', 'min' => 3, 'max' => 24],
            'leaders' => ['type' => 'boolean', 'label' => 'Pointillés entre le nom et le prix', 'variants' => ['list']],
        ]],
        'builder' => ['label' => 'Commande personnalisée', 'variants' => ['simple' => 'Configurateur'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
            'product_id' => ['type' => 'product', 'label' => 'Produit à composer'],
        ]],
        'services' => ['label' => 'Prestations', 'variants' => ['list' => 'Liste', 'cards' => 'Cartes'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
        ]],
        'steps' => ['label' => 'Comment ça marche', 'variants' => ['line' => 'En ligne', 'cards' => 'En cartes'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
            'items' => ['type' => 'list', 'label' => 'Étapes', 'max' => 4, 'fields' => [
                'title' => ['type' => 'text', 'label' => 'Étape', 'max' => 60],
                'text' => ['type' => 'textarea', 'label' => 'Détail', 'max' => 160],
            ]],
        ]],
        'story' => ['label' => 'Notre histoire', 'variants' => ['classic' => 'Classique', 'split' => 'Photo et texte', 'quote' => 'Citation'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Petit titre', 'max' => 40],
            'heading' => ['type' => 'text', 'label' => 'Titre', 'max' => 120],
            'text' => ['type' => 'textarea', 'label' => 'Texte', 'max' => 800],
            'signature' => ['type' => 'text', 'label' => 'Signature', 'max' => 60],
            'image' => ['type' => 'image', 'label' => 'Photo'],
        ]],
        'gallery' => ['label' => 'Réalisations', 'variants' => ['simple' => 'Mosaïque'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
        ]],
        'reviews' => ['label' => 'Avis clients', 'variants' => ['classic' => 'Classique', 'cards' => 'Cartes', 'messages' => 'Messages', 'big' => 'Grande citation'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
        ]],
        'info' => ['label' => 'Infos pratiques', 'variants' => ['strip' => 'Bandeau', 'cards' => 'Cartes'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
        ]],
        'promo' => ['label' => 'Offre spéciale', 'variants' => ['classic' => 'Classique', 'flash' => 'Vente flash', 'combo' => 'Combo', 'basket' => 'Panier de la semaine'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
        ]],
        'packs' => ['label' => 'Packs', 'variants' => ['classic' => 'Classique', 'cards' => 'Cartes'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
        ]],
        'trust' => ['label' => 'Garanties', 'variants' => ['classic' => 'Classique', 'icons' => 'Icônes', 'stats' => 'Chiffres clés'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
        ]],
        'faq' => ['label' => 'Questions fréquentes', 'variants' => ['simple' => 'Accordéon'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 80],
            'items' => ['type' => 'list', 'label' => 'Questions', 'max' => 8, 'fields' => [
                'question' => ['type' => 'text', 'label' => 'Question', 'max' => 140],
                'answer' => ['type' => 'textarea', 'label' => 'Réponse', 'max' => 500],
            ]],
        ]],
        'cta' => ['label' => 'Appel à commander', 'variants' => ['classic' => 'Classique', 'band' => 'Bandeau', 'card' => 'Carte'], 'settings' => [
            'title' => ['type' => 'text', 'label' => 'Titre', 'max' => 90],
            'text' => ['type' => 'textarea', 'label' => 'Texte', 'max' => 200],
            'button' => ['type' => 'text', 'label' => 'Texte du bouton', 'max' => 40],
        ]],
        'footer' => ['label' => 'Pied de page', 'variants' => ['classic' => 'Classique', 'simple' => 'Simple', 'rich' => 'Complet'], 'settings' => []],
    ];

    /** Sections présentes au plus une fois (les autres peuvent être répétées, ex. deux bandeaux promo). */
    public const SINGLE = ['announce', 'header', 'footer', 'hero', 'builder'];

    /** Polices proposées aux templates, chargées à la demande depuis Google Fonts. */
    public const FONTS = [
        'Poppins', 'Inter', 'Roboto', 'DM Sans', 'Manrope', 'Outfit', 'Jost', 'Archivo', 'Space Grotesk', 'Bricolage Grotesque',
        'Playfair Display', 'Fraunces', 'Cormorant Garamond', 'Instrument Serif', 'Lora', 'Libre Baskerville', 'DM Serif Display',
        'Unbounded', 'Syne', 'Baloo 2', 'Archivo Black',
    ];

    public const COLORS = ['background', 'surface', 'ink', 'muted', 'line', 'primary', 'accent', 'tint', 'tint_strong', 'tint_ink'];

    /** Couleurs facultatives : calculées (contraste) quand elles sont absentes. */
    public const OPTIONAL_COLORS = ['on_primary', 'announce_bg', 'announce_fg'];

    public const INTENSITIES = ['none', 'soft', 'bold'];

    private const HEX = 'regex:/^#[0-9A-Fa-f]{6}$/';

    /**
     * Vérifie et normalise une vitrine. Lève une ValidationException (messages en français) si elle est invalide.
     */
    public static function validate(array $design): array
    {
        // Une vitrine déjà normalisée (réglages en objets) se valide comme une vitrine brute
        $design = json_decode(json_encode($design), true);
        $rules = [
            'template' => ['required', 'string', 'max:40', 'regex:/^[a-z0-9-]+$/'],
            'style' => ['required', 'array'],
            'style.font_display' => ['required', Rule::in(self::FONTS)],
            'style.font_body' => ['required', Rule::in(self::FONTS)],
            'style.heading_weight' => ['required', 'integer', Rule::in([400, 500, 600, 700, 800])],
            'style.heading_tracking' => ['required', 'string', 'regex:/^(0|-?0?\.\d{1,3}em)$/'],
            'style.heading_case' => ['required', Rule::in(['none', 'uppercase'])],
            'style.radius' => ['required', 'integer', 'between:0,32'],
            'style.radius_button' => ['required', 'integer', Rule::in([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 999])],
            'pattern' => ['required', 'array'],
            'pattern.key' => ['nullable', Rule::in(BusinessTypes::patterns())],
            'pattern.intensity' => ['required', Rule::in(self::INTENSITIES)],
            'sections' => ['required', 'array', 'min:1', 'max:30'],
            'sections.*.id' => ['required', 'string', 'distinct', 'regex:/^[a-z0-9-]{1,40}$/'],
            'sections.*.type' => ['required', Rule::in(array_keys(self::SECTIONS))],
            'sections.*.variant' => ['required', 'string'],
            'sections.*.enabled' => ['required', 'boolean'],
            'sections.*.settings' => ['nullable', 'array'],
        ];
        foreach (self::COLORS as $c) {
            $rules["style.$c"] = ['required', self::HEX];
        }
        foreach (self::OPTIONAL_COLORS as $c) {
            $rules["style.$c"] = ['nullable', self::HEX];
        }

        $validator = Validator::make($design, $rules, [
            'sections.*.id.distinct' => 'Deux sections ont le même identifiant.',
            'regex' => 'Le champ :attribute n’a pas le bon format.',
        ]);

        $validator->after(function ($v) use ($design) {
            $sections = is_array($design['sections'] ?? null) ? $design['sections'] : [];
            $count = [];
            foreach ($sections as $i => $s) {
                $type = $s['type'] ?? null;
                if (! isset(self::SECTIONS[$type])) {
                    continue;
                }
                if (! array_key_exists($s['variant'] ?? '', self::SECTIONS[$type]['variants'])) {
                    $v->errors()->add("sections.$i.variant", 'Cette disposition n’existe pas pour la section « '.self::SECTIONS[$type]['label'].' ».');
                }
                $count[$type] = ($count[$type] ?? 0) + 1;
                if (! self::validSettings($s['settings'] ?? [], self::SECTIONS[$type]['settings'])) {
                    $v->errors()->add("sections.$i.settings", 'Les réglages de la section « '.self::SECTIONS[$type]['label'].' » sont invalides.');
                }
            }
            foreach (self::SINGLE as $type) {
                if (($count[$type] ?? 0) > 1) {
                    $v->errors()->add('sections', 'La section « '.self::SECTIONS[$type]['label'].' » ne peut apparaître qu’une fois.');
                }
            }
            // Une vitrine sert à vendre : elle garde toujours un catalogue ou des prestations
            $sells = collect($sections)->contains(fn ($s) => in_array($s['type'] ?? null, ['products', 'services'], true) && filter_var($s['enabled'] ?? false, FILTER_VALIDATE_BOOLEAN));
            if (! $sells) {
                $v->errors()->add('sections', 'La vitrine doit garder une section Produits ou Prestations visible.');
            }
        });

        $validator->validate();

        return self::normalize($design);
    }

    /** Réglages d'une section : uniquement les champs déclarés dans le catalogue, avec des valeurs du bon type. */
    private static function validSettings(mixed $settings, array $schema): bool
    {
        if (! is_array($settings)) {
            return false;
        }
        foreach ($settings as $key => $value) {
            if (! is_string($key) || ! isset($schema[$key]) || ! self::validField($value, $schema[$key])) {
                return false;
            }
        }

        return true;
    }

    private static function validField(mixed $value, array $field): bool
    {
        if ($value === null || $value === '') {
            return true;
        }

        return match ($field['type']) {
            'text', 'textarea' => is_string($value) && mb_strlen($value) <= $field['max'],
            'number' => is_int($value) && $value >= $field['min'] && $value <= $field['max'],
            'boolean' => is_bool($value),
            'product' => is_int($value) && $value > 0,
            // Photo envoyée par le vendeur (stockage Biolinko) ou photo d'exemple des templates
            'image' => is_string($value) && mb_strlen($value) <= 300 && preg_match('#^/(storage|images)/[A-Za-z0-9/_.-]+$#', $value) === 1 && ! str_contains($value, '..'),
            'list' => is_array($value) && array_is_list($value) && count($value) <= $field['max']
                && collect($value)->every(fn ($item) => self::validSettings($item, $field['fields'])),
            default => false,
        };
    }

    /** Garde uniquement les clés connues, dans un ordre stable. */
    private static function normalize(array $design): array
    {
        $style = [];
        foreach ([...self::COLORS, ...self::OPTIONAL_COLORS] as $c) {
            $style[$c] = isset($design['style'][$c]) ? strtoupper($design['style'][$c]) : null;
        }
        foreach (['font_display', 'font_body', 'heading_tracking', 'heading_case'] as $k) {
            $style[$k] = (string) $design['style'][$k];
        }
        foreach (['heading_weight', 'radius', 'radius_button'] as $k) {
            $style[$k] = (int) $design['style'][$k];
        }

        return [
            'version' => self::VERSION,
            'template' => $design['template'],
            'style' => $style,
            'pattern' => ['key' => $design['pattern']['key'] ?? null, 'intensity' => $design['pattern']['intensity']],
            'sections' => array_values(array_map(fn ($s) => [
                'id' => $s['id'],
                'type' => $s['type'],
                'variant' => $s['variant'],
                'enabled' => filter_var($s['enabled'], FILTER_VALIDATE_BOOLEAN),
                'settings' => (object) ($s['settings'] ?? []),
            ], $design['sections'])),
        ];
    }

    /** Catalogue pour l'éditeur : types, dispositions et champs de réglages (formulaires générés). */
    public static function catalog(): array
    {
        return collect(self::SECTIONS)->map(fn ($def, $type) => $def + [
            'single' => in_array($type, self::SINGLE, true),
            // En-tête et pied de page restent toujours : panier, mentions légales, signalement
            'required' => in_array($type, ['header', 'footer'], true),
        ])->all();
    }

    /**
     * Vitrine publiée d'une boutique, ou null quand elle reste sur « Classique » :
     * le rendu calcule alors Classique depuis ses réglages actuels (couleur, sections, motif).
     */
    public static function forStore(Store $store): ?array
    {
        if (! $store->design_engine || ! is_array($store->design) || empty($store->design['sections'])) {
            return null;
        }

        return $store->design;
    }

    /** Valide puis publie une vitrine pour une boutique (le brouillon suit la version publiée). */
    public static function publish(Store $store, array $design): array
    {
        $design = self::validate($design);
        $store->forceFill(['design' => $design, 'design_draft' => $design])->save();

        return $design;
    }

    /** Message lisible d'une erreur de validation (commande, journal). */
    public static function errorsOf(ValidationException $e): string
    {
        return collect($e->errors())->flatten()->implode(' ');
    }
}
