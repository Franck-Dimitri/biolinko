import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import {
    ArrowRight, Check, ChevronDown, Menu, Play, X, Truck, Smartphone, FileText,
    MessageCircle, Link2, Wallet, LayoutDashboard, Store, Plus,
    ShieldCheck, Star, Copy, ExternalLink, TrendingUp, Zap, ShoppingBag,
    Laptop, Box, CreditCard, Users, HelpCircle, Maximize2, Lock
} from 'lucide-react';
import { CountUp, EASE_OUT, Marquee, Reveal, Stagger, StaggerItem } from '@/Components/Motion';
import OrbitHero from '@/Components/Landing/OrbitHero';
import { FeatureTabs } from '@/Components/Landing/FeatureTabs';
import StoresMarquee from '@/Components/Landing/StoresMarquee';
import TestimonialsAccordion from '@/Components/Landing/TestimonialsAccordion';
import PricingSection from '@/Components/Landing/PricingSection';
import FaqSection from '@/Components/Landing/FaqSection';
import CardHandGallery from '@/Components/Landing/CardHandGallery';
import Footer from '@/Components/Landing/Footer';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/BrandIcons';

const IMG = '/images/landing';



const SELLER_TYPES = [
    { name: 'Mode & Habillement', emoji: '👗' },
    { name: 'High-Tech & Smartphones', emoji: '📱' },
    { name: 'Cosmétiques & Parfums', emoji: '💄' },
    { name: 'Chaussures & Baskets', emoji: '👟' },
    { name: 'Alimentation & Traiteur', emoji: '🍲' },
    { name: 'Bijoux & Accessoires', emoji: '⌚' },
    { name: 'Maison & Décoration', emoji: '🛋️' },
    { name: 'Services & Formations', emoji: '🎓' },
];

const fcfa = (n) => `${Math.round(n).toLocaleString('fr-FR')} FCFA`;

