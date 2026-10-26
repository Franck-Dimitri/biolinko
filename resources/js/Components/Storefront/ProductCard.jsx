import { motion } from 'framer-motion';
import { Heart, Package, Plus } from 'lucide-react';
import { EASE_OUT } from '@/Components/Motion';

export function productImage(product) {
    return product?.image_url || product?.images?.[0] || null;
}

export function ProductImage({ src, alt, className = '' }) {
    if (!src) {
        return (
            <div className={`flex items-center justify-center bg-[#F6F5F1] ${className}`}>
                <Package className="h-8 w-8 text-[#8B8A83]/50" />
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
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#F6F5F1]">
                <a href={url} className="block h-full w-full" aria-label={product.title}>
                    <ProductImage
                        src={productImage(product)}
                        alt={product.title}
                        className={`h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05] ${soldOut ? 'opacity-50' : ''}`}
                    />
                </a>

                <div className="pointer-events-none absolute left-3 top-3 flex max-w-[70%] flex-col gap-1.5">
                    {soldOut ? (
                        <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[#141412]">Épuisé</span>
                    ) : isPromo ? (
                        <span className="rounded-full bg-[#DC2626] px-2.5 py-1 text-[12px] font-medium text-white">−{discount} %</span>
                    ) : badge ? (
                        <span className="truncate rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[#141412]">{badge}</span>
                    ) : null}
                </div>

                {onWishlist && (
                    <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => onWishlist(product.id)}
                        aria-label={isWished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#141412] backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <Heart className={`h-4 w-4 ${isWished ? 'fill-[#E11D48] text-[#E11D48]' : ''}`} />
                    </motion.button>
                )}

                {!soldOut && (
                    <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => onAdd(product)}
                        aria-label={`Ajouter ${product.title} au panier`}
                        className="absolute bottom-3 right-3 flex h-10 items-center gap-1.5 overflow-hidden rounded-full px-3 text-[13px] font-medium shadow-[0_8px_20px_-8px_rgba(20,20,10,0.5)]"
                        style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 sm:group-hover:max-w-[80px]">Ajouter</span>
                    </motion.button>
                )}
            </div>

            <a href={url} className="mt-3 block min-w-0 px-0.5">
                <h4 className="line-clamp-2 min-h-[40px] break-words text-[15px] leading-snug text-[#141412]" title={product.title}>
                    {product.title}
                </h4>
                <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-2">
                    <span className="whitespace-nowrap text-[15px] font-semibold tabular-nums text-[#141412]">{price.toLocaleString('fr-FR')} FCFA</span>
                    {isPromo && <span className="whitespace-nowrap text-[13px] tabular-nums text-[#8B8A83] line-through">{Math.ceil(product.price_vendor).toLocaleString('fr-FR')}</span>}
                </div>
            </a>
        </motion.article>
    );
}
