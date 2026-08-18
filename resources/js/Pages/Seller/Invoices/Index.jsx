import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Search, Download, Eye, Share2, Check, Copy, ExternalLink, 
    X, Printer, CreditCard, Calendar, User, Phone, Mail, ShoppingBag, 
    ArrowUpRight, ShieldCheck, Filter, Plus, Send, MessageSquare, AlertCircle,
    CheckCircle2, Clock, Store, Tag, Sparkles, QrCode
} from 'lucide-react';

function getContrastColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) return '#0F172A';
    const hex = hexColor.replace('#', '');
    if (hex.length < 6) return '#0F172A';
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 165 ? '#0F172A' : '#FFFFFF';
}

export default function InvoicesIndex({ store, invoices, stats, filters, appUrl }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    
    // Preview & Share Modals
    const [previewOrder, setPreviewOrder] = useState(null);
    const [shareOrder, setShareOrder] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const { flash } = usePage().props;

    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = getContrastColor(primaryColor);
    const isGrowthOrPro = store?.user?.plan === 'growth' || store?.user?.plan === 'pro' || store?.user?.plan === 'business';

    // Manual Invoice Form
    const manualForm = useForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_whatsapp: '',
        delivery_address: '',
        amount: '',
        description: '',
        notes: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('seller.invoices.index'),
            { search: searchTerm, status: selectedStatus },
            { preserveState: true, replace: true }
        );
    };

    const handleFilterStatus = (status) => {
        setSelectedStatus(status);
        router.get(
            route('seller.invoices.index'),
            { search: searchTerm, status },
            { preserveState: true, replace: true }
        );
    };

    const handleCreateManualInvoice = (e) => {
        e.preventDefault();
        manualForm.post(route('seller.invoices.storeManual'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                manualForm.reset();
            },
        });
    };

    const handleSendEmailReminder = (order) => {
        router.post(route('seller.invoices.sendReminder', order.id), {}, { preserveScroll: true });
    };

    const getWhatsAppRelanceUrl = (order) => {
        const trackUrl = `${appUrl || window.location.origin}/track/${order.tracking_code}`;
        let cleanPhone = (order.customer_phone || '').replace(/[^0-9]/g, '');
        if (!cleanPhone.startsWith('237') && !cleanPhone.startsWith('229')) {
            cleanPhone = '237' + cleanPhone;
        }
        const text = `Bonjour ${order.customer_name},\n\nVoici votre facture de règlement ${order.tracking_code} (${Number(order.total_client || order.price_vendor).toLocaleString()} FCFA) de la boutique ${store?.name || 'Boutique'}.\n\nVous pouvez consulter et régler votre facture en toute sécurité ici : ${trackUrl}\n\nMerci de votre confiance.`;
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    };

    const copyShareLink = (trackingCode) => {
        const link = `${appUrl || window.location.origin}/track/${trackingCode}`;
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    const getInvoiceStamp = (status) => {
        if (status === 'delivered') {
            return (
                <div className="border-4 border-purple-600 text-purple-700 font-black text-xs px-3 py-1 rounded-xl uppercase tracking-widest rotate-[-5deg] inline-block shadow-2xs bg-purple-50">
                    PAYÉE ET LIVRÉE
                </div>
            );
        }
        if (status === 'paid' || status === 'in_delivery') {
            return (
                <div className="border-4 border-emerald-600 text-emerald-700 font-black text-xs px-3 py-1 rounded-xl uppercase tracking-widest rotate-[-5deg] inline-block shadow-2xs bg-emerald-50">
                    REÇU / FACTURE PAYÉE
                </div>
            );
        }
        if (status === 'cancelled' || status === 'failed') {
            return (
                <div className="border-4 border-rose-600 text-rose-700 font-black text-xs px-3 py-1 rounded-xl uppercase tracking-widest rotate-[-5deg] inline-block shadow-2xs bg-rose-50">
                    FACTURE ANNULÉE
                </div>
            );
        }
        return (
            <div className="border-4 border-amber-600 text-amber-800 font-black text-xs px-3 py-1 rounded-xl uppercase tracking-widest rotate-[-5deg] inline-block shadow-2xs bg-amber-50">
                EN ATTENTE DE RÈGLEMENT
            </div>
        );
    };

    const handleUpdateStatus = (orderId, newStatus) => {
        router.patch(route('seller.invoices.updateStatus', orderId), { status: newStatus }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Espace Factures — BIOLINKO" />

            <div className="space-y-6 mx-auto pb-12 font-sans">
                
                {/* Toast Success Notification */}
                <AnimatePresence>
                    {flash?.message && (
                        <motion.div
                            initial={{ opacity: 0, y: -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="p-4 rounded-2xl bg-slate-950 text-white font-medium text-xs shadow-md flex items-center gap-3 border border-slate-800"
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{flash.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Title & Create Manual Invoice Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-2xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                <FileText className="w-5 h-5" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Espace Factures & Encaissements</h1>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Générez des factures manuelles, gérez vos encaissements et suivez le détails de vos règlements en ligne et direct vendeur.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-3 rounded-2xl font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 border cursor-pointer"
                        style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                    >
                        <Plus className="w-4 h-4" />
                        <span>Créer une Facture Manuelle</span>
                    </button>
                </div>

                {/* EXPLICIT PAYOUT POLICY BANNER */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs font-medium flex items-start gap-3 shadow-2xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <span className="font-extrabold text-amber-900 block">💡 Guide d'Encaissement & Portefeuille Retirable :</span>
                        <p className="text-[11px] leading-relaxed text-amber-900/90">
                            Seuls les paiements des clients effectués directement en ligne via l'<strong>API Mobile Money Biolinko</strong> créditent votre solde disponible retirable sur la plateforme. Les factures manuelles créées en magasin ou hors ligne sont destinées à votre gestion comptable et facturation directe client.
                        </p>
                    </div>
                </div>

                {/* 4 STATS SUMMARY CARDS BREAKDOWN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* CARD 1: VENTES EN LIGNE (API MOBILE MONEY) */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <span>Ventes Web (API MoMo)</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {Number(stats?.online_paid_amount || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-xs font-bold text-emerald-700">
                            {stats?.online_paid_count || 0} commandes · Crédité sur portefeuille
                        </div>
                    </div>

                    {/* CARD 2: VENTES MANUELLES (MAGASIN / DIRECT) */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <span>Ventes Manuelles</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                                <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {Number(stats?.manual_paid_amount || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-xs font-bold text-blue-700">
                            {stats?.manual_paid_count || 0} factures · Encaissement direct
                        </div>
                    </div>

                    {/* CARD 3: FACTURES NON PAYEES (EN ATTENTE) */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <span>Factures Non Payées</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <Clock className="w-4 h-4 text-amber-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {Number(stats?.pending_amount || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-xs font-bold text-amber-700">
                            {stats?.pending_count || 0} factures en attente
                        </div>
                    </div>

                    {/* CARD 4: CHIFFRE D'AFFAIRES CUMULE */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <span>C.A. Global Reglé</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                                <CreditCard className="w-4 h-4 text-purple-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {Number(stats?.total_amount || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-xs font-medium text-slate-500">
                            {stats?.total_invoices || 0} factures générées au total
                        </div>
                    </div>

                </div>

                {/* FILTERS & SEARCH TOOLBAR */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={() => handleFilterStatus('all')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                selectedStatus === 'all' ? 'bg-slate-950 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Toutes ({stats?.total_invoices || 0})
                        </button>
                        <button
                            onClick={() => handleFilterStatus('paid')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                selectedStatus === 'paid' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            }`}
                        >
                            Payées ({stats?.paid_count || 0})
                        </button>
                        <button
                            onClick={() => handleFilterStatus('pending')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                selectedStatus === 'pending' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                            }`}
                        >
                            En Attente ({stats?.pending_count || 0})
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="w-full md:w-80 flex items-center gap-2">
                        <div className="relative w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Code BLK-FAC-..., client, phone..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shrink-0 transition-all shadow-2xs cursor-pointer"
                        >
                            Filtrer
                        </button>
                    </form>
                </div>

                {/* INVOICES TABLE LIST */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {invoices?.data && invoices.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">N° Facture & Type</th>
                                        <th className="py-3.5 px-4">Date</th>
                                        <th className="py-3.5 px-4">Client & Contact</th>
                                        <th className="py-3.5 px-4">Article / Prestation</th>
                                        <th className="py-3.5 px-4">Montant Total</th>
                                        <th className="py-3.5 px-4 text-center">Changer Statut</th>
                                        <th className="py-3.5 px-6 text-right">Actions PDF & Relances</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                    {invoices.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                                            
                                            <td className="py-4 px-6 font-mono font-bold text-slate-950 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                                                        <span>{order.tracking_code}</span>
                                                    </div>
                                                    {order.is_manual ? (
                                                        <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                                                            Facture Manuelle (Magasin)
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                                            Commande Web (API MoMo)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                                                {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="font-bold text-slate-950">{order.customer_name}</div>
                                                <div className="text-[11px] text-slate-500 font-mono">{order.customer_phone}</div>
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap text-slate-700 max-w-xs truncate">
                                                {order.items?.[0]?.product_title || 'Prestation / Article'}
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap font-extrabold text-slate-950">
                                                {Number(order.total_client || order.price_vendor).toLocaleString()} FCFA
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap text-center">
                                                <select
                                                    value={order.status === 'in_delivery' || order.status === 'delivered' ? 'paid' : order.status}
                                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold border outline-none bg-white cursor-pointer shadow-2xs"
                                                >
                                                    <option value="pending">⏳ En attente</option>
                                                    <option value="paid">✅ Payée (Acquittée)</option>
                                                    <option value="cancelled">❌ Annulée</option>
                                                </select>
                                            </td>

                                            <td className="py-4 px-6 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setPreviewOrder(order)}
                                                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                                                        title="Aperçu rapide"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-slate-700" />
                                                        <span>Aperçu</span>
                                                    </button>

                                                    <a
                                                        href={route('seller.invoices.download', order.id)}
                                                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-2xs"
                                                        title="Télécharger PDF"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>PDF</span>
                                                    </a>

                                                    <a
                                                        href={getWhatsAppRelanceUrl(order)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-2xs"
                                                        title="Relancer sur WhatsApp"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        <span>WhatsApp</span>
                                                    </a>

                                                    {order.customer_email && (
                                                        <button
                                                            onClick={() => handleSendEmailReminder(order)}
                                                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-all cursor-pointer"
                                                            title="Envoyer par email"
                                                        >
                                                            <Mail className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center space-y-3">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-900">Aucune facture disponible.</h3>
                        </div>
                    )}
                </div>

            </div>

            {/* MODAL: CREATE MANUAL INVOICE */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-2xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                        <Plus className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-slate-950">Créer une Facture Manuelle</h3>
                                </div>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateManualInvoice} className="space-y-4">
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-900 mb-1">Nom du Client *</label>
                                        <input
                                            type="text"
                                            required
                                            value={manualForm.data.customer_name}
                                            onChange={(e) => manualForm.setData('customer_name', e.target.value)}
                                            placeholder="ex: Marie Diallo"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-900 mb-1">Numéro Téléphone / MoMo *</label>
                                        <input
                                            type="text"
                                            required
                                            value={manualForm.data.customer_phone}
                                            onChange={(e) => manualForm.setData('customer_phone', e.target.value)}
                                            placeholder="ex: 699000000"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-900 mb-1">Email Client (Envoi auto facture)</label>
                                        <input
                                            type="email"
                                            value={manualForm.data.customer_email}
                                            onChange={(e) => manualForm.setData('customer_email', e.target.value)}
                                            placeholder="client@gmail.com"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-900 mb-1">WhatsApp Client (Relances)</label>
                                        <input
                                            type="text"
                                            value={manualForm.data.customer_whatsapp}
                                            onChange={(e) => manualForm.setData('customer_whatsapp', e.target.value)}
                                            placeholder="ex: 699000000"
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-900 mb-1">Description / Intitulé de la Prestation *</label>
                                    <input
                                        type="text"
                                        required
                                        value={manualForm.data.description}
                                        onChange={(e) => manualForm.setData('description', e.target.value)}
                                        placeholder="ex: Vente 2x Robes de Soie + Frais de livraison"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-900 mb-1">Montant Total à Payer (FCFA) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="100"
                                        value={manualForm.data.amount}
                                        onChange={(e) => manualForm.setData('amount', e.target.value)}
                                        placeholder="ex: 25000"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-extrabold focus:border-amber-400 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-900 mb-1">Notes / Indications de livraison</label>
                                    <textarea
                                        rows="2"
                                        value={manualForm.data.notes}
                                        onChange={(e) => manualForm.setData('notes', e.target.value)}
                                        placeholder="Lieu de livraison, consignes..."
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none"
                                    ></textarea>
                                </div>

                                <div className="pt-3 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={manualForm.processing}
                                        className="px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md border"
                                        style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                    >
                                        {manualForm.processing ? 'Génération...' : 'Créer & Envoyer Facture'}
                                    </button>
                                </div>

                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: IN-APP HIGH-END INVOICE PREVIEW WITH THEME COLOR & QR CODE */}
            <AnimatePresence>
                {previewOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-10 space-y-8 max-h-[92vh] overflow-y-auto relative font-sans"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold shadow-2xs" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-950">Facture Officielle {previewOrder.tracking_code}</h3>
                                        <p className="text-xs text-slate-500 font-medium">Boutique : {store?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={route('seller.invoices.preview', previewOrder.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center gap-1.5"
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span>PDF</span>
                                    </a>
                                    <button
                                        onClick={() => setPreviewOrder(null)}
                                        className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* INVOICE HEADER BANNER */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-slate-950 overflow-hidden shadow-2xs"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {store.logo_url ? <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" /> : <Store className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-slate-950">{store.name}</h2>
                                            <p className="text-xs text-slate-500 font-mono">biolinko.app/{store.slug}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left sm:text-right space-y-2">
                                    {getInvoiceStamp(previewOrder.status)}
                                    <div className="text-xs text-slate-500 font-mono pt-1">
                                        Facture Réf : <strong className="text-slate-950">{previewOrder.tracking_code}</strong>
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        Date : {new Date(previewOrder.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {/* CLIENT DETAILS */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <div className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Destinataire :</div>
                                    <div className="font-bold text-slate-950 text-sm">{previewOrder.customer_name}</div>
                                    <div className="text-slate-600 font-mono">{previewOrder.customer_phone}</div>
                                    {previewOrder.customer_email && <div className="text-slate-500">{previewOrder.customer_email}</div>}
                                </div>

                                <div>
                                    <div className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Émetteur / Boutique :</div>
                                    <div className="font-bold text-slate-950">{store.name}</div>
                                    <div className="text-slate-600 font-medium">WhatsApp : {store.phone_whatsapp || 'Non renseigné'}</div>
                                </div>
                            </div>

                            {/* ITEMS TABLE */}
                            <div className="space-y-2">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]" style={{ borderTop: `3px solid ${primaryColor}` }}>
                                            <th className="py-2.5 px-3">Article / Prestation</th>
                                            <th className="py-2.5 px-3 text-center">Qte</th>
                                            <th className="py-2.5 px-3 text-right">Prix Unitaire</th>
                                            <th className="py-2.5 px-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                                        {(previewOrder.items || []).map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="py-3 px-3">
                                                    <div className="font-bold text-slate-950">{item.product_title || item.title}</div>
                                                    {item.variant_label && <div className="text-[10px] text-amber-800 font-semibold">{item.variant_label}</div>}
                                                </td>
                                                <td className="py-3 px-3 text-center font-bold">{item.quantity}</td>
                                                <td className="py-3 px-3 text-right font-mono">{Number(item.unit_price_vendor || item.price || 0).toLocaleString()} F</td>
                                                <td className="py-3 px-3 text-right font-extrabold">{Number((item.unit_price_vendor || item.price || 0) * item.quantity).toLocaleString()} FCFA</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* TOTALS BANNER MATCHING STORE THEME COLOR */}
                            <div 
                                className="p-5 rounded-2xl border space-y-2 text-xs font-medium flex items-center justify-between shadow-2xs"
                                style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                            >
                                <div>
                                    <div className="text-[11px] opacity-80 uppercase tracking-wider font-bold">Total Général à Payer :</div>
                                    <div className="text-2xl font-black">{Number(previewOrder.total_client || previewOrder.price_vendor).toLocaleString()} FCFA</div>
                                </div>
                                
                                <div className="text-right">
                                    <QrCode className="w-10 h-10 opacity-90 mx-auto" />
                                    <span className="text-[10px] opacity-80">Validation BIOLINKO Pay</span>
                                </div>
                            </div>

                            {/* FOOTER WHITELABELING CHECK */}
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-4 border-t border-slate-100">
                                <div>Merci de votre confiance en la boutique <strong>{store.name}</strong> !</div>
                                {!isGrowthOrPro && (
                                    <div className="flex items-center gap-1 text-slate-600 font-semibold">
                                        <span>Propulsé par</span>
                                        <span className="font-extrabold text-amber-500">BIOLINKO</span>
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AuthenticatedLayout>
    );
}
