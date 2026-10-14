import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BarChart3, Bell, Check, Link2, Play, QrCode, Receipt, ShoppingBag, Star, Truck, Users, Wallet } from 'lucide-react';
import { EASE_OUT } from '@/Components/Motion';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/BrandIcons';

const IMG = '/images/landing';

/* ---------- Pastilles qui gravitent ---------- */
const Operator = ({ label, bg, fg }) => (
    <span className="flex h-full w-full items-center justify-center rounded-full text-[11px] font-bold" style={{ backgroundColor: bg, color: fg }}>{label}</span>
);

const RINGS = [
    {
        radius: 420, duration: 70, reverse: false,
        chips: [
            { angle: -20, label: 'WhatsApp', node: <WhatsappIcon className="h-6 w-6 text-[#16A34A]" /> },
            { angle: 160, label: 'Instagram', node: <InstagramIcon className="h-6 w-6 text-[#D62976]" /> },
            { angle: 70, label: 'MTN MoMo', node: <Operator label="MTN" bg="#FFCC00" fg="#2B2620" /> },
            { angle: 250, label: 'Orange Money', node: <Operator label="OM" bg="#FF7900" fg="#FFFFFF" /> },
        ],
    },
    {
        radius: 570, duration: 95, reverse: true,
        chips: [
            { angle: 15, label: 'TikTok', node: <TiktokIcon className="h-6 w-6 text-brand-ink" /> },
            { angle: 95, label: 'Factures', node: <Receipt className="h-6 w-6 text-[#B38F00]" /> },
            { angle: 195, label: 'Facebook', node: <FacebookIcon className="h-6 w-6 text-[#1877F2]" /> },
            { angle: 275, label: 'QR code', node: <QrCode className="h-6 w-6 text-brand-ink" /> },
            { angle: 330, label: 'Livraison', node: <Truck className="h-6 w-6 text-[#B38F00]" /> },
        ],
    },
    {
        radius: 720, duration: 130, reverse: false,
        chips: [
            { angle: -45, label: 'Portefeuille', node: <Wallet className="h-6 w-6 text-[#15803D]" /> },
            { angle: 30, label: 'Statistiques', node: <BarChart3 className="h-6 w-6 text-[#2563EB]" /> },
            { angle: 140, label: 'SmartLinks', node: <Link2 className="h-6 w-6 text-brand-ink" /> },
            { angle: 215, label: 'Notifications', node: <Bell className="h-6 w-6 text-[#B38F00]" /> },
            { angle: 300, label: 'Clients', node: <Users className="h-6 w-6 text-brand-ink" /> },
        ],
    },
];

