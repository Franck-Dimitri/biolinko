import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import {
    ShoppingBag, ShieldCheck, ArrowRight, ArrowLeft, X, Truck, Lock, MessageSquare, Star, Package,
    AlertCircle, Clock, MapPin, Check, Search, Store, FileText, BadgeCheck, Eye, Trash2, Plus, Minus,
    RefreshCw, Smartphone,
} from 'lucide-react';
import { EASE_OUT, Marquee, Reveal, Stagger, StaggerItem } from '@/Components/Motion';
import { WhatsappIcon } from '@/Components/BrandIcons';
import ProductCard, { ProductImage, productImage } from '@/Components/Storefront/ProductCard';
import { contrastColor } from '@/Components/Storefront/theme';

function SectionHeading({ title, sub, action }) {
    return (
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
                <h3 className="text-2xl font-bold tracking-tight text-brand-ink sm:text-[28px]">{title}</h3>
                {sub && <p className="text-[15px] text-brand-muted">{sub}</p>}
            </div>
            {action}
        </Reveal>
    );
}

function PromoCountdown({ endsAt }) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);
    const left = Math.max(0, endsAt - now);
    const parts = [
        [Math.floor(left / 86400000), 'j'],
        [Math.floor((left % 86400000) / 3600000), 'h'],
        [Math.floor((left % 3600000) / 60000), 'min'],
        [Math.floor((left % 60000) / 1000), 's'],
    ];
    return (
        <div className="flex items-center gap-2" aria-label="Temps restant avant la fin des promotions">
            <Clock className="h-4 w-4 text-brand-muted" />
            {parts.map(([v, u]) => (
                <span key={u} className="min-w-[46px] rounded-md bg-white px-2 py-1 text-center">
                    <motion.span key={v} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="block text-lg font-semibold tabular-nums text-brand-ink">{String(v).padStart(2, '0')}</motion.span>
                    <span className="text-[11px] text-brand-muted">{u}</span>
                </span>
            ))}
        </div>
    );
}

