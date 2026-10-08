import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring, useMotionValueEvent } from 'framer-motion';
import {
    ArrowRight, Check, ChevronDown, Menu, Play, X, Truck, Smartphone, FileText,
    MessageCircle, Link2, Wallet, LayoutDashboard, Store, Plus,
} from 'lucide-react';
import { CountUp, EASE_OUT, Marquee, Parallax, Reveal, Stagger, StaggerItem } from '@/Components/Motion';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/BrandIcons';

const IMG = '/images/landing';

const PRODUCTS = [
    { title: 'Robe pagne Adjoa', price: 12500, shop: 'Maison Kemi', img: `${IMG}/robe-pagne.webp` },
    { title: 'Haut kente', price: 15000, shop: 'Kente House', img: `${IMG}/haut-kente.webp` },
    { title: 'Jupe soleil', price: 11000, shop: 'Belle Awa', img: `${IMG}/jupe-soleil.webp` },
    { title: 'Robe sirène', price: 22000, shop: 'Maison Kemi', img: `${IMG}/robe-sirene.webp` },
    { title: 'Pagne wax, 6 yards', price: 9000, shop: 'Wax Market', img: `${IMG}/wax-rouleaux.webp` },
    { title: 'Tunique boubou', price: 14000, shop: 'Belle Awa', img: `${IMG}/tunique-orange.webp` },
    { title: 'Sac à chaîne', price: 8000, shop: 'Chic & Co', img: `${IMG}/sac-cuir.webp` },
    { title: 'Jupe kente', price: 9500, shop: 'Kente House', img: `${IMG}/jupe-kente.webp` },
    { title: 'Foulard de tête', price: 3500, shop: 'Wax Market', img: `${IMG}/foulard.webp` },
];

const LIVE_ORDERS = [
    { who: 'Awa, Douala', what: 'Robe pagne Adjoa, M', amount: 12875, img: `${IMG}/robe-pagne.webp`, op: 'MTN MoMo' },
    { who: 'Junior, Yaoundé', what: 'Haut kente, L', amount: 15450, img: `${IMG}/haut-kente.webp`, op: 'Orange Money' },
    { who: 'Clarisse, Bafoussam', what: 'Jupe soleil, S', amount: 11330, img: `${IMG}/jupe-soleil.webp`, op: 'MTN MoMo' },
    { who: 'Fatou, Garoua', what: 'Sac à chaîne', amount: 8240, img: `${IMG}/sac-cuir.webp`, op: 'Orange Money' },
];

const STEPS = [
    { title: 'Ajoutez vos produits', text: 'Une photo, un prix, les tailles et couleurs. Depuis votre téléphone, en quelques minutes.' },
    { title: 'Partagez votre lien', text: 'Dans votre bio Instagram et TikTok, vos statuts WhatsApp, vos réponses aux clients.' },
    { title: "Recevez l'argent", text: 'Le client confirme sur son téléphone. Vous êtes notifié, la facture part toute seule.' },
];

const SELLER_TYPES = ['Mode et pagnes', 'Mèches et beauté', 'Cosmétiques', 'Restauration', 'Électronique', 'Artisanat'];

const CYCLES = [
    { months: 1, label: 'Mensuel', discount: 0 },
    { months: 6, label: '6 mois', discount: 0.1 },
    { months: 12, label: '1 an', discount: 0.2 },
];

const PLANS = [
    { id: 'starter', name: 'Starter', sub: 'Pour tester avec vos premiers clients', cta: 'Commencer gratuitement', features: ['10 produits, 25 articles en stock', 'Paiement MTN et Orange Money', 'Factures PDF avec QR code', '1 campagne WhatsApp par mois'] },
    { id: 'pro', name: 'Pro', sub: 'Pour vendre chaque semaine', cta: 'Choisir Pro', highlight: true, features: ['50 produits, 500 articles en stock', 'Variantes et promotions', 'Factures à votre marque', 'Pixels Facebook, TikTok, Google', '4 campagnes WhatsApp par mois'] },
    { id: 'growth', name: 'Growth', sub: 'Pour un catalogue qui grandit', cta: 'Choisir Growth', features: ['Tout Pro, plus :', '250 produits, 3 000 en stock', 'Relances automatiques', '10 campagnes WhatsApp par mois', 'Statistiques avancées'] },
    { id: 'business', name: 'Business', sub: 'Pour les boutiques établies', cta: 'Choisir Business', features: ['Tout Growth, plus :', 'Produits et stock illimités', 'Export comptable CSV', '25 campagnes WhatsApp par mois', 'Conseiller dédié'] },
];

