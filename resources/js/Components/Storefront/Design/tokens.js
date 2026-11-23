import { contrastColor } from '@/Components/Storefront/theme';

/*
 * Style d'une vitrine en variables CSS, lues par storefront.css (.sfd).
 * Les variantes « Classique » gardent leurs couleurs d'origine et n'en ont pas besoin.
 */
export function designVars(style = {}) {
    const font = (f, fallback) => `'${f}', ${fallback}`;
    const announceBg = style.announce_bg || style.ink;
    return {
        '--bg': style.background,
        '--sf': style.surface,
        '--ink': style.ink,
        '--mu': style.muted,
        '--ln': style.line,
        '--pri': style.primary,
        '--op': style.on_primary || contrastColor(style.primary),
        '--acc': style.accent,
        '--p1': style.tint,
        '--p2': style.tint_strong,
        '--pi': style.tint_ink || style.ink,
        '--fd': font(style.font_display, 'Georgia, serif'),
        '--fb': font(style.font_body, 'system-ui, -apple-system, sans-serif'),
        '--hw': style.heading_weight,
        '--ht': style.heading_tracking,
        '--tt': style.heading_case,
        '--r': `${style.radius}px`,
        '--rb': `${style.radius_button}px`,
        '--annb': announceBg,
        '--annf': style.announce_fg || contrastColor(announceBg),
    };
}

// Graisses disponibles quand une police n'a pas 400 à 800 (Google Fonts refuse une graisse inexistante)
const WEIGHTS = {
    'Instrument Serif': '400', 'Archivo Black': '400', 'DM Serif Display': '400', 'Libre Baskerville': '400;700',
    Lora: '400;500;600;700', 'Space Grotesk': '400;500;600;700', 'Cormorant Garamond': '400;500;600;700',
};

/** Adresse Google Fonts des polices du template (Poppins est déjà chargée par l'application). */
export function fontsHref(style = {}) {
    const families = [...new Set([style.font_display, style.font_body])].filter((f) => f && f !== 'Poppins');
    if (!families.length) return null;
    const q = families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@${WEIGHTS[f] || '400;500;600;700;800'}`).join('&');
    return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}
