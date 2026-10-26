import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { BarChart3, Check, Link2, Package, Receipt, ShoppingBag, Smartphone, Store, Users, Wallet } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/BrandIcons';
import { EASE_OUT } from '@/Components/Motion';

/* Illustrations de la landing : de vraies interfaces Biolinko construites en HTML, animées sobrement. */

const fcfa = (n) => `${Math.round(n).toLocaleString('fr-FR')} FCFA`;

// Logos officiels des moyens de paiement (public/images/payments, source Wikimedia Commons)
const PAYMENT_LOGOS = {
    MTN: ['/images/payments/mtn.svg', '#FFCC00', 'MTN Mobile Money', 'p-[14%]'],
    ORANGE: ['/images/payments/orange.svg', '#FFFFFF', 'Orange Money', ''],
    AIRTEL: ['/images/payments/airtel.svg', '#FFFFFF', 'Airtel Money', 'p-[12%]'],
    MOOV: ['/images/payments/moov-money.png', '#FFFFFF', 'Moov Money', 'p-[4%]'],
    MPESA: ['/images/payments/mpesa.svg', '#FFFFFF', 'M-Pesa', 'p-[8%]'],
    VISA: ['/images/payments/visa.svg', '#FFFFFF', 'Visa', 'p-[16%]'],
    MASTERCARD: ['/images/payments/mastercard.svg', '#FFFFFF', 'Mastercard', 'p-[14%]'],
};

export function OperatorLogo({ op, className = 'h-10 w-10' }) {
    if (PAYMENT_LOGOS[op]) {
        const [src, bg, label, pad] = PAYMENT_LOGOS[op];
        return (
            <span className={`relative inline-block shrink-0 overflow-hidden rounded-lg border border-black/5 ${className}`} style={{ backgroundColor: bg }}>
                <span className={`absolute inset-0 ${pad}`}>
                    <img src={src} alt={label} className="block h-full w-full object-contain" />
                </span>
            </span>
        );
    }
    if (op === 'WAVE') {
        return <span className={`flex items-center justify-center rounded-lg border border-black/5 bg-[#F2F1EC] text-[10px] font-semibold text-[#3D3C37] ${className}`} aria-label="Wave">Wave</span>;
    }
    const brands = {
        WHATSAPP: [WhatsappIcon, '#25D366'],
        INSTAGRAM: [InstagramIcon, '#E1306C'],
        TIKTOK: [TiktokIcon, '#111111'],
        FACEBOOK: [FacebookIcon, '#1877F2'],
    };
    const [Icon, bg] = brands[op] || brands.WHATSAPP;
    return (
        <span className={`flex items-center justify-center rounded-lg text-white ${className}`} style={{ backgroundColor: bg }}>
            <Icon className="h-1/2 w-1/2" />
        </span>
    );
}

const FEED = [
    { op: 'MTN', label: 'MTN Mobile Money', who: 'Robe pagne · Douala', amount: 18500 },
    { op: 'ORANGE', label: 'Orange Money', who: 'Sac en cuir · Yaoundé', amount: 32000 },
    { op: 'MTN', label: 'MTN Mobile Money', who: 'Parfum 100 ml · Bafoussam', amount: 12500 },
    { op: 'ORANGE', label: 'Orange Money', who: 'Sneakers · Douala', amount: 45000 },
    { op: 'MTN', label: 'MTN Mobile Money', who: 'Pack beauté · Kribi', amount: 9750 },
];

function useTicker(length, ms = 2800) {
    const reduce = useReducedMotion();
    const [i, setI] = useState(0);
    useEffect(() => {
        if (reduce) return;
        const t = setInterval(() => setI((v) => v + 1), ms);
        return () => clearInterval(t);
    }, [reduce, ms]);
    return i;
}

function AnimatedAmount({ value, className = '' }) {
    const mv = useMotionValue(value);
    const text = useTransform(mv, (v) => fcfa(v));
    useEffect(() => {
        const controls = animate(mv, value, { duration: 0.9, ease: 'easeOut' });
        return controls.stop;
    }, [value]);
    return <motion.span className={className}>{text}</motion.span>;
}

