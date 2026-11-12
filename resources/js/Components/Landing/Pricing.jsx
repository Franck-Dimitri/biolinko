import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { EASE_OUT } from '@/Components/UI/Motion';
import { Rails, WRAP } from '@/Components/Landing/Frame';

// Les nombres viennent de User::PLAN_LIMITS et config/payments.php (props partagées) pour rester exacts
const pct = (n) => `${String(n ?? '').replace('.', ',')} %`;
const planFeatures = (L) => ({
    starter: [`Jusqu'à ${L.starter?.products} produits`, `${L.starter?.smartlinks} liens de paiement`, 'Paiements MTN MoMo et Orange Money', 'Factures automatiques', 'Suivi de commande pour vos clients'],
    pro: [`Jusqu'à ${L.pro?.products} produits`, 'Tailles, couleurs et promotions', 'Factures à votre marque', 'Pixels Facebook et TikTok', `${L.pro?.smartlinks} liens de paiement`, '4 campagnes WhatsApp / mois'],
    growth: ['Tout Pro, plus :', `Jusqu'à ${L.growth?.products} produits`, 'Liens de paiement illimités', '10 campagnes WhatsApp / mois', 'Support prioritaire'],
    business: ['Tout Growth, plus :', 'Produits et stock illimités', 'Export comptable', '25 campagnes WhatsApp / mois', 'Conseiller dédié'],
});

const PLANS = [
    { id: 'starter', name: 'Starter', sub: 'Pour faire vos premières ventes' },
    { id: 'pro', name: 'Pro', sub: 'Pour les commerçants actifs', highlight: true },
    { id: 'growth', name: 'Growth', sub: 'Pour accélérer vos ventes' },
    { id: 'business', name: 'Business', sub: 'Pour les marques établies' },
];

const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-80px' }, transition: { duration: 0.6, delay, ease: EASE_OUT },
});

