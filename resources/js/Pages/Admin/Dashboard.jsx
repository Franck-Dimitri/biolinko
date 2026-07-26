import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheck, Store, Users, ShoppingBag, Wallet, DollarSign, 
    TrendingUp, ArrowUpRight, Clock, CheckCircle2, AlertCircle, LogOut,
    Sparkles, ArrowRight, ExternalLink, Filter, Search, ChevronRight
} from 'lucide-react';

export default function Dashboard({ metrics, recentStores, pendingWithdrawals }) {
    const user = usePage().props.auth.user;

    const gmvChartData = [
        { day: '01 Jul', val: 140000 },
        { day: '02 Jul', val: 280000 },
        { day: '03 Jul', val: 210000 },
        { day: '04 Jul', val: 450000 },
        { day: '05 Jul', val: 190000 },
        { day: '06 Jul', val: 380000 },
        { day: '07 Jul', val: 520000 },
        { day: '08 Jul', val: 610000 },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Console d'Administration Super-Admin — BIOLINKO" />

            <div className="space-y-8 font-sans">
                
                {/* 1. PROMOTIONAL SUPER-ADMIN HERO BANNER */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-slate-950 shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
                >
                    <div className="space-y-1 z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-semibold uppercase tracking-wider">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#FFCC00]" /> SUPER-ADMIN CONSOLE
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Supervision globale de la plateforme BIOLINKO SaaS
                        </h2>
                        <p className="text-xs text-slate-900 font-medium">
                            Gérez l'ensemble des vendeurs, surveillez le chiffre d'affaires du réseau et validez les retraits Mobile Money.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 z-10">
                        <Link
                            href={route('seller.dashboard')}
                            className="px-6 py-3 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 font-semibold text-xs shadow-xs transition-transform active:scale-95 whitespace-nowrap flex items-center gap-1.5"
                        >
                            <span>Espace Vendeur Test</span>
                            <ArrowUpRight className="w-4 h-4 text-amber-400" />
                        </Link>
                    </div>
                </motion.div>

                {/* 2. OVERVIEW SECTION & METRICS CARDS */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Vue d'Ensemble Plateforme</h2>
                        <div className="text-xs text-slate-500 font-medium">
                            Connecté en tant que <strong className="text-slate-950">{user.name}</strong> ({user.email})
                        </div>
                    </div>

                    {/* 4 METRICS CARDS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        
                        {/* GMV Card */}
                        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>Volume Ventes (GMV)</span>
                                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                                {Number(metrics?.totalGmv || 0).toLocaleString()} FCFA
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 flex items-center gap-0.5 font-semibold">
                                    <ArrowUpRight className="w-3 h-3" /> +58%
                                </span>
                                <span className="text-slate-400">Réseau Global</span>
                            </div>
                        </div>

                        {/* SaaS Revenue Card */}
                        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>Revenus SaaS Plateforme</span>
                                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                                {Number(metrics?.totalSaasRevenue || 0).toLocaleString()} FCFA
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 font-semibold">Commission</span>
                                <span className="text-slate-400">Marge plateforme</span>
                            </div>
                        </div>

                        {/* Active Stores Card */}
                        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>Boutiques & Vendeurs</span>
                                <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                    <Store className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                                {metrics?.totalStores || 0} boutique(s)
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                                {metrics?.totalVendors || 0} vendeur(s) enregistrés
                            </div>
                        </div>

                        {/* Pending Withdrawals Card */}
                        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
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

                {/* 3. TABLES SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* RECENT STORES TABLE */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                                <Store className="w-4 h-4 text-amber-700" />
                                <span>Boutiques Récemment Créées</span>
                            </h3>
                            <span className="text-xs text-slate-400 font-medium">{recentStores?.length || 0} affichée(s)</span>
                        </div>

                        {recentStores && recentStores.length > 0 ? (
                            <div className="space-y-3">
                                {recentStores.map((st) => (
                                    <div key={st.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                                        <div className="truncate">
                                            <div className="font-bold text-slate-950 truncate">{st.name}</div>
                                            <div className="text-amber-700 font-mono text-[11px] truncate">biolinko.app/{st.slug}</div>
                                            <div className="text-[10px] text-slate-400">Vendeur: {st.user?.name || 'Inconnu'}</div>
                                        </div>
                                        <a
                                            href={`/${st.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition-all flex items-center gap-1 shrink-0"
                                        >
                                            <span>Voir Vitrine</span>
                                            <ExternalLink className="w-3 h-3 text-amber-400" />
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 p-8 text-center bg-slate-50 rounded-2xl">
                                Aucune boutique créée pour le moment.
                            </div>
                        )}
                    </div>

                    {/* PENDING WITHDRAWALS TABLE */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-rose-600" />
                                <span>Demandes de Retrait MoMo</span>
                            </h3>
                            <span className="text-xs text-rose-600 font-semibold">{pendingWithdrawals?.length || 0} en attente</span>
                        </div>

                        {pendingWithdrawals && pendingWithdrawals.length > 0 ? (
                            <div className="space-y-3">
                                {pendingWithdrawals.map((w) => (
                                    <div key={w.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                                        <div>
                                            <div className="font-extrabold text-slate-950 text-sm">{Number(w.amount).toLocaleString()} FCFA</div>
                                            <div className="text-slate-600 text-[11px]">Boutique : <strong className="text-slate-950">{w.wallet?.store?.name || 'N/A'}</strong></div>
                                            <div className="text-[10px] text-slate-400">Numéro MoMo: {w.phone_number}</div>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold shrink-0">
                                            En attente de paiement
                                        </span>
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
