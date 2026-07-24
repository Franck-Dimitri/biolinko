import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, ShoppingBag, Wallet, Copy, Check, ExternalLink, 
    Sparkles, ArrowRight, Settings, Plus, Phone, MapPin, Clock, 
    TrendingUp, PackageCheck, X, CheckCircle2, Circle, ArrowLeft,
    ArrowUpRight, ArrowDownRight, Calendar, Download, MoreHorizontal, Filter, Image as ImageIcon
} from 'lucide-react';

export default function Dashboard({ store, wallet, productsCount, ordersCount, totalRevenue, recentOrders, setupChecklist, completionPercentage, appUrl }) {
    const user = usePage().props.auth.user;
    const products = usePage().props.products || [];
    const [orderFilter, setOrderFilter] = useState('all');

    const salesChartData = [
        { day: '01 Jul', val: 40 },
        { day: '02 Jul', val: 80 },
        { day: '03 Jul', val: 60 },
        { day: '04 Jul', val: 140 },
        { day: '05 Jul', val: 20 },
        { day: '06 Jul', val: 120 },
        { day: '07 Jul', val: 110 },
        { day: '08 Jul', val: 150 },
        { day: '09 Jul', val: 30 },
        { day: '10 Jul', val: 100 },
        { day: '11 Jul', val: 45 },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Tableau de bord Vendeur — BIOLINKO" />

            <div className="space-y-8 font-sans">
                
                {/* 1. PROMOTIONAL BANNER */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-slate-950 shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden"
                >
                    <div className="space-y-1 z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-semibold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5 text-[#FFCC00]" /> BIOLINKO SAAS PRO
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Boostez vos ventes avec la gestion automatique du portefeuille MoMo.
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 z-10">
                        <Link
                            href={route('appearance.index')}
                            className="px-5 py-2.5 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 font-semibold text-xs transition-colors"
                        >
                            Personnaliser Vitrine
                        </Link>
                        <Link
                            href={route('orders.index')}
                            className="px-6 py-3 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 font-semibold text-xs shadow-xs transition-transform active:scale-95 whitespace-nowrap"
                        >
                            Gérer mes Commandes
                        </Link>
                    </div>
                </motion.div>

                {/* 2. OVERVIEW SECTION & METRICS CARDS */}
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

                {/* 3. RECENT PRODUCTS CARDS SECTION WITH STRICT LINE-CLAMP AND OVERFLOW PROTECTION */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">Aperçu du Catalogue</h3>
                            <p className="text-xs text-slate-500 font-medium">Vos derniers produits ajoutés à votre boutique.</p>
                        </div>

                        <Link
                            href={route('products.index')}
                            className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                            <span>Gérer le catalogue</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.slice(0, 3).map((product) => (
                                <div key={product.id} className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between p-4 min-w-0">
                                    <div className="h-44 bg-white rounded-xl overflow-hidden mb-3 relative flex items-center justify-center border border-slate-200">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShoppingBag className="w-10 h-10 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="space-y-1 min-w-0">
                                        <div className="font-semibold text-slate-900 text-sm line-clamp-1 break-words truncate">{product.title}</div>
                                        {product.description && (
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium break-words overflow-hidden text-ellipsis">
                                                {product.description}
                                            </p>
                                        )}
                                        <div className="text-xs text-amber-800 font-bold pt-1">{Number(product.price_display || product.price_vendor).toLocaleString()} FCFA</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200/60 text-slate-500 text-xs font-medium">
                            Aucun produit encore au catalogue. Rendez-vous sur l'onglet Catalogue pour en ajouter.
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
