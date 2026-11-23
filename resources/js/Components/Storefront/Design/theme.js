import { storeDesign } from './classic';
import { designVars } from './tokens';
import { contrastColor } from '@/Components/Storefront/theme';

/**
 * Thème d'une boutique pour tout son parcours (vitrine, fiche produit, panier, paiement, suivi).
 * legacy = template « Classique » : apparence Biolinko d'origine, aucune variable posée.
 * Sinon, vars = variables du template, lues par les pages du parcours (couleurs avec repli sur l'apparence d'origine).
 */
export function storeTheme(store) {
    const design = storeDesign(store || {});
    const legacy = design.template === 'classique';
    const primary = design.style.primary || store?.theme_color || '#FFCC00';
    const onPrimary = (!legacy && design.style.on_primary) || contrastColor(primary);
    return { design, legacy, primary, onPrimary, vars: legacy ? {} : designVars(design.style) };
}
