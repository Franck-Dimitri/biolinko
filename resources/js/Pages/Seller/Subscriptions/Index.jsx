import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Zap, Check, ShieldCheck, Sparkles, Clock, AlertCircle,
    RefreshCw, Layers2, ArrowRight, Star, ShoppingBag, MessageSquare,
    CheckCircle2, CreditCard, ChevronRight, Crown, PhoneCall, HelpCircle, X, Percent, Calendar
} from 'lucide-react';

export default function Index({ store, user, plans, cycles, history }) {
    const { flash } = usePage().props;
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedCycle, setSelectedCycle] = useState(1); // 1, 6, or 12 months
    const [phoneMomo, setPhoneMomo] = useState(user.phone_whatsapp || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState(flash?.warning || null);

    const [ussdModalState, setUssdModalState] = useState({
        isOpen: false,
        reference: null,
        amount: 0,
        operator: 'MTN',
        phone: '',
        plan_name: '',
        cycle_months: 1,
        status: 'PENDING',
        errorMsg: null,
    });

    // Real-time status polling for Mobile Money USSD subscription payment
    useEffect(() => {
        if (!ussdModalState.isOpen || !ussdModalState.reference || ussdModalState.status !== 'PENDING') {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const res = await axios.get(route('seller.subscriptions.status', ussdModalState.reference));
                if (res.data.paid || res.data.status === 'SUCCESS') {
                    setUssdModalState(prev => ({ ...prev, status: 'SUCCESS' }));
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else if (res.data.status === 'FAILED') {
                    setUssdModalState(prev => ({ ...prev, status: 'FAILED', errorMsg: res.data.message || 'Paiement décliné ou annulé.' }));
                }
            } catch (err) {
                console.error('Polling subscription status error:', err);
            }
        }, 3500);

        return () => clearInterval(interval);
    }, [ussdModalState.isOpen, ussdModalState.reference, ussdModalState.status]);

    const calculatePlanPricing = (baseMonthlyPrice, months) => {
        if (baseMonthlyPrice === 0) {
            return { total: 0, monthlyEquivalent: 0, discountPercent: 0, savings: 0 };
        }

        let discountRate = 0;
        if (months === 6) discountRate = 0.14;  // -14%
        if (months === 12) discountRate = 0.30; // -30%

        const originalTotal = baseMonthlyPrice * months;
        const total = Math.round(originalTotal * (1.0 - discountRate));
        const monthlyEquivalent = Math.round(total / months);
        const savings = originalTotal - total;

        return {
            total,
            monthlyEquivalent,
            discountPercent: Math.round(discountRate * 100),
            savings,
        };
    };

    const handleOpenSubscribeModal = (plan) => {
        if (plan.id === user.plan && selectedCycle === 1) return;
        setSelectedPlan(plan);
    };

    const handleConfirmSubscribe = async (e) => {
        e.preventDefault();
        if (!selectedPlan) return;

        setIsSubmitting(true);
        try {
            const res = await axios.post(route('seller.subscriptions.subscribe'), {
                plan: selectedPlan.id,
                phone_momo: phoneMomo,
                cycle: selectedCycle,
            });

            if (res.data.requires_ussd) {
                setSelectedPlan(null);
                setUssdModalState({
                    isOpen: true,
                    reference: res.data.reference,
                    amount: res.data.amount,
                    operator: res.data.operator,
                    phone: res.data.phone,
                    plan_name: res.data.plan_name,
                    cycle_months: res.data.cycle_months || selectedCycle,
                    status: 'PENDING',
                    errorMsg: null,
                });
            } else if (res.data.success) {
                setSelectedPlan(null);
                setToastMessage(res.data.message);
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message || 'Échec d\'initiation de l\'abonnement. Veuillez vérifier le numéro MoMo.';
            alert(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const remainingPercentage = Math.max(0, Math.min(100, Math.round((user.days_remaining / 30) * 100)));

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des Abonnements & Offres SaaS — BIOLINKO" />

            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-amber-950 text-amber-200 text-xs font-semibold shadow-xl flex items-center gap-2 border border-amber-800"
                    >
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full space-y-8 font-sans">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                            <span>Abonnements & Offres BIOLINKO</span>
                            <Crown className="w-6 h-6 text-amber-500" />
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Choisissez la formule adaptée à votre croissance et bénéficiez jusqu'à 30% de réduction sur l'engagement long terme.
                        </p>
                    </div>
                </div>

                {/* CURRENT ACTIVE PLAN HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-4 max-w-xl z-10">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-[#FFCC00] text-slate-950 text-xs font-extrabold tracking-wide uppercase shadow-2xs">
                                Plan Actuel : {user.plan_name}
                            </span>
                            {user.is_active ? (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Actif
                                </span>
                            ) : (
                                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold">
                                    Expiré
                                </span>
                            )}
                        </div>

                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                Formule {user.plan_name}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
                                {user.plan === 'starter'
                                    ? 'Vous utilisez l\'offre gratuite permanente. Débloquez les relances WhatsApp et les Pixels marketing.'
                                    : `Accès complet actif jusqu'au ${user.subscription_expires_at}.`}
                            </p>
                        </div>

                        {/* DAYS REMAINING PROGRESS BAR */}
                        {user.plan !== 'starter' && (
                            <div className="space-y-2 pt-2">
                                <div className="flex justify-between text-xs font-medium text-slate-300">
                                    <span>Temps d'Abonnement Restant</span>
                                    <strong className="text-amber-300 font-bold">{user.days_remaining} jour(s) restants</strong>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                                        style={{ width: `${remainingPercentage}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* METRICS SUMMARY BADGES */}
                    <div className="w-full md:w-auto z-10">
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center space-y-1">
                            <div className="text-[11px] text-slate-300 font-medium">Limite Produits</div>
                            <div className="text-2xl font-extrabold text-amber-300">
                                {user.max_products >= 9999 ? 'Illimité' : `${user.max_products} max`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* BILLING CYCLE SELECTOR TOGGLE */}
                <div className="flex flex-col items-center justify-center space-y-3 pt-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span>Choisissez votre fréquence de facturation</span>
                    </div>

                    <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-300/60 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setSelectedCycle(1)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCycle === 1
                                    ? 'bg-white text-slate-950 shadow-md'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Mensuel (1 mois)
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedCycle(6)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${selectedCycle === 6
                                    ? 'bg-[#FFCC00] text-slate-950 shadow-md'
                                    : 'text-slate-700 hover:text-slate-950'
                                }`}
                        >
                            <span>Semestriel (6 mois)</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black uppercase">
                                -14%
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedCycle(12)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${selectedCycle === 12
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'text-slate-700 hover:text-slate-950'
                                }`}
                        >
                            <span>Annuel (1 an)</span>
                            <span className="px-2 py-0.5 rounded-full bg-white text-emerald-950 text-[10px] font-black uppercase shadow-2xs">
                                -30% 🔥
                            </span>
                        </button>
                    </div>
                </div>

                {/* 4 PLANS COMPARISON GRID */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-950">Grille des Offres Tarifs</h2>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Paiement Mobile Money 🇨🇲 (MTN & Orange)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {plans.map((p) => {
                            const isCurrent = user.plan === p.id && selectedCycle === 1;
                            const pricing = calculatePlanPricing(p.price, selectedCycle);

                            return (
                                <motion.div
                                    key={p.id}
                                    whileHover={{ y: -4 }}
                                    className={`bg-white rounded-3xl border ${isCurrent
                                            ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-lg'
                                            : p.id === 'pro'
                                                ? 'border-amber-300/80 shadow-md ring-1 ring-amber-300/30'
                                                : 'border-slate-200/90 shadow-2xs hover:shadow-md'
                                        } p-6 flex flex-col justify-between space-y-6 relative overflow-hidden`}
                                >
                                    {/* TOP BADGE */}
                                    <div className="flex items-center justify-between">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${p.id === 'pro'
                                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                : p.id === 'growth'
                                                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                                    : p.id === 'business'
                                                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}>
                                            {p.badge}
                                        </span>

                                        {pricing.discountPercent > 0 && p.price > 0 && (
                                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10px] border border-emerald-300">
                                                -{pricing.discountPercent}% RÉDUCTION
                                            </span>
                                        )}

                                        {isCurrent && (
                                            <span className="px-2.5 py-1 rounded-full bg-[#FFCC00] text-slate-950 font-bold text-[10px] shadow-2xs">
                                                Plan Actuel
                                            </span>
                                        )}
                                    </div>

                                    {/* TITLE & PRICE */}
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-slate-950">{p.name}</h3>

                                        {p.price === 0 ? (
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-slate-950">Gratuit</span>
                                                <span className="text-xs font-semibold text-slate-500">à vie</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-3xl font-black text-slate-950">
                                                        {pricing.monthlyEquivalent.toLocaleString()}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-500">FCFA / mois</span>
                                                </div>

                                                {selectedCycle > 1 && (
                                                    <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200 inline-block">
                                                        Facturé {pricing.total.toLocaleString()} FCFA pour {selectedCycle === 6 ? '6 mois' : '1 an'} (Économie : {pricing.savings.toLocaleString()} FCFA)
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* FEATURES LIST */}
                                    <ul className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
                                        {p.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* ACTION BUTTON */}
                                    <div className="pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => handleOpenSubscribeModal(p)}
                                            disabled={isCurrent}
                                            className={`w-full py-3 rounded-2xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 ${isCurrent
                                                    ? 'bg-slate-100 text-slate-400 cursor-default'
                                                    : 'bg-[#FFCC00] hover:bg-amber-300 text-slate-950 shadow-md active:scale-95'
                                                }`}
                                        >
                                            <span>
                                                {isCurrent
                                                    ? 'Plan Déjà Actif'
                                                    : p.price === 0
                                                        ? 'Activer le Plan Starter'
                                                        : `Souscrire (${pricing.total.toLocaleString()} FCFA)`}
                                            </span>
                                            {!isCurrent && <ArrowRight className="w-4 h-4 text-slate-950" />}
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* SUBSCRIPTION HISTORY TABLE */}
                {history && history.length > 0 && (
                    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
                        <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-slate-700" />
                            <span>Historique de Souscription</span>
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-medium text-slate-600">
                                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
                                    <tr>
                                        <th className="p-3">Plan</th>
                                        <th className="p-3">Durée</th>
                                        <th className="p-3">Montant Total</th>
                                        <th className="p-3">Numéro MoMo</th>
                                        <th className="p-3">Référence HR-Pay</th>
                                        <th className="p-3">Statut</th>
                                        <th className="p-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50">
                                            <td className="p-3 font-bold text-slate-950 capitalize">{sub.plan}</td>
                                            <td className="p-3 font-semibold text-slate-700">{sub.billing_cycle || 1} mois</td>
                                            <td className="p-3 font-bold text-slate-900">{Number(sub.amount).toLocaleString()} FCFA</td>
                                            <td className="p-3">{sub.payment_phone || '-'}</td>
                                            <td className="p-3 font-mono text-[11px] text-slate-500">{sub.hrskills_reference || '-'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${sub.payment_status === 'paid'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : sub.payment_status === 'pending'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                    {sub.payment_status === 'paid' ? 'Payé' : sub.payment_status === 'pending' ? 'En attente' : 'Échoué'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-400">{sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* MODAL 1: SUBSCRIBE / UPGRADE PAYMENT CONFIRMATION */}
                <AnimatePresence>
                    {selectedPlan && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6 relative"
                            >
                                <button
                                    onClick={() => setSelectedPlan(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-950">Souscrire au Plan {selectedPlan.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Paiement Mobile Money instantané pour <strong>{selectedCycle === 12 ? '1 an (12 mois)' : selectedCycle === 6 ? '6 mois' : '1 mois'}</strong>
                                    </p>
                                </div>

                                {(() => {
                                    const modalPricing = calculatePlanPricing(selectedPlan.price, selectedCycle);
                                    return (
                                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-slate-700">
                                            <div className="flex justify-between font-bold text-slate-950 text-sm">
                                                <span>Montant Total à Payer :</span>
                                                <span className="text-amber-900">{modalPricing.total.toLocaleString()} FCFA</span>
                                            </div>
                                            {selectedCycle > 1 && modalPricing.savings > 0 && (
                                                <p className="text-[11px] text-emerald-800 font-bold">
                                                    🎉 Vous économisez {modalPricing.savings.toLocaleString()} FCFA ({modalPricing.discountPercent}% de réduction appliqué) !
                                                </p>
                                            )}
                                            <p className="text-[11px] text-slate-500">Prélèvement automatique USSD Mobile Money 🇨🇲</p>
                                        </div>
                                    );
                                })()}

                                <form onSubmit={handleConfirmSubscribe} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro Mobile Money (MTN / Orange CM 🇨🇲) *</label>
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0">
                                                <span>🇨🇲 +237</span>
                                            </div>
                                            <input
                                                type="tel"
                                                required
                                                placeholder="ex: 699123456"
                                                value={phoneMomo}
                                                onChange={(e) => setPhoneMomo(e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-3.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                                            isSubmitting ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                                                <span>Traitement du paiement en cours, veuillez patienter...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Payer {calculatePlanPricing(selectedPlan.price, selectedCycle).total.toLocaleString()} FCFA via Mobile Money</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* MODAL 2: USSD PAYMENT POLLING OVERLAY */}
                <AnimatePresence>
                    {ussdModalState.isOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-center relative overflow-hidden"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto text-2xl shadow-inner font-bold">
                                    {ussdModalState.operator === 'ORANGE' ? '🍊' : '🟡'}
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-extrabold text-slate-950">Validation Abonnement Plan {ussdModalState.plan_name} 🇨🇲</h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Opérateur : <strong className="text-slate-900">{ussdModalState.operator} MoMo</strong> ({ussdModalState.phone})
                                    </p>
                                </div>

                                {ussdModalState.status === 'PENDING' && (
                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                                        <div className="flex items-center justify-center gap-2 text-amber-900 font-bold text-sm">
                                            <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
                                            <span>Prompt USSD Envoyé !</span>
                                        </div>
                                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                            Veuillez composer votre code secret PIN Mobile Money sur votre téléphone pour valider l'abonnement de <strong className="text-slate-950 font-bold">{Number(ussdModalState.amount).toLocaleString()} FCFA</strong>.
                                        </p>
                                        <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Vérification de votre paiement...</span>
                                        </div>
                                    </div>
                                )}

                                {ussdModalState.status === 'SUCCESS' && (
                                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                                        <h4 className="text-sm font-bold text-emerald-950">Abonnement Activé avec Succès !</h4>
                                        <p className="text-xs text-emerald-700">Rechargement de la console...</p>
                                    </div>
                                )}

                                {ussdModalState.status === 'FAILED' && (
                                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                                        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
                                        <h4 className="text-sm font-bold text-rose-950">Paiement Échoué ou Expiré</h4>
                                        <p className="text-xs text-rose-700">{ussdModalState.errorMsg || 'La transaction d\'abonnement n\'a pas été validée.'}</p>
                                        <button
                                            type="button"
                                            onClick={() => setUssdModalState(prev => ({ ...prev, isOpen: false }))}
                                            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800"
                                        >
                                            Fermer et Réessayer
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </AuthenticatedLayout>
    );
}
