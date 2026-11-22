/**
 * Adresses publiques des boutiques (miroir de App\Support\StoreUrl).
 * Production : https://<nom>.biolinko.store/… · Développement local : /<nom>/…
 * Configuré une fois au démarrage depuis la prop partagée `site` (app.jsx / ssr.jsx).
 */
let storeDomain = null;
let appUrl = '';

export function configureStoreUrls(site) {
    storeDomain = site?.store_domain || null;
    appUrl = site?.app_url || '';
}

const scheme = () => (appUrl.startsWith('http://') ? 'http:' : 'https:');

/** storeUrl('awa') · storeUrl('awa', '/p/robe') · storeUrl('awa', '?tab=cart') · storeUrl('awa', '#reviews') */
export function storeUrl(slug, path = '') {
    if (!slug) return '/';
    const p = path && !path.startsWith('/') ? `/${path}` : path;
    if (storeDomain) return `${scheme()}//${slug}.${storeDomain}${p || '/'}`;
    return `/${slug}${p}`;
}

/** Adresse complète (https://…) à copier ou partager : awa.biolinko.store ou biolinko.link/awa. */
export function absoluteStoreUrl(slug, path = '') {
    const url = storeUrl(slug, path);
    if (!url.startsWith('/')) return url;
    return `${appUrl || (typeof window !== 'undefined' ? window.location.origin : '')}${url}`;
}

export const productUrl = (slug, productSlug) => storeUrl(slug, `/p/${productSlug}`);

/** Adresse affichée au vendeur, sans https:// : awa.biolinko.store ou biolinko.link/awa */
export function storeAddress(slug) {
    if (storeDomain) return `${slug}.${storeDomain}`;
    const host = (appUrl || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/^https?:\/\//, '');
    return `${host}/${slug}`;
}

/** Suffixe affiché dans les champs d'adresse : « .biolinko.store » ou préfixe « biolinko.link/ ». */
export const storeAddressParts = () => (storeDomain
    ? { prefix: '', suffix: `.${storeDomain}` }
    : { prefix: `${(appUrl || '').replace(/^https?:\/\//, '') || 'biolinko.link'}/`, suffix: '' });

/** Boutiques sur leur propre domaine (production) ? */
export const storeDomainEnabled = () => !!storeDomain;

/** Lien vers le site principal (pages Biolinko) depuis le domaine d'une boutique. */
export const appLink = (path = '/') => (storeDomain ? `${appUrl}${path}` : path);
