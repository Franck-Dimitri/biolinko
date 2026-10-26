import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { initPixels, track } from '@/Components/Storefront/pixels';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Share2, ShoppingBag, Smartphone, Star, Store, Truck, Eye, MessageSquare } from 'lucide-react';
import { EASE_OUT, Reveal, Stagger, StaggerItem } from '@/Components/Motion';
import ProductCard, { ProductImage } from '@/Components/Storefront/ProductCard';
import { contrastColor } from '@/Components/Storefront/theme';
import useCart from '@/Components/Storefront/useCart';

export default function ProductSlugShow({ store, product, isPreview = false }) {
    const authUser = usePage().props.auth?.user;
    const isOwner = authUser && authUser.id === store.user_id;

    useEffect(() => {
        if (isPreview || isOwner || !store.is_published) return;
        initPixels(store);
        track('ViewContent', { value: product.price_display, id: product.id, name: product.title });
    }, [product.id]);

    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = contrastColor(primaryColor);

    const images = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (product.image_url ? [product.image_url] : [null]);

    const [imageIndex, setImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
    const [quantity, setQuantity] = useState(product.min_order_quantity || 1);
    const cart = useCart(store.id);

    const soldOut = Number(product.stock) <= 0;
    const minQ = product.min_order_quantity || 1;
    const isPromo = product.is_promo && Number(product.promo_price) > 0 && Number(product.promo_price) < Number(product.price_vendor);

    const handleAddToCart = (goToCart = false) => {
        cart.add({ ...product, image_url: images[0] }, quantity, selectedVariant);
        if (goToCart) {
            window.location.href = `/${store.slug}?tab=cart`;
        } else {
            toast.success('Ajouté au panier', { description: product.title });
        }
    };

    const unitPrice = selectedVariant?.price && parseFloat(selectedVariant.price) > 0
        ? parseFloat(selectedVariant.price)
        : (product.price_display || parseFloat(isPromo ? product.promo_price : product.price_vendor));


    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: product.title, url: window.location.href });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Lien du produit copié');
            }
        } catch (e) { /* partage annulé */ }
    };

    const reviewsList = store?.reviews || [];
    const avgRating = reviewsList.length > 0
        ? (reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1)
        : null;
    const relatedProducts = (store?.products || []).filter((p) => p.id !== product.id).slice(0, 4);
    const variantLabel = (v) => v.name || `${v.size || ''} ${v.color || ''}`.trim() || 'Option';

    return (
        <StorefrontLayout store={store} isOwner={isOwner} cartCount={cart.count}>
            <Head title={`${product.title}, ${store.name}`} />

            <div className="space-y-16 pb-20 sm:pb-0">
                {isPreview && (
                    <div className="flex items-center gap-3 rounded-3xl bg-[#FFF8D6] p-4 text-sm text-[#141412]">
                        <Eye className="h-5 w-5 shrink-0" /> Aperçu privé : seul vous voyez cette boutique tant qu'elle n'est pas publiée.
                    </div>
                )}

                <div className="space-y-6">
                    <a href={`/${store.slug}`} className="inline-flex items-center gap-1.5 text-sm text-[#5F5E58] hover:text-[#141412]">
                        <ArrowLeft className="h-4 w-4" /> Retour à la boutique
                    </a>

                    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
                        {/* Galerie */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }} className="space-y-3 lg:sticky lg:top-28">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-[#F6F5F1]">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.div key={imageIndex} className="absolute inset-0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4, ease: EASE_OUT }}>
                                        <ProductImage src={images[imageIndex]} alt={product.title} className="h-full w-full" />
                                    </motion.div>
                                </AnimatePresence>
                                {isPromo && (
                                    <span className="absolute left-3 top-3 rounded bg-[#DC2626] px-2 py-0.5 text-sm font-semibold text-white">
                                        -{Math.round(((product.price_vendor - product.promo_price) / product.price_vendor) * 100)} %
                                    </span>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="grid grid-cols-5 gap-2">
                                    {images.slice(0, 5).map((img, idx) => (
                                        <button key={idx} type="button" onClick={() => setImageIndex(idx)} aria-label={`Image ${idx + 1}`} className={`relative aspect-square overflow-hidden rounded-xl transition-opacity ${imageIndex === idx ? '' : 'opacity-60 hover:opacity-100'}`}>
                                            <ProductImage src={img} alt="" className="h-full w-full" />
                                            {imageIndex === idx && <motion.span layoutId="thumb-ring" className="absolute inset-0 rounded-xl border-2 border-[#141412]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Infos & achat */}
                        <Stagger gap={0.07} className="space-y-6 min-w-0">
                            <StaggerItem className="space-y-3 min-w-0">
                                <h1 className="break-words text-[34px] font-medium leading-[1.08] tracking-[-0.03em] text-[#141412] sm:text-[44px]">{product.title}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                    {avgRating && (
                                        <span className="flex items-center gap-1 text-[#141412]"><Star className="h-4 w-4 fill-[#F5B800] text-[#F5B800]" /> {avgRating} ({reviewsList.length} avis)</span>
                                    )}
                                    {soldOut ? (
                                        <span className="text-[#B91C1C]">Épuisé</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-green-700"><Check className="h-4 w-4" /> En stock{Number(product.stock) <= 5 ? `, plus que ${product.stock}` : ''}</span>
                                    )}
                                </div>
                            </StaggerItem>

                            <StaggerItem className="flex items-baseline gap-3">
                                <motion.span key={unitPrice} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-[32px] font-medium tracking-[-0.02em] text-[#141412]">
                                    {Math.ceil(unitPrice).toLocaleString('fr-FR')} FCFA
                                </motion.span>
                                {isPromo && <span className="text-lg text-[#5F5E58] line-through">{Math.ceil(product.price_vendor).toLocaleString('fr-FR')}</span>}
                            </StaggerItem>

                            {product.variants?.length > 0 && (
                                <StaggerItem className="space-y-2">
                                    <div className="text-sm font-medium text-[#141412]">Option : <span className="font-normal text-[#5F5E58]">{selectedVariant ? variantLabel(selectedVariant) : ''}</span></div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((v) => {
                                            const on = selectedVariant?.id === v.id;
                                            return (
                                                <motion.button key={v.id} type="button" whileTap={{ scale: 0.95 }} onClick={() => setSelectedVariant(v)} aria-pressed={on}
                                                    className={`relative h-11 min-w-[48px] rounded-full border px-4 text-[15px] transition-colors ${on ? 'border-[#141412] text-[#141412]' : 'border-black/[0.08] text-[#5F5E58] hover:border-black/30'}`}>
                                                    {variantLabel(v)}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </StaggerItem>
                            )}

                            <StaggerItem className="flex items-center gap-4">
                                <span className="text-sm font-medium text-[#141412]">Quantité</span>
                                <div className="flex items-center rounded-xl border border-black/[0.08]">
                                    <button type="button" aria-label="Retirer un" disabled={soldOut} onClick={() => setQuantity(Math.max(minQ, quantity - 1))} className="flex h-11 w-11 items-center justify-center text-[#141412] disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                                    <motion.span key={quantity} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="w-8 text-center font-medium text-[#141412]">{soldOut ? 0 : quantity}</motion.span>
                                    <button type="button" aria-label="Ajouter un" disabled={soldOut || quantity >= product.stock} onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="flex h-11 w-11 items-center justify-center text-[#141412] disabled:opacity-40"><Plus className="h-4 w-4" /></button>
                                </div>
                                {!soldOut && quantity > 1 && <span className="text-sm text-[#5F5E58]">Total : {Math.ceil(unitPrice * quantity).toLocaleString('fr-FR')} FCFA</span>}
                            </StaggerItem>

                            <StaggerItem className="hidden gap-3 sm:flex">
                                <motion.button type="button" disabled={soldOut} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleAddToCart(true)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-base font-semibold disabled:opacity-50"
                                    style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                    <Smartphone className="h-5 w-5" /> {soldOut ? 'Épuisé' : 'Acheter maintenant'}
                                </motion.button>
                                <motion.button type="button" disabled={soldOut} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleAddToCart(false)}
                                    className="flex items-center justify-center gap-2 rounded-full border border-black/15 px-6 font-semibold text-[#141412] hover:border-black/40 disabled:opacity-50">
                                    <ShoppingBag className="h-5 w-5" /> Ajouter au panier
                                </motion.button>
                                <button type="button" onClick={handleShare} aria-label="Partager ce produit" className="flex w-12 items-center justify-center rounded-full border border-black/15 text-[#141412] hover:border-black/40">
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </StaggerItem>

                            <StaggerItem className="divide-y divide-black/[0.08] border-y border-black/[0.08] text-[15px]">
                                {[
                                    [Truck, 'Livraison à domicile', (store.city_location || store.city) ? `Expédié depuis ${store.city_location || store.city}` : 'Organisée par le vendeur'],
                                    [Smartphone, 'Paiement MTN MoMo ou Orange Money', 'Confirmé sur votre téléphone'],
                                    [MessageSquare, 'Suivi sur WhatsApp', 'Facture et lien de suivi après paiement'],
                                ].map(([Icon, title, sub]) => (
                                    <div key={title} className="flex items-start gap-3 py-3.5">
                                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#141412]" />
                                        <div><div className="text-[#141412]">{title}</div><div className="text-sm text-[#5F5E58]">{sub}</div></div>
                                    </div>
                                ))}
                            </StaggerItem>

                            {product.description && (
                                <StaggerItem className="space-y-2">
                                    <h2 className="text-lg font-semibold text-[#141412]">Description</h2>
                                    <p className="break-words whitespace-pre-line leading-relaxed text-[#5F5E58]">{product.description}</p>
                                </StaggerItem>
                            )}

                            <StaggerItem>
                                <a href={`/${store.slug}`} className="flex items-center gap-3 rounded-3xl bg-[#F6F5F1] p-4 hover:bg-[#F6F5F1]">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                        {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-5 w-5" />}
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block truncate font-medium text-[#141412]" title={store.name}>{store.name}</span>
                                        <span className="block truncate text-sm text-[#5F5E58]">{store.category || 'Voir la boutique'}</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-[#5F5E58]" />
                                </a>
                            </StaggerItem>
                        </Stagger>
                    </div>
                </div>

                {reviewsList.length > 0 && (
                    <section className="space-y-6">
                        <Reveal className="flex items-end justify-between">
                            <h2 className="text-[28px] font-medium tracking-[-0.03em] text-[#141412]">Avis clients</h2>
                            <a href={`/${store.slug}#reviews`} className="text-[15px] font-medium text-[#141412] hover:underline shrink-0">Donner mon avis</a>
                        </Reveal>
                        <Stagger className="grid gap-5 md:grid-cols-3">
                            {reviewsList.slice(0, 3).map((rev, idx) => (
                                <StaggerItem key={rev.id || idx} className="space-y-3 rounded-3xl border border-black/[0.08] p-5 overflow-hidden">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`h-4 w-4 shrink-0 ${s < (rev.rating || 5) ? 'fill-[#F5B800] text-[#F5B800]' : 'text-black/10'}`} />)}
                                    </div>
                                    <p className="break-words leading-relaxed text-[#141412] line-clamp-4">{rev.comment}</p>
                                    <div className="truncate text-sm text-[#5F5E58]" title={rev.customer_name || rev.name}>{rev.customer_name || rev.name}{(rev.customer_city || rev.city) ? `, ${rev.customer_city || rev.city}` : ''}</div>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </section>
                )}

                {relatedProducts.length > 0 && (
                    <section className="space-y-6">
                        <Reveal className="flex items-end justify-between">
                            <h2 className="text-[28px] font-medium tracking-[-0.03em] text-[#141412]">Vous aimerez aussi</h2>
                            <a href={`/${store.slug}`} className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#141412] hover:underline shrink-0">Toute la boutique <ArrowRight className="h-4 w-4" /></a>
                        </Reveal>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
                            {relatedProducts.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    storeSlug={store.slug}
                                    primaryColor={primaryColor}
                                    primaryTextColor={primaryTextColor}
                                    onAdd={() => { window.location.href = `/${store.slug}/p/${p.slug}`; }}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Barre d'achat mobile */}
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.4 }}
                className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-black/[0.08] bg-white/95 p-3 backdrop-blur-md sm:hidden">
                <button type="button" disabled={soldOut} onClick={() => handleAddToCart(false)} aria-label="Ajouter au panier" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/15 text-[#141412] disabled:opacity-50">
                    <ShoppingBag className="h-5 w-5" />
                </button>
                <button type="button" disabled={soldOut} onClick={() => handleAddToCart(true)} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full font-semibold disabled:opacity-50 min-w-0 px-2" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                    <span className="truncate">{soldOut ? 'Épuisé' : `Acheter • ${Math.ceil(unitPrice * quantity).toLocaleString('fr-FR')} FCFA`}</span>
                </button>
            </motion.div>
        </StorefrontLayout>
    );
}
