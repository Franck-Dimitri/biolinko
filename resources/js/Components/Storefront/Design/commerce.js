/*
 * Promotions et packs : toute vitrine les affiche dès que le vendeur en a, quel que soit le template.
 * Si le template n'a pas de section pour eux, on l'ajoute juste après le catalogue (elle ne s'affiche
 * que s'il y a des produits en promotion ou des packs actifs). Le vendeur peut ensuite la déplacer ou la masquer.
 */

// Variantes de « Offre spéciale » qui mettent en avant un pack plutôt que les produits en promotion
export const PACK_PROMOS = ['combo', 'basket'];

export function withCommerce(design) {
    if (!design?.sections) return design;
    const classic = design.template === 'classique';
    const missing = [];
    if (!design.sections.some((s) => s.type === 'promo' && !PACK_PROMOS.includes(s.variant))) {
        missing.push({ id: 'promo-auto', type: 'promo', variant: classic ? 'classic' : 'flash', enabled: true, settings: {} });
    }
    if (!design.sections.some((s) => s.type === 'packs')) {
        missing.push({ id: 'packs-auto', type: 'packs', variant: classic ? 'classic' : 'cards', enabled: true, settings: {} });
    }
    if (!missing.length) return design;

    const sections = [...design.sections];
    const catalog = sections.findIndex((s) => ['products', 'services', 'builder'].includes(s.type));
    const footer = sections.findIndex((s) => s.type === 'footer');
    const at = catalog > -1 ? catalog + 1 : (footer > -1 ? footer : sections.length);
    sections.splice(at, 0, ...missing.filter((m) => !sections.some((s) => s.id === m.id)));
    return { ...design, sections };
}

/** Packs de la liste : sans celui déjà mis en avant par une section Combo ou Panier visible. */
export function listedPacks(design, packs = []) {
    const featured = design?.sections?.some((s) => s.enabled && s.type === 'promo' && PACK_PROMOS.includes(s.variant));
    return featured ? packs.slice(1) : packs;
}
