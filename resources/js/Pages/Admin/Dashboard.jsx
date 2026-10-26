import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, Store, Users, ShoppingBag, Wallet, DollarSign, 
    TrendingUp, ArrowUpRight, Clock, CheckCircle2, AlertCircle, LogOut,
    Sparkles, ArrowRight, ExternalLink, Filter, Search, ChevronRight, BarChart3, Activity
} from 'lucide-react';

export default function Dashboard({ metrics, planCounts = {}, recentStores, pendingWithdrawals }) {
    const user = usePage().props.auth.user;
    const planPrices = usePage().props.planPrices || {};
    const formatPrice = (plan) => `${Number(planPrices[plan] || 0).toLocaleString('fr-FR')} FCFA/mois`;
    const vendorLabel = (plan) => `${planCounts[plan] || 0} Vendeur${(planCounts[plan] || 0) > 1 ? 's' : ''}`;

    const gmvChartData = [
        { day: 'Lun', val: 140000 },
        { day: 'Mar', val: 280000 },
        { day: 'Mer', val: 210000 },
        { day: 'Jeu', val: 450000 },
        { day: 'Ven', val: 390000 },
        { day: 'Sam', val: 580000 },
        { day: 'Dim', val: 720000 },
    ];

    const maxGmv = Math.max(...gmvChartData.map(d => d.val));

    return (
        <AuthenticatedLayout>
            <Head title="Console d'Administration Super-Admin — BIOLINKO" />

            <div className="space-y-8 pb-12">
                
                {/* 1. PROMOTIONAL SUPER-ADMIN HERO BANNER */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-[#141412] shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
                >
                    <div className="space-y-1 z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141412] text-white text-[11px] font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#FFCC00]" /> SUPER-ADMIN CONSOLE
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Supervision globale de la plateforme BIOLINKO SaaS
                        </h2>
                        <p className="text-xs text-[#141412] font-medium">
                            Gérez l'ensemble des vendeurs, surveillez le chiffre d'affaires du réseau et validez les retraits Mobile Money.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 z-10">
                        <Link
                            href={route('seller.dashboard')}
                            className="px-6 py-3 rounded-2xl bg-[#141412] text-white hover:bg-[#2B2A26] font-semibold text-xs shadow-xs transition-transform active:scale-95 whitespace-nowrap flex items-center gap-1.5"
                        >
                            <span>Espace Vendeur Test</span>
                            <ArrowUpRight className="w-4 h-4 text-amber-400" />
                        </Link>
                    </div>
                </motion.div>

                {/* 2. OVERVIEW SECTION & METRICS CARDS (EXACT STYLE FROM SCREENSHOT 2) */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-semibold text-[#141412] tracking-tight">Vue d'Ensemble Plateforme</h2>
                        <div className="text-xs text-[#5F5E58] font-medium">
                            Connecté en tant que <strong className="text-[#141412]">{user.name}</strong> ({user.email})
                        </div>
                    </div>

                    {/* 4 METRICS CARDS GRID (EXACT CAPTURE 2 CARD LAYOUT) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        
                        {/* GMV Card */}
                        <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
                                <span>Volume Ventes (GMV)</span>
                                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-[#141412]">
                                {Number(metrics?.totalGmv || 0).toLocaleString()} FCFA
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 flex items-center gap-0.5 font-semibold">
                                    <ArrowUpRight className="w-3 h-3" /> +58%
                                </span>
                                <span className="text-[#8B8A83]">Réseau Global</span>
                            </div>
                        </div>

                        {/* SaaS Revenue Card */}
                        <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
                                <span>Revenus SaaS Plateforme</span>
                                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-[#141412]">
                                {Number(metrics?.totalSaasRevenue || 0).toLocaleString()} FCFA
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 font-semibold">Commission 3%</span>
                                <span className="text-[#8B8A83]">Marge plateforme</span>
                            </div>
                        </div>

                        {/* Active Stores Card */}
                        <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
                                <span>Boutiques &amp; Vendeurs</span>
                                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                    <Store className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-[#141412]">
                                {metrics?.totalStores || 0} boutique(s)
                            </div>
                            <div className="text-[11px] text-[#8B8A83] font-medium">
                                {metrics?.totalVendors || 0} vendeur(s) enregistrés
                            </div>
                        </div>

                        {/* Pending Withdrawals Card */}
                        <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
                                <span>Retraits MoMo en Attente</span>
                                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                                    <Wallet className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-rose-600">
                                {metrics?.pendingWithdrawalsCount || 0} demande(s)
                            </div>
                            <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Action requise
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. CHARTS & GRAPHS SECTION (VOLUMES DE VENTES & MARGES) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* GMV GRAPHIC CHART (2 COLUMNS) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-black/[0.08] p-6 space-y-6 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-base font-semibold text-[#141412] flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-amber-500" />
                                    <span>Progression des Ventes Réseau (GMV)</span>
                                </h3>
                                <p className="text-xs text-[#5F5E58] font-medium">Volume des transactions traitées en FCFA par jour</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold uppercase">
                                En Direct
                            </span>
                        </div>

                        {/* VISUAL CHART BARS */}
                        <div className="pt-6 pb-2 px-2 flex items-end justify-between gap-3 h-48 border-b border-black/[0.05]">
                            {gmvChartData.map((item, idx) => {
                                const heightPercent = Math.max(15, Math.round((item.val / maxGmv) * 100));
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                        <div className="text-[10px] font-semibold text-[#5F5E58] opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.val.toLocaleString()}
                                        </div>
                                        <div 
                                            style={{ height: `${heightPercent}%` }}
                                            className="w-full rounded-2xl bg-gradient-to-t from-amber-400 to-[#FFCC00] group-hover:from-amber-500 group-hover:to-amber-300 transition-all shadow-2xs relative"
                                        />
                                        <span className="text-[11px] font-semibold text-[#5F5E58] mt-2">{item.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SAAS REVENUE MARGIN BREAKDOWN CARD (1 COLUMN) */}
                    <div className="bg-white rounded-3xl border border-black/[0.08] p-6 space-y-6 shadow-xs flex flex-col justify-between">
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-[#141412] flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-amber-600" />
                                <span>Répartition des Abonnements</span>
                            </h3>

                            <div className="space-y-3 text-xs font-medium">
                                <div className="p-3 rounded-2xl bg-[#F6F5F1] border border-black/[0.05] flex items-center justify-between">
                                    <span className="text-[#5F5E58]">Plan Starter (Gratuit)</span>
                                    <span className="font-semibold text-[#141412]">{vendorLabel('starter')}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                                    <span className="text-amber-900 font-semibold">Plan Pro ({formatPrice('pro')})</span>
                                    <span className="font-semibold text-amber-900">{vendorLabel('pro')}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-[#F6F5F1] border border-black/[0.08] flex items-center justify-between">
                                    <span className="text-[#141412] font-semibold">Plan Growth ({formatPrice('growth')})</span>
                                    <span className="font-semibold text-[#141412]">{vendorLabel('growth')}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-[#F6F5F1] border border-black/[0.08] flex items-center justify-between">
                                    <span className="text-[#141412] font-semibold">Plan Business ({formatPrice('business')})</span>
                                    <span className="font-semibold text-[#141412]">{vendorLabel('business')}</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={route('admin.subscriptions.index')}
                            className="w-full py-3 rounded-2xl bg-[#141412] hover:bg-[#141412] text-white font-semibold text-xs text-center transition-all shadow-xs"
                        >
                            Gérer les Abonnements SaaS
                        </Link>
                    </div>

                </div>

                {/* 4. TABLES SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* RECENT STORES TABLE */}
                    <div className="bg-white rounded-3xl border border-black/[0.08] p-6 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-[#141412] flex items-center gap-2">
                                <Store className="w-4 h-4 text-amber-700" />
                                <span>Boutiques Récemment Créées</span>
                            </h3>
                            <span className="text-xs text-[#8B8A83] font-medium">{recentStores?.length || 0} affichée(s)</span>
                        </div>

                        {recentStores && recentStores.length > 0 ? (
                            <div className="space-y-3">
                                {recentStores.map((st) => (
                                    <div key={st.id} className="p-4 rounded-2xl bg-[#F6F5F1] border border-black/[0.08] flex items-center justify-between gap-3 text-xs">
                                        <div className="truncate">
                                            <div className="font-semibold text-[#141412] truncate flex items-center gap-1.5">
                                                <span>{st.name}</span>
                                                <span className={`w-2 h-2 rounded-full ${st.is_published ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            </div>
                                            <div className="text-amber-700 font-mono text-[11px] truncate">biolinko.link/{st.slug}</div>
                                            <div className="text-[10px] text-[#8B8A83]">Vendeur: {st.user?.name || 'Inconnu'} ({st.plan_type || 'starter'})</div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link
                                                href={route('admin.stores.toggleStatus', st.id)}
                                                method="post"
                                                as="button"
                                                className={`px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-all cursor-pointer ${
                                                    st.is_published 
                                                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900' 
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                }`}
                                            >
                                                {st.is_published ? 'Masquer' : 'Publier'}
                                            </Link>
                                            <a
                                                href={`/${st.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-1.5 rounded-xl bg-[#141412] hover:bg-[#2B2A26] text-white font-semibold text-[11px] transition-all flex items-center gap-1"
                                            >
                                                <span>Vitrine</span>
                                                <ExternalLink className="w-3 h-3 text-amber-400" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-[#8B8A83] p-8 text-center bg-[#F6F5F1] rounded-2xl">
                                Aucune boutique créée pour le moment.
                            </div>
                        )}
                    </div>

                    {/* PENDING WITHDRAWALS TABLE */}
                    <div className="bg-white rounded-3xl border border-black/[0.08] p-6 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-[#141412] flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-rose-600" />
                                <span>Demandes de Retrait MoMo</span>
                            </h3>
                            <span className="text-xs text-rose-600 font-semibold">{pendingWithdrawals?.length || 0} en attente</span>
                        </div>

                        {pendingWithdrawals && pendingWithdrawals.length > 0 ? (
                            <div className="space-y-3">
                                {pendingWithdrawals.map((w) => (
                                    <div key={w.id} className="p-4 rounded-2xl bg-[#F6F5F1] border border-black/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div>
                                            <div className="font-semibold text-[#141412] text-sm">{Number(w.amount).toLocaleString()} FCFA</div>
                                            <div className="text-[#5F5E58] text-[11px]">Boutique : <strong className="text-[#141412]">{w.wallet?.store?.name || 'N/A'}</strong></div>
                                            <div className="text-[10px] text-[#8B8A83]">MoMo ({w.operator || 'ORANGE'}): {w.phone_number}</div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Link
                                                href={route('admin.withdrawals.approve', w.id)}
                                                method="post"
                                                as="button"
                                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-2xs transition-all cursor-pointer"
                                            >
                                                Approuver
                                            </Link>
                                            <Link
                                                href={route('admin.withdrawals.reject', w.id)}
                                                method="post"
                                                as="button"
                                                className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-[11px] transition-all cursor-pointer"
                                            >
                                                Rejeter
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-emerald-600 p-8 text-center bg-emerald-50/50 rounded-2xl font-medium border border-emerald-100">
                                Toutes les demandes de retrait sont traitées !
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}
