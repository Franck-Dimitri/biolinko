import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Search, ShieldCheck, Crown, ExternalLink, CheckCircle2, UserCheck, Shield, Ban, UserX
} from 'lucide-react';

export default function UsersIndex({ users, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [role, setRole] = useState(filters?.role || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search, role }, { preserveState: true });
    };

    const handleRoleFilter = (newRole) => {
        setRole(newRole);
        router.get(route('admin.users.index'), { search, role: newRole }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des Utilisateurs — Administration BIOLINKO" />

            <div className="space-y-8 font-sans pb-12">
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-slate-950 shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-semibold uppercase tracking-wider">
                            <Users className="w-3.5 h-3.5 text-[#FFCC00]" /> GESTION DES UTILISATEURS &amp; VENDEURS
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Comptes &amp; Modération des Vendeurs ({metrics?.total || 0})
                        </h2>
                        <p className="text-xs text-slate-900 font-medium">
                            Inspectez les comptes vendeurs enregistrés sur le réseau et bannissez/réactivez les accès si nécessaire.
                        </p>
                    </div>
                </div>

                {/* 4 METRICS CARDS (EXACT STYLE FROM CAPTURE 2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* Total Utilisateurs */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Comptes Vendeurs</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {metrics?.sellers || 0} vendeur(s)
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Comptes enregistrés
                        </div>
                    </div>

                    {/* Admins */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Super-Admins</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-purple-700">
                            {metrics?.admins || 0} admin(s)
                        </div>
                        <div className="text-[11px] text-purple-700 font-semibold">
                            Équipe plateforme
                        </div>
                    </div>

                    {/* Pro Users */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Comptes Payants Pro+</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <Crown className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-emerald-600">
                            {metrics?.pro_users || 0} abonné(s)
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">
                            Pro, Growth &amp; Business
                        </div>
                    </div>

                    {/* Banned Users */}
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Vendeurs Bannis</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                                <Ban className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-rose-600">
                            {metrics?.banned || 0} banni(s)
                        </div>
                        <div className="text-[11px] text-rose-600 font-semibold">
                            Accès restreints
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
                            placeholder="Rechercher par nom, email, WhatsApp..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
                        {['all', 'seller', 'admin'].map((r) => (
                            <button
                                key={r}
                                onClick={() => handleRoleFilter(r)}
                                className={`px-3 py-1.5 rounded-xl uppercase transition-all cursor-pointer ${
                                    role === r 
                                        ? 'bg-slate-950 text-white font-extrabold shadow-2xs' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {r === 'all' ? 'Tous les rôles' : r === 'seller' ? 'Vendeurs' : 'Admins'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* USERS TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-4 px-6">Utilisateur / Vendeur</th>
                                    <th className="py-4 px-6">Boutique</th>
                                    <th className="py-4 px-6">Rôle</th>
                                    <th className="py-4 px-6">Plan Actif</th>
                                    <th className="py-4 px-6 text-right">Actions Bannissement</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {users.data && users.data.length > 0 ? (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-950 text-sm flex items-center gap-2">
                                                    <span>{u.name}</span>
                                                    {u.is_banned && (
                                                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9px] font-extrabold">
                                                            BANNI
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-slate-500 text-[11px]">{u.email}</div>
                                                {u.phone_whatsapp && <div className="text-[10px] text-emerald-700 font-mono">WA: {u.phone_whatsapp}</div>}
                                            </td>
                                            <td className="py-4 px-6">
                                                {u.store ? (
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{u.store.name}</div>
                                                        <div className="text-amber-700 font-mono text-[11px]">biolinko.app/{u.store.slug}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 italic">Sans boutique</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                                    u.role === 'admin' ? 'bg-purple-100 text-purple-900' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                    {u.role === 'admin' ? <Shield className="w-3 h-3 text-purple-600" /> : <UserCheck className="w-3 h-3 text-slate-500" />}
                                                    <span>{u.role || 'seller'}</span>
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold uppercase text-[10px]">
                                                    {u.plan || 'starter'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {u.role === 'admin' ? (
                                                    <span className="text-slate-400 text-[11px] italic">Super-Admin</span>
                                                ) : (
                                                    <Link
                                                        href={route('admin.users.toggleBan', u.id)}
                                                        method="post"
                                                        as="button"
                                                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                                                            u.is_banned 
                                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                                                : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                                                        }`}
                                                    >
                                                        {u.is_banned ? 'Réactiver le vendeur' : 'Bannir le vendeur'}
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                                            Aucun utilisateur trouvé.
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
