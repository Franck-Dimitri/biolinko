import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, animate, motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, BarChart3, Check, HandCoins, Menu, Package, Repeat, ShieldCheck, Store, Truck, X } from 'lucide-react';
import { EASE_OUT } from '@/Components/UI/Motion';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/UI/BrandIcons';
import Footer from '@/Components/Landing/Footer';
import Countries from '@/Components/Landing/Countries';
import ChannelStrip from '@/Components/Landing/ChannelStrip';
import Faq from '@/Components/Landing/Faq';
import Features from '@/Components/Landing/Features';
import { Eyebrow, RevealWords, Section, WRAP, reveal } from '@/Components/Landing/Frame';
import Pricing from '@/Components/Landing/Pricing';
import ProductWall from '@/Components/Landing/ProductWall';
import ShopClaim from '@/Components/Landing/ShopClaim';
import {
    BalanceCard, CampaignMock, InvoiceMock, LinkMock, OperatorLogo, OrdersMock, PhoneCheckout, PhoneStore, StatsMock,
} from '@/Components/Landing/Illustrations';

const NAV = [['#produit', 'Produit'], ['#fonctionnalites', 'Fonctionnalités'], ['#pays', 'Pays'], ['#tarifs', 'Tarifs'], ['#questions', 'Questions']];
const H2 = 'text-[36px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[52px]';

/* ---------------------------------------------------------------- En-tête */

function Header({ auth }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.3 });
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    const cta = auth?.user ? route('dashboard') : route('register');
    const light = scrolled || open; // fond clair une fois sorti du hero sombre

    return (
        <motion.header initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: EASE_OUT }}
            className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${light ? 'border-b border-black/[0.06] bg-white/90 backdrop-blur-md' : 'bg-transparent'}`}>
            <div className={`${WRAP} flex h-16 items-center justify-between`}>
                <Link href="/" className="flex items-center gap-2">
                    <motion.span initial={{ rotate: -90, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
                        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#FFCC00]">
                        <img src="/images/brand/logo-noir.svg" alt="" className="h-12 w-12 max-w-none" />
                    </motion.span>
                    <span className={`text-[19px] font-semibold tracking-tight transition-colors ${light ? 'text-[#141412]' : 'text-white'}`}>Biolinko</span>
                </Link>
                <nav className="hidden items-center gap-7 lg:flex">
                    {NAV.map(([href, label]) => (
                        <a key={href} href={href} className={`text-[15px] transition-colors ${light ? 'text-[#141412]/70 hover:text-[#141412]' : 'text-white/70 hover:text-white'}`}>{label}</a>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    {!auth?.user && <Link href={route('login')} className={`hidden text-[15px] sm:block ${light ? 'text-[#141412]/70 hover:text-[#141412]' : 'text-white/70 hover:text-white'}`}>Se connecter</Link>}
                    <Link href={cta} className="hidden h-10 items-center rounded-full bg-[#FFCC00] px-5 text-[14px] font-medium text-[#141412] transition-transform hover:-translate-y-0.5 hover:bg-[#FFD633] sm:flex">
                        {auth?.user ? 'Tableau de bord' : 'Commencer gratuitement'}
                    </Link>
                    <button type="button" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${light ? 'border-black/10 text-[#141412]' : 'border-white/20 text-white'}`}>
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <motion.div aria-hidden style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[#FFCC00]" />
            <AnimatePresence>
                {open && (
                    <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-black/5 bg-white lg:hidden">
                        <div className="space-y-1 px-5 py-4">
                            {NAV.map(([href, label], i) => (
                                <motion.a key={href} href={href} onClick={() => setOpen(false)} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}
                                    className="block py-2.5 text-base text-[#141412]">{label}</motion.a>
                            ))}
                            {!auth?.user && <Link href={route('login')} className="block py-2.5 text-base text-[#141412]/70">Se connecter</Link>}
                            <Link href={cta} className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[#FFCC00] text-[15px] font-medium text-[#141412]">
                                {auth?.user ? 'Tableau de bord' : 'Commencer gratuitement'}
                            </Link>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </motion.header>
    );
}

/* ---------------------------------------------------------------- Hero */

const WORDS = ['WhatsApp', 'Instagram', 'TikTok', 'Facebook'];

function RotatingWord() {
    const [i, setI] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2400);
        return () => clearInterval(t);
    }, []);
    return (
        <span className="relative inline-grid overflow-hidden pb-[0.08em] align-bottom text-[#FFCC00]">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={WORDS[i]} initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-100%', opacity: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}
                    className="col-start-1 row-start-1">{WORDS[i]}</motion.span>
            </AnimatePresence>
        </span>
    );
}

