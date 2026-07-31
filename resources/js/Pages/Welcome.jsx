import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Sparkles, ShoppingBag, Smartphone, MessageSquare, PackageCheck, 
    Wallet, ShieldCheck, ArrowRight, ChevronDown, ChevronUp, 
    CheckCircle2, Globe, Layers, Star, ArrowUpRight, 
    FileText, Check, Phone, Eye, Heart, MapPin, ExternalLink, Mail, Clock, RefreshCw, Sliders, Play,
    TrendingUp, CreditCard, Users, BarChart3, HelpCircle, ArrowRightCircle, Award, CheckCircle, Tag, Store
} from 'lucide-react';

// Animated Counter component triggered when scrolled into view
function AnimatedCounter({ from = 0, to, duration = 1.8, suffix = "", decimals = 0 }) {
    const [count, setCount] = useState(from);
    const [hasAnimated, setHasAnimated] = useState(false);

    return (
        <motion.span
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            onViewportEnter={() => {
                if (hasAnimated) return;
                setHasAnimated(true);
                let startTimestamp = null;
                const step = (timestamp) => {
                    if (!startTimestamp) startTimestamp = timestamp;
                    const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
                    const currentVal = from + progress * (to - from);
                    setCount(currentVal);
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    }
                };
                window.requestAnimationFrame(step);
            }}
        >
            {count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}{suffix}
        </motion.span>
    );
}

