import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Wallet, Search, ShieldCheck, CheckCircle2, XCircle, Clock, AlertCircle, ExternalLink, ArrowUpRight
} from 'lucide-react';

export default function WithdrawalsIndex({ withdrawals, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.withdrawals.index'), { search, status }, { preserveState: true });
    };

    const handleStatusFilter = (newStatus) => {
        setStatus(newStatus);
        router.get(route('admin.withdrawals.index'), { search, status: newStatus }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des Retraits Mobile Money — Administration BIOLINKO" />

            <div className="space-y-8 font-sans pb-12">
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-slate-950 shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-semibold uppercase tracking-wider">
                            <Wallet className="w-3.5 h-3.5 text-[#FFCC00]" /> GESTION DES RETRAITS MOBILE MONEY
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Demandes de Virement Vendeurs ({metrics?.pending || 0} en attente)
                        </h2>
                        <p className="text-xs text-slate-900 font-medium">
                            Approuvez et déclenchez les virements Payout vers les comptes MTN &amp; Orange Money des vendeurs.
                        </p>
                    </div>
                </div>

                {/* 4 METRICS CARDS (EXACT CAPTURE 2 STYLE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Retraits en attente */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Retraits en Attente</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-rose-600">
                            {metrics?.pending || 0} demande(s)
                        </div>
                        <div className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Total: {Number(metrics?.total_amount_pending || 0).toLocaleString()} FCFA
                        </div>
                    </div>

                    {/* Payés */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Retraits Payés (Completed)</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-emerald-600">
                            {Number(metrics?.total_amount_paid || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">
                            {metrics?.completed || 0} virement(s) réussis
                        </div>
                    </div>

                    {/* Total Demandes */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Volume Total Demandes</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {metrics?.total || 0} demande(s)
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Historique plateforme
                        </div>
                    </div>

                    {/* Rejetés */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Demandes Rejetées</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                                <XCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-700">
                            {metrics?.rejected || 0} rejet(s)
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Solde récrédité au vendeur
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
                            placeholder="Rechercher par numéro MoMo, boutique..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
                        {['all', 'pending', 'completed', 'rejected'].map((st) => (
                            <button
                                key={st}
                                onClick={() => handleStatusFilter(st)}
                                className={`px-3 py-1.5 rounded-xl uppercase transition-all cursor-pointer ${
                                    status === st 
                                        ? 'bg-slate-950 text-white font-extrabold shadow-2xs' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {st === 'all' ? 'Tous les statuts' : st === 'pending' ? 'En Attente' : st === 'completed' ? 'Payés' : 'Rejetés'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* WITHDRAWALS TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-4 px-6">Montant Demandé</th>
                                    <th className="py-4 px-6">Boutique / Vendeur</th>
                                    <th className="py-4 px-6">Compte Mobile Money</th>
                                    <th className="py-4 px-6">Statut</th>
                                    <th className="py-4 px-6 text-right">Actions Payout</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {withdrawals.data && withdrawals.data.length > 0 ? (
                                    withdrawals.data.map((w) => (
                                        <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-extrabold text-slate-950 text-sm">
                                                    {Number(w.amount).toLocaleString()} FCFA
                                                </div>
                                                <div className="text-[10px] text-slate-400">Demande #{w.id}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-slate-900">{w.wallet?.store?.name || 'N/A'}</div>
                                                <div className="text-slate-400 text-[11px]">{w.wallet?.store?.user?.email}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-900">{w.phone_number}</div>
                                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase">
                                                    {w.operator || 'ORANGE'} MoMo
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                                    w.status === 'completed' 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : w.status === 'rejected'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-amber-100 text-amber-900'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        w.status === 'completed' ? 'bg-emerald-600' : w.status === 'rejected' ? 'bg-rose-600' : 'bg-amber-600'
                                                    }`} />
                                                    <span>{w.status === 'completed' ? 'Virement Payé' : w.status === 'rejected' ? 'Rejeté & Remboursé' : 'En attente'}</span>
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                {w.status === 'pending' ? (
                                                    <>
                                                        <Link
                                                            href={route('admin.withdrawals.approve', w.id)}
                                                            method="post"
                                                            as="button"
                                                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs transition-all cursor-pointer"
                                                        >
                                                            Approuver Payout
                                                        </Link>
                                                        <Link
                                                            href={route('admin.withdrawals.reject', w.id)}
                                                            method="post"
                                                            as="button"
                                                            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] transition-all cursor-pointer"
                                                        >
                                                            Rejeter
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px] italic">Traité</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                                            Aucune demande de retrait trouvée.
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
