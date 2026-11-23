import classique from '../../../../store-templates/classique.json';

/*
 * Template « Classique » d'une boutique, calculé depuis ses réglages actuels (couleur, police,
 * motif, sections d'« Apparence »). C'est l'apparence de toutes les boutiques tant que le moteur
 * de vitrine n'est pas activé pour elles : rien ne change pour les vendeurs existants, et l'aperçu
 * en direct de la page Apparence continue de fonctionner.
 */

// Anciennes sections d'« Apparence » → types de sections du moteur
const LEGACY_TYPES = { banner: 'announce', hero: 'hero', products: 'products', promotions: 'promo', promo: 'promo', smartlinks: 'packs', benefits: 'trust', reviews: 'reviews', about: 'story' };

const isOn = (v) => ![false, 'false', 0, '0'].includes(v);

const section = (type, enabled = true) => ({ id: type, type, variant: type === 'announce' ? 'simple' : 'classic', enabled, settings: {} });

export function classicDesign(store = {}) {
    const base = classique.design;
    const saved = Array.isArray(store.sections_json) && store.sections_json.length ? store.sections_json : null;

    let body;
    if (saved) {
        const banner = saved.find((s) => s?.id === 'banner');
        const seen = new Set();
        body = saved
            .map((s) => ({ type: LEGACY_TYPES[s?.id], enabled: isOn(s?.enabled) }))
            .filter((s) => s.type && s.type !== 'announce' && !seen.has(s.type) && seen.add(s.type))
            .map((s) => section(s.type, s.enabled));
        // Sections essentielles absentes d'une configuration enregistrée (ancien studio Apparence) : on les ajoute.
        const has = (type) => body.some((s) => s.type === type);
        if (!has('hero')) body.unshift(section('hero'));
        if (!has('products')) body.push(section('products'));
        const at = body.findIndex((s) => s.type === 'products') + 1;
        body.splice(at, 0, ...['promo', 'packs'].filter((t) => !has(t)).map((t) => section(t)));
        // Bandeau d'annonce : absent d'une configuration enregistrée = masqué
        body = [section('announce', banner ? isOn(banner.enabled) : false), section('header'), ...body, section('cta'), section('footer')];
    } else {
        body = base.sections.map((s) => ({ ...s, settings: {} }));
    }

    const font = store.font_family || base.style.font_body;
    const pattern = store.pattern && store.pattern !== 'none' ? store.pattern : null;

    return {
        ...base,
        style: {
            ...base.style,
            primary: store.theme_color || base.style.primary,
            accent: store.accent_color || base.style.accent,
            font_display: font,
            font_body: font,
        },
        pattern: { key: pattern, intensity: 'soft' },
        sections: body,
    };
}

/** Vitrine affichée : celle publiée avec le moteur, sinon « Classique » calculé depuis les réglages. */
export function storeDesign(store = {}) {
    return store.storefront_design?.sections?.length ? store.storefront_design : classicDesign(store);
}

export function hasSection(design, type) {
    return design.sections.some((s) => s.type === type && s.enabled);
}