export default function Welcome({ auth }) {
    const [activeFaqCategory, setActiveFaqCategory] = useState('momo');
    const [activeFaqIndex, setActiveFaqIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('dash1');
    const [openDropdown, setOpenDropdown] = useState(null); // 'plateforme', 'tarifs', 'ressources'

    // Marquee items WITHOUT EMOJIS
    const marqueeItems = [
        "Fast Checkout USSD MoMo 30s",
        "Catalogue Mode, Luxe & Beauté",
        "Factures PDF WhatsApp Certifiées",
        "Compatible MTN & Orange Money 🇨🇲",
        "Zero Commission sur vos Ventes",
        "Variantes Tailles, Couleurs & Surprix",
        "SmartLinks d'Achat Express",
        "Analytics & Graphiques de Ventes",
        "Relance WhatsApp Paniers Abandonnés"
    ];

    // FAQ categories & data
    const faqCategories = [
        { id: 'momo', name: 'Paiements & MoMo', icon: CreditCard },
        { id: 'features', name: 'Fonctionnalités Vendeur', icon: Layers },
        { id: 'payouts', name: 'Retraits & Wallet', icon: Wallet },
        { id: 'whatsapp', name: 'Factures & WhatsApp', icon: MessageSquare },
    ];

    const faqItems = {
        momo: [
            {
                q: "Comment s'effectue le paiement par Mobile Money ?",
                a: "L'acheteur saisit son numéro lors de la commande. BIOLINKO déclenche automatiquement une alerte Push USSD sur son mobile pour saisir son code secret MTN ou Orange. La validation est effectuée en moins de 30 secondes."
            },
            {
                q: "Y a-t-il des commissions sur mes prix de vente ?",
                a: "Aucune commission. Vous touchez 100% de votre prix fixe. Les frais de réseau (2%) et de service (2%) sont affichés au client lors du checkout."
            }
        ],
        features: [
            {
                q: "Comment fonctionnent les variantes de produits ?",
                a: "Chaque produit peut posséder plusieurs variantes (ex: Taille S/M/L, Couleur Rouge/Bleu) avec des ajustements de prix et une gestion autonome des stocks."
            },
            {
                q: "Puis-je suivre mes statistiques de vente ?",
                a: "Oui, un tableau de bord analytique complet vous donne le chiffre d'affaires, les ventes sur 14 jours et le top 5 des produits vendus."
            }
        ],
        payouts: [
            {
                q: "Comment puis-je retirer mes revenus d'encaissement ?",
                a: "Vos ventes créditeront votre portefeuille virtuel BIOLINKO. Demandez un virement vers votre compte MTN ou Orange Money à tout moment depuis votre dashboard."
            },
            {
                q: "Quel est le délai de virement vers mon compte MoMo ?",
                a: "Les demandes de retrait sont validées sous 1h à 24h maximum."
            }
        ],
        whatsapp: [
            {
                q: "Puis-je relancer les paniers abandonnés sur WhatsApp ?",
                a: "Oui, un bouton de relance génère un message WhatsApp prêt à être envoyé avec le lien direct de finalisation de la commande."
            },
            {
                q: "Les factures PDF contiennent-elles le filigrane BIOLINKO ?",
                a: "Oui, un reçu d'achat au format PDF avec QR Code et filigrane certifié BIOLINKO est généré pour certifier le paiement."
            }
        ]
    };

    const showcaseTabs = [
        { 
            id: 'dash1', 
            title: 'Tableau de bord Vendeur', 
            icon: BarChart3,
            img: '/cap_dash.png',
            desc: 'Suivez vos revenus, vos commandes et la performance de votre catalogue en temps réel.'
        },
        { 
            id: 'dash2', 
            title: 'Gestion des Commandes', 
            icon: PackageCheck,
            img: '/cap_dash2.png',
            desc: 'Consultez le détail des commandes et relancez les acheteurs en attente sur WhatsApp d\'un clic.'
        },
        { 
            id: 'store1', 
            title: 'Vitrine Client Responsive', 
            icon: ShoppingBag,
            img: '/btq1.png',
            desc: 'Une vitrine fluide optimisée pour vos abonnés Instagram, TikTok et WhatsApp.'
        },
        { 
            id: 'store2', 
            title: 'Checkout USSD Mobile Money', 
            icon: CreditCard,
            img: '/btq2.png',
            desc: 'Choix des variantes (taille, couleur) et paiement Push USSD sur téléphone MTN ou Orange.'
        },
    ];

    const sectionVariants = {
        hidden: { opacity: 0, y: 25 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
    };

    return (
        <>
            <Head title="BIOLINKO — Solution E-Commerce Entreprise par Mobile Money 🇨🇲" />

            <div className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans selection:bg-amber-300 selection:text-slate-950 antialiased overflow-x-hidden relative">
                
                {/* SUBTLE E-COMMERCE BOUTIQUE BACKGROUND PATTERN */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-100/40 via-amber-50/20 to-transparent blur-3xl rounded-full"></div>
                    <div className="absolute top-[800px] left-[-200px] w-96 h-96 bg-amber-200/20 blur-3xl rounded-full"></div>
                    <div className="absolute top-[1600px] right-[-200px] w-96 h-96 bg-amber-200/20 blur-3xl rounded-full"></div>
                    {/* Floating Boutique Grid Icons */}
                    <div className="absolute top-36 left-12 opacity-10 text-amber-600 hidden lg:block">
                        <ShoppingBag className="w-24 h-24" />
                    </div>
                    <div className="absolute top-64 right-16 opacity-10 text-amber-600 hidden lg:block">
                        <Store className="w-28 h-28" />
                    </div>
                    <div className="absolute top-[1100px] left-20 opacity-10 text-amber-600 hidden lg:block">
                        <Tag className="w-20 h-20" />
                    </div>
                </div>

                {/* 1. HEADER & NAVIGATION BAR WITH DROPDOWNS */}
                <motion.header 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-xs"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                        
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                            <div className="w-9 h-9 rounded-xl bg-[#FFCC00] flex items-center justify-center text-slate-950 font-black text-lg group-hover:rotate-6 transition-transform duration-300 border border-amber-300 shadow-2xs">
                                <Zap className="w-5 h-5 fill-slate-950" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-slate-950">
                                biolinko
                            </span>
                        </Link>

                        {/* Navigation Links with Interactive Dropdowns */}
                        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
                            
                            {/* Dropdown 1: Plateforme & Outils */}
                            <div 
                                className="relative"
                                onMouseEnter={() => setOpenDropdown('plateforme')}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <button type="button" className="flex items-center gap-1 hover:text-amber-600 transition-colors py-2">
                                    <span>Plateforme & Outils</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>

                                <AnimatePresence>
                                    {openDropdown === 'plateforme' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 space-y-1 z-50"
                                        >
                                            <a href="#features" className="p-2.5 rounded-xl hover:bg-amber-50 flex items-center gap-3 transition-colors group">
                                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                                    <Smartphone className="w-4 h-4 text-amber-600" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Fast Checkout USSD</div>
                                                    <div className="text-[10px] text-slate-500 font-normal">Paiement Push MoMo 30s</div>
                                                </div>
                                            </a>
                                            <a href="#features" className="p-2.5 rounded-xl hover:bg-amber-50 flex items-center gap-3 transition-colors group">
                                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                                    <Layers className="w-4 h-4 text-amber-600" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Variantes & Stocks</div>
                                                    <div className="text-[10px] text-slate-500 font-normal">Tailles, couleurs & prix</div>
                                                </div>
                                            </a>
                                            <a href="#features" className="p-2.5 rounded-xl hover:bg-amber-50 flex items-center gap-3 transition-colors group">
                                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                                    <FileText className="w-4 h-4 text-amber-600" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Factures PDF Certifiées</div>
                                                    <div className="text-[10px] text-slate-500 font-normal">Reçus officiels WhatsApp</div>
                                                </div>
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Dropdown 2: Formules & Tarifs */}
                            <div 
                                className="relative"
                                onMouseEnter={() => setOpenDropdown('tarifs')}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <button type="button" className="flex items-center gap-1 hover:text-amber-600 transition-colors py-2">
                                    <span>Formules & Tarifs</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>

                                <AnimatePresence>
                                    {openDropdown === 'tarifs' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 space-y-1 z-50"
                                        >
                                            <a href="#pricing" className="p-2 rounded-xl hover:bg-amber-50 flex items-center justify-between text-xs font-semibold text-slate-900">
                                                <span>Starter (Gratuit)</span>
                                                <span className="text-[10px] text-slate-500 font-normal">0 FCFA</span>
                                            </a>
                                            <a href="#pricing" className="p-2 rounded-xl hover:bg-amber-50 flex items-center justify-between text-xs font-bold text-amber-700">
                                                <span className="flex items-center gap-1.5">
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Plan Pro
                                                </span>
                                                <span className="text-[10px] font-bold">7 000 FCFA</span>
                                            </a>
                                            <a href="#pricing" className="p-2 rounded-xl hover:bg-amber-50 flex items-center justify-between text-xs font-semibold text-slate-900">
                                                <span>Plan Growth</span>
                                                <span className="text-[10px] text-slate-500 font-normal">16 000 FCFA</span>
                                            </a>
                                            <a href="#pricing" className="p-2 rounded-xl hover:bg-amber-50 flex items-center justify-between text-xs font-semibold text-slate-900">
                                                <span>Plan Business</span>
                                                <span className="text-[10px] text-slate-500 font-normal">30 000 FCFA</span>
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Dropdown 3: Ressources & Support */}
                            <div 
                                className="relative"
                                onMouseEnter={() => setOpenDropdown('ressources')}
                                onMouseLeave={() => setOpenDropdown(null)}
                            >
                                <button type="button" className="flex items-center gap-1 hover:text-amber-600 transition-colors py-2">
                                    <span>Ressources</span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>

                                <AnimatePresence>
                                    {openDropdown === 'ressources' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 space-y-1 z-50"
                                        >
                                            <a href="#showcase" className="p-2 rounded-xl hover:bg-amber-50 flex items-center gap-2 text-xs font-semibold text-slate-900">
                                                <Eye className="w-4 h-4 text-amber-600" />
                                                <span>Démo Visuelle Live</span>
                                            </a>
                                            <a href="#stats" className="p-2 rounded-xl hover:bg-amber-50 flex items-center gap-2 text-xs font-semibold text-slate-900">
                                                <BarChart3 className="w-4 h-4 text-amber-600" />
                                                <span>Statistiques Vendeurs</span>
                                            </a>
                                            <a href="#faq" className="p-2 rounded-xl hover:bg-amber-50 flex items-center gap-2 text-xs font-semibold text-slate-900">
                                                <HelpCircle className="w-4 h-4 text-amber-600" />
                                                <span>Support & FAQ Hub</span>
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <a href="#stats" className="hover:text-amber-600 transition-colors">Statistiques</a>
                        </nav>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-5 py-2.5 rounded-full bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-all duration-200 hover:scale-105 border border-amber-300 flex items-center gap-1.5 shadow-2xs"
                                >
                                    <span>Mon Dashboard Vendeur</span>
                                    <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-xs font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors"
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2.5 rounded-full bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-semibold text-xs transition-all duration-200 hover:scale-105 border border-amber-300 flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <span>Lancer ma boutique</span>
                                        <ArrowUpRight className="w-4 h-4" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </motion.header>

                {/* 2. HERO SECTION WITH 3 ILLUSTRATION SHOWCASE IMAGES */}
                <section id="hero" className="pt-14 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6 max-w-4xl mx-auto"
                    >
                        {/* Tag Pill */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-950 text-xs font-semibold border border-amber-300 shadow-2xs">
                            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                            <span>Plateforme e-commerce & liens d'achat express par Mobile Money</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                            Vendez vos produits en ligne et <br className="hidden sm:inline" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700">encaissez par Mobile Money</span>.
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
                            Transformez vos abonnés en clients fidèles. Créez votre catalogue en 5 minutes, configurez vos variantes et recevez vos paiements MTN & Orange Money en toute sécurité.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                            <Link
                                href={route('register')}
                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-sm transition-all duration-200 hover:scale-105 border border-amber-300 flex items-center justify-center gap-2"
                            >
                                <span>Créer ma boutique gratuitement</span>
                                <ArrowRight className="w-4 h-4 text-slate-950" />
                            </Link>
                            <a
                                href="#showcase"
                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm border border-slate-200 shadow-2xs transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <span>Explorer la démo</span>
                                <Eye className="w-4 h-4 text-slate-500" />
                            </a>
                        </div>
                    </motion.div>

                    {/* 3 HERO ILLUSTRATION IMAGES SHOWCASE (LEFT, CENTER, RIGHT) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 35 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-center max-w-5xl mx-auto"
                    >
                        {/* Illustration 1: Left - Vitrine Mobile Client */}
                        <div className="md:col-span-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-2 text-left group">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pb-1 border-b border-slate-100">
                                <span className="flex items-center gap-1 text-slate-900 font-bold">
                                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" /> Vitrine Mobile
                                </span>
                                <span className="text-[10px] text-emerald-600 font-mono">Client</span>
                            </div>
                            <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 max-h-64 flex items-center justify-center">
                                <img src="/btq1.png" alt="Vitrine Client" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                        </div>

                        {/* Illustration 2: Center (Main) - Dashboard Vendeur */}
                        <div className="md:col-span-6 bg-white p-4 rounded-3xl border-2 border-amber-300 shadow-xl space-y-3 text-left relative overflow-hidden group">
                            <div className="absolute top-0 right-0 px-3 py-1 bg-[#FFCC00] text-slate-950 font-bold text-[10px] uppercase rounded-bl-xl border-l border-b border-amber-300 shadow-2xs">
                                Tableau de Bord Vendeur
                            </div>
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pb-1 border-b border-slate-100">
                                <span className="flex items-center gap-1.5 text-slate-950 font-bold">
                                    <BarChart3 className="w-4 h-4 text-amber-600" /> Vue Globale Ventes & Graphiques
                                </span>
                            </div>
                            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 max-h-80 flex items-center justify-center">
                                <img src="/cap_dash.png" alt="Dashboard Vendeur" className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300" />
                            </div>
                        </div>

                        {/* Illustration 3: Right - Panier & USSD MoMo */}
                        <div className="md:col-span-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-2 text-left group">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pb-1 border-b border-slate-100">
                                <span className="flex items-center gap-1 text-slate-900 font-bold">
                                    <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Checkout USSD
                                </span>
                                <span className="text-[10px] text-amber-600 font-mono">30s MoMo</span>
                            </div>
                            <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 max-h-64 flex items-center justify-center">
                                <img src="/btq2.png" alt="Checkout Mobile Money" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* 3. INFINITE SCROLL / MARQUEE LOOP BAND (MAX-W-7XL, FADED BLUR ENDS, ZERO EMOJIS, ZERO BLACK BG) */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
                    <div className="relative rounded-2xl bg-amber-50/60 border border-amber-200/70 py-4 overflow-hidden shadow-2xs">
                        {/* Left Faded Gradient Blur Mask */}
                        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-amber-50 via-amber-50/80 to-transparent z-10"></div>
                        {/* Right Faded Gradient Blur Mask */}
                        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-amber-50 via-amber-50/80 to-transparent z-10"></div>

                        <div className="flex whitespace-nowrap overflow-hidden">
                            <motion.div 
                                animate={{ x: ['0%', '-50%'] }}
                                transition={{ repeat: Infinity, ease: 'linear', duration: 25 }}
                                className="flex items-center gap-6 text-xs font-semibold text-slate-800"
                            >
                                {[...marqueeItems, ...marqueeItems].map((item, index) => (
                                    <span key={index} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-200 text-slate-800 shadow-2xs">
                                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                                        <span>{item}</span>
                                    </span>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* 4. STATS & PERFORMANCE SECTION WITH ANIMATED INCREMENT COUNTERS */}
                <motion.section 
                    id="stats"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionVariants}
                    className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10"
                >
                    <div className="text-center space-y-2 max-w-xl mx-auto">
                        <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider border border-amber-300">
                            Performances & Chiffres Clés
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                            Des résultats concrets pour nos vendeurs
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2 text-center hover:border-amber-300 transition-all">
                            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950">
                                +<AnimatedCounter to={500} duration={1.8} />
                            </div>
                            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Boutiques Actives</div>
                            <p className="text-xs text-slate-500 font-normal">Créateurs et commerçants vendent quotidiennement sur BIOLINKO.</p>
                        </div>

                        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2 text-center hover:border-amber-300 transition-all">
                            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950">
                                <AnimatedCounter to={30} duration={1.5} suffix=" sec" />
                            </div>
                            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Temps de Paiement</div>
                            <p className="text-xs text-slate-500 font-normal">Alerte Push USSD automatique sur téléphone MTN et Orange.</p>
                        </div>

                        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2 text-center hover:border-amber-300 transition-all">
                            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950">
                                <AnimatedCounter to={100} duration={1.6} suffix=" %" />
                            </div>
                            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Revenus Préservés</div>
                            <p className="text-xs text-slate-500 font-normal">Vous touchez l'intégralité de vos prix vendeurs affichés sans prélèvement.</p>
                        </div>

                        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-2 text-center hover:border-amber-300 transition-all">
                            <div className="text-3xl sm:text-4xl font-extrabold text-slate-950">
                                <AnimatedCounter to={99.9} duration={2} suffix=" %" decimals={1} />
                            </div>
                            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Uptime Réseau MoMo</div>
                            <p className="text-xs text-slate-500 font-normal">Infrastructure d'encaissement stable et disponible 24h/24.</p>
                        </div>
                    </div>
                </motion.section>

                {/* 5. FEATURE CARDS GRID */}
                <motion.section 
                    id="features"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionVariants}
                    className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12"
                >
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                        <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider border border-amber-300">
                            Suite Fonctionnelle Entreprise
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                            Des outils puissants pour développer vos ventes
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 font-normal">
                            Une infrastructure moderne pensée pour automatiser vos commandes et maximiser vos profits.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        <motion.div 
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 hover:border-amber-300 transition-all"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <BarChart3 className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">Analytics & Chiffre d'Affaires</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                Suivez l'évolution de vos ventes quotidiennes, le classement de vos meilleurs produits et vos revenus en temps réel.
                            </p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 hover:border-amber-300 transition-all"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <Layers className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">Gestion des Variantes & Stock</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                Proposez des variantes (taille, couleur) avec surprix et gestion autonome du stock disponible.
                            </p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 hover:border-amber-300 transition-all"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <Smartphone className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">Fast Checkout USSD MoMo</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                Déclenchez l'alerte Push USSD pour permettre au client de saisir son code secret MTN ou Orange en 30 secondes.
                            </p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 hover:border-amber-300 transition-all"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">Factures PDF & Filigrane</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                Reçus d'achat officiels générés automatiquement avec QR Code et filigrane certifié BIOLINKO.
                            </p>
                        </motion.div>

                        <motion.div 
                            whileHover={{ y: -6 }}
                            transition={{ duration: 0.2 }}
                            className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 hover:border-amber-300 transition-all md:col-span-2"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <MessageSquare className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-950">Relance WhatsApp des Paniers Abandonnés</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                Relancez les acheteurs en attente de paiement par un message personnalisé WhatsApp incluant leur lien direct de finalisation.
                            </p>
                        </motion.div>

                    </div>
                </motion.section>

                {/* 6. REAL SCREENSHOTS SHOWCASE */}
                <motion.section 
                    id="showcase" 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionVariants}
                    className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8"
                >
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                        <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold uppercase tracking-wider">
                            Démo Visuelle Haute Définition
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                            Explorez l'Interface Vendeur et Vitrine
                        </h2>
                    </div>

                    <div className="flex items-center justify-center gap-2 flex-wrap pb-2">
                        {showcaseTabs.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-2 ${
                                        activeTab === tab.id
                                            ? 'bg-slate-950 text-white border-slate-950 shadow-2xs'
                                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{tab.title}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden p-4 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                <span className="ml-2 font-mono text-[11px] text-slate-400">biolinko.app/preview</span>
                            </div>
                            <span className="font-semibold text-slate-900">
                                {showcaseTabs.find(t => t.id === activeTab)?.desc}
                            </span>
                        </div>

                        <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[350px]">
                            {showcaseTabs.map(tab => (
                                tab.id === activeTab && (
                                    <motion.img
                                        key={tab.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        src={tab.img}
                                        alt={tab.title}
                                        className="w-full h-auto object-contain rounded-xl max-h-[600px]"
                                    />
                                )
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* 7. PRICING PLANS SECTION (EXACT SYNC WITH DASHBOARD SUBSCRIPTIONS) */}
                <motion.section 
                    id="pricing" 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionVariants}
                    className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12"
                >
                    <div className="text-center space-y-2 max-w-xl mx-auto">
                        <span className="px-3.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold uppercase tracking-wider">
                            Formules & Tarifs Officiels
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                            Des offres claires et sans surprise
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* Starter Plan */}
                        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starter</div>
                                <div className="text-2xl font-extrabold text-slate-950">GRATUIT</div>
                                <p className="text-xs text-slate-500 font-normal">Pour tester la plateforme et publier vos premiers articles.</p>
                                <ul className="space-y-2.5 text-xs font-normal text-slate-700 pt-3 border-t border-slate-100">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Jusqu'à 10 produits max</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Vitrine personnalisée</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Checkout Mobile Money 🇨🇲</li>
                                </ul>
                            </div>
                            <Link href={route('register')} className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-950 font-semibold text-xs text-center transition-colors">
                                Commencer Gratuitement
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="p-7 rounded-3xl bg-white border-2 border-amber-300 shadow-lg space-y-6 flex flex-col justify-between relative">
                            <div className="absolute -top-3.5 right-4 px-3 py-1 rounded-full bg-[#FFCC00] text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow-2xs flex items-center gap-1 border border-amber-300">
                                <Sparkles className="w-3 h-3 text-slate-950" />
                                <span>Populaire</span>
                            </div>
                            <div className="space-y-4">
                                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pro</div>
                                <div className="text-2xl font-extrabold text-slate-950">7 000 FCFA <span className="text-xs font-normal text-slate-500">/mois</span></div>
                                <p className="text-xs text-slate-500 font-normal">Pour les vendeurs qui veulent automatiser leurs ventes.</p>
                                <ul className="space-y-2.5 text-xs font-normal text-slate-700 pt-3 border-t border-slate-100">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Jusqu'à 50 produits max</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Relance WhatsApp Paniers</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Pixels Facebook & TikTok</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-600 shrink-0" /> Support Prioritaire 7j/7</li>
                                </ul>
                            </div>
                            <Link href={route('register')} className="w-full py-3 rounded-full bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs text-center transition-all shadow-md border border-amber-300">
                                Choisir le Plan Pro
                            </Link>
                        </div>

                        {/* Growth Plan */}
                        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Growth</div>
                                <div className="text-2xl font-extrabold text-slate-950">16 000 FCFA <span className="text-xs font-normal text-slate-400">/mois</span></div>
                                <p className="text-xs text-slate-500 font-normal">Pour les boutiques en forte croissance d'activité.</p>
                                <ul className="space-y-2.5 text-xs font-normal text-slate-700 pt-3 border-t border-slate-100">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Jusqu'à 200 produits max</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Relances WhatsApp illimitées</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Factures PDF avec QR Code</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Support VIP Dédié 24h/24</li>
                                </ul>
                            </div>
                            <Link href={route('register')} className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-950 font-semibold text-xs text-center transition-colors">
                                Activer le Plan Growth
                            </Link>
                        </div>

                        {/* Business Plan */}
                        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business</div>
                                <div className="text-2xl font-extrabold text-slate-950">30 000 FCFA <span className="text-xs font-normal text-slate-400">/mois</span></div>
                                <p className="text-xs text-slate-500 font-normal">Pour les marques et équipes grands comptes.</p>
                                <ul className="space-y-2.5 text-xs font-normal text-slate-700 pt-3 border-t border-slate-100">
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Catalogue Produits Illimité</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Retraits MoMo en Temps Réel</li>
                                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Account Manager Dédié</li>
                                </ul>
                            </div>
                            <Link href={route('register')} className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-950 font-semibold text-xs text-center transition-colors">
                                Activer le Plan Business
                            </Link>
                        </div>

                    </div>
                </motion.section>

                {/* 8. FAQ HUB SECTION (2 COLUMNS) */}
                <motion.section 
                    id="faq" 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionVariants}
                    className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10"
                >
                    <div className="text-center space-y-2 max-w-xl mx-auto">
                        <span className="px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider border border-amber-300">
                            Support & FAQ Hub
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                            Toutes les réponses à vos questions
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-600 font-normal">
                            Sélectionnez une thématique ci-dessous pour consulter nos réponses détaillées.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        <div className="lg:col-span-4 space-y-3">
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                                Thématiques Populaires :
                            </div>

                            <div className="space-y-2">
                                {faqCategories.map(cat => {
                                    const Icon = cat.icon;
                                    const isActive = activeFaqCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => {
                                                setActiveFaqCategory(cat.id);
                                                setActiveFaqIndex(0);
                                            }}
                                            className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                                                isActive
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md font-semibold'
                                                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 font-medium'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-[#FFCC00] text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs">{cat.name}</span>
                                            </div>
                                            <ArrowRight className={`w-4 h-4 transition-transform ${isActive ? 'text-[#FFCC00] translate-x-1' : 'text-slate-400'}`} />
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3 pt-4">
                                <div className="text-xs font-bold flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-amber-600" />
                                    <span>Une question spécifique ?</span>
                                </div>
                                <p className="text-[11px] text-amber-900 font-normal leading-relaxed">
                                    Notre équipe répond directement sur WhatsApp pour vous accompagner dans le lancement de votre boutique.
                                </p>
                                <a
                                    href="https://wa.me/237600000000"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
                                >
                                    <span>Discuter sur WhatsApp</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        </div>

                        <div className="lg:col-span-8 space-y-3">
                            {faqItems[activeFaqCategory]?.map((item, idx) => {
                                const isOpen = activeFaqIndex === idx;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.08 }}
                                        className={`rounded-2xl border transition-all overflow-hidden ${
                                            isOpen
                                                ? 'bg-white border-amber-400 shadow-sm'
                                                : 'bg-white border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                                            className="w-full p-5 text-left font-semibold text-slate-950 text-xs sm:text-sm flex items-center justify-between gap-4"
                                        >
                                            <span className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-[11px] shrink-0">
                                                    ?
                                                </span>
                                                <span>{item.q}</span>
                                            </span>
                                            {isOpen ? (
                                                <ChevronUp className="w-4 h-4 text-amber-600 shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                            )}
                                        </button>
                                        {isOpen && (
                                            <div className="px-5 pb-5 pt-0 text-xs text-slate-600 font-normal leading-relaxed border-t border-slate-100">
                                                {item.a}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                    </div>
                </motion.section>

                {/* 9. PRE-FOOTER CONVERSION CTA BANNER */}
                <motion.section 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-60px" }}
                    variants={sectionVariants}
                    className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
                >
                    <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-100 via-amber-50 to-white border-2 border-amber-300 shadow-md flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
                        
                        <div className="space-y-3 text-center lg:text-left max-w-xl">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFCC00] text-slate-950 text-xs font-bold uppercase tracking-wider border border-amber-300">
                                <Zap className="w-3.5 h-3.5 fill-slate-950" /> Lancez votre Boutique
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                                Transformez vos réseaux sociaux en entreprise e-commerce automatisée
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 font-normal">
                                Rejoignez des centaines de commerçants qui simplifient leurs encaissements et augmentent leurs ventes avec BIOLINKO.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                            <Link
                                href={route('register')}
                                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all border border-amber-300 flex items-center justify-center gap-2"
                            >
                                <span>Lancer ma boutique gratuitement</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </motion.section>

                {/* 10. STRUCTURED FOOTER */}
                <footer className="bg-white border-t border-slate-200 pt-16 pb-8 text-slate-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                            
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-[#FFCC00] flex items-center justify-center text-slate-950 font-black text-lg border border-amber-300">
                                        <Zap className="w-4 h-4 fill-slate-950" />
                                    </div>
                                    <span className="text-2xl font-bold tracking-tight text-slate-950">biolinko</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed font-normal max-w-sm">
                                    BIOLINKO est la solution e-commerce entreprise pour créer votre boutique, vendre sur vos réseaux sociaux et encaisser par Mobile Money.
                                </p>
                                
                                <div className="space-y-1.5 text-xs text-slate-600 font-normal pt-1">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                                        <span>+237 600 000 000 (Support WhatsApp)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-amber-600" />
                                        <span>contact@biolinko.app</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Yaoundé / Douala, Cameroun 🇨🇲</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="font-bold text-slate-950 uppercase tracking-wider">Produits</div>
                                <ul className="space-y-2 text-slate-600 font-normal">
                                    <li><a href="#features" className="hover:text-amber-600 transition-colors">Fast Checkout USSD MoMo</a></li>
                                    <li><a href="#showcase" className="hover:text-amber-600 transition-colors">SmartLinks d'Achat Express</a></li>
                                    <li><a href="#showcase" className="hover:text-amber-600 transition-colors">Factures PDF & Filigrane</a></li>
                                </ul>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="font-bold text-slate-950 uppercase tracking-wider">Ressources</div>
                                <ul className="space-y-2 text-slate-600 font-normal">
                                    <li><a href="#faq" className="hover:text-amber-600 transition-colors">Support & FAQ Hub</a></li>
                                    <li><a href="#showcase" className="hover:text-amber-600 transition-colors">Captures & Démo Live</a></li>
                                    <li><a href="#stats" className="hover:text-amber-600 transition-colors">Performances Vendeurs</a></li>
                                </ul>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="font-bold text-slate-950 uppercase tracking-wider">Légal</div>
                                <ul className="space-y-2 text-slate-600 font-normal">
                                    <li><span className="hover:text-amber-600 cursor-pointer">Mentions Légales</span></li>
                                    <li><span className="hover:text-amber-600 cursor-pointer">Conditions d'Utilisation</span></li>
                                    <li><span className="hover:text-amber-600 cursor-pointer">Politique de Confidentialité</span></li>
                                </ul>
                            </div>

                        </div>

                        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-normal gap-4">
                            <div>
                                © 2026 BIOLINKO. Tous droits réservés.
                            </div>
                            <div className="flex items-center gap-4 text-[11px]">
                                <span>Paiement Sécurisé via HR-Skills Pay 🇨🇲</span>
                            </div>
                        </div>

                        {/* LARGE WATERMARK BRAND TEXT */}
                        <div className="pt-4 text-center overflow-hidden select-none pointer-events-none">
                            <span className="text-6xl sm:text-9xl font-black text-slate-200/50 uppercase tracking-widest block leading-none font-sans">
                                BIOLINKO
                            </span>
                        </div>

                    </div>
                </footer>

            </div>
        </>
    );
}