/** Mot du titre qui monte depuis un masque au chargement. */
function IntroWord({ children, i }) {
    return (
        <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span className="inline-block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.2 + i * 0.07, ease: EASE_OUT }}>
                {children}
            </motion.span>
        </span>
    );
}

const EVENTS = [
    ['MTN', 'Paiement reçu', 'Robe pagne · Douala', '+18 500', '#16A34A'],
    ['WHATSAPP', 'Nouvelle commande', 'Sac à chaîne · Yaoundé', '32 000', '#141412'],
    ['ORANGE', 'Retrait envoyé', 'Vers votre Orange Money', '−45 000', '#141412'],
];

/** Notifications qui se succèdent : la vie d'une boutique en direct. */
function LiveFeed({ className = '' }) {
    const [i, setI] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setI((v) => (v + 1) % EVENTS.length), 3200);
        return () => clearInterval(t);
    }, []);
    const [op, title, sub, amount, color] = EVENTS[i];
    return (
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 1.2, ease: EASE_OUT }}
            className={`w-[280px] ${className}`}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={i} initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -24, scale: 0.95 }} transition={{ duration: 0.45, ease: EASE_OUT }}
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 text-[#141412] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
                    <OperatorLogo op={op} className="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium">{title}</p>
                        <p className="truncate text-[12px] text-[#5F5E58]">{sub}</p>
                    </div>
                    <p className="text-[14px] font-medium tabular-nums" style={{ color }}>{amount}</p>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}

function Hero() {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    // Sortie : en défilant, le texte remonte et s'efface, le mur recule légèrement
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -120]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
    const wallScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.92]);
    const wallY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 80]);

    return (
        <section ref={ref} className="relative overflow-hidden bg-[#0F0F0E] text-white">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
            {/* Rails sombres, pour la continuité avec les sections suivantes */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[1320px] -translate-x-1/2 border-x border-white/[0.07] md:block" />

            <div className={`${WRAP} grid items-center gap-12 pb-16 pt-28 sm:pt-32 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-0 lg:pt-20`}>
                <motion.div style={{ y: textY, opacity: textOpacity }} className="min-w-0 lg:py-28">
                    <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[13px] text-white/70">
                        <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ADE80] opacity-60" /><span className="relative h-2 w-2 rounded-full bg-[#4ADE80]" /></span>
                        Disponible au Cameroun<span className="hidden sm:inline"> · MTN MoMo et Orange Money</span>
                    </motion.span>
                    <h1 className="mt-6 text-[44px] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[64px] lg:text-[76px]" aria-label="Vos clients sont sur WhatsApp, Instagram, TikTok et Facebook. Votre boutique aussi.">
                        <span aria-hidden>
                            {['Vos', 'clients', 'sont', 'sur'].map((w, i) => <IntroWord key={w} i={i}>{w}&nbsp;</IntroWord>)}
                            <IntroWord i={4}><RotatingWord />.</IntroWord><br />
                            {['Votre', 'boutique', 'aussi.'].map((w, i) => <IntroWord key={w} i={i + 5}>{w}{i < 2 ? ' ' : ''}</IntroWord>)}
                        </span>
                    </h1>
                    <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.75, ease: EASE_OUT }}
                        className="mt-6 max-w-[540px] text-[18px] leading-relaxed text-white/65">
                        Boutique en ligne, catalogue, commandes, livraison, factures, marketing et paiements Mobile Money : tout votre commerce dans une seule application.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9, ease: EASE_OUT }} className="mt-9 max-w-[560px]">
                        <ShopClaim dark />
                    </motion.div>
                </motion.div>

                <motion.div style={{ scale: wallScale, y: wallY }} className="relative min-w-0">
                    <ProductWall intro className="h-[420px] sm:h-[520px] lg:h-[700px]" />
                    <LiveFeed className="absolute -left-2 bottom-12 hidden sm:block lg:-left-12" />
                </motion.div>
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------- Piliers */

