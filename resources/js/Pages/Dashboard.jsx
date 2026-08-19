import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Zap, ShoppingBag, Wallet, ExternalLink, Sparkles, ArrowRight, Plus, 
    TrendingUp, PackageCheck, CheckCircle2, ArrowUpRight, Calendar, 
    BarChart3, MessageCircle, FileText, ArrowRightCircle, ShieldCheck, Tag, Eye
} from 'lucide-react';

export default function Dashboard({ store, wallet, productsCount, ordersCount, totalRevenue, recentOrders, setupChecklist, completionPercentage, analytics, appUrl }) {
    const user = usePage().props.auth.user;
    const products = usePage().props.products || [];

    const dailySales = analytics?.dailySales || [];
    const topProducts = analytics?.topProducts || [];
    const maxRevenue = Math.max(...dailySales.map(d => d.revenue), 1000);

    return (
        <AuthenticatedLayout>
            <Head title="Tableau de bord Vendeur — BIOLINKO" />

            <div className="space-y-8 font-sans pb-12">
                
                {/* ONBOARDING OR WELCOME BANNER */}
                {(store?.is_published || completionPercentage >= 100) ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#FFCC00] text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0 overflow-hidden border border-amber-300">
                                {store?.logo_url ? (
                                    <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingBag className="w-7 h-7 text-slate-950" />
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                                        BOUTIQUE PUBLIÉE EN LIGNE
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    Bienvenue sur votre Tableau de Bord, {store?.name || user?.name} 👋
                                </h2>
                                <p className="text-xs text-slate-300 font-medium">
                                    Votre vitrine BIOLINKO est 100% configurée, publiée et prête à recevoir des commandes Mobile Money !
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                            <Link
                                href={`/${store?.slug}`}
                                target="_blank"
                                className="px-5 py-3 rounded-xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                            >
                                <Eye className="w-4 h-4 text-slate-950" />
                                <span>Voir ma Vitrine Client</span>
                            </Link>
                            <Link
                                href={route('store.togglePublish')}
                                method="post"
                                as="button"
                                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                            >
                                Masquer
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                            <div className="space-y-1">
                                <div className="inline-flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${store.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                                        {store.is_published ? 'BOUTIQUE PUBLIÉE EN LIGNE' : 'BOUTIQUE EN MODE BROUILLON (MASQUÉE)'}
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                                    Kit de Démarrage Vendeur BIOLINKO ({completionPercentage}% Complété)
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">
                                    Suivez ces étapes simples pour activer et publier votre boutique officielle
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/${store.slug}`}
                                    target="_blank"
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center gap-2 transition-all"
                                >
                                    <Eye className="w-4 h-4 text-slate-600" />
                                    <span>Voir ma Vitrine</span>
                                </Link>

                                <Link
                                    href={route('store.togglePublish')}
                                    method="post"
                                    as="button"
                                    className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all cursor-pointer ${
                                        store.is_published 
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                                            : 'bg-[#FFCC00] hover:bg-amber-400 text-slate-950 border border-amber-300'
                                    }`}
                                >
                                    {store.is_published ? 'Masquer la Boutique' : '🚀 Publier ma Boutique'}
                                </Link>
                            </div>
                        </div>

                        {/* PROGRESS BAR */}
                        <div className="space-y-2">
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className="bg-[#FFCC00] h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* 4 STEPS CHECKLIST GRID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold">
                            
                            <div className={`p-4 rounded-2xl border flex items-center justify-between ${setupChecklist?.store_created ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className={`w-4 h-4 ${setupChecklist?.store_created ? 'text-emerald-600' : 'text-slate-300'}`} />
                                    <span>1. Inscription Compte Vendeur</span>
                                </div>
                            </div>

                            <Link 
                                href={route('appearance.index')}
                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.02] ${setupChecklist?.appearance_configured ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-amber-300/80 text-slate-800'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className={`w-4 h-4 ${setupChecklist?.appearance_configured ? 'text-emerald-600' : 'text-amber-500'}`} />
                                    <span>2. Apparence &amp; Logo</span>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </Link>

                            <Link 
                                href={route('products.index')}
                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.02] ${setupChecklist?.first_product ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-amber-300/80 text-slate-800'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className={`w-4 h-4 ${setupChecklist?.first_product ? 'text-emerald-600' : 'text-amber-500'}`} />
                                    <span>3. Créer 1er Produit ({productsCount})</span>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                            </Link>

                            <Link 
                                href={route('store.togglePublish')}
                                method="post"
                                as="button"
                                className={`p-4 rounded-2xl border flex items-center justify-between text-left transition-all hover:scale-[1.02] cursor-pointer ${store?.is_published ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-amber-100 border-amber-300 text-amber-950'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className={`w-4 h-4 ${store?.is_published ? 'text-emerald-600' : 'text-amber-600'}`} />
                                    <span>4. Publier la Vitrine</span>
                                </div>
                                <Zap className="w-3.5 h-3.5 text-amber-600" />
                            </Link>

                        </div>
                    </motion.div>
                )}

                {/* 2. PENDING ORDERS WHATSAPP RELANCE ALERT */}
                {analytics?.pendingFollowupsCount > 0 && (
                    <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 shrink-0">
                                <MessageCircle className="w-5 h-5 fill-slate-950" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                    {analytics.pendingFollowupsCount} commande(s) en attente de paiement USSD
                                </h3>
                                <p className="text-xs text-slate-600">
                                    Relancez directement vos clients sur WhatsApp pour encaisser vos ventes plus rapidement.
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route('orders.index')}
                            className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs shrink-0 transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                            <span>Relancer sur WhatsApp</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {/* 3. OVERVIEW SECTION & METRICS CARDS */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Vue d'Ensemble Financière</h2>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={route('orders.index')}
                                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5"
                            >
                                <Wallet className="w-3.5 h-3.5 text-amber-600" />
                                <span>Demander un Retrait MoMo</span>
                            </Link>
                        </div>
                    </div>

                    {/* 4 METRIC CARDS GRID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>Chiffre d'Affaires</span>
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                                {Number(totalRevenue || 0).toLocaleString()} FCFA
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 flex items-center gap-0.5 font-semibold">
                                    <ArrowUpRight className="w-3 h-3" /> +41%
                                </span>
                                <span className="text-slate-400">Total Ventes</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>Articles au Catalogue</span>
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                                {productsCount || 0} produit(s)
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="text-slate-400">Catalogue Actif</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>Commandes Enregistrées</span>
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                                    <PackageCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                                {ordersCount || 0}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="text-slate-400">Total Commandes</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>Portefeuille MoMo</span>
                                <div className="w-7 h-7 rounded-lg bg-[#FFCC00] text-slate-950 flex items-center justify-center font-semibold text-xs">
                                    FCFA
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                                {Number(wallet?.balance_available || 0).toLocaleString()} FCFA
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 flex items-center gap-0.5 font-semibold">
                                    Disponible
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. INTERACTIVE SALES ANALYTICS CHART & SMARTLINKS CONVERSION */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Daily Revenue Bar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-amber-500" />
                                    <span>Évolution des Ventes Quotidiennes (14 Derniers Jours)</span>
                                </h3>
                                <p className="text-xs text-slate-500">Revenus générés par jour sur votre boutique</p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">FCFA</span>
                        </div>

                        {/* Chart Visualization */}
                        <div className="pt-4">
                            <div className="h-48 flex items-end justify-between gap-2 border-b border-slate-100 pb-2 px-2">
                                {dailySales.map((day, idx) => {
                                    const heightPct = Math.max(8, Math.round((day.revenue / maxRevenue) * 100));
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                                            
                                            {/* Tooltip on hover */}
                                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg font-bold whitespace-nowrap shadow-lg pointer-events-none z-20">
                                                {new Intl.NumberFormat('fr-FR').format(day.revenue)} FCFA ({day.orders} vente(s))
                                            </div>

                                            {/* Bar */}
                                            <div className="w-full max-w-[28px] bg-slate-100 group-hover:bg-amber-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full transition-colors">
                                                <div 
                                                    style={{ height: `${heightPct}%` }}
                                                    className="w-full bg-gradient-to-t from-amber-500 to-[#FFCC00] rounded-t-xl transition-all duration-500 group-hover:from-amber-600 group-hover:to-amber-400"
                                                ></div>
                                            </div>

                                            {/* X Axis Label */}
                                            <span className="text-[10px] text-slate-400 font-semibold truncate max-w-full">
                                                {day.date.split(' ')[0]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* SmartLinks Conversion Card */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
                                    <span>Taux de Conversion SmartLinks</span>
                                </h3>
                                <Link href={route('seller.smartlinks.index')} className="text-xs font-bold text-amber-600 hover:text-amber-700">
                                    Voir tous ➔
                                </Link>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3 text-center">
                                <div className="text-3xl font-black text-slate-900">
                                    {analytics?.conversionRate || 0}%
                                </div>
                                <div className="text-xs text-slate-600 font-medium">
                                    Taux d'achat direct depuis vos liens de commande
                                </div>
                            </div>

                            <div className="space-y-2 text-xs font-semibold text-slate-600">
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span>👀 Clics / Vues Liens :</span>
                                    <strong className="text-slate-900">{analytics?.totalViews || 0}</strong>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span>🛍️ Achats Encaissés :</span>
                                    <strong className="text-emerald-600 font-bold">{analytics?.totalSmartSales || 0}</strong>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={route('seller.smartlinks.index')}
                            className="w-full py-3 rounded-2xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-2xs"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Créer un nouveau SmartLink</span>
                        </Link>
                    </div>
                </div>

                {/* 5. TOP SELLING PRODUCTS & RECENT CATALOGUE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Top 5 Products Table */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Top 5 Produits les Plus Vendus</h3>
                                <p className="text-xs text-slate-500">Articles générant le plus de volume sur votre boutique</p>
                            </div>
                            <Link href={route('products.index')} className="text-xs font-bold text-amber-600 hover:text-amber-700">
                                Voir catalogue ➔
                            </Link>
                        </div>

                        {topProducts && topProducts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-medium text-slate-700">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-2.5 px-3">Produit</th>
                                            <th className="py-2.5 px-3 text-center">Quantités Vendues</th>
                                            <th className="py-2.5 px-3 text-right">Chiffre d'Affaires</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {topProducts.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/60">
                                                <td className="py-3 px-3 font-bold text-slate-900">{p.product_title}</td>
                                                <td className="py-3 px-3 text-center font-mono font-bold text-amber-600">
                                                    {p.total_qty} unités
                                                </td>
                                                <td className="py-3 px-3 text-right font-black text-slate-900">
                                                    {new Intl.NumberFormat('fr-FR').format(p.total_revenue)} FCFA
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 text-center bg-slate-50 rounded-2xl text-xs text-slate-500">
                                Les statistiques des meilleures ventes apparaîtront dès vos premiers encaissements.
                            </div>
                        )}
                    </div>

                    {/* Recent Products Summary */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">Aperçu Catalogue</h3>
                            <Link href={route('products.index')} className="text-xs font-bold text-slate-600 hover:text-slate-900">
                                Gérer
                            </Link>
                        </div>

                        {products && products.length > 0 ? (
                            <div className="space-y-3">
                                {products.slice(0, 3).map((product) => (
                                    <div key={product.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                                        <div className="flex items-center gap-3 truncate">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ShoppingBag className="w-5 h-5 text-slate-300" />
                                                )}
                                            </div>
                                            <div className="truncate">
                                                <div className="text-xs font-bold text-slate-900 truncate">{product.title}</div>
                                                <div className="text-[11px] text-amber-700 font-bold">
                                                    {new Intl.NumberFormat('fr-FR').format(product.price_display || product.price_vendor)} FCFA
                                                </div>
                                            </div>
                                        </div>

                                        <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center bg-slate-50 rounded-2xl text-xs text-slate-500">
                                Aucun produit enregistré.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
