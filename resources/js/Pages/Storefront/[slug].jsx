import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { initPixels, track } from '@/Components/Storefront/pixels';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Eye, MessageSquare, Minus, Plus, Share2, ShieldCheck, ShoppingBag, Smartphone, Star, Store, Truck } from 'lucide-react';
import { EASE_OUT, Reveal, Stagger, StaggerItem } from '@/Components/UI/Motion';
import ProductCard, { ProductImage } from '@/Components/Storefront/ProductCard';
import useCart, { durationLabel, earliestDate, leadTimeLabel, optionPrice } from '@/Components/Storefront/useCart';
import SizeGuide from '@/Components/Storefront/SizeGuide';
import ProductReviews from '@/Components/Storefront/ProductReviews';
import { storeUrl } from '@/Components/Storefront/storeUrl';
import { usePreviewStore } from '@/Components/Storefront/livePreview';
import { storeTheme } from '@/Components/Storefront/Design/theme';

// Titre des options : tailles (S, M, 38…), pointures, âges, sinon « Option »
function optionKind(labels) {
    if (!labels.length) return 'Option';
    if (labels.every((l) => /^(\d{1,2}\s?(mois|ans?))$/i.test(l.trim()))) return 'Âge';
    if (labels.every((l) => /^(3[0-9]|4[0-8])([.,]5)?$/.test(l.trim()))) return 'Pointure';
    if (labels.every((l) => /^(XXS|XS|S|M|L|XL|XXL|XXXL|[2-6]XL|\d{2})$/i.test(l.trim()))) return 'Taille';
    return 'Option';
}

// Points clés : les lignes courtes de la description (caractéristiques, composition…)
function keyPointsOf(description) {
    const lines = String(description || '').split(/\n|•|;/).map((x) => x.trim().replace(/^[-–·*]\s*/, '').replace(/\.$/, '')).filter(Boolean);
    return lines.length >= 2 ? lines.filter((x) => x.length <= 70).slice(0, 5) : [];
}

