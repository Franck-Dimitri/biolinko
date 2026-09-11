import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, User, Mail, Phone, MessageSquare, ExternalLink, 
    Shield, Ban, CheckCircle2, AlertTriangle, Package, ShoppingBag, 
    DollarSign, Wallet, Calendar, Clock, Eye, Sparkles, Crown, 
    MapPin, Tag, Store as StoreIcon, Globe, RefreshCw, Check, Trash2, ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import ModerationModal from '@/Components/Admin/ModerationModal';

export default function UserShow({ vendor, stats }) {
    const store = vendor.store;
    const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'store_info'
    const [selectedPlan, setSelectedPlan] = useState(vendor.plan || 'starter');
    const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

    // Format money helper
    const formatFCFA = (amount) => {
        return Number(amount || 0).toLocaleString('fr-FR') + ' FCFA';
    };

    // Handle Plan Update
    const handlePlanChange = (newPlan) => {
        setSelectedPlan(newPlan);
        setIsUpdatingPlan(true);
        router.post(route('admin.users.plan', vendor.id), {
            plan: newPlan,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUpdatingPlan(false);
                toast.success(`Plan du vendeur mis à jour vers ${newPlan.toUpperCase()} !`);
            },
            onError: () => {
                setIsUpdatingPlan(false);
                toast.error('Échec de la mise à jour du plan.');
            },
        });
    };

    // Moderation modal state
    const [moderationModal, setModerationModal] = useState({
        isOpen: false,
        type: 'product', // 'product' | 'store' | 'user'
        itemName: '',
        targetInfo: null,
        targetId: null,
    });
    const [isSubmittingModeration, setIsSubmittingModeration] = useState(false);

    const openModerationModal = (type, itemName, targetId, targetInfo = null) => {
        setModerationModal({
            isOpen: true,
            type,
            itemName,
            targetId,
            targetInfo,
        });
    };

    const closeModerationModal = () => {
        setModerationModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleConfirmModeration = ({ reason, action }) => {
        setIsSubmittingModeration(true);

        if (moderationModal.type === 'product') {
            router.delete(route('admin.products.destroy', moderationModal.targetId), {
                data: { reason },
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmittingModeration(false);
                    closeModerationModal();
                    toast.success(`Le produit "${moderationModal.itemName}" a été supprimé et le vendeur a été notifié.`);
                },
                onError: (errs) => {
                    setIsSubmittingModeration(false);
                    toast.error(errs?.reason || 'Erreur lors de la suppression du produit.');
                },
            });
        } else if (moderationModal.type === 'store') {
            router.post(route('admin.stores.moderate', moderationModal.targetId), {
                action: action || 'suspend',
                reason,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmittingModeration(false);
                    closeModerationModal();
                    toast.success(`Action effectuée sur la vitrine "${moderationModal.itemName}". Le vendeur a été notifié.`);
                },
                onError: (errs) => {
                    setIsSubmittingModeration(false);
                    toast.error(errs?.reason || 'Erreur lors de la modération de la vitrine.');
                },
            });
        } else if (moderationModal.type === 'user') {
            router.post(route('admin.users.toggleBan', moderationModal.targetId), {
                reason,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmittingModeration(false);
                    closeModerationModal();
                    toast.success(`Le compte de ${moderationModal.itemName} a été banni et notifié par email et WhatsApp.`);
                },
                onError: (errs) => {
                    setIsSubmittingModeration(false);
                    toast.error(errs?.user || 'Erreur lors du bannissement.');
                },
            });
        }
    };

    // Clean WhatsApp phone link
    const cleanPhone = vendor.phone_whatsapp ? vendor.phone_whatsapp.replace(/[^0-9]/g, '') : null;
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('237') ? cleanPhone : '237' + cleanPhone}` : null;

    return (
        <AuthenticatedLayout>
            <Head title={`Fiche Vendeur : ${vendor.name} — Administration BIOLINKO`} />

            <div className="space-y-8 font-sans pb-16 max-w-7xl mx-auto">
                {/* BACK LINK & TITLE */}
                <div className="flex items-center justify-between gap-4">
                    <Link
                        href={route('admin.users.index')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" /> Retour à la liste des vendeurs &amp; utilisateurs
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            vendor.is_banned ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                            {vendor.is_banned ? 'Compte Banni' : 'Compte Actif'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider">
                            Rôle : {vendor.role || 'seller'}
                        </span>
                    </div>
                </div>

                {/* VENDOR PROFILE HEADER CARD */}
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                        {/* Identity Info */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 font-extrabold text-2xl flex items-center justify-center shadow-xs">
                                {vendor.name ? vendor.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2.5">
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950">
                                        {vendor.name}
                                    </h1>
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                                        Plan {vendor.plan || 'starter'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" /> {vendor.email}
                                    </span>
                                    {vendor.phone_whatsapp && (
                                        <span className="flex items-center gap-1 text-emerald-700 font-mono font-bold">
                                            <Phone className="w-3.5 h-3.5 text-emerald-600" /> {vendor.phone_whatsapp}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" /> Inscrit le {new Date(vendor.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                            {waLink && (
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xs transition"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" /> Écrire sur WhatsApp
                                </a>
                            )}

                            {store && (
                                <>
                                    <a
                                        href={`/${store.slug}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" /> Voir sa vitrine
                                    </a>

                                    {store.is_published ? (
                                        <button
                                            type="button"
                                            onClick={() => openModerationModal('store', store.name, store.id, `Vitrine: biolinko.app/${store.slug}`)}
                                            className="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900"
                                        >
                                            <ShieldAlert className="w-3.5 h-3.5" /> Modérer / Masquer vitrine
                                        </button>
                                    ) : (
                                        <Link
                                            href={route('admin.users.toggleStore', vendor.id)}
                                            method="post"
                                            as="button"
                                            className="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Publier la vitrine
                                        </Link>
                                    )}
                                </>
                            )}

                            {vendor.is_banned ? (
                                <Link
                                    href={route('admin.users.toggleBan', vendor.id)}
                                    method="post"
                                    as="button"
                                    className="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Réactiver le compte
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => openModerationModal('user', vendor.name, vendor.id, `Email: ${vendor.email}`)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800"
                                >
                                    <Ban className="w-3.5 h-3.5" /> Bannir le compte
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Change Plan Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-500" />
                            <span className="font-bold text-slate-950">Changer le Plan SaaS du Vendeur :</span>
                            <span className="text-slate-500 font-medium">Attribuez un plan supérieur instantanément</span>
                        </div>

                        <div className="flex items-center gap-2">
                            {['starter', 'pro', 'growth', 'business'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePlanChange(p)}
                                    disabled={isUpdatingPlan || vendor.plan === p}
                                    className={`px-3 py-1.5 rounded-xl uppercase font-extrabold text-[10px] transition-all cursor-pointer ${
                                        vendor.plan === p
                                            ? 'bg-slate-950 text-white shadow-xs'
                                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4 FINANCIAL & BUSINESS METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* CA Total Encaissé */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Chiffre d'Affaires (CA)</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                                <DollarSign className="w-4 h-4 text-amber-700" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                            {formatFCFA(stats?.total_revenue)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Gains nets : <strong className="text-slate-700">{formatFCFA(stats?.vendor_earnings)}</strong>
                        </div>
                    </div>

                    {/* Solde Portefeuille Disponible */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Portefeuille Vendeur</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                            {formatFCFA(stats?.wallet_available)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            En attente : <strong className="text-slate-700">{formatFCFA(stats?.wallet_pending)}</strong>
                        </div>
                    </div>

                    {/* Total Commandes */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Commandes Boutique</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                            {stats?.total_orders || 0} commande(s)
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">
                            {stats?.orders_breakdown?.paid || 0} payée(s) • {stats?.orders_breakdown?.delivered || 0} livrée(s)
                        </div>
                    </div>

                    {/* Produits au Catalogue */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Catalogue Produits</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                                <Package className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-purple-700">
                            {stats?.products_count || 0} produit(s)
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            {stats?.active_products_count || 0} actif(s) en boutique
                        </div>
                    </div>
                </div>

                {/* TABS NAVIGATION */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex border-b border-slate-200 text-xs font-bold px-6 pt-4">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`pb-4 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                                activeTab === 'products'
                                    ? 'border-slate-950 text-slate-950'
                                    : 'border-transparent text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <Package className="w-4 h-4" /> Catalogue Produits ({stats?.products_count || 0})
                        </button>

                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`pb-4 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                                activeTab === 'orders'
                                    ? 'border-slate-950 text-slate-950'
                                    : 'border-transparent text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <ShoppingBag className="w-4 h-4" /> Activité &amp; Commandes Récentes ({stats?.total_orders || 0})
                        </button>

                        <button
                            onClick={() => setActiveTab('store_info')}
                            className={`pb-4 px-4 flex items-center gap-2 border-b-2 transition cursor-pointer ${
                                activeTab === 'store_info'
                                    ? 'border-slate-950 text-slate-950'
                                    : 'border-transparent text-slate-400 hover:text-slate-700'
                            }`}
                        >
                            <StoreIcon className="w-4 h-4" /> Paramètres Vitrine &amp; Marque
                        </button>
                    </div>

                    <div className="p-6">
                        {/* TAB 1: PRODUCTS CATALOG */}
                        {activeTab === 'products' && (
                            <div>
                                {store?.products && store.products.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                                    <th className="py-3 px-4">Produit</th>
                                                    <th className="py-3 px-4">Prix Vendeur</th>
                                                    <th className="py-3 px-4">Promotion</th>
                                                    <th className="py-3 px-4">Stock</th>
                                                    <th className="py-3 px-4">Variantes</th>
                                                    <th className="py-3 px-4">Statut</th>
                                                    <th className="py-3 px-4 text-right">Actions Modération</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                                {store.products.map((prod) => (
                                                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                                                    {prod.image_url ? (
                                                                        <img src={prod.image_url} alt={prod.title} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <Package className="w-5 h-5 text-slate-400" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-slate-950 text-sm">{prod.title}</div>
                                                                    <div className="text-slate-400 text-[10px] font-mono">/{prod.slug}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 font-bold text-slate-900">
                                                            {formatFCFA(prod.price_vendor)}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {prod.is_promo && prod.promo_price ? (
                                                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                                                                    {formatFCFA(prod.promo_price)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 italic text-[11px]">—</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold text-slate-800">
                                                            {prod.stock} unité(s)
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-500">
                                                            {prod.variants?.length > 0 ? (
                                                                <span className="text-slate-800 font-semibold">{prod.variants.length} option(s)</span>
                                                            ) : (
                                                                <span className="text-slate-400 italic">Unique</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                                                prod.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                                                            }`}>
                                                                {prod.is_active ? 'Actif' : 'Inactif'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                                                            <Link
                                                                href={route('admin.products.toggleActive', prod.id)}
                                                                method="post"
                                                                as="button"
                                                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                                                                    prod.is_active 
                                                                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900' 
                                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                                }`}
                                                            >
                                                                {prod.is_active ? 'Désactiver' : 'Activer'}
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => openModerationModal('product', prod.title, prod.id, `Réf: /${prod.slug} • Prix: ${formatFCFA(prod.price_vendor)}`)}
                                                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] transition cursor-pointer inline-flex items-center gap-1 border border-rose-200"
                                                            >
                                                                <Trash2 className="w-3 h-3 text-rose-600" /> Supprimer
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                                        <Package className="w-10 h-10 text-slate-300 mx-auto" />
                                        <div className="font-bold text-slate-700">Aucun produit au catalogue</div>
                                        <p className="text-[11px]">Ce vendeur n'a pas encore ajouté d'articles dans sa boutique.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: RECENT ORDERS */}
                        {activeTab === 'orders' && (
                            <div>
                                {store?.orders && store.orders.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                                    <th className="py-3 px-4">Réf. Commande</th>
                                                    <th className="py-3 px-4">Client</th>
                                                    <th className="py-3 px-4">Destination</th>
                                                    <th className="py-3 px-4">Montant Total</th>
                                                    <th className="py-3 px-4">Paiement</th>
                                                    <th className="py-3 px-4">Statut Livraison</th>
                                                    <th className="py-3 px-4">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                                {store.orders.map((ord) => (
                                                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                                            <a
                                                                href={route('order.track', ord.tracking_code)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-amber-700 hover:underline flex items-center gap-1"
                                                            >
                                                                #{ord.tracking_code}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="font-bold text-slate-950">{ord.customer_name}</div>
                                                            <div className="text-slate-400 text-[10px] font-mono">{ord.customer_phone}</div>
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-600">
                                                            {ord.city || 'N/A'} {ord.address_details ? `(${ord.address_details})` : ''}
                                                        </td>
                                                        <td className="py-3 px-4 font-extrabold text-slate-950">
                                                            {formatFCFA(ord.total_client)}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                                                ord.payment_status === 'paid'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {ord.payment_status === 'paid' ? 'Payé' : 'En attente'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                                ord.status === 'delivered'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : ord.status === 'in_delivery'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-slate-100 text-slate-700'
                                                            }`}>
                                                                {ord.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                                                            {new Date(ord.created_at).toLocaleDateString('fr-FR')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                                        <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                                        <div className="font-bold text-slate-700">Aucune commande enregistrée</div>
                                        <p className="text-[11px]">Cette boutique n'a pas encore enregistré de ventes.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: STORE INFO & BRANDING */}
                        {activeTab === 'store_info' && (
                            <div>
                                {store ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                                        <div className="space-y-4">
                                            <h4 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-2">
                                                Identité &amp; Configuration Vitrine
                                            </h4>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-slate-400 font-medium">Nom de la vitrine</label>
                                                    <div className="font-bold text-slate-950 text-sm">{store.name}</div>
                                                </div>

                                                <div>
                                                    <label className="text-slate-400 font-medium">Lien public officiel</label>
                                                    <div className="font-mono text-amber-700 font-bold">
                                                        biolinko.app/{store.slug}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-slate-400 font-medium">Statut de visibilité</label>
                                                    <div>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                                            store.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {store.is_published ? 'En ligne (Publique)' : 'Brouillon (Masquée)'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-slate-400 font-medium">Catégorie</label>
                                                    <div className="font-semibold text-slate-900">{store.category || 'Général'}</div>
                                                </div>

                                                <div>
                                                    <label className="text-slate-400 font-medium">Bandeau d'annonce supérieur</label>
                                                    <div className="font-medium text-slate-800">{store.announcement_header || 'Non configuré'}</div>
                                                </div>

                                                <div>
                                                    <label className="text-slate-400 font-medium">Horaires d'ouverture</label>
                                                    <div className="font-medium text-slate-800">{store.opening_hours || 'Non renseigné'}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="font-extrabold text-slate-950 text-sm border-b border-slate-100 pb-2">
                                                Visuels &amp; Description
                                            </h4>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-slate-400 font-medium">Logo de la boutique</label>
                                                    <div className="mt-1 w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                                                        {store.logo_url ? (
                                                            <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <StoreIcon className="w-8 h-8 text-slate-300" />
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-slate-400 font-medium">Description</label>
                                                    <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                                                        {store.description || 'Aucune description rédigée.'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="text-slate-400 font-medium">Couleur Thème Principale</label>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="w-5 h-5 rounded-full border border-slate-300" style={{ backgroundColor: store.theme_color || '#FFCC00' }} />
                                                        <span className="font-mono text-[11px] text-slate-600">{store.theme_color || '#FFCC00'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-400 text-xs">
                                        Aucune boutique associée à ce compte vendeur.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* REUSABLE MODERATION MODAL */}
            <ModerationModal
                isOpen={moderationModal.isOpen}
                onClose={closeModerationModal}
                onConfirm={handleConfirmModeration}
                type={moderationModal.type}
                itemName={moderationModal.itemName}
                targetInfo={moderationModal.targetInfo}
                isLoading={isSubmittingModeration}
            />
        </AuthenticatedLayout>
    );
}
