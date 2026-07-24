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
                            Boostez vos ventes avec les relances WhatsApp automatiques.
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 z-10">
                        <Link
                            href={route('appearance.index')}
                            className="px-5 py-2.5 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 font-semibold text-xs transition-colors"
                        >
                            Personnaliser Vitrine
                        </Link>
                        <button className="px-6 py-3 rounded-2xl bg-slate-950 text-white hover:bg-slate-800 font-semibold text-xs shadow-xs transition-transform active:scale-95 whitespace-nowrap">
                            Passer au Plan Pro
                        </button>
                    </div>
                </motion.div>

                {/* 2. OVERVIEW SECTION & METRICS CARDS */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-semibold text-slate-900 tracking-tight">Overview</h2>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-xs">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>06 Oct 2026 - 07 Oct 2026</span>
                            </div>

                            <select className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-xs outline-none">
                                <option>Derniers 30 jours</option>
                                <option>Derniers 7 jours</option>
                                <option>Ce mois-ci</option>
                            </select>

                            <button className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5" />
                                <span>Exporter</span>
                            </button>
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
                                {Number(totalRevenue || 124542).toLocaleString()} FCFA
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 flex items-center gap-0.5 font-semibold">
                                    <ArrowUpRight className="w-3 h-3" /> +41%
                                </span>
                                <span className="text-slate-400">vs mois dernier</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>Ventes Totales</span>
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                                12 562 FCFA
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 flex items-center gap-0.5 font-semibold">
                                    <ArrowUpRight className="w-3 h-3" /> +41%
                                </span>
                                <span className="text-slate-400">vs mois dernier</span>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                                <span>Commandes Traitées</span>
                                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                                    <PackageCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                                {ordersCount || 7532}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 flex items-center gap-0.5 font-semibold">
                                    <ArrowUpRight className="w-3 h-3" /> +15%
                                </span>
                                <span className="text-slate-400">vs mois dernier</span>
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
                                {Number(wallet?.balance_available || 60652).toLocaleString()} FCFA
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 flex items-center gap-0.5 font-semibold">
                                    <ArrowUpRight className="w-3 h-3" /> +41%
                                </span>
                                <span className="text-slate-400">Disponible</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. VISUAL CHARTS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ventes totales</div>
                                <div className="text-2xl font-semibold text-slate-950 mt-1">1,525 <span className="text-xs text-emerald-600 font-semibold">+20.1%</span></div>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                                Derniers 30 jours 🔽
                            </div>
                        </div>

                        <div className="h-44 flex items-end justify-between gap-2 pt-6">
                            {salesChartData.map((d, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="w-full bg-amber-50 rounded-t-lg h-full relative flex items-end">
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(d.val / 150) * 100}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.05 }}
                                            className="w-full bg-[#FFCC00] group-hover:bg-amber-400 rounded-t-lg transition-colors"
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
                        <div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenu</div>
                            <div className="text-2xl font-semibold text-slate-950 mt-1">20,462.89 FCFA</div>
                            <div className="text-xs text-emerald-600 font-semibold mt-0.5">+20.1% vs mois dernier</div>
                        </div>

                        <div className="h-36 w-full pt-4">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 100">
                                <defs>
                                    <linearGradient id="yellow-gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FFCC00" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#FFCC00" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M 0 80 Q 30 50, 60 70 T 120 40 T 180 20 L 200 10 L 200 100 L 0 100 Z"
                                    fill="url(#yellow-gradient)"
                                />
                                <path
                                    d="M 0 80 Q 30 50, 60 70 T 120 40 T 180 20 L 200 10"
                                    fill="none"
                                    stroke="#EAB308"
                                    strokeWidth="3"
                                />
                                <circle cx="30" cy="58" r="4" fill="#EAB308" />
                                <circle cx="60" cy="70" r="4" fill="#EAB308" />
                                <circle cx="120" cy="40" r="4" fill="#EAB308" />
                                <circle cx="180" cy="20" r="4" fill="#EAB308" />
                            </svg>
                        </div>
                    </div>

                </div>

                {/* 4. RECENT PRODUCTS CARDS SECTION ON DASHBOARD (as requested) */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-slate-900">Articles en Carte au Catalogue</h3>
                            <p className="text-xs text-slate-500 font-medium">Vos produits actifs affichés en cartes modernes sur votre vitrine.</p>
                        </div>

                        <Link
                            href={route('products.index')}
                            className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors flex items-center gap-1.5"
                        >
                            <span>Voir le catalogue complet</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.slice(0, 3).map((product) => (
                                <div key={product.id} className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between p-4">
                                    <div className="h-40 bg-white rounded-xl overflow-hidden mb-3 relative flex items-center justify-center">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl">🛍️</span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="font-semibold text-slate-900 text-sm truncate">{product.title}</div>
                                        <div className="text-xs text-amber-800 font-semibold">{Number(product.price_display || product.price_vendor).toLocaleString()} FCFA</div>
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

                {/* 5. RECENT ORDERS TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-xl font-semibold text-slate-900">Dernières Ventes</h3>

                        <div className="flex items-center gap-3">
                            <button className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors">
                                Voir tout
                            </button>
                            <button className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5" />
                                <span>Exporter</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Tabs with Modern Clean Active Indicator (as requested) */}
                    <div className="flex items-center gap-4 border-b border-slate-200/80 text-xs font-medium text-slate-500 overflow-x-auto pb-1">
                        <button 
                            onClick={() => setOrderFilter('all')}
                            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
                                orderFilter === 'all' ? 'border-[#FFCC00] text-slate-950 font-semibold' : 'border-transparent hover:text-slate-900'
                            }`}
                        >
                            Toutes les tâches
                        </button>
                        <button 
                            onClick={() => setOrderFilter('completed')}
                            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
                                orderFilter === 'completed' ? 'border-[#FFCC00] text-slate-950 font-semibold' : 'border-transparent hover:text-slate-900'
                            }`}
                        >
                            Completed
                        </button>
                        <button 
                            onClick={() => setOrderFilter('progress')}
                            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
                                orderFilter === 'progress' ? 'border-[#FFCC00] text-slate-950 font-semibold' : 'border-transparent hover:text-slate-900'
                            }`}
                        >
                            In Progress
                        </button>
                        <button 
                            onClick={() => setOrderFilter('pending')}
                            className={`pb-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                                orderFilter === 'pending' ? 'border-[#FFCC00] text-slate-950 font-semibold' : 'border-transparent hover:text-slate-900'
                            }`}
                        >
                            <span>Pending Approval</span>
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-semibold">2</span>
                        </button>
                        <button 
                            onClick={() => setOrderFilter('cancelled')}
                            className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
                                orderFilter === 'cancelled' ? 'border-[#FFCC00] text-slate-950 font-semibold' : 'border-transparent hover:text-slate-900'
                            }`}
                        >
                            Cancelled
                        </button>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-medium text-slate-700">
                            <thead className="bg-slate-50/80 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-y border-slate-100">
                                <tr>
                                    <th className="p-3 pl-4">Client Name</th>
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Product</th>
                                    <th className="p-3">City</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50/60 transition-colors">
                                    <td className="p-3 pl-4 font-semibold text-slate-950">Savannah Nguyen</td>
                                    <td className="p-3 text-slate-500 font-mono">07/05/2026</td>
                                    <td className="p-3 font-semibold text-slate-950">15 000 FCFA</td>
                                    <td className="p-3">Clothes</td>
                                    <td className="p-3 font-medium text-slate-800 truncate max-w-[180px]">Lc Waikiki Jean cargo fille...</td>
                                    <td className="p-3 text-slate-600">Douala</td>
                                    <td className="p-3">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                            ● Completed
                                        </span>
                                    </td>
                                    <td className="p-3 text-right pr-4 text-slate-400"><MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-slate-900" /></td>
                                </tr>

                                <tr className="hover:bg-slate-50/60 transition-colors">
                                    <td className="p-3 pl-4 font-semibold text-slate-950">Jerome Bell</td>
                                    <td className="p-3 text-slate-500 font-mono">07/05/2026</td>
                                    <td className="p-3 font-semibold text-slate-950">25 000 FCFA</td>
                                    <td className="p-3">Shoes</td>
                                    <td className="p-3 font-medium text-slate-800 truncate max-w-[180px]">Chaussures Cuir Italienne...</td>
                                    <td className="p-3 text-slate-600">Yaoundé</td>
                                    <td className="p-3">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                            ● Pending
                                        </span>
                                    </td>
                                    <td className="p-3 text-right pr-4 text-slate-400"><MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-slate-900" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