// « Avez-vous déjà un compte ? » : le plan choisi suit le visiteur jusqu'à la page d'abonnement.
function PlanAccountModal({ plan, onClose }) {
    return (
        <AnimatePresence>
            {plan && (
                <motion.div key="plan-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    onClick={onClose} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
                    <motion.div role="dialog" aria-modal="true" aria-labelledby="plan-modal-title" onClick={(e) => e.stopPropagation()}
                        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full max-w-md rounded-t-3xl bg-white p-7 sm:rounded-3xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF8D6] px-3 py-1 text-[13px] font-medium text-[#141412]">
                                    Plan {plan.name} · {plan.price.toLocaleString('fr-FR')} FCFA / mois
                                </span>
                                <h3 id="plan-modal-title" className="mt-4 text-[24px] font-medium tracking-[-0.02em] text-[#141412]">Avez-vous déjà un compte Biolinko ?</h3>
                            </div>
                            <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5"><X className="h-5 w-5" /></button>
                        </div>
                        <p className="mt-2 text-[15px] text-[#5F5E58]">Votre choix est gardé : vous arriverez directement sur le paiement de votre abonnement.</p>
                        <div className="mt-6 grid gap-3">
                            <Link href={route('login', { plan: plan.id })} className="group flex items-center justify-between rounded-2xl border border-black/10 p-4 hover:border-black/30">
                                <span><span className="block text-[16px] font-medium text-[#141412]">Oui, je me connecte</span><span className="text-[14px] text-[#5F5E58]">Puis je choisis ma durée et je paie</span></span>
                                <ArrowRight className="h-5 w-5 text-[#141412] transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link href={route('register', { plan: plan.id })} className="group flex items-center justify-between rounded-2xl bg-[#141412] p-4 text-white hover:bg-[#2B2A26]">
                                <span><span className="block text-[16px] font-medium">Non, je crée mon compte</span><span className="text-[14px] text-white/60">Gratuit, en 1 minute, puis paiement du plan</span></span>
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function Pricing({ auth }) {
    const { planPrices: prices = {}, payments: pay = {}, planLimits = {} } = usePage().props;
    const rates = pay.commission_percent || {};
    const features = planFeatures(planLimits);
    const [yearly, setYearly] = useState(false);
    const [chosen, setChosen] = useState(null); // plan payant choisi par un visiteur non connecté

    // Connecté : directement l'abonnement. Visiteur : on lui demande s'il a déjà un compte.
    const planHref = (p, base) => {
        if (base === 0) return auth?.user ? route('dashboard') : route('register');
        return auth?.user ? route('seller.subscriptions.index', { plan: p.id }) : null;
    };

    return (
        <section id="tarifs" className="relative scroll-mt-20 bg-white py-24 sm:py-32">
            <Rails />
            <PlanAccountModal plan={chosen} onClose={() => setChosen(null)} />
            <div className={WRAP}>
                <div className="mx-auto max-w-[720px] text-center">
                    <motion.p {...reveal()} className="text-[14px] font-medium text-[#B38600]">Tarifs</motion.p>
                    <motion.h2 {...reveal(0.05)} className="mt-3 text-[38px] font-medium leading-[1.05] tracking-[-0.03em] text-[#141412] sm:text-[52px]">Payez quand vous vendez</motion.h2>
                    <motion.p {...reveal(0.1)} className="mt-5 text-[18px] text-[#5F5E58]">Une seule commission par vente, rien d’autre. Plus vous vendez, plus elle baisse.</motion.p>
                    <motion.div {...reveal(0.15)} className="mt-8 inline-flex rounded-full border border-black/10 bg-[#F6F5F1] p-1" role="group" aria-label="Période de facturation">
                        {[[false, 'Mensuel'], [true, 'Annuel · −15 %']].map(([val, label]) => (
                            <button key={label} type="button" onClick={() => setYearly(val)} aria-pressed={yearly === val}
                                className={`relative rounded-full px-4 py-2 text-[14px] transition-colors ${yearly === val ? 'text-[#141412]' : 'text-[#5F5E58]'}`}>
                                {yearly === val && <motion.span layoutId="billing" className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                                <span className="relative">{label}</span>
                            </button>
                        ))}
                    </motion.div>
                </div>

                <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {PLANS.map((p, i) => {
                        const base = Number(prices[p.id] ?? 0);
                        const price = yearly ? Math.round(base * 0.85) : base;
                        const href = planHref(p, base);
                        const label = base === 0 ? 'Commencer gratuitement' : `Choisir ${p.name}`;
                        const btn = `mt-7 flex h-11 w-full items-center justify-center rounded-full text-[14px] font-medium transition-colors ${p.highlight ? 'bg-[#FFCC00] text-[#141412] hover:bg-[#FFD633]' : 'border border-black/15 text-[#141412] hover:border-black/40'}`;
                        return (
                            <motion.article key={p.id} {...reveal(i * 0.06)}
                                className={`relative flex flex-col rounded-3xl p-7 ${p.highlight ? 'bg-[#141412] text-white' : 'border border-black/[0.08] bg-white text-[#141412]'}`}>
                                <div className="flex items-center justify-between">
                                    <p className="text-[17px] font-medium">{p.name}</p>
                                    {p.highlight && <span className="rounded-full bg-[#FFCC00] px-2.5 py-0.5 text-[12px] font-medium text-[#141412]">Le plus choisi</span>}
                                </div>
                                <p className={`mt-1 text-[14px] ${p.highlight ? 'text-white/55' : 'text-[#5F5E58]'}`}>{p.sub}</p>

                                <div className={`mt-6 rounded-2xl p-4 ${p.highlight ? 'bg-white/[0.06]' : 'bg-[#F6F5F1]'}`}>
                                    <p className={`text-[13px] ${p.highlight ? 'text-white/55' : 'text-[#5F5E58]'}`}>Commission par vente</p>
                                    <p className={`text-[34px] font-medium leading-tight tracking-[-0.03em] ${p.highlight ? 'text-[#FFCC00]' : ''}`}>{pct(rates[p.id])}</p>
                                </div>

                                <p className="mt-5 flex items-baseline gap-1.5">
                                    <motion.span key={price} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[22px] font-medium tabular-nums">
                                        {price === 0 ? 'Gratuit' : `${price.toLocaleString('fr-FR')} FCFA`}
                                    </motion.span>
                                    {price > 0 && <span className={`text-[14px] ${p.highlight ? 'text-white/55' : 'text-[#5F5E58]'}`}>/ mois</span>}
                                </p>

                                {href
                                    ? <Link href={href} className={btn}>{label}</Link>
                                    : <button type="button" onClick={() => setChosen({ ...p, price: base })} className={btn}>{label}</button>}

                                <ul className={`mt-7 space-y-3 text-[14px] ${p.highlight ? 'text-white/80' : 'text-[#3D3C37]'}`}>
                                    {features[p.id].map((f) => (
                                        <li key={f} className="flex gap-2.5"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? 'text-[#FFCC00]' : 'text-[#C99A00]'}`} />{f}</li>
                                    ))}
                                </ul>
                            </motion.article>
                        );
                    })}
                </div>
                <motion.ul {...reveal()} className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] text-[#5F5E58]">
                    {['Retraits gratuits', 'Aucune commission sur la livraison', `L’acheteur paie ${pct(pay.client_fee_percent)} de frais Mobile Money`, 'Sans engagement'].map((t) => (
                        <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#16A34A]" /> {t}</li>
                    ))}
                </motion.ul>
            </div>
        </section>
    );
}
