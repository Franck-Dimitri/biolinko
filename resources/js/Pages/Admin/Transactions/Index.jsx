import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ShoppingBag, Search, ShieldCheck, DollarSign, TrendingUp, CheckCircle2, Clock, XCircle, ExternalLink, ArrowUpRight
} from 'lucide-react';

export default function TransactionsIndex({ orders, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.transactions.index'), { search, status }, { preserveState: true });
    };

    const handleStatusFilter = (newStatus) => {
        setStatus(newStatus);
        router.get(route('admin.transactions.index'), { search, status: newStatus }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Supervision des Ventes & Transactions — Administration BIOLINKO" />

            <div className="space-y-8 font-sans pb-12">
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-slate-950 shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-semibold uppercase tracking-wider">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#FFCC00]" /> SUPERVISION DES TRANSACTIONS
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Commandes &amp; Flux Financiers du Réseau ({metrics?.total_orders || 0})
                        </h2>
                        <p className="text-xs text-slate-900 font-medium">
                            Inspectez les ventes enregistrées sur l'ensemble des boutiques BIOLINKO et suivez les marges SaaS.
                        </p>
                    </div>
                </div>

                {/* 4 METRICS CARDS (EXACT CAPTURE 2 STYLE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* GMV Ventes */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Volume Ventes (GMV Total)</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {Number(metrics?.total_gmv || 0).toLocaleString()} FCFA
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 flex items-center gap-0.5 font-semibold">
                                <ArrowUpRight className="w-3 h-3" /> +58%
                            </span>
                            <span className="text-slate-400">Réseau Global</span>
                        </div>
                    </div>

                    {/* Marge SaaS 2% */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Revenus SaaS (Marge 2%)</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-amber-600">
                            {Number(metrics?.total_saas_revenue || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-amber-700 font-semibold">
                            Commission plateforme
                        </div>
                    </div>

                    {/* Commandes Payées */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Commandes Payées</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-emerald-600">
                            {metrics?.paid_orders || 0} payée(s)
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Total: {metrics?.total_orders || 0} commandes
                        </div>
                    </div>

                    {/* En Attente */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>En Attente de Paiement</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {metrics?.pending_orders || 0} commande(s)
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Fast Checkout MoMo
                        </div>
                    </div>

                </div>

                {/* SEARCH & FILTER BAR */}
                <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="w-full sm:w-96 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par code de suivi, client, réf..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
                        {['all', 'paid', 'pending', 'cancelled'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleStatusFilter(st)}
                                className={`px-3 py-1.5 rounded-xl uppercase transition-all cursor-pointer ${
                                    status === st 
                                        ? 'bg-slate-950 text-white font-extrabold shadow-2xs' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {st === 'all' ? 'Tous les statuts' : st === 'paid' ? 'Payées' : st === 'pending' ? 'En Attente' : 'Annulées'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TRANSACTIONS TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-4 px-6">Code Suivi / Date</th>
                                    <th className="py-4 px-6">Boutique</th>
                                    <th className="py-4 px-6">Acheteur Client</th>
                                    <th className="py-4 px-6">Montant Total TTC</th>
                                    <th className="py-4 px-6">Marge SaaS 2%</th>
                                    <th className="py-4 px-6 text-right">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {orders.data && orders.data.length > 0 ? (
                                    orders.data.map((ord) => (
                                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-extrabold text-slate-950 font-mono">{ord.tracking_code}</div>
                                                <div className="text-[10px] text-slate-400">
                                                    {new Date(ord.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-slate-900">{ord.store?.name || 'N/A'}</div>
                                                <div className="text-amber-700 font-mono text-[11px]">biolinko.app/{ord.store?.slug}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-900">{ord.customer_name}</div>
                                                <div className="text-slate-400 text-[11px]">{ord.customer_phone} ({ord.customer_city || 'Douala'})</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-extrabold text-slate-950 text-sm">
                                                    {Number(ord.total_client || 0).toLocaleString()} FCFA
                                                </div>
                                                <div className="text-[10px] text-slate-400">Part vendeur: {Number(ord.price_vendor || 0).toLocaleString()} FCFA</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                                                    +{Number(ord.saas_margin || 0).toLocaleString()} FCFA
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    ord.status === 'paid' 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : ord.status === 'cancelled'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-amber-100 text-amber-900'
                                                }`}>
                                                    <span>{ord.status === 'paid' ? 'Payée' : ord.status === 'cancelled' ? 'Annulée' : 'En Attente'}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                            Aucune commande ou transaction trouvée.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