const FAQ = [
    { q: 'Quand est-ce que je reçois mon argent ?', a: 'Dès que le client confirme le paiement sur son téléphone, le montant arrive dans votre portefeuille Biolinko. Vous le retirez vers votre numéro MTN MoMo ou Orange Money à partir de 5 000 FCFA.' },
    { q: 'Combien coûte chaque vente ?', a: 'Des frais de service de 3 % sont ajoutés au panier du client. Le prix que vous fixez est celui que vous recevez.' },
    { q: 'Mes clients doivent-ils créer un compte ?', a: 'Non. Ils choisissent leurs articles, donnent leur nom et leur numéro, puis valident le paiement avec leur code secret Mobile Money.' },
    { q: 'Je peux utiliser mon logo et mes couleurs ?', a: "Oui. Logo, bannière, couleur principale et ordre des sections se règlent depuis le studio de votre boutique." },
    { q: "Je peux changer d'offre à tout moment ?", a: 'Oui. Le passage à une offre supérieure est immédiat, et vous pouvez revenir à Starter quand vous voulez.' },
];

const PHOTO_CREDITS = [
    ['Robe pagne', 'ItunuIjila', 'CC BY-SA 4.0', 'A_BEAUTIFUL_Ankara_dress.jpg'],
    ['Jupe soleil', 'Exclusive by Tola', 'CC BY-SA 4.0', 'Ankara_monostrap_dress.jpg'],
    ['Robe sirène', 'Jeremyida002', 'CC0', 'The_traditional_Ankara_dress.jpg'],
    ['Jupe kente', 'Wanjirakinyua', 'CC BY-SA 4.0', 'White_ankara_dress.jpg'],
    ['Sac à chaîne', 'Vivid Eloquence', 'CC BY-SA 4.0', 'I_Love_Naija_Shoulder_Bag.JPG'],
    ['Tunique', 'Artista Poetica', 'CC BY-SA 4.0', 'Cameroonian_model.JPG'],
    ['Foulard', 'Artista Poetica', 'CC BY-SA 4.0', 'Model_in_head_wrap.JPG'],
    ['Pagnes wax', 'Naa2Darkoa', 'CC BY-SA 4.0', 'Obaa_pa.jpg'],
    ['Haut kente', 'Nationaal Museum van Wereldculturen', 'CC BY-SA 3.0', 'Shirt_van_Afrikaanse_kente_stof-_Stichting_Nationaal_Museum_van_Wereldculturen_-_R-3633c.jpg'],
];

const fcfa = (n) => `${Math.round(n).toLocaleString('fr-FR')} FCFA`;

function Logo({ className = '' }) {
    return (
        <a href="/" className={`flex items-center gap-2.5 ${className}`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-yellow">
                <img src="/images/brand/logo-noir.png" alt="" className="h-6 w-6" />
            </span>
            <span className="text-xl font-bold tracking-tight text-brand-ink">Biolinko</span>
        </a>
    );
}

function PrimaryButton({ href, children, className = '' }) {
    return (
        <motion.a
            href={href}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-yellow px-6 text-[15px] font-semibold text-brand-ink shadow-[0_8px_20px_-10px_rgba(161,98,7,0.7)] hover:bg-brand-yellowHover ${className}`}
        >
            {children}
        </motion.a>
    );
}

function GhostButton({ href, children, className = '' }) {
    return (
        <motion.a
            href={href}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-brand-ink/15 bg-white px-5 text-[15px] font-semibold text-brand-ink hover:border-brand-ink/30 ${className}`}
        >
            {children}
        </motion.a>
    );
}

function SectionTitle({ children, sub, center = false }) {
    return (
        <Reveal className={`space-y-3 ${center ? 'mx-auto text-center' : ''} max-w-2xl`}>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-brand-ink sm:text-[42px]">{children}</h2>
            {sub && <p className="text-base leading-relaxed text-brand-muted sm:text-lg">{sub}</p>}
        </Reveal>
    );
}

