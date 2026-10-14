import { motion } from 'framer-motion';
import { Heart, Package, Plus } from 'lucide-react';
import { EASE_OUT } from '@/Components/Motion';

export function productImage(product) {
    return product?.image_url || product?.images?.[0] || null;
}

export function ProductImage({ src, alt, className = '' }) {
    if (!src) {
        return (
            <div className={`flex items-center justify-center bg-brand-sand ${className}`}>
                <Package className="h-8 w-8 text-brand-muted/50" />
            </div>
        );
    }
    return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
}

export default function ProductCard({ product, storeSlug, primaryColor, primaryTextColor, onAdd, onWishlist, isWished = false, badge = null }) {
    const url = `/${storeSlug}/p/${product.slug}`;
    const isPromo = product.is_promo && Number(product.promo_price) > 0 && Number(product.promo_price) < Number(product.price_vendor);
    const price = Math.ceil(isPromo ? Number(product.promo_price) : Number(product.price_vendor));
    const discount = isPromo ? Math.round(((product.price_vendor - product.promo_price) / product.price_vendor) * 100) : 0;
    const soldOut = product.stock !== undefined && product.stock !== null && Number(product.stock) <= 0;

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="group flex flex-col"
        >
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-brand-sand">
                <a href={url} className="block h-full w-full" aria-label={product.title}>
                    <ProductImage
                        src={productImage(product)}
                        alt={product.title}
                        className={`h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06] ${soldOut ? 'opacity-50' : ''}`}
                    />
                </a>

                <div className="pointer-events-none absolute left-2.5 top-2.5 flex max-w-[70%] flex-col gap-1.5">
                    {soldOut ? (
                        <span className="shrink-0 rounded bg-white px-2 py-0.5 text-xs font-medium text-brand-ink whitespace-nowrap">Épuisé</span>
                    ) : isPromo ? (
                        <span className="shrink-0 rounded bg-[#DC2626] px-2 py-0.5 text-xs font-semibold text-white whitespace-nowrap">-{discount} %</span>
                    ) : badge ? (
                        <span className="truncate rounded bg-white px-2 py-0.5 text-xs font-medium text-brand-ink max-w-full">{badge}</span>
                    ) : null}
                </div>

                {onWishlist && (
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onWishlist(product.id)}
                        aria-label={isWished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-ink backdrop-blur-sm shadow-xs"
                    >
                        <Heart className={`h-4 w-4 ${isWished ? 'fill-[#E11D48] text-[#E11D48]' : ''}`} />
                    </motion.button>
                )}

                {!soldOut && (
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => onAdd(product)}
                        className="absolute inset-x-2.5 bottom-2.5 flex h-11 items-center justify-center gap-1.5 rounded-md text-sm font-semibold shadow-md transition-all duration-300 sm:translate-y-3 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
                        style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                    >
                        <Plus className="h-4 w-4" /> Ajouter au panier
                    </motion.button>
                )}
            </div>

            <a href={url} className="mt-3 space-y-1 block min-w-0">
                <h4 className="line-clamp-2 break-words text-[15px] font-medium leading-snug text-brand-ink min-h-[38px]" title={product.title}>
                    {product.title}
                </h4>
                <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                    <span className="text-[15px] font-semibold text-brand-ink whitespace-nowrap tabular-nums">{price.toLocaleString('fr-FR')} FCFA</span>
                    {isPromo && <span className="text-xs sm:text-sm text-brand-muted line-through whitespace-nowrap tabular-nums">{Math.ceil(product.price_vendor).toLocaleString('fr-FR')} FCFA</span>}
                </div>
            </a>
        </motion.article>
    );
}