function Ring({ radius, duration, reverse, chips, arcFrom }) {
    const gid = useId().replace(/:/g, '');
    const size = radius * 2;
    const circumference = 2 * Math.PI * (radius - 1);
    const spin = reverse ? -360 : 360;
    const loop = { duration, repeat: Infinity, ease: 'linear' };

    return (
        <motion.div
            className="absolute left-1/2 top-1/2"
            style={{ width: size, height: size, marginLeft: -radius, marginTop: -radius }}
            animate={{ rotate: spin }}
            transition={loop}
        >
            <div className="absolute inset-0 rounded-full border border-brand-ink/[0.07]" />
            {/* arc lumineux qui glisse sur l'orbite */}
            <svg className="absolute inset-0" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
                <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#FFCC00" stopOpacity="0" />
                        <stop offset="60%" stopColor="#FFCC00" stopOpacity="1" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
                    </linearGradient>
                </defs>
                <circle
                    cx={radius}
                    cy={radius}
                    r={radius - 1}
                    fill="none"
                    stroke={`url(#${gid})`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference * 0.12} ${circumference}`}
                    strokeDashoffset={-circumference * arcFrom}
                />
            </svg>

            {chips.map((c) => (
                <div
                    key={c.label}
                    className="absolute left-1/2 top-1/2 hidden md:block"
                    style={{ transform: `rotate(${c.angle}deg) translate(${radius}px) rotate(${-c.angle}deg)` }}
                >
                    {/* contre-rotation : la pastille reste droite */}
                    <motion.div animate={{ rotate: -spin }} transition={loop}>
                        <motion.div
                            whileHover={{ scale: 1.15 }}
                            className="-ml-7 -mt-7 flex h-14 w-14 items-center justify-center rounded-full border border-brand-line bg-white p-2.5 shadow-[0_10px_24px_-12px_rgba(43,38,32,0.35)]"
                            title={c.label}
                        >
                            {c.node}
                        </motion.div>
                    </motion.div>
                </div>
            ))}
        </motion.div>
    );
}

/* ---------- Mot qui change dans le titre ---------- */
const CHANNELS = [
    { word: 'WhatsApp', color: '#16A34A' },
    { word: 'Instagram', color: '#D62976' },
    { word: 'TikTok', color: '#2B2620' },
    { word: 'Facebook', color: '#1877F2' },
];

function RotatingChannel() {
    const [i, setI] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setI((v) => (v + 1) % CHANNELS.length), 2400);
        return () => clearInterval(t);
    }, []);
    const c = CHANNELS[i];
    return (
        <motion.span layout className="relative inline-flex overflow-hidden px-1 align-bottom" transition={{ duration: 0.35, ease: EASE_OUT }}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={c.word}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                    className="inline-block"
                    style={{ color: c.color }}
                >
                    {c.word}
                </motion.span>
            </AnimatePresence>
        </motion.span>
    );
}

/* ---------- Pile de notifications ---------- */
const FEED = [
    { id: 'pay', img: `${IMG}/robe-pagne.webp`, title: 'Awa a payé 12 875 FCFA', sub: 'MTN MoMo, Robe pagne Adjoa', badge: <Check className="h-3 w-3 text-white" />, badgeBg: '#16A34A' },
    { id: 'order', img: `${IMG}/haut-kente.webp`, title: 'Nouvelle commande', sub: 'Junior, Yaoundé : Haut kente, L', badge: <ShoppingBag className="h-3 w-3 text-brand-ink" />, badgeBg: '#FFCC00' },
    { id: 'invoice', icon: <Receipt className="h-5 w-5 text-[#B38F00]" />, title: 'Facture envoyée sur WhatsApp', sub: 'BLK-2041, payée' },
    { id: 'review', img: `${IMG}/jupe-soleil.webp`, title: 'Nouvel avis 5 étoiles', sub: '« Couture propre, livraison rapide »', badge: <Star className="h-3 w-3 fill-white text-white" />, badgeBg: '#F5B800' },
    { id: 'withdraw', icon: <Wallet className="h-5 w-5 text-[#15803D]" />, title: 'Retrait de 50 000 FCFA réussi', sub: 'Vers Orange Money' },
];

function NotificationStack() {
    const [head, setHead] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setHead((v) => v + 1), 2600);
        return () => clearInterval(t);
    }, []);
    const n = FEED.length;
    const visible = [0, 1, 2].map((rank) => ({ rank, item: FEED[((head - rank) % n + n) % n] }));

    return (
        <div className="relative mx-auto h-[190px] w-full max-w-[380px]">
            <div className="pointer-events-none absolute -inset-x-16 -bottom-10 top-6 rounded-full bg-brand-yellow/50 blur-3xl" aria-hidden="true" />
            <AnimatePresence initial={false}>
                {visible.map(({ rank, item }) => (
                    <motion.div
                        key={`${item.id}-${head - rank}`}
                        initial={{ opacity: 0, y: -28, scale: 1.04 }}
                        animate={{ opacity: 1 - rank * 0.22, y: rank * 54, scale: 1 - rank * 0.05 }}
                        exit={{ opacity: 0, y: 150, scale: 0.85 }}
                        transition={{ duration: 0.55, ease: EASE_OUT }}
                        style={{ zIndex: 10 - rank }}
                        className="absolute inset-x-0 top-0 flex items-center gap-3 rounded-lg border border-brand-line bg-white px-3.5 py-3 text-left shadow-[0_18px_40px_-22px_rgba(43,38,32,0.45)]"
                    >
                        <span className="relative shrink-0">
                            {item.img ? (
                                <img src={item.img} alt="" className="h-10 w-10 rounded-full object-cover" />
                            ) : (
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sand">{item.icon}</span>
                            )}
                            {item.badge && (
                                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white" style={{ backgroundColor: item.badgeBg }}>{item.badge}</span>
                            )}
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-[15px] font-semibold text-brand-ink">{item.title}</span>
                            <span className="block truncate text-sm text-brand-muted">{item.sub}</span>
                        </span>
                        <span className="shrink-0 text-xs text-brand-muted">à l'instant</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

/* ---------- Bandeau « fonctionne avec » ---------- */
const WORKS_WITH = [
    ['WhatsApp', <WhatsappIcon key="w" className="h-5 w-5" />, '#16A34A'],
    ['Instagram', <InstagramIcon key="i" className="h-5 w-5" />, '#D62976'],
    ['TikTok', <TiktokIcon key="t" className="h-5 w-5" />, '#2B2620'],
    ['Facebook', <FacebookIcon key="f" className="h-5 w-5" />, '#1877F2'],
    ['MTN MoMo', <span key="m" className="h-4 w-4 rounded-full bg-[#FFCC00]" />, '#2B2620'],
    ['Orange Money', <span key="o" className="h-4 w-4 rounded-full bg-[#FF7900]" />, '#2B2620'],
];

function WorksWith() {
    return (
        <div className="relative z-10 mx-auto max-w-5xl px-4 pt-16 text-center sm:px-6">
            <p className="text-sm text-brand-muted">Fonctionne avec les applis que vos clients utilisent déjà</p>
            <motion.ul
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
                className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5"
            >
                {WORKS_WITH.map(([name, icon, color]) => (
                    <motion.li
                        key={name}
                        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -3, color }}
                        className="flex items-center gap-2 text-lg font-semibold text-brand-ink/45 transition-colors"
                    >
                        {icon} {name}
                    </motion.li>
                ))}
            </motion.ul>
        </div>
    );
}

/* ---------- Héros ---------- */
export default function OrbitHero({ primaryHref, primaryLabel }) {
    return (
        <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,#FFFBEB_0%,#FFFFFF_55%)] pb-20 pt-28 sm:pt-36">
            {/* orbites (estompées vers le bas) */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1000px] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"
                aria-hidden="true"
            >
                <div className="absolute left-1/2 top-[420px] h-0 w-0 scale-[0.55] sm:scale-75 lg:scale-100">
                    {RINGS.map((r, idx) => (
                        <Ring key={r.radius} {...r} arcFrom={idx * 0.3} />
                    ))}
                </div>
            </div>

            <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE_OUT }}
                    className="flex flex-wrap items-center justify-center gap-2 text-sm text-brand-ink/80"
                >
                    <span className="flex items-center gap-1.5 rounded-md border border-brand-line bg-white/80 px-2.5 py-1 backdrop-blur"><span className="h-2.5 w-2.5 rounded-full bg-[#FFCC00]" /> MTN MoMo</span>
                    <span className="flex items-center gap-1.5 rounded-md border border-brand-line bg-white/80 px-2.5 py-1 backdrop-blur"><span className="h-2.5 w-2.5 rounded-full bg-[#FF7900]" /> Orange Money</span>
                    <span className="hidden rounded-md border border-brand-line bg-white/80 px-2.5 py-1 backdrop-blur sm:inline">Gratuit jusqu'à 10 produits</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.1 }}
                    className="mt-6 text-[38px] font-extrabold leading-[1.08] tracking-tight text-brand-ink sm:text-6xl lg:text-[64px]"
                >
                    Vendez sur <RotatingChannel />,
                    <br />
                    encaissez par{' '}
                    <span className="relative inline-block">
                        <motion.span
                            className="absolute inset-x-[-6px] bottom-1 top-3 rounded-md bg-brand-yellow"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            style={{ originX: 0 }}
                            transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.7 }}
                        />
                        <span className="relative">Mobile Money</span>
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.25 }}
                    className="mt-6 max-w-xl text-lg leading-relaxed text-brand-muted"
                >
                    Votre catalogue dans un lien. Vos clients choisissent, paient avec leur téléphone, et l'argent arrive dans votre portefeuille.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.35 }}
                    className="mt-8 flex flex-wrap justify-center gap-3"
                >
                    <motion.a
                        href={primaryHref}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="group inline-flex h-12 items-center gap-2 rounded-lg bg-brand-yellow px-6 text-[15px] font-semibold text-brand-ink shadow-[0_10px_24px_-12px_rgba(161,98,7,0.75)] hover:bg-brand-yellowHover"
                    >
                        {primaryLabel}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </motion.a>
                    <motion.a
                        href="#vitrine"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex h-12 items-center gap-2 rounded-lg border border-brand-ink/15 bg-white px-5 text-[15px] font-semibold text-brand-ink hover:border-brand-ink/30"
                    >
                        <Play className="h-4 w-4 fill-current" /> Voir une boutique
                    </motion.a>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.5 }}
                    className="mt-14 w-full"
                >
                    <NotificationStack />
                </motion.div>
            </div>

            <WorksWith />
        </section>
    );
}
