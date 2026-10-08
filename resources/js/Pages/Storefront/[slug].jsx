import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Share2, ShoppingBag, Smartphone, Star, Store, Truck, Eye, MessageSquare } from 'lucide-react';
import { EASE_OUT, Reveal, Stagger, StaggerItem } from '@/Components/Motion';
import ProductCard, { ProductImage } from '@/Components/Storefront/ProductCard';
import { contrastColor } from '@/Components/Storefront/theme';

export default function ProductSlugShow({ store, product, isPreview = false }) {
    const authUser = usePage().props.auth?.user;
    const isOwner = authUser && authUser.id === store.user_id;

    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = contrastColor(primaryColor);

    const images = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (product.image_url ? [product.image_url] : [null]);

    const [imageIndex, setImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
    const [quantity, setQuantity] = useState(product.min_order_quantity || 1);
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const saved = localStorage.getItem(`biolinko_cart_${store.id}`);
        if (saved) {
            try { setCartItems(JSON.parse(saved)); } catch (e) {}
        }
    }, [store.id]);

    const saveCart = (items) => {
        setCartItems(items);
        localStorage.setItem(`biolinko_cart_${store.id}`, JSON.stringify(items));
    };

    const soldOut = Number(product.stock) <= 0;
    const minQ = product.min_order_quantity || 1;
    const isPromo = product.is_promo && Number(product.promo_price) > 0 && Number(product.promo_price) < Number(product.price_vendor);

    const handleAddToCart = (goToCart = false) => {
        const qToAdd = Math.max(quantity, minQ);
        const variantObj = selectedVariant || null;

        let currentPv = isPromo ? parseFloat(product.promo_price) : parseFloat(product.price_vendor);
        if (variantObj && variantObj.price && parseFloat(variantObj.price) > 0) {
            currentPv = parseFloat(variantObj.price);
        }

        const existingIndex = cartItems.findIndex(
            (item) => item.product_id === product.id && item.variant_id === (variantObj ? variantObj.id : null),
        );

        let updated;
        if (existingIndex > -1) {
            updated = [...cartItems];
            updated[existingIndex].quantity += qToAdd;
        } else {
            updated = [
                ...cartItems,
                {
                    product_id: product.id,
                    title: product.title,
                    image_url: images[0],
                    variant_id: variantObj ? variantObj.id : null,
                    variant_label: variantObj ? (variantObj.name || `${variantObj.size || ''} ${variantObj.color || ''}`.trim()) : '',
                    min_order_quantity: minQ,
                    price_vendor: currentPv,
                    price_display: Math.ceil(currentPv),
                    quantity: qToAdd,
                },
            ];
        }

        saveCart(updated);
        if (goToCart) {
            window.location.href = `/${store.slug}?tab=cart`;
        } else {
            toast.success('Ajouté au panier', { description: product.title });
        }
    };

    const unitPrice = selectedVariant?.price && parseFloat(selectedVariant.price) > 0
        ? parseFloat(selectedVariant.price)
        : (product.price_display || parseFloat(isPromo ? product.promo_price : product.price_vendor));

    const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

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
        <StorefrontLayout store={store} isOwner={isOwner} cartCount={totalCartCount}>
            <Head title={`${product.title}, ${store.name}`} />

            <div className="space-y-16 pb-20 sm:pb-0">
                {isPreview && (
                    <div className="flex items-center gap-3 rounded-lg bg-brand-yellowLight p-4 text-sm text-brand-ink">
                        <Eye className="h-5 w-5 shrink-0" /> Aperçu privé : seul vous voyez cette boutique tant qu'elle n'est pas publiée.
                    </div>
                )}

                <div className="space-y-6">
                    <a href={`/${store.slug}`} className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-ink">
                        <ArrowLeft className="h-4 w-4" /> Retour à la boutique
                    </a>

                    <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-14">
                        {/* Galerie */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }} className="space-y-3 lg:sticky lg:top-28">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-brand-sand">
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
                                        <button key={idx} type="button" onClick={() => setImageIndex(idx)} aria-label={`Image ${idx + 1}`} className={`relative aspect-square overflow-hidden rounded-md transition-opacity ${imageIndex === idx ? '' : 'opacity-60 hover:opacity-100'}`}>
                                            <ProductImage src={img} alt="" className="h-full w-full" />
                                            {imageIndex === idx && <motion.span layoutId="thumb-ring" className="absolute inset-0 rounded-md border-2 border-brand-ink" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Infos & achat */}
                        <Stagger gap={0.07} className="space-y-6">
                            <StaggerItem className="space-y-3">
                                <h1 className="text-3xl font-bold leading-tight tracking-tight text-brand-ink sm:text-4xl">{product.title}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                    {avgRating && (
                                        <span className="flex items-center gap-1 text-brand-ink"><Star className="h-4 w-4 fill-[#F5B800] text-[#F5B800]" /> {avgRating} ({reviewsList.length} avis)</span>
                                    )}
                                    {soldOut ? (
                                        <span className="text-[#B91C1C]">Épuisé</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-green-700"><Check className="h-4 w-4" /> En stock{Number(product.stock) <= 5 ? `, plus que ${product.stock}` : ''}</span>
                                    )}
                                </div>
                            </StaggerItem>

                            <StaggerItem className="flex items-baseline gap-3">
                                <motion.span key={unitPrice} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-brand-ink">
                                    {Math.ceil(unitPrice).toLocaleString('fr-FR')} FCFA
                                </motion.span>
                                {isPromo && <span className="text-lg text-brand-muted line-through">{Math.ceil(product.price_vendor).toLocaleString('fr-FR')}</span>}
                            </StaggerItem>

                            {product.variants?.length > 0 && (
                                <StaggerItem className="space-y-2">
                                    <div className="text-sm font-medium text-brand-ink">Option : <span className="font-normal text-brand-muted">{selectedVariant ? variantLabel(selectedVariant) : ''}</span></div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((v) => {
                                            const on = selectedVariant?.id === v.id;
                                            return (
                                                <motion.button key={v.id} type="button" whileTap={{ scale: 0.95 }} onClick={() => setSelectedVariant(v)} aria-pressed={on}
                                                    className={`relative h-11 min-w-[48px] rounded-md border px-4 text-[15px] transition-colors ${on ? 'border-brand-ink text-brand-ink' : 'border-brand-line text-brand-muted hover:border-brand-ink/30'}`}>
                                                    {variantLabel(v)}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </StaggerItem>
                            )}

                            <StaggerItem className="flex items-center gap-4">
                                <span className="text-sm font-medium text-brand-ink">Quantité</span>
                                <div className="flex items-center rounded-md border border-brand-line">
                                    <button type="button" aria-label="Retirer un" disabled={soldOut} onClick={() => setQuantity(Math.max(minQ, quantity - 1))} className="flex h-11 w-11 items-center justify-center text-brand-ink disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                                    <motion.span key={quantity} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="w-8 text-center font-medium text-brand-ink">{soldOut ? 0 : quantity}</motion.span>
                                    <button type="button" aria-label="Ajouter un" disabled={soldOut || quantity >= product.stock} onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="flex h-11 w-11 items-center justify-center text-brand-ink disabled:opacity-40"><Plus className="h-4 w-4" /></button>
                                </div>
                                {!soldOut && quantity > 1 && <span className="text-sm text-brand-muted">Total : {Math.ceil(unitPrice * quantity).toLocaleString('fr-FR')} FCFA</span>}
                            </StaggerItem>

                            <StaggerItem className="hidden gap-3 sm:flex">
                                <motion.button type="button" disabled={soldOut} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleAddToCart(true)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-md py-3.5 text-base font-semibold disabled:opacity-50"
                                    style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                    <Smartphone className="h-5 w-5" /> {soldOut ? 'Épuisé' : 'Acheter maintenant'}
                                </motion.button>
                                <motion.button type="button" disabled={soldOut} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleAddToCart(false)}
                                    className="flex items-center justify-center gap-2 rounded-md border border-brand-ink/15 px-5 font-semibold text-brand-ink hover:border-brand-ink/35 disabled:opacity-50">
                                    <ShoppingBag className="h-5 w-5" /> Ajouter au panier
                                </motion.button>
                                <button type="button" onClick={handleShare} aria-label="Partager ce produit" className="flex w-12 items-center justify-center rounded-md border border-brand-ink/15 text-brand-ink hover:border-brand-ink/35">
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </StaggerItem>

                            <StaggerItem className="divide-y divide-brand-line border-y border-brand-line text-[15px]">
                                {[
                                    [Truck, 'Livraison en 24 à 48 h', (store.city_location || store.city) ? `Expédié depuis ${store.city_location || store.city}` : 'Directement par le vendeur'],
                                    [Smartphone, 'Paiement MTN MoMo ou Orange Money', 'Confirmé sur votre téléphone'],
                                    [MessageSquare, 'Suivi sur WhatsApp', 'Facture et lien de suivi après paiement'],
                                ].map(([Icon, title, sub]) => (
                                    <div key={title} className="flex items-start gap-3 py-3.5">
                                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-ink" />
                                        <div><div className="text-brand-ink">{title}</div><div className="text-sm text-brand-muted">{sub}</div></div>
                                    </div>
                                ))}
                            </StaggerItem>

                            {product.description && (
                                <StaggerItem className="space-y-2">
                                    <h2 className="text-lg font-semibold text-brand-ink">Description</h2>
                                    <p className="whitespace-pre-line leading-relaxed text-brand-muted">{product.description}</p>
                                </StaggerItem>
                            )}

                            <StaggerItem>
                                <a href={`/${store.slug}`} className="flex items-center gap-3 rounded-lg bg-brand-sand p-4 hover:bg-brand-cream">
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                        {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-5 w-5" />}
                                    </span>
                                    <span className="flex-1">
                                        <span className="block font-medium text-brand-ink">{store.name}</span>
                                        <span className="text-sm text-brand-muted">{store.category || 'Voir la boutique'}</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-brand-muted" />
                                </a>
                            </StaggerItem>
                        </Stagger>
                    </div>
                </div>

                {reviewsList.length > 0 && (
                    <section className="space-y-6">
                        <Reveal className="flex items-end justify-between">
                            <h2 className="text-2xl font-bold tracking-tight text-brand-ink">Avis clients</h2>
                            <a href={`/${store.slug}#reviews`} className="text-[15px] font-medium text-brand-ink hover:underline">Donner mon avis</a>
                        </Reveal>
                        <Stagger className="grid gap-5 md:grid-cols-3">
                            {reviewsList.slice(0, 3).map((rev, idx) => (
                                <StaggerItem key={rev.id || idx} className="space-y-3 rounded-lg border border-brand-line p-5">
                                    <div className="flex gap-0.5">
                                        {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`h-4 w-4 ${s < (rev.rating || 5) ? 'fill-[#F5B800] text-[#F5B800]' : 'text-brand-line'}`} />)}
                                    </div>
                                    <p className="leading-relaxed text-brand-ink">{rev.comment}</p>
                                    <div className="text-sm text-brand-muted">{rev.customer_name || rev.name}{(rev.customer_city || rev.city) ? `, ${rev.customer_city || rev.city}` : ''}</div>
                                </StaggerItem>
                            ))}
                        </Stagger>
                    </section>
                )}

                {relatedProducts.length > 0 && (
                    <section className="space-y-6">
                        <Reveal className="flex items-end justify-between">
                            <h2 className="text-2xl font-bold tracking-tight text-brand-ink">Vous aimerez aussi</h2>
                            <a href={`/${store.slug}`} className="inline-flex items-center gap-1.5 text-[15px] font-medium text-brand-ink hover:underline">Toute la boutique <ArrowRight className="h-4 w-4" /></a>
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
                className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-brand-line bg-white/95 p-3 backdrop-blur-md sm:hidden">
                <button type="button" disabled={soldOut} onClick={() => handleAddToCart(false)} aria-label="Ajouter au panier" className="flex h-12 w-12 items-center justify-center rounded-md border border-brand-ink/15 text-brand-ink disabled:opacity-50">
                    <ShoppingBag className="h-5 w-5" />
                </button>
                <button type="button" disabled={soldOut} onClick={() => handleAddToCart(true)} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md font-semibold disabled:opacity-50" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                    {soldOut ? 'Épuisé' : `Acheter, ${Math.ceil(unitPrice * quantity).toLocaleString('fr-FR')} FCFA`}
                </button>
            </motion.div>
        </StorefrontLayout>
    );
}