const PILLARS = [
    {
        id: 'vendre', Icon: Store, label: 'Vendre', title: 'Une boutique à votre image, prête en quelques minutes',
        points: ['Logo, couleurs, police et sections au choix', 'Catalogue avec tailles, couleurs, photos et stock', 'Liens de paiement pour un produit ou un pack, à coller dans une discussion'],
        visual: <div className="relative flex w-full items-center justify-center pt-8"><PhoneStore className="w-[240px] translate-y-10" /><LinkMock className="absolute right-4 top-10 hidden w-[280px] sm:block" /></div>,
    },
    {
        id: 'encaisser', Icon: HandCoins, label: 'Encaisser', title: 'Le client paie, l’argent arrive chez vous',
        points: ['MTN MoMo ou Orange Money, validé sur le téléphone du client', 'Acompte possible, le reste payé au livreur', 'Retraits gratuits vers votre numéro Mobile Money'],
        visual: <div className="relative flex w-full items-center justify-center pt-8"><PhoneCheckout className="w-[240px] translate-y-10" /><BalanceCard className="absolute left-4 top-12 hidden w-[300px] sm:block" /></div>,
    },
    {
        id: 'livrer', Icon: Truck, label: 'Livrer', title: 'De la commande à la livraison, sans perdre le fil',
        points: ['Zones de livraison avec un tarif par ville, livraison offerte dès un montant', 'Statuts « payée », « en livraison », « livrée » mis à jour en un geste', 'Le client suit sa commande avec un simple lien, et reçoit sa facture'],
        visual: <div className="relative flex w-full flex-col items-center justify-center gap-4 px-6 pt-8"><OrdersMock className="w-full max-w-[400px]" /><InvoiceMock className="hidden w-[260px] self-end sm:block" /></div>,
    },
    {
        id: 'promouvoir', Icon: Package, label: 'Promouvoir', title: 'Faites revenir vos clients et attirez-en de nouveaux',
        points: ['Codes promo et promotions programmées', 'Campagnes WhatsApp et relance des paniers abandonnés', 'Pixels Meta, TikTok et Google, produits visibles sur Google'],
        visual: <div className="relative flex w-full flex-col items-center justify-center gap-4 px-6 pt-8"><CampaignMock className="w-full max-w-[360px]" /><StatsMock className="w-full max-w-[320px] self-end" /></div>,
    },
    {
        id: 'piloter', Icon: BarChart3, label: 'Piloter', title: 'Vos chiffres clairs, votre argent sous contrôle',
        points: ['Chiffre d’affaires, commandes et clients en temps réel', 'Portefeuille avec délai de sécurité et remboursements simples', 'Export comptable de toutes vos ventes'],
        visual: <div className="relative flex w-full flex-col items-center justify-center gap-4 px-6 pt-8"><StatsMock className="w-full max-w-[340px]" /><BalanceCard className="hidden w-[300px] self-end sm:block" /></div>,
    },
];

const PILLAR_MS = 7000;

