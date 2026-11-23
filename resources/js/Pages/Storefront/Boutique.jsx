import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { ArrowLeft, ArrowRight, Eye, ShoppingBag, Star, Trash2, X } from 'lucide-react';
import { EASE_OUT } from '@/Components/UI/Motion';
import useCart, { formatFcfa } from '@/Components/Storefront/useCart';
import CheckoutForm from '@/Components/Storefront/Checkout/CheckoutForm';
import OrderSummary from '@/Components/Storefront/Checkout/OrderSummary';
import CartSuggestions from '@/Components/Storefront/Checkout/CartSuggestions';
import { Container } from '@/Components/Storefront/Sections';
import StoreSections, { StoreCatalog } from '@/Components/Storefront/Design/StoreSections';
import { CartBar } from '@/Components/Storefront/Design/Chrome';
import { storeDesign } from '@/Components/Storefront/Design/classic';
import { productUrl } from '@/Components/Storefront/storeUrl';
import { usePreviewStore } from '@/Components/Storefront/livePreview';
import { storeTheme } from '@/Components/Storefront/Design/theme';

const DEFAULT_BENEFITS = [
    { title: 'Livraison à domicile', subtitle: 'Le vendeur vous contacte pour organiser la livraison' },
    { title: 'Paiement Mobile Money', subtitle: 'MTN MoMo et Orange Money, validé sur votre téléphone' },
    { title: 'Reçu automatique', subtitle: 'Votre facture envoyée par WhatsApp et e-mail' },
    { title: 'Suivi de commande', subtitle: 'Un lien pour suivre votre commande à tout moment' },
];

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

