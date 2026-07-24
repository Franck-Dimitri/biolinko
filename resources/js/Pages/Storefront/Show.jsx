import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShoppingBag, ShieldCheck, CheckCircle, ArrowRight, X, 
    Share2, Truck, Lock, MessageSquare, Star, Heart, ChevronDown, ChevronUp, 
    Package, Sparkles, AlertCircle, Clock, MapPin, Tag, Check, Search, 
    Store, ChevronRight, HelpCircle, ArrowLeft, Percent, Calendar, PhoneCall,
    Award, Shield, FileText, CheckCircle2, Factory, Globe, BadgeCheck,
    RefreshCw, Headphones, UserCheck, Play, Flame
} from 'lucide-react';

export default function Show({ store, products, initialSelectedProductId, appUrl }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isCheckoutDrawerOpen, setIsCheckoutDrawerOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSectionTab, setActiveSectionTab] = useState('all'); // 'all', 'products', 'promo', 'reviews', 'about'

    // Fast USSD Checkout Form
    const { data, setData, post, processing, errors, reset } = useForm({
        store_id: store.id,
        product_id: '',
        variant_id: '',
        quantity: 1,
        customer_name: '',
        customer_phone: '',
        delivery_address: '',
        notes: '',
    });

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

        setData(prev => ({
            ...prev,
            product_id: product.id,
            quantity: minQ,
            variant_id: product.variants && product.variants.length > 0 ? product.variants[0].id : '',
        }));

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

    const handleOpenCheckout = () => {
        if (!selectedProduct) return;
        setIsCheckoutDrawerOpen(true);
    };

    const handleQuantityChange = (newQ) => {
        const minQ = selectedProduct?.min_order_quantity || 1;
        if (newQ < minQ) return;
        setQuantity(newQ);
        setData('quantity', newQ);
    };

    const handleCheckoutSubmit = (e) => {
        e.preventDefault();
        post(route('checkout.store'), {
            onSuccess: () => {
                setIsCheckoutDrawerOpen(false);
                reset();
            },
        });
    };

    const handleShareStore = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    // Calculate price for selected product
    const currentPv = selectedProduct ? ((selectedProduct.is_promo && selectedProduct.promo_price) ? parseFloat(selectedProduct.promo_price) : parseFloat(selectedProduct.price_vendor)) : 0;
    const itemUnitPricePb = Math.ceil(currentPv * 1.02);
    const subtotalPb = itemUnitPricePb * quantity;
    const totalClientTc = Math.ceil(subtotalPb / 0.98);
    const momoFee = totalClientTc - subtotalPb;

    // Filter products
    const filteredProducts = products ? products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeSectionTab === 'promo') return matchesSearch && (p.is_promo && p.promo_price);
        return matchesSearch;
    }) : [];

    const promoProducts = products ? products.filter(p => p.is_promo && p.promo_price) : [];

    // Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans antialiased selection:bg-[#FFCC00] selection:text-slate-950">
            <Head title={`${selectedProduct ? selectedProduct.title : store.name} — Vitrine Officielle`} />

            {/* 1. TOP ANNOUNCEMENT BAR */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-950 text-white text-[11px] font-medium py-2 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800"
            >
                <div className="flex items-center gap-4 mx-auto sm:mx-0">
                    <span className="flex items-center gap-1.5 text-[#FFCC00]">
                        <Truck className="w-3.5 h-3.5 text-[#FFCC00]" /> Livraison Offerte dès 25 000 FCFA
                    </span>
                    <span className="hidden md:inline text-slate-700">|</span>
                    <span className="hidden md:inline text-slate-300">🔥 Offres Solde Exclusives</span>
                </div>

                <div className="flex items-center gap-4 text-slate-300 text-[11px]">
                    <button onClick={handleShareStore} className="hover:text-[#FFCC00] flex items-center gap-1 transition-colors">
                        {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                        <span>{copiedLink ? 'Partagé !' : 'Partager la boutique'}</span>
                    </button>
                </div>
            </motion.div>

            {/* 2. MAIN NAVBAR WITH STICKY MOTION */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 transition-all">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 cursor-pointer shrink-0" 
                        onClick={() => scrollToSection('hero', 'all')}
                    >
                        <div className="w-10 h-10 rounded-2xl bg-[#FFCC00] text-slate-950 font-bold flex items-center justify-center text-sm shadow-2xs overflow-hidden shrink-0 border border-amber-300">
                            {store.logo_url ? <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-slate-950" />}
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight leading-none">{store.name}</h1>
                            <p className="text-[11px] text-amber-800 font-medium mt-0.5">Boutique Officielle Certifiée</p>
                        </div>
                    </motion.div>

                    <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold">
                        <button
                            onClick={() => scrollToSection('hero', 'all')}
                            className={`transition-colors hover:text-amber-700 ${!selectedProduct && activeSectionTab === 'all' ? 'text-amber-900 border-b-2 border-[#FFCC00] pb-1 font-bold' : 'text-slate-600'}`}
                        >
                            Accueil
                        </button>
                        <button
                            onClick={() => scrollToSection('section-products', 'products')}
                            className={`transition-colors hover:text-amber-700 ${!selectedProduct && activeSectionTab === 'products' ? 'text-amber-900 border-b-2 border-[#FFCC00] pb-1 font-bold' : 'text-slate-600'}`}
                        >
                            Produits
                        </button>
                        <button
                            onClick={() => scrollToSection('section-promotions', 'promo')}
                            className={`transition-colors hover:text-amber-700 flex items-center gap-1 ${!selectedProduct && activeSectionTab === 'promo' ? 'text-amber-900 border-b-2 border-[#FFCC00] pb-1 font-bold' : 'text-slate-600'}`}
                        >
                            <Tag className="w-3.5 h-3.5 text-rose-500" />
                            <span>Promotions</span>
                        </button>
                        <button
                            onClick={() => scrollToSection('section-reviews', 'reviews')}
                            className={`transition-colors hover:text-amber-700 flex items-center gap-1 ${!selectedProduct && activeSectionTab === 'reviews' ? 'text-amber-900 border-b-2 border-[#FFCC00] pb-1 font-bold' : 'text-slate-600'}`}
                        >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>Avis Clients</span>
                        </button>
                        <button
                            onClick={() => scrollToSection('section-about', 'about')}
                            className={`transition-colors hover:text-amber-700 ${!selectedProduct && activeSectionTab === 'about' ? 'text-amber-900 border-b-2 border-[#FFCC00] pb-1 font-bold' : 'text-slate-600'}`}
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
                                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none transition-all"
                            />
                        </div>

                        <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs font-semibold text-slate-950">
                            <ShoppingBag className="w-4 h-4 text-amber-900" />
                            <span>{products ? products.length : 0} article(s)</span>
                        </div>
                    </div>

                </div>
            </header>

            {/* MAIN CONTENT AREA WITH ANIMATE PRESENCE FOR PAGE SWITCHING */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-16">
                <AnimatePresence mode="wait">
                    {!selectedProduct ? (
                        <motion.div
                            key="store-home"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-16"
                        >
                            {/* 1. HERO BANNER SECTION */}
                            <motion.section 
                                id="hero" 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="relative rounded-3xl bg-slate-900 text-white overflow-hidden p-6 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800 shadow-sm"
                            >
                                <div className="space-y-5 max-w-xl text-center md:text-left z-10">
                                    <motion.span 
                                        initial={{ opacity: 0, x: -15 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="px-3 py-1 rounded-full bg-[#FFCC00] text-slate-950 font-bold text-[11px] uppercase tracking-wider inline-block"
                                    >
                                        PROMOTIONS & TENDANCES
                                    </motion.span>
                                    
                                    <motion.h2 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white"
                                    >
                                        Découvrez nos Produits d'Exception
                                    </motion.h2>

                                    <motion.p 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed"
                                    >
                                        Articles de qualité supérieure expédiés sous 24h-48h. Paiement Mobile Money direct et sécurisé.
                                    </motion.p>

                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="flex flex-col sm:flex-row items-center gap-3 pt-2"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => scrollToSection('section-products', 'products')}
                                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>Acheter Maintenant</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => scrollToSection('section-about', 'about')}
                                            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
                                        >
                                            Découvrir la Boutique
                                        </motion.button>
                                    </motion.div>
                                </div>

                                <motion.div 
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                    className="relative w-full md:w-80 h-72 sm:h-80 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 shadow-md flex items-center justify-center p-3"
                                >
                                    {products && products.length > 0 && products[0].image_url ? (
                                        <img src={products[0].image_url} alt="Hero Product" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <ShoppingBag className="w-20 h-20 text-slate-600" />
                                    )}

                                    <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center justify-between">
                                        <div className="truncate">
                                            <div className="text-xs font-bold text-white truncate">{products && products[0] ? products[0].title : store.name}</div>
                                            <div className="text-xs font-semibold text-[#FFCC00]">{products && products[0] ? Number(products[0].price_display).toLocaleString() : 0} FCFA</div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded bg-[#FFCC00] text-slate-950 font-bold text-[10px]">
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
                                <motion.div variants={fadeInUp} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center shrink-0">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-950">Livraison Express</div>
                                        <div className="text-[11px] text-slate-500 font-medium">Sous 24h à 48h à domicile</div>
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeInUp} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-950">Paiements Sécurisés MoMo</div>
                                        <div className="text-[11px] text-slate-500 font-medium">Notification Push USSD 30s</div>
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeInUp} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center shrink-0">
                                        <RefreshCw className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-950">Satisfait ou Remboursé</div>
                                        <div className="text-[11px] text-slate-500 font-medium">Politique de retour 14 jours</div>
                                    </div>
                                </motion.div>

                                <motion.div variants={fadeInUp} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:shadow-xs transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center shrink-0">
                                        <Headphones className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-950">Support WhatsApp 7j/7</div>
                                        <div className="text-[11px] text-slate-500 font-medium">Contact direct avec le vendeur</div>
                                    </div>
                                </motion.div>
                            </motion.section>

                            {/* 3. CATALOGUE PRODUITS SECTION WITH STAGGERED MOTION CARDS */}
                            <motion.section 
                                id="section-products" 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
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
                                                whileHover={{ y: -4, scale: 1.01 }}
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
                                                            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-[#FFCC00] text-slate-950 font-bold text-[10px] shadow-2xs flex items-center gap-1 border border-amber-300">
                                                                <Tag className="w-3 h-3" />
                                                                <span>PROMO -{product.discount_percentage || 20}%</span>
                                                            </div>
                                                        ) : (
                                                            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                                                                EN STOCK
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-4 space-y-2.5">
                                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                                                            <Store className="w-3 h-3 text-amber-600 shrink-0" />
                                                            <span className="truncate">{store.name}</span>
                                                        </div>

                                                        <h3 className="font-semibold text-slate-900 text-sm leading-snug group-hover:text-amber-700 transition-colors line-clamp-1">
                                                            {product.title}
                                                        </h3>

                                                        {product.description && (
                                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                                                                {product.description}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                                                            <div className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 text-[10px] font-medium border border-amber-200/60 flex items-center gap-1">
                                                                <Package className="w-3 h-3 text-amber-600" />
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
                                                                        <span className="text-xs line-through text-rose-600 font-bold">
                                                                            {Number(product.original_price_display || Math.ceil(product.price_vendor * 1.02)).toLocaleString()} FCFA
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {product.is_promo && (
                                                                <div className="text-[10px] text-emerald-700 font-bold text-right">
                                                                    Économie : {Number(product.savings_display || Math.ceil((product.price_vendor - product.promo_price) * 1.02)).toLocaleString()} FCFA
                                                                </div>
                                                            )}
                                                        </div>

                                                    </div>
                                                </div>

                                                <div className="p-4 pt-0">
                                                    <motion.button
                                                        whileTap={{ scale: 0.96 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openProductDetail(product);
                                                        }}
                                                        className="w-full py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all border border-amber-300"
                                                    >
                                                        <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
                                                        <span>Acheter</span>
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

                            {/* 4. PROMOTIONS SECTION WITH FLUID ENTRY MOTION */}
                            <motion.section 
                                id="section-promotions" 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                                className="space-y-8 scroll-mt-24 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-2xs"
                            >
                                <div className="text-center max-w-2xl mx-auto space-y-3">
                                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200">
                                        <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                                        <span>VENTES FLASH & OFFRES SOLDE</span>
                                    </div>
                                    
                                    <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                        Promotions Exclusives du Moment
                                    </h3>

                                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                        Profitez de remises immédiates avec livraison rapide et paiement Mobile Money sécurisé !
                                    </p>

                                    <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold pt-2">
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
                                                    whileHover={{ y: -4, scale: 1.01 }}
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

                                                            <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-xs text-amber-300 font-medium text-[9px] flex items-center gap-1">
                                                                <Clock className="w-2.5 h-2.5 text-amber-400" />
                                                                <span>3 jours restants</span>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 space-y-2.5">
                                                            <div className="flex items-center justify-between text-[10px]">
                                                                <div className="flex items-center gap-1 text-slate-500 font-medium truncate">
                                                                    <Store className="w-3 h-3 text-amber-600 shrink-0" />
                                                                    <span className="truncate">{store.name}</span>
                                                                </div>
                                                                <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
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
                                                                <div className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 text-[10px] font-medium border border-amber-200/60 flex items-center gap-1">
                                                                    <Package className="w-3 h-3 text-amber-600" />
                                                                    <span>Qte min: {promoItem.min_order_quantity || 1}</span>
                                                                </div>
                                                            </div>

                                                            <div className="pt-2 border-t border-slate-100 space-y-1">
                                                                <div className="flex items-baseline justify-between gap-1 flex-wrap">
                                                                    <span className="text-[10px] text-slate-400 font-medium">Nouveau Prix Solde :</span>
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-base sm:text-lg font-extrabold text-slate-950">
                                                                            {Number(promoP).toLocaleString()} FCFA
                                                                        </span>
                                                                        <span className="text-xs line-through text-rose-600 font-bold">
                                                                            {Number(originalP).toLocaleString()} FCFA
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center justify-between text-[10px] font-bold text-rose-800">
                                                                    <span>Économie directe :</span>
                                                                    <span>-{Number(savings).toLocaleString()} FCFA (-{discountPct}%)</span>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>

                                                    <div className="p-4 pt-0">
                                                        <motion.button
                                                            whileTap={{ scale: 0.96 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openProductDetail(promoItem);
                                                            }}
                                                            className="w-full py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-2xs flex items-center justify-center gap-1 transition-all border border-amber-300"
                                                        >
                                                            <ShoppingBag className="w-3.5 h-3.5 text-slate-950" />
                                                            <span>Acheter en Solde</span>
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
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 space-y-8 shadow-2xs scroll-mt-24"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
                                    <div>
                                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200">
                                            ÉVALUATIONS CLIENTS
                                        </span>
                                        <h3 className="text-2xl font-bold text-slate-950 mt-2">Avis & Témoignages Vérifiés</h3>
                                        <p className="text-xs text-slate-500 font-medium">Ce que pensent les clients qui ont acheté chez {store.name}</p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                        <div className="text-center">
                                            <div className="text-4xl font-extrabold text-slate-950">4.8</div>
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
                                            <div className="text-emerald-600 font-bold">128 Avis Positifs</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-xs transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-xs text-slate-950">Armand K. (Cotonou)</div>
                                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Acheteur Vérifié</span>
                                        </div>
                                        <div className="flex text-amber-400">
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                            "Commande livrée en moins de 24h. La qualité des produits est impressionnante et le paiement USSD est d'une simplicité folle."
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-xs transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-xs text-slate-950">Bernice T. (Porto-Novo)</div>
                                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Acheteur Vérifié</span>
                                        </div>
                                        <div className="flex text-amber-400">
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                            "Le vendeur est très réactif sur WhatsApp. J'ai reçu ma facture numérique immédiatement après avoir validé mon MoMo."
                                        </p>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 hover:shadow-xs transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-xs text-slate-950">Chantal D. (Parakou)</div>
                                            <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Acheteur Vérifié</span>
                                        </div>
                                        <div className="flex text-amber-400">
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                            "Excellente expérience d'achat. Le code de suivi m'a permis de suivre le colis en temps réel jusqu'à mon domicile."
                                        </p>
                                    </div>
                                </div>
                            </motion.section>

                            {/* 6. ABOUT STORE & OWNER INFO SECTION */}
                            <motion.section 
                                id="section-about" 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                                className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 space-y-6 shadow-2xs scroll-mt-24"
                            >
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <div className="w-10 h-10 rounded-2xl bg-[#FFCC00] flex items-center justify-center text-slate-950 font-bold">
                                        <UserCheck className="w-5 h-5 text-slate-950" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-950">À Propos de la Boutique & du Propriétaire</h3>
                                        <p className="text-xs text-slate-500 font-medium">Boutique officielle hébergée sur BIOLINKO</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <h4 className="text-lg font-bold text-slate-900">Bienvenue chez {store.name}</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                            {store.about_text || "Nous sommes spécialisés dans la fourniture d'articles de haute qualité, soigneusement sélectionnés pour vous offrir la meilleure expérience d'achat. Nos expéditions sont rapides et nos transactions sont 100% sécurisées."}
                                        </p>

                                        <div className="space-y-2 pt-2">
                                            <div className="text-xs font-bold text-slate-900">Suivez-nous sur les Réseaux Sociaux :</div>
                                            <div className="flex items-center gap-3 pt-1 flex-wrap">
                                                <a href="#" className="p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                                    <svg className="w-4 h-4 text-pink-600 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                                    <span>Instagram</span>
                                                </a>
                                                <a href="#" className="p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                                    <svg className="w-4 h-4 text-blue-600 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.714 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/></svg>
                                                    <span>Facebook</span>
                                                </a>
                                                <a href="#" className="p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                                    <Play className="w-4 h-4 text-slate-900 fill-slate-900" />
                                                    <span>TikTok</span>
                                                </a>
                                                {store.phone && (
                                                    <a href={`https://wa.me/${store.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold">
                                                        <MessageSquare className="w-4 h-4 fill-white" />
                                                        <span>WhatsApp</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                                        <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Identité & Contact Vendeur</h4>
                                        <div className="space-y-2 text-xs text-slate-700 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Store className="w-4 h-4 text-amber-600" />
                                                <span>Nom de Boutique : <strong className="text-slate-950 font-bold">{store.name}</strong></span>
                                            </div>
                                            {store.phone && (
                                                <div className="flex items-center gap-2">
                                                    <PhoneCall className="w-4 h-4 text-amber-600" />
                                                    <span>Téléphone Direct : <strong className="text-slate-950 font-bold">{store.phone}</strong></span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-amber-600" />
                                                <span>Localisation : <strong>Cotonou, Bénin (Expédition Nationale)</strong></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>

                            {/* 7. TRUST & REASSURANCE SECTION */}
                            <motion.section 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4 }}
                                className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white space-y-6"
                            >
                                <div className="text-center space-y-2 max-w-xl mx-auto">
                                    <span className="px-3 py-1 rounded-full bg-[#FFCC00] text-slate-950 font-bold text-xs">
                                        SÉCURITÉ & TRANSPARENCE
                                    </span>
                                    <h3 className="text-2xl font-bold tracking-tight">Achetez en Toute Confiance</h3>
                                    <p className="text-xs text-slate-400 font-medium">Paiement Mobile Money instantané et suivi de commande digital</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2 text-xs font-medium">
                                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                                        <div className="text-[#FFCC00] font-bold flex items-center gap-1.5">
                                            <ShieldCheck className="w-4 h-4" /> 1. USSD Mobile Money Direct
                                        </div>
                                        <p className="text-slate-400">Validation instantanée sur votre téléphone avec MTN, Moov ou Orange Money.</p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                                        <div className="text-[#FFCC00] font-bold flex items-center gap-1.5">
                                            <FileText className="w-4 h-4" /> 2. Reçu & Facture Numérique
                                        </div>
                                        <p className="text-slate-400">Génération immédiate d'un reçu d'achat imprimable après paiement.</p>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                                        <div className="text-[#FFCC00] font-bold flex items-center gap-1.5">
                                            <Truck className="w-4 h-4" /> 3. Code de Suivi Unique
                                        </div>
                                        <p className="text-slate-400">Suivez l'acheminement de votre colis à tout moment avec votre code de suivi.</p>
                                    </div>
                                </div>
                            </motion.section>
                        </motion.div>
                    ) : (
                        
                        /* CASE B: DEDICATED PRODUCT DETAIL PAGE WITH SMOOTH ANIMATION */
                        <motion.div
                            key="product-detail"
                            initial={{ opacity: 0, scale: 0.98, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -15 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="space-y-12"
                        >
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                                <motion.button 
                                    whileHover={{ x: -2 }}
                                    onClick={() => setSelectedProduct(null)} 
                                    className="hover:text-slate-950 flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Home
                                </motion.button>
                                <span>/</span>
                                <span className="text-slate-600">Product details</span>
                                <span>/</span>
                                <span className="text-slate-950 font-semibold">{selectedProduct.title}</span>
                            </div>

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
                                            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#FFCC00] text-slate-950 font-semibold text-xs shadow-2xs border border-amber-300">
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
                                                        selectedImageIndex === idx ? 'border-[#FFCC00] scale-105 shadow-2xs' : 'border-transparent opacity-70 hover:opacity-100'
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
                                                <span className="text-lg line-through text-rose-600 font-bold">
                                                    {Number(selectedProduct.original_price_display || Math.ceil(selectedProduct.price_vendor * 1.02)).toLocaleString()} FCFA
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-3 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                                            <span>Commandez sous 02:30:25 pour être livré dès demain à domicile</span>
                                        </div>

                                        {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                                            <div className="space-y-2 pt-2">
                                                <label className="block text-xs font-medium text-slate-500">Select Size / Variant</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProduct.variants.map((v) => (
                                                        <button
                                                            key={v.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedVariant(v);
                                                                setData('variant_id', v.id);
                                                            }}
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
                                                <span className="text-amber-800">Qte min: {selectedProduct.min_order_quantity || 1}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuantityChange(quantity - 1)}
                                                        className="w-8 h-8 rounded-full bg-white font-semibold text-slate-800 shadow-2xs"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="w-12 text-center font-semibold text-slate-950 text-xs">{quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuantityChange(quantity + 1)}
                                                        className="w-8 h-8 rounded-full bg-white font-semibold text-slate-800 shadow-2xs"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center gap-3">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={handleOpenCheckout}
                                                className="flex-1 py-4 rounded-full bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-amber-300"
                                            >
                                                <ShoppingBag className="w-5 h-5" />
                                                <span>Acheter maintenant</span>
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleShareStore}
                                                className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                                                title="Favori / Partager"
                                            >
                                                <Heart className="w-5 h-5" />
                                            </motion.button>
                                        </div>

                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* GLOBAL FOOTER */}
            <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-8 mt-16 text-slate-600 text-xs">
                <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-[#FFCC00] text-slate-950 font-semibold flex items-center justify-center text-xs">
                                <Store className="w-4 h-4" />
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
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">MTN Mobile Money</span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">Moov Money</span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">Orange Money</span>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <h4 className="font-bold text-slate-950 uppercase text-xs">Contact Vendeur Direct</h4>
                        {store.phone && (
                            <div className="text-slate-900 font-bold flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4 text-emerald-600" />
                                <span>{store.phone}</span>
                            </div>
                        )}
                        <p className="text-slate-400 font-medium">Assistance client disponible 7j/7</p>
                    </div>

                </div>

                <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 font-medium text-[11px]">
                    <div>© {new Date().getFullYear()} {store.name}. Tous droits réservés.</div>
                    <div className="text-slate-500 font-semibold flex items-center gap-1">
                        <span>Propulsé avec passion par</span>
                        <span className="text-slate-950 font-bold bg-[#FFCC00] px-2 py-0.5 rounded text-[10px]">BIOLINKO SaaS</span>
                    </div>
                </div>
            </footer>

            {/* FAST CHECKOUT DRAWER WITH ANIMATE PRESENCE */}
            <AnimatePresence>
                {isCheckoutDrawerOpen && selectedProduct && (
                    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto p-6 sm:p-8"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-[#FFCC00] flex items-center justify-center font-semibold">
                                            <ShoppingBag className="w-4 h-4 text-slate-950" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-950 text-base">Paiement Express MoMo</h3>
                                            <p className="text-[11px] text-slate-400 font-medium">Notification Push USSD 30s</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsCheckoutDrawerOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-slate-900">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom & Prénom *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="ex: Jean Dupont"
                                            value={data.customer_name}
                                            onChange={(e) => setData('customer_name', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro Mobile Money (MTN / Moov / Orange) *</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="ex: 0102030405"
                                            value={data.customer_phone}
                                            onChange={(e) => setData('customer_phone', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse / Ville de Livraison *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="ex: Cotonou, Haie Vive"
                                            value={data.delivery_address}
                                            onChange={(e) => setData('delivery_address', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                                        <div className="flex justify-between text-slate-600 font-medium">
                                            <span>Article ({quantity} x {Number(itemUnitPricePb).toLocaleString()} FCFA) :</span>
                                            <span>{Number(subtotalPb).toLocaleString()} FCFA</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500 font-medium">
                                            <span>Frais API Mobile Money (2%) :</span>
                                            <span>+{Number(momoFee).toLocaleString()} FCFA</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-950">
                                            <span>Total Client TTC :</span>
                                            <span className="text-amber-800">{Number(totalClientTc).toLocaleString()} FCFA</span>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-3.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-amber-300"
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Acheter maintenant</span>
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
