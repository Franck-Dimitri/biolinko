import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { 
    ShoppingBag, ShieldCheck, ArrowRight, X, 
    Share2, Truck, Lock, MessageSquare, Star, Heart, 
    Package, Sparkles, AlertCircle, Clock, MapPin, Tag, Check, Search, 
    Store, ChevronRight, ChevronLeft, ArrowLeft, PhoneCall,
    Award, Shield, BadgeCheck, FileText, CheckCircle2, UserCheck, Play, Flame, Eye, Trash2, Plus, Minus,
    ShoppingCart, Mail, RefreshCw, CreditCard, RotateCcw
} from 'lucide-react';

function getContrastColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) return '#0F172A';
    const hex = hexColor.replace('#', '');
    if (hex.length < 6) return '#0F172A';
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 165 ? '#0F172A' : '#FFFFFF';
}

export default function Boutique({ store, products, activeSmartLinks = [], appUrl }) {
    const authUser = usePage().props.auth?.user;
    const isOwner = authUser && authUser.id === store.user_id;

    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = getContrastColor(primaryColor);

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
            image_url: item.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
            variant_id: null,
            variant_label: `Pack: ${smartLink.title}`,
            min_order_quantity: 1,
            price_vendor: item.unit_price,
            price_display: Math.ceil(item.unit_price * 1.02),
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

        const pbUnit = Math.ceil(currentPv * 1.02);

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
    const cartSubtotalPb = cartItems.reduce((acc, item) => acc + (item.price_display * item.quantity), 0);
    const cartMomoFee = Math.ceil((cartSubtotalPb / 0.98) - cartSubtotalPb);
    const cartTotalClientTc = cartSubtotalPb + cartMomoFee;
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
        ? Array.from(new Set(products.map(p => p.category_name || p.category?.name || p.category).filter(Boolean))).slice(0, 5).map((catName, idx) => {
            const catSlug = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
            const sampleProd = products.find(p => (p.category_name || p.category?.name || p.category) === catName);
            return {
                id: catSlug,
                rawName: catName,
                label: catName,
                desc: 'Acheter',
                img: sampleProd?.image_url || (sampleProd?.images?.[0]) || [
                    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
                    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
                    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400',
                ][idx % 5]
            };
        })
        : [
            { id: 'mode', rawName: 'Fashion', label: 'Fashion', desc: 'Acheter', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400' },
            { id: 'electronique', rawName: 'Electronics', label: 'Electronics', desc: 'Acheter', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
            { id: 'beaute', rawName: 'Beauty', label: 'Beauty', desc: 'Acheter', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
            { id: 'sport', rawName: 'Fitness', label: 'Fitness', desc: 'Acheter', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400' },
            { id: 'maison', rawName: 'Home Decor', label: 'Home Decor', desc: 'Acheter', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400' },
        ];

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
            { id: 'smartlinks', enabled: true },
            { id: 'products', enabled: true },
            { id: 'benefits', enabled: true },
            { id: 'reviews', enabled: true },
            { id: 'about', enabled: true },
        ];

    const isSectionActive = (id) => {
        const sec = storeSections.find(s => s.id === id);
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

    const fadeInUp = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
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
        >
            <Head title={`${activeSectionTab === 'cart' ? 'Mon Panier d\'Achat' : store.name} — Vitrine Officielle`} />

            {/* MAIN CONTENT AREA */}
            <div className="space-y-12 w-full">
                <AnimatePresence mode="wait">
                    
                    {/* STATE 1: FULL PAGE SHOPPING CART VIEW */}
                    {activeSectionTab === 'cart' ? (
                        <motion.div
                            key="cart-full-page"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-8"
                        >
                            {/* Breadcrumbs */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                    <button 
                                        onClick={() => setActiveSectionTab('all')} 
                                        className="hover:text-slate-950 flex items-center gap-1 text-slate-600"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Continuer vos achats
                                    </button>
                                    <span>/</span>
                                    <span className="text-slate-950 font-bold">Mon Panier d'Acheteur ({totalCartCount})</span>
                                </div>

                                {cartItems.length > 0 && (
                                    <button
                                        onClick={handleClearCart}
                                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Vider le panier</span>
                                    </button>
                                )}
                            </div>

                            {cartItems.length > 0 ? (
                                <form onSubmit={handleCheckoutSubmitFromCartPage} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    
                                    {/* LEFT COLUMN: 3-STEP CHECKOUT FORM (IMAGE 1 MOCKUP) */}
                                    <div className="lg:col-span-7 space-y-6">
                                        
                                        {/* RETURNING CUSTOMER WELCOME BACK AUTO-FILL ALERT BANNER */}
                                        {isAutoFilled && (
                                            <div className="p-3.5 rounded-2xl bg-amber-100/90 border border-amber-300 text-xs text-slate-900 font-semibold flex items-center justify-between shadow-2xs">
                                                <span className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                                                    <span>Content de vous revoir ! Coordonnées pré-remplies.</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleResetCustomerForm}
                                                    className="text-[11px] text-slate-600 hover:text-slate-950 underline font-semibold ml-2 shrink-0"
                                                >
                                                    Modifier
                                                </button>
                                            </div>
                                        )}

                                        {/* STEP 1: CONTACT INFORMATION */}
                                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
                                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-950 text-white font-black text-sm flex items-center justify-center shrink-0">
                                                    1
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-950">Informations de Contact</h3>
                                                    <p className="text-xs text-slate-500 font-medium">Saisissez vos coordonnées pour le suivi et la facture</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">Nom &amp; Prénom *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="ex: Jean Dupont"
                                                        value={data.customer_name}
                                                        onChange={(e) => setData('customer_name', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-950 outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">Numéro Mobile Money (MTN / Orange 🇨🇲) *</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 shrink-0">
                                                            🇨🇲 +237
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            required
                                                            placeholder="ex: 699123456"
                                                            value={data.customer_phone}
                                                            onChange={(e) => handlePhoneChange(e.target.value)}
                                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-950 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                                        Email <span className="text-slate-400 font-normal">(Facultatif)</span>
                                                    </label>
                                                    <div className="relative">
                                                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                        <input
                                                            type="email"
                                                            placeholder="ex: client@gmail.com"
                                                            value={data.customer_email}
                                                            onChange={(e) => setData('customer_email', e.target.value)}
                                                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-950 outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                                        WhatsApp <span className="text-slate-400 font-normal">(Facultatif)</span>
                                                    </label>
                                                    <div className="relative">
                                                        <MessageSquare className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                                                        <input
                                                            type="tel"
                                                            placeholder="ex: +237 699000000"
                                                            value={data.customer_whatsapp}
                                                            onChange={(e) => setData('customer_whatsapp', e.target.value)}
                                                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-950 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* STEP 2: DELIVERY METHOD */}
                                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
                                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-950 text-white font-black text-sm flex items-center justify-center shrink-0">
                                                    2
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-950">Mode &amp; Adresse de Livraison</h3>
                                                    <p className="text-xs text-slate-500 font-medium">Sélectionnez le mode d'expédition souhaité</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('delivery_method', 'delivery')}
                                                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                                                        data.delivery_method !== 'store'
                                                            ? 'border-amber-400 bg-amber-50/80 text-amber-950 font-bold ring-2 ring-amber-300'
                                                            : 'border-slate-200 bg-slate-50 text-slate-700 font-medium hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <Truck className={`w-6 h-6 ${data.delivery_method !== 'store' ? 'text-amber-600' : 'text-slate-400'}`} />
                                                    <div>
                                                        <div className="text-xs font-extrabold">Livraison à Domicile</div>
                                                        <div className="text-[10px] opacity-75 mt-0.5">Expédition 24h-48h à Douala &amp; partout</div>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setData('delivery_method', 'store')}
                                                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                                                        data.delivery_method === 'store'
                                                            ? 'border-amber-400 bg-amber-50/80 text-amber-950 font-bold ring-2 ring-amber-300'
                                                            : 'border-slate-200 bg-slate-50 text-slate-700 font-medium hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <Store className={`w-6 h-6 ${data.delivery_method === 'store' ? 'text-amber-600' : 'text-slate-400'}`} />
                                                    <div>
                                                        <div className="text-xs font-extrabold">Retrait en Boutique / Relais</div>
                                                        <div className="text-[10px] opacity-75 mt-0.5">Gratuit au point de vente</div>
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">Ville de Livraison *</label>
                                                    <select
                                                        value={data.delivery_city}
                                                        onChange={(e) => setData('delivery_city', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-950 outline-none bg-white"
                                                    >
                                                        <option value="Douala">Douala</option>
                                                        <option value="Yaoundé">Yaoundé</option>
                                                        <option value="Bafoussam">Bafoussam</option>
                                                        <option value="Garoua">Garoua</option>
                                                        <option value="Bamenda">Bamenda</option>
                                                        <option value="Autre">Autre Ville (Cameroun)</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1">Adresse / Quartier de Livraison *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="ex: Douala, Akwa Rue Silo"
                                                        value={data.delivery_address}
                                                        onChange={(e) => setData('delivery_address', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-950 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* STEP 3: PAYMENT METHOD */}
                                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
                                            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-950 text-white font-black text-sm flex items-center justify-center shrink-0">
                                                    3
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-950">Mode de Paiement Mobile Money</h3>
                                                    <p className="text-xs text-slate-500 font-medium">Validation direct USSD sur votre téléphone</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('operator', 'MTN')}
                                                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                                                        data.operator === 'MTN'
                                                            ? 'border-amber-400 bg-amber-100/90 text-amber-950 font-bold ring-2 ring-amber-400'
                                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                                        MTN
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-extrabold">MTN Mobile Money 🟡</div>
                                                        <div className="text-[10px] text-slate-500 font-medium">Validation USSD direct</div>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setData('operator', 'ORANGE')}
                                                    className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                                                        data.operator === 'ORANGE'
                                                            ? 'border-orange-400 bg-orange-100/90 text-orange-950 font-bold ring-2 ring-orange-400'
                                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                                        OM
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-extrabold">Orange Money 🍊</div>
                                                        <div className="text-[10px] text-slate-500 font-medium">Validation USSD direct</div>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT COLUMN: STICKY ORDER SUMMARY CARD (IMAGE 1 MOCKUP) */}
                                    <div className="lg:col-span-5 space-y-6">
                                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-2xs sticky top-24">
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                                                    <ShoppingCart className="w-5 h-5 text-amber-500" />
                                                    <span>Récapitulatif de Commande</span>
                                                </h3>
                                                <span className="text-xs font-bold text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-100">
                                                    {totalCartCount} art.
                                                </span>
                                            </div>

                                            {/* ITEMS PREVIEW LIST WITH QUANTITY ADJUSTERS */}
                                            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                                {cartItems.map((item, idx) => (
                                                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                                {item.image_url ? (
                                                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <ShoppingBag className="w-6 h-6 text-slate-300" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="text-xs font-bold text-slate-950 truncate">{item.title}</h4>
                                                                {item.variant_label && (
                                                                    <div className="text-[10px] text-slate-500 font-medium truncate">{item.variant_label}</div>
                                                                )}
                                                                <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                                                                    {Number(item.price_display).toLocaleString()} FCFA
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateCartQuantity(idx, item.quantity - 1)}
                                                                    className="w-6 h-6 rounded bg-slate-100 font-bold text-slate-800 text-xs flex items-center justify-center cursor-pointer"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="w-7 text-center font-bold text-slate-950 text-xs">{item.quantity}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleUpdateCartQuantity(idx, item.quantity + 1)}
                                                                    className="w-6 h-6 rounded bg-slate-100 font-bold text-slate-800 text-xs flex items-center justify-center cursor-pointer"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFromCart(idx)}
                                                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* PRICING BREAKDOWN */}
                                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
                                                <div className="flex justify-between text-slate-600 font-medium">
                                                    <span>Sous-total ({totalCartCount} article(s)) :</span>
                                                    <span>{Number(cartSubtotalPb).toLocaleString()} FCFA</span>
                                                </div>
                                                <div className="flex justify-between text-slate-500 font-medium">
                                                    <span>Frais API Mobile Money (2%) :</span>
                                                    <span>+{Number(cartMomoFee).toLocaleString()} FCFA</span>
                                                </div>
                                                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-950">
                                                    <span>Total Général TTC Client :</span>
                                                    <span className="text-slate-950 font-extrabold text-base">{Number(cartTotalClientTc).toLocaleString()} FCFA</span>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: (isSubmittingCheckout || processing) ? 1 : 1.02 }}
                                                whileTap={{ scale: (isSubmittingCheckout || processing) ? 1 : 0.97 }}
                                                type="submit"
                                                disabled={isSubmittingCheckout || processing}
                                                className={`w-full py-4 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                                                    (isSubmittingCheckout || processing) ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''
                                                }`}
                                                style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                            >
                                                {(isSubmittingCheckout || processing) ? (
                                                    <span>Traitement du paiement en cours...</span>
                                                ) : (
                                                    <>
                                                        <ShoppingBag className="w-4 h-4" style={{ color: primaryTextColor }} />
                                                        <span>Valider &amp; Payer par Mobile Money ({Number(cartTotalClientTc).toLocaleString()} FCFA)</span>
                                                    </>
                                                )}
                                            </motion.button>

                                            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-slate-700 font-medium flex items-start gap-2.5">
                                                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                <div className="leading-relaxed">
                                                    <strong className="text-slate-950 font-bold block mb-0.5">Confirmation &amp; USSD Automatique :</strong>
                                                    Après validation, l'invite de saisie de votre code PIN USSD s'affichera directement sur votre téléphone portable.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </form>
                            ) : (
                                <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-4 shadow-2xs max-w-xl mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                        <ShoppingCart className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-950">Votre Panier d'Achat est Vide</h3>
                                    <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                                        Explorez le catalogue de {store.name} et ajoutez des articles pour valider votre commande.
                                    </p>
                                    <button
                                        onClick={() => setActiveSectionTab('all')}
                                        className="px-6 py-3 rounded-xl font-bold text-xs shadow-2xs border inline-flex items-center gap-2"
                                        style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                    >
                                        <span>Explorer les Produits</span>
                                        <ArrowRight className="w-4 h-4" style={{ color: primaryTextColor }} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : viewMode === 'catalog' ? (
                        /* DEDICATED FULL CATALOG VIEW */
                        <motion.div
                            key="store-catalog-page"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-br from-amber-100/60 via-amber-50/40 to-slate-50 p-6 sm:p-8 rounded-[32px] border border-amber-200/80 shadow-2xs">
                                <div className="space-y-1">
                                    <button 
                                        type="button" 
                                        onClick={() => { setViewMode('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="inline-flex items-center gap-1.5 text-xs font-black text-amber-900 hover:text-amber-700 transition-colors mb-1 cursor-pointer"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Retour à la boutique</span>
                                    </button>
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Catalogue des Produits ({products?.length || 0})</h2>
                                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Tous les articles disponibles chez {store.name}</p>
                                </div>

                                <div className="w-full sm:w-auto relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input 
                                        type="text" 
                                        placeholder="Rechercher un produit..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white rounded-full border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-400 focus:outline-hidden shadow-2xs"
                                    />
                                </div>
                            </div>

                            {/* FULL CATALOG GRID */}
                            {filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {filteredProducts.map((product) => {
                                        const directProductUrl = `/${store.slug}/p/${product.slug}`;
                                        const unitPrice = (product.is_promo && product.promo_price > 0) ? Number(product.promo_price) : Number(product.price_vendor);
                                        const displayPrice = Math.ceil(unitPrice * 1.02);

                                        return (
                                            <div key={product.id} className="bg-white rounded-3xl border border-slate-100 shadow-2xs hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group relative p-3">
                                                <a href={directProductUrl} className="block">
                                                    <div className="h-48 bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center p-2 border border-slate-100/80">
                                                        <img 
                                                            src={product.image_url || (product.images?.[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                                                            alt={product.title} 
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
                                                        />
                                                        {product.stock <= 0 ? (
                                                            <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] shadow-xs">
                                                                Stock Épuisé
                                                            </span>
                                                        ) : product.is_promo ? (
                                                            <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px]">
                                                                PROMO
                                                            </span>
                                                        ) : (
                                                            <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px]">
                                                                Nouveau
                                                            </span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            disabled={product.stock <= 0}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (product.stock > 0) handleAddToCart(product);
                                                            }}
                                                            className={`absolute bottom-2 right-2 w-9 h-9 rounded-full shadow-md transition-all flex items-center justify-center border ${
                                                                product.stock <= 0
                                                                    ? 'bg-slate-200 border-slate-300 cursor-not-allowed opacity-60'
                                                                    : 'active:scale-95 cursor-pointer'
                                                            }`}
                                                            style={product.stock > 0 ? { backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor } : {}}
                                                            title={product.stock <= 0 ? "Stock Épuisé" : "Ajouter au panier"}
                                                        >
                                                            <ShoppingCart className="w-4 h-4" style={{ color: product.stock > 0 ? primaryTextColor : '#94A3B8' }} />
                                                        </button>
                                                    </div>

                                                    <div className="pt-3.5 px-1 space-y-1">
                                                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                                            {product.category || store.category || 'Article'}
                                                        </span>
                                                        <h4 className="font-extrabold text-sm text-slate-950 truncate group-hover:text-amber-600 transition-colors">{product.title}</h4>
                                                        <div className="flex items-center gap-1 text-[11px] text-amber-500">
                                                            <span>★★★★★</span>
                                                            <span className="text-slate-400 font-semibold">(128 avis)</span>
                                                        </div>
                                                        <div className="flex items-baseline justify-between gap-1 pt-0.5">
                                                            <span className="text-sm font-black text-slate-950">{displayPrice.toLocaleString()} FCFA</span>
                                                            {product.stock <= 0 ? (
                                                                <span className="text-[11px] text-rose-600 font-extrabold">Stock Épuisé</span>
                                                            ) : product.is_promo ? (
                                                                <span className="text-xs text-slate-400 line-through font-medium">
                                                                    {Math.ceil(product.price_vendor * 1.02).toLocaleString()}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
                                    <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                                    <h3 className="text-base font-bold text-slate-900">Aucun produit ne correspond à votre recherche</h3>
                                </div>
                            )}
                        </motion.div>
                    ) : viewMode === 'bestsellers' ? (
                        /* DEDICATED FULL BESTSELLERS VIEW */
                        <motion.div
                            key="store-bestsellers-page"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-br from-emerald-100/60 via-emerald-50/40 to-slate-50 p-6 sm:p-8 rounded-[32px] border border-emerald-200/80 shadow-2xs">
                                <div className="space-y-1">
                                    <button 
                                        type="button" 
                                        onClick={() => { setViewMode('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-900 hover:text-emerald-700 transition-colors mb-1 cursor-pointer"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>Retour à la boutique</span>
                                    </button>
                                    <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Meilleures Ventes & Tendances 🔥</h2>
                                    <p className="text-xs sm:text-sm text-slate-600 font-medium">Les articles les plus plébiscités et recommandés par nos clients</p>
                                </div>
                            </div>

                            {/* FULL BEST SELLERS GRID */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(products && products.length > 0 ? products : [
                                    { id: 'bs1', title: 'Produit Vedette Premier', price_vendor: 50000, description: 'Qualité exceptionnelle garantie.' },
                                    { id: 'bs2', title: 'Article Tendance Bestseller', price_vendor: 85000, description: 'Le choix préféré de nos clients.' },
                                    { id: 'bs3', title: 'Pack Offre Spéciale', price_vendor: 150000, description: 'Sélection premium garantie.' },
                                ]).map((bs, i) => {
                                    const priceDisplay = Math.ceil(bs.price_vendor * 1.02);

                                    return (
                                        <div key={bs.id || i} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                                            <div>
                                                <div className="h-64 bg-slate-100 rounded-2xl overflow-hidden relative mb-4">
                                                    <img 
                                                        src={bs.image_url || (bs.images?.[0]) || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600'} 
                                                        alt={bs.title} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow-2xs">
                                                        Meilleure Vente #{(i % 5) + 1}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-black text-base text-slate-950 group-hover:text-amber-600 transition-colors">{bs.title}</h4>
                                                    <div className="text-lg font-black text-slate-950">{priceDisplay.toLocaleString()} FCFA</div>
                                                    <div className="flex items-center gap-1.5 text-xs text-amber-500">
                                                        <span>★★★★★</span>
                                                        <span className="text-slate-400 font-medium">(5.0 • Top Tendance)</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                                        {bs.description || 'Produit sélectionné avec soin par le vendeur.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddToCart(bs)}
                                                    className="flex-1 py-3.5 rounded-2xl font-extrabold text-xs shadow-md transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer border"
                                                    style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                >
                                                    <ShoppingCart className="w-4 h-4" style={{ color: primaryTextColor }} />
                                                    <span>Ajouter au Panier</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        /* STATE 2: STORE HOMEPAGE / CATALOGUE VIEW (NOVATREND MOCKUP) */
                        <motion.div
                            key="store-home"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-16"
                        >
                            {/* 1. CRESCENDO & NOVATREND STYLE LIGHT HERO SECTION WITH DYNAMIC PRODUCT SLIDESHOW */}
                            {isSectionActive('hero') && (
                                <motion.section 
                                    id="hero"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="relative rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-amber-50/80 via-white to-slate-50 p-6 sm:p-10 lg:p-14 border border-slate-200/90 shadow-2xs overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                                        {/* LEFT TEXT & CTAS */}
                                        <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
                                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-800 font-extrabold text-[11px] uppercase tracking-wider shadow-2xs border border-slate-200">
                                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                <span>{store.hero_badge_text || store.category || 'BOUTIQUE OFFICIELLE'}</span>
                                            </div>

                                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15] break-words">
                                                {store.hero_title || `Sentez la Qualité. Live the Moment.`}
                                            </h2>

                                            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl line-clamp-3 sm:line-clamp-none">
                                                {store.hero_subtitle || store.description || 'Produits haut de gamme conçus pour ceux qui exigent l\'excellence et le style moderne. Livraison express 24h-48h.'}
                                            </p>

                                            {/* CTA BUTTONS (MOBILE RESPONSIVE SNAPPY TEXT) */}
                                            <div className="flex flex-wrap items-center gap-3 pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const el = document.getElementById('catalog-grid');
                                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer border"
                                                    style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                >
                                                    <span className="sm:hidden">Commander</span>
                                                    <span className="hidden sm:inline">Commander Maintenant</span>
                                                    <ArrowRight className="w-4 h-4" style={{ color: primaryTextColor }} />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const el = document.getElementById('catalog-grid');
                                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                    className="px-5 sm:px-7 py-3.5 sm:py-4 rounded-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-extrabold text-xs shadow-2xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                                                >
                                                    <span className="sm:hidden">Voir Catalogue</span>
                                                    <span className="hidden sm:inline">Explorer le Catalogue</span>
                                                </button>
                                            </div>

                                            {/* 3 MINI REASSURANCE CHIPS (NO EMOJIS, SVG ICONS) */}
                                            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 border-t border-slate-200/60">
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1.5 rounded-full bg-white border border-slate-200 text-amber-500">
                                                        <Truck className="w-3.5 h-3.5" />
                                                    </span>
                                                    <span>Livraison Express 24h-48h</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1.5 rounded-full bg-white border border-slate-200 text-emerald-600">
                                                        <CreditCard className="w-3.5 h-3.5" />
                                                    </span>
                                                    <span>Paiement MoMo USSD 100% Sécurisé</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="p-1.5 rounded-full bg-white border border-slate-200 text-blue-600">
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                    </span>
                                                    <span>Service Client Direct</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RIGHT HERO VISUAL: DYNAMIC AUTO-SLIDING PRODUCT SHOWCASE WITH CAROUSEL */}
                                        <div className="lg:col-span-5 relative flex items-center justify-center">
                                            <div className="w-full max-w-[380px] aspect-square rounded-[32px] sm:rounded-[36px] bg-white p-4 border border-slate-200/90 shadow-xl relative overflow-hidden flex flex-col justify-between group">
                                                
                                                {/* DYNAMIC DISCOUNT BADGE: DISPLAYED ONLY IF ACTIVE PRODUCT IS ON PROMO */}
                                                {activeHeroPromoPct ? (
                                                    <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-rose-600 text-white font-black text-xs text-center shadow-md border-2 border-white flex items-center gap-1">
                                                        <Tag className="w-3.5 h-3.5 text-white" />
                                                        <span>-{activeHeroPromoPct}% OFF</span>
                                                    </div>
                                                ) : null}

                                                {/* SLIDING PRODUCT IMAGE */}
                                                <AnimatePresence mode="wait">
                                                    <motion.div
                                                        key={currentHeroSlide}
                                                        initial={{ opacity: 0, scale: 0.96 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 1.04 }}
                                                        transition={{ duration: 0.4 }}
                                                        className="w-full h-full flex flex-col items-center justify-center relative p-2"
                                                    >
                                                        {activeHeroProduct ? (
                                                            <a 
                                                                href={`/${store.slug}/p/${activeHeroProduct.slug}`}
                                                                className="w-full h-full flex flex-col items-center justify-center group/img relative"
                                                            >
                                                                <img 
                                                                    src={activeHeroProduct.image_url || (activeHeroProduct.images?.[0]) || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'} 
                                                                    alt={activeHeroProduct.title} 
                                                                    className="w-full h-48 sm:h-56 object-contain rounded-2xl group-hover/img:scale-105 transition-transform duration-500" 
                                                                />
                                                                
                                                                {/* PRODUCT INFO PREVIEW FOOTER BAR */}
                                                                <div className="mt-3 w-full bg-slate-50 border border-slate-200/80 p-2.5 rounded-2xl flex items-center justify-between gap-2 text-xs">
                                                                    <div className="min-w-0">
                                                                        <div className="font-extrabold text-slate-950 truncate text-[11px] sm:text-xs">
                                                                            {activeHeroProduct.title}
                                                                        </div>
                                                                        <div className="text-[10px] text-slate-500 font-medium">
                                                                            {activeHeroProduct.category || store.name}
                                                                        </div>
                                                                    </div>
                                                                    <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-white font-extrabold text-[11px] shrink-0">
                                                                        {Math.ceil(((activeHeroProduct.is_promo && activeHeroProduct.promo_price > 0 ? activeHeroProduct.promo_price : activeHeroProduct.price_vendor) * 1.02)).toLocaleString()} FCFA
                                                                    </span>
                                                                </div>
                                                            </a>
                                                        ) : (
                                                            <img 
                                                                src={store.banner_url || store.logo_url || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"} 
                                                                alt={store.name} 
                                                                className="w-full h-full object-contain rounded-2xl" 
                                                            />
                                                        )}
                                                    </motion.div>
                                                </AnimatePresence>

                                                {/* CAROUSEL CONTROLS & PAGINATION DOTS */}
                                                {heroProductsList.length > 1 && (
                                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-full text-white">
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + heroProductsList.length) % heroProductsList.length)}
                                                            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                                                        >
                                                            <ChevronLeft className="w-3.5 h-3.5" />
                                                        </button>

                                                        <div className="flex items-center gap-1 px-1">
                                                            {heroProductsList.slice(0, 6).map((_, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    onClick={() => setCurrentHeroSlide(idx)}
                                                                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                                                        currentHeroSlide === idx ? 'w-4 bg-white' : 'bg-white/40'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % heroProductsList.length)}
                                                            className="p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                                                        >
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            )}

                            {/* 2. SHOP BY CATEGORIES (CLEAN UNIFIED GRID) */}
                            {isSectionActive('categories') && storeCategories && storeCategories.length > 0 && (
                                <section id="categories" className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">Acheter par Catégorie</h3>
                                        <button 
                                            type="button"
                                            onClick={() => setSelectedCategory('all')} 
                                            className="text-xs font-extrabold text-slate-600 hover:text-slate-950 flex items-center gap-1 cursor-pointer"
                                        >
                                            <span>Tout explorer</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {storeCategories.slice(0, 4).map((cat, idx) => {
                                            const categoryProduct = products.find(p => p.category === cat.name || p.category_id === cat.id) || products[idx % products.length];

                                            return (
                                                <button
                                                    key={cat.id || idx}
                                                    type="button"
                                                    onClick={() => setSelectedCategory(cat.id)}
                                                    className="p-6 rounded-3xl border border-slate-200/90 bg-slate-50/70 hover:bg-white text-slate-950 shadow-2xs hover:shadow-md transition-all text-left flex flex-col justify-between relative overflow-hidden group cursor-pointer h-52"
                                                >
                                                    <div className="space-y-1.5 max-w-[140px] z-10">
                                                        <span className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs inline-block text-slate-700">
                                                            <Tag className="w-4 h-4 text-slate-800" />
                                                        </span>
                                                        <h4 className="text-base font-black tracking-tight leading-snug">{cat.name}</h4>
                                                        <p className="text-[11px] font-medium text-slate-500">Sélection de qualité</p>
                                                        <div className="pt-2 flex items-center gap-1 text-xs font-extrabold group-hover:translate-x-1 transition-transform text-slate-900">
                                                            <span>Acheter</span>
                                                            <ArrowRight className="w-3.5 h-3.5" />
                                                        </div>
                                                    </div>

                                                    {/* OVERLAPPING PRODUCT IMAGE */}
                                                    {categoryProduct && (
                                                        <div className="absolute -bottom-2 -right-2 w-32 h-32 rounded-2xl overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                                                            <img 
                                                                src={categoryProduct.image_url || (categoryProduct.images?.[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'} 
                                                                alt={cat.name} 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* 4. NEW ARRIVALS / CATALOGUE SECTION (CRESCENDO & NOVATREND STYLE) */}
                            {isSectionActive('products') && (
                                <section id="catalog-grid" className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-slate-950 tracking-tight">Catalogue de Produits</h3>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setViewMode('catalog');
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }} 
                                            className="text-xs font-extrabold text-slate-600 hover:text-slate-950 flex items-center gap-1 cursor-pointer hover:underline"
                                        >
                                            <span>Tout afficher ({products?.length || 0})</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {filteredProducts.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {filteredProducts.map((product) => {
                                                const directProductUrl = `/${store.slug}/p/${product.slug}`;
                                                const unitPrice = (product.is_promo && product.promo_price > 0) ? Number(product.promo_price) : Number(product.price_vendor);
                                                const displayPrice = Math.ceil(unitPrice * 1.02);

                                                return (
                                                    <div key={product.id} className="bg-white rounded-3xl border border-slate-100 shadow-2xs hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group relative p-3">
                                                        <a href={directProductUrl} className="block">
                                                            <div className="h-48 bg-slate-50 rounded-2xl relative overflow-hidden flex items-center justify-center p-2 border border-slate-100/80">
                                                                <img 
                                                                    src={product.image_url || (product.images?.[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                                                                    alt={product.title} 
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
                                                                />
                                                                
                                                                {/* BADGE TOP LEFT */}
                                                                {product.stock <= 0 ? (
                                                                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] shadow-xs">
                                                                        Stock Épuisé
                                                                    </span>
                                                                ) : product.is_promo ? (
                                                                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-extrabold text-[10px]">
                                                                        PROMO
                                                                    </span>
                                                                ) : (
                                                                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-extrabold text-[10px]">
                                                                        Nouveau
                                                                    </span>
                                                                )}

                                                                {/* HEART WISHLIST TOP RIGHT */}
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => e.stopPropagation()} 
                                                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-slate-500 hover:text-rose-500 shadow-2xs cursor-pointer"
                                                                >
                                                                    <Heart className="w-3.5 h-3.5" />
                                                                </button>

                                                                {/* FLOATING CART BUTTON BOTTOM RIGHT (CRESCENDO STYLE) */}
                                                                <button
                                                                    type="button"
                                                                    disabled={product.stock <= 0}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        if (product.stock > 0) handleAddToCart(product);
                                                                    }}
                                                                    className={`absolute bottom-2 right-2 w-9 h-9 rounded-full shadow-md transition-all flex items-center justify-center border ${
                                                                        product.stock <= 0
                                                                            ? 'bg-slate-200 border-slate-300 cursor-not-allowed opacity-60'
                                                                            : 'active:scale-95 cursor-pointer'
                                                                    }`}
                                                                    style={product.stock > 0 ? { backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor } : {}}
                                                                    title={product.stock <= 0 ? "Stock Épuisé" : "Ajouter au panier"}
                                                                >
                                                                    <ShoppingCart className="w-4 h-4" style={{ color: product.stock > 0 ? primaryTextColor : '#94A3B8' }} />
                                                                </button>
                                                            </div>

                                                            <div className="pt-3.5 px-1 space-y-1">
                                                                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                                                    {product.category || store.category || 'Article'}
                                                                </span>
                                                                <h4 className="font-extrabold text-sm text-slate-950 truncate group-hover:text-amber-600 transition-colors">{product.title}</h4>
                                                                <div className="flex items-center gap-1 text-[11px] text-amber-500">
                                                                    <span>★★★★★</span>
                                                                    <span className="text-slate-400 font-semibold">(128 avis)</span>
                                                                </div>
                                                                <div className="flex items-baseline justify-between gap-1 pt-0.5">
                                                                    <span className="text-sm font-black text-slate-950">{displayPrice.toLocaleString()} FCFA</span>
                                                                    {product.stock <= 0 ? (
                                                                        <span className="text-[11px] text-rose-600 font-extrabold">Stock Épuisé</span>
                                                                    ) : product.is_promo ? (
                                                                        <span className="text-xs text-slate-400 line-through font-medium">
                                                                            {Math.ceil(product.price_vendor * 1.02).toLocaleString()}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </a>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
                                            <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                                            <h3 className="text-base font-bold text-slate-900">Aucun produit dans cette catégorie</h3>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* 5. BEST SELLERS SECTION (NOVATREND STYLE) */}
                            {isSectionActive('best-sellers') && (
                                <section id="best-sellers" className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-slate-950 tracking-tight">Meilleures Ventes</h3>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setViewMode('bestsellers');
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }} 
                                            className="text-xs font-extrabold text-slate-600 hover:text-slate-950 flex items-center gap-1 cursor-pointer hover:underline"
                                        >
                                            <span>Voir les tendances</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {(products && products.length > 0 ? products.slice(0, 3) : [
                                            { id: 'bs1', title: 'Produit Vedette Premier', price_vendor: 50000, description: 'Qualité exceptionnelle garantie.' },
                                            { id: 'bs2', title: 'Article Tendance Bestseller', price_vendor: 85000, description: 'Le choix préféré de nos clients.' },
                                            { id: 'bs3', title: 'Pack Offre Spéciale', price_vendor: 150000, description: 'Sélection premium garantie.' },
                                        ]).map((bs, i) => {
                                            const priceDisplay = Math.ceil(bs.price_vendor * 1.02);

                                            return (
                                                <div key={bs.id || i} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
                                                    <div>
                                                        <div className="h-64 bg-slate-100 rounded-2xl overflow-hidden relative mb-4">
                                                            <img 
                                                                src={bs.image_url || (bs.images?.[0]) || [
                                                                    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600",
                                                                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
                                                                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
                                                                ][i % 3]} 
                                                                alt={bs.title} 
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow-2xs">
                                                                Meilleure Vente
                                                            </span>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <h4 className="font-black text-base text-slate-950 group-hover:text-amber-600 transition-colors">{bs.title}</h4>
                                                            <div className="text-lg font-black text-slate-950">{priceDisplay.toLocaleString()} FCFA</div>
                                                            <div className="flex items-center gap-1.5 text-xs text-amber-500">
                                                                <span>★★★★★</span>
                                                                <span className="text-slate-400 font-medium">(5.0)</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                                                                {bs.description || 'Produit sélectionné avec soin par le vendeur.'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddToCart(bs)}
                                                            className="flex-1 py-3.5 rounded-2xl font-extrabold text-xs shadow-md transition-all active:scale-97 flex items-center justify-center gap-2 cursor-pointer border"
                                                            style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                        >
                                                            <ShoppingCart className="w-4 h-4" style={{ color: primaryTextColor }} />
                                                            <span>Ajouter au Panier</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* 6. PROMOTIONS & FLASH SALE SECTION (VISIBLE ONLY IF PROMO PRODUCTS EXIST & SECTION IS ACTIVE) */}
                            {isSectionActive('promotions') && promoProducts && promoProducts.length > 0 && (
                                <section id="promotions" className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-6 h-6 text-rose-500" />
                                            <h3 className="text-2xl font-black text-slate-950 tracking-tight">Offres en Promotion</h3>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-extrabold text-xs">
                                            {promoProducts.length} article(s) en promo
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                        {promoProducts.map((p) => {
                                            const directProductUrl = `/${store.slug}/p/${p.slug}`;
                                            const displayPrice = Math.ceil(Number(p.promo_price) * 1.02);
                                            const oldPrice = Math.ceil(Number(p.price_vendor) * 1.02);

                                            return (
                                                <div key={p.id} className="bg-white rounded-3xl border border-rose-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group relative">
                                                    <a href={directProductUrl} className="block p-3">
                                                        <div className="h-44 bg-rose-50/50 rounded-2xl relative overflow-hidden flex items-center justify-center p-2 border border-rose-100">
                                                            <img 
                                                                src={p.image_url || (p.images?.[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'} 
                                                                alt={p.title} 
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-xl"
                                                            />
                                                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px]">
                                                                OFFRE SPÉCIALE
                                                            </span>
                                                        </div>

                                                        <div className="pt-3 space-y-1">
                                                            <h4 className="font-extrabold text-xs text-slate-950 truncate group-hover:text-rose-600 transition-colors">{p.title}</h4>
                                                            <div className="flex items-baseline justify-between gap-1">
                                                                <span className="text-xs font-black text-rose-600">{displayPrice.toLocaleString()} FCFA</span>
                                                                <span className="text-[10px] text-slate-400 line-through font-medium">
                                                                    {oldPrice.toLocaleString()} FCFA
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </a>
                                                    <div className="px-3 pb-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddToCart(p)}
                                                            className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                                        >
                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                            <span>Profiter de l'Offre</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* 7. SMARTLINKS PACKS SECTION (VISIBLE ONLY IF ACTIVE SMARTLINKS EXIST & SECTION IS ACTIVE) */}
                            {isSectionActive('smartlinks') && activeSmartLinks && activeSmartLinks.length > 0 && (
                                <section id="smartlinks" className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-6 h-6 text-amber-500" />
                                            <h3 className="text-2xl font-black text-slate-950 tracking-tight">Offres Packs SmartLinks</h3>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs">
                                            {activeSmartLinks.length} pack(s) disponible(s)
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {activeSmartLinks.map((sl) => (
                                            <div key={sl.id} className="bg-white rounded-3xl p-6 border border-amber-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                                                            PACK SMARTLINK
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-500">
                                                            {sl.items?.length || 0} articles inclus
                                                        </span>
                                                    </div>

                                                    <h4 className="text-lg font-black text-slate-950">{sl.title || sl.name}</h4>
                                                    {sl.description && (
                                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{sl.description}</p>
                                                    )}

                                                    {/* PRODUCTS WITH PHOTOS IN PACK */}
                                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                                        {(sl.items || []).map((it, idx) => {
                                                            const itemImg = it.image_url || it.product?.image_url;
                                                            const itemTitle = it.product_name || it.product?.title || 'Article du pack';
                                                            return (
                                                                <div key={idx} className="flex items-center justify-between gap-3 text-xs text-slate-700 font-medium bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                                        <div className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                                            {itemImg ? (
                                                                                <img src={itemImg} alt={itemTitle} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                <ShoppingBag className="w-4 h-4 text-slate-400" />
                                                                            )}
                                                                        </div>
                                                                        <span className="truncate font-bold text-slate-900">{itemTitle}</span>
                                                                    </div>
                                                                    <span className="font-extrabold text-slate-950 bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0 text-[11px]">
                                                                        x{it.quantity || 1}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                                                    <div>
                                                        <div className="text-[10px] text-slate-400 font-medium uppercase">Prix du Pack</div>
                                                        <div className="text-lg font-black text-slate-950">
                                                            {Math.ceil((sl.total_amount || sl.price_total || 0) * 1.02).toLocaleString()} FCFA
                                                        </div>
                                                    </div>

                                                    <a
                                                        href={`/smartlink/${sl.code}`}
                                                        className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer border border-amber-300"
                                                    >
                                                        <ShoppingBag className="w-4 h-4" />
                                                        <span>Acheter le Pack</span>
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 8. AVIS CLIENTS SECTION */}
                            {isSectionActive('reviews') && (
                                <section id="reviews" className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xs space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-950 tracking-tight">Avis & Témoignages Clients</h3>
                                            <p className="text-xs text-slate-500 font-medium">Ce que pensent nos acheteurs vérifiés</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsReviewModalOpen(true)}
                                            className="px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
                                        >
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            <span>Déposer un Avis</span>
                                        </button>
                                    </div>

                                    {reviewsList && reviewsList.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {reviewsList.map((rev, i) => (
                                                <div key={rev.id || i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 text-amber-500">
                                                            {Array.from({ length: rev.rating || 5 }).map((_, s) => (
                                                                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                            Achat vérifié
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-700 font-medium leading-relaxed italic break-words overflow-hidden max-w-full">"{rev.comment}"</p>
                                                    <div className="text-xs font-black text-slate-950 pt-2 border-t border-slate-200/60 flex justify-between">
                                                        <span>{rev.customer_name || rev.name}</span>
                                                        <span className="text-slate-400 font-normal">{rev.customer_city || rev.city || ''}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 sm:p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                                                <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
                                            </div>
                                            <div className="text-sm font-black text-slate-950">Aucun avis publié pour le moment</div>
                                            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                                                Cette boutique n'a pas encore reçu d'avis de clients. Soyez le tout premier à donner votre avis sur {store.name} !
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setIsReviewModalOpen(true)}
                                                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors inline-flex items-center gap-2 cursor-pointer shadow-2xs"
                                            >
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                <span>Déposer le Premier Avis</span>
                                            </button>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* 9. À PROPOS & SUPPORT SECTION (LIGHT THEME - NO BLACK) */}
                            {isSectionActive('about') && (
                                <section id="about" className="bg-white text-slate-950 rounded-[32px] p-8 sm:p-12 space-y-6 relative overflow-hidden shadow-2xs border border-slate-200">
                                    <div className="max-w-2xl space-y-4 z-10 relative">
                                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-extrabold text-[10px] uppercase tracking-wider inline-block border border-amber-200">
                                            À PROPOS DE LA BOUTIQUE
                                        </span>
                                        <h3 className="text-3xl font-black tracking-tight text-slate-950">{store.name}</h3>
                                        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                                            {store.description || `Bienvenue sur la vitrine officielle de ${store.name}. Nous sélectionnons pour vous les meilleurs articles livrés avec soin.`}
                                        </p>

                                        <div className="pt-4 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
                                            {store.phone_whatsapp && (
                                                <a href={`https://wa.me/${store.phone_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-amber-600 transition-colors">
                                                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                                                    <span>WhatsApp: {store.phone_whatsapp}</span>
                                                </a>
                                            )}
                                            {store.city && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-amber-600" />
                                                    <span>Localisation: {store.city}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* 10. FOOTER REASSURANCE GRID (NOVATREND STYLE) */}
                            <section className="border-t border-slate-200/80 pt-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs font-semibold text-slate-600">
                                <div className="flex flex-col items-center space-y-1">
                                    <Award className="w-5 h-5 text-slate-900 mb-1" />
                                    <span className="font-extrabold text-slate-950">Qualité Garantie</span>
                                    <span className="text-[11px] text-slate-400">Articles authentiques &amp; certifiés</span>
                                </div>
                                <div className="flex flex-col items-center space-y-1">
                                    <Truck className="w-5 h-5 text-slate-900 mb-1" />
                                    <span className="font-extrabold text-slate-950">Livraison Rapide</span>
                                    <span className="text-[11px] text-slate-400">Expédition rapide à domicile</span>
                                </div>
                                <div className="flex flex-col items-center space-y-1">
                                    <ShieldCheck className="w-5 h-5 text-slate-900 mb-1" />
                                    <span className="font-extrabold text-slate-950">Paiement Sécurisé</span>
                                    <span className="text-[11px] text-slate-400">Paiement Mobile Money direct</span>
                                </div>
                                <div className="flex flex-col items-center space-y-1">
                                    <Star className="w-5 h-5 text-slate-900 mb-1" />
                                    <span className="font-extrabold text-slate-950">Satisfaction 100%</span>
                                    <span className="text-[11px] text-slate-400">Support &amp; suivi après-vente</span>
                                </div>
                            </section>

                        </motion.div>
                    )}

                </AnimatePresence>

            {/* USSD MODAL */}
            <AnimatePresence>
                {ussdModalState.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center relative overflow-hidden"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto text-2xl shadow-inner font-bold">
                                {ussdModalState.operator === 'ORANGE' ? '🍊' : '🟡'}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-extrabold text-slate-950">Validation USSD Mobile Money 🇨🇲</h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Opérateur : <strong className="text-slate-900">{ussdModalState.operator} MoMo</strong> ({ussdModalState.phone})
                                </p>
                            </div>

                            {ussdModalState.status === 'PENDING' && (
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                                    <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-sm">
                                        <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                                        <span>Prompt USSD Envoyé !</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                        Veuillez composer votre code secret PIN Mobile Money sur votre téléphone pour valider le règlement de <strong className="text-slate-950 font-bold">{Number(ussdModalState.amount).toLocaleString()} FCFA</strong>.
                                    </p>
                                </div>
                            )}

                            {ussdModalState.status === 'SUCCESS' && (
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                                    <h4 className="text-sm font-bold text-emerald-950">Paiement Confirmé !</h4>
                                    <p className="text-xs text-emerald-700">Redirection en cours...</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                    )}
                {isReviewModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                    <h3 className="font-extrabold text-sm text-slate-950">Déposer un avis sur {store.name}</h3>
                                </div>
                                <button
                                    onClick={() => setIsReviewModalOpen(false)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitCustomerReview} className="p-6 space-y-4 text-xs font-sans">
                                <div>
                                    <label className="block font-bold text-slate-950 mb-1">Votre Nom & Prénom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={reviewName}
                                        onChange={(e) => setReviewName(e.target.value)}
                                        placeholder="Ex: Mariam K."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-950 mb-1">Votre Ville de Résidence</label>
                                    <input
                                        type="text"
                                        value={reviewCity}
                                        onChange={(e) => setReviewCity(e.target.value)}
                                        placeholder="Ex: Douala, Cotonou..."
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-950 mb-1">Votre Note sur 5 Étoiles *</label>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setReviewRating(star)}
                                                className="p-1 cursor-pointer transition-transform hover:scale-110"
                                            >
                                                <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-950 mb-1">Votre Témoignage / Commentaire *</label>
                                    <textarea
                                        rows={4}
                                        required
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Ex: Produits de super qualité, livraison rapide et service client très réactif !"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsReviewModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                                    >
                                        Annuler
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmittingReview}
                                        className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-2"
                                    >
                                        <span>Publier mon avis</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            </div>
        </StorefrontLayout>
    );
}