export default function Boutique({ store: savedStore, products = [], activeSmartLinks = [], isPreview = false, seoTitle = null }) {
    // Dans l'éditeur « Apparence », les modifications s'affichent avant même d'être enregistrées
    const store = usePreviewStore(savedStore);
    const authUser = usePage().props.auth?.user;
    const isOwner = authUser && authUser.id === store.user_id;
    const cart = useCart(store.id);

    const { primary: primaryColor, onPrimary: primaryTextColor } = storeTheme(store);
    const theme = { color: primaryColor, text: primaryTextColor, pattern: store?.pattern };

    const [activeSectionTab, setActiveSectionTab] = useState('all'); // 'all' | 'cart'
    // Lien vers une catégorie (?categorie=Robes, fil d'Ariane de la page produit) : catalogue filtré
    const initialCategory = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('categorie') : null;
    const [viewMode, setViewMode] = useState(initialCategory ? 'catalog' : 'home'); // 'home' | 'catalog'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(initialCategory ? slugify(initialCategory) : 'all');
    const [wishlist, setWishlist] = useState([]);

    // Ouvre le panier directement via ?tab=cart (lien depuis la fiche produit)
    useEffect(() => {
        const tab = new URLSearchParams(window.location.search).get('tab');
        if (tab) setActiveSectionTab(tab);
    }, []);

    const toggleWishlist = (productId) => {
        setWishlist((prev) => {
            if (prev.includes(productId)) {
                toast.info('Produit retiré des favoris');
                return prev.filter((id) => id !== productId);
            }
            toast.success('Produit ajouté aux favoris');
            return [...prev, productId];
        });
    };

    const handleAddToCart = (product) => {
        // Produit avec des précisions à donner (message, mensurations…) : sur sa fiche
        if ((product.custom_fields || []).some((f) => f.label)) {
            window.location.href = productUrl(store.slug, product.slug);
            return;
        }
        cart.add(product);
        toast.success(`« ${product.title} » ajouté au panier`, {
            action: { label: 'Voir le panier', onClick: () => { setActiveSectionTab('cart'); window.scrollTo({ top: 0 }); } },
        });
    };

    // Avis client
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [review, setReview] = useState({ rating: 5, name: '', city: '', comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleSubmitCustomerReview = (e) => {
        e.preventDefault();
        if (!review.name || !review.comment) return;
        setIsSubmittingReview(true);
        router.post(route('storefront.reviews.store', store.slug), {
            customer_name: review.name,
            customer_city: review.city || 'Douala',
            rating: review.rating,
            comment: review.comment,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsReviewModalOpen(false);
                setReview({ rating: 5, name: '', city: '', comment: '' });
                toast.success('Merci ! Votre avis a été enregistré.');
            },
            onFinish: () => setIsSubmittingReview(false),
        });
    };

    const categories = Array.from(new Set(products.map((p) => p.category_name || p.category?.name || p.category).filter(Boolean)))
        .slice(0, 10)
        .map((name) => ({ id: slugify(name), label: name }));

    const filteredProducts = products.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch = !q || p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
        const cat = p.category_name || p.category?.name || p.category || '';
        const matchesCategory = selectedCategory === 'all' || slugify(cat) === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const promoProducts = products.filter((p) => p.promo_active);
    const nextPromoEnd = promoProducts
        .map((p) => (p.promo_end_at ? new Date(p.promo_end_at).getTime() : null))
        .filter((t) => t && t > Date.now())
        .sort((a, b) => a - b)[0] || null;

    // Vitrine : template publié avec le moteur, sinon « Classique » calculé depuis les réglages d'Apparence
    const design = storeDesign(store);
    // En-tête du template (pas l'en-tête Biolinko d'origine) : barre panier du template
    const templateChrome = design.sections.some((s) => s.type === 'header' && s.variant !== 'classic');
    const benefits = Array.isArray(store?.benefits_json) && store.benefits_json.length ? store.benefits_json : DEFAULT_BENEFITS;

    const cardProps = { storeSlug: store.slug, primaryColor, primaryTextColor, onAdd: handleAddToCart, onWishlist: toggleWishlist, wishlist };

    const scrollToCatalog = () => document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });
    const openCatalog = () => { setViewMode('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const pageMotion = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.4, ease: EASE_OUT } };

    // Données communes aux sections de la vitrine
    const sectionCtx = {
        store, theme, products, filteredProducts, categories, selectedCategory, onCategory: setSelectedCategory, search: searchQuery, onSearch: setSearchQuery,
        cardProps, onShop: scrollToCatalog, onSeeAll: openCatalog, promoProducts, promoEndsAt: nextPromoEnd, packs: activeSmartLinks, benefits,
        reviews: store?.reviews || [], onReview: () => setIsReviewModalOpen(true),
        // Configurateur : ajout avec la déclinaison et les choix du client
        addToCart: (p, qty, variant, customizations) => {
            cart.add(p, qty, variant, customizations);
            toast.success(`« ${p.title} » ajouté au panier`, { action: { label: 'Voir le panier', onClick: () => { setActiveSectionTab('cart'); window.scrollTo({ top: 0 }); } } });
        },
        notify: (message) => toast.error(message),
    };

    const fieldClass = 'h-12 w-full rounded-[min(var(--r,12px),12px)] border border-[color:var(--ln,rgba(0,0,0,0.1))] bg-[color:var(--bg,#FFFFFF)] px-4 text-[16px] text-[color:var(--ink,#141412)] placeholder:text-[color:var(--mu,#8B8A83)] focus:border-[color:color-mix(in_srgb,var(--ink,#000000)_30%,transparent)] focus:ring-0';

    return (
        <StorefrontLayout
            store={store}
            patternBand={activeSectionTab === 'cart'}
            activeTab={activeSectionTab}
            setActiveTab={setActiveSectionTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isOwner={isOwner}
            hasPromos={promoProducts.length > 0}
            hasSmartLinks={activeSmartLinks.length > 0}
            cartCount={cart.count}
            fullBleed
        >
            <Head title={activeSectionTab === 'cart' ? `Mon panier | ${store.name}` : (seoTitle || `${store.name} | Biolinko`)} />

            {isPreview && (
                <Container className="pt-6">
                    <div className="flex flex-col items-start justify-between gap-3 rounded-[var(--r,16px)] border border-[color:var(--ln,rgba(0,0,0,0.06))] bg-[#FFF8D6] p-4 text-[14px] text-[color:var(--ink,#141412)] sm:flex-row sm:items-center">
                        <span className="flex items-center gap-3"><Eye className="h-5 w-5 shrink-0" /> Aperçu privé : vous seul voyez cette boutique tant qu’elle n’est pas publiée.</span>
                        <a href="/dashboard" className="shrink-0 rounded-[var(--rb,9999px)] bg-[color:var(--ink,#141412)] px-4 py-2 font-medium text-white">Publier depuis le tableau de bord</a>
                    </div>
                </Container>
            )}

            <AnimatePresence mode="wait">
                {activeSectionTab === 'cart' ? (
                    <motion.div key="cart" {...pageMotion}>
                        <Container className="space-y-6 py-8">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <button type="button" onClick={() => setActiveSectionTab('all')} className="mb-3 inline-flex items-center gap-1.5 text-[14px] text-[color:var(--mu,#5F5E58)] hover:text-[color:var(--ink,#141412)]">
                                        <ArrowLeft className="h-4 w-4" /> Continuer mes achats
                                    </button>
                                    <h1 className="text-2xl font-medium tracking-[-0.02em] text-[color:var(--ink,#141412)] sm:text-[28px]">Finaliser ma commande</h1>
                                </div>
                                {cart.items.length > 0 && (
                                    <button type="button" onClick={() => { cart.clear(); toast('Panier vidé'); }} className="inline-flex items-center gap-1.5 text-[14px] text-[#B91C1C] hover:underline">
                                        <Trash2 className="h-4 w-4" /> Vider le panier
                                    </button>
                                )}
                            </div>

                            {cart.items.length > 0 && (
                                <CartSuggestions store={store} products={products} cartItems={cart.items} primaryColor={primaryColor} primaryTextColor={primaryTextColor}
                                    onAdd={(p) => { cart.add(p); toast.success(`« ${p.title} » ajouté au panier`); }} />
                            )}

                            {cart.items.length > 0 ? (
                                <CheckoutForm subtotal={cart.subtotal}
                                    store={store}
                                    payload={{ items: cart.items.map((it) => ({ product_id: it.product_id, variant_id: it.variant_id, quantity: it.quantity, customizations: it.customizations || [] })) }}
                                    schedule={cart.items.some((it) => it.made_to_order) ? {
                                        minHours: Math.max(0, ...cart.items.filter((it) => it.made_to_order).map((it) => it.lead_time_hours || 0)),
                                        label: store.template?.date_label || 'Date de livraison ou de retrait souhaitée',
                                    } : null}
                                    onPaid={cart.clear}
                                    disabled={isPreview}
                                    summary={(x) => <OrderSummary items={cart.items} subtotal={cart.subtotal} fee={x.fee} total={x.total} promo={x.promo} delivery={x.delivery} balance={x.balance} onQuantity={cart.setQuantity} onRemove={cart.remove} />}
                                />
                            ) : (
                                <div className="mx-auto max-w-md space-y-4 rounded-[var(--r,24px)] bg-[color:var(--sf,#F6F5F1)] p-12 text-center">
                                    <ShoppingBag className="mx-auto h-10 w-10 text-[color:var(--mu,#8B8A83)]" />
                                    <h2 className="text-[22px] font-medium text-[color:var(--ink,#141412)]">Votre panier est vide</h2>
                                    <p className="text-[color:var(--mu,#5F5E58)]">Parcourez le catalogue de {store.name} et ajoutez vos articles.</p>
                                    <button type="button" onClick={() => setActiveSectionTab('all')} className="inline-flex h-12 items-center gap-2 rounded-[var(--rb,9999px)] px-6 font-medium" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                        Voir les produits <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </Container>
                    </motion.div>
                ) : viewMode === 'catalog' ? (
                    <motion.div key="catalog" {...pageMotion}>
                        <Container className="pt-8">
                            <button type="button" onClick={() => { setViewMode('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-1.5 text-[14px] text-[color:var(--mu,#5F5E58)] hover:text-[color:var(--ink,#141412)]">
                                <ArrowLeft className="h-4 w-4" /> Retour à la boutique
                            </button>
                        </Container>
                        <StoreCatalog design={design} ctx={sectionCtx} />
                    </motion.div>
                ) : (
                    <motion.div key="home" {...pageMotion}>
                        <StoreSections design={design} ctx={sectionCtx} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Avis client */}
            <AnimatePresence>
                {isReviewModalOpen && (
                    <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-[color:var(--bg,#FFFFFF)] sm:rounded-[var(--r,24px)]" role="dialog" aria-modal="true" aria-labelledby="review-title">
                            <div className="flex items-center justify-between px-6 pt-6">
                                <h3 id="review-title" className="text-[20px] font-medium text-[color:var(--ink,#141412)]">Votre avis sur {store.name}</h3>
                                <button type="button" onClick={() => setIsReviewModalOpen(false)} aria-label="Fermer" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleSubmitCustomerReview} className="space-y-4 p-6">
                                <div className="flex gap-1" role="radiogroup" aria-label="Votre note">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.button key={star} type="button" role="radio" aria-checked={review.rating === star} whileTap={{ scale: 0.9 }}
                                            onClick={() => setReview((r) => ({ ...r, rating: star }))} aria-label={`${star} étoile${star > 1 ? 's' : ''}`} className="p-1">
                                            <Star className={`h-8 w-8 ${star <= review.rating ? 'fill-[#F5B800] text-[#F5B800]' : 'text-black/10'}`} />
                                        </motion.button>
                                    ))}
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <input aria-label="Votre nom" required value={review.name} onChange={(e) => setReview((r) => ({ ...r, name: e.target.value }))} placeholder="Votre nom" className={fieldClass} />
                                    <input aria-label="Votre ville" value={review.city} onChange={(e) => setReview((r) => ({ ...r, city: e.target.value }))} placeholder="Votre ville" className={fieldClass} />
                                </div>
                                <textarea aria-label="Votre commentaire" rows={4} required value={review.comment} onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))}
                                    placeholder="Qualité, livraison, service…" className={`${fieldClass} h-auto py-3`} />
                                <button type="submit" disabled={isSubmittingReview} className="h-12 w-full rounded-[var(--rb,9999px)] font-medium disabled:opacity-60" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                    {isSubmittingReview ? 'Envoi…' : 'Publier mon avis'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {cart.count > 0 && activeSectionTab !== 'cart' && templateChrome && (
                <CartBar store={store} design={design} count={cart.count} total={cart.total} onOpen={() => { setActiveSectionTab('cart'); window.scrollTo({ top: 0 }); }} />
            )}

            {cart.count > 0 && activeSectionTab !== 'cart' && !templateChrome && (
                <motion.button type="button" initial={{ y: 80 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    onClick={() => { setActiveSectionTab('cart'); window.scrollTo({ top: 0 }); }}
                    className="fixed bottom-5 left-4 z-30 flex h-14 items-center justify-between gap-4 rounded-[var(--rb,9999px)] px-5 font-medium shadow-[0_16px_32px_-14px_rgba(20,20,10,0.55)] sm:hidden"
                    style={{ backgroundColor: primaryColor, color: primaryTextColor, right: '1rem' }}>
                    <span className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Panier ({cart.count})</span>
                    <span className="tabular-nums">{formatFcfa(cart.total)}</span>
                </motion.button>
            )}
        </StorefrontLayout>
    );
}
