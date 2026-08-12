import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import {
    ShoppingBag, ShieldCheck, ArrowRight, X,
    Share2, Truck, Lock, MessageSquare, Star, Heart,
    Package, Sparkles, AlertCircle, Clock, MapPin, Tag, Check, Search,
    Store, ChevronRight, ArrowLeft, PhoneCall,
    Award, Shield, BadgeCheck, FileText, CheckCircle2, UserCheck, Play, Flame, Eye, Trash2, Plus, Minus,
    ShoppingCart, Mail, RefreshCw
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

    const [activeSectionTab, setActiveSectionTab] = useState('all'); // 'all', 'products', 'promo', 'reviews', 'about', 'cart'
    const [searchQuery, setSearchQuery] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

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
            try { setCartItems(JSON.parse(saved)); } catch (e) { }
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
            } catch (e) { }
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

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
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
                    reset();
                    clearInterval(interval);
                    setTimeout(() => {
                        window.location.href = route('order.track', res.data.tracking_code);
                    }, 1500);
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

    // Filters
    const filteredProducts = products ? products.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = q === '' ||
            p.title.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q));

        const catName = (p.category || '').toLowerCase();
        const pTitle = p.title.toLowerCase();
        let matchesCategory = true;
        if (selectedCategory === 'beaute') matchesCategory = catName.includes('beaut') || catName.includes('soin') || pTitle.includes('beaut') || pTitle.includes('savon') || pTitle.includes('creme');
        else if (selectedCategory === 'mode') matchesCategory = catName.includes('mode') || catName.includes('chaussure') || catName.includes('vetement') || pTitle.includes('sac') || pTitle.includes('habit') || pTitle.includes('pantalon');
        else if (selectedCategory === 'maison') matchesCategory = catName.includes('maison') || catName.includes('jardin') || pTitle.includes('meuble');
        else if (selectedCategory === 'electronique') matchesCategory = catName.includes('electro') || catName.includes('tech') || pTitle.includes('telephone') || pTitle.includes('ecouteur');
        else if (selectedCategory === 'sport') matchesCategory = catName.includes('sport') || pTitle.includes('sport');

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
        if (!sec) return false;
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
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                                    {/* LEFT COLUMN: LIST OF CART ITEMS */}
                                    <div className="lg:col-span-7 space-y-4">
                                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-2xs">
                                            <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                                                <ShoppingCart className="w-5 h-5 text-amber-500" />
                                                <span>Articles dans votre commande ({cartItems.length})</span>
                                            </h3>

                                            <div className="space-y-3 pt-2">
                                                {cartItems.map((item, idx) => (
                                                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-xs transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                                {item.image_url ? (
                                                                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <ShoppingBag className="w-8 h-8 text-slate-300" />
                                                                )}
                                                            </div>

                                                            <div className="space-y-1">
                                                                <h4 className="text-sm font-bold text-slate-950">{item.title}</h4>
                                                                {item.variant_label && (
                                                                    <div className="text-xs text-slate-500 font-medium">{item.variant_label}</div>
                                                                )}
                                                                <div className="text-xs font-bold text-slate-900 pt-0.5">
                                                                    {Number(item.price_display).toLocaleString()} FCFA / unité
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0 gap-3">
                                                            <div className="text-right">
                                                                <div className="text-xs text-slate-400 font-medium">Total Ligne :</div>
                                                                <div className="text-sm font-bold text-slate-950">
                                                                    {Number(item.price_display * item.quantity).toLocaleString()} FCFA
                                                                </div>
                                                            </div>

                                                            {/* QUANTITY CONTROL */}
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdateCartQuantity(idx, item.quantity - 1)}
                                                                        className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-slate-800 flex items-center justify-center text-xs"
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="w-10 text-center font-bold text-slate-950 text-xs">{item.quantity}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdateCartQuantity(idx, item.quantity + 1)}
                                                                        className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-slate-800 flex items-center justify-center text-xs"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveFromCart(idx)}
                                                                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                                                    title="Supprimer du panier"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* RIGHT COLUMN: ORDER SUMMARY & FAST USSD CHECKOUT FORM */}
                                    <div className="lg:col-span-5 space-y-6">
                                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-2xs sticky top-24">
                                            <div className="border-b border-slate-100 pb-3">
                                                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-emerald-600" />
                                                    <span>Caisse & Validation Mobile Money</span>
                                                </h3>
                                                <p className="text-xs text-slate-500 font-medium">Saisissez vos coordonnées de livraison</p>
                                            </div>

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

                                            <form onSubmit={handleCheckoutSubmitFromCartPage} className="space-y-3.5">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom & Prénom *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="ex: Jean Dupont"
                                                        value={data.customer_name}
                                                        onChange={(e) => setData('customer_name', e.target.value)}
                                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro Mobile Money (MTN / Orange Cameroun 🇨🇲) *</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0">
                                                            <span>🇨🇲 +237</span>
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            required
                                                            placeholder="ex: 699123456"
                                                            value={data.customer_phone}
                                                            onChange={(e) => handlePhoneChange(e.target.value)}
                                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                {/* OPTIONAL FIELDS */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                            Email <span className="text-slate-400 font-normal">(Facultatif)</span>
                                                        </label>
                                                        <div className="relative">
                                                            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                            <input
                                                                type="email"
                                                                placeholder="ex: client@gmail.com"
                                                                value={data.customer_email}
                                                                onChange={(e) => setData('customer_email', e.target.value)}
                                                                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                            WhatsApp <span className="text-slate-400 font-normal">(Facultatif)</span>
                                                        </label>
                                                        <div className="relative">
                                                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
                                                            <input
                                                                type="tel"
                                                                placeholder="ex: +229 97 00 00 00"
                                                                value={data.customer_whatsapp}
                                                                onChange={(e) => setData('customer_whatsapp', e.target.value)}
                                                                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse / Quartier de Livraison *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="ex: Douala, Akwa Rue 12"
                                                        value={data.delivery_address}
                                                        onChange={(e) => setData('delivery_address', e.target.value)}
                                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none"
                                                    />
                                                </div>

                                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs pt-3">
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
                                                        <span className="text-slate-950 font-extrabold">{Number(cartTotalClientTc).toLocaleString()} FCFA</span>
                                                    </div>
                                                </div>

                                                <motion.button
                                                    whileHover={{ scale: (isSubmittingCheckout || processing) ? 1 : 1.02 }}
                                                    whileTap={{ scale: (isSubmittingCheckout || processing) ? 1 : 0.97 }}
                                                    type="submit"
                                                    disabled={isSubmittingCheckout || processing}
                                                    className={`w-full py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 border ${(isSubmittingCheckout || processing) ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''
                                                        }`}
                                                    style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                >
                                                    {(isSubmittingCheckout || processing) ? (
                                                        <span>Traitement du paiement en cours...</span>
                                                    ) : (
                                                        <>
                                                            <ShoppingBag className="w-4 h-4" style={{ color: primaryTextColor }} />
                                                            <span>Valider & Payer par Mobile Money ({Number(cartTotalClientTc).toLocaleString()} FCFA)</span>
                                                        </>
                                                    )}
                                                </motion.button>

                                                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-slate-700 font-medium flex items-start gap-2.5">
                                                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                    <div className="leading-relaxed">
                                                        <strong className="text-slate-950 font-bold block mb-0.5">Confirmation & Facturation Automatique :</strong>
                                                        Après validation de votre paiement, vous recevrez automatiquement votre reçu d'achat et facture numérique par Email et WhatsApp.
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>

                                </div>
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
                    ) : (

                        /* STATE 2: STORE HOMEPAGE / CATALOGUE VIEW */
                        <motion.div
                            key="store-home"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-16"
                        >
                            {/* 1. HERO BANNER */}
                            <motion.section
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="relative rounded-3xl bg-white overflow-hidden p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-200/90 shadow-2xs"
                            >
                                <div className="space-y-5 max-w-xl text-center md:text-left z-10">
                                    <motion.span
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="px-3 py-1 rounded-full font-semibold text-[11px] uppercase tracking-wider inline-block shadow-2xs border border-slate-200"
                                        style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                                    >
                                        {store.hero_badge_text || 'PROMOTIONS & TENDANCES'}
                                    </motion.span>

                                    <motion.h2
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-950"
                                    >
                                        {store.hero_title || 'Découvrez nos Produits d\'Exception'}
                                    </motion.h2>

                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed"
                                    >
                                        {store.hero_subtitle || 'Articles de qualité supérieure expédiés sous 24h-48h. Paiement Mobile Money direct et sécurisé.'}
                                    </motion.p>
                                </div>

                                <motion.div
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                    className="relative w-full md:w-80 h-72 sm:h-80 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center p-3"
                                >
                                    {products && products.length > 0 && (products[0].image_url || products[0].images?.[0]) ? (
                                        <img src={products[0].image_url || products[0].images[0]} alt="Hero Product" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <ShoppingBag className="w-20 h-20 text-slate-300" />
                                    )}
                                </motion.div>
                            </motion.section>

                            {/* 2. CONFIDENCE & STATS BAR */}
                            {isSectionActive('benefits') && (
                                <motion.section
                                    variants={staggerContainer}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                                >
                                    {activeBenefitsList.map((benefit, idx) => {
                                        const IconComp = benefitsIcons[idx % benefitsIcons.length];
                                        return (
                                            <motion.div key={idx} variants={fadeInUp} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                                                    <IconComp className="w-5 h-5 text-slate-800" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900">{benefit.title}</div>
                                                    <div className="text-[11px] text-slate-500 font-medium">{benefit.subtitle}</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.section>
                            )}

                            {/* 2.5. SMARTLINKS OFFRES EXPRESS SECTION */}
                            {isSectionActive('smartlinks') && activeSmartLinks && activeSmartLinks.length > 0 && (
                                <motion.section
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.35 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-block shadow-2xs border border-slate-200" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                                Offres Spéciales Express
                                            </span>
                                            <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight mt-1">Packs & Offres SmartLinks</h3>
                                            <p className="text-xs text-slate-500 font-medium">Commandez nos offres groupées directement en 1 clic</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {activeSmartLinks.map((sl) => (
                                            <div key={sl.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between group hover:border-amber-300 transition-all">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                                            Pack Express 1-Clic
                                                        </span>
                                                        <span className="text-xs font-mono font-bold text-slate-400">
                                                            {sl.items?.length || 0} article(s)
                                                        </span>
                                                    </div>

                                                    <h4 className="text-lg font-bold text-slate-950 group-hover:text-amber-600 transition-colors">
                                                        {sl.title}
                                                    </h4>

                                                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5 text-xs">
                                                        {sl.items && sl.items.map((it, i) => (
                                                            <div key={i} className="flex items-center justify-between text-slate-700 font-medium">
                                                                <span className="truncate">• {it.product_name}</span>
                                                                <span className="font-bold font-mono shrink-0">x{it.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-slate-100 space-y-3">
                                                    <div className="flex items-baseline justify-between">
                                                        <span className="text-xs text-slate-400 font-medium">Prix Total Pack :</span>
                                                        <div className="text-right">
                                                            {sl.subtotal_amount > sl.total_amount && (
                                                                <div className="text-xs text-slate-400 line-through">
                                                                    {Number(sl.subtotal_amount).toLocaleString()} FCFA
                                                                </div>
                                                            )}
                                                            <div className="text-xl font-extrabold text-slate-950">
                                                                {Number(sl.total_amount).toLocaleString()} FCFA
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => handleSmartLinkAddToCart(sl)}
                                                        className="w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 border"
                                                        style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                    >
                                                        <ShoppingBag className="w-4 h-4" />
                                                        <span>Commander ce Pack au Panier</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* 3. CATEGORIES & CATALOGUE PRODUITS SECTION (IMAGE 1 & IMAGE 2 DESIGN) */}
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35 }}
                                className="space-y-6"
                            >
                                {/* CLEAN SEARCH BAR INSIDE PRODUCT SECTION */}
                                <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
                                    <div className="border border-slate-200 shadow-2xs focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200 rounded-full bg-slate-50/60 p-1.5 flex items-center transition-all max-w-3xl mx-auto">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Rechercher un article, un produit, un vêtement dans la boutique..."
                                            className="w-full px-4 sm:px-5 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
                                        />
                                        <button
                                            type="button"
                                            className="px-6 py-2.5 rounded-full bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-2xs transition-all shrink-0 cursor-pointer"
                                        >
                                            <Search className="w-4 h-4 text-slate-950" />
                                            <span>Rechercher</span>
                                        </button>
                                    </div>

                                    {/* VENDOR STORE REASSURANCE INFO */}
                                    <div className="text-center pt-1 text-[11px] font-medium text-slate-600">
                                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-slate-700 font-semibold">
                                            <span className="font-extrabold text-slate-950">{store.name}</span>
                                            <span className="flex items-center gap-1"><span className="text-amber-500 font-bold">✓</span> Boutique Certifiée</span>
                                            <span className="flex items-center gap-1"><span className="text-amber-500 font-bold">✓</span> Support &amp; Livraison 24h-48h</span>
                                            <span className="flex items-center gap-1"><span className="text-amber-500 font-bold">✓</span> Propulsé par BIOLINKO</span>
                                        </div>
                                    </div>
                                </div>

                                {/* TOP CATEGORY PILLS BAR (IMAGE 1 & FUNCTIONAL FILTER) */}
                                <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
                                    <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 text-xs font-bold text-slate-700 whitespace-nowrap scrollbar-none">
                                        {[
                                            { id: 'all', label: 'Toutes les catégories' },
                                            { id: 'beaute', label: 'Beauté & Soins' },
                                            { id: 'mode', label: 'Mode & Accessoires' },
                                            { id: 'maison', label: 'Maison & Jardin' },
                                            { id: 'electronique', label: 'Électronique & High-Tech' },
                                            { id: 'sport', label: 'Sports & Loisirs' },
                                        ].map(cat => (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`py-1.5 px-4 rounded-full transition-all cursor-pointer ${selectedCategory === cat.id
                                                        ? 'bg-[#FFCC00] text-slate-950 font-extrabold shadow-2xs'
                                                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-semibold text-slate-600 whitespace-nowrap border-t border-slate-100 pt-3">
                                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Faible MOQ pour personnalisation</span>
                                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Personnalisation à partir d'échantillons</span>
                                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Gestion de la qualité certifiée</span>
                                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Personnalisation simple</span>
                                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Personnalisation complète</span>
                                        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200">Capacités R&amp;D élevées</span>
                                    </div>
                                </div>

                                {/* SECTION HEADER TITLE (IMAGE 1) */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">Produits &amp; Recommandations du Jour</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Achetez en gros ou au détail directement auprès des vendeurs agréés</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                                            className={`px-4 py-2 rounded-full text-xs cursor-pointer ${selectedCategory === 'all' && searchQuery === ''
                                                    ? 'bg-[#FFCC00] text-slate-950 font-extrabold shadow-2xs'
                                                    : 'bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50'
                                                }`}
                                        >
                                            Tous les articles
                                        </button>
                                        <button
                                            onClick={() => setActiveSectionTab(activeSectionTab === 'promo' ? 'all' : 'promo')}
                                            className={`px-4 py-2 rounded-full text-xs cursor-pointer ${activeSectionTab === 'promo'
                                                    ? 'bg-rose-600 text-white font-extrabold shadow-2xs'
                                                    : 'bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50'
                                                }`}
                                        >
                                            Promotions &amp; Ventes Flash
                                        </button>
                                    </div>
                                </div>

                                {filteredProducts.length > 0 ? (
                                    <motion.div
                                        variants={staggerContainer}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                                    >
                                        {filteredProducts.map((product) => {
                                            const directProductUrl = `/${store.slug}/p/${product.slug}`;
                                            const unitPrice = (product.is_promo && product.promo_price > 0)
                                                ? Number(product.promo_price)
                                                : Number(product.price_vendor);
                                            const displayPrice = Math.ceil(unitPrice * 1.02);

                                            return (
                                                <motion.div
                                                    key={product.id}
                                                    variants={fadeInUp}
                                                    whileHover={{ y: -3 }}
                                                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                                                >
                                                    <a href={directProductUrl} className="block">
                                                        <div className="h-52 bg-slate-50 relative overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
                                                            <img
                                                                src={product.image_url || (product.images?.[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                                                                alt={product.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            {product.is_promo ? (
                                                                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md font-semibold text-[10px] shadow-2xs flex items-center gap-1 border border-slate-200" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                                                    <Tag className="w-3 h-3" style={{ color: primaryTextColor }} />
                                                                    <span>PROMO</span>
                                                                </div>
                                                            ) : (
                                                                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-medium text-[10px]">
                                                                    EN STOCK
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="p-4 space-y-2.5">
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                                                <Store className="w-3 h-3 text-slate-400 shrink-0" />
                                                                <span className="truncate">{store.name}</span>
                                                            </div>

                                                            <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-amber-600 transition-colors line-clamp-1">
                                                                {product.title}
                                                            </h3>

                                                            {product.description && (
                                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                                                    {product.description}
                                                                </p>
                                                            )}

                                                            <div className="pt-2 border-t border-slate-100 space-y-1">
                                                                <div className="flex items-baseline justify-between gap-1 flex-wrap">
                                                                    <span className="text-[11px] text-slate-400 font-medium">Prix TTC :</span>
                                                                    <span className="text-base font-bold text-slate-950">
                                                                        {displayPrice.toLocaleString()} FCFA
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a>

                                                    <div className="p-4 pt-0 flex items-center gap-2">
                                                        <motion.button
                                                            whileTap={{ scale: 0.96 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddToCart(product);
                                                            }}
                                                            className="py-2.5 px-3 rounded-xl font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all border"
                                                            style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                        >
                                                            <ShoppingCart className="w-3.5 h-3.5" style={{ color: primaryTextColor }} />
                                                            <span>+ Panier</span>
                                                        </motion.button>

                                                        <a
                                                            href={directProductUrl}
                                                            className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                                                        >
                                                            <span>Commander</span>
                                                            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                                                        </a>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
                                        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                                        <h3 className="text-base font-semibold text-slate-900">Aucun produit trouvé</h3>
                                    </div>
                                )}
                            </motion.section>

                            {/* 4. PROMOTIONS SECTION */}
                            <motion.section
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35 }}
                                className="space-y-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-2xs"
                            >
                                <div className="text-center max-w-2xl mx-auto space-y-3">
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 text-rose-800 font-semibold text-xs border border-rose-200">
                                        <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                                        <span>VENTES FLASH & OFFRES SOLDE</span>
                                    </div>

                                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                                        Promotions Exclusives du Moment
                                    </h3>

                                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                        Profitez de remises immédiates avec livraison rapide et paiement Mobile Money sécurisé !
                                    </p>
                                </div>

                                {promoProducts.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                                        {promoProducts.map((promoItem) => {
                                            const directProductUrl = `/${store.slug}/p/${promoItem.slug}`;
                                            const originalP = Math.ceil(promoItem.price_vendor * 1.02);
                                            const promoP = Math.ceil(promoItem.promo_price * 1.02);

                                            return (
                                                <div key={promoItem.id} className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
                                                    <a href={directProductUrl} className="block">
                                                        <div className="h-48 bg-slate-50 relative overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
                                                            <img
                                                                src={promoItem.image_url || (promoItem.images?.[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
                                                                alt={promoItem.title}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-2xs flex items-center gap-1">
                                                                <Flame className="w-3 h-3 fill-white" />
                                                                <span>SOLDE</span>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 space-y-2">
                                                            <h3 className="font-bold text-slate-950 text-sm line-clamp-1 group-hover:text-amber-700 transition-colors">
                                                                {promoItem.title}
                                                            </h3>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-base font-extrabold text-slate-950">{promoP.toLocaleString()} FCFA</span>
                                                                <span className="text-xs line-through text-rose-600">{originalP.toLocaleString()} FCFA</span>
                                                            </div>
                                                        </div>
                                                    </a>

                                                    <div className="p-4 pt-0 flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleAddToCart(promoItem)}
                                                            className="py-2 px-3 rounded-xl font-bold text-xs shadow-2xs border"
                                                            style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                        >
                                                            + Panier
                                                        </button>
                                                        <a
                                                            href={directProductUrl}
                                                            className="flex-1 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs text-center shadow-2xs"
                                                        >
                                                            Commander
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500 font-medium text-xs border border-slate-200">
                                        Aucun produit actuellement en promotion.
                                    </div>
                                )}
                            </motion.section>

                            {/* 5. CUSTOMER REVIEWS SECTION */}
                            {isSectionActive('reviews') && (
                                <motion.section
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.35 }}
                                    className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 space-y-8 shadow-2xs"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                                        <div>
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 font-semibold text-[11px] border border-slate-200">
                                                ÉVALUATIONS CLIENTS
                                            </span>
                                            <h3 className="text-2xl font-bold text-slate-950 mt-2">Avis & Témoignages Vérifiés</h3>
                                            <p className="text-xs text-slate-500 font-medium">Ce que pensent les clients qui ont acheté chez {store.name}</p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                                <div className="text-center">
                                                    <div className="text-4xl font-bold text-slate-950">4.8</div>
                                                    <div className="flex text-amber-400 text-xs justify-center mt-1">
                                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                                                    </div>
                                                </div>
                                                <div className="text-xs text-slate-600 font-medium">
                                                    <div>100% Achats Vérifiés</div>
                                                    <div className="text-emerald-600 font-bold">{reviewsList.length} Avis Positifs</div>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setIsReviewModalOpen(true)}
                                                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer transition-all shrink-0"
                                            >
                                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                <span>✍️ Laisser un avis client</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {reviewsList.slice(0, 3).map((rev, idx) => (
                                            <div key={rev.id || idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-xs transition-all">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-bold text-xs text-slate-950">{rev.customer_name} ({rev.customer_city || 'Cotonou'})</div>
                                                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Acheteur Vérifié</span>
                                                </div>
                                                <div className="flex text-amber-400">
                                                    {[...Array(rev.rating || 5)].map((_, i) => (
                                                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 text-amber-400" />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                    "{rev.comment}"
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.section>
                            )}

                            {/* 6. ABOUT STORE SECTION */}
                            {isSectionActive('about') && (
                                <motion.section
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.35 }}
                                    className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 space-y-6 shadow-2xs"
                                >
                                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                        <div className="w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-slate-950" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                            <UserCheck className="w-5 h-5" style={{ color: primaryTextColor }} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-950">À Propos de la Boutique</h3>
                                            <p className="text-xs text-slate-500 font-medium">Boutique officielle hébergée sur BIOLINKO</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-bold text-slate-900">Bienvenue chez {store.name}</h4>
                                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                                                {store.description || "Nous sommes spécialisés dans la fourniture d'articles de haute qualité, soigneusement sélectionnés pour vous offrir la meilleure expérience d'achat. Nos expéditions sont rapides et nos transactions sont 100% sécurisées."}
                                            </p>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Identité & Contact Vendeur</h4>
                                            <div className="space-y-2 text-xs text-slate-700 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Store className="w-4 h-4 text-slate-500" />
                                                    <span>Nom de Boutique : <strong className="text-slate-950 font-bold">{store.name}</strong></span>
                                                </div>
                                                {store.phone_whatsapp && (
                                                    <div className="flex items-center gap-2">
                                                        <PhoneCall className="w-4 h-4 text-slate-500" />
                                                        <span>Téléphone Direct : <strong className="text-slate-950 font-bold">{store.phone_whatsapp}</strong></span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-slate-500" />
                                                    <span>Localisation : <strong>{store.city || 'Cotonou, Bénin'}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.section>
                            )}

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
