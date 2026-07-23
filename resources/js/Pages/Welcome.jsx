import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Sparkles, ShoppingBag, Smartphone, MessageSquare, PackageCheck, 
    Wallet, Unlock, Sliders, ShieldCheck, ArrowRight, ChevronDown, ChevronUp, 
    CheckCircle2, Globe, HelpCircle, BookOpen, Layers, Star, ArrowUpRight, Folder, Key, GraduationCap
} from 'lucide-react';

export default function Welcome({ auth }) {
    const [salesCount, setSalesCount] = useState(50);
    const [avgPrice, setAvgPrice] = useState(5000);
    const [activeFaq, setActiveFaq] = useState(null);
    const [billingPeriod, setBillingPeriod] = useState('monthly');

    const totalRevenue = salesCount * avgPrice;

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const faqs = [
        {
            q: "Comment fonctionne le paiement Mobile Money (Fast Checkout) ?",
            a: "Lorsque l'acheteur clique sur votre SmartLink et valide son panier, il saisit son numéro de téléphone. BIOLINKO déclenche automatiquement une alerte Push USSD sur son mobile pour saisir son code secret MTN ou Orange. En 30 secondes, le paiement est validé !"
        },
        {
            q: "Est-ce que BIOLINKO prend une commission sur mon prix de vente ?",
            a: "Non ! Vous touchez 100% de votre prix affiché. La petite marge de service (2%) et les frais de traitement (2%) sont ajoutés en toute transparence lors du checkout pour l'acheteur, sans déduire un seul franc de votre chiffre d'affaires."
        },
        {
            q: "Mes coordonnées WhatsApp et ma localisation restent-elles visibles ?",
            a: "Absolument. Contrairement aux marketplaces classiques, BIOLINKO ne masque jamais vos informations. Votre numéro WhatsApp, votre ville et vos liens réseaux sociaux restent libres et 100% visibles sur votre vitrine."
        },
        {
            q: "Comment puis-je retirer l'argent de mes ventes ?",
            a: "Chaque vente validée crédite immédiatement votre Portefeuille Virtuel (Wallet). Vous pouvez demander le virement de vos fonds vers votre compte MTN Mobile Money ou Orange Money en 1 clic."
        },
        {
            q: "Comment fonctionne le lien de suivi de commande client ?",
            a: "Chaque commande génère un lien unique (ex: biolinko.app/track/BLK-892471). L'acheteur peut y consulter son reçu numérique sécurisé et l'évolution de la livraison (Payée ➔ En préparation ➔ En cours de livraison ➔ Livrée)."
        }
    ];

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12
            }
        }
    };

    return (
        <>
            <Head title="BIOLINKO — La plateforme N°1 pour vendre vos produits sur les réseaux sociaux" />

            <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950 antialiased overflow-x-hidden">
                
                {/* Top Announcement Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-slate-950 text-white text-xs font-medium py-2.5 px-4 text-center flex items-center justify-center gap-2"
                >
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Nouveau</span>
                    <span>⚡ Lancez votre boutique en 5 minutes et encaissez par Mobile Money avec BIOLINKO</span>
                </motion.div>

                {/* Navbar */}
                <motion.header 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-sm text-slate-950 font-black text-lg group-hover:rotate-6 transition-transform duration-300">
                                <Zap className="w-5 h-5 fill-slate-950" />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-slate-950">
                                biolinko
                            </span>
                        </Link>

                        {/* Nav Links */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-700">
                            <a href="#features" className="hover:text-slate-950 transition-colors">Fonctionnalités</a>
                            <a href="#demo" className="hover:text-slate-950 transition-colors">Démo Vitrine</a>
                            <a href="#pricing" className="hover:text-slate-950 transition-colors">Tarifs</a>
                            <a href="#faq" className="hover:text-slate-950 transition-colors">FAQ</a>
                        </nav>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="px-5 py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-sm transition-all duration-200 hover:scale-105"
                                >
                                    Mon Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors"
                                    >
                                        Connexion
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-5 py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                                    >
                                        Créer une boutique gratuitement
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </motion.header>

                {/* Hero Section */}
                <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Creators Badge Pill */}
                        <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 text-white text-xs font-semibold mb-8 shadow-sm">
                            <div className="flex -space-x-1.5">
                                <span className="inline-block w-4 h-4 rounded-full bg-amber-400 text-[10px] text-slate-950 font-bold text-center leading-4">🇨🇲</span>
                                <span className="inline-block w-4 h-4 rounded-full bg-emerald-400 text-[10px] text-slate-950 font-bold text-center leading-4">🇨🇮</span>
                                <span className="inline-block w-4 h-4 rounded-full bg-yellow-300 text-[10px] text-slate-950 font-bold text-center leading-4">🇸🇳</span>
                            </div>
                            <span>+ 500 vendeurs & créateurs nous font confiance</span>
                        </motion.div>

                        {/* Main Hero Title with Serif Font Accent */}
                        <motion.h1 variants={fadeInUp} className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight leading-[1.15] mb-6">
                            La plateforme N°1 pour <br className="hidden sm:inline" />
                            <span className="font-serif italic font-normal text-slate-800">vendre vos produits</span> sur les réseaux sociaux.
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-8">
                            Créez une boutique en 5 minutes, vendez vos produits directement sur Instagram, TikTok & WhatsApp et recevez vos revenus rapidement grâce à BIOLINKO.
                        </motion.p>

                        {/* Primary CTA Button */}
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                            <Link
                                href={route('register')}
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-extrabold text-lg shadow-md transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <span>Créer une boutique gratuitement</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </motion.div>

                        {/* Category Tags Pills */}
                        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-amber-400 transition-colors">
                                <ShoppingBag className="w-3.5 h-3.5 text-amber-500" /> Mode & Accessoires
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-amber-400 transition-colors">
                                <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Chaussures & Luxe
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-amber-400 transition-colors">
                                <Smartphone className="w-3.5 h-3.5 text-blue-500" /> High-Tech & Gadgets
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-amber-400 transition-colors">
                                <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Cosmétiques & Beauté
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-amber-400 transition-colors">
                                <Zap className="w-3.5 h-3.5 text-emerald-500" /> Services & Formations
                            </span>
                        </motion.div>
                    </motion.div>

                    {/* Hero Feature Preview Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        id="demo" 
                        className="mt-14 p-4 sm:p-8 rounded-[2.5rem] bg-slate-100 border border-slate-200/80 shadow-sm text-left hover:shadow-md transition-shadow duration-500"
                    >
                        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/60 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full">Fast Checkout 30s</span>
                                <h3 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">Vendez vos articles en quelques clics</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Exportez vos articles sous la forme d'un lien unique SmartLink. Vos acheteurs sélectionnent leur taille/couleur et paient par Mobile Money sans quitter leur navigateur.
                                </p>
                                <div className="pt-2">
                                    <Link href={route('register')} className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 hover:underline group">
                                        <span>En savoir plus</span>
                                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            {/* Soft Pastel Yellow Box */}
                            <div className="p-6 rounded-2xl bg-amber-100/70 border border-amber-200 flex flex-col items-center justify-center text-center">
                                <motion.div 
                                    whileHover={{ scale: 1.03 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="w-full max-w-xs bg-white rounded-2xl p-5 border border-slate-200 shadow-lg space-y-4 text-left"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center mx-auto">
                                        <ShoppingBag className="w-7 h-7" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm font-bold text-slate-900">Sac à main Cuir Luxe</div>
                                        <div className="text-base font-black text-amber-600 mt-0.5">15 000 FCFA</div>
                                    </div>
                                    <button className="w-full py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-transform active:scale-95 flex items-center justify-center gap-1.5">
                                        <span>Acheter via Mobile Money</span>
                                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Social Proof Strip */}
                <section className="py-12 bg-white border-y border-slate-200/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70"
                        >
                            <p className="text-xs sm:text-sm text-slate-700 font-medium italic leading-relaxed">
                                "Fluide, intuitif et bien pensé. Les paiements sont stables et mes clientes adorent recevoir leur reçu numérique direct."
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center font-bold text-slate-950 text-sm">
                                    OD
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-950">Ousmane Doumbia 🇨🇮</div>
                                    <div className="text-[11px] text-slate-500">Vendeur Mode & Accessoires</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70"
                        >
                            <p className="text-xs sm:text-sm text-slate-700 font-medium italic leading-relaxed">
                                "En un mois, j'ai économisé 15 heures de travail. Mes clients n'attendent plus sur WhatsApp, ils paient directement."
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                                    KG
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-950">Karelle Gbedo 🇨🇲</div>
                                    <div className="text-[11px] text-slate-500">Boutique Cosmétique</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="p-6 rounded-2xl bg-slate-950 text-white flex flex-col justify-between"
                        >
                            <div className="text-3xl sm:text-4xl font-black text-amber-400">+ 150.000</div>
                            <div className="text-sm font-semibold text-slate-300 mt-2">Ventes réalisées avec succès via BIOLINKO</div>
                        </motion.div>
                    </div>
                </section>

                {/* Section Title Header */}
                <section className="pt-20 pb-12 text-center px-4">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight"
                    >
                        Tout ce qu'il vous faut pour <br />
                        <span className="font-serif italic font-normal text-slate-800">tirer profit de votre commerce</span>
                    </motion.h2>
                </section>

                {/* Big Showcase Sections Stack */}
                <section id="features" className="pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
                    
                    {/* Feature Card 1 */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="p-6 sm:p-10 rounded-[2.5rem] bg-slate-100 border border-slate-200/80"
                    >
                        <div className="text-center max-w-xl mx-auto mb-8">
                            <div className="inline-block w-8 h-2 rounded-full bg-slate-950 mb-4" />
                            <h3 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">Lancez votre boutique en ligne en 5 minutes.</h3>
                            <p className="text-slate-600 text-sm mt-2">
                                Créez une boutique qui reflète votre identité. Personnalisez votre logo, vos couleurs et votre style pour offrir à vos clients une expérience unique.
                            </p>
                            <Link href={route('register')} className="mt-5 inline-block px-6 py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition-transform hover:scale-105">
                                Créer une boutique gratuitement
                            </Link>
                        </div>

                        <div className="p-6 sm:p-8 rounded-2xl bg-amber-100/80 border border-amber-200 max-w-2xl mx-auto">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4 text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm">
                                        <Zap className="w-4 h-4 fill-slate-950" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-900">Configuration Boutique</div>
                                        <div className="text-[11px] text-slate-500">Personnalisez vos détails en quelques clics</div>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2">
                                    <div className="text-xs font-semibold text-slate-700">Nom de la boutique</div>
                                    <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800">
                                        biolinko.app/votre-boutique
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature Card 2 */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="p-6 sm:p-10 rounded-[2.5rem] bg-slate-100 border border-slate-200/80"
                    >
                        <div className="text-center max-w-xl mx-auto mb-8">
                            <div className="inline-block w-8 h-2 rounded-full bg-slate-950 mb-4" />
                            <h3 className="text-2xl sm:text-3xl font-black font-serif text-slate-950">Acceptez les paiements Mobile Money instantanés.</h3>
                            <p className="text-slate-600 text-sm mt-2">
                                Recevez des paiements par MTN Mobile Money et Orange Money. BIOLINKO gère la confirmation automatique et sécurisée.
                            </p>
                        </div>

                        <div className="p-6 sm:p-8 rounded-2xl bg-amber-100/80 border border-amber-200 max-w-2xl mx-auto text-center">
                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-4">
                                <div className="text-xs font-bold text-slate-900">Moyens de paiements supportés</div>
                                <div className="flex justify-center items-center gap-4 flex-wrap">
                                    <span className="px-4 py-2 rounded-xl bg-yellow-400 text-slate-950 font-black text-xs">MTN Mobile Money</span>
                                    <span className="px-4 py-2 rounded-xl bg-orange-500 text-white font-black text-xs">Orange Money</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Grid of Features */}
                <section className="py-20 bg-white border-y border-slate-200/80">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-black font-serif text-slate-950">
                                Des fonctionnalités qui accélèrent votre croissance.
                            </h2>
                        </div>

                        <motion.div 
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
                        >
                            <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-amber-400 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                                    <Sliders className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-950 text-base mb-1">Workflows & Auto-relances</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">Relances automatiques par WhatsApp 30 minutes après l'abandon d'un panier.</p>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-amber-400 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-950 text-base mb-1">SmartLinks Produits</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">Chaque produit possède son lien direct réactif avec Fast Checkout 1-Click.</p>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-amber-400 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                                    <PackageCheck className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-950 text-base mb-1">Lien de Suivi Client</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">Page de suivi en temps réel (<code className="text-slate-900 font-mono">BLK-892471</code>) avec reçu officiel.</p>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-amber-400 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-950 text-base mb-1">Push USSD Réactif</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">Paiement directement déclenché sur le téléphone portable de l'acheteur.</p>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-amber-400 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mb-4">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-950 text-base mb-1">Personnalisation Vitrine</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">Modifiez votre logo, bannière et thèmes de couleur en quelques clics.</p>
                            </motion.div>

                            <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-amber-400 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-950 text-base mb-1">Support 7j/7</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">Une équipe dédiée pour vous accompagner sur WhatsApp à chaque étape.</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Resource Cards Section (Chariow Style) */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                    <div className="text-left mb-12">
                        <h2 className="text-3xl font-black font-serif text-slate-950">Des ressources pour aller plus loin</h2>
                        <p className="text-slate-600 text-sm mt-1">Découvrez des guides et conseils gratuits pour développer votre activité de vendeur.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Resource Card 1 */}
                        <div className="rounded-3xl bg-slate-100 border border-slate-200/80 p-5 flex flex-col justify-between">
                            <div>
                                <div className="h-44 rounded-2xl bg-amber-200/80 flex items-center justify-center text-amber-900 shadow-inner">
                                    <BookOpen className="w-12 h-12" />
                                </div>
                                <h4 className="font-extrabold text-slate-950 text-lg mt-5">Premiers pas avec votre boutique</h4>
                                <p className="text-xs text-slate-600 mt-2 leading-relaxed">Découvrez comment créer et personnaliser votre vitrine SmartLink étape par étape.</p>
                            </div>
                            <button className="mt-6 w-full py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm">
                                Découvrir la formation
                            </button>
                        </div>

                        {/* Resource Card 2 */}
                        <div className="rounded-3xl bg-slate-100 border border-slate-200/80 p-5 flex flex-col justify-between">
                            <div>
                                <div className="h-44 rounded-2xl bg-amber-200/80 flex items-center justify-center text-amber-900 shadow-inner">
                                    <Layers className="w-12 h-12" />
                                </div>
                                <h4 className="font-extrabold text-slate-950 text-lg mt-5">Guides et modèles prêts à l'emploi</h4>
                                <p className="text-xs text-slate-600 mt-2 leading-relaxed">Accélérez votre lancement avec nos templates de fiches produits à fort taux de conversion.</p>
                            </div>
                            <button className="mt-6 w-full py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm">
                                Découvrir les ressources
                            </button>
                        </div>

                        {/* Resource Card 3 */}
                        <div className="rounded-3xl bg-slate-100 border border-slate-200/80 p-5 flex flex-col justify-between">
                            <div>
                                <div className="h-44 rounded-2xl bg-purple-200/80 flex items-center justify-center text-purple-900 shadow-inner">
                                    <Sparkles className="w-12 h-12" />
                                </div>
                                <h4 className="font-extrabold text-slate-950 text-lg mt-5">Maîtriser la publicité TikTok & Instagram</h4>
                                <p className="text-xs text-slate-600 mt-2 leading-relaxed">Apprenez à cibler vos clients idéaux et à rediriger le trafic vers votre lien BIOLINKO.</p>
                            </div>
                            <button className="mt-6 w-full py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm">
                                Accéder au cours
                            </button>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold font-serif text-slate-950">Foire aux questions</h2>
                        <p className="text-slate-600 mt-2">Tout ce que vous devez savoir avant de commencer.</p>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden transition-all shadow-2xs"
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                                >
                                    <span className="font-bold text-slate-950 text-base sm:text-lg">{faq.q}</span>
                                    <span className="text-amber-500 text-xl font-bold">
                                        {activeFaq === idx ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {activeFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4"
                                        >
                                            {faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Dark Banner Call-to-Action */}
                <section className="bg-[#18181B] text-white py-20 px-4 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto space-y-6"
                    >
                        <h2 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
                            Prêt à transformer votre activité en revenu ?
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base">
                            +500 vendeurs et créateurs génèrent déjà des revenus automatiques avec BIOLINKO.
                        </p>
                        <div className="pt-4">
                            <Link
                                href={route('register')}
                                className="inline-block px-8 py-3.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-black text-base shadow-lg transition-transform hover:scale-105"
                            >
                                Créer ma boutique
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* Footer */}
                <footer className="bg-[#18181B] text-slate-400 border-t border-slate-800 text-xs py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
                        <div>Copyright © 2026 BIOLINKO Inc. Tous droits réservés.</div>
                        <div className="flex items-center gap-4">
                            <span>🇫🇷 Français</span>
                            <span>🔒 Paiement Sécurisé Mobile Money</span>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
