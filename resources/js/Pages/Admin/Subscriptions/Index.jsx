import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Crown, Search, ShieldCheck, DollarSign, TrendingUp, CheckCircle2, User, ArrowUpRight
} from 'lucide-react';

export default function SubscriptionsIndex({ vendors, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [plan, setPlan] = useState(filters?.plan || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.subscriptions.index'), { search, plan }, { preserveState: true });
    };

    const handlePlanFilter = (newPlan) => {
        setPlan(newPlan);
        router.get(route('admin.subscriptions.index'), { search, plan: newPlan }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Abonnements SaaS & Tarifs — Administration BIOLINKO" />

            <div className="space-y-8 font-sans pb-12">
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-slate-950 shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-semibold uppercase tracking-wider">
                            <Crown className="w-3.5 h-3.5 text-[#FFCC00]" /> SUPERVISION DES ABONNEMENTS SAAS
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Plans Tarifaires &amp; Revenus Recurrents (MRR Est. {Number(metrics?.estimated_monthly_mrr || 0).toLocaleString()} FCFA)
                        </h2>
                        <p className="text-xs text-slate-900 font-medium">
                            Attribuez manuellement des accès Pro, Growth ou Business et suivez la répartition des abonnés.
                        </p>
                    </div>
                </div>

                {/* 4 ALIGNED METRICS CARDS (EXACT CAPTURE 2 STYLE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>MRR Est. Mensuel</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Crown className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {Number(metrics?.estimated_monthly_mrr || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Revenus d'abonnements récurrents
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Vendeurs Enregistrés</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {metrics?.total_vendors || 0} vendeur(s)
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            {metrics?.starter_count || 0} sur plan Starter (0 FCFA)
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Abonnés Pro &amp; Growth</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-blue-600">
                            {(metrics?.pro_count || 0) + (metrics?.growth_count || 0)} abonné(s)
                        </div>
                        <div className="text-[11px] text-blue-600 font-semibold">
                            Pro (2.5k) &amp; Growth (7k)
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Abonnés Business</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-purple-700">
                            {metrics?.business_count || 0} abonné(s)
                        </div>
                        <div className="text-[11px] text-purple-700 font-semibold">
                            Business (12 000 FCFA/mo)
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
                            placeholder="Rechercher un vendeur, une boutique..."
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

                {/* SUBSCRIPTIONS TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-4 px-6">Vendeur</th>
                                    <th className="py-4 px-6">Boutique</th>
                                    <th className="py-4 px-6">Plan Actuel</th>
                                    <th className="py-4 px-6 text-right">Changer / Sur-Mesure</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {vendors.data && vendors.data.length > 0 ? (
                                    vendors.data.map((v) => (
                                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-950 text-sm">{v.name}</div>
                                                <div className="text-slate-400 text-[11px]">{v.email}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {v.store ? (
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{v.store.name}</div>
                                                        <div className="text-amber-700 font-mono text-[11px]">biolinko.app/{v.store.slug}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">Sans boutique</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold uppercase text-[10px]">
                                                    {v.plan || 'starter'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-1">
                                                {['starter', 'pro', 'growth', 'business'].map((p) => (
                                                    <Link
                                                        key={p}
                                                        href={route('admin.subscriptions.updatePlan', v.id)}
                                                        method="post"
                                                        data={{ plan: p }}
                                                        as="button"
                                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                                            (v.plan || 'starter') === p 
                                                                ? 'bg-slate-950 text-white font-extrabold' 
                                                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                        }`}
                                                    >
                                                        {p}
                                                    </Link>
                                                ))}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                                            Aucun vendeur trouvé.
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