/* ---------- Header ---------- */
function Header({ auth }) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 24));

    const links = [
        ['Comment ça marche', '#comment'],
        ['Boutiques', '#vitrine'],
        ['Outils', '#outils'],
        ['Tarifs', '#tarifs'],
        ['Questions', '#questions'],
    ];

    return (
        <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6">
            <motion.div
                animate={{
                    backgroundColor: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.75)',
                    boxShadow: scrolled ? '0 10px 30px -18px rgba(43,38,32,0.35)' : '0 0 0 rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.25 }}
                className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 rounded-xl border border-white/60 px-4 backdrop-blur-md sm:px-5"
            >
                <Logo />
                <nav className="hidden items-center gap-7 text-[15px] font-medium text-brand-ink/80 lg:flex">
                    {links.map(([label, href]) => (
                        <a key={href} href={href} className="relative transition-colors hover:text-brand-ink">
                            {label}
                        </a>
                    ))}
                </nav>
                <div className="hidden items-center gap-2 sm:flex">
                    {auth?.user ? (
                        <PrimaryButton href={route('dashboard')} className="h-10 px-4 text-sm">
                            <LayoutDashboard className="h-4 w-4" /> Mon tableau de bord
                        </PrimaryButton>
                    ) : (
                        <>
                            <Link href={route('login')} className="px-3 text-[15px] font-medium text-brand-ink/80 hover:text-brand-ink">Se connecter</Link>
                            <PrimaryButton href={route('register')} className="h-10 px-4 text-sm">Créer ma boutique</PrimaryButton>
                        </>
                    )}
                </div>
                <button type="button" onClick={() => setOpen(!open)} className="flex h-11 w-11 items-center justify-center rounded-lg lg:hidden" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}>
                    {open ? <X className="h-5 w-5 text-brand-ink" /> : <Menu className="h-5 w-5 text-brand-ink" />}
                </button>
            </motion.div>

            <AnimatePresence>
                {open && (
                    <motion.nav
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="mx-auto mt-2 max-w-6xl rounded-xl border border-brand-line bg-white p-3 shadow-lg lg:hidden"
                    >
                        {links.map(([label, href]) => (
                            <a key={href} href={href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-3 text-base font-medium text-brand-ink hover:bg-brand-cream">{label}</a>
                        ))}
                        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-brand-line pt-3">
                            {auth?.user ? (
                                <PrimaryButton href={route('dashboard')} className="col-span-2">Mon tableau de bord</PrimaryButton>
                            ) : (
                                <>
                                    <GhostButton href={route('login')}>Se connecter</GhostButton>
                                    <PrimaryButton href={route('register')}>Créer ma boutique</PrimaryButton>
                                </>
                            )}
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}

/* ---------- Hero ---------- */
function LiveOrderCard() {
    const [i, setI] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setI((v) => (v + 1) % LIVE_ORDERS.length), 2800);
        return () => clearInterval(t);
    }, []);
    const o = LIVE_ORDERS[i];
    return (
        <div className="w-[260px] rounded-lg border border-brand-line bg-white p-3.5 shadow-[0_20px_40px_-20px_rgba(43,38,32,0.45)]">
            <div className="mb-2.5 flex items-center justify-between text-xs font-medium text-brand-muted">
                <span>Commandes en direct</span>
                <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
                </span>
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                    className="flex items-center gap-3"
                >
                    <img src={o.img} alt="" className="h-14 w-11 rounded-md object-cover" />
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-brand-ink">{o.who}</div>
                        <div className="truncate text-xs text-brand-muted">{o.what}</div>
                        <div className="mt-0.5 text-[15px] font-bold text-brand-ink">{fcfa(o.amount)}</div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function Hero({ auth }) {
    const words = ['Vendez', 'en', 'ligne.', 'Encaissez', 'par'];
    return (
        <section className="relative overflow-hidden bg-brand-yellow pb-20 pt-10 sm:pb-28">
            <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(43,38,32,0.14)_1.2px,transparent_1.3px)] [background-size:22px_22px]" />
            <motion.img
                src="/images/brand/logo-noir-hd.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -right-32 top-24 hidden w-[520px] opacity-[0.06] md:block"
                animate={{ rotate: 360 }}
                transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
                <div className="space-y-7">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE_OUT }}
                        className="inline-flex items-center gap-2.5 rounded-md bg-white/80 py-1.5 pl-1.5 pr-3 text-sm font-medium text-brand-ink"
                    >
                        <span className="flex">
                            <span className="h-5 w-5 rounded-full border-2 border-white bg-brand-yellow" />
                            <span className="-ml-1.5 h-5 w-5 rounded-full border-2 border-white bg-[#FF7900]" />
                        </span>
                        MTN MoMo et Orange Money intégrés
                    </motion.div>

                    <h1 className="text-[42px] font-extrabold leading-[1.02] tracking-tight text-brand-ink sm:text-6xl lg:text-[66px]">
                        {words.map((w, idx) => (
                            <motion.span
                                key={idx}
                                className="mr-[0.25em] inline-block"
                                initial={{ opacity: 0, y: 28 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.1 + idx * 0.07 }}
                            >
                                {w}
                            </motion.span>
                        ))}
                        <motion.span
                            className="relative inline-block"
                            initial={{ opacity: 0, y: 28 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.5 }}
                        >
                            <motion.span
                                className="absolute inset-x-[-6px] bottom-1 top-2 -z-0 rounded-md bg-white"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                style={{ originX: 0 }}
                                transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.85 }}
                            />
                            <span className="relative">Mobile Money.</span>
                        </motion.span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.6 }}
                        className="max-w-lg text-lg leading-relaxed text-brand-ink/80"
                    >
                        Votre catalogue dans un lien. Vos clients choisissent, paient avec leur téléphone, et vous recevez l'argent dans votre portefeuille. Fini les captures d'écran et les DM.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.72 }}
                        className="flex flex-wrap gap-3"
                    >
                        <motion.a
                            href={auth?.user ? route('dashboard') : route('register')}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 text-[15px] font-semibold text-brand-ink shadow-[0_10px_24px_-14px_rgba(43,38,32,0.6)]"
                        >
                            {auth?.user ? 'Aller à mon tableau de bord' : 'Créer ma boutique gratuitement'}
                            <ArrowRight className="h-4 w-4" />
                        </motion.a>
                        <motion.a
                            href="#vitrine"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex h-12 items-center gap-2 rounded-lg border border-brand-ink/20 px-5 text-[15px] font-semibold text-brand-ink hover:bg-white/40"
                        >
                            <Play className="h-4 w-4 fill-current" /> Voir une boutique
                        </motion.a>
                    </motion.div>

                    <Stagger className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-brand-ink/80" gap={0.08}>
                        {['Gratuit jusqu’à 10 produits', 'Boutique prête en 5 minutes', 'Sans carte bancaire'].map((t) => (
                            <StaggerItem key={t} y={8} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-brand-ink" /> {t}
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.3 }}
                    className="relative mx-auto h-[520px] w-full max-w-[520px] sm:h-[580px]"
                >
                    <Parallax strength={24} className="absolute right-0 top-0 h-[480px] w-[86%] overflow-hidden rounded-xl border-[6px] border-white bg-brand-yellowLight shadow-[0_40px_80px_-40px_rgba(43,38,32,0.6)] sm:h-[540px]">
                        <img src={`${IMG}/hero-vendeuse.webp`} alt="Vendeuse qui montre sa boutique Biolinko sur son téléphone" className="-mt-[6%] h-[112%] w-full object-cover object-top" />
                    </Parallax>

                    <motion.div
                        className="absolute left-0 top-12"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <LiveOrderCard />
                    </motion.div>

                    <motion.div
                        className="absolute bottom-6 left-4 w-[230px] rounded-lg border border-brand-line bg-white p-4 shadow-[0_20px_40px_-20px_rgba(43,38,32,0.45)]"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                    >
                        <div className="text-xs font-medium text-brand-muted">Solde disponible</div>
                        <div className="text-2xl font-bold text-brand-ink">
                            <CountUp to={184500} /> <span className="text-base font-semibold">FCFA</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-700">
                            <Wallet className="h-3.5 w-3.5" /> Retrait vers MoMo en 1 clic
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

/* ---------- Sections ---------- */
function ProductsMarquee() {
    return (
        <section className="bg-white py-20">
            <div className="mx-auto mb-10 flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4 sm:px-6">
                <SectionTitle>Mode, pagnes, beauté : tout se vend avec un lien.</SectionTitle>
                <Reveal delay={0.1} className="max-w-sm text-base text-brand-muted">
                    Des produits tels qu'ils apparaissent dans une vitrine Biolinko.
                </Reveal>
            </div>
            <Marquee speed={45}>
                {PRODUCTS.map((p) => (
                    <motion.article key={p.title} whileHover={{ y: -6 }} transition={{ duration: 0.25 }} className="w-[210px] shrink-0">
                        <div className="relative h-[260px] overflow-hidden rounded-lg bg-brand-cream">
                            <img src={p.img} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                            <span className="absolute left-2.5 top-2.5 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-brand-ink">{p.shop}</span>
                        </div>
                        <div className="mt-3 text-[15px] font-semibold text-brand-ink">{p.title}</div>
                        <div className="text-[15px] text-brand-muted">{fcfa(p.price)}</div>
                    </motion.article>
                ))}
            </Marquee>
        </section>
    );
}

function HowItWorks() {
    return (
        <section id="comment" className="bg-brand-cream py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionTitle center>Trois étapes entre votre téléphone et votre premier paiement.</SectionTitle>
                <div className="relative mt-16">
                    <motion.div
                        className="absolute left-0 right-0 top-6 hidden h-px bg-brand-ink/20 md:block"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 1.2, ease: EASE_OUT }}
                        style={{ originX: 0 }}
                    />
                    <Stagger gap={0.18} className="grid gap-10 md:grid-cols-3">
                        {STEPS.map((s, i) => (
                            <StaggerItem key={s.title} className="relative space-y-4">
                                <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-yellow text-lg font-bold text-brand-ink">{i + 1}</span>
                                <h3 className="text-xl font-semibold text-brand-ink">{s.title}</h3>
                                <p className="leading-relaxed text-brand-muted">{s.text}</p>
                                {i === 0 && (
                                    <div className="flex items-center gap-3 rounded-lg border border-brand-line bg-white p-3">
                                        <img src={`${IMG}/jupe-kente.webp`} alt="" className="h-14 w-11 rounded-md object-cover" />
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-brand-ink">Jupe kente</div>
                                            <div className="mt-1 flex gap-1 text-xs">
                                                {['S', 'M', 'L'].map((t, k) => (
                                                    <span key={t} className={`rounded px-1.5 py-0.5 ${k === 0 ? 'bg-brand-yellow text-brand-ink' : 'bg-brand-sand text-brand-muted'}`}>{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-sm font-semibold text-brand-ink">9 500 F</span>
                                    </div>
                                )}
                                {i === 1 && (
                                    <div className="space-y-2 text-sm">
                                        <div className="w-fit rounded-lg rounded-bl-sm bg-white px-3 py-2 text-brand-ink">C'est combien la jupe kente ?</div>
                                        <div className="ml-auto w-fit rounded-lg rounded-br-sm bg-[#DCF8C6] px-3 py-2 text-brand-ink">Tout est ici : <b className="font-semibold">biolinko.link/kemi</b></div>
                                    </div>
                                )}
                                {i === 2 && (
                                    <div className="flex items-center gap-3 rounded-lg border border-brand-line bg-white p-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100"><Check className="h-5 w-5 text-green-700" /></span>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-brand-ink">Paiement reçu</div>
                                            <div className="text-xs text-brand-muted">Orange Money, il y a 1 min</div>
                                        </div>
                                        <span className="text-sm font-semibold text-brand-ink">9 785 F</span>
                                    </div>
                                )}
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>
            </div>
        </section>
    );
}

function Showcase() {
    const features = [
        ['Ventes flash', 'Prix barrés et minuteur'],
        ['Vos couleurs', 'Logo, bannière, thème'],
        ['Avis clients', 'Affichés sur la vitrine'],
        ['Suivi de commande', 'Lien envoyé au client'],
    ];
    return (
        <section id="vitrine" className="overflow-hidden bg-white py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="space-y-7">
                    <SectionTitle sub="Bannière, collections, ventes flash avec compte à rebours, avis clients et bouton WhatsApp. Votre boutique prend vos couleurs et reste rapide sur tous les téléphones.">
                        Une vitrine qui donne envie d'acheter.
                    </SectionTitle>
                    <Stagger className="grid grid-cols-2 gap-x-6 gap-y-5">
                        {features.map(([t, s]) => (
                            <StaggerItem key={t} className="border-l-2 border-brand-yellow pl-3">
                                <div className="font-semibold text-brand-ink">{t}</div>
                                <div className="text-sm text-brand-muted">{s}</div>
                            </StaggerItem>
                        ))}
                    </Stagger>
                    <Reveal delay={0.2}>
                        <PrimaryButton href="#tarifs">Ouvrir ma vitrine <ArrowRight className="h-4 w-4" /></PrimaryButton>
                    </Reveal>
                </div>

                <Reveal y={40} className="relative pb-10">
                    <div className="overflow-hidden rounded-xl border border-brand-line bg-white shadow-[0_50px_100px_-50px_rgba(43,38,32,0.55)]">
                        <div className="flex h-9 items-center gap-1.5 border-b border-brand-line bg-brand-sand px-3">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#4ADE80]" />
                            <span className="ml-3 flex h-6 flex-1 items-center rounded bg-white px-3 text-xs text-brand-muted">biolinko.link/maison-kemi</span>
                        </div>
                        <img src={`${IMG}/app-vitrine.webp`} alt="Capture d'une vitrine Biolinko" loading="lazy" className="block w-full" />
                    </div>
                    <motion.div
                        className="absolute -bottom-1 right-4 flex items-center gap-3 rounded-lg border border-brand-line bg-white px-3.5 py-2.5 shadow-[0_20px_40px_-20px_rgba(43,38,32,0.5)]"
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
                    >
                        <img src={`${IMG}/robe-sirene.webp`} alt="" className="h-12 w-10 rounded object-cover" />
                        <div>
                            <div className="text-sm font-semibold text-brand-ink">Ajouté au panier</div>
                            <div className="text-xs text-brand-muted">Robe sirène, taille M</div>
                        </div>
                    </motion.div>
                </Reveal>
            </div>
        </section>
    );
}

function Tools() {
    return (
        <section id="outils" className="bg-brand-cream py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <SectionTitle>Tout ce qu'il faut pour gérer vos ventes.</SectionTitle>
                    <Reveal delay={0.1} className="max-w-sm text-base text-brand-muted">Un seul tableau de bord pour les commandes, l'argent, les clients et les relances.</Reveal>
                </div>

                <Stagger className="mt-12 grid gap-5 md:grid-cols-6">
                    <StaggerItem className="overflow-hidden rounded-xl border border-brand-line bg-white md:col-span-4">
                        <motion.div whileHover={{ y: -4 }} className="h-full">
                            <div className="space-y-1.5 p-6">
                                <h3 className="text-xl font-semibold text-brand-ink">Tableau de bord</h3>
                                <p className="text-brand-muted">Chiffre d'affaires, commandes à livrer, meilleurs produits.</p>
                            </div>
                            <div className="ml-6 overflow-hidden rounded-tl-lg border-l border-t border-brand-line">
                                <img src={`${IMG}/app-dashboard.webp`} alt="Capture du tableau de bord vendeur" loading="lazy" className="block w-full" />
                            </div>
                        </motion.div>
                    </StaggerItem>

                    <StaggerItem className="flex flex-col rounded-xl bg-brand-yellow p-6 md:col-span-2">
                        <h3 className="text-xl font-semibold text-brand-ink">Retrait Mobile Money</h3>
                        <p className="mt-1.5 text-brand-ink/75">Votre argent vers votre numéro, dès 5 000 FCFA.</p>
                        <div className="mt-auto space-y-3 rounded-lg bg-white p-4 pt-4">
                            <div className="text-xs font-medium text-brand-muted">Solde disponible</div>
                            <div className="text-2xl font-bold text-brand-ink"><CountUp to={184500} /> F</div>
                            <motion.div whileHover={{ scale: 1.02 }} className="flex h-10 items-center justify-center rounded-md bg-brand-yellow text-sm font-semibold text-brand-ink">Retirer vers MoMo</motion.div>
                        </div>
                    </StaggerItem>

                    {[
                        { Icon: FileText, title: 'Factures automatiques', text: 'PDF avec QR code, envoyé au client après chaque paiement.', extra: (
                            <div className="flex justify-between rounded-md bg-brand-sand p-3 text-sm"><span className="text-brand-ink">Facture BLK-2041</span><span className="font-medium text-green-700">Payée</span></div>
                        ) },
                        { Icon: MessageCircle, title: 'Relances WhatsApp', text: "Un message aux clients qui n'ont pas fini de payer.", extra: (
                            <div className="rounded-lg rounded-br-sm bg-[#DCF8C6] p-3 text-sm text-brand-ink">Bonjour Awa, votre robe vous attend. Finalisez ici : biolinko.link/c/8F2K</div>
                        ) },
                        { Icon: Link2, title: 'SmartLinks', text: 'Un lien de paiement pour un produit, à coller dans un statut ou une pub.', extra: (
                            <div className="flex items-center justify-between rounded-md border border-brand-line p-2 pl-3 text-sm"><span className="truncate text-brand-ink">biolinko.link/p/robe-adjoa</span><span className="rounded bg-brand-yellow px-2 py-1 text-xs font-medium text-brand-ink">Copier</span></div>
                        ) },
                    ].map(({ Icon, title, text, extra }) => (
                        <StaggerItem key={title} className="md:col-span-2">
                            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="flex h-full flex-col gap-3 rounded-xl border border-brand-line bg-white p-6">
                                <Icon className="h-5 w-5 text-brand-ink" />
                                <h3 className="text-lg font-semibold text-brand-ink">{title}</h3>
                                <p className="text-[15px] text-brand-muted">{text}</p>
                                <div className="mt-auto">{extra}</div>
                            </motion.div>
                        </StaggerItem>
                    ))}
                </Stagger>
            </div>
        </section>
    );
}

function ForWho() {
    return (
        <section className="overflow-hidden bg-white py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
                <Reveal y={40} className="relative mx-auto w-full max-w-md">
                    <motion.div
                        className="absolute inset-0 translate-x-5 translate-y-5 rounded-xl bg-brand-yellow"
                        initial={{ opacity: 0, x: 0, y: 0 }}
                        whileInView={{ opacity: 1, x: 20, y: 20 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 }}
                    />
                    <img src={`${IMG}/portrait-amina.webp`} alt="Vendeuse en ligne avec son téléphone" loading="lazy" className="relative aspect-[4/5] w-full rounded-xl object-cover" />
                    <motion.div
                        className="absolute -left-3 bottom-10 flex items-center gap-2 rounded-lg border border-brand-line bg-white px-3.5 py-2.5 text-sm font-medium text-brand-ink shadow-lg"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <span className="h-2 w-2 rounded-full bg-green-600" /> Boutique ouverte 24 h/24
                    </motion.div>
                </Reveal>

                <div className="space-y-7">
                    <SectionTitle sub="Vous avez des clients, des photos et un téléphone. Biolinko range le reste : catalogue, paiements, commandes et factures.">
                        Fait pour celles et ceux qui vendent déjà sur WhatsApp.
                    </SectionTitle>
                    <Stagger gap={0.05} className="flex flex-wrap gap-2">
                        {SELLER_TYPES.map((t) => (
                            <StaggerItem key={t} y={10} className="rounded-md bg-brand-cream px-3 py-2 text-sm font-medium text-brand-ink">{t}</StaggerItem>
                        ))}
                    </Stagger>
                    <Stagger className="divide-y divide-brand-line border-y border-brand-line">
                        {[
                            [false, "Plus de captures d'écran de paiement à vérifier"],
                            [false, 'Plus de prix à répéter dans chaque DM'],
                            [true, 'Des commandes payées, rangées, prêtes à livrer'],
                        ].map(([ok, t]) => (
                            <StaggerItem key={t} className="flex items-center gap-3 py-4">
                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${ok ? 'bg-brand-yellow' : 'bg-brand-sand'}`}>
                                    {ok ? <Check className="h-4 w-4 text-brand-ink" /> : <X className="h-4 w-4 text-brand-muted" />}
                                </span>
                                <span className="text-[17px] text-brand-ink">{t}</span>
                            </StaggerItem>
                        ))}
                    </Stagger>
                </div>
            </div>
        </section>
    );
}

function Pricing({ auth }) {
    const prices = usePage().props.planPrices || {};
    const [cycle, setCycle] = useState(1);
    const current = CYCLES.find((c) => c.months === cycle);

    return (
        <section id="tarifs" className="bg-brand-cream py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <SectionTitle center>Commencez gratuitement. Passez à la suite quand vous vendez plus.</SectionTitle>

                <Reveal delay={0.1} className="mt-8 flex justify-center">
                    <div role="tablist" aria-label="Durée d'abonnement" className="relative flex rounded-lg border border-brand-line bg-white p-1">
                        {CYCLES.map((c) => (
                            <button
                                key={c.months}
                                type="button"
                                role="tab"
                                aria-selected={cycle === c.months}
                                onClick={() => setCycle(c.months)}
                                className="relative flex h-10 items-center gap-1.5 px-4 text-sm font-medium text-brand-ink"
                            >
                                {cycle === c.months && (
                                    <motion.span layoutId="cycle-pill" className="absolute inset-0 rounded-md bg-brand-yellow" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                                )}
                                <span className="relative">{c.label}</span>
                                {c.discount > 0 && <span className="relative rounded bg-green-100 px-1.5 text-xs text-green-800">-{c.discount * 100} %</span>}
                            </button>
                        ))}
                    </div>
                </Reveal>

                <Stagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {PLANS.map((p) => {
                        const base = Number(prices[p.id] || 0);
                        const total = Math.round(base * current.months * (1 - current.discount));
                        const monthly = Math.round(total / current.months);
                        return (
                            <StaggerItem key={p.id} className="h-full">
                                <motion.div
                                    whileHover={{ y: -6 }}
                                    transition={{ duration: 0.25 }}
                                    className={`flex h-full flex-col gap-4 rounded-xl bg-white p-6 ${p.highlight ? 'border-2 border-brand-yellow shadow-[0_30px_60px_-35px_rgba(161,98,7,0.7)]' : 'border border-brand-line'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-brand-ink">{p.name}</h3>
                                        {p.highlight && <span className="rounded bg-brand-yellow px-2 py-0.5 text-xs font-medium text-brand-ink">Le plus choisi</span>}
                                    </div>
                                    <p className="-mt-2 text-sm text-brand-muted">{p.sub}</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <AnimatePresence mode="popLayout">
                                            <motion.span
                                                key={monthly}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.25 }}
                                                className="text-4xl font-bold tracking-tight text-brand-ink"
                                            >
                                                {monthly.toLocaleString('fr-FR')}
                                            </motion.span>
                                        </AnimatePresence>
                                        <span className="text-sm text-brand-muted">FCFA / mois</span>
                                    </div>
                                    <div className="min-h-[20px] text-sm text-brand-muted">
                                        {base === 0 ? 'Gratuit, sans limite de durée' : current.months === 1 ? 'Facturé chaque mois' : `${total.toLocaleString('fr-FR')} FCFA pour ${current.months} mois`}
                                    </div>
                                    <a
                                        href={auth?.user ? route('dashboard') : route('register')}
                                        className={`flex h-11 items-center justify-center rounded-lg text-[15px] font-semibold transition-colors ${p.highlight ? 'bg-brand-yellow text-brand-ink hover:bg-brand-yellowHover' : 'border border-brand-ink/15 text-brand-ink hover:border-brand-ink/35'}`}
                                    >
                                        {p.cta}
                                    </a>
                                    <ul className="mt-1 space-y-2.5">
                                        {p.features.map((f) => (
                                            <li key={f} className="flex gap-2.5 text-[15px] text-brand-ink/90">
                                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B38F00]" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </StaggerItem>
                        );
                    })}
                </Stagger>
            </div>
        </section>
    );
}

function Faq() {
    const [open, setOpen] = useState(0);
    return (
        <section id="questions" className="bg-white py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
                <SectionTitle center>Vos questions</SectionTitle>
                <Stagger className="mt-10 divide-y divide-brand-line border-y border-brand-line">
                    {FAQ.map((f, i) => {
                        const isOpen = open === i;
                        return (
                            <StaggerItem key={f.q}>
                                <button
                                    type="button"
                                    onClick={() => setOpen(isOpen ? -1 : i)}
                                    aria-expanded={isOpen}
                                    className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-medium text-brand-ink"
                                >
                                    {f.q}
                                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isOpen ? 'bg-brand-yellow' : 'bg-brand-sand'}`}>
                                        <Plus className="h-4 w-4 text-brand-ink" />
                                    </motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: EASE_OUT }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pb-5 pr-12 leading-relaxed text-brand-muted">{f.a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </StaggerItem>
                        );
                    })}
                </Stagger>
            </div>
        </section>
    );
}

function FinalCta({ auth }) {
    return (
        <section className="bg-white pb-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="relative overflow-hidden rounded-xl bg-brand-yellow px-6 py-14 sm:px-14">
                    <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgba(43,38,32,0.14)_1.2px,transparent_1.3px)] [background-size:22px_22px]" />
                    <motion.img
                        src="/images/brand/logo-noir-hd.png"
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-10 -top-10 w-64 opacity-10"
                        animate={{ y: [0, 14, 0], rotate: [0, 6, 0] }}
                        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="relative flex flex-wrap items-center justify-between gap-8">
                        <div className="max-w-xl space-y-3">
                            <h2 className="text-3xl font-bold leading-tight tracking-tight text-brand-ink sm:text-[44px]">Ouvrez votre boutique ce soir. Encaissez demain.</h2>
                            <p className="text-lg text-brand-ink/75">Gratuit pour commencer. Aucune carte bancaire.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <motion.a
                                href={auth?.user ? route('dashboard') : route('register')}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-white px-7 text-base font-semibold text-brand-ink shadow-[0_12px_28px_-14px_rgba(43,38,32,0.6)]"
                            >
                                Créer ma boutique <ArrowRight className="h-4 w-4" />
                            </motion.a>
                            <a href="https://wa.me/" className="inline-flex items-center justify-center gap-2 text-sm font-medium text-brand-ink/80 hover:text-brand-ink">
                                <WhatsappIcon className="h-4 w-4" /> Parler à l'équipe sur WhatsApp
                            </a>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

function Footer() {
    const [credits, setCredits] = useState(false);
    const cols = [
        ['Produit', [['Vitrine en ligne', '#vitrine'], ['Paiement Mobile Money', '#comment'], ['SmartLinks', '#outils'], ['Tarifs', '#tarifs']]],
        ['Ressources', [['Questions fréquentes', '#questions'], ['Se connecter', route('login')], ['Créer un compte', route('register')]]],
        ['Légal', [["Conditions d'utilisation", route('legal.terms')], ['Confidentialité', route('legal.privacy')], ['Cookies', route('legal.cookies')]]],
    ];
    return (
        <footer className="border-t border-brand-line bg-brand-sand pb-8 pt-16 text-brand-muted">
            <div className="mx-auto max-w-6xl space-y-12 px-4 sm:px-6">
                <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
                    <div className="space-y-5">
                        <Logo />
                        <p className="max-w-xs leading-relaxed">La boutique en ligne des vendeurs WhatsApp, payée par Mobile Money.</p>
                        <div className="flex gap-2">
                            {[[InstagramIcon, 'Instagram'], [TiktokIcon, 'TikTok'], [FacebookIcon, 'Facebook'], [WhatsappIcon, 'WhatsApp']].map(([Icon, label]) => (
                                <motion.a key={label} href="#" aria-label={label} whileHover={{ y: -3 }} className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-line bg-white text-brand-ink hover:border-brand-ink/30">
                                    <Icon className="h-[18px] w-[18px]" />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                    {cols.map(([title, links]) => (
                        <div key={title} className="space-y-3">
                            <div className="font-semibold text-brand-ink">{title}</div>
                            {links.map(([label, href]) => (
                                <a key={label} href={href} className="block hover:text-brand-ink">{label}</a>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-line pt-6 text-sm">
                    <span>© {new Date().getFullYear()} Biolinko. Fait au Cameroun, pour l'Afrique.</span>
                    <div className="flex items-center gap-2">
                        <span>Paiements acceptés</span>
                        <span className="rounded bg-brand-yellow px-2 py-1 text-xs font-medium text-brand-ink">MTN MoMo</span>
                        <span className="rounded bg-[#FF7900] px-2 py-1 text-xs font-medium text-white">Orange Money</span>
                    </div>
                    <button type="button" onClick={() => setCredits(!credits)} className="inline-flex items-center gap-1 hover:text-brand-ink" aria-expanded={credits}>
                        Crédits photos <ChevronDown className={`h-4 w-4 transition-transform ${credits ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                <AnimatePresence initial={false}>
                    {credits && (
                        <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="grid gap-1 overflow-hidden text-xs sm:grid-cols-2">
                            {PHOTO_CREDITS.map(([what, author, licence, file]) => (
                                <li key={file}>
                                    {what} : <a className="underline" href={`https://commons.wikimedia.org/wiki/File:${file}`} target="_blank" rel="noreferrer">{author}</a>, {licence}, via Wikimedia Commons
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        </footer>
    );
}

export default function Welcome({ auth }) {
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

    return (
        <MotionConfig reducedMotion="user">
            <Head title="Biolinko, la boutique en ligne payée par Mobile Money">
                <meta name="description" content="Créez votre boutique en ligne en 5 minutes, partagez votre lien sur WhatsApp et encaissez par MTN MoMo et Orange Money." />
            </Head>
            <motion.div style={{ scaleX: progress, originX: 0 }} className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-brand-ink/70" />

            <div className="min-h-screen bg-brand-yellow font-sans text-brand-ink antialiased">
                <div className="border-b border-brand-ink/10 bg-brand-yellowLight text-center text-sm text-brand-ink">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 py-2">
                        <span className="rounded bg-brand-yellow px-1.5 py-0.5 text-xs font-semibold">Nouveau</span>
                        <span className="hidden sm:inline">L'export comptable CSV de vos ventes est disponible sur l'offre Business.</span>
                        <span className="sm:hidden">Export CSV de vos ventes</span>
                        <a href="#tarifs" className="font-semibold underline underline-offset-2">Voir les offres</a>
                    </div>
                </div>
                <Header auth={auth} />
                <Hero auth={auth} />
                <ProductsMarquee />
                <HowItWorks />
                <Showcase />
                <Tools />
                <ForWho />
                <Pricing auth={auth} />
                <Faq />
                <FinalCta auth={auth} />
                <Footer />
            </div>
        </MotionConfig>
    );
}