function Pillars() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const ref = useRef(null);
    const inView = useInView(ref, { margin: '-30%' });
    // Avance automatique tant que la section est visible et non survolée
    useEffect(() => {
        if (paused || !inView) return undefined;
        const t = setTimeout(() => setActive((v) => (v + 1) % PILLARS.length), PILLAR_MS);
        return () => clearTimeout(t);
    }, [active, paused, inView]);
    const p = PILLARS[active];

    return (
        <Section id="produit" className="bg-white py-24 sm:py-32">
            <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div className="max-w-[760px]">
                        <Eyebrow>Tout-en-un</Eyebrow>
                        <RevealWords text="Tout votre commerce, dans une seule application" className={`mt-4 ${H2} text-[#141412]`} />
                    </div>
                    <motion.p {...reveal(0.2)} className="max-w-[360px] text-[16px] text-[#5F5E58]">Arrêtez de jongler entre WhatsApp, un cahier et la calculatrice.</motion.p>
                </div>

                <div className="mt-12 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="tablist" aria-label="Fonctionnalités principales">
                    {PILLARS.map((x, i) => (
                        <button key={x.id} type="button" role="tab" aria-selected={active === i} onClick={() => setActive(i)}
                            className={`relative flex shrink-0 items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors ${active === i ? 'text-[#141412]' : 'text-[#5F5E58] hover:text-[#141412]'}`}>
                            {active === i && <motion.span layoutId="pillar" className="absolute inset-0 rounded-full bg-[#FFCC00]" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                            {active === i && !paused && inView && (
                                <motion.span key={`bar-${active}`} className="absolute bottom-0 left-0 h-[3px] bg-[#141412]/25" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: PILLAR_MS / 1000, ease: 'linear' }} />
                            )}
                            <x.Icon className="relative h-4 w-4" /> <span className="relative">{x.label}</span>
                        </button>
                    ))}
                </div>

                <motion.div {...reveal(0.1)} className="mt-6 grid overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#F6F5F1] lg:grid-cols-[0.9fr_1.1fr]">
                    <AnimatePresence mode="wait">
                        <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.35, ease: EASE_OUT }}
                            className="flex flex-col justify-center p-8 sm:p-12">
                            <p className="text-[14px] font-medium text-[#B38600]">0{active + 1} / 0{PILLARS.length}</p>
                            <h3 className="mt-3 text-[28px] font-medium leading-tight tracking-[-0.02em] text-[#141412] sm:text-[34px]">{p.title}</h3>
                            <ul className="mt-7 space-y-4">
                                {p.points.map((t, i) => (
                                    <motion.li key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="flex gap-3 text-[16px] text-[#3D3C37]">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#141412]"><Check className="h-3 w-3 text-[#FFCC00]" strokeWidth={3} /></span>{t}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </AnimatePresence>
                    <div className="relative flex min-h-[380px] items-end justify-center overflow-hidden sm:min-h-[480px]">
                        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.035)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />
                        <AnimatePresence mode="wait">
                            <motion.div key={p.id} initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.98 }} transition={{ duration: 0.45, ease: EASE_OUT }}
                                className="relative flex h-full w-full items-end justify-center">
                                {p.visual}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </Section>
    );
}

/* ---------------------------------------------------------------- Toutes les fonctionnalités */

function AllFeatures() {
    return (
        <Section id="fonctionnalites" className="bg-white pb-24 sm:pb-32" top={false}>
            <div className="border-t border-black/[0.06] pt-20 sm:pt-24">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div className="max-w-[720px]">
                        <Eyebrow>Fonctionnalités</Eyebrow>
                        <RevealWords text="Et bien plus encore, déjà inclus" className={`mt-4 ${H2} text-[#141412]`} />
                    </div>
                    <motion.p {...reveal(0.2)} className="max-w-[380px] text-[16px] text-[#5F5E58]">Trente outils pensés pour les commerçants qui vendent en ligne au Cameroun, sans rien installer.</motion.p>
                </div>
                <motion.div {...reveal(0.1)} className="mt-10"><Features /></motion.div>
            </div>
        </Section>
    );
}

/* ---------------------------------------------------------------- Vendez partout */

