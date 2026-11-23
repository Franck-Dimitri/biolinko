import { motion } from 'framer-motion';
import { Heart, Package, Plus } from 'lucide-react';
import { EASE_OUT } from '@/Components/UI/Motion';
import { productUrl } from '@/Components/Storefront/storeUrl';

export function productImage(product) {
    return product?.image_url || product?.images?.[0] || null;
}

/** Photos optimisées à l'envoi (dossier /opt/, WebP) : une version 640 px existe à côté, pour les téléphones. */
export function imageSrcSet(src) {
    if (typeof src !== 'string' || !/\/opt\/[A-Za-z0-9]{40}\.webp$/.test(src)) return undefined;
    return `${src.slice(0, -5)}-sm.webp 640w, ${src} 1600w`;
}

export function ProductImage({ src, alt, className = '', sizes = '(min-width: 1024px) 25vw, 50vw' }) {
    if (!src) {
        return (
            <div className={`flex items-center justify-center bg-[color:var(--sf,#F6F5F1)] ${className}`}>
                <Package className="h-8 w-8 text-[color:var(--mu,#8B8A83)]/50" />
            </div>
        );
    }
    const srcSet = imageSrcSet(src);
    return <img src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
}

export default function ProductCard({ product, storeSlug, primaryColor, primaryTextColor, onAdd, onWishlist, isWished = false, badge = null }) {
    const url = productUrl(storeSlug, product.slug);
    const isPromo = product.promo_active;
    const price = Math.ceil(isPromo ? Number(product.promo_price) : Number(product.price_vendor));
    const discount = isPromo ? Math.round(((product.price_vendor - product.promo_price) / product.price_vendor) * 100) : 0;
    const madeToOrder = product.fulfillment === 'made_to_order';
    const soldOut = !madeToOrder && product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0;

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="group flex flex-col"
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--r,16px)] bg-[color:var(--sf,#F6F5F1)]">
                <a href={url} className="block h-full w-full" aria-label={product.title}>
                    <ProductImage
                        src={productImage(product)}
                        alt={product.title}
                        className={`h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05] ${soldOut ? 'opacity-50' : ''}`}
                    />
                </a>

                <div className="pointer-events-none absolute left-3 top-3 flex max-w-[70%] flex-col gap-1.5">
                    {soldOut ? (
                        <span className="rounded-[var(--rb,9999px)] bg-[color:var(--bg,#FFFFFF)] px-2.5 py-1 text-[12px] font-medium text-[color:var(--ink,#141412)]">Épuisé</span>
                    ) : isPromo ? (
                        <span className="rounded-[var(--rb,9999px)] bg-[#DC2626] px-2.5 py-1 text-[12px] font-medium text-white">−{discount} %</span>
                    ) : madeToOrder ? (
                        <span className="truncate rounded-[var(--rb,9999px)] bg-[color:var(--bg,#FFFFFF)] px-2.5 py-1 text-[12px] font-medium text-[color:var(--ink,#141412)]">Sur commande</span>
                    ) : badge ? (
                        <span className="truncate rounded-[var(--rb,9999px)] bg-[color:var(--bg,#FFFFFF)] px-2.5 py-1 text-[12px] font-medium text-[color:var(--ink,#141412)]">{badge}</span>
                    ) : null}
                </div>

                {onWishlist && (
                    <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => onWishlist(product.id)}
                        aria-label={isWished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--bg,#FFFFFF)_90%,transparent)] text-[color:var(--ink,#141412)] backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <Heart className={`h-4 w-4 ${isWished ? 'fill-[#E11D48] text-[#E11D48]' : ''}`} />
                    </motion.button>
                )}

                {!soldOut && (
                    <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => onAdd(product)}
                        aria-label={`Ajouter ${product.title} au panier`}
                        className="absolute bottom-3 right-3 flex h-10 items-center gap-1.5 overflow-hidden rounded-[var(--rb,9999px)] px-3 text-[13px] font-medium shadow-[0_8px_20px_-8px_rgba(20,20,10,0.5)]"
                        style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 sm:group-hover:max-w-[80px]">Ajouter</span>
                    </motion.button>
                )}
            </div>

            <a href={url} className="mt-3 block min-w-0 px-0.5">
                <h4 className="line-clamp-2 min-h-[40px] break-words text-[15px] leading-snug text-[color:var(--ink,#141412)]" title={product.title}>
                    {product.title}
                </h4>
                <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-2">
                    <span className="whitespace-nowrap text-[15px] font-semibold tabular-nums text-[color:var(--ink,#141412)]">{price.toLocaleString('fr-FR')} FCFA</span>
                    {isPromo && <span className="whitespace-nowrap text-[13px] tabular-nums text-[color:var(--mu,#8B8A83)] line-through">{Math.ceil(product.price_vendor).toLocaleString('fr-FR')}</span>}
                </div>
            </a>
        </motion.article>
    );
}
