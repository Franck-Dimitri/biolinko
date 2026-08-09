import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Store, Search, ExternalLink, ShieldCheck, Filter, Crown, CheckCircle2, AlertCircle, ArrowUpRight, Zap, Check
} from 'lucide-react';

export default function StoresIndex({ stores, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [plan, setPlan] = useState(filters?.plan || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.stores.index'), { search, plan }, { preserveState: true });
    };

    const handlePlanFilter = (newPlan) => {
        setPlan(newPlan);
        router.get(route('admin.stores.index'), { search, plan: newPlan }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des Boutiques — Administration BIOLINKO" />

            <div className="space-y-8 font-sans pb-12">
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-slate-950 shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-semibold uppercase tracking-wider">
                            <Store className="w-3.5 h-3.5 text-[#FFCC00]" /> GESTION DES BOUTIQUES RÉSEAU
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Supervision &amp; Modération des Boutiques ({metrics?.total || 0})
                        </h2>
                        <p className="text-xs text-slate-900 font-medium">
                            Gérez les accès, le statut de publication (brouillon vs public) et attribuez les plans tarifaires.
                        </p>
                    </div>
                </div>

                {/* 4 METRICS CARDS (EXACT STYLE FROM CAPTURE 2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Total Boutiques */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Total Boutiques Créées</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Store className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {metrics?.total || 0} boutique(s)
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Réseau BIOLINKO
                        </div>
                    </div>

                    {/* Publiées */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Boutiques En Ligne</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-emerald-600">
                            {metrics?.published || 0} en ligne
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Vitrines actives
                        </div>
                    </div>

                    {/* Starter */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Plan Starter (Gratuit)</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                                <Zap className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {metrics?.starter || 0} boutique(s)
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Freemium
                        </div>
                    </div>

                    {/* Pro & Growth */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Boutiques Pro / Growth</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Crown className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-amber-600">
                            {(metrics?.pro || 0) + (metrics?.growth || 0) + (metrics?.business || 0)} payante(s)
                        </div>
                        <div className="text-[11px] text-amber-700 font-semibold">
                            Abonnements actifs
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
                            placeholder="Rechercher une boutique, nom, vendeur..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
                        {['all', 'starter', 'pro', 'growth', 'business'].map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePlanFilter(p)}
                                className={`px-3 py-1.5 rounded-xl uppercase transition-all cursor-pointer ${
                                    plan === p 
                                        ? 'bg-slate-950 text-white font-extrabold shadow-2xs' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {p === 'all' ? 'Tous les plans' : p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* STORES TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-4 px-6">Boutique</th>
                                    <th className="py-4 px-6">Vendeur</th>
                                    <th className="py-4 px-6">Plan SaaS</th>
                                    <th className="py-4 px-6">Statut</th>
                                    <th className="py-4 px-6">Produits</th>
                                    <th className="py-4 px-6 text-right">Actions Modération</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {stores.data && stores.data.length > 0 ? (
                                    stores.data.map((st) => (
                                        <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-950 text-sm">{st.name}</div>
                                                <div className="text-amber-700 font-mono text-[11px]">biolinko.app/{st.slug}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-slate-900">{st.user?.name || 'N/A'}</div>
                                                <div className="text-slate-400 text-[11px]">{st.user?.email}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold uppercase text-[10px]">
                                                    {st.plan_type || 'starter'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    st.is_published 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${st.is_published ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                                                    <span>{st.is_published ? 'Publiée' : 'Brouillon'}</span>
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-slate-800">
                                                {st.products_count || 0} produit(s)
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <Link
                                                    href={route('admin.stores.toggleStatus', st.id)}
                                                    method="post"
                                                    as="button"
                                                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
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
                                                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] inline-flex items-center gap-1"
                                                >
                                                    <span>Vitrine</span>
                                                    <ExternalLink className="w-3 h-3 text-amber-400" />
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                            Aucune boutique trouvée pour les critères de recherche.
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