/** Carte « solde disponible » avec les paiements qui arrivent en direct. */
export function BalanceCard({ className = '' }) {
    const tick = useTicker(FEED.length);
    const visible = [0, 1, 2].map((k) => ({ ...FEED[(tick + k) % FEED.length], key: tick + k })).reverse();
    const balance = 1248500 + FEED.slice(0, (tick % FEED.length) + 1).reduce((a, f) => a + f.amount, 0) + Math.floor(tick / FEED.length) * 117750;

    return (
        <div className={`rounded-2xl border border-black/5 bg-[#F6F5F1] p-5 shadow-[0_30px_60px_-30px_rgba(20,20,10,0.35)] ${className}`}>
            <p className="text-[13px] text-[#5F5E58]">Maison Ngono, solde disponible</p>
            <AnimatedAmount value={balance} className="mt-1 block text-[28px] font-medium tracking-tight tabular-nums text-[#141412]" />
            <ul className="mt-4 space-y-0">
                <AnimatePresence initial={false}>
                    {visible.map((f) => (
                        <motion.li key={f.key} layout
                            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.45, ease: EASE_OUT }}
                            className="flex items-center gap-3 border-t border-black/5 py-3 first:border-0">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white"><Smartphone className="h-4 w-4 text-[#5F5E58]" /></span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[14px] text-[#141412]">{f.label}</span>
                                <span className="flex items-center gap-1.5 text-[12px] text-[#5F5E58]"><span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> Payé · {f.who}</span>
                            </span>
                            <span className="shrink-0 text-[14px] tabular-nums text-[#141412]">+{Math.round(f.amount).toLocaleString('fr-FR')}</span>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </div>
    );
}

/** Panneau du tableau de bord vendeur (navigation + ventes par ville). */
export function DashboardPanel({ className = '' }) {
    const items = [[BarChart3, "Vue d'ensemble", null, true], [ShoppingBag, 'Commandes', '214'], [Package, 'Produits', '38'], [Link2, 'Liens de paiement', '7'], [Users, 'Clients', '1 092'], [Wallet, 'Retraits', '2 en cours']];
    const cities = [['Douala', 62], ['Yaoundé', 24], ['Bafoussam', 14]];
    return (
        <div className={`rounded-2xl border border-black/5 bg-white p-3 text-[13px] ${className}`}>
            <div className="flex items-center justify-between px-2 py-2">
                <span className="flex items-center gap-2 font-medium text-[#141412]"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FFCC00]"><Store className="h-3.5 w-3.5" /></span> Maison Ngono</span>
            </div>
            <ul className="mt-1 space-y-0.5">
                {items.map(([Icon, label, badge, active]) => (
                    <li key={label} className={`flex items-center gap-2.5 rounded-lg px-2 py-2 ${active ? 'bg-[#F2F1EC] text-[#141412]' : 'text-[#5F5E58]'}`}>
                        <Icon className="h-4 w-4" /> <span className="flex-1">{label}</span>
                        {badge && <span className={`rounded-full px-2 text-[11px] tabular-nums ${badge.includes('cours') ? 'bg-[#FFF3C4] text-[#7A5B00]' : ''}`}>{badge}</span>}
                    </li>
                ))}
            </ul>
            <p className="mt-4 px-2 text-[11px] text-[#8B8A83]">Ventes par ville</p>
            <ul className="mt-2 space-y-2.5 px-2 pb-2">
                {cities.map(([c, pct], i) => (
                    <li key={c}>
                        <div className="flex justify-between text-[12px] text-[#141412]"><span>{c}</span><span className="tabular-nums text-[#5F5E58]">{pct} %</span></div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#F2F1EC]">
                            <motion.div className="h-full rounded-full bg-[#FFCC00]" initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 + i * 0.15, ease: EASE_OUT }} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Cadre de téléphone générique. */
export function Phone({ children, dark = false, className = '' }) {
    return (
        <div className={`relative rounded-[34px] border-[6px] ${dark ? 'border-[#2A2A27] bg-[#151513]' : 'border-[#E7E5DF] bg-white'} p-4 pt-3 shadow-[0_30px_60px_-30px_rgba(20,20,10,0.45)] ${className}`}>
            <div className="mb-3 flex items-center justify-between text-[11px] font-medium">
                <span className={dark ? 'text-white' : 'text-[#141412]'}>9:41</span>
                <span className={`h-4 w-16 rounded-full ${dark ? 'bg-black' : 'bg-[#141412]'}`} />
                <span className={`h-2 w-4 rounded-sm ${dark ? 'bg-white' : 'bg-[#141412]'}`} />
            </div>
            {children}
        </div>
    );
}

/** Écran de paiement Biolinko dans un téléphone (MTN sélectionné, numéro saisi). */
export function PhoneCheckout({ dark = false, className = '' }) {
    const tick = useTicker(2, 2400);
    const op = tick % 2 === 0 ? 'MTN' : 'ORANGE';
    const text = dark ? 'text-white' : 'text-[#141412]';
    const muted = dark ? 'text-white/50' : 'text-[#8B8A83]';
    const line = dark ? 'border-white/10' : 'border-black/10';
    return (
        <Phone dark={dark} className={className}>
            <p className={`text-[12px] ${muted}`}>Maison Ngono</p>
            <p className={`text-[26px] font-medium tracking-tight tabular-nums ${text}`}>18 500 FCFA</p>
            <p className={`text-[12px] ${muted}`}>Robe pagne · Taille M</p>
            <div className="mt-4 space-y-2">
                {[['MTN', 'MTN Mobile Money'], ['ORANGE', 'Orange Money']].map(([id, label]) => (
                    <motion.div key={id} animate={{ borderColor: op === id ? '#FFCC00' : 'rgba(127,127,127,0.25)' }}
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-[13px] ${text} ${op === id ? (dark ? 'bg-[#FFCC00]/10' : 'bg-[#FFF8D6]') : ''}`}>
                        <OperatorLogo op={id} className="h-6 w-6" /> {label}
                        {op === id && <motion.span layoutId={`op-${dark}`} className="ml-auto flex h-4 w-4 items-center justify-center rounded-full bg-[#FFCC00]"><Check className="h-3 w-3 text-[#141412]" /></motion.span>}
                    </motion.div>
                ))}
            </div>
            <p className={`mt-4 text-[11px] ${muted}`}>Numéro Mobile Money</p>
            <div className={`mt-1 rounded-xl border ${line} p-2.5 text-[13px] tabular-nums ${text}`}>+237 6{op === 'MTN' ? '77' : '99'} 12 34 56</div>
            <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="mt-3 rounded-xl bg-[#FFCC00] py-3 text-center text-[13px] font-semibold text-[#141412]">Payer 18 500 FCFA</motion.div>
        </Phone>
    );
}

/** Vitrine Biolinko dans un téléphone. */
export function PhoneStore({ className = '' }) {
    const products = [
        ['/images/landing/robe-pagne.webp', 'Robe pagne', '18 500'],
        ['/images/landing/sac-cuir.webp', 'Sac en cuir', '32 000'],
        ['/images/landing/foulard.webp', 'Foulard wax', '6 500'],
        ['/images/landing/tunique-orange.webp', 'Tunique', '14 000'],
    ];
    return (
        <Phone className={className}>
            <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F6F5C] text-[11px] font-bold text-white">MN</span>
                <span><span className="block text-[13px] font-semibold text-[#141412]">Maison Ngono</span><span className="block text-[10px] text-[#8B8A83]">Mode africaine · Douala</span></span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
                {products.map(([src, name, price], i) => (
                    <motion.div key={name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08 }}>
                        <img src={src} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover" />
                        <p className="mt-1 truncate text-[11px] text-[#141412]">{name}</p>
                        <p className="text-[11px] font-semibold tabular-nums text-[#141412]">{price} F</p>
                    </motion.div>
                ))}
            </div>
            <div className="mt-3 rounded-xl bg-[#1F6F5C] py-2.5 text-center text-[12px] font-semibold text-white">Voir le panier · 2 articles</div>
        </Phone>
    );
}

/** Liste des retraits vers Mobile Money. */
export function PayoutsList({ dark = false, className = '' }) {
    const rows = [['En cours', '#F59E0B', '125 000'], ['Payé', '#16A34A', '80 000'], ['Payé', '#16A34A', '212 500']];
    return (
        <div className={`rounded-2xl border p-4 ${dark ? 'border-white/10 bg-[#151513] text-white' : 'border-black/5 bg-white text-[#141412]'} ${className}`}>
            <div className="flex items-center justify-between">
                <span><span className="block text-[14px] font-medium">Retraits</span><span className={`text-[12px] ${dark ? 'text-white/50' : 'text-[#8B8A83]'}`}>Vers MTN Mobile Money</span></span>
                <span className={`rounded-full px-3 py-1 text-[11px] ${dark ? 'bg-white/10' : 'bg-[#F2F1EC]'}`}>Demander</span>
            </div>
            <ul className="mt-3">
                {rows.map(([status, color, amount], i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 * i }}
                        className={`flex items-center gap-3 border-t py-3 ${dark ? 'border-white/10' : 'border-black/5'}`}>
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${dark ? 'bg-white/5' : 'bg-[#F2F1EC]'}`}><Wallet className="h-4 w-4 opacity-60" /></span>
                        <span className="flex-1 text-[13px]">
                            <span className="block">Vers +237 6•• •• 42 09</span>
                            <span className="flex items-center gap-1.5 text-[12px] opacity-70">
                                {status === 'En cours'
                                    ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="h-2.5 w-2.5 rounded-full border-2 border-[#F59E0B] border-t-transparent" />
                                    : <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />}
                                {status}
                            </span>
                        </span>
                        <span className="text-[13px] tabular-nums">{amount} F</span>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
}

/** Facture générée automatiquement. */
export function InvoiceMock({ className = '' }) {
    return (
        <div className={`w-full max-w-[260px] rounded-xl border border-black/5 bg-white p-4 shadow-[0_20px_40px_-24px_rgba(20,20,10,0.4)] ${className}`}>
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#141412]"><Receipt className="h-3.5 w-3.5" /> Facture</span>
                <span className="rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-medium text-[#15803D]">Payée</span>
            </div>
            <p className="mt-1 font-mono text-[10px] text-[#8B8A83]">BLK-CMD-7Q2KX9</p>
            <div className="mt-3 space-y-1.5 text-[11px] text-[#5F5E58]">
                <div className="flex justify-between"><span>1 × Robe pagne</span><span className="tabular-nums">18 000</span></div>
                <div className="flex justify-between"><span>Frais de service</span><span className="tabular-nums">540</span></div>
                <div className="flex justify-between border-t border-black/5 pt-1.5 font-semibold text-[#141412]"><span>Total</span><span className="tabular-nums">18 540 FCFA</span></div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-[#8B8A83]">
                <span className="grid h-8 w-8 grid-cols-4 gap-px bg-white p-0.5">
                    {Array.from({ length: 16 }).map((_, i) => <span key={i} className={[0, 2, 3, 5, 6, 9, 10, 12, 15].includes(i) ? 'bg-[#141412]' : ''} />)}
                </span>
                Envoyée par WhatsApp et e-mail
            </div>
        </div>
    );
}

/** Pastille « curseur » qui se balade (Votre client / Vous). */
export function CursorTag({ label, color = '#FFCC00', className = '', path = { x: [0, 30, 0], y: [0, -12, 0] }, delay = 0 }) {
    const reduce = useReducedMotion();
    return (
        <motion.div className={`pointer-events-none absolute z-10 ${className}`}
            animate={reduce ? undefined : path} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}>
            <svg width="18" height="18" viewBox="0 0 24 24" className="-mb-1 drop-shadow"><path d="M4 2l16 9-7 2-3 7z" fill={color} stroke="#141412" strokeWidth="1.2" /></svg>
            <span className="ml-3 inline-block rounded-full px-3 py-1.5 text-[13px] font-medium text-[#141412] shadow-md" style={{ backgroundColor: color }}>{label}</span>
        </motion.div>
    );
}


const ORDERS = [
    ['WHATSAPP', 'Nouvelle commande', 'Robe pagne · Taille M', '18 500 FCFA'],
    ['MTN', 'Paiement reçu', 'Awa M. · Douala', '+32 000 FCFA'],
    ['INSTAGRAM', 'Nouvelle commande', 'Sac en cuir camel', '32 000 FCFA'],
    ['ORANGE', 'Paiement reçu', 'Jean T. · Yaoundé', '+6 500 FCFA'],
];

/** Pile de notifications de commandes qui défilent (colonne droite du hero). */
export function OrderFeed({ className = '' }) {
    const tick = useTicker(ORDERS.length, 2600);
    const items = [0, 1, 2].map((k) => ({ data: ORDERS[(tick + k) % ORDERS.length], key: tick + k }));
    return (
        <div className={`relative h-[220px] w-full max-w-[380px] ${className}`}>
            <AnimatePresence initial={false}>
                {items.map(({ data: [op, title, sub, amount], key }, i) => (
                    <motion.div key={key}
                        initial={{ opacity: 0, y: -24, scale: 0.96 }}
                        animate={{ opacity: 1 - i * 0.28, y: i * 70, scale: 1 - i * 0.04 }}
                        exit={{ opacity: 0, y: 230, scale: 0.9 }}
                        transition={{ duration: 0.6, ease: EASE_OUT }}
                        style={{ zIndex: 10 - i }}
                        className="absolute inset-x-0 top-0 flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/90 p-3.5 shadow-[0_16px_40px_-24px_rgba(20,20,10,0.4)] backdrop-blur">
                        <OperatorLogo op={op} className="h-9 w-9 shrink-0" />
                        <span className="min-w-0 flex-1">
                            <span className="block text-[14px] font-medium text-[#141412]">{title}</span>
                            <span className="block truncate text-[12px] text-[#8B8A83]">{sub}</span>
                        </span>
                        <span className="shrink-0 text-[14px] tabular-nums text-[#141412]">{amount}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

const STATUS = {
    paid: ['Payée', 'bg-[#DCFCE7] text-[#15803D]'],
    delivery: ['En livraison', 'bg-[#DBEAFE] text-[#1D4ED8]'],
    pending: ['En attente', 'bg-[#FFF3C4] text-[#7A5B00]'],
    delivered: ['Livrée', 'bg-[#F2F1EC] text-[#5F5E58]'],
};

/** Liste de commandes avec statuts qui évoluent. */
export function OrdersMock({ className = '' }) {
    const tick = useTicker(3, 2600);
    const flow = ['pending', 'paid', 'delivery'];
    const rows = [
        ['Awa M.', 'Robe pagne', '18 500', flow[tick % 3]],
        ['Jean T.', 'Sac en cuir', '32 000', 'delivery'],
        ['Inès K.', 'Foulard wax ×2', '13 000', 'delivered'],
    ];
    return (
        <div className={`w-full rounded-2xl border border-black/5 bg-white p-4 shadow-[0_20px_40px_-24px_rgba(20,20,10,0.35)] ${className}`}>
            <p className="text-[13px] font-medium text-[#141412]">Commandes</p>
            <ul className="mt-2">
                {rows.map(([who, what, amount, st]) => (
                    <li key={who} className="flex items-center gap-3 border-t border-black/5 py-2.5 first:border-0">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F2F1EC] text-[11px] font-medium text-[#141412]">{who.charAt(0)}</span>
                        <span className="min-w-0 flex-1 text-[12px]"><span className="block truncate text-[#141412]">{what}</span><span className="text-[#8B8A83]">{who}</span></span>
                        <motion.span key={st} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS[st][1]}`}>{STATUS[st][0]}</motion.span>
                        <span className="w-14 shrink-0 text-right text-[12px] tabular-nums text-[#141412]">{amount}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Campagne WhatsApp envoyée à un segment de clients. */
export function CampaignMock({ className = '' }) {
    return (
        <div className={`w-full max-w-[280px] space-y-2 ${className}`}>
            <div className="flex items-center gap-2 rounded-2xl border border-black/5 bg-white p-3 text-[12px] text-[#141412]">
                <Users className="h-4 w-4 text-[#8B8A83]" /> 248 clients · Douala
                <span className="ml-auto rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] text-[#15803D]">Envoyée</span>
            </div>
            <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, ease: EASE_OUT }}
                className="ml-6 rounded-2xl rounded-tr-sm bg-[#DCF8C6] p-3 text-[12px] leading-relaxed text-[#141412] shadow-sm">
                Nouvelle collection wax disponible 🎉 −15 % ce week-end sur la boutique.
                <span className="mt-1 block text-right text-[10px] text-[#5F5E58]">10:24 ✓✓</span>
            </motion.div>
        </div>
    );
}

/** Lien de paiement partagé. */
export function LinkMock({ className = '' }) {
    return (
        <div className={`w-full max-w-[280px] rounded-2xl border border-black/5 bg-white p-3 shadow-[0_20px_40px_-24px_rgba(20,20,10,0.35)] ${className}`}>
            <div className="flex items-center gap-2 rounded-xl bg-[#F2F1EC] px-3 py-2 font-mono text-[11px] text-[#141412]">
                <Link2 className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">biolinko.link/pay/pack-wax</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
                <span className="flex -space-x-3">
                    {['robe-pagne', 'foulard'].map((n) => <img key={n} src={`/images/landing/${n}.webp`} alt="" className="h-10 w-10 rounded-lg border-2 border-white object-cover" />)}
                </span>
                <span className="text-[12px]"><span className="block text-[#141412]">Pack wax</span><span className="text-[#8B8A83]">22 000 FCFA · −3 000</span></span>
            </div>
        </div>
    );
}

/** Statistiques des ventes (barres animées). */
export function StatsMock({ className = '' }) {
    const bars = [38, 52, 44, 70, 62, 84, 96];
    return (
        <div className={`w-full rounded-2xl border border-black/5 bg-white p-4 ${className}`}>
            <p className="text-[12px] text-[#8B8A83]">Ventes des 7 derniers jours</p>
            <p className="text-[22px] font-medium tracking-tight tabular-nums text-[#141412]">486 500 FCFA</p>
            <div className="mt-3 flex h-20 items-end gap-1.5">
                {bars.map((h, i) => (
                    <motion.span key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.06, ease: EASE_OUT }}
                        className={`flex-1 rounded-md ${i === bars.length - 1 ? 'bg-[#FFCC00]' : 'bg-[#F2F1EC]'}`} />
                ))}
            </div>
        </div>
    );
}
