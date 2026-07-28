import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, ShieldCheck, CheckCircle, ArrowRight, X, 
    Share2, Truck, Lock, MessageSquare, Star, Heart, ChevronDown, ChevronUp, 
    Package, Sparkles, AlertCircle, Clock, MapPin, Tag, Check, Search, 
    Store, ChevronRight, HelpCircle, ArrowLeft, Percent, Calendar, PhoneCall,
    Award, Shield, FileText, CheckCircle2, Factory, Globe, BadgeCheck,
    RefreshCw, Headphones, UserCheck, Play, Flame, Eye, Trash2, Plus, Minus,
    ShoppingCart, ArrowUpRight, Mail, User
} from 'lucide-react';

// Reliable Contrast Helper Function (YIQ Formula)
function getContrastColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
        return '#0F172A';
    }
    const hex = hexColor.replace('#', '');
    if (hex.length < 6) return '#0F172A';
    
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    
    return yiq >= 165 ? '#0F172A' : '#FFFFFF';
}

export default function Show({ store, products, initialSelectedProductId, appUrl }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    
    // SHOPPING CART & FULL PAGE VIEW STATE
    const [cartItems, setCartItems] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSectionTab, setActiveSectionTab] = useState('all'); // 'all', 'products', 'promo', 'reviews', 'about', 'cart'
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
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

    // Real-time status polling for HR-Skills Pay USSD confirmation
    useEffect(() => {
        if (!ussdModalState.isOpen || !ussdModalState.reference || ussdModalState.status !== 'PENDING') {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`/checkout/status/${ussdModalState.reference}`);
                if (res.data.paid || res.data.status === 'SUCCESS') {
                    setUssdModalState(prev => ({ ...prev, status: 'SUCCESS' }));
                    saveCart([]);
                    reset();
                    setTimeout(() => {
                        window.location.href = res.data.redirect_url || `/track/${res.data.tracking_code}`;
                    }, 1200);
                } else if (res.data.status === 'FAILED') {
                    setUssdModalState(prev => ({ ...prev, status: 'FAILED', errorMsg: res.data.message || 'Paiement décliné ou annulé.' }));
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 3500);

        return () => clearInterval(interval);
    }, [ussdModalState.isOpen, ussdModalState.reference, ussdModalState.status]);

    // Vendor Dynamic Theme Color & Legible Contrast Text
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = getContrastColor(primaryColor);

    // Fast USSD Checkout Form
    const { data, setData, post, processing, errors, reset } = useForm({
        store_id: store.id,
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_whatsapp: '',
        delivery_address: '',
        notes: '',
        items: [],
    });

    // Local Storage Cart Persistence & Returning Customer Profile Auto-fill
    useEffect(() => {
        const saved = localStorage.getItem(`biolinko_cart_${store.id}`);
        if (saved) {
            try {
                setCartItems(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse cart JSON", e);
            }
        }

        // Returning Customer Auto-fill from localStorage
        const savedCustomer = localStorage.getItem('biolinko_client_profile');
        if (savedCustomer) {
            try {
                const parsed = JSON.parse(savedCustomer);
                if (parsed && parsed.customer_phone) {
                    setData(d => ({
                        ...d,
                        customer_name: parsed.customer_name || '',
                        customer_phone: parsed.customer_phone || '',
                        customer_email: parsed.customer_email || '',
                        customer_whatsapp: parsed.customer_whatsapp || '',
                        delivery_address: parsed.delivery_address || '',
                    }));
                    setIsAutoFilled(true);
                }
            } catch (e) {
                console.error("Failed to parse saved customer profile", e);
            }
        }
    }, [store.id]);

    const saveCart = (items) => {
        setCartItems(items);
        localStorage.setItem(`biolinko_cart_${store.id}`, JSON.stringify(items));
    };

    // Show Toast Notification
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // Customer Phone Lookup API Trigger (For returning customers on new devices)
    const handlePhoneChange = (newPhone) => {
        setData('customer_phone', newPhone);

        const cleanPhone = newPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.length >= 8 && !isAutoFilled) {
            fetch(`/checkout/lookup-customer?phone=${encodeURIComponent(cleanPhone)}`)
                .then(res => res.json())
                .then(resData => {
                    if (resData && resData.found && resData.customer) {
                        const c = resData.customer;
                        setData(d => ({
                            ...d,
                            customer_name: c.name || d.customer_name,
                            customer_email: c.email || d.customer_email,
                            customer_whatsapp: c.whatsapp || d.customer_whatsapp,
                            delivery_address: c.delivery_address || d.delivery_address,
                        }));
                        setIsAutoFilled(true);
                        showToast(`✨ Content de vous revoir ${c.name} ! Vos coordonnées ont été pré-remplies.`);
                    }
                })
                .catch(err => console.error("Customer lookup error", err));
        }
    };

    const handleResetCustomerForm = () => {
        setData(d => ({
            ...d,
            customer_name: '',
            customer_phone: '',
            customer_email: '',
            customer_whatsapp: '',
            delivery_address: '',
        }));
        setIsAutoFilled(false);
    };

    // CART MANAGEMENT FUNCTIONS
    const handleAddToCart = (product, quantityToAdd = null, variant = null, openCartViewImmediately = false) => {
        const minQ = product.min_order_quantity || 1;
        const qToAdd = quantityToAdd ? Math.max(quantityToAdd, minQ) : minQ;
        const variantObj = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);

        const currentPv = (product.is_promo && product.promo_price > 0) ? parseFloat(product.promo_price) : parseFloat(product.price_vendor);
        const pbUnit = Math.ceil(currentPv * 1.02);

        const variantLabel = variantObj ? trimVariantLabel(variantObj) : '';

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
                    variant_label: variantLabel,
                    min_order_quantity: minQ,
                    price_vendor: currentPv,
                    price_display: pbUnit,
                    quantity: qToAdd,
                }
            ];
        }

        saveCart(updated);
        
        if (openCartViewImmediately) {
            openCartView();
        } else {
            showToast(`"${product.title}" ajouté au panier !`);
        }
    };

    const trimVariantLabel = (v) => {
        if (!v) return '';
        return [v.size ? `Taille: ${v.size}` : '', v.color ? `Couleur: ${v.color}` : ''].filter(Boolean).join(' ');
    };

    const handleUpdateCartQuantity = (index, newQuantity) => {
        const item = cartItems[index];
        if (!item) return;
        const minQ = item.min_order_quantity || 1;
        if (newQuantity < minQ) return;

        const updated = [...cartItems];
        updated[index].quantity = newQuantity;
        saveCart(updated);
    };

    const handleRemoveFromCart = (index) => {
        const updated = cartItems.filter((_, i) => i !== index);
        saveCart(updated);
    };

    const handleClearCart = () => {
        saveCart([]);
    };

    const openCartView = () => {
        setSelectedProduct(null);
        setActiveSectionTab('cart');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calculate Cart Totals
    const cartSubtotalPb = cartItems.reduce((acc, item) => acc + (item.price_display * item.quantity), 0);
    const cartTotalClientTc = Math.ceil(cartSubtotalPb / 0.98);
    const cartMomoFee = cartTotalClientTc - cartSubtotalPb;
    const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Benefits Fallbacks
    const benefitsList = store?.benefits_json || [
        { title: 'Livraison Express', subtitle: 'Sous 24h à 48h à domicile' },
        { title: 'Paiements Sécurisés MoMo', subtitle: 'Notification Push USSD 30s' },
        { title: 'Satisfait ou Remboursé', subtitle: 'Politique de retour 14 jours' },
        { title: 'Support WhatsApp 7j/7', subtitle: 'Contact direct avec le vendeur' }
    ];

    const benefitsIcons = [Truck, ShieldCheck, RefreshCw, Headphones];

    // Reviews Fallbacks
    const reviewsList = (store?.reviews && store.reviews.length > 0) 
        ? store.reviews.filter(r => r.is_featured !== false) 
        : [
            { id: 1, customer_name: 'Armand K.', customer_city: 'Cotonou', rating: 5, comment: 'Commande livrée en moins de 24h. La qualité des produits est impressionnante et le paiement USSD est d\'une simplicité folle.' },
            { id: 2, customer_name: 'Bernice T.', customer_city: 'Porto-Novo', rating: 5, comment: 'Le vendeur est très réactif sur WhatsApp. J\'ai reçu ma facture numérique immédiatement après avoir validé mon MoMo.' },
            { id: 3, customer_name: 'Chantal D.', customer_city: 'Parakou', rating: 5, comment: 'Excellente expérience d\'achat. Le code de suivi m\'a permis de suivre le colis en temps réel jusqu\'à mon domicile.' }
        ];

    useEffect(() => {
        if (initialSelectedProductId && products) {
            const found = products.find(p => p.id === parseInt(initialSelectedProductId));
            if (found) {
                openProductDetail(found);
            }
        }
    }, [initialSelectedProductId, products]);

    const openProductDetail = (product) => {
        setSelectedProduct(product);
        setSelectedImageIndex(0);
        const minQ = product.min_order_quantity || 1;
        setQuantity(minQ);
        setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToSection = (sectionId, tabName = 'all') => {
        setSelectedProduct(null);
        setActiveSectionTab(tabName);

        setTimeout(() => {
            if (sectionId === 'hero') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const el = document.getElementById(sectionId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }, 100);
    };

    const handleCheckoutSubmitFromCartPage = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;

        // Save profile to localStorage for future 1-click purchases across BIOLINKO
        localStorage.setItem('biolinko_client_profile', JSON.stringify({
            customer_name: data.customer_name,
            customer_phone: data.customer_phone,
            customer_email: data.customer_email,
            customer_whatsapp: data.customer_whatsapp,
            delivery_address: data.delivery_address,
        }));

        const checkoutPayloadItems = cartItems.map(item => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
        }));

        setIsSubmittingCheckout(true);
        try {
            const response = await axios.post(route('checkout.process'), {
                ...data,
                items: checkoutPayloadItems,
            });

            if (response.data.requires_ussd) {
                setUssdModalState({
                    isOpen: true,
                    reference: response.data.reference,
                    tracking_code: response.data.tracking_code,
                    amount: response.data.amount,
                    operator: response.data.operator,
                    phone: response.data.phone,
                    status: 'PENDING',
                    errorMsg: null,
                });
            } else if (response.data.redirect_url) {
                saveCart([]);
                reset();
                window.location.href = response.data.redirect_url;
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Échec du paiement Mobile Money. Veuillez vérifier votre numéro (+237).';
            alert(msg);
        } finally {
            setIsSubmittingCheckout(false);
        }
    };

    const handleInstantBuyProduct = (product, reqQuantity, reqVariant) => {
        handleAddToCart(product, reqQuantity, reqVariant, true);
    };

    const handleQuantityChangeInDetail = (newQ) => {
        const minQ = selectedProduct?.min_order_quantity || 1;
        if (newQ < minQ) return;
        setQuantity(newQ);
    };

    const handleShareStore = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    // Calculate price for selected product in detail view
    const currentPv = selectedProduct ? ((selectedProduct.is_promo && selectedProduct.promo_price) ? parseFloat(selectedProduct.promo_price) : parseFloat(selectedProduct.price_vendor)) : 0;
    const itemUnitPricePb = Math.ceil(currentPv * 1.02);

    // Filter products
    const filteredProducts = products ? products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeSectionTab === 'promo') return matchesSearch && (p.is_promo && p.promo_price);
        return matchesSearch;
    }) : [];

    const promoProducts = products ? products.filter(p => p.is_promo && p.promo_price) : [];
    
    // 4 Other products for Product Detail view
    const relatedProducts = selectedProduct && products 
        ? products.filter(p => p.id !== selectedProduct.id).slice(0, 4) 
        : [];

    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans antialiased selection:bg-slate-900 selection:text-white">
            <Head title={`${selectedProduct ? selectedProduct.title : activeSectionTab === 'cart' ? 'Mon Panier d\'Achat' : store.name} — Vitrine Officielle`} />

            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-slate-950 text-white font-medium text-xs shadow-xl flex items-center gap-3 border border-slate-800"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{toastMessage}</span>
                        <button
                            onClick={openCartView}
                            className="ml-2 px-2.5 py-1 rounded-lg text-[10px] font-bold underline text-amber-300 hover:text-amber-200"
                        >
                            Voir mon Panier →
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 1. TOP ANNOUNCEMENT BAR */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800"
            >
                <div className="flex items-center gap-4 mx-auto sm:mx-0">
                    <span className="flex items-center gap-1.5 font-semibold" style={{ color: primaryColor }}>
                        <Truck className="w-3.5 h-3.5" style={{ color: primaryColor }} /> {store.announcement_header || 'Livraison Offerte dès 25 000 FCFA'}
                    </span>
                    <span className="hidden md:inline text-slate-700">|</span>
                    <span className="hidden md:inline text-slate-300">🔥 Ventes & Offres Solde Exclusives</span>
                </div>

                <div className="flex items-center gap-4 text-slate-300 text-[11px]">
                    <button onClick={handleShareStore} className="hover:text-white flex items-center gap-1 transition-colors">
                        {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                        <span>{copiedLink ? 'Partagé !' : 'Partager la boutique'}</span>
                    </button>
                </div>
            </motion.div>

            {/* 2. MAIN NAVBAR */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    
                    <motion.div 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex items-center gap-3 cursor-pointer shrink-0" 
                        onClick={() => scrollToSection('hero', 'all')}
                    >
                        <div 
                            className="w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-sm shadow-2xs overflow-hidden shrink-0 border border-slate-200"
                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                        >
                            {store.logo_url ? <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-5 h-5" style={{ color: primaryTextColor }} />}
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">{store.name}</h1>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{store.category || 'Boutique Officielle Certifiée'}</p>
                        </div>
                    </motion.div>

                    <nav className="hidden lg:flex items-center gap-8 text-xs font-medium">
                        <button
                            onClick={() => scrollToSection('hero', 'all')}
                            className={`transition-colors hover:text-slate-950 ${!selectedProduct && activeSectionTab === 'all' ? 'text-slate-950 border-b-2 pb-1 font-bold' : 'text-slate-600'}`}
                            style={{ borderColor: (!selectedProduct && activeSectionTab === 'all') ? primaryColor : 'transparent' }}
                        >
                            Accueil
                        </button>
                        <button
                            onClick={() => scrollToSection('section-products', 'products')}
                            className={`transition-colors hover:text-slate-950 ${!selectedProduct && activeSectionTab === 'products' ? 'text-slate-950 border-b-2 pb-1 font-bold' : 'text-slate-600'}`}
                            style={{ borderColor: (!selectedProduct && activeSectionTab === 'products') ? primaryColor : 'transparent' }}
                        >
                            Produits
                        </button>
                        <button
                            onClick={() => scrollToSection('section-promotions', 'promo')}
                            className={`transition-colors hover:text-slate-950 flex items-center gap-1 ${!selectedProduct && activeSectionTab === 'promo' ? 'text-slate-950 border-b-2 pb-1 font-bold' : 'text-slate-600'}`}
                            style={{ borderColor: (!selectedProduct && activeSectionTab === 'promo') ? primaryColor : 'transparent' }}
                        >
                            <Tag className="w-3.5 h-3.5 text-rose-500" />
                            <span>Promotions</span>
                        </button>
                        <button
                            onClick={() => scrollToSection('section-reviews', 'reviews')}
                            className={`transition-colors hover:text-slate-950 flex items-center gap-1 ${!selectedProduct && activeSectionTab === 'reviews' ? 'text-slate-950 border-b-2 pb-1 font-bold' : 'text-slate-600'}`}
                            style={{ borderColor: (!selectedProduct && activeSectionTab === 'reviews') ? primaryColor : 'transparent' }}
                        >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>Avis Clients</span>
                        </button>
                        <button
                            onClick={() => scrollToSection('section-about', 'about')}
                            className={`transition-colors hover:text-slate-950 ${!selectedProduct && activeSectionTab === 'about' ? 'text-slate-950 border-b-2 pb-1 font-bold' : 'text-slate-600'}`}
                            style={{ borderColor: (!selectedProduct && activeSectionTab === 'about') ? primaryColor : 'transparent' }}
                        >
                            À propos & Contact
                        </button>
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="w-36 sm:w-56 relative hidden sm:block">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none transition-all"
                            />
                        </div>

                        {/* FULL PAGE SHOPPING CART BUTTON */}
                        <button
                            onClick={openCartView}
                            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-2xs relative border ${
                                activeSectionTab === 'cart' 
                                    ? 'bg-slate-950 text-white border-slate-900' 
                                    : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <ShoppingCart className="w-4 h-4 text-amber-400" />
                            <span>Mon Panier</span>
                            {totalCartCount > 0 && (
                                <span 
                                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                    style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                                >
                                    {totalCartCount}
                                </span>
                            )}
                        </button>
                    </div>

                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-16">
                <AnimatePresence mode="wait">
                    
                    {/* STATE 1: FULL PAGE SHOPPING CART VIEW */}
                    {activeSectionTab === 'cart' && !selectedProduct ? (
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
                                        onClick={() => scrollToSection('section-products', 'all')} 
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
                                                        placeholder="ex: Cotonou, Haie Vive Rue 12"
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
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-full py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 border"
                                                    style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                >
                                                    <ShoppingBag className="w-4 h-4" style={{ color: primaryTextColor }} />
                                                    <span>Valider & Payer par Mobile Money ({Number(cartTotalClientTc).toLocaleString()} FCFA)</span>
                                                </motion.button>

                                                {/* REASSURANCE NOTE BELOW PAYMENT BUTTON */}
                                                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-slate-700 font-medium flex items-start gap-2.5">
                                                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                                    <div className="leading-relaxed">
                                                        <strong className="text-slate-950 font-bold block mb-0.5">Confirmation & Facturation Automatique :</strong>
                                                        Après validation de votre paiement, vous recevrez automatiquement votre reçu d'achat et facture numérique <strong className="text-slate-900 font-semibold">par Email et sur votre Numéro WhatsApp</strong>.
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
                                        onClick={() => scrollToSection('section-products', 'all')}
                                        className="px-6 py-3 rounded-xl font-bold text-xs shadow-2xs border inline-flex items-center gap-2"
                                        style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                    >
                                        <span>Explorer les Produits</span>
                                        <ArrowRight className="w-4 h-4" style={{ color: primaryTextColor }} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ) : !selectedProduct ? (
                        
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
                                id="hero" 
                                initial={{ opacity: 0, scale: 0.99 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="relative rounded-3xl bg-white overflow-hidden p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-200/90 shadow-2xs"
                            >
                                <div className="space-y-5 max-w-xl text-center md:text-left z-10">
                                    <motion.span 
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="px-3 py-1 rounded-full font-semibold text-[11px] uppercase tracking-wider inline-block shadow-2xs border border-slate-200"
                                        style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                                    >
                                        {store.hero_badge_text || 'PROMOTIONS & TENDANCES'}
                                    </motion.span>
                                    
                                    <motion.h2 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-slate-950"
                                    >
                                        {store.hero_title || 'Découvrez nos Produits d\'Exception'}
                                    </motion.h2>

                                    <motion.p 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed"
                                    >
                                        {store.hero_subtitle || 'Articles de qualité supérieure expédiés sous 24h-48h. Paiement Mobile Money direct et sécurisé.'}
                                    </motion.p>

                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="flex flex-col sm:flex-row items-center gap-3 pt-2"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => scrollToSection('section-products', 'products')}
                                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 border"
                                            style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                        >
                                            <span>{store.hero_cta_text || 'Acheter Maintenant'}</span>
                                            <ArrowRight className="w-4 h-4" style={{ color: primaryTextColor }} />
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => scrollToSection('section-about', 'about')}
                                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-all"
                                        >
                                            Découvrir la Boutique
                                        </motion.button>
                                    </motion.div>
                                </div>

                                <motion.div 
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                    className="relative w-full md:w-80 h-72 sm:h-80 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center p-3"
                                >
                                    {products && products.length > 0 && products[0].image_url ? (
                                        <img src={products[0].image_url} alt="Hero Product" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <ShoppingBag className="w-20 h-20 text-slate-300" />
                                    )}

                                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xs flex items-center justify-between">
                                        <div className="truncate">
                                            <div className="text-xs font-bold text-slate-900 truncate">{products && products[0] ? products[0].title : store.name}</div>
                                            <div className="text-xs font-semibold text-slate-900">{products && products[0] ? Number(products[0].price_display).toLocaleString() : 0} FCFA</div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded font-bold text-[10px]" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                            VEDETTE
                                        </span>
                                    </div>
                                </motion.div>
                            </motion.section>

                            {/* 2. CONFIDENCE & STATS BAR */}
                            <motion.section 
                                variants={staggerContainer}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                            >
                                {benefitsList.map((benefit, idx) => {
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

                            {/* 3. CATALOGUE PRODUITS SECTION WITH ADD TO CART & CONSULTER */}
                            <motion.section 
                                id="section-products" 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35 }}
                                className="space-y-6 scroll-mt-24"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">Nos Nouveautés & Catalogue</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Explorez tous les articles disponibles en boutique</p>
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
                                        {filteredProducts.map((product) => (
                                            <motion.div
                                                key={product.id}
                                                variants={fadeInUp}
                                                whileHover={{ y: -3 }}
                                                onClick={() => openProductDetail(product)}
                                                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between group"
                                            >
                                                <div>
                                                    <div className="h-52 bg-slate-50 relative overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
                                                        {product.image_url ? (
                                                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        ) : product.images && product.images.length > 0 ? (
                                                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        ) : (
                                                            <ShoppingBag className="w-12 h-12 text-slate-300" />
                                                        )}

                                                        {product.is_promo ? (
                                                            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md font-semibold text-[10px] shadow-2xs flex items-center gap-1 border border-slate-200" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                                                <Tag className="w-3 h-3" style={{ color: primaryTextColor }} />
                                                                <span>PROMO -{product.discount_percentage || 20}%</span>
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

                                                        <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-[#2563EB] transition-colors line-clamp-1">
                                                            {product.title}
                                                        </h3>

                                                        {product.description && (
                                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                                                {product.description}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                            <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200 flex items-center gap-1">
                                                                <Package className="w-3 h-3 text-slate-500" />
                                                                <span>Qte min: {product.min_order_quantity || 1}</span>
                                                            </div>
                                                        </div>

                                                        <div className="pt-2 border-t border-slate-100 space-y-1">
                                                            <div className="flex items-baseline justify-between gap-1 flex-wrap">
                                                                <span className="text-[11px] text-slate-400 font-medium">Prix TTC :</span>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-base font-bold text-slate-950">
                                                                        {Number(product.price_display).toLocaleString()} FCFA
                                                                    </span>
                                                                    {product.is_promo && (product.original_price_display || product.price_vendor) && (
                                                                        <span className="text-xs line-through text-rose-600 font-semibold">
                                                                            {Number(product.original_price_display || Math.ceil(product.price_vendor * 1.02)).toLocaleString()} FCFA
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {product.is_promo && (
                                                                <div className="text-[10px] text-emerald-700 font-semibold text-right">
                                                                    Économie : {Number(product.savings_display || Math.ceil((product.price_vendor - product.promo_price) * 1.02)).toLocaleString()} FCFA
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                </div>

                                                <div className="p-4 pt-0 flex items-center gap-2">
                                                    <motion.button
                                                        whileTap={{ scale: 0.96 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCart(product);
                                                        }}
                                                        className="flex-1 py-2.5 rounded-xl font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all border"
                                                        style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                    >
                                                        <ShoppingCart className="w-3.5 h-3.5" style={{ color: primaryTextColor }} />
                                                        <span>Ajouter au panier</span>
                                                    </motion.button>

                                                    <motion.button
                                                        whileTap={{ scale: 0.96 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openProductDetail(product);
                                                        }}
                                                        className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center"
                                                        title="Fiche produit"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
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
                                id="section-promotions" 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35 }}
                                className="space-y-8 scroll-mt-24 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-2xs"
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

                                    <div className="flex items-center justify-center gap-2 font-mono text-xs font-semibold pt-2">
                                        <div className="bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-center min-w-12">
                                            <div className="text-slate-950 text-sm font-bold">02</div>
                                            <div className="text-[9px] font-sans text-slate-500 font-medium">Jours</div>
                                        </div>
                                        <span className="text-slate-400 font-bold">:</span>
                                        <div className="bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-center min-w-12">
                                            <div className="text-slate-950 text-sm font-bold">15</div>
                                            <div className="text-[9px] font-sans text-slate-500 font-medium">Heures</div>
                                        </div>
                                        <span className="text-slate-400 font-bold">:</span>
                                        <div className="bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 text-center min-w-12">
                                            <div className="text-slate-950 text-sm font-bold">45</div>
                                            <div className="text-[9px] font-sans text-slate-500 font-medium">Mins</div>
                                        </div>
                                    </div>
                                </div>

                                {promoProducts.length > 0 ? (
                                    <motion.div 
                                        variants={staggerContainer}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                                    >
                                        {promoProducts.map((promoItem) => {
                                            const originalP = promoItem.original_price_display || Math.ceil(promoItem.price_vendor * 1.02);
                                            const promoP = promoItem.price_display || Math.ceil(promoItem.promo_price * 1.02);
                                            const savings = promoItem.savings_display || (originalP - promoP);
                                            const discountPct = promoItem.discount_percentage || (originalP > 0 ? Math.round((savings / originalP) * 100) : 20);

                                            return (
                                                <motion.div
                                                    key={promoItem.id}
                                                    variants={fadeInUp}
                                                    whileHover={{ y: -3 }}
                                                    onClick={() => openProductDetail(promoItem)}
                                                    className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between group"
                                                >
                                                    <div>
                                                        <div className="h-48 bg-slate-50 relative overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
                                                            {promoItem.image_url ? (
                                                                <img src={promoItem.image_url} alt={promoItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            ) : promoItem.images && promoItem.images.length > 0 ? (
                                                                <img src={promoItem.images[0]} alt={promoItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            ) : (
                                                                <ShoppingBag className="w-10 h-10 text-slate-300" />
                                                            )}

                                                            <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] shadow-2xs flex items-center gap-1">
                                                                <Flame className="w-3 h-3 fill-white" />
                                                                <span>-{discountPct}% SOLDE</span>
                                                            </div>

                                                            <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-amber-300 font-medium text-[9px] flex items-center gap-1">
                                                                <Clock className="w-2.5 h-2.5 text-amber-400" />
                                                                <span>3 jours restants</span>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 space-y-2.5">
                                                            <div className="flex items-center justify-between text-[10px]">
                                                                <div className="flex items-center gap-1 text-slate-500 font-medium truncate">
                                                                    <Store className="w-3 h-3 text-slate-400 shrink-0" />
                                                                    <span className="truncate">{store.name}</span>
                                                                </div>
                                                                <span className="text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
                                                                    SOLDE
                                                                </span>
                                                            </div>

                                                            <h3 className="font-bold text-slate-950 text-sm leading-snug group-hover:text-amber-700 transition-colors line-clamp-1">
                                                                {promoItem.title}
                                                            </h3>

                                                            {promoItem.description && (
                                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                                                    {promoItem.description}
                                                                </p>
                                                            )}

                                                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                                <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200 flex items-center gap-1">
                                                                    <Package className="w-3 h-3 text-slate-500" />
                                                                    <span>Qte min: {promoItem.min_order_quantity || 1}</span>
                                                                </div>
                                                            </div>

                                                            <div className="pt-2 border-t border-slate-100 space-y-1">
                                                                <div className="flex items-baseline justify-between gap-1 flex-wrap">
                                                                    <span className="text-[10px] text-slate-400 font-medium">Prix Solde TTC :</span>
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-base sm:text-lg font-extrabold text-slate-950">
                                                                            {Number(promoP).toLocaleString()} FCFA
                                                                        </span>
                                                                        <span className="text-xs line-through text-rose-600 font-semibold">
                                                                            {Number(originalP).toLocaleString()} FCFA
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center justify-between text-[10px] font-semibold text-rose-800">
                                                                    <span>Économie directe :</span>
                                                                    <span>-{Number(savings).toLocaleString()} FCFA (-{discountPct}%)</span>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>

                                                    <div className="p-4 pt-0 flex items-center gap-2">
                                                        <motion.button
                                                            whileTap={{ scale: 0.96 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAddToCart(promoItem);
                                                            }}
                                                            className="flex-1 py-2.5 rounded-xl font-bold text-xs shadow-2xs flex items-center justify-center gap-1 transition-all border"
                                                            style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                        >
                                                            <ShoppingCart className="w-3.5 h-3.5" style={{ color: primaryTextColor }} />
                                                            <span>Ajouter au panier</span>
                                                        </motion.button>

                                                        <motion.button
                                                            whileTap={{ scale: 0.96 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openProductDetail(promoItem);
                                                            }}
                                                            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-all flex items-center justify-center"
                                                            title="Fiche produit"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </motion.button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500 font-medium text-xs border border-slate-200">
                                        Aucun produit actuellement en promotion.
                                    </div>
                                )}
                            </motion.section>

                            {/* 5. CUSTOMER REVIEWS SECTION */}
                            <motion.section 
                                id="section-reviews" 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35 }}
                                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 space-y-8 shadow-2xs scroll-mt-24"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                                    <div>
                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 font-semibold text-[11px] border border-slate-200">
                                            ÉVALUATIONS CLIENTS
                                        </span>
                                        <h3 className="text-2xl font-bold text-slate-950 mt-2">Avis & Témoignages Vérifiés</h3>
                                        <p className="text-xs text-slate-500 font-medium">Ce que pensent les clients qui ont acheté chez {store.name}</p>
                                    </div>

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
                                                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                "{rev.comment}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>

                            {/* 6. ABOUT STORE & OWNER INFO SECTION */}
                            <motion.section 
                                id="section-about" 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35 }}
                                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 space-y-6 shadow-2xs scroll-mt-24"
                            >
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-slate-950" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                        <UserCheck className="w-5 h-5" style={{ color: primaryTextColor }} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-950">À Propos de la Boutique & du Propriétaire</h3>
                                        <p className="text-xs text-slate-500 font-medium">Boutique officielle hébergée sur BIOLINKO</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-4 max-w-full overflow-hidden">
                                        <h4 className="text-lg font-bold text-slate-900">Bienvenue chez {store.name}</h4>
                                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line break-words overflow-hidden text-ellipsis w-full max-w-full">
                                            {store.about_text || "Nous sommes spécialisés dans la fourniture d'articles de haute qualité, soigneusement sélectionnés pour vous offrir la meilleure expérience d'achat. Nos expéditions sont rapides et nos transactions sont 100% sécurisées."}
                                        </p>

                                        <div className="space-y-2 pt-2">
                                            <div className="text-xs font-bold text-slate-900">Suivez-nous sur les Réseaux Sociaux :</div>
                                            <div className="flex items-center gap-3 pt-1 flex-wrap">
                                                {store.instagram_link && (
                                                    <a href={store.instagram_link} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                                        <svg className="w-4 h-4 text-pink-600 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                                        <span>Instagram</span>
                                                    </a>
                                                )}
                                                {store.facebook_link && (
                                                    <a href={store.facebook_link} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                                        <svg className="w-4 h-4 text-blue-600 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.714 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
                                                        <span>Facebook</span>
                                                    </a>
                                                )}
                                                {store.tiktok_link && (
                                                    <a href={store.tiktok_link} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                                        <Play className="w-4 h-4 text-slate-900 fill-slate-900" />
                                                        <span>TikTok</span>
                                                    </a>
                                                )}
                                                {store.phone_whatsapp && (
                                                    <a href={`https://wa.me/${store.phone_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                                        <MessageSquare className="w-4 h-4 fill-white" />
                                                        <span>WhatsApp</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
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
                                                <span>Localisation : <strong>{store.location_address || store.city_location || 'Cotonou, Bénin (Expédition Nationale)'}</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* 7. TRUST & REASSURANCE SECTION */}
                            <motion.section 
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35 }}
                                className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-6"
                            >
                                <div className="text-center space-y-2 max-w-xl mx-auto">
                                    <span className="px-3 py-1 rounded-full text-slate-950 font-bold text-xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                        SÉCURITÉ & TRANSPARENCE
                                    </span>
                                    <h3 className="text-2xl font-bold tracking-tight">Achetez en Toute Confiance</h3>
                                    <p className="text-xs text-slate-400 font-medium">Paiement Mobile Money instantané et suivi de commande digital</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2 text-xs font-medium">
                                    <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                                        <div className="font-bold flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <ShieldCheck className="w-4 h-4" /> 1. USSD Mobile Money Direct
                                        </div>
                                        <p className="text-slate-400">Validation instantanée sur votre téléphone avec MTN, Moov ou Orange Money.</p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                                        <div className="font-bold flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <FileText className="w-4 h-4" /> 2. Reçu & Facture Numérique
                                        </div>
                                        <p className="text-slate-400">Génération immédiate d'un reçu d'achat imprimable après paiement.</p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
                                        <div className="font-bold flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Truck className="w-4 h-4" /> 3. Code de Suivi Unique
                                        </div>
                                        <p className="text-slate-400">Suivez l'acheminement de votre colis à tout moment avec votre code de suivi.</p>
                                    </div>
                                </div>
                            </motion.section>
                        </motion.div>
                    ) : (
                        
                        /* STATE 3: DEDICATED PRODUCT DETAIL VIEW */
                        <motion.div
                            key="product-detail"
                            initial={{ opacity: 0, scale: 0.98, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -15 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-14"
                        >
                            {/* Breadcrumbs */}
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                <motion.button 
                                    whileHover={{ x: -2 }}
                                    onClick={() => setSelectedProduct(null)} 
                                    className="hover:text-slate-950 flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Accueil Vitrine
                                </motion.button>
                                <span>/</span>
                                <span className="text-slate-600">Détail Produit</span>
                                <span>/</span>
                                <span className="text-slate-950 font-semibold">{selectedProduct.title}</span>
                            </div>

                            {/* Primary Product Main Box */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                
                                <div className="space-y-4">
                                    <div className="h-96 sm:h-[460px] rounded-3xl bg-[#EFEFEF] overflow-hidden relative flex items-center justify-center border border-slate-200/80 shadow-2xs">
                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={selectedImageIndex}
                                                initial={{ opacity: 0, scale: 0.96 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                src={selectedProduct.images && selectedProduct.images.length > 0 ? (selectedProduct.images[selectedImageIndex] || selectedProduct.image_url) : selectedProduct.image_url}
                                                alt={selectedProduct.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </AnimatePresence>

                                        {selectedProduct.is_promo && (
                                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full font-semibold text-xs shadow-2xs border border-slate-200" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                                PROMO
                                            </div>
                                        )}
                                    </div>

                                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                                            {selectedProduct.images.map((img, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setSelectedImageIndex(idx)}
                                                    className={`w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                                                        selectedImageIndex === idx ? 'border-slate-900 scale-105 shadow-2xs' : 'border-transparent opacity-70 hover:opacity-100'
                                                    }`}
                                                >
                                                    <img src={img} alt="Miniature" className="w-full h-full object-cover" />
                                                </motion.button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        
                                        <span className="px-3 py-1 rounded-full bg-[#F5F5F5] text-slate-600 font-medium text-xs inline-block">
                                            Collection Officielle
                                        </span>

                                        <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight leading-tight">
                                            {selectedProduct.title}
                                        </h2>

                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-semibold text-slate-900">
                                                {Number(itemUnitPricePb).toLocaleString()} FCFA
                                            </span>
                                            {selectedProduct.is_promo && (selectedProduct.original_price_display || selectedProduct.price_vendor) && (
                                                <span className="text-lg line-through text-rose-600 font-semibold">
                                                    {Number(selectedProduct.original_price_display || Math.ceil(selectedProduct.price_vendor * 1.02)).toLocaleString()} FCFA
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-3 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-700 shrink-0" />
                                            <span>Commandez sous 02:30:25 pour être livré dès demain à domicile</span>
                                        </div>

                                        {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                                            <div className="space-y-2 pt-2">
                                                <label className="block text-xs font-medium text-slate-500">Sélectionner Variante / Taille</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProduct.variants.map((v) => (
                                                        <button
                                                            key={v.id}
                                                            type="button"
                                                            onClick={() => setSelectedVariant(v)}
                                                            className={`h-11 min-w-11 px-4 rounded-full text-xs font-medium transition-all flex items-center justify-center ${
                                                                selectedVariant?.id === v.id
                                                                    ? 'bg-slate-950 text-white shadow-2xs font-semibold'
                                                                    : 'bg-[#F5F5F5] text-slate-800 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            {v.size || v.color}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2 pt-2">
                                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                                <span>Quantité à Commander</span>
                                                <span className="text-slate-800 font-bold">Qte min obligatoire: {selectedProduct.min_order_quantity || 1}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuantityChangeInDetail(quantity - 1)}
                                                        className="w-8 h-8 rounded-full bg-white font-semibold text-slate-800 shadow-2xs flex items-center justify-center"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-12 text-center font-semibold text-slate-950 text-xs">{quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuantityChangeInDetail(quantity + 1)}
                                                        className="w-8 h-8 rounded-full bg-white font-semibold text-slate-800 shadow-2xs flex items-center justify-center"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleAddToCart(selectedProduct, quantity, selectedVariant)}
                                                className="w-full sm:w-1/2 py-3.5 rounded-full bg-slate-950 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                                            >
                                                <ShoppingCart className="w-4 h-4 text-amber-400" />
                                                <span>Ajouter au Panier</span>
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleInstantBuyProduct(selectedProduct, quantity, selectedVariant)}
                                                className="w-full sm:w-1/2 py-3.5 rounded-full font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 border"
                                                style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                            >
                                                <ShoppingBag className="w-4 h-4" style={{ color: primaryTextColor }} />
                                                <span>Acheter maintenant</span>
                                            </motion.button>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* SECTION A: PRODUCT REVIEWS & RATING IN DETAIL VIEW */}
                            <div className="pt-12 border-t border-slate-200 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
                                    <div>
                                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 font-semibold text-[11px] border border-slate-200">
                                            ÉVALUATIONS PRODUIT
                                        </span>
                                        <h3 className="text-xl font-bold text-slate-950 mt-2">Avis Clients & Note du Produit</h3>
                                        <p className="text-xs text-slate-500 font-medium">Témoignages vérifiés d'acheteurs ayant commandé cet article</p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-slate-950">4.8</div>
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
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {reviewsList.slice(0, 3).map((rev, idx) => (
                                        <div key={rev.id || idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5 shadow-2xs">
                                            <div className="flex items-center justify-between">
                                                <div className="font-bold text-xs text-slate-950">{rev.customer_name} ({rev.customer_city || 'Cotonou'})</div>
                                                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Acheteur Vérifié</span>
                                            </div>
                                            <div className="flex text-amber-400">
                                                {[...Array(rev.rating || 5)].map((_, i) => (
                                                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                "{rev.comment}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SECTION B: 4 OTHER PRODUCTS OF THE STORE WITH "CONSULTER" BUTTON */}
                            {relatedProducts.length > 0 && (
                                <div className="pt-10 border-t border-slate-200 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-950 tracking-tight">Autres Produits de la Boutique</h3>
                                            <p className="text-xs text-slate-500 font-medium">Découvrez d'autres articles susceptibles de vous plaire</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedProduct(null)}
                                            className="text-xs font-bold text-slate-900 hover:text-[#2563EB] flex items-center gap-1"
                                        >
                                            <span>Voir tout le catalogue</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                        {relatedProducts.map((relProduct) => (
                                            <div key={relProduct.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
                                                <div>
                                                    <div className="h-48 bg-slate-50 relative overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
                                                        {relProduct.image_url ? (
                                                            <img src={relProduct.image_url} alt={relProduct.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        ) : relProduct.images && relProduct.images.length > 0 ? (
                                                            <img src={relProduct.images[0]} alt={relProduct.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                        ) : (
                                                            <ShoppingBag className="w-10 h-10 text-slate-300" />
                                                        )}

                                                        {relProduct.is_promo && (
                                                            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded font-semibold text-[9px] shadow-2xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                                                PROMO
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-4 space-y-2">
                                                        <h4 className="font-semibold text-slate-900 text-xs line-clamp-1 group-hover:text-[#2563EB] transition-colors">
                                                            {relProduct.title}
                                                        </h4>
                                                        <div className="text-sm font-bold text-slate-950">
                                                            {Number(relProduct.price_display).toLocaleString()} FCFA
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 pt-0 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddToCart(relProduct)}
                                                        className="flex-1 py-2 rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center gap-1 border"
                                                        style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                                    >
                                                        <ShoppingCart className="w-3.5 h-3.5" style={{ color: primaryTextColor }} />
                                                        <span>Ajouter</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => openProductDetail(relProduct)}
                                                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs transition-all flex items-center justify-center border border-slate-200"
                                                        title="Fiche produit"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-slate-700" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* GLOBAL FOOTER */}
            <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-8 mt-16 text-slate-600 text-xs">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl font-semibold flex items-center justify-center text-xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                <Store className="w-4 h-4" style={{ color: primaryTextColor }} />
                            </div>
                            <span className="font-bold text-slate-950 text-base">{store.name}</span>
                        </div>
                        <p className="text-slate-500 leading-relaxed font-medium">
                            Boutique e-commerce officielle. Tous les produits sont authentiques et expédiés sous 24h-48h avec paiement Mobile Money sécurisé.
                        </p>
                    </div>

                    <div className="space-y-2.5">
                        <h4 className="font-bold text-slate-950 uppercase text-xs">Navigation Boutique</h4>
                        <ul className="space-y-2 font-medium">
                            <li><button onClick={() => scrollToSection('hero', 'all')} className="hover:text-slate-950">Accueil Boutique</button></li>
                            <li><button onClick={() => scrollToSection('section-products', 'products')} className="hover:text-slate-950">Catalogue Produits</button></li>
                            <li><button onClick={() => scrollToSection('section-promotions', 'promo')} className="hover:text-slate-950">Promotions</button></li>
                            <li><button onClick={() => scrollToSection('section-reviews', 'reviews')} className="hover:text-slate-950">Avis Clients</button></li>
                            <li><button onClick={() => scrollToSection('section-about', 'about')} className="hover:text-slate-950">À propos & Contact</button></li>
                        </ul>
                    </div>

                    <div className="space-y-2.5">
                        <h4 className="font-bold text-slate-950 uppercase text-xs">Modes de Paiement Acceptés</h4>
                        <div className="flex flex-wrap gap-2 pt-1 font-medium">
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">MTN Mobile Money</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">Moov Money</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">Orange Money</span>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <h4 className="font-bold text-slate-950 uppercase text-xs">Contact Vendeur Direct</h4>
                        {store.phone_whatsapp && (
                            <div className="text-slate-900 font-bold flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4 text-emerald-600" />
                                <span>{store.phone_whatsapp}</span>
                            </div>
                        )}
                        <p className="text-slate-400 font-medium">Assistance client disponible 7j/7</p>
                    </div>

                </div>

                <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 font-medium text-[11px]">
                    <div>© {new Date().getFullYear()} {store.name}. Tous droits réservés.</div>
                    <div className="text-slate-500 font-semibold flex items-center gap-1">
                        <span>Propulsé avec passion par</span>
                        <span className="font-bold px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>BIOLINKO SaaS</span>
                    </div>
                </div>
            </footer>

            {/* REAL-TIME HR-SKILLS PAY USSD PAYMENT MODAL */}
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
                                        Veuillez composer votre code secret PIN Mobile Money sur votre téléphone portable pour valider le règlement de <strong className="text-slate-950 font-bold">{Number(ussdModalState.amount).toLocaleString()} FCFA</strong>.
                                    </p>
                                    <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Vérification automatique du paiement...</span>
                                    </div>
                                </div>
                            )}

                            {ussdModalState.status === 'SUCCESS' && (
                                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                                    <h4 className="text-sm font-bold text-emerald-950">Paiement Mobile Money Confirmé !</h4>
                                    <p className="text-xs text-emerald-700">Redirection vers votre reçu de commande...</p>
                                </div>
                            )}

                            {ussdModalState.status === 'FAILED' && (
                                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                                    <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                                    <h4 className="text-sm font-bold text-rose-950">Paiement Échoué ou Expiré</h4>
                                    <p className="text-xs text-rose-700">{ussdModalState.errorMsg || 'La transaction n\'a pas été validée sur votre téléphone.'}</p>
                                    <button
                                        type="button"
                                        onClick={() => setUssdModalState(prev => ({ ...prev, isOpen: false }))}
                                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800"
                                    >
                                        Réessayer la commande
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
