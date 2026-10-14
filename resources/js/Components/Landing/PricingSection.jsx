import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Reveal, Stagger, StaggerItem } from '@/Components/Motion';

const PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        sub: 'Pour tester et faire vos premières ventes',
        cta: 'Commencer gratuitement',
        highlight: false,
        features: [
            'Jusqu’à 10 produits en ligne',
            'Paiements MTN MoMo & Orange Money',
            'Factures automatiques avec QR code',
            '1 campagne de relance / mois',
            'Support standard WhatsApp',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        sub: 'La formule préférée des commerçants actifs',
        cta: 'Démarrer avec Pro',
        highlight: true,
        badge: '★ Plus Populaire',
        features: [
            'Jusqu’à 50 produits (500 en stock)',
            'Gestion des tailles & variantes couleurs',
            'Factures à votre logo personnalisé',
            'Pixels Facebook, TikTok & Google Ads',
            '4 campagnes WhatsApp ciblées / mois',
            'Statistiques des ventes en direct',
        ],
    },
    {
        id: 'growth',
        name: 'Growth',
        sub: 'Pour accélérer votre volume de commandes',
        cta: 'Choisir Growth',
        highlight: false,
        features: [
            'Tout Pro, plus :',
            '250 produits (3 000 en stock)',
            'Relances automatiques des paniers',
            '10 campagnes WhatsApp par mois',
            'SmartLinks illimités pour les réseaux',
            'Support prioritaire 7j/7',
        ],
    },
    {
        id: 'business',
        name: 'Business',
        sub: 'Pour les marques et entreprises établies',
        cta: 'Choisir Business',
        highlight: false,
        features: [
            'Tout Growth, plus :',
            'Produits et stock illimités',
            'Export comptable complet CSV / Excel',
            '25 campagnes WhatsApp par mois',
            'Nom de domaine personnalisé',
            'Conseiller dédié personnel 7j/7',
        ],
    },
];

export default function PricingSection({ auth }) {
    const prices = usePage().props.planPrices || {
        starter: 0,
        pro: 2500,
        growth: 7000,
        business: 12000,
    };

    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
    const isYearly = billingCycle === 'yearly';
    const discount = 0.2; // 20% de réduction annuelle

    return (
        <section id="tarifs" className="relative bg-[#FAF9F5] py-20 sm:py-24 border-t border-slate-200/80">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {/* En-tête : Typographie raffinée, sans gras lourd */}
                <div className="mx-auto max-w-2xl text-center">
                    <Reveal>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 mb-3.5">
                            <Sparkles className="h-3 w-3 text-amber-600" />
                            <span>Tarifs clairs & sans engagement</span>
                        </div>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2620]">
                            Des formules adaptées à votre croissance.
                        </h2>
                    </Reveal>
                    <Reveal delay={0.14}>
                        <p className="mt-3 text-base text-slate-600 font-normal leading-relaxed">
                            Que vous débutiez ou que vous passiez à la vitesse supérieure, nos forfaits sont simples et sans frais cachés.
                        </p>
                    </Reveal>

                    {/* Sélecteur de cycle mensuel / annuel animé */}
                    <Reveal delay={0.2} className="mt-8 flex justify-center">
                        <div className="relative inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
                            <button
                                type="button"
                                onClick={() => setBillingCycle('monthly')}
                                className={`relative z-10 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                                    !isYearly ? 'text-[#2B2620]' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {!isYearly && (
                                    <motion.span
                                        layoutId="pricing-cycle-indicator"
                                        className="absolute inset-0 rounded-lg bg-[#FFCC00] shadow-xs"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">Mensuel</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setBillingCycle('yearly')}
                                className={`relative z-10 flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                                    isYearly ? 'text-[#2B2620]' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {isYearly && (
                                    <motion.span
                                        layoutId="pricing-cycle-indicator"
                                        className="absolute inset-0 rounded-lg bg-[#FFCC00] shadow-xs"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">Annuel</span>
                                <span className={`relative z-10 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                    isYearly ? 'bg-[#2B2620] text-amber-300' : 'bg-amber-100 text-amber-900'
                                }`}>
                                    -20%
                                </span>
                            </button>
                        </div>
                    </Reveal>
                </div>

                {/* Grille des 4 cartes de tarifs (Coins modérés rounded-2xl, pas de rounded-3xl lourd) */}
                <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
                    {PLANS.map((p) => {
                        const basePrice = Number(prices[p.id] ?? 0);
                        const monthlyPrice = isYearly && basePrice > 0
                            ? Math.round(basePrice * (1 - discount))
                            : basePrice;
                        const annualTotal = basePrice * 12 * (1 - discount);

                        return (
                            <StaggerItem key={p.id} className="h-full">
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className={`relative flex h-full flex-col justify-between rounded-2xl bg-white p-6 transition-all ${
                                        p.highlight
                                            ? 'border-2 border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/20'
                                            : 'border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-md'
                                    }`}
                                >
                                    <div>
                                        {/* Titre & Badge */}
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-lg font-bold text-[#2B2620]">
                                                {p.name}
                                            </h3>
                                            {p.highlight && (
                                                <span className="rounded-full bg-[#FFCC00] px-2.5 py-0.5 text-[10px] font-bold text-[#2B2620] shadow-xs">
                                                    {p.badge}
                                                </span>
                                            )}
                                        </div>

                                        {/* Sous-titre */}
                                        <p className="mt-1.5 text-xs text-slate-500 font-normal leading-relaxed min-h-[32px]">
                                            {p.sub}
                                        </p>

                                        {/* Prix en FCFA avec animation fluide au changement de cycle */}
                                        <div className="mt-5">
                                            <div className="flex items-baseline gap-1">
                                                <AnimatePresence mode="popLayout">
                                                    <motion.span
                                                        key={`${p.id}-${monthlyPrice}`}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -6 }}
                                                        transition={{ duration: 0.18 }}
                                                        className="text-3xl font-bold tracking-tight text-slate-900"
                                                    >
                                                        {monthlyPrice.toLocaleString('fr-FR')}
                                                    </motion.span>
                                                </AnimatePresence>
                                                <span className="text-xs text-slate-500 font-medium">
                                                    FCFA /mois
                                                </span>
                                            </div>

                                            <p className="mt-1 text-[11px] font-normal text-slate-400 min-h-[16px]">
                                                {basePrice === 0
                                                    ? 'Gratuit sans limite de temps'
                                                    : isYearly
                                                    ? `${Math.round(annualTotal).toLocaleString('fr-FR')} FCFA facturé pour 1 an`
                                                    : 'Sans engagement • Facturé au mois'}
                                            </p>
                                        </div>

                                        {/* Liste des fonctionnalités */}
                                        <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-5">
                                            <ul className="space-y-2.5">
                                                {p.features.map((feature, fIdx) => (
                                                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600 font-normal leading-snug">
                                                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md ${
                                                            p.highlight ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                                                        </span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Bouton CTA */}
                                    <div className="mt-7 pt-2">
                                        <motion.a
                                            href={auth?.user ? route('dashboard') : route('register')}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex h-10 w-full items-center justify-center rounded-xl text-xs font-semibold transition-colors ${
                                                p.highlight
                                                    ? 'bg-[#FFCC00] text-[#2B2620] shadow-sm hover:bg-[#E6B800]'
                                                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                            }`}
                                        >
                                            {p.cta}
                                        </motion.a>
                                    </div>
                                </motion.div>
                            </StaggerItem>
                        );
                    })}
                </Stagger>
            </div>
        </section>
    );
}