const CHANNELS = [
    { Icon: WhatsappIcon, color: '#25D366', name: 'WhatsApp', text: 'Envoyez le lien d’un produit dans la discussion. Le client paie sans quitter son téléphone.' },
    { Icon: InstagramIcon, color: '#E1306C', name: 'Instagram', text: 'Votre boutique en lien de bio, vos produits en story avec un lien direct.' },
    { Icon: TiktokIcon, color: '#141412', name: 'TikTok', text: 'Vos vidéos font connaître le produit, votre lien en profil conclut la vente.' },
    { Icon: FacebookIcon, color: '#1877F2', name: 'Facebook', text: 'Publications, groupes et Messenger : un seul lien pour commander et payer.' },
];

function Everywhere() {
    return (
        <Section className="bg-[#F6F5F1] py-24 sm:py-32" innerClassName="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
                <Eyebrow>Vendez partout</Eyebrow>
                <RevealWords text="Un seul lien, partout où vous vendez déjà" className={`mt-4 ${H2} text-[#141412]`} />
                <motion.p {...reveal(0.15)} className="mt-5 max-w-[480px] text-[18px] text-[#5F5E58]">
                    Pas besoin de quitter vos réseaux. Biolinko transforme vos conversations en commandes payées.
                </motion.p>
                <motion.div {...reveal(0.2)} className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-white px-5 py-4">
                    <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFCC00] opacity-70" /><span className="relative h-2.5 w-2.5 rounded-full bg-[#FFCC00]" /></span>
                    <span className="text-[16px] text-[#141412]">biolinko.link/<span className="font-semibold">votre-boutique</span></span>
                </motion.div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {CHANNELS.map((c, i) => (
                    <motion.article key={c.name} initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_OUT }} whileHover={{ y: -6 }}
                        className="rounded-3xl border border-black/[0.06] bg-white p-6 transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(20,20,18,0.35)]">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${c.color}14` }}>
                            <c.Icon className="h-6 w-6" style={{ color: c.color }} />
                        </span>
                        <h3 className="mt-5 text-[18px] font-medium text-[#141412]">{c.name}</h3>
                        <p className="mt-1.5 text-[15px] leading-relaxed text-[#5F5E58]">{c.text}</p>
                    </motion.article>
                ))}
            </div>
        </Section>
    );
}

/* ---------------------------------------------------------------- Confiance */

function Trust() {
    const items = [
        [ShieldCheck, 'Paiement confirmé par l’opérateur', 'Fini les captures de faux reçus : une vente n’est payée que lorsque MTN ou Orange l’a confirmée.'],
        [Store, 'Vos clients suivent leur commande', 'Chaque achat reçoit un lien de suivi et une facture. Le client sait où en est sa commande.'],
        [Repeat, 'L’argent protégé jusqu’à la livraison', 'Un court délai de sécurité avant le retrait, un signalement en cas de souci, un remboursement simple.'],
    ];
    return (
        <Section className="bg-white py-24 sm:py-32">
            <div className="max-w-[760px]">
                <Eyebrow>Confiance</Eyebrow>
                <RevealWords text="Vos clients achètent rassurés. Vous vendez plus." className={`mt-4 ${H2} text-[#141412]`} />
            </div>
            <div className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-black/[0.06] bg-black/[0.06] md:grid-cols-3">
                {items.map(([Icon, title, text], i) => (
                    <motion.article key={title} {...reveal(i * 0.1)} className="bg-white p-8 transition-colors hover:bg-[#FFFCEF]">
                        <motion.span initial={{ scale: 0, rotate: -30 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.2 + i * 0.1 }}
                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#141412] text-[#FFCC00]"><Icon className="h-5 w-5" /></motion.span>
                        <h3 className="mt-6 text-[19px] font-medium text-[#141412]">{title}</h3>
                        <p className="mt-2 text-[15px] leading-relaxed text-[#5F5E58]">{text}</p>
                    </motion.article>
                ))}
            </div>
        </Section>
    );
}

/* ---------------------------------------------------------------- Chiffres */

/** Nombre animé d'une valeur à une autre à l'entrée dans l'écran (ex. 100 → 0). */
function Count({ from, to, suffix }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const reduce = useReducedMotion();
    const [v, setV] = useState(reduce ? to : from);
    useEffect(() => {
        if (!inView || reduce) return undefined;
        const c = animate(from, to, { duration: 1.6, ease: EASE_OUT, onUpdate: setV });
        return () => c.stop();
    }, [inView, from, to, reduce]);
    return <span ref={ref} className="tabular-nums">{Math.round(v).toLocaleString('fr-FR')}{suffix}</span>;
}

function Facts() {
    const facts = [
        [100, 0, ' FCFA', 'pour ouvrir votre boutique'],
        [100, 0, ' FCFA', 'de frais sur vos retraits'],
        [50, 0, ' %', 'de commission sur la livraison'],
        [0, 4, ' jours', 'au plus avant de pouvoir retirer'],
    ];
    return (
        <section className="relative overflow-hidden bg-[#FFCC00] py-16 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[1320px] -translate-x-1/2 border-x border-[#141412]/10 md:block" />
            <div className={`${WRAP} grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4`}>
                {facts.map(([from, to, suffix, label], i) => (
                    <motion.div key={label} {...reveal(i * 0.08)} className="border-l-2 border-[#141412]/15 pl-5">
                        <p className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-[#141412] sm:text-[48px]"><Count from={from} to={to} suffix={suffix} /></p>
                        <p className="mt-2 text-[15px] text-[#141412]/70">{label}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------- Appel final */

function FinalCta() {
    return (
        <Section className="bg-white py-24 sm:py-28">
            <motion.div {...reveal()} className="grid grid-cols-1 overflow-hidden rounded-[28px] border border-black/[0.08] lg:grid-cols-[1.1fr_1fr]">
                <div className="min-w-0 p-6 sm:p-12">
                    <Eyebrow>Commencer</Eyebrow>
                    <RevealWords text="Votre prochaine vente commence ici" className={`mt-4 ${H2} text-[#141412]`} />
                    <p className="mt-5 max-w-[460px] text-[17px] leading-relaxed text-[#5F5E58]">Choisissez l’adresse de votre boutique et ajoutez vos premiers produits. Vous pourrez encaisser dès aujourd’hui.</p>
                    <div className="mt-8 max-w-[540px]"><ShopClaim /></div>
                </div>
                <div className="flex flex-col justify-center gap-px border-t border-black/[0.08] bg-black/[0.06] lg:border-l lg:border-t-0">
                    {[
                        ['Gratuit pour commencer', 'La formule Starter ne coûte rien chaque mois.'],
                        ['Sans carte bancaire', 'Vous encaissez et retirez en Mobile Money.'],
                        ['Sans engagement', 'Changez de formule ou arrêtez quand vous voulez.'],
                    ].map(([t, d], i) => (
                        <motion.div key={t} {...reveal(0.1 + i * 0.08)} className="flex flex-1 items-center gap-4 bg-[#FBFAF6] p-7 sm:px-10">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#141412]"><Check className="h-3.5 w-3.5 text-white" strokeWidth={3} /></span>
                            <span><span className="block text-[16px] font-medium text-[#141412]">{t}</span><span className="mt-0.5 block text-[14px] text-[#5F5E58]">{d}</span></span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </Section>
    );
}

export default function Welcome({ auth }) {
    return (
        <MotionConfig reducedMotion="user">
            <Head title="Biolinko : votre boutique en ligne payée en Mobile Money | Biolinko" />
            <div className="min-h-screen overflow-x-clip bg-white font-poppins text-[#141412] antialiased selection:bg-[#FFCC00]/60">
                <Header auth={auth} />
                <main>
                    <Hero />
                    <ChannelStrip />
                    <Pillars />
                    <AllFeatures />
                    <Everywhere />
                    <Trust />
                    <Facts />
                    <Pricing auth={auth} />
                    <Countries />
                    <Faq />
                    <FinalCta />
                </main>
                <Footer />
            </div>
        </MotionConfig>
    );
}
