import { ArrowRight, Image as ImageIcon, Plus } from 'lucide-react';
import { PatternLayer, hasPattern } from '@/Components/Storefront/patterns';
import { contrastColor } from '@/Components/Storefront/theme';
import { imageSrcSet, productImage } from '@/Components/Storefront/ProductCard';
import { formatFcfa } from '@/Components/Storefront/useCart';
import { productUrl } from '@/Components/Storefront/storeUrl';

/* Briques communes des sections de vitrine (styles dans storefront.css, sous .sfd). */

export const fmt = formatFcfa;

export const initials = (name = '') => name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, ' ').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

export const slugify = (s = '') => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

export const categoryOf = (p) => p.category_name || p.category?.name || p.category || '';

/** Prix affiché : promo en cours, sinon prix normal ; « à partir de » quand les variantes ont des prix différents. */
export function priceOf(p) {
    const promo = Boolean(p.promo_active);
    const base = Math.ceil(Number(promo ? p.promo_price : p.price_vendor) || 0);
    const prices = (p.variants || []).map((v) => Number(v.price)).filter((x) => x > 0);
    const from = prices.length > 1 && new Set(prices).size > 1;
    return { price: from ? Math.min(...prices) : base, old: promo ? Math.ceil(Number(p.price_vendor)) : null, from };
}

export function scrollToId(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Photo à proportion fixe ; sans photo, un aplat aux couleurs du template avec une icône. */
export function Pic({ src, alt = '', ar = '4/5', className = '', icon: Icon = ImageIcon, eager = false, sizes = '(min-width: 760px) 33vw, 50vw' }) {
    const srcSet = imageSrcSet(src);
    return (
        <div className={`pic ${src ? '' : 'ph'} ${className}`} style={{ '--ar': ar }}>
            {src ? <img src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" /> : <Icon aria-hidden />}
        </div>
    );
}

/** Bouton du template : lien (href) ou bouton (onClick). variant : '', 'ghost', 'inv', 'sm', 'full' (combinables). */
export function Btn({ href, onClick, variant = '', children, className = '', ...rest }) {
    const cls = `btn ${variant} ${className}`.trim();
    if (href) return <a href={href} onClick={onClick} className={cls} {...rest}>{children}</a>;
    return <button type="button" onClick={onClick} className={cls} {...rest}>{children}</button>;
}

/** Titre de section, avec un lien « Tout voir » facultatif. */
export function Head({ title, more, onMore, moreHref }) {
    if (!title && !more) return null;
    return (
        <div className="sh">
            {title ? <h2>{title}</h2> : <span />}
            {more && (moreHref
                ? <a className="more" href={moreHref} target="_blank" rel="noreferrer">{more} <ArrowRight /></a>
                : <button type="button" className="more" onClick={onMore}>{more} <ArrowRight /></button>)}
        </div>
    );
}

/**
 * Motif du template, placé dans une zone précise et jamais derrière une photo, un prix ou un formulaire.
 * Discret : coin de l'accueil et ruban au-dessus du pied de page. Marqué : en plus les bandeaux colorés,
 * le haut des sections alternées et un ruban sous l'en-tête.
 */
export function PatZone({ design, zone }) {
    const { key, intensity } = design?.pattern || {};
    if (!key || !intensity || intensity === 'none' || !hasPattern(key)) return null;
    const bold = intensity === 'bold';
    const pri = design.style.primary;
    const onPri = design.style.on_primary || contrastColor(pri);
    const layer = (cls, color, opacity) => (
        <span className={`pat ${cls}`} style={{ '--po': opacity }} aria-hidden>
            <PatternLayer pattern={key} color={color} opacity={1} fade={false} />
        </span>
    );

    if (zone === 'hero') return layer(bold ? 'top' : 'corner', pri, bold ? 0.24 : 0.22);
    if (zone === 'ribbon') return <div className="pat-rib haspat">{layer('rib', pri, bold ? 0.32 : 0.26)}</div>;
    if (!bold) return null;
    if (zone === 'band') return layer('edges', onPri, 0.16);
    if (zone === 'alt') return layer('top', pri, 0.09);
    if (zone === 'top-ribbon') return <div className="pat-rib thin haspat">{layer('rib', pri, 0.26)}</div>;
    return null;
}

/** Ruban de motif en haut d'une page du parcours (panier, paiement, suivi) : rien sans motif. */
export function PatternBand({ design }) {
    if (!design?.pattern?.key || design.pattern.intensity === 'none') return null;
    return <div className="sfd sfd-band" aria-hidden><PatZone design={design} zone="ribbon" /></div>;
}

/** Carte produit du template : photo, étiquette, ajout rapide au panier, nom et prix. */
export function ProductTile({ p, ctx, ar = '4/5', eager = false }) {
    const url = productUrl(ctx.store.slug, p.slug);
    const { price, old, from } = priceOf(p);
    const madeToOrder = p.fulfillment === 'made_to_order';
    const soldOut = !madeToOrder && p.stock !== undefined && p.stock !== null && Number(p.stock) <= 0;
    const discount = old ? Math.round(((old - price) / old) * 100) : 0;
    const tag = soldOut ? 'Épuisé' : discount > 0 ? `−${discount} %` : madeToOrder ? 'Sur commande' : null;
    return (
        <article className={`pc ${soldOut ? 'out' : ''}`}>
            <div className="pcw">
                <a href={url} aria-label={p.title}><Pic src={productImage(p)} alt={p.title} ar={ar} eager={eager} /></a>
                {tag && <span className="tag">{tag}</span>}
                {!soldOut && (
                    <button type="button" className="add" onClick={() => ctx.cardProps.onAdd(p)} aria-label={`Ajouter ${p.title} au panier`}><Plus /></button>
                )}
            </div>
            <a href={url} className="pc-t">
                <span className="pn">{p.title}</span>
                <span className="pp">{from && <span className="from">à partir de </span>}{fmt(price)}{old ? <> <s>{fmt(old)}</s></> : null}</span>
            </a>
        </article>
    );
}

/** Note en étoiles (avis réels uniquement). */
export function Stars({ value = 5 }) {
    return (
        <span className="stars" aria-label={`${value} sur 5`}>
            {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= value ? 'on' : ''}>★</span>)}
        </span>
    );
}
