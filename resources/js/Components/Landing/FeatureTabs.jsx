import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Check, Lock, MessageCircle, Smartphone, Store, Truck,
    Clock, Shield, Percent, Activity, Sparkles, ExternalLink
} from 'lucide-react';
import { CountUp, EASE_OUT, Reveal } from '@/Components/Motion';

const IMG = '/images/landing';
const DURATION = 6; // secondes par onglet

function BrowserFrame({ src, alt, url }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md shadow-slate-200/40">
            <div className="flex h-9 items-center justify-between border-b border-slate-200 bg-slate-50 px-3.5">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
                <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600 shadow-xs">
                    <Lock className="h-2.5 w-2.5 text-amber-600" />
                    <span>{url}</span>
                </div>
                <div className="w-6" />
            </div>
            <div className="relative overflow-hidden bg-slate-50">
                <img src={src} alt={alt} loading="lazy" className="block w-full object-cover" />
            </div>
        </div>
    );
}

function PaymentVisual() {
    const [step, setStep] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setStep((s) => (s + 1) % 3), 2000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="relative mx-auto flex h-[420px] w-[260px] flex-col rounded-[22px] border-[5px] border-[#2B2620]/75 bg-white p-4 shadow-lg shadow-slate-200/50">
            <div className="mx-auto mb-3.5 h-3 w-14 rounded-full bg-[#2B2620]/75" />

            <div className="space-y-1">
                <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                    Paiement direct
                </span>
                <div className="text-xs text-slate-500">Maison Kemi • Commande #2041</div>
                <div className="text-lg font-bold text-[#2B2620]">Total : 21 115 FCFA</div>
            </div>

            <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
                <img src={`${IMG}/robe-sirene.webp`} alt="" className="h-10 w-10 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-800 truncate">Robe sirène wax</div>
                    <div className="text-[11px] text-slate-500">Taille M • 1 article</div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 0 || step === 1 ? (
                    <motion.div
                        key="prompt"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-auto space-y-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-center text-xs"
                    >
                        <span className="inline-block rounded bg-[#FFCC00] px-2 py-0.5 text-[10px] font-bold text-[#2B2620]">
                            MTN Mobile Money
                        </span>
                        <p className="text-slate-700 text-[11px] font-medium leading-relaxed">
                            Confirmez avec votre code secret MoMo sur votre téléphone
                        </p>
                        <div className="flex justify-center gap-1.5 pt-1">
                            {[0, 1, 2, 3, 4].map((d) => (
                                <motion.span
                                    key={d}
                                    className="h-7 flex-1 rounded-md border border-slate-300 bg-white flex items-center justify-center font-bold text-xs shadow-xs"
                                    animate={{
                                        backgroundColor: step === 1 ? '#FFCC00' : '#FFFFFF',
                                        color: step === 1 ? '#2B2620' : '#475569'
                                    }}
                                    transition={{ delay: d * 0.1 }}
                                >
                                    {step === 1 ? '•' : ''}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="ok"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-auto flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-center"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                            <Check className="h-5 w-5 stroke-[2.5]" />
                        </span>
                        <div>
                            <span className="font-semibold text-xs text-slate-900 block">Paiement validé !</span>
                            <span className="text-[11px] text-slate-500 block">Crédité sur votre portefeuille</span>
                        </div>
                        <span className="mt-0.5 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-200">
                            Reçu généré automatiquement
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function CampaignVisual() {
    return (
        <div className="mx-auto max-w-[360px] space-y-3 rounded-xl border border-slate-200 bg-[#F4F4F6] p-4 shadow-md shadow-slate-200/40">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs text-slate-600">
                <span className="font-semibold flex items-center gap-1.5 text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-[#FFCC00]" /> Relance WhatsApp
                </span>
                <span className="text-[11px] text-slate-400">10:42</span>
            </div>

            <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="ml-auto max-w-[88%] overflow-hidden rounded-xl rounded-tr-xs bg-white shadow-xs border border-slate-200"
            >
                <img src={`${IMG}/robe-sirene.webp`} alt="" className="h-28 w-full object-cover" />
                <div className="space-y-1.5 p-3 text-xs text-slate-800">
                    <p className="font-semibold text-slate-800">Nouvelle collection Maison Kemi</p>
                    <p className="text-slate-500 text-[11px]">La robe sirène est disponible en taille M. Commandez directement ici :</p>
                    <div className="flex items-center gap-1 font-semibold text-amber-900 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 text-[11px]">
                        <span>biolinko.link/p/robe-sirene</span>
                        <ExternalLink className="h-3 w-3 ml-auto text-amber-700" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-[75%] rounded-xl rounded-tl-xs bg-white p-3 text-xs text-slate-700 shadow-xs border border-slate-200"
            >
                <p>Super, je commande tout de suite ! Merci 😍</p>
                <span className="text-[10px] text-slate-400 block text-right mt-1">10:45</span>
            </motion.div>
        </div>
    );
}

const TABS = [
    {
        id: 'vitrine',
        Icon: Store,
        badge: 'Votre marque',
        title: 'Votre vitrine en ligne',
        text: 'Une boutique élégante et rapide qui s’adapte à tous les téléphones. Vos photos, vos prix et votre identité visuelle sans la moindre lenteur.',
        visual: <BrowserFrame src={`${IMG}/app-vitrine.webp`} alt="Vitrine Biolinko" url="biolinko.link/maison-kemi" />
    },
    {
        id: 'paiement',
        Icon: Smartphone,
        badge: 'Mobile Money',
        title: 'Paiement MTN & Orange 1-clic',
        text: 'Vos clients valident leur achat avec leur code secret Mobile Money habituel. L’argent arrive immédiatement dans votre portefeuille.',
        visual: <PaymentVisual />
    },
    {
        id: 'commandes',
        Icon: Truck,
        badge: 'Suivi des ventes',
        title: 'Gestion des commandes & livraison',
        text: 'Chaque commande payée est enregistrée avec les coordonnées du client et la facture prête à imprimer ou à partager par WhatsApp.',
        visual: <BrowserFrame src={`${IMG}/app-dashboard.webp`} alt="Tableau de bord vendeur" url="biolinko.link/dashboard" />
    },
    {
        id: 'campagnes',
        Icon: MessageCircle,
        badge: 'WhatsApp intégré',
        title: 'Campagnes & relances WhatsApp',
        text: 'Relancez les clients hésitants ou partagez vos nouveautés en un instant avec un lien direct vers vos fiches produits.',
        visual: <CampaignVisual />
    },
];

export function FeatureTabs() {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused) return;
        const t = setTimeout(() => setActive((a) => (a + 1) % TABS.length), DURATION * 1000);
        return () => clearTimeout(t);
    }, [active, paused]);

    return (
        <section id="vitrine" className="scroll-mt-20 bg-white py-20 sm:py-24 border-t border-slate-200/80">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <Reveal className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2620]">
                        Tout pour vendre, au même endroit.
                    </h2>
                    <p className="mt-3 text-base text-slate-600 font-normal leading-relaxed max-w-xl mx-auto">
                        De la présentation de vos articles au paiement sécurisé sur WhatsApp, Biolinko organise tout.
                    </p>
                </Reveal>

                <div
                    className="mt-12 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    {/* Navigation par onglets */}
                    <Reveal y={20} delay={0.08} role="tablist" aria-label="Fonctionnalités" className="space-y-2.5">
                        {TABS.map((tab, i) => {
                            const on = i === active;
                            return (
                                <motion.button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={on}
                                    onClick={() => setActive(i)}
                                    whileHover={{ x: 2 }}
                                    className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${
                                        on
                                            ? 'border-amber-400 bg-amber-50/40 shadow-xs ring-1 ring-amber-400/20'
                                            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                                                    on
                                                        ? 'bg-[#FFCC00] text-[#2B2620] shadow-xs'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                <tab.Icon className="h-4.5 w-4.5" />
                                            </span>
                                            <div>
                                                <h3 className={`text-sm font-semibold transition-colors ${on ? 'text-[#2B2620]' : 'text-slate-800'}`}>
                                                    {tab.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                            on ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {tab.badge}
                                        </span>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {on && (
                                            <motion.p
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: EASE_OUT }}
                                                className="overflow-hidden pl-12 pt-2 text-xs sm:text-sm font-normal leading-relaxed text-slate-600"
                                            >
                                                {tab.text}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>

                                    {/* Barre de progression jaune subtile */}
                                    {on && (
                                        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-100">
                                            <motion.span
                                                key={`${active}-${paused}`}
                                                className="block h-full bg-[#FFCC00]"
                                                initial={{ width: '0%' }}
                                                animate={{ width: paused ? '0%' : '100%' }}
                                                transition={{ duration: paused ? 0 : DURATION, ease: 'linear' }}
                                            />
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </Reveal>

                    {/* Cadre de visualisation épuré */}
                    <Reveal y={24} delay={0.16} className="relative flex min-h-[440px] items-center justify-center rounded-2xl border border-slate-200 bg-[#FAF9F5] p-6 sm:p-8 shadow-xs">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={TABS[active].id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.28, ease: EASE_OUT }}
                                className="relative z-10 w-full"
                            >
                                {TABS[active].visual}
                            </motion.div>
                        </AnimatePresence>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}

const FACTS = [
    { value: 5, suffix: ' min', label: 'pour créer votre boutique', icon: Clock },
    { value: 0, suffix: ' FCFA', label: "pour commencer gratuitement", icon: Shield },
    { value: 3, suffix: ' %', label: "de frais simples au panier", icon: Percent },
    { value: 24, suffix: ' h/24', label: 'votre boutique reste disponible', icon: Activity },
];

/**
 * Bandeau de statistiques clair avec typographie équilibrée
 */
export function StatsBand() {
    return (
        <section className="relative bg-[#FFFDF0] py-12 border-y border-amber-200/70">
            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                    {FACTS.map((f, i) => {
                        const Icon = f.icon;
                        return (
                            <Reveal
                                key={f.label}
                                delay={i * 0.08}
                                className={`flex flex-col justify-between ${
                                    i > 0 ? 'lg:border-l lg:border-amber-200 lg:pl-8' : ''
                                }`}
                            >
                                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-amber-900">
                                    <Icon className="h-3.5 w-3.5 text-amber-700" />
                                    <span>En direct</span>
                                </div>
                                <div className="mt-2.5 text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2620]">
                                    <CountUp to={f.value} />
                                    <span className="text-amber-500">{f.suffix}</span>
                                </div>
                                <div className="mt-1.5 text-xs sm:text-sm font-normal text-slate-600">
                                    {f.label}
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
