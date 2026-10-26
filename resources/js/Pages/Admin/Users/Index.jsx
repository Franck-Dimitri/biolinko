import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Search, ShieldCheck, Crown, ExternalLink, CheckCircle2, 
    UserCheck, Shield, Ban, Eye, ArrowRight, Wallet, ShoppingBag, Package
} from 'lucide-react';
import { toast } from 'sonner';
import ModerationModal from '@/Components/Admin/ModerationModal';

export default function UsersIndex({ users, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [role, setRole] = useState(filters?.role || 'all');

    // Moderation ban modal state
    const [banModal, setBanModal] = useState({
        isOpen: false,
        user: null,
    });
    const [isBanning, setIsBanning] = useState(false);

    const handleConfirmBan = ({ reason }) => {
        if (!banModal.user) return;
        setIsBanning(true);
        router.post(route('admin.users.toggleBan', banModal.user.id), {
            reason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsBanning(false);
                setBanModal({ isOpen: false, user: null });
                toast.success('Le compte a été banni et le vendeur a été notifié par email et WhatsApp.');
            },
            onError: (errs) => {
                setIsBanning(false);
                toast.error(errs?.user || 'Erreur lors du bannissement.');
            },
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { search, role }, { preserveState: true });
    };

    const handleRoleFilter = (newRole) => {
        setRole(newRole);
        router.get(route('admin.users.index'), { search, role: newRole }, { preserveState: true });
    };

    const formatFCFA = (amount) => {
        return Number(amount || 0).toLocaleString('fr-FR') + ' FCFA';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des Utilisateurs & Vendeurs — Administration BIOLINKO" />
            <div hidden={banModal.isOpen}>

            <div className="space-y-8 pb-12">
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-[#141412] shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141412] text-white text-[11px] font-semibold">
                            <Users className="w-3.5 h-3.5 text-[#FFCC00]" /> SUPERVISION DES UTILISATEURS &amp; VENDEURS
                        </div>
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                            Comptes Marchands &amp; Modération ({metrics?.total || 0})
                        </h2>
                        <p className="text-xs text-[#141412] font-medium">
                            Consultez les détails complets de chaque vendeur : vitrine, produits, chiffre d'affaires, commandes et activité.
                        </p>
                    </div>
                </div>

                {/* 4 METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Total Utilisateurs */}
                    <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
                            <span>Comptes Vendeurs</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-[#141412]">
                            {metrics?.sellers || 0} vendeur(s)
                        </div>
                        <div className="text-[11px] text-[#8B8A83] font-medium">
                            Comptes enregistrés
                        </div>
                    </div>

                    {/* Admins */}
                    <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
                            <span>Super-Admins</span>
                            <div className="w-8 h-8 rounded-xl bg-[#F6F5F1] text-[#141412] flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-[#141412]">
                            {metrics?.admins || 0} admin(s)
                        </div>
                        <div className="text-[11px] text-[#141412] font-semibold">
                            Équipe plateforme
                        </div>
                    </div>

                    {/* Pro Users */}
                    <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
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
                    <div className="p-6 rounded-3xl bg-white border border-black/[0.08] shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-[#5F5E58]">
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
                <div className="p-4 bg-white rounded-3xl border border-black/[0.08] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="w-full sm:w-96 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher par nom, email, WhatsApp..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F6F5F1] border border-black/[0.08] text-xs font-medium focus:border-amber-400 outline-none"
                        />
                        <Search className="w-4 h-4 text-[#8B8A83] absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
                        {['all', 'seller', 'admin'].map((r) => (
                            <button
                                key={r}
                                onClick={() => handleRoleFilter(r)}
                                className={`px-3 py-1.5 rounded-xl uppercase transition-all cursor-pointer ${
                                    role === r 
                                        ? 'bg-[#141412] text-white font-semibold shadow-2xs' 
                                        : 'bg-[#F2F1EC] text-[#5F5E58] hover:bg-[#E9E7E0]'
                                }`}
                            >
                                {r === 'all' ? 'Tous les rôles' : r === 'seller' ? 'Vendeurs' : 'Admins'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* USERS TABLE */}
                <div className="bg-white rounded-3xl border border-black/[0.08] shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-[#F6F5F1] border-b border-black/[0.08] text-[#5F5E58] text-[10px] font-semibold">
                                    <th className="py-4 px-6">Utilisateur / Vendeur</th>
                                    <th className="py-4 px-6">Vitrine &amp; Produits</th>
                                    <th className="py-4 px-6">Rôle &amp; Plan</th>
                                    <th className="py-4 px-6">Portefeuille</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.06] font-medium">
                                {users.data && users.data.length > 0 ? (
                                    users.data.map((u) => (
                                        <tr key={u.id} className="hover:bg-[#F6F5F1]/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <Link 
                                                    href={route('admin.users.show', u.id)}
                                                    className="group block"
                                                >
                                                    <div className="font-semibold text-[#141412] text-sm flex items-center gap-2 group-hover:text-amber-600 transition">
                                                        <span>{u.name}</span>
                                                        {u.is_banned && (
                                                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9px] font-semibold">
                                                                BANNI
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[#5F5E58] text-[11px]">{u.email}</div>
                                                    {u.phone_whatsapp && (
                                                        <div className="text-[10px] text-emerald-700 font-mono font-semibold">
                                                            WA: {u.phone_whatsapp}
                                                        </div>
                                                    )}
                                                </Link>
                                            </td>

                                            <td className="py-4 px-6">
                                                {u.store ? (
                                                    <Link 
                                                        href={route('admin.users.show', u.id)}
                                                        className="block group"
                                                    >
                                                        <div className="font-semibold text-[#141412] group-hover:text-amber-600 transition">
                                                            {u.store.name}
                                                        </div>
                                                        <div className="text-amber-700 font-mono text-[11px]">
                                                            biolinko.link/{u.store.slug}
                                                        </div>
                                                        <div className="text-[10px] text-[#8B8A83] mt-0.5 flex items-center gap-1.5">
                                                            <span>{u.store.products_count || 0} produit(s)</span>
                                                            <span>•</span>
                                                            <span>{u.store.orders_count || 0} commande(s)</span>
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <span className="text-[#8B8A83] italic">Sans vitrine</span>
                                                )}
                                            </td>

                                            <td className="py-4 px-6 space-y-1">
                                                <div>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                                        u.role === 'admin' ? 'bg-[#F6F5F1] text-[#141412]' : 'bg-[#F2F1EC] text-[#3D3C37]'
                                                    }`}>
                                                        {u.role === 'admin' ? <Shield className="w-3 h-3 text-[#141412]" /> : <UserCheck className="w-3 h-3 text-[#5F5E58]" />}
                                                        <span>{u.role || 'seller'}</span>
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold uppercase text-[10px]">
                                                        Plan {u.plan || 'starter'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                {u.store?.wallet ? (
                                                    <div>
                                                        <div className="font-semibold text-[#141412] text-sm">
                                                            {formatFCFA(u.store.wallet.balance_available)}
                                                        </div>
                                                        <div className="text-[10px] text-[#8B8A83]">
                                                            Disponible
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#8B8A83] italic text-[11px]">—</span>
                                                )}
                                            </td>

                                            <td className="py-4 px-6 text-right space-x-2">
                                                <Link
                                                    href={route('admin.users.show', u.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#141412] hover:bg-[#2B2A26] text-white font-semibold text-[11px] shadow-xs transition"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-[#FFCC00]" /> Consulter
                                                </Link>

                                                {u.role !== 'admin' && (
                                                    u.is_banned ? (
                                                        <Link
                                                            href={route('admin.users.toggleBan', u.id)}
                                                            method="post"
                                                            as="button"
                                                            className="px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        >
                                                            Réactiver
                                                        </Link>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setBanModal({ isOpen: true, user: u })}
                                                            className="px-3 py-1.5 rounded-xl font-semibold text-[11px] transition-all cursor-pointer bg-rose-100 hover:bg-rose-200 text-rose-800"
                                                        >
                                                            Bannir
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-[#8B8A83] text-xs">
                                            Aucun utilisateur trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODERATION BAN USER MODAL */}
            </div>

            <ModerationModal
                isOpen={banModal.isOpen}
                onClose={() => setBanModal({ isOpen: false, user: null })}
                onConfirm={handleConfirmBan}
                type="user"
                itemName={banModal.user?.name || ''}
                targetInfo={banModal.user ? `Email : ${banModal.user.email} • Vitrine : ${banModal.user.store?.name || 'Aucune'}` : null}
                isLoading={isBanning}
            />
        </AuthenticatedLayout>
    );
}