export default function Boutique({ store, products, activeSmartLinks = [], appUrl, isPreview = false }) {
    const authUser = usePage().props.auth?.user;
    const isOwner = authUser && authUser.id === store.user_id;

    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = contrastColor(primaryColor);

    const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
    const heroProductsList = (products && products.length > 0) ? products : [];

    useEffect(() => {
        if (!heroProductsList || heroProductsList.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentHeroSlide((prev) => (prev + 1) % heroProductsList.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [heroProductsList.length]);

    const activeHeroProduct = heroProductsList[currentHeroSlide] || null;
    const activeHeroPromoPct = (activeHeroProduct && activeHeroProduct.is_promo && activeHeroProduct.promo_price > 0 && Number(activeHeroProduct.promo_price) < Number(activeHeroProduct.price_vendor))
        ? Math.round(((Number(activeHeroProduct.price_vendor) - Number(activeHeroProduct.promo_price)) / Number(activeHeroProduct.price_vendor)) * 100)
        : null;

    const [activeSectionTab, setActiveSectionTab] = useState('all'); // 'all', 'products', 'promo', 'reviews', 'about', 'cart'
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('home'); // 'home' | 'catalog' | 'bestsellers'
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
    const [wishlist, setWishlist] = useState([]);

    const toggleWishlist = (productId) => {
        setWishlist((prev) => {
            if (prev.includes(productId)) {
                toast.info('Produit retiré des favoris');
                return prev.filter(id => id !== productId);
            } else {
                toast.success('Produit ajouté aux favoris !');
                return [...prev, productId];
            }
        });
    };

    const showToast = (msg) => {
        toast.success(msg, {
            description: 'Accédez au panier à tout moment pour valider votre commande.'
        });
    };// Customer Review Form State

    // Customer Review Form State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewName, setReviewName] = useState('');
    const [reviewCity, setReviewCity] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleSubmitCustomerReview = (e) => {
        e.preventDefault();
        if (!reviewName || !reviewComment) return;

        setIsSubmittingReview(true);
        router.post(route('storefront.reviews.store', store.slug), {
            customer_name: reviewName,
            customer_city: reviewCity || 'Douala',
            rating: reviewRating,
            comment: reviewComment,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmittingReview(false);
                setIsReviewModalOpen(false);
                setReviewName('');
                setReviewCity('');
                setReviewComment('');
                showToast('Merci ! Votre avis a été enregistré avec succès.');
            },
            onError: () => {
                setIsSubmittingReview(false);
            }
        });
    };

    const handleSmartLinkAddToCart = (smartLink) => {
        if (!smartLink || !smartLink.items || smartLink.items.length === 0) return;

        const newItems = smartLink.items.map(item => ({
            product_id: item.product_id,
            title: item.product_name || 'Produit SmartLink',
            image_url: item.image_url || null,
            variant_id: null,
            variant_label: `Pack: ${smartLink.title}`,
            min_order_quantity: 1,
            price_vendor: item.unit_price,
            price_display: Math.ceil(item.unit_price),
            quantity: item.quantity,
        }));

        saveCart(newItems);
        setActiveSectionTab('cart');
        showToast(`Pack "${smartLink.title}" ajouté à votre panier !`);
    };
    
    const [ussdModalState, setUssdModalState] = useState({
        isOpen: false,
        reference: null,
        tracking_code: null,
        amount: 0,
        operator: 'MTN',
        phone: '',
        status: 'PENDING',
        errorMsg: null,
    });

    // Form for checkout from Cart Page
    const { data, setData, post, processing, errors, reset } = useForm({
        store_id: store.id,
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_whatsapp: '',
        delivery_address: '',
        delivery_city: 'Douala',
        payment_method: 'momo_online',
        operator: 'MTN',
        notes: '',
        items: [],
    });

    // Load Cart and Tab from URL/localStorage on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam) {
            setActiveSectionTab(tabParam);
        }

        const saved = localStorage.getItem(`biolinko_cart_${store.id}`);
        if (saved) {
            try { setCartItems(JSON.parse(saved)); } catch (e) {}
        }

        // Load saved customer info
        const savedCust = localStorage.getItem(`biolinko_cust_info`);
        if (savedCust) {
            try {
                const parsed = JSON.parse(savedCust);
                if (parsed.customer_name) {
                    setData(prev => ({
                        ...prev,
                        customer_name: parsed.customer_name || '',
                        customer_phone: parsed.customer_phone || '',
                        customer_email: parsed.customer_email || '',
                        customer_whatsapp: parsed.customer_whatsapp || '',
                        delivery_address: parsed.delivery_address || '',
                    }));
                    setIsAutoFilled(true);
                }
            } catch (e) {}
        }
    }, [store.id]);

    const updateCustomerField = (field, val) => {
        setData(field, val);
        const currentCust = JSON.parse(localStorage.getItem(`biolinko_cust_info`) || '{}');
        currentCust[field] = val;
        localStorage.setItem(`biolinko_cust_info`, JSON.stringify(currentCust));
    };

    const saveCart = (items) => {
        setCartItems(items);
        localStorage.setItem(`biolinko_cart_${store.id}`, JSON.stringify(items));
    };


    const handleAddToCart = (product, quantityToAdd = null, variant = null) => {
        const minQ = product.min_order_quantity || 1;
        const qToAdd = quantityToAdd ? Math.max(quantityToAdd, minQ) : minQ;
        const variantObj = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);

        let currentPv = (product.is_promo && product.promo_price > 0) ? parseFloat(product.promo_price) : parseFloat(product.price_vendor);
        if (variantObj && variantObj.price && parseFloat(variantObj.price) > 0) {
            currentPv = parseFloat(variantObj.price);
        }

        const pbUnit = Math.ceil(currentPv);

        const existingIndex = cartItems.findIndex(
            item => item.product_id === product.id && item.variant_id === (variantObj ? variantObj.id : null)
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
                    image_url: product.image_url || (product.images && product.images[0] ? product.images[0] : null),
                    variant_id: variantObj ? variantObj.id : null,
                    variant_label: variantObj ? (variantObj.name || `${variantObj.size || ''} ${variantObj.color || ''}`) : '',
                    min_order_quantity: minQ,
                    price_vendor: currentPv,
                    price_display: pbUnit,
                    quantity: qToAdd,
                }
            ];
        }

        saveCart(updated);
        showToast(`"${product.title}" ajouté au panier !`);
    };

    const handleUpdateCartQuantity = (index, newQ) => {
        if (index < 0 || index >= cartItems.length) return;
        const minQ = cartItems[index].min_order_quantity || 1;
        if (newQ < minQ) return;

        const updated = [...cartItems];
        updated[index].quantity = newQ;
        saveCart(updated);
    };

    const handleRemoveFromCart = (index) => {
        const updated = cartItems.filter((_, i) => i !== index);
        saveCart(updated);
        showToast('Article retiré du panier');
    };

    const handleClearCart = () => {
        saveCart([]);
        showToast('Panier vidé');
    };

    const handlePhoneChange = (val) => {
        setData('customer_phone', val);
        if (val.startsWith('69') || val.startsWith('655') || val.startsWith('656') || val.startsWith('657') || val.startsWith('658') || val.startsWith('659')) {
            setData('operator', 'ORANGE');
        } else {
            setData('operator', 'MTN');
        }
    };

    const handleResetCustomerForm = () => {
        setData(prev => ({
            ...prev,
            customer_name: '',
            customer_phone: '',
            customer_email: '',
            customer_whatsapp: '',
            delivery_address: '',
        }));
        setIsAutoFilled(false);
    };

    // Calculate Cart Totals
    const cartSubtotalPb = cartItems.reduce((acc, item) => acc + ((item.price_display || item.price_vendor) * item.quantity), 0);
    const cartServiceFee = Math.ceil(cartSubtotalPb * 0.03);
    const cartTotalClientTc = cartSubtotalPb + cartServiceFee;
    const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleCheckoutSubmitFromCartPage = (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

        setIsSubmittingCheckout(true);

        // Save info in localStorage
        localStorage.setItem(`biolinko_cust_info`, JSON.stringify({
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            customer_email: data.customer_email,
            customer_whatsapp: data.customer_whatsapp,
            delivery_address: data.delivery_address,
        }));

        const itemsPayload = cartItems.map(it => ({
            product_id: it.product_id,
            variant_id: it.variant_id,
            quantity: it.quantity,
        }));

        axios.post(route('checkout.process'), {
            ...data,
            items: itemsPayload,
        }).then(res => {
            setIsSubmittingCheckout(false);
            if (res.data.reference) {
                setUssdModalState({
                    isOpen: true,
                    reference: res.data.reference,
                    tracking_code: res.data.tracking_code,
                    amount: cartTotalClientTc,
                    operator: data.operator,
                    phone: data.customer_phone,
                    status: 'PENDING',
                    errorMsg: null,
                });
            } else if (res.data.redirect_url) {
                saveCart([]);
                reset();
                window.location.href = res.data.redirect_url;
            }
        }).catch(err => {
            setIsSubmittingCheckout(false);
            const msg = err.response?.data?.error || err.response?.data?.message || 'Échec du traitement de la commande. Veuillez vérifier vos numéros.';
            alert(msg);
        });
    };

    // USSD Polling
    useEffect(() => {
        if (!ussdModalState.isOpen || !ussdModalState.reference || ussdModalState.status !== 'PENDING') {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(route('checkout.status', ussdModalState.reference));
                if (res.data.status === 'PAID') {
                    setUssdModalState(prev => ({ ...prev, status: 'SUCCESS' }));
                    saveCart([]);
                    setTimeout(() => {
                        window.location.href = route('order.confirmation', res.data.tracking_code);
                    }, 2000);
                } else if (res.data.status === 'FAILED') {
                    setUssdModalState(prev => ({ ...prev, status: 'FAILED', errorMsg: res.data.error || 'Transaction échouée.' }));
                    clearInterval(interval);
                }
            } catch (err) {
                console.error(err);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [ussdModalState.isOpen, ussdModalState.reference, ussdModalState.status]);

    // Dynamic Categories (Max 5 categories)
    const storeCategories = (products && products.length > 0)
        ? Array.from(new Set(products.map(p => p.category_name || p.category?.name || p.category).filter(Boolean))).slice(0, 8).map((catName) => {
            const catSlug = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
            const sampleProd = products.find(p => (p.category_name || p.category?.name || p.category) === catName);
            return { id: catSlug, rawName: catName, label: catName, img: productImage(sampleProd) };
        })
        : [];

    // Filters
    const filteredProducts = products ? products.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = q === '' || 
            p.title.toLowerCase().includes(q) || 
            (p.description && p.description.toLowerCase().includes(q));
        
        const catName = (p.category_name || p.category?.name || p.category || '').toLowerCase();
        const pTitle = p.title.toLowerCase();
        let matchesCategory = true;

        if (selectedCategory !== 'all') {
            const catObj = storeCategories.find(c => c.id === selectedCategory);
            if (catObj && catObj.rawName) {
                matchesCategory = catName.includes(catObj.rawName.toLowerCase());
            } else {
                matchesCategory = catName.includes(selectedCategory) || pTitle.includes(selectedCategory);
            }
        }

        if (activeSectionTab === 'promo') return matchesSearch && matchesCategory && (p.is_promo && p.promo_price);
        return matchesSearch && matchesCategory;
    }) : [];

    const promoProducts = products ? products.filter(p => p.is_promo && p.promo_price) : [];
    const reviewsList = store?.reviews || [];

    const storeSections = (store?.sections_json && Array.isArray(store.sections_json) && store.sections_json.length > 0)
        ? store.sections_json
        : [
            { id: 'banner', enabled: true },
            { id: 'hero', enabled: true },
            { id: 'categories', enabled: true },
            { id: 'products', enabled: true },
            { id: 'best-sellers', enabled: true },
            { id: 'promotions', enabled: true },
            { id: 'smartlinks', enabled: true },
            { id: 'benefits', enabled: true },
            { id: 'reviews', enabled: true },
            { id: 'about', enabled: true },
        ];

    const isSectionActive = (id) => {
        const sec = storeSections.find(s => s.id === id || (id === 'best-sellers' && s.id === 'bestsellers') || (id === 'promotions' && s.id === 'promo'));
        if (!sec) return true; // Default to active if not present in custom sections_json
        const val = sec.enabled;
        if (val === false || val === 'false' || val === 0 || val === '0') return false;
        return true;
    };

    const activeBenefitsList = (store?.benefits_json && Array.isArray(store.benefits_json) && store.benefits_json.length > 0)
        ? store.benefits_json
        : [
            { title: 'Livraison Rapide', subtitle: 'Expédition sous 24h-48h à domicile' },
            { title: '100% Mobile Money', subtitle: 'Validation USSD MTN & Orange Direct' },
            { title: 'Facture & Reçu Digital', subtitle: 'Envoi instantané WhatsApp & Email' },
            { title: 'Vendeur Certifié', subtitle: 'Boutique officielle vérifiée BIOLINKO' },
        ];

    const benefitsIcons = [Truck, ShieldCheck, FileText, BadgeCheck];

    const scrollToCatalog = () => {
        const el = document.getElementById('catalog-grid');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    // Fin de la promotion la plus proche (promo_end_at), pour un vrai compte à rebours
    const nextPromoEnd = promoProducts
        .map((p) => (p.promo_end_at ? new Date(p.promo_end_at).getTime() : null))
        .filter((t) => t && t > Date.now())
        .sort((a, b) => a - b)[0] || null;

    const fieldClass = 'w-full h-12 rounded-md border border-brand-line bg-white px-3.5 text-[15px] text-brand-ink placeholder:text-brand-muted/70 focus:border-brand-ink/40 focus:ring-0';
    const labelClass = 'mb-1.5 block text-sm font-medium text-brand-ink';

    const cardProps = {
        storeSlug: store.slug,
        primaryColor,
        primaryTextColor,
        onAdd: (p) => handleAddToCart(p),
        onWishlist: toggleWishlist,
    };

    const pageMotion = {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -12 },
        transition: { duration: 0.4, ease: EASE_OUT },
    };

    return (
        <StorefrontLayout
            store={store}
            activeTab={activeSectionTab}
            setActiveTab={setActiveSectionTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isOwner={isOwner}
            hasPromos={promoProducts && promoProducts.length > 0}
            hasSmartLinks={activeSmartLinks && activeSmartLinks.length > 0}
            cartCount={totalCartCount}
        >
            <Head title={`${activeSectionTab === 'cart' ? 'Mon panier' : store.name}, boutique en ligne`} />

            {isPreview && (
                <motion.div {...pageMotion} className="flex flex-col items-start justify-between gap-3 rounded-lg border border-brand-line bg-brand-yellowLight p-4 text-sm sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <Eye className="h-5 w-5 shrink-0 text-brand-ink" />
                        <span className="text-brand-ink">Aperçu privé : seul vous voyez cette boutique tant qu'elle n'est pas publiée.</span>
                    </div>
                    <a href="/dashboard" className="shrink-0 rounded-md bg-brand-yellow px-4 py-2 font-semibold text-brand-ink hover:bg-brand-yellowHover">Publier depuis le tableau de bord</a>
                </motion.div>
            )}

            <div className="w-full space-y-12">
                <AnimatePresence mode="wait">
                    {activeSectionTab === 'cart' ? (
                        /* ---------------- PANIER & PAIEMENT ---------------- */
                        <motion.div key="cart-full-page" {...pageMotion} className="space-y-8">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <button type="button" onClick={() => setActiveSectionTab('all')} className="mb-2 inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-ink">
                                        <ArrowLeft className="h-4 w-4" /> Continuer mes achats
                                    </button>
                                    <h1 className="text-3xl font-bold tracking-tight text-brand-ink">Mon panier</h1>
                                </div>
                                {cartItems.length > 0 && (
                                    <button type="button" onClick={handleClearCart} className="inline-flex items-center gap-1.5 text-sm text-[#B91C1C] hover:underline">
                                        <Trash2 className="h-4 w-4" /> Vider le panier
                                    </button>
                                )}
                            </div>

                            {cartItems.length > 0 ? (
                                <form onSubmit={handleCheckoutSubmitFromCartPage} className="grid items-start gap-8 lg:grid-cols-12">
                                    <div className="space-y-6 lg:col-span-7">
                                        {isAutoFilled && (
                                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-md bg-brand-yellowLight px-4 py-3 text-sm text-brand-ink">
                                                <span>Content de vous revoir ! Vos coordonnées sont pré-remplies.</span>
                                                <button type="button" onClick={handleResetCustomerForm} className="ml-3 shrink-0 underline">Modifier</button>
                                            </motion.div>
                                        )}

                                        {[
                                            {
                                                n: 1, title: 'Vos coordonnées', sub: 'Pour le suivi et la facture',
                                                body: (
                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div>
                                                            <label className={labelClass} htmlFor="c-name">Nom complet</label>
                                                            <input id="c-name" type="text" required placeholder="Ex. Awa Mbarga" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} className={fieldClass} />
                                                        </div>
                                                        <div>
                                                            <label className={labelClass} htmlFor="c-phone">Numéro Mobile Money</label>
                                                            <div className="flex gap-2">
                                                                <span className="flex h-12 items-center rounded-md border border-brand-line bg-brand-sand px-3 text-[15px] text-brand-muted">+237</span>
                                                                <input id="c-phone" type="tel" required placeholder="699 12 34 56" value={data.customer_phone} onChange={(e) => handlePhoneChange(e.target.value)} className={fieldClass} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className={labelClass} htmlFor="c-email">E-mail <span className="font-normal text-brand-muted">(facultatif)</span></label>
                                                            <input id="c-email" type="email" placeholder="vous@exemple.com" value={data.customer_email} onChange={(e) => setData('customer_email', e.target.value)} className={fieldClass} />
                                                        </div>
                                                        <div>
                                                            <label className={labelClass} htmlFor="c-wa">WhatsApp <span className="font-normal text-brand-muted">(facultatif)</span></label>
                                                            <input id="c-wa" type="tel" placeholder="+237 699 00 00 00" value={data.customer_whatsapp} onChange={(e) => setData('customer_whatsapp', e.target.value)} className={fieldClass} />
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                n: 2, title: 'Livraison', sub: 'Où souhaitez-vous recevoir votre commande ?',
                                                body: (
                                                    <div className="space-y-4">
                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                            {[
                                                                ['delivery', Truck, 'Livraison à domicile', '24 à 48 h'],
                                                                ['store', Store, 'Retrait en boutique', 'Gratuit au point de vente'],
                                                            ].map(([method, Icon, title, sub]) => {
                                                                const on = method === 'store' ? data.delivery_method === 'store' : data.delivery_method !== 'store';
                                                                return (
                                                                    <motion.button key={method} type="button" whileTap={{ scale: 0.98 }} onClick={() => setData('delivery_method', method)}
                                                                        className={`flex items-center gap-3 rounded-md border p-4 text-left transition-colors ${on ? 'border-brand-ink/60 bg-brand-cream' : 'border-brand-line hover:border-brand-ink/25'}`}>
                                                                        <Icon className="h-5 w-5 text-brand-ink" />
                                                                        <span><span className="block text-[15px] font-medium text-brand-ink">{title}</span><span className="text-sm text-brand-muted">{sub}</span></span>
                                                                    </motion.button>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                            <div>
                                                                <label className={labelClass} htmlFor="c-city">Ville</label>
                                                                <select id="c-city" value={data.delivery_city} onChange={(e) => setData('delivery_city', e.target.value)} className={fieldClass}>
                                                                    {['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda'].map((c) => <option key={c} value={c}>{c}</option>)}
                                                                    <option value="Autre">Autre ville</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className={labelClass} htmlFor="c-addr">Quartier et point de repère</label>
                                                                <input id="c-addr" type="text" required placeholder="Ex. Bonamoussadi, près de la pharmacie" value={data.delivery_address} onChange={(e) => setData('delivery_address', e.target.value)} className={fieldClass} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            },
                                            {
                                                n: 3, title: 'Paiement', sub: 'Vous confirmez sur votre téléphone',
                                                body: (
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        {[
                                                            ['MTN', 'MTN MoMo', '#FFCC00', '#2B2620'],
                                                            ['ORANGE', 'Orange Money', '#FF7900', '#FFFFFF'],
                                                        ].map(([op, label, bg, fg]) => {
                                                            const on = data.operator === op;
                                                            return (
                                                                <motion.button key={op} type="button" whileTap={{ scale: 0.98 }} onClick={() => setData('operator', op)} aria-pressed={on}
                                                                    className={`relative flex items-center gap-3 rounded-md border p-4 text-left transition-colors ${on ? 'border-brand-ink/60 bg-brand-cream' : 'border-brand-line hover:border-brand-ink/25'}`}>
                                                                    <span className="flex h-10 w-10 items-center justify-center rounded-md text-xs font-semibold" style={{ backgroundColor: bg, color: fg }}>{op === 'MTN' ? 'MTN' : 'OM'}</span>
                                                                    <span className="text-[15px] font-medium text-brand-ink">{label}</span>
                                                                    {on && <motion.span layoutId="op-check" className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-brand-ink"><Check className="h-3.5 w-3.5 text-white" /></motion.span>}
                                                                </motion.button>
                                                            );
                                                        })}
                                                    </div>
                                                ),
                                            },
                                        ].map((step, i) => (
                                            <motion.section key={step.n} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.08 * i }}
                                                className="space-y-5 rounded-lg border border-brand-line bg-white p-5 sm:p-7">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>{step.n}</span>
                                                    <div>
                                                        <h2 className="text-lg font-semibold text-brand-ink">{step.title}</h2>
                                                        <p className="text-sm text-brand-muted">{step.sub}</p>
                                                    </div>
                                                </div>
                                                {step.body}
                                            </motion.section>
                                        ))}
                                    </div>

                                    <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.15 }} className="lg:sticky lg:top-28 lg:col-span-5">
                                        <div className="space-y-5 rounded-lg border border-brand-line bg-brand-cream p-5 sm:p-7">
                                            <h2 className="flex items-center justify-between text-lg font-semibold text-brand-ink">
                                                Récapitulatif <span className="text-sm font-normal text-brand-muted">{totalCartCount} article{totalCartCount > 1 ? 's' : ''}</span>
                                            </h2>
                                            <ul className="max-h-80 space-y-3 overflow-y-auto pr-1">
                                                <AnimatePresence initial={false}>
                                                    {cartItems.map((item, idx) => (
                                                        <motion.li key={`${item.product_id}-${item.variant_id}`} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12, height: 0 }} className="flex items-center gap-3">
                                                            <ProductImage src={item.image_url} alt={item.title} className="h-16 w-14 shrink-0 rounded-md" />
                                                            <div className="min-w-0 flex-1">
                                                                <div className="truncate text-[15px] font-medium text-brand-ink">{item.title}</div>
                                                                {item.variant_label && <div className="truncate text-sm text-brand-muted">{item.variant_label}</div>}
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <div className="flex items-center rounded-md border border-brand-line bg-white">
                                                                        <button type="button" aria-label="Retirer un" onClick={() => handleUpdateCartQuantity(idx, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center text-brand-ink"><Minus className="h-3.5 w-3.5" /></button>
                                                                        <motion.span key={item.quantity} initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="w-6 text-center text-sm font-medium text-brand-ink">{item.quantity}</motion.span>
                                                                        <button type="button" aria-label="Ajouter un" onClick={() => handleUpdateCartQuantity(idx, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center text-brand-ink"><Plus className="h-3.5 w-3.5" /></button>
                                                                    </div>
                                                                    <button type="button" aria-label="Supprimer l'article" onClick={() => handleRemoveFromCart(idx)} className="flex h-8 w-8 items-center justify-center text-brand-muted hover:text-[#B91C1C]"><Trash2 className="h-4 w-4" /></button>
                                                                </div>
                                                            </div>
                                                            <span className="shrink-0 text-[15px] font-medium text-brand-ink">{(item.price_display * item.quantity).toLocaleString('fr-FR')} F</span>
                                                        </motion.li>
                                                    ))}
                                                </AnimatePresence>
                                            </ul>

                                            <div className="space-y-2 border-t border-brand-line pt-4 text-[15px]">
                                                <div className="flex justify-between text-brand-muted"><span>Sous-total</span><span>{Number(cartSubtotalPb).toLocaleString('fr-FR')} FCFA</span></div>
                                                <div className="flex justify-between text-brand-muted"><span>Frais de service (3 %)</span><span>{Number(cartServiceFee).toLocaleString('fr-FR')} FCFA</span></div>
                                                <div className="flex items-baseline justify-between pt-2 text-brand-ink">
                                                    <span className="font-semibold">Total</span>
                                                    <motion.span key={cartTotalClientTc} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold">{Number(cartTotalClientTc).toLocaleString('fr-FR')} FCFA</motion.span>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ y: (isSubmittingCheckout || processing) ? 0 : -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={isSubmittingCheckout || processing}
                                                className="flex h-14 w-full items-center justify-center gap-2 rounded-md text-base font-semibold shadow-[0_12px_24px_-14px_rgba(43,38,32,0.5)] disabled:opacity-70"
                                                style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                                            >
                                                {(isSubmittingCheckout || processing) ? (
                                                    <><RefreshCw className="h-4 w-4 animate-spin" /> Envoi de la demande de paiement...</>
                                                ) : (
                                                    <><Lock className="h-4 w-4" /> Payer {Number(cartTotalClientTc).toLocaleString('fr-FR')} FCFA</>
                                                )}
                                            </motion.button>
                                            <p className="text-center text-sm text-brand-muted">
                                                Une demande {data.operator === 'ORANGE' ? 'Orange Money' : 'MTN MoMo'} arrive sur votre téléphone. Tapez votre code secret pour confirmer.
                                            </p>
                                        </div>
                                    </motion.aside>
                                </form>
                            ) : (
                                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-md space-y-4 rounded-lg border border-brand-line bg-brand-cream p-12 text-center">
                                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                                        <ShoppingBag className="mx-auto h-10 w-10 text-brand-muted" />
                                    </motion.div>
                                    <h2 className="text-xl font-semibold text-brand-ink">Votre panier est vide</h2>
                                    <p className="text-brand-muted">Parcourez le catalogue de {store.name} et ajoutez vos articles.</p>
                                    <button type="button" onClick={() => setActiveSectionTab('all')} className="inline-flex h-11 items-center gap-2 rounded-md px-5 font-semibold" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                        Voir les produits <ArrowRight className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : viewMode === 'catalog' || viewMode === 'bestsellers' ? (
                        /* ---------------- CATALOGUE COMPLET ---------------- */
                        <motion.div key={`store-${viewMode}`} {...pageMotion} className="space-y-8">
                            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-brand-line pb-6">
                                <div>
                                    <button type="button" onClick={() => { setViewMode('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mb-2 inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-ink">
                                        <ArrowLeft className="h-4 w-4" /> Retour à la boutique
                                    </button>
                                    <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
                                        {viewMode === 'catalog' ? `Tous les produits (${products?.length || 0})` : 'Meilleures ventes'}
                                    </h1>
                                </div>
                                <label className="relative w-full sm:w-72">
                                    <span className="sr-only">Rechercher un produit</span>
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                                    <input type="search" placeholder="Rechercher un produit..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`${fieldClass} pl-9`} />
                                </label>
                            </div>
                            {filteredProducts.length > 0 ? (
                                <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                                    <AnimatePresence>
                                        {filteredProducts.map((product) => (
                                            <ProductCard key={product.id} product={product} isWished={wishlist.includes(product.id)} {...cardProps} />
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <div className="rounded-lg border border-dashed border-brand-line p-12 text-center text-brand-muted">Aucun produit ne correspond à votre recherche.</div>
                            )}
                        </motion.div>
                    ) : (
                        /* ---------------- ACCUEIL DE LA BOUTIQUE ---------------- */
                        <motion.div key="store-home" {...pageMotion} className="space-y-20">
                            {storeSections.map((sec) => {
                                if (!sec || [false, 'false', 0, '0'].includes(sec.enabled)) return null;
                                const sectionId = sec.id;

                                if (sectionId === 'hero') {
                                    return (
                                        <section key="hero" id="hero" className="relative overflow-hidden rounded-xl" style={{ backgroundColor: `${primaryColor}22` }}>
                                            <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-12 lg:p-14">
                                                <div className="space-y-6 lg:col-span-6">
                                                    <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-block rounded-md bg-white px-3 py-1 text-sm font-medium text-brand-ink">
                                                        {store.hero_badge_text || store.category || 'Boutique officielle'}
                                                    </motion.span>
                                                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.08 }} className="break-words text-4xl font-bold leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
                                                        {store.hero_title || `Bienvenue chez ${store.name}`}
                                                    </motion.h1>
                                                    <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.16 }} className="max-w-lg text-lg leading-relaxed text-brand-ink/75">
                                                        {store.hero_subtitle || store.description || 'Commandez en ligne, payez par Mobile Money, recevez chez vous.'}
                                                    </motion.p>
                                                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.24 }} className="flex flex-wrap gap-3">
                                                        <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={scrollToCatalog} className="inline-flex h-12 items-center gap-2 rounded-md px-6 text-[15px] font-semibold" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                                            Commander <ArrowRight className="h-4 w-4" />
                                                        </motion.button>
                                                        {promoProducts.length > 0 && (
                                                            <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={() => document.getElementById('promotions')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex h-12 items-center rounded-md border border-brand-ink/15 bg-white px-5 text-[15px] font-semibold text-brand-ink">
                                                                Voir les promotions
                                                            </motion.button>
                                                        )}
                                                    </motion.div>
                                                    <Stagger className="flex flex-wrap gap-x-5 gap-y-2 pt-2 text-sm text-brand-ink/75">
                                                        {[[Truck, 'Livraison 24 à 48 h'], [Smartphone, 'Paiement MTN et Orange Money'], [MessageSquare, 'Suivi sur WhatsApp']].map(([Icon, t]) => (
                                                            <StaggerItem key={t} y={8} className="flex items-center gap-2"><Icon className="h-4 w-4" /> {t}</StaggerItem>
                                                        ))}
                                                    </Stagger>
                                                </div>

                                                <div className="relative lg:col-span-6">
                                                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-white sm:aspect-[5/5] lg:aspect-[4/5]">
                                                        <AnimatePresence mode="sync">
                                                            <motion.div key={activeHeroProduct?.id || 'banner'} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
                                                                <motion.div className="h-full w-full" initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 4.5, ease: 'linear' }}>
                                                                    <ProductImage src={activeHeroProduct ? productImage(activeHeroProduct) : (store.banner_url || store.logo_url)} alt={activeHeroProduct?.title || store.name} className="h-full w-full" />
                                                                </motion.div>
                                                            </motion.div>
                                                        </AnimatePresence>

                                                        {activeHeroProduct && (
                                                            <AnimatePresence mode="wait">
                                                                <motion.a key={activeHeroProduct.id} href={`/${store.slug}/p/${activeHeroProduct.slug}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.4, delay: 0.2 }}
                                                                    className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-md bg-white/95 p-3 backdrop-blur-sm">
                                                                    <span className="min-w-0">
                                                                        <span className="block truncate text-[15px] font-medium text-brand-ink">{activeHeroProduct.title}</span>
                                                                        <span className="text-sm text-brand-muted">{Math.ceil(activeHeroPromoPct ? activeHeroProduct.promo_price : activeHeroProduct.price_vendor).toLocaleString('fr-FR')} FCFA</span>
                                                                    </span>
                                                                    {activeHeroPromoPct && <span className="shrink-0 rounded bg-[#DC2626] px-2 py-0.5 text-xs font-semibold text-white">-{activeHeroPromoPct} %</span>}
                                                                </motion.a>
                                                            </AnimatePresence>
                                                        )}
                                                    </div>

                                                    {heroProductsList.length > 1 && (
                                                        <div className="mt-3 flex gap-1.5">
                                                            {heroProductsList.slice(0, 6).map((p, idx) => (
                                                                <button key={p.id} type="button" onClick={() => setCurrentHeroSlide(idx)} aria-label={`Voir ${p.title}`} className="relative h-1 flex-1 overflow-hidden rounded-full bg-brand-ink/15">
                                                                    {currentHeroSlide === idx && (
                                                                        <motion.span key={`bar-${currentHeroSlide}`} className="absolute inset-y-0 left-0 bg-brand-ink" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 4, ease: 'linear' }} />
                                                                    )}
                                                                    {currentHeroSlide > idx && <span className="absolute inset-0 bg-brand-ink/50" />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </section>
                                    );
                                }

                                if (sectionId === 'categories') {
                                    if (!storeCategories.length) return null;
                                    return (
                                        <section key="categories" id="categories" className="space-y-5">
                                            <SectionHeading title="Catégories" />
                                            <Stagger className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none]">
                                                {[{ id: 'all', label: 'Tout', img: productImage(products?.[0]) }, ...storeCategories].map((cat) => {
                                                    const on = selectedCategory === cat.id;
                                                    return (
                                                        <StaggerItem key={cat.id} y={12}>
                                                            <motion.button type="button" whileHover={{ y: -4 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedCategory(cat.id); scrollToCatalog(); }} className="flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24">
                                                                <span className="block rounded-full p-[3px] transition-colors" style={{ backgroundColor: on ? primaryColor : '#EDE5CF' }}>
                                                                    <ProductImage src={cat.img} alt="" className="h-[68px] w-[68px] rounded-full border-[3px] border-white sm:h-20 sm:w-20" />
                                                                </span>
                                                                <span className={`truncate text-sm ${on ? 'font-semibold text-brand-ink' : 'text-brand-muted'}`}>{cat.label}</span>
                                                            </motion.button>
                                                        </StaggerItem>
                                                    );
                                                })}
                                            </Stagger>
                                        </section>
                                    );
                                }

                                if (sectionId === 'products') {
                                    return (
                                        <section key="products" id="catalog-grid" className="scroll-mt-28 space-y-6">
                                            <SectionHeading
                                                title={selectedCategory === 'all' ? 'Nos produits' : (storeCategories.find((c) => c.id === selectedCategory)?.label || 'Nos produits')}
                                                action={
                                                    <button type="button" onClick={() => { setViewMode('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-1.5 text-[15px] font-medium text-brand-ink hover:underline">
                                                        Tout voir ({products?.length || 0}) <ArrowRight className="h-4 w-4" />
                                                    </button>
                                                }
                                            />
                                            {filteredProducts.length > 0 ? (
                                                <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                                                    <AnimatePresence>
                                                        {filteredProducts.slice(0, 12).map((product) => (
                                                            <ProductCard key={product.id} product={product} isWished={wishlist.includes(product.id)} {...cardProps} />
                                                        ))}
                                                    </AnimatePresence>
                                                </motion.div>
                                            ) : (
                                                <div className="rounded-lg border border-dashed border-brand-line p-12 text-center text-brand-muted">
                                                    <Package className="mx-auto mb-2 h-8 w-8" />
                                                    Aucun produit trouvé. Essayez une autre recherche ou catégorie.
                                                </div>
                                            )}
                                        </section>
                                    );
                                }

                                if (sectionId === 'best-sellers' || sectionId === 'bestsellers') {
                                    if (!products || products.length < 2) return null;
                                    return (
                                        <section key="bestsellers" id="best-sellers" className="scroll-mt-28 space-y-6">
                                            <SectionHeading title="Meilleures ventes" sub="Les articles que les clients choisissent le plus" />
                                            <Stagger className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0">
                                                {products.slice(0, 4).map((product) => (
                                                    <StaggerItem key={`bs-${product.id}`} className="w-[62%] shrink-0 snap-start sm:w-auto">
                                                        <ProductCard product={product} isWished={wishlist.includes(product.id)} {...cardProps} />
                                                    </StaggerItem>
                                                ))}
                                            </Stagger>
                                        </section>
                                    );
                                }

                                if (sectionId === 'promotions' || sectionId === 'promo') {
                                    if (!promoProducts.length) return null;
                                    return (
                                        <section key="promotions" id="promotions" className="scroll-mt-28 -mx-4 space-y-6 bg-brand-cream px-4 py-10 sm:mx-0 sm:rounded-xl sm:px-10">
                                            <SectionHeading
                                                title="Promotions"
                                                sub="Prix réduits, quantités limitées"
                                                action={nextPromoEnd ? <PromoCountdown endsAt={nextPromoEnd} /> : null}
                                            />
                                            <Stagger className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                                                {promoProducts.map((product) => (
                                                    <StaggerItem key={`promo-${product.id}`}>
                                                        <ProductCard product={product} isWished={wishlist.includes(product.id)} {...cardProps} />
                                                    </StaggerItem>
                                                ))}
                                            </Stagger>
                                        </section>
                                    );
                                }

                                if (sectionId === 'smartlinks') {
                                    if (!activeSmartLinks || !activeSmartLinks.length) return null;
                                    return (
                                        <section key="smartlinks" id="smartlinks" className="scroll-mt-28 space-y-6">
                                            <SectionHeading title="Packs" sub="Plusieurs produits, une seule commande" />
                                            <Stagger className="grid gap-5 md:grid-cols-2">
                                                {activeSmartLinks.map((sl) => (
                                                    <StaggerItem key={sl.id}>
                                                        <motion.div whileHover={{ y: -4 }} className="flex h-full flex-col gap-4 rounded-lg border border-brand-line bg-white p-5">
                                                            <div className="flex items-center justify-between text-sm text-brand-muted">
                                                                <span className="rounded bg-brand-yellowLight px-2 py-0.5 text-brand-ink">Pack</span>#{sl.code}
                                                            </div>
                                                            <h4 className="text-lg font-semibold text-brand-ink">{sl.title}</h4>
                                                            {sl.items?.length > 0 && (
                                                                <div className="flex -space-x-2">
                                                                    {sl.items.slice(0, 5).map((item, idx) => (
                                                                        <ProductImage key={idx} src={item.image_url} alt={item.product_name} className="h-12 w-12 rounded-full border-2 border-white" />
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="mt-auto flex items-center justify-between gap-3 border-t border-brand-line pt-4">
                                                                <span className="text-lg font-semibold text-brand-ink">{Math.ceil(sl.total_amount || sl.price_total || 0).toLocaleString('fr-FR')} FCFA</span>
                                                                <a href={`/smartlink/${sl.code}`} className="inline-flex h-10 items-center gap-1.5 rounded-md px-4 text-sm font-semibold" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                                                    Acheter le pack <ArrowRight className="h-4 w-4" />
                                                                </a>
                                                            </div>
                                                        </motion.div>
                                                    </StaggerItem>
                                                ))}
                                            </Stagger>
                                        </section>
                                    );
                                }

                                if (sectionId === 'benefits') {
                                    return (
                                        <section key="benefits" id="benefits">
                                            <Stagger className="grid grid-cols-1 gap-6 border-y border-brand-line py-8 sm:grid-cols-2 lg:grid-cols-4">
                                                {activeBenefitsList.map((item, idx) => {
                                                    const Icon = benefitsIcons[idx % benefitsIcons.length] || ShieldCheck;
                                                    return (
                                                        <StaggerItem key={idx} className="flex items-start gap-3">
                                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${primaryColor}33` }}>
                                                                <Icon className="h-5 w-5 text-brand-ink" />
                                                            </span>
                                                            <div>
                                                                <div className="font-medium text-brand-ink">{item.title}</div>
                                                                <div className="text-sm text-brand-muted">{item.subtitle}</div>
                                                            </div>
                                                        </StaggerItem>
                                                    );
                                                })}
                                            </Stagger>
                                        </section>
                                    );
                                }

                                if (sectionId === 'reviews') {
                                    const reviewCard = (rev, i) => (
                                        <figure key={rev.id || i} className="flex w-[300px] shrink-0 flex-col gap-3 rounded-lg border border-brand-line bg-white p-5 sm:w-auto">
                                            <div className="flex items-center gap-0.5">
                                                {Array.from({ length: 5 }).map((_, s) => (
                                                    <Star key={s} className={`h-4 w-4 ${s < (rev.rating || 5) ? 'fill-[#F5B800] text-[#F5B800]' : 'text-brand-line'}`} />
                                                ))}
                                            </div>
                                            <blockquote className="break-words leading-relaxed text-brand-ink">{rev.comment}</blockquote>
                                            <figcaption className="mt-auto flex justify-between text-sm text-brand-muted">
                                                <span className="font-medium text-brand-ink">{rev.customer_name || rev.name}</span>
                                                <span>{rev.customer_city || rev.city || ''}</span>
                                            </figcaption>
                                        </figure>
                                    );
                                    return (
                                        <section key="reviews" id="reviews" className="scroll-mt-28 space-y-6">
                                            <SectionHeading
                                                title="Avis clients"
                                                action={
                                                    <button type="button" onClick={() => setIsReviewModalOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-md border border-brand-ink/15 px-4 text-sm font-medium text-brand-ink hover:border-brand-ink/35">
                                                        <Star className="h-4 w-4" /> Donner mon avis
                                                    </button>
                                                }
                                            />
                                            {reviewsList.length > 3 ? (
                                                <Marquee speed={50}>{reviewsList.map(reviewCard)}</Marquee>
                                            ) : reviewsList.length > 0 ? (
                                                <Stagger className="grid gap-5 md:grid-cols-3">
                                                    {reviewsList.map((rev, i) => <StaggerItem key={rev.id || i}>{reviewCard(rev, i)}</StaggerItem>)}
                                                </Stagger>
                                            ) : (
                                                <div className="rounded-lg border border-dashed border-brand-line p-10 text-center">
                                                    <p className="text-brand-muted">Aucun avis pour le moment. Soyez le premier à donner le vôtre.</p>
                                                </div>
                                            )}
                                        </section>
                                    );
                                }

                                if (sectionId === 'about') {
                                    return (
                                        <Reveal key="about" as="section" id="about" className="grid gap-6 rounded-xl bg-brand-sand p-6 sm:p-10 md:grid-cols-[1.4fr_1fr]">
                                            <div className="space-y-3">
                                                <h3 className="text-2xl font-bold tracking-tight text-brand-ink">À propos de {store.name}</h3>
                                                <p className="leading-relaxed text-brand-muted">
                                                    {store.description || store.about_text || `Bienvenue sur la boutique de ${store.name}. Nous sélectionnons nos articles avec soin et les livrons rapidement.`}
                                                </p>
                                            </div>
                                            <div className="space-y-3 text-[15px]">
                                                {store.phone_whatsapp && (
                                                    <a href={`https://wa.me/${store.phone_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-ink hover:underline">
                                                        <MessageSquare className="h-4 w-4 text-green-700" /> {store.phone_whatsapp}
                                                    </a>
                                                )}
                                                {(store.city_location || store.city) && <div className="flex items-center gap-2 text-brand-ink"><MapPin className="h-4 w-4" /> {store.city_location || store.city}</div>}
                                            </div>
                                        </Reveal>
                                    );
                                }

                                return null;
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* PAIEMENT USSD & AVIS */}
                <AnimatePresence>
                    {ussdModalState.isOpen && (
                        <motion.div key="ussd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/50 p-4 backdrop-blur-sm">
                            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                                className="w-full max-w-md space-y-6 rounded-lg bg-white p-7 text-center shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="ussd-title">
                                {ussdModalState.status === 'SUCCESS' ? (
                                    <>
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-600">
                                            <Check className="h-10 w-10 text-white" />
                                        </motion.div>
                                        <div className="space-y-1">
                                            <h3 id="ussd-title" className="text-xl font-semibold text-brand-ink">Paiement confirmé</h3>
                                            <p className="text-brand-muted">Redirection vers votre commande...</p>
                                        </div>
                                    </>
                                ) : ussdModalState.status === 'FAILED' ? (
                                    <>
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100"><AlertCircle className="h-8 w-8 text-[#B91C1C]" /></div>
                                        <div className="space-y-1">
                                            <h3 id="ussd-title" className="text-xl font-semibold text-brand-ink">Le paiement n'a pas abouti</h3>
                                            <p className="text-brand-muted">{ussdModalState.errorMsg || 'Vérifiez votre solde puis réessayez.'}</p>
                                        </div>
                                        <button type="button" onClick={() => setUssdModalState((s) => ({ ...s, isOpen: false }))} className="h-11 w-full rounded-md border border-brand-ink/15 font-semibold text-brand-ink">Réessayer</button>
                                    </>
                                ) : (
                                    <>
                                        <div className="relative mx-auto h-24 w-24">
                                            <motion.span className="absolute inset-0 rounded-full" style={{ backgroundColor: primaryColor }} animate={{ scale: [1, 1.35], opacity: [0.5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
                                            <span className="relative flex h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor }}>
                                                <Smartphone className="h-10 w-10" style={{ color: primaryTextColor }} />
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 id="ussd-title" className="text-xl font-semibold text-brand-ink">Confirmez sur votre téléphone</h3>
                                            <p className="text-brand-muted">
                                                Une demande de <strong className="font-semibold text-brand-ink">{Number(ussdModalState.amount).toLocaleString('fr-FR')} FCFA</strong> a été envoyée au {ussdModalState.phone} ({ussdModalState.operator === 'ORANGE' ? 'Orange Money' : 'MTN MoMo'}). Tapez votre code secret pour valider.
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-sm text-brand-muted">
                                            <RefreshCw className="h-4 w-4 animate-spin" /> En attente de confirmation
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    {isReviewModalOpen && (
                        <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
                            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="w-full max-w-lg overflow-hidden rounded-t-lg bg-white sm:rounded-lg" role="dialog" aria-modal="true" aria-labelledby="review-title">
                                <div className="flex items-center justify-between border-b border-brand-line px-5 py-4">
                                    <h3 id="review-title" className="font-semibold text-brand-ink">Votre avis sur {store.name}</h3>
                                    <button type="button" onClick={() => setIsReviewModalOpen(false)} aria-label="Fermer" className="flex h-10 w-10 items-center justify-center rounded-md text-brand-muted hover:bg-brand-sand"><X className="h-5 w-5" /></button>
                                </div>
                                <form onSubmit={handleSubmitCustomerReview} className="space-y-4 p-5">
                                    <div>
                                        <span className={labelClass}>Votre note</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <motion.button key={star} type="button" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setReviewRating(star)} aria-label={`${star} étoile${star > 1 ? 's' : ''}`} className="p-1">
                                                    <Star className={`h-7 w-7 ${star <= reviewRating ? 'fill-[#F5B800] text-[#F5B800]' : 'text-brand-line'}`} />
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className={labelClass} htmlFor="r-name">Nom</label>
                                            <input id="r-name" type="text" required value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Ex. Mariam K." className={fieldClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass} htmlFor="r-city">Ville</label>
                                            <input id="r-city" type="text" value={reviewCity} onChange={(e) => setReviewCity(e.target.value)} placeholder="Ex. Douala" className={fieldClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass} htmlFor="r-comment">Votre commentaire</label>
                                        <textarea id="r-comment" rows={4} required value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Qualité, livraison, service..." className={`${fieldClass} h-auto py-3`} />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-1">
                                        <button type="button" onClick={() => setIsReviewModalOpen(false)} className="h-11 rounded-md px-4 font-medium text-brand-muted hover:bg-brand-sand">Annuler</button>
                                        <button type="submit" disabled={isSubmittingReview} className="h-11 rounded-md px-5 font-semibold disabled:opacity-70" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>Publier mon avis</button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {store?.phone_whatsapp && activeSectionTab !== 'cart' && (
                <motion.a
                    href={`https://wa.me/${store.phone_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${store.name}, je vous contacte depuis votre boutique en ligne.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 1 }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    className="fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-[#16A34A] px-4 text-white shadow-[0_14px_30px_-12px_rgba(22,163,74,0.8)]"
                    aria-label="Écrire à la boutique sur WhatsApp"
                >
                    <WhatsappIcon className="h-6 w-6" />
                    <span className="hidden text-sm font-semibold sm:inline">WhatsApp</span>
                </motion.a>
            )}

            {totalCartCount > 0 && activeSectionTab !== 'cart' && (
                <motion.button
                    type="button"
                    initial={{ y: 80 }}
                    animate={{ y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    onClick={() => { setActiveSectionTab('cart'); window.scrollTo({ top: 0 }); }}
                    className="fixed inset-x-4 bottom-4 z-30 flex h-14 items-center justify-between rounded-md px-5 font-semibold shadow-[0_16px_32px_-14px_rgba(43,38,32,0.55)] sm:hidden"
                    style={{ backgroundColor: primaryColor, color: primaryTextColor, right: store?.phone_whatsapp ? '5.5rem' : '1rem' }}
                >
                    <span className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Panier ({totalCartCount})</span>
                    <span>{Number(cartTotalClientTc).toLocaleString('fr-FR')} F</span>
                </motion.button>
            )}
        </StorefrontLayout>
    );
}