export default function ProductSlugShow({ store: savedStore, product, isPreview = false, productReviews = [], rating = null, seoTitle = null }) {
    const store = usePreviewStore(savedStore);
    const authUser = usePage().props.auth?.user;
    const isOwner = authUser && authUser.id === store.user_id;

    useEffect(() => {
        if (isPreview || isOwner || !store.is_published) return;
        initPixels(store);
        track('ViewContent', { value: product.price_display, id: product.id, name: product.title });
    }, [product.id]);

    const { primary: primaryColor, onPrimary: primaryTextColor } = storeTheme(store);

    const images = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (product.image_url ? [product.image_url] : [null]);

    const [imageIndex, setImageIndex] = useState(0);
    // Déclinaison choisie depuis la vitrine (configurateur : ?variante=<id>), sinon la première
    const [selectedVariant, setSelectedVariant] = useState(() => {
        const wanted = typeof window !== 'undefined' ? Number(new URLSearchParams(window.location.search).get('variante')) : 0;
        return product.variants?.find((v) => v.id === wanted) || product.variants?.[0] || null;
    });
    const [quantity, setQuantity] = useState(product.min_order_quantity || 1);
    const cart = useCart(store.id);

    const madeToOrder = product.fulfillment === 'made_to_order';
    const soldOut = !madeToOrder && Number(product.stock) <= 0;
    const maxQ = madeToOrder ? (product.daily_capacity || 99) : Number(product.stock);
    const minQ = product.min_order_quantity || 1;
    const isPromo = product.promo_active;
    const fields = (product.custom_fields || []).filter((f) => f.label);
    const [answers, setAnswers] = useState({});
    const cta = madeToOrder ? (store.template?.cta === 'Réserver' ? 'Réserver' : 'Commander') : 'Acheter maintenant';

    const handleAddToCart = (goToCart = false) => {
        // Précisions obligatoires (nombre de parts, mensurations…) avant d'ajouter au panier
        const missing = fields.find((f) => f.required && !(answers[f.label] || '').trim());
        if (missing) {
            toast.error(`Précisez « ${missing.label} »`);
            document.getElementById(`field-${fields.indexOf(missing)}`)?.focus();
            return;
        }
        const customizations = fields.map((f) => {
            const value = (answers[f.label] || '').trim();
            const price = f.type === 'select' ? optionPrice(f, value) : 0;
            return { label: f.label, value, ...(price ? { price } : {}) };
        }).filter((c) => c.value);
        cart.add({ ...product, image_url: images[0] }, quantity, selectedVariant, customizations);
        if (goToCart) {
            window.location.href = storeUrl(store.slug, `?tab=cart`);
        } else {
            toast.success('Ajouté au panier', { description: product.title });
        }
    };

    // Suppléments des choix (configurateur : « 12 parts +6 000 FCFA »)
    const extras = fields.reduce((a, f) => a + (f.type === 'select' ? optionPrice(f, answers[f.label]) : 0), 0);
    const basePrice = selectedVariant?.price && parseFloat(selectedVariant.price) > 0
        ? parseFloat(selectedVariant.price)
        : (product.price_display || parseFloat(isPromo ? product.promo_price : product.price_vendor));
    const unitPrice = basePrice + extras;


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
    // Suggestions : d'abord la même catégorie, puis le reste de la boutique
    const relatedProducts = (store?.products || []).filter((p) => p.id !== product.id)
        .map((p, i) => ({ p, rank: (product.category && p.category === product.category ? 0 : 1) * 1000 + i }))
        .sort((a, b) => a.rank - b.rank).slice(0, 4).map(({ p }) => p);
    const variantLabel = (v) => v.name || `${v.size || ''} ${v.color || ''}`.trim() || 'Option';
    const optionTitle = optionKind((product.variants || []).map(variantLabel));
    const specs = (product.specs || []).filter((r) => r.label && r.value);
    const keyPoints = specs.length ? [] : keyPointsOf(product.description);
    const specsTitle = ['sante', 'beaute', 'alimentation', 'patisserie', 'restauration'].includes(store.business_type) ? 'Composition' : 'Caractéristiques';
    const [sizeGuide, setSizeGuide] = useState(false);
    const services = store.business_type === 'services';
    const earliest = madeToOrder ? new Date(`${earliestDate(product.lead_time_hours)}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : null;

    return (
        <StorefrontLayout store={store} isOwner={isOwner} cartCount={cart.count}>
            <Head title={seoTitle || `${product.title} | ${store.name}`} />

            <div className="space-y-12 pb-20 sm:pb-0">
                {isPreview && (
                    <div className="flex items-center gap-3 rounded-[var(--r,24px)] bg-[#FFF8D6] p-4 text-sm text-[color:var(--ink,#141412)]">
                        <Eye className="h-5 w-5 shrink-0" /> Aperçu privé : seul vous voyez cette boutique tant qu'elle n'est pas publiée.
                    </div>
                )}

                <div className="space-y-6">
                    <a href={storeUrl(store.slug)} className="inline-flex items-center gap-1.5 text-sm text-[color:var(--mu,#5F5E58)] hover:text-[color:var(--ink,#141412)]">
                        <ArrowLeft className="h-4 w-4" /> Retour à la boutique
                    </a>

                    <div className="grid items-start gap-6 md:grid-cols-2 lg:gap-10 max-w-5xl">
                        {/* Galerie */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }} className="space-y-3 md:sticky md:top-24 w-full max-w-md md:max-w-none mx-auto">
                            <div className="relative aspect-square overflow-hidden rounded-[var(--r,16px)] bg-[color:var(--sf,#F6F5F1)]">
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
                                        <button key={idx} type="button" onClick={() => setImageIndex(idx)} aria-label={`Image ${idx + 1}`} className={`relative aspect-square overflow-hidden rounded-[min(var(--r,12px),12px)] transition-opacity ${imageIndex === idx ? '' : 'opacity-60 hover:opacity-100'}`}>
                                            <ProductImage src={img} alt="" className="h-full w-full" />
                                            {imageIndex === idx && <motion.span layoutId="thumb-ring" className="absolute inset-0 rounded-[min(var(--r,12px),12px)] border-2 border-[color:var(--ink,#141412)]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Infos & achat */}
                        <Stagger gap={0.07} className="space-y-5 min-w-0">
                            <StaggerItem className="space-y-3 min-w-0">
                                {product.category && (
                                    <a href={storeUrl(store.slug, `?categorie=${encodeURIComponent(product.category)}`)} className="inline-block text-sm text-[color:var(--mu,#5F5E58)] hover:text-[color:var(--ink,#141412)] hover:underline">{product.category}</a>
                                )}
                                <h1 className="break-words text-2xl font-medium leading-tight tracking-[-0.02em] text-[color:var(--ink,#141412)] sm:text-[28px]">{product.title}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                    {rating?.count > 0 && (
                                        <a href="#avis" className="flex items-center gap-1 text-[color:var(--ink,#141412)] hover:underline"><Star className="h-4 w-4 fill-[#F5B800] text-[#F5B800]" /> {String(rating.avg).replace('.', ',')} ({rating.count} avis)</a>
                                    )}
                                    {madeToOrder ? (
                                        <span className="flex items-center gap-1 text-[color:var(--ink,#141412)]"><Clock className="h-4 w-4" /> {product.duration_minutes ? `Durée : ${durationLabel(product.duration_minutes)}` : `Sur commande${product.lead_time_hours > 0 ? ` · prêt en ${leadTimeLabel(product.lead_time_hours)}` : ''}`}</span>
                                    ) : soldOut ? (
                                        <span className="text-[#B91C1C]">Épuisé</span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-green-700"><Check className="h-4 w-4" /> En stock{Number(product.stock) <= 5 ? `, plus que ${product.stock}` : ''}</span>
                                    )}
                                </div>
                            </StaggerItem>

                            <StaggerItem className="flex items-baseline gap-3">
                                <motion.span key={unitPrice} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold tracking-[-0.02em] text-[color:var(--ink,#141412)]">
                                    {Math.ceil(unitPrice).toLocaleString('fr-FR')} FCFA
                                </motion.span>
                                {isPromo && <span className="text-base text-[color:var(--mu,#5F5E58)] line-through">{Math.ceil(product.price_vendor).toLocaleString('fr-FR')}</span>}
                            </StaggerItem>

                            {product.variants?.length > 0 && (
                                <StaggerItem className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="text-sm font-medium text-[color:var(--ink,#141412)]">{optionTitle} : <span className="font-normal text-[color:var(--mu,#5F5E58)]">{selectedVariant ? variantLabel(selectedVariant) : ''}</span></div>
                                        {['Taille', 'Pointure'].includes(optionTitle) && (
                                            <button type="button" onClick={() => setSizeGuide(true)} className="text-sm text-[color:var(--ink,#141412)] underline underline-offset-2">
                                                {optionTitle === 'Pointure' ? 'Guide des pointures' : 'Guide des tailles'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((v) => {
                                            const on = selectedVariant?.id === v.id;
                                            return (
                                                <motion.button key={v.id} type="button" whileTap={{ scale: 0.95 }} onClick={() => setSelectedVariant(v)} aria-pressed={on}
                                                    className={`relative h-9 min-w-[40px] rounded-[var(--rb,9999px)] border px-3.5 text-sm transition-colors ${on ? 'border-[color:var(--ink,#141412)] text-[color:var(--ink,#141412)]' : 'border-[color:var(--ln,rgba(0,0,0,0.08))] text-[color:var(--mu,#5F5E58)] hover:border-[color:color-mix(in_srgb,var(--ink,#000000)_30%,transparent)]'}`}>
                                                    {variantLabel(v)}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </StaggerItem>
                            )}

                            {fields.length > 0 && (
                                <StaggerItem className="space-y-3">
                                    {fields.map((f, i) => (
                                        <div key={f.label}>
                                            <label htmlFor={`field-${i}`} className="mb-1.5 block text-sm font-medium text-[color:var(--ink,#141412)]">
                                                {f.label}{f.required ? '' : <span className="font-normal text-[color:var(--mu,#8B8A83)]"> (facultatif)</span>}
                                            </label>
                                            {f.type === 'select' ? (
                                                <select id={`field-${i}`} value={answers[f.label] || ''} onChange={(e) => setAnswers((a) => ({ ...a, [f.label]: e.target.value }))}
                                                    className="h-11 w-full rounded-[min(var(--r,12px),12px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:var(--bg,#FFFFFF)] px-3.5 text-[15px] text-[color:var(--ink,#141412)] focus:border-[color:color-mix(in_srgb,var(--ink,#000000)_40%,transparent)] focus:ring-0">
                                                    <option value="">Choisir…</option>
                                                    {(f.options || []).map((o) => <option key={o} value={o}>{o}{optionPrice(f, o) ? ` (+${optionPrice(f, o).toLocaleString('fr-FR')} FCFA)` : ''}</option>)}
                                                </select>
                                            ) : (
                                                <input id={`field-${i}`} type="text" maxLength={300} value={answers[f.label] || ''} onChange={(e) => setAnswers((a) => ({ ...a, [f.label]: e.target.value }))}
                                                    className="h-11 w-full rounded-[min(var(--r,12px),12px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:var(--bg,#FFFFFF)] px-3.5 text-[15px] text-[color:var(--ink,#141412)] focus:border-[color:color-mix(in_srgb,var(--ink,#000000)_40%,transparent)] focus:ring-0" />
                                            )}
                                        </div>
                                    ))}
                                </StaggerItem>
                            )}

                            <StaggerItem className="flex items-center gap-4">
                                <span className="text-sm font-medium text-[color:var(--ink,#141412)]">Quantité</span>
                                <div className="flex items-center rounded-[min(var(--r,12px),12px)] border border-[color:var(--ln,rgba(0,0,0,0.08))]">
                                    <button type="button" aria-label="Retirer un" disabled={soldOut} onClick={() => setQuantity(Math.max(minQ, quantity - 1))} className="flex h-9 w-9 items-center justify-center text-[color:var(--ink,#141412)] disabled:opacity-40"><Minus className="h-4 w-4" /></button>
                                    <motion.span key={quantity} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="w-8 text-center font-medium text-[color:var(--ink,#141412)]">{soldOut ? 0 : quantity}</motion.span>
                                    <button type="button" aria-label="Ajouter un" disabled={soldOut || quantity >= maxQ} onClick={() => setQuantity(Math.min(maxQ, quantity + 1))} className="flex h-9 w-9 items-center justify-center text-[color:var(--ink,#141412)] disabled:opacity-40"><Plus className="h-4 w-4" /></button>
                                </div>
                                {!soldOut && quantity > 1 && <span className="text-sm text-[color:var(--mu,#5F5E58)]">Total : {Math.ceil(unitPrice * quantity).toLocaleString('fr-FR')} FCFA</span>}
                            </StaggerItem>

                            <StaggerItem className="hidden gap-3 sm:flex">
                                <motion.button type="button" disabled={soldOut} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleAddToCart(true)}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-[var(--rb,9999px)] py-2.5 text-sm font-semibold disabled:opacity-50"
                                    style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                    <Smartphone className="h-4 w-4" /> {soldOut ? 'Épuisé' : cta}
                                </motion.button>
                                <motion.button type="button" disabled={soldOut} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => handleAddToCart(false)}
                                    className="flex items-center justify-center gap-2 rounded-[var(--rb,9999px)] border border-[color:var(--ln,rgba(0,0,0,0.15))] px-5 text-sm font-semibold text-[color:var(--ink,#141412)] hover:border-[color:color-mix(in_srgb,var(--ink,#000000)_40%,transparent)] disabled:opacity-50">
                                    <ShoppingBag className="h-4 w-4" /> Ajouter au panier
                                </motion.button>
                                <button type="button" onClick={handleShare} aria-label="Partager ce produit" className="flex w-10 items-center justify-center rounded-full border border-[color:var(--ln,rgba(0,0,0,0.15))] text-[color:var(--ink,#141412)] hover:border-[color:color-mix(in_srgb,var(--ink,#000000)_40%,transparent)]">
                                    <Share2 className="h-4 w-4" />
                                </button>
                            </StaggerItem>

                            <StaggerItem className="divide-y divide-[color:var(--ln,rgba(0,0,0,0.08))] border-y border-[color:var(--ln,rgba(0,0,0,0.08))] text-sm">
                                {[
                                    [Truck, 'Livraison à domicile', (store.city_location || store.city) ? `Expédié depuis ${store.city_location || store.city}` : 'Organisée par le vendeur'],
                                    [ShieldCheck, 'Paiement sécurisé MTN MoMo ou Orange Money', 'Un problème ? Signalez-le depuis le suivi : la vente reste bloquée le temps de trouver une solution'],
                                    [MessageSquare, 'Facture et suivi de commande', 'Envoyés par WhatsApp et e-mail après le paiement'],
                                ].map(([Icon, title, sub]) => (
                                    <div key={title} className="flex items-start gap-3 py-2.5">
                                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--ink,#141412)]" />
                                        <div><div className="text-[color:var(--ink,#141412)]">{title}</div><div className="text-xs text-[color:var(--mu,#5F5E58)]">{sub}</div></div>
                                    </div>
                                ))}
                            </StaggerItem>

                            {madeToOrder && !soldOut && (
                                <StaggerItem className="flex items-start gap-3 rounded-[var(--r,16px)] bg-[color:var(--sf,#F6F5F1)] p-3.5 text-sm">
                                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--ink,#141412)]" />
                                    <span className="text-[color:var(--ink,#141412)]">
                                        {services ? 'Vous choisissez la date de la prestation' : 'Vous choisissez la date de livraison ou de retrait'} au moment de payer
                                        <span className="block text-[color:var(--mu,#5F5E58)]">Première date possible : {earliest}{product.daily_capacity ? ` · ${product.daily_capacity} par jour au maximum` : ''}</span>
                                    </span>
                                </StaggerItem>
                            )}

                            {specs.length > 0 && (
                                <StaggerItem className="space-y-2">
                                    <h2 className="text-base font-semibold text-[color:var(--ink,#141412)]">{specsTitle}</h2>
                                    <dl className="divide-y divide-[color:var(--ln,rgba(0,0,0,0.08))] rounded-[var(--r,16px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] text-sm">
                                        {specs.map((r) => (
                                            <div key={r.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 px-3.5 py-2.5">
                                                <dt className="text-[color:var(--mu,#5F5E58)] [overflow-wrap:anywhere]">{r.label}</dt>
                                                <dd className="text-[color:var(--ink,#141412)] [overflow-wrap:anywhere]">{r.value}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </StaggerItem>
                            )}

                            {keyPoints.length >= 2 && (
                                <StaggerItem className="space-y-2">
                                    <h2 className="text-base font-semibold text-[color:var(--ink,#141412)]">Points clés</h2>
                                    <ul className="space-y-1.5 text-sm text-[color:var(--ink,#141412)]">
                                        {keyPoints.map((k) => <li key={k} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--acc, #15803D)' }} />{k}</li>)}
                                    </ul>
                                </StaggerItem>
                            )}

                            {product.description && (
                                <StaggerItem className="space-y-2">
                                    <h2 className="text-base font-semibold text-[color:var(--ink,#141412)]">Description</h2>
                                    <p className="break-words whitespace-pre-line text-sm leading-relaxed text-[color:var(--mu,#5F5E58)]">{product.description}</p>
                                </StaggerItem>
                            )}

                            <StaggerItem>
                                <a href={storeUrl(store.slug)} className="flex items-center gap-3 rounded-[min(var(--r,12px),12px)] bg-[color:var(--sf,#F6F5F1)] p-3 hover:bg-[color:var(--sf,#F6F5F1)]">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[color:var(--bg,#FFFFFF)] shadow-xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                        {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-5 w-5" />}
                                    </span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block truncate font-medium text-[color:var(--ink,#141412)]" title={store.name}>{store.name}</span>
                                        <span className="block truncate text-sm text-[color:var(--mu,#5F5E58)]">{store.category || 'Voir la boutique'}</span>
                                    </span>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-[color:var(--mu,#5F5E58)]" />
                                </a>
                            </StaggerItem>
                        </Stagger>
                    </div>
                </div>

                <ProductReviews store={store} product={product} reviews={productReviews} rating={rating} primaryColor={primaryColor} primaryTextColor={primaryTextColor} />

                {relatedProducts.length > 0 && (
                    <section className="space-y-6">
                        <Reveal className="flex items-end justify-between">
                            <h2 className="text-xl font-medium tracking-[-0.02em] text-[color:var(--ink,#141412)]">Vous aimerez aussi</h2>
                            <a href={storeUrl(store.slug)} className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[color:var(--ink,#141412)] hover:underline shrink-0">Toute la boutique <ArrowRight className="h-4 w-4" /></a>
                        </Reveal>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
                            {relatedProducts.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    storeSlug={store.slug}
                                    primaryColor={primaryColor}
                                    primaryTextColor={primaryTextColor}
                                    onAdd={() => { window.location.href = storeUrl(store.slug, `/p/${p.slug}`); }}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <SizeGuide kind={optionTitle} open={sizeGuide} onClose={() => setSizeGuide(false)} />

            {/* Barre d'achat mobile */}
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.4 }}
                className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:color-mix(in_srgb,var(--bg,#FFFFFF)_95%,transparent)] p-3 backdrop-blur-md sm:hidden">
                <button type="button" disabled={soldOut} onClick={() => handleAddToCart(false)} aria-label="Ajouter au panier" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--ln,rgba(0,0,0,0.15))] text-[color:var(--ink,#141412)] disabled:opacity-50">
                    <ShoppingBag className="h-5 w-5" />
                </button>
                <button type="button" disabled={soldOut} onClick={() => handleAddToCart(true)} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--rb,9999px)] text-sm font-semibold disabled:opacity-50 min-w-0 px-2" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                    <span className="truncate">{soldOut ? 'Épuisé' : `${madeToOrder ? cta : 'Acheter'} • ${Math.ceil(unitPrice * quantity).toLocaleString('fr-FR')} FCFA`}</span>
                </button>
            </motion.div>
        </StorefrontLayout>
    );
}
