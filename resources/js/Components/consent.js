/**
 * Choix du visiteur sur les cookies non essentiels (mesure et publicité) : 'accepted', 'refused' ou null.
 * Gardé 6 mois dans un cookie lisible par le serveur, partagé entre toutes les boutiques <nom>.biolinko.store.
 */
export const CONSENT_COOKIE = 'biolinko_consent';
const MAX_AGE = 60 * 60 * 24 * 182;
let storeDomain = null;

export function configureConsent(site) {
    storeDomain = site?.store_domain || null;
}

export function getConsent() {
    if (typeof document === 'undefined') return null;
    const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(accepted|refused)`));
    return m ? m[1] : null;
}

export function setConsent(value) {
    const host = window.location.hostname;
    const domain = storeDomain && host.endsWith(`.${storeDomain}`) ? `; domain=.${storeDomain}` : '';
    const secure = window.location.protocol === 'https:' ? '; secure' : '';
    document.cookie = `${CONSENT_COOKIE}=${value}; max-age=${MAX_AGE}; path=/; samesite=lax${domain}${secure}`;
    window.dispatchEvent(new CustomEvent('biolinko:consent', { detail: value }));
}

/** Rouvre le bandeau (lien « Gérer mes cookies »). */
export function openConsent() {
    window.dispatchEvent(new Event('biolinko:consent-open'));
}