function Logo({ className = '', inverted = false }) {
    return (
        <a href="/" className={`flex items-center gap-2.5 ${className}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFCC00] shadow-xs">
                <img src="/images/brand/logo-noir.png" alt="" className="h-5 w-5" />
            </span>
            <span className={`text-xl font-bold tracking-tight ${inverted ? 'text-white' : 'text-[#2B2620]'}`}>
                Biolinko
            </span>
        </a>
    );
}

/**
 * Bouton CTA avec animation fluide de brillance / shimmer
 */
function AnimatedCtaButton({ href, children, className = '' }) {
    return (
        <motion.a
            href={href}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FFCC00] px-5 text-sm font-semibold text-[#2B2620] shadow-sm shadow-yellow-500/20 hover:bg-[#E6B800] transition-colors ${className}`}
        >
            {/* Effet shimmer lumineux */}
            <motion.span
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ translateX: ['-100%', '200%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
            />
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.a>
    );
}

function SectionTitle({ children, sub, center = false }) {
    return (
        <Reveal className={`space-y-3 ${center ? 'mx-auto text-center' : ''} max-w-2xl`}>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-[#2B2620]">
                {children}
            </h2>
            {sub && <p className="text-base sm:text-lg font-normal leading-relaxed text-slate-600">{sub}</p>}
        </Reveal>
    );
}

/* ---------- Header Style Shopify avec Dropdowns Dynamiques ---------- */
function Header({ auth }) {
    const [scrolled, setScrolled] = useState(false);
    const [openMobile, setOpenMobile] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 15));

    const dropdownMenus = {
        why: {
            title: 'Choisir Biolinko',
            items: [
                { title: 'Vendre sans site complexe', desc: 'Créez votre boutique complète en 3 minutes depuis votre smartphone', href: '#vitrine', icon: Store },
                { title: 'Paiements Mobile Money', desc: 'Paiements directs sécurisés par MTN MoMo et Orange Money', href: '#comment', icon: CreditCard },
                { title: 'Vidéo de démonstration', desc: 'Découvrez le fonctionnement de Biolinko en vidéo', href: '#demo', icon: Play },
            ],
        },
        products: {
            title: 'Produits & Outils',
            items: [
                { title: 'Vitrine en ligne personnalisée', desc: 'Votre catalogue avec photos, tailles, couleurs et votre identité', href: '#vitrine', icon: Laptop },
                { title: 'SmartLinks de paiement express', desc: 'Vendez un article précis en 1 clic dans vos bios et statuts', href: '#outils', icon: Link2 },
                { title: 'Facturation automatique', desc: 'Reçus officiels PDF avec QR code envoyés après chaque paiement', href: '#outils', icon: FileText },
                { title: 'Relances automatiques', desc: 'Récupérez les paniers abandonnés sur WhatsApp en un clic', href: '#outils', icon: MessageCircle },
            ],
        },
    };

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-200 ${
                scrolled
                    ? 'border-b border-slate-200/90 bg-white/95 shadow-xs backdrop-blur-md'
                    : 'border-b border-slate-200/60 bg-white/90 backdrop-blur-md'
            }`}
            onMouseLeave={() => setActiveMenu(null)}
        >
            <div className="flex h-20 w-full items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
                {/* Logo */}
                <div className="flex items-center gap-8">
                    <Logo />

                    {/* Navigation Desktop avec Dropdowns */}
                    <nav className="hidden items-center gap-6 text-[14px] font-medium text-slate-700 lg:flex">
                        {/* Dropdown 1 : Choisir Biolinko */}
                        <div
                            className="relative py-4"
                            onMouseEnter={() => setActiveMenu('why')}
                        >
                            <button
                                type="button"
                                className="flex items-center gap-1.5 transition-colors hover:text-[#2B2620]"
                            >
                                <span>Choisir Biolinko</span>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeMenu === 'why' ? 'rotate-180 text-[#2B2620]' : 'text-slate-400'}`} />
                            </button>

                            <AnimatePresence>
                                {activeMenu === 'why' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        transition={{ duration: 0.18 }}
                                        className="absolute left-0 top-full w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
                                    >
                                        <div className="space-y-1">
                                            {dropdownMenus.why.items.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={item.href}
                                                    onClick={() => setActiveMenu(null)}
                                                    className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50"
                                                >
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFCC00]/20 text-[#2B2620] mt-0.5">
                                                        <item.icon className="h-4 w-4" />
                                                    </span>
                                                    <div>
                                                        <div className="text-xs font-semibold text-[#2B2620]">{item.title}</div>
                                                        <div className="text-[11px] text-slate-500 leading-snug">{item.desc}</div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Dropdown 2 : Produits */}
                        <div
                            className="relative py-4"
                            onMouseEnter={() => setActiveMenu('products')}
                        >
                            <button
                                type="button"
                                className="flex items-center gap-1.5 transition-colors hover:text-[#2B2620]"
                            >
                                <span>Produits</span>
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeMenu === 'products' ? 'rotate-180 text-[#2B2620]' : 'text-slate-400'}`} />
                            </button>

                            <AnimatePresence>
                                {activeMenu === 'products' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 4 }}
                                        transition={{ duration: 0.18 }}
                                        className="absolute left-0 top-full w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl"
                                    >
                                        <div className="space-y-1">
                                            {dropdownMenus.products.items.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={item.href}
                                                    onClick={() => setActiveMenu(null)}
                                                    className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-slate-50"
                                                >
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFCC00]/20 text-[#2B2620] mt-0.5">
                                                        <item.icon className="h-4 w-4" />
                                                    </span>
                                                    <div>
                                                        <div className="text-xs font-semibold text-[#2B2620]">{item.title}</div>
                                                        <div className="text-[11px] text-slate-500 leading-snug">{item.desc}</div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <a href="#temoignages" className="transition-colors hover:text-[#2B2620]">
                            Témoignages
                        </a>
                        <a href="#tarifs" className="transition-colors hover:text-[#2B2620]">
                            Tarification
                        </a>
                        <a href="#questions" className="transition-colors hover:text-[#2B2620]">
                            FAQ
                        </a>
                        <a href="#demo" className="transition-colors hover:text-[#2B2620]">
                            Vidéo Démo
                        </a>
                    </nav>
                </div>

                {/* Droite : Se connecter + CTA animé Démarrer */}
                <div className="hidden items-center gap-4 sm:flex">
                    {auth?.user ? (
                        <AnimatedCtaButton href={route('dashboard')}>
                            <LayoutDashboard className="h-4 w-4" /> Mon tableau de bord
                        </AnimatedCtaButton>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="text-sm font-medium text-slate-700 hover:text-[#2B2620] transition-colors"
                            >
                                Se connecter
                            </Link>
                            <AnimatedCtaButton href={route('register')}>
                                Démarrer gratuitement
                            </AnimatedCtaButton>
                        </>
                    )}
                </div>

                {/* Bouton Menu Mobile */}
                <button
                    type="button"
                    onClick={() => setOpenMobile(!openMobile)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white lg:hidden text-slate-700"
                    aria-label={openMobile ? 'Fermer le menu' : 'Ouvrir le menu'}
                >
                    {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Menu Mobile */}
            <AnimatePresence>
                {openMobile && (
                    <motion.nav
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full border-t border-slate-200 bg-white px-4 py-5 shadow-xl sm:px-8 lg:hidden"
                    >
                        <div className="space-y-1">
                            <a href="#vitrine" onClick={() => setOpenMobile(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
                                Choisir Biolinko
                            </a>
                            <a href="#outils" onClick={() => setOpenMobile(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
                                Produits & Outils
                            </a>
                            <a href="#temoignages" onClick={() => setOpenMobile(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
                                Témoignages
                            </a>
                            <a href="#tarifs" onClick={() => setOpenMobile(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
                                Tarification
                            </a>
                            <a href="#questions" onClick={() => setOpenMobile(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
                                FAQ
                            </a>
                            <a href="#demo" onClick={() => setOpenMobile(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
                                Vidéo Démo
                            </a>
                        </div>
                        <div className="mt-4 border-t border-slate-100 pt-3 flex flex-col gap-2">
                            {auth?.user ? (
                                <AnimatedCtaButton href={route('dashboard')} className="w-full">
                                    Mon tableau de bord
                                </AnimatedCtaButton>
                            ) : (
                                <>
                                    <Link href={route('login')} className="flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-800">
                                        Se connecter
                                    </Link>
                                    <AnimatedCtaButton href={route('register')} className="w-full">
                                        Démarrer gratuitement
                                    </AnimatedCtaButton>
                                </>
                            )}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}


/* ---------- How It Works (Expérience Concrète & Immersive en 3 Étapes) ---------- */
function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        {
            num: '01',
            badge: 'Création Express',
            title: 'Configurez vos articles depuis votre smartphone',
            summary: 'Prenez vos photos, fixez vos prix en FCFA et vos variantes en 3 minutes.',
            desc: 'Pas besoin d’ordinateur ni de compétences techniques. Vous personnalisez votre lien biolinko.link, téléchargez vos photos depuis votre galerie, ajoutez vos tailles et gérez vos stocks en temps réel.',
            highlights: [
                'Photos & prix configurés en 3 minutes directement sur mobile',
                'Gestion automatique des variantes (tailles, couleurs, stocks)',
                'Votre lien unique biolinko.link prêt immédiatement sans hébergement',
            ],
            metric: '⏱️ Prêt en 3 min chrono',
            preview: (
                <div className="space-y-4">
                    {/* En-tête de l'interface mobile */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
                                <Store className="h-4 w-4" />
                            </span>
                            <div>
                                <div className="text-xs font-bold text-[#2B2620]">Kicks Zone • Douala</div>
                                <div className="text-[10px] text-slate-500">Ajout d'un nouvel article</div>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            En direct
                        </span>
                    </div>

                    {/* Carte d'édition du produit avec photo réelle */}
                    <div className="flex gap-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3">
                        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-white border border-slate-200">
                            <img src={`${IMG}/prod-sneakers.jpg`} alt="Sneakers" className="h-full w-full object-cover" />
                            <span className="absolute bottom-1 right-1 rounded bg-[#2B2620]/80 px-1 py-0.5 text-[9px] font-medium text-white">
                                3 photos
                            </span>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <div className="text-xs font-bold text-[#2B2620] line-clamp-1">Sneakers Street Édition Beige</div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-[#2B2620]">32 000 FCFA</span>
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">-10% Promo</span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">Catégorie : Chaussures & Streetwear</div>
                        </div>
                    </div>

                    {/* Sélecteur de variantes & stocks */}
                    <div className="space-y-2 rounded-xl border border-slate-200/90 bg-white p-3 text-xs">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-700">Pointures disponibles :</span>
                            <span className="text-emerald-700 font-semibold">18 paires en stock</span>
                        </div>
                        <div className="flex gap-1.5">
                            {['39', '40', '41', '42', '43'].map((sz) => (
                                <span
                                    key={sz}
                                    className={`flex h-7 w-8 items-center justify-center rounded-md text-[11px] font-semibold border ${
                                        sz === '41'
                                            ? 'bg-[#FFCC00] text-[#2B2620] border-amber-400 shadow-xs'
                                            : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}
                                >
                                    {sz}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Bouton d'action et notification */}
                    <div className="space-y-2 pt-1">
                        <div className="flex w-full h-10 items-center justify-center gap-2 rounded-xl bg-[#FFCC00] text-xs font-bold text-[#2B2620] shadow-xs">
                            <Check className="h-4 w-4" /> Publier sur biolinko.link/kicks-zone
                        </div>
                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-100 font-medium">
                            <Zap className="h-3 w-3 text-emerald-600" />
                            Article visible instantanément sur mobile sans coder
                        </div>
                    </div>
                </div>
            ),
        },
        {
            num: '02',
            badge: 'Diffusion Sociale',
            title: 'Partagez votre lien biolinko.link sur tous vos réseaux',
            summary: 'Fini de répéter les prix 50 fois en privé sur WhatsApp, Instagram et TikTok.',
            desc: 'Placez votre lien unique dans votre bio Instagram, TikTok, vos publications et vos statuts WhatsApp. Vos clients explorent votre catalogue complet et commandent en autonomie 24h/24 sans créer de compte.',
            highlights: [
                'Un lien universel pour Instagram, TikTok et WhatsApp',
                'Vos clients commandent directement sans créer de compte',
                'Chargement instantané ultra-fluide sur réseau mobile 3G/4G',
            ],
            metric: '🚀 +300% de rapidité de commande',
            preview: (
                <div className="space-y-3.5">
                    {/* En-tête de chat WhatsApp */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs">
                                AK
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-[#2B2620]">Amina K. (Cliente WhatsApp)</div>
                                <div className="text-[10px] text-emerald-600 font-medium">En ligne • Commande en cours</div>
                            </div>
                        </div>
                        <WhatsappIcon className="h-5 w-5 text-emerald-500" />
                    </div>

                    {/* Conversation WhatsApp réaliste */}
                    <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-xs">
                        {/* Message du client */}
                        <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-white p-2.5 shadow-xs border border-slate-200/70 text-slate-700">
                            <p className="text-[11px] leading-relaxed">
                                Bonjour ! La paire beige en pointure 41 est encore disponible ? Vous livrez aujourd'hui à Bonanjo ?
                            </p>
                            <span className="mt-1 block text-right text-[9px] text-slate-400">14:32</span>
                        </div>

                        {/* Réponse automatique / vendeur avec le lien enrichi */}
                        <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-xs bg-amber-50/90 border border-amber-200/80 p-2.5 text-[#2B2620]">
                            <p className="text-[11px] font-medium leading-relaxed">
                                Bonjour Amina ! Oui, disponible. Réservez votre paire et payez en 30s ici 👇
                            </p>

                            {/* Carte de lien enrichi */}
                            <div className="mt-2 overflow-hidden rounded-xl border border-amber-300 bg-white p-2 shadow-xs">
                                <div className="flex items-center gap-2.5">
                                    <img src={`${IMG}/prod-sneakers.jpg`} alt="" className="h-12 w-12 rounded-lg object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs font-bold text-[#2B2620] truncate">Sneakers Street Beige (P. 41)</div>
                                        <div className="text-xs font-bold text-emerald-600">32 000 FCFA</div>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px]">
                                    <span className="font-semibold text-slate-500">biolinko.link/kicks-zone</span>
                                    <span className="rounded bg-[#FFCC00] px-2 py-0.5 font-bold text-[#2B2620]">
                                        Commander
                                    </span>
                                </div>
                            </div>
                            <span className="mt-1 block text-right text-[9px] text-amber-700">14:33 ✓✓</span>
                        </div>
                    </div>

                    {/* Métrique d'impact commercial */}
                    <div className="rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-yellow-50/60 p-2.5 text-[11px] text-[#2B2620] flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-amber-600 shrink-0" />
                        <span><b>+142 commandes</b> passées directement via le lien sans friction cette semaine.</span>
                    </div>
                </div>
            ),
        },
        {
            num: '03',
            badge: 'Encaissement & Livraison',
            title: 'Encaissez par Mobile Money & livrez en toute sérénité',
            summary: 'Paiement direct sécurisé par MTN MoMo, Orange Money ou Wave avec reçu officiel.',
            desc: 'Le client valide par son code secret USSD sur son téléphone. Vos fonds sont immédiatement crédités sur votre solde vendeur, une facture officielle PDF avec QR code est générée et vous préparez l’envoi.',
            highlights: [
                'Paiements MTN MoMo & Orange Money 100% sécurisés',
                'Zéro faux virement : la commande est payée avant expédition',
                'Facture PDF avec QR code et retrait instantané vers votre numéro',
            ],
            metric: '🔒 100% garanti sans faux reçu',
            preview: (
                <div className="space-y-3.5">
                    {/* En-tête de validation sécurisée */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                                <ShieldCheck className="h-4 w-4" />
                            </span>
                            <div>
                                <div className="text-xs font-bold text-[#2B2620]">Paiement Mobile Money Confirmé</div>
                                <div className="text-[10px] text-slate-500">Transaction #OM-94821 • Validée par USSD</div>
                            </div>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            Garanti 100%
                        </span>
                    </div>

                    {/* Grande carte du montant reçu */}
                    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 p-4 text-center">
                        <div className="text-[11px] font-medium text-emerald-900">Montant crédité sur votre solde vendeur :</div>
                        <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
                            + 32 000 FCFA
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-semibold text-emerald-800">
                            <span className="rounded bg-white px-2 py-0.5 shadow-xs border border-emerald-200">Orange Money</span>
                            <span className="rounded bg-white px-2 py-0.5 shadow-xs border border-emerald-200">MTN MoMo</span>
                            <span>• Frais client : 0 FCFA</span>
                        </div>
                    </div>

                    {/* Facture PDF générée automatiquement avec QR code */}
                    <div className="flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3 shadow-xs">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                                <FileText className="h-5 w-5" />
                            </span>
                            <div>
                                <div className="text-xs font-bold text-[#2B2620]">Facture #BLK-2024-089.pdf</div>
                                <div className="text-[10px] text-slate-500">Avec QR Code officiel de livraison • Téléchargeable</div>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                            Générée ✓
                        </span>
                    </div>

                    {/* Solde vendeur & Retrait direct */}
                    <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                        <div>
                            <div className="text-[10px] text-slate-600 font-medium">Solde total disponible :</div>
                            <div className="text-sm font-bold text-[#2B2620]">216 500 FCFA</div>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg bg-[#FFCC00] px-3 py-1.5 text-xs font-bold text-[#2B2620] shadow-xs">
                            <Wallet className="h-3.5 w-3.5" /> Retirer mes fonds
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <section id="comment" className="relative bg-[#FAF9F5] py-20 sm:py-28 border-t border-slate-200/80">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {/* En-tête de section riche et valorisant */}
                <Reveal className="mx-auto max-w-2xl text-center space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 border border-amber-300/60 px-3.5 py-1 text-xs font-semibold text-amber-900 shadow-xs">
                        <Zap className="h-3.5 w-3.5 text-amber-600" /> Processus fluide en 3 étapes simples
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2620]">
                        Comment fonctionne Biolinko ?
                    </h2>
                    <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
                        De la mise en ligne de vos articles à l'encaissement Mobile Money, tout est optimisé pour votre confort et celui de vos clients.
                    </p>
                </Reveal>

                {/* Progression Stepper interactive & dense */}
                <div className="mt-14 grid gap-8 lg:grid-cols-12 items-start">
                    {/* Colonne gauche : 3 grandes étapes explicatives */}
                    <Reveal y={24} className="lg:col-span-6 space-y-3.5">
                        {steps.map((s, i) => {
                            const isSelected = i === activeStep;
                            return (
                                <div
                                    key={s.num}
                                    onClick={() => setActiveStep(i)}
                                    className={`group cursor-pointer rounded-2xl p-5 sm:p-6 transition-all border ${
                                        isSelected
                                            ? 'border-amber-400 bg-white shadow-md ring-2 ring-amber-400/20'
                                            : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300 shadow-xs'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <span
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                                isSelected
                                                    ? 'bg-[#FFCC00] text-[#2B2620] shadow-sm scale-105'
                                                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                            }`}
                                        >
                                            {s.num}
                                        </span>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className={`text-base font-bold transition-colors ${isSelected ? 'text-[#2B2620]' : 'text-slate-800'}`}>
                                                    {s.title}
                                                </h3>
                                            </div>

                                            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                                                {isSelected ? s.desc : s.summary}
                                            </p>

                                            {/* Puces concrètes visibles sur l'étape active */}
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    transition={{ duration: 0.25 }}
                                                    className="pt-2 space-y-1.5 border-t border-slate-100"
                                                >
                                                    {s.highlights.map((h, hi) => (
                                                        <div key={hi} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                                                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                                                            <span>{h}</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-2">
                                                        <span className="inline-block text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                                                            {s.metric}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Reveal>

                    {/* Colonne droite : Mockup d'interface réaliste & immersif */}
                    <Reveal y={30} delay={0.15} className="lg:col-span-6 sticky top-28">
                        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50">
                            {/* Barre de fenêtre d'appareil */}
                            <div className="flex h-11 items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                                </div>
                                <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 shadow-xs">
                                    <Lock className="h-3 w-3 text-amber-500" />
                                    <span>biolinko.link/kicks-zone</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-semibold text-slate-500">Aperçu Réel</span>
                                </div>
                            </div>

                            {/* Contenu dynamique de l'étape active */}
                            <div className="p-5 sm:p-6 bg-white min-h-[380px] flex flex-col justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeStep}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -14 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        {steps[activeStep].preview}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* ---------- Bento Grid Tools Repensé & Dynamique ---------- */
/* ---------- Bento Grid Tools Épuré & Aéré ---------- */
function Tools() {
    return (
        <section id="outils" className="relative bg-white py-20 sm:py-28 border-t border-slate-200/80">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionTitle center sub="Gérez vos commandes, votre argent, vos clients et vos relances en toute simplicité.">
                    Tout ce qu’il faut pour piloter vos ventes.
                </SectionTitle>

                <div className="mt-12 grid gap-6 md:grid-cols-6">
                    {/* Carte 1 : Dashboard */}
                    <Reveal delay={0.05} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-7 md:col-span-4 shadow-xs flex flex-col justify-between">
                        <div className="space-y-1.5 mb-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#2B2620]">
                                Tableau de bord des ventes
                            </h3>
                            <p className="text-sm font-normal text-slate-600 max-w-md">
                                Suivez votre chiffre d'affaires, les commandes à livrer, le niveau de stock et vos clients réguliers.
                            </p>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
                            <img
                                src={`${IMG}/app-dashboard.webp`}
                                alt="Tableau de bord vendeur"
                                loading="lazy"
                                className="block w-full object-cover"
                            />
                        </div>
                    </Reveal>

                    {/* Carte 2 : Retrait Mobile Money */}
                    <Reveal delay={0.12} className="flex flex-col justify-between rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/80 to-yellow-50/30 p-6 sm:p-7 md:col-span-2 shadow-xs">
                        <div className="space-y-1.5">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#2B2620]">
                                Retrait Mobile Money
                            </h3>
                            <p className="text-xs font-normal text-slate-600 leading-relaxed">
                                Transférez votre argent vers votre numéro MTN MoMo ou Orange Money dès 5 000 FCFA.
                            </p>
                        </div>

                        <div className="mt-6 space-y-3.5 rounded-xl bg-white p-5 shadow-xs border border-slate-200/80">
                            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                <span>Solde disponible</span>
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-[#2B2620]">
                                <CountUp to={184500} /> FCFA
                            </div>
                            <div className="flex gap-2 pt-1">
                                <span className="rounded-md bg-[#FFCC00]/30 px-2 py-0.5 text-[10px] font-semibold text-[#2B2620]">
                                    MTN MoMo
                                </span>
                                <span className="rounded-md bg-[#FF7900]/20 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                                    Orange Money
                                </span>
                            </div>
                            <button
                                type="button"
                                className="w-full flex h-10 items-center justify-center rounded-xl bg-[#FFCC00] text-xs font-semibold text-[#2B2620] shadow-xs hover:bg-[#E6B800] transition-colors"
                            >
                                Retirer vers mon numéro
                            </button>
                        </div>
                    </Reveal>

                    {/* Carte 3 : Factures PDF */}
                    <Reveal delay={0.18} className="rounded-2xl border border-slate-200/80 bg-white p-6 md:col-span-2 shadow-xs flex flex-col justify-between">
                        <div className="space-y-1.5">
                            <h3 className="text-base font-semibold text-[#2B2620]">Factures automatiques</h3>
                            <p className="text-xs font-normal text-slate-600 leading-relaxed">
                                Reçu PDF horodaté avec QR code de vérification, généré après chaque paiement validé.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs">
                            <div className="font-medium text-slate-800">Facture BLK-2041.pdf</div>
                            <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                                Payée
                            </span>
                        </div>
                    </Reveal>

                    {/* Carte 4 : Relances */}
                    <Reveal delay={0.24} className="rounded-2xl border border-slate-200/80 bg-white p-6 md:col-span-2 shadow-xs flex flex-col justify-between">
                        <div className="space-y-1.5">
                            <h3 className="text-base font-semibold text-[#2B2620]">Relances automatiques</h3>
                            <p className="text-xs font-normal text-slate-600 leading-relaxed">
                                Récupérez les clients hésitants avec un rappel et un lien direct vers leur commande.
                            </p>
                        </div>
                        <div className="mt-6 rounded-xl rounded-br-sm bg-amber-50/80 border border-amber-200/80 p-3 text-xs text-slate-800 shadow-xs">
                            <p className="font-medium">Votre article vous attend :</p>
                            <span className="font-semibold text-amber-900 underline block mt-0.5">biolinko.link/c/8F2K</span>
                        </div>
                    </Reveal>

                    {/* Carte 5 : SmartLinks */}
                    <Reveal delay={0.30} className="rounded-2xl border border-slate-200/80 bg-white p-6 md:col-span-2 shadow-xs flex flex-col justify-between">
                        <div className="space-y-1.5">
                            <h3 className="text-base font-semibold text-[#2B2620]">SmartLinks Produits</h3>
                            <p className="text-xs font-normal text-slate-600 leading-relaxed">
                                Un lien direct pour vendre un article précis dans une story ou une publication.
                            </p>
                        </div>
                        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 pl-3 text-xs">
                            <span className="font-mono text-[11px] text-slate-700 truncate">biolinko.link/p/produit</span>
                            <span className="rounded-lg bg-[#FFCC00] px-2.5 py-1 text-[10px] font-semibold text-[#2B2620] shadow-xs">
                                Copier
                            </span>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* ---------- Section Grandir (Inspirée du layout Genuka avec Cadre Vidéo) ---------- */
function GrowBusinessSection({ youtubeId = '5N1moUCsVhI' }) {
    const [activeTab, setActiveTab] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoContainerRef = useRef(null);

    const getCleanYoutubeId = (idOrUrl) => {
        if (!idOrUrl) return '5N1moUCsVhI';
        const match = idOrUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : idOrUrl;
    };

    const cleanId = getCleanYoutubeId(youtubeId);

    const toggleFullScreen = () => {
        if (!isPlaying) {
            setIsPlaying(true);
        }
        if (videoContainerRef.current) {
            if (!document.fullscreenElement) {
                videoContainerRef.current.requestFullscreen?.().catch(() => {});
            } else {
                document.exitFullscreen?.().catch(() => {});
            }
        }
    };

    const tabs = [
        {
            icon: Store,
            title: 'Vendez plus, gérez moins',
            desc: 'Vos clients choisissent leurs articles et commandent directement en 1 minute, sans discussions interminables.',
        },
        {
            icon: CreditCard,
            title: 'Gagnez un temps précieux',
            desc: 'Paiements vérifiés instantanément par MTN MoMo et Orange Money. Fini les fausses captures d’écran.',
        },
        {
            icon: ShieldCheck,
            title: 'Déléguez avec confiance',
            desc: 'Factures PDF avec QR code, gestion des stocks et relances automatisées directement sur votre téléphone.',
        },
    ];

    return (
        <section id="demo" className="relative bg-[#FAF9F5] py-20 sm:py-28 border-t border-slate-200/80">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* En-tête centré façon Genuka */}
                <Reveal className="mx-auto max-w-3xl text-center mb-14 sm:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B2620]">
                        Les outils qui font <span className="text-amber-500">grandir votre business</span>
                    </h2>
                    <p className="mt-3.5 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
                        Dites adieu aux barrières techniques et concentrez-vous sur ce qui fait véritablement grandir votre activité.
                    </p>
                </Reveal>

                {/* Grille 2 colonnes : Onglets à gauche, Cadre Vidéo stylisé à droite */}
                <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
                    {/* Colonne gauche (5 cols) */}
                    <Reveal y={24} className="lg:col-span-5 space-y-7">
                        <h3 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-[#2B2620]">
                            Dépassez les <span className="text-amber-500">frontières</span> et concentrez-vous sur ce qui fait vraiment grandir votre activité
                        </h3>

                        {/* 3 Onglets interactifs */}
                        <div className="space-y-3.5">
                            {tabs.map((tab, idx) => {
                                const isActive = activeTab === idx;
                                const Icon = tab.icon;
                                return (
                                    <div
                                        key={tab.title}
                                        onClick={() => setActiveTab(idx)}
                                        className={`cursor-pointer rounded-xl p-5 transition-all border ${
                                            isActive
                                                ? 'border-slate-200 bg-white shadow-sm ring-1 ring-amber-400/20'
                                                : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <span className={`flex h-6 w-6 items-center justify-center transition-colors ${
                                                    isActive ? 'text-amber-500' : 'text-slate-400'
                                                }`}>
                                                    <Icon className="h-5 w-5" />
                                                </span>
                                                <span className={`text-base font-bold ${
                                                    isActive ? 'text-[#2B2620]' : 'text-slate-700'
                                                }`}>
                                                    {tab.title}
                                                </span>
                                            </div>
                                            <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                                                isActive
                                                    ? 'bg-amber-500 text-white shadow-xs'
                                                    : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </span>
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.22 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="mt-3 text-xs sm:text-sm font-normal text-slate-600 leading-relaxed pl-9">
                                                        {tab.desc}
                                                    </p>
                                                    {/* Barre de soulignement orange comme sur la maquette */}
                                                    <div className="mt-4 h-0.5 w-full bg-amber-500 rounded-full" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </Reveal>

                    {/* Colonne droite (7 cols) : Cadre stylisé de la vidéo */}
                    <Reveal y={30} delay={0.15} className="lg:col-span-7">
                        <div
                            ref={videoContainerRef}
                            className="relative overflow-hidden rounded-2xl border-2 border-amber-400/90 bg-white p-2.5 sm:p-3.5 shadow-xl shadow-amber-500/10"
                        >
                            {/* Barre supérieure du cadre style Genuka */}
                            <div className="mb-2.5 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2 border border-slate-200/70 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="font-semibold text-[#2B2620]">Biolinko en direct</span>
                                    <span className="hidden sm:inline text-slate-400">•</span>
                                    <span className="hidden sm:inline text-slate-500 font-normal">Démonstration vidéo</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleFullScreen}
                                    className="flex items-center gap-1.5 rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                                >
                                    <Maximize2 className="h-3 w-3 text-amber-600" />
                                    <span>PLEIN ÉCRAN</span>
                                </button>
                            </div>

                            {/* Zone vidéo 16:9 */}
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-stone-900 shadow-inner">
                                <AnimatePresence mode="wait">
                                    {!isPlaying ? (
                                        <motion.div
                                            key="poster"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            onClick={() => setIsPlaying(true)}
                                            className="group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-br from-[#2B2620] via-stone-800 to-amber-950 text-white"
                                        >
                                            {/* Arrière-plan visuel avec grille discrète */}
                                            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

                                            {/* Mockup de fond estompé */}
                                            <div className="absolute inset-0 opacity-30 blur-[1px] scale-105 pointer-events-none">
                                                <img
                                                    src={`${IMG}/app-dashboard.webp`}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Bouton Play lumineux au centre */}
                                            <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4">
                                                <motion.div
                                                    whileHover={{ scale: 1.08 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#FFCC00] text-[#2B2620] shadow-xl shadow-yellow-500/30 transition-transform"
                                                >
                                                    <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-current translate-x-0.5" />
                                                </motion.div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-200 transition-colors">
                                                        Lancer la démonstration vidéo (1 min)
                                                    </p>
                                                    <p className="text-[11px] text-white/70">
                                                        Découvrez comment fonctionne Biolinko de A à Z
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="iframe"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="h-full w-full"
                                        >
                                            <iframe
                                                className="h-full w-full border-0"
                                                src={`https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                                                title="Vidéo explicative Biolinko"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

/* ---------- Final CTA avec animation ---------- */
function FinalCta({ auth }) {
    return (
        <section className="relative bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="relative overflow-hidden rounded-2xl bg-[#FFCC00] px-6 py-12 sm:px-12 text-[#2B2620] shadow-md border border-amber-300">
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
                        <div className="max-w-xl space-y-3">
                            <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-[#2B2620]">
                                Ouvrez votre boutique ce soir. Encaissez demain.
                            </h2>
                            <p className="text-base text-[#2B2620]/85 font-normal">
                                100% gratuit pour démarrer. Aucune carte bancaire requise. Retraits directs vers MTN MoMo et Orange Money.
                            </p>
                        </div>

                        <div>
                            <motion.a
                                href={auth?.user ? route('dashboard') : route('register')}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative overflow-hidden inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2B2620] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#3D362E] transition-colors"
                            >
                                <motion.span
                                    className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ translateX: ['-100%', '200%'] }}
                                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                                />
                                <span className="relative z-10 flex items-center gap-2">
                                    Démarrer ma boutique <ArrowRight className="h-4 w-4" />
                                </span>
                            </motion.a>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

export default function Welcome({ auth }) {
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

    return (
        <MotionConfig reducedMotion="user">
            <Head title="Biolinko — La boutique en ligne payée par Mobile Money">
                <meta
                    name="description"
                    content="Créez votre boutique en ligne en 3 minutes, partagez votre lien et encaissez par MTN MoMo et Orange Money."
                />
            </Head>

            {/* Barre de défilement jaune */}
            <motion.div
                style={{ scaleX: progress, originX: 0 }}
                className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-[#FFCC00]"
            />

            <div className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-amber-100 selection:text-slate-900">
                {/* Header style Shopify avec Dropdowns et CTA animé */}
                <Header auth={auth} />

                {/* Hero section (Conservée intacte) */}
                <OrbitHero
                    primaryHref={auth?.user ? route('dashboard') : route('register')}
                    primaryLabel={auth?.user ? 'Aller à mon tableau de bord' : 'Créer ma boutique gratuitement'}
                />

                {/* Bandeau défilant des Boutiques & Marques (de droite à gauche) */}
                <Reveal y={16}>
                    <StoresMarquee />
                </Reveal>

                {/* Présentation Interactive des Fonctionnalités */}
                <FeatureTabs />

                {/* Vitrine des Produits en Éventail Interactif (Card Hand Gallery) */}
                <CardHandGallery />

                {/* Comment ça marche : Stepper dynamique sans accumulation de cartes */}
                <HowItWorks />

                {/* Boîte à Outils Bento Grid Revisitée */}
                <Tools />

                {/* Les outils qui font grandir votre business avec Cadre Vidéo stylisé */}
                <GrowBusinessSection youtubeId="5N1moUCsVhI" />

                {/* Témoignages Vendeurs : Carrousel Accordéon Déroulant (Images 3 & 4) */}
                <TestimonialsAccordion />

                {/* Tarifs (Image 2) */}
                <PricingSection auth={auth} />

                {/* FAQ (Image 1) */}
                <FaqSection />

                {/* CTA Final avec animation de brillance */}
                <FinalCta auth={auth} />

                {/* Footer style Image 2 avec grand filigrane Biolinko */}
                <Footer />
            </div>
        </MotionConfig>
    );
}
