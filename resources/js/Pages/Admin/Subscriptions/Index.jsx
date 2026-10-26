import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Crown, Search, ShieldCheck, DollarSign, TrendingUp, CheckCircle2, User, ArrowUpRight
} from 'lucide-react';

export default function SubscriptionsIndex({ vendors, metrics, filters }) {
    const planPrices = usePage().props.planPrices || {};
    const formatK = (plan) => `${(Number(planPrices[plan] || 0) / 1000).toLocaleString('fr-FR')}k`;
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

            <div className="space-y-8 pb-12">
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-[#141412] shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141412] text-white text-[11px] font-semibold">
                            <Crown className="w-3.5 h-3.5 text-[#FFCC00]" /> SUPERVISION DES ABONNEMENTS SAAS
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Plans Tarifaires &amp; Revenus Recurrents (MRR Est. {Number(metrics?.estimated_monthly_mrr || 0).toLocaleString()} FCFA)
                        </h2>
                        <p className="text-xs text-[#141412] font-medium">
                            Attribuez manuellement des accès Pro, Growth ou Business et suivez la répartition des abonnés.
                        </p>
                    </div>
                </div>

                {/* 4 ALIGNED METRICS CARDS (EXACT CAPTURE 2 STYLE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
                            <span>MRR Est. Mensuel</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Crown className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-[#141412]">
                            {Number(metrics?.estimated_monthly_mrr || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-[#8B8A83] font-medium">
                            Revenus d'abonnements récurrents
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
                            <span>Vendeurs Enregistrés</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <User className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-[#141412]">
                            {metrics?.total_vendors || 0} vendeur(s)
                        </div>
                        <div className="text-[11px] text-[#8B8A83] font-medium">
                            {metrics?.starter_count || 0} sur plan Starter (0 FCFA)
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
                            <span>Abonnés Pro &amp; Growth</span>
                            <div className="w-8 h-8 rounded-xl bg-[#F6F5F1] text-[#141412] flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-[#141412]">
                            {(metrics?.pro_count || 0) + (metrics?.growth_count || 0)} abonné(s)
                        </div>
                        <div className="text-[11px] text-[#141412] font-semibold">
                            Pro ({formatK('pro')}) &amp; Growth ({formatK('growth')})
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
                            <span>Abonnés Business</span>
                            <div className="w-8 h-8 rounded-xl bg-[#F6F5F1] text-[#141412] flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-[#141412]">
                            {metrics?.business_count || 0} abonné(s)
                        </div>
                        <div className="text-[11px] text-[#141412] font-semibold">
                            Business ({Number(planPrices.business || 0).toLocaleString('fr-FR')} FCFA/mois)
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTER BAR */}
                <div className="p-4 bg-white rounded-3xl border border-black/[0.08] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="w-full sm:w-96 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un vendeur, une boutique..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F6F5F1] border border-black/[0.08] text-xs font-medium focus:border-amber-400 outline-none"
                        />
                        <Search className="w-4 h-4 text-[#8B8A83] absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
                        {['all', 'starter', 'pro', 'growth', 'business'].map((p) => (
                            <button
                                key={p}
                                onClick={() => handlePlanFilter(p)}
                                className={`px-3 py-1.5 rounded-xl uppercase transition-all cursor-pointer ${
                                    plan === p 
                                        ? 'bg-[#141412] text-white font-semibold shadow-2xs' 
                                        : 'bg-[#F2F1EC] text-[#5F5E58] hover:bg-[#E9E7E0]'
                                }`}
                            >
                                {p === 'all' ? 'Tous les plans' : p}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SUBSCRIPTIONS TABLE */}
                <div className="bg-white rounded-3xl border border-black/[0.08] shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-[#F6F5F1] border-b border-black/[0.08] text-[#5F5E58] text-[10px] font-semibold">
                                    <th className="py-4 px-6">Vendeur</th>
                                    <th className="py-4 px-6">Boutique</th>
                                    <th className="py-4 px-6">Plan Actuel</th>
                                    <th className="py-4 px-6 text-right">Changer / Sur-Mesure</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.06] font-medium">
                                {vendors.data && vendors.data.length > 0 ? (
                                    vendors.data.map((v) => (
                                        <tr key={v.id} className="hover:bg-[#F6F5F1]/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-[#141412] text-sm">{v.name}</div>
                                                <div className="text-[#8B8A83] text-[11px]">{v.email}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {v.store ? (
                                                    <div>
                                                        <div className="font-semibold text-[#141412]">{v.store.name}</div>
                                                        <div className="text-amber-700 font-mono text-[11px]">biolinko.link/{v.store.slug}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#8B8A83] italic">Sans boutique</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold uppercase text-[10px]">
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
                                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase transition-all cursor-pointer ${
                                                            (v.plan || 'starter') === p 
                                                                ? 'bg-[#141412] text-white font-semibold' 
                                                                : 'bg-[#F2F1EC] hover:bg-[#E9E7E0] text-[#3D3C37]'
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
                                        <td colSpan={4} className="py-12 text-center text-[#8B8A83] text-xs">
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
