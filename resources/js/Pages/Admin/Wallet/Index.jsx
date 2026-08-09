import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Wallet, DollarSign, TrendingUp, Crown, ShieldCheck, ArrowUpRight, CheckCircle2, FileText, ArrowRight, BarChart3, PieChart
} from 'lucide-react';

export default function WalletIndex({ metrics, paidOrders, completedWithdrawals }) {
    const user = usePage().props.auth.user;

    const streamsData = [
        { label: 'Gain 2% Marge Ventes', val: metrics?.total_saas_margin || 0, color: 'from-amber-400 to-[#FFCC00]' },
        { label: 'Gain 1% Frais Retraits MoMo', val: metrics?.total_withdrawal_fees || 0, color: 'from-emerald-400 to-emerald-600' },
        { label: 'Gain Abonnements SaaS', val: metrics?.total_subscription_revenue || 0, color: 'from-purple-400 to-purple-600' },
    ];

    const totalVal = Math.max(1, metrics?.total_wallet_balance || 0);

    return (
        <AuthenticatedLayout>
            <Head title="Portefeuille Admin & Gains Plateforme — Administration BIOLINKO" />

            <div className="space-y-8 font-sans pb-12">
                
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-slate-950 shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-semibold uppercase tracking-wider">
                            <Wallet className="w-3.5 h-3.5 text-[#FFCC00]" /> PORTEFEUILLE FINANCIER SUPER-ADMIN
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Solde Cumulé &amp; Revenus Réseau BIOLINKO
                        </h2>
                        <p className="text-xs text-slate-900 font-medium">
                            Suivez l'intégralité des gains issus des commissions de 2% sur les ventes, des frais de 1% sur les retraits MoMo et des abonnements SaaS.
                        </p>
                    </div>
                </div>

                {/* 4 ALIGNED STAT CARDS (EXACT CAPTURE 2 STYLE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Solde Total Cumulé */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Solde Total Portefeuille</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {Number(metrics?.total_wallet_balance || 0).toLocaleString()} FCFA
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 flex items-center gap-0.5 font-semibold">
                                <ArrowUpRight className="w-3 h-3" /> Net Cumulé
                            </span>
                            <span className="text-slate-400">Total Plateforme</span>
                        </div>
                    </div>

                    {/* Gain 2% Marge Ventes */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Marge 2% sur les Ventes</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-amber-600">
                            {Number(metrics?.total_saas_margin || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-amber-700 font-semibold">
                            Commissions Fast Checkout
                        </div>
                    </div>

                    {/* Gain 1% Frais Retraits MoMo */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Gain 1% Retraits MoMo</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-emerald-600">
                            {Number(metrics?.total_withdrawal_fees || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">
                            Frais Payout Vendeurs
                        </div>
                    </div>

                    {/* Gain Abonnements SaaS */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Gain Abonnements SaaS</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                                <Crown className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-purple-700">
                            {Number(metrics?.total_subscription_revenue || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-purple-700 font-semibold">
                            Pro, Growth &amp; Business
                        </div>
                    </div>

                </div>

                {/* CHARTS & REVENUE BREAKDOWN */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* VISUAL BREAKDOWN BARS (2 COLUMNS) */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-amber-500" />
                                    <span>Analyse des Sources de Revenus</span>
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">Répartition des gains par flux de commissions et abonnements</p>
                            </div>
                        </div>

                        <div className="space-y-5 pt-2">
                            {streamsData.map((stream, idx) => {
                                const percent = Math.round((stream.val / totalVal) * 100) || 0;
                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-800">{stream.label}</span>
                                            <span className="text-slate-950 font-mono">{Number(stream.val).toLocaleString()} FCFA ({percent}%)</span>
                                        </div>
                                        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                                            <div 
                                                style={{ width: `${Math.max(5, percent)}%` }} 
                                                className={`h-full rounded-full bg-gradient-to-r ${stream.color} transition-all duration-500`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* FINANCIAL SUMMARY CARD (1 COLUMN) */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-6 shadow-xs flex flex-col justify-between">
                        <div className="space-y-4">
                            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-amber-600" />
                                <span>Sécurité &amp; Traçabilité</span>
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                Toutes les commissions (2% ventes, 1% retraits) sont calculées et enregistrées automatiquement lors des événements webhook Mobile Money.
                            </p>
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                                🔥 <strong>Garantie BIOLINKO</strong> : Aucun frais caché. Solde transférable vers le compte bancaire/MoMo principal du Super-Admin.
                            </div>
                        </div>
                    </div>

                </div>

                {/* TABLES: HISTORY OF INCOME ENTRIES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* SAAS MARGIN FROM PAID ORDERS */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-amber-600" />
                                <span>Gains 2% Ventes Récents</span>
                            </h3>
                            <span className="text-xs text-slate-400 font-medium">{paidOrders?.length || 0} transaction(s)</span>
                        </div>

                        {paidOrders && paidOrders.length > 0 ? (
                            <div className="space-y-3">
                                {paidOrders.map((ord) => (
                                    <div key={ord.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                                        <div>
                                            <div className="font-extrabold text-amber-700 font-mono text-sm">+{Number(ord.saas_margin || 0).toLocaleString()} FCFA</div>
                                            <div className="text-slate-600 text-[11px]">Boutique: <strong className="text-slate-950">{ord.store?.name}</strong></div>
                                            <div className="text-[10px] text-slate-400">Réf: {ord.tracking_code}</div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                            2% Encaissé
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 p-8 text-center bg-slate-50 rounded-2xl">
                                Aucun gain de vente enregistré pour le moment.
                            </div>
                        )}
                    </div>

                    {/* WITHDRAWAL FEES FROM CASH-OUTS */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                <span>Gains 1% Frais Payout Retraits</span>
                            </h3>
                            <span className="text-xs text-slate-400 font-medium">{completedWithdrawals?.length || 0} virement(s)</span>
                        </div>

                        {completedWithdrawals && completedWithdrawals.length > 0 ? (
                            <div className="space-y-3">
                                {completedWithdrawals.map((w) => (
                                    <div key={w.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                                        <div>
                                            <div className="font-extrabold text-emerald-600 font-mono text-sm">+{Number(w.amount * 0.01).toLocaleString()} FCFA</div>
                                            <div className="text-slate-600 text-[11px]">Boutique: <strong className="text-slate-950">{w.wallet?.store?.name || 'N/A'}</strong></div>
                                            <div className="text-[10px] text-slate-400">Retrait #{w.id} ({Number(w.amount).toLocaleString()} FCFA)</div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                                            1% Payout Fee
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 p-8 text-center bg-slate-50 rounded-2xl">
                                Aucun gain sur virement pour le moment.
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}
