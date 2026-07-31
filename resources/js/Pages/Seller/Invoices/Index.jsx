import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    FileText, Search, Download, Eye, Share2, Check, Copy, ExternalLink, 
    X, Printer, CreditCard, Calendar, User, Phone, Mail, ShoppingBag, 
    ArrowUpRight, ShieldCheck, Filter
} from 'lucide-react';

export default function InvoicesIndex({ invoices, stats, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'all');
    
    // Preview Modal state
    const [previewOrder, setPreviewOrder] = useState(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [activePreviewTab, setActivePreviewTab] = useState('pdf'); // 'pdf' or 'details'

    // Share Modal state
    const [shareOrder, setShareOrder] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

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

    const openPreview = (order) => {
        setPreviewOrder(order);
        setIsPreviewModalOpen(true);
    };

    const openShare = (order) => {
        setShareOrder(order);
        setIsShareModalOpen(true);
        setCopiedLink(false);
    };

    const copyShareLink = (trackingCode) => {
        const link = route('order.track', trackingCode);
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    const getWhatsAppShareUrl = (order) => {
        const trackUrl = route('order.track', order.tracking_code);
        const text = `Bonjour ${order.customer_name},\nVoici le reçu et le lien de suivi officiel de votre commande #${order.tracking_code} (${order.total_client} FCFA) chez ${order.store?.name || 'BIOLINKO'} :\n${trackUrl}\n\nMerci de votre confiance ! 🇨🇲`;
        const phone = order.customer_phone ? order.customer_phone.replace(/[^0-9]/g, '') : '';
        return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Espace Factures - BIOLINKO" />

            <div className="space-y-6 mx-auto pb-12">
                
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                                <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Espace Factures</h1>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Consultez, prévisualisez, téléchargez et partagez les factures officielles PDF de vos ventes.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Modèle Officiel Biolinko
                        </span>
                    </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Factures</div>
                            <div className="text-2xl font-black text-slate-900">{stats?.total_invoices || 0}</div>
                            <div className="text-[11px] text-slate-400 mt-1">Commandes générées</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Montant Total Encaissé</div>
                            <div className="text-2xl font-black text-slate-900">
                                {new Intl.NumberFormat('fr-FR').format(stats?.total_amount || 0)} <span className="text-xs font-bold text-amber-600">FCFA</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">Factures acquittées</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Factures Payées</div>
                            <div className="text-2xl font-black text-slate-900">{stats?.paid_count || 0}</div>
                            <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% Vérifiées Mobile Money</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <button
                            onClick={() => handleFilterStatus('all')}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                                selectedStatus === 'all'
                                    ? 'bg-slate-900 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Toutes ({stats?.total_invoices || 0})
                        </button>
                        <button
                            onClick={() => handleFilterStatus('paid')}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                                selectedStatus === 'paid'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                        >
                            Payées ({stats?.paid_count || 0})
                        </button>
                        <button
                            onClick={() => handleFilterStatus('pending')}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                                selectedStatus === 'pending'
                                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                            }`}
                        >
                            En attente
                        </button>
                        <button
                            onClick={() => handleFilterStatus('cancelled')}
                            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                                selectedStatus === 'cancelled'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                        >
                            Annulées
                        </button>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="w-full md:w-80 flex items-center gap-2">
                        <div className="relative w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Code N°, client, téléphone..."
                                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-2xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-all shadow-2xs"
                        >
                            Filtrer
                        </button>
                    </form>
                </div>

                {/* Invoices List Table */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {invoices?.data && invoices.data.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">N° Facture</th>
                                        <th className="py-3.5 px-4">Date</th>
                                        <th className="py-3.5 px-4">Client</th>
                                        <th className="py-3.5 px-4">Articles</th>
                                        <th className="py-3.5 px-4">Montant Total</th>
                                        <th className="py-3.5 px-4 text-center">Statut</th>
                                        <th className="py-3.5 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                    {invoices.data.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                                            
                                            {/* N° Facture */}
                                            <td className="py-4 px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                                                    <span>#{order.tracking_code}</span>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                                                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>

                                            {/* Client */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="font-semibold text-slate-900">{order.customer_name}</div>
                                                <div className="text-[11px] text-slate-400 font-mono">{order.customer_phone}</div>
                                            </td>

                                            {/* Articles Count */}
                                            <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                                                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                                                    {order.items?.length || 1} article(s)
                                                </span>
                                            </td>

                                            {/* Montant Total */}
                                            <td className="py-4 px-4 whitespace-nowrap font-black text-slate-900">
                                                {new Intl.NumberFormat('fr-FR').format(order.total_client)} <span className="text-[10px] font-bold text-slate-400">FCFA</span>
                                            </td>

                                            {/* Statut Badge */}
                                            <td className="py-4 px-4 whitespace-nowrap text-center">
                                                {order.status === 'paid' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                        Payée
                                                    </span>
                                                ) : order.status === 'pending' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                        En attente
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                        Annulée
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions Buttons */}
                                            <td className="py-4 px-6 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    
                                                    {/* Aperçu Button */}
                                                    <button
                                                        onClick={() => openPreview(order)}
                                                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
                                                        title="Prévisualiser la facture"
                                                    >
                                                        <Eye className="w-4 h-4 text-slate-700" />
                                                        <span className="hidden lg:inline">Aperçu</span>
                                                    </button>

                                                    {/* Télécharger Button */}
                                                    <a
                                                        href={route('seller.invoices.download', order.id)}
                                                        className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-all flex items-center gap-1.5"
                                                        title="Télécharger la facture PDF"
                                                    >
                                                        <Download className="w-4 h-4 text-amber-700" />
                                                        <span className="hidden lg:inline">Télécharger</span>
                                                    </a>

                                                    {/* Partager Button */}
                                                    <button
                                                        onClick={() => openShare(order)}
                                                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                                                        title="Partager la facture"
                                                    >
                                                        <Share2 className="w-4 h-4 text-amber-400" />
                                                        <span className="hidden lg:inline">Partager</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Aucune facture trouvée</h3>
                            <p className="text-xs text-slate-500 max-w-md mx-auto">
                                Les factures officielles s'afficheront ici automatiquement dès que vos clients effectueront des achats sur votre boutique.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* PREVIEW MODAL */}
            {isPreviewModalOpen && previewOrder && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#FFCC00] text-slate-950">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Aperçu Facture #{previewOrder.tracking_code}</h3>
                                    <p className="text-xs text-slate-500">Client : {previewOrder.customer_name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <a
                                    href={route('seller.invoices.download', previewOrder.id)}
                                    className="px-4 py-2 rounded-xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-2xs"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Télécharger PDF</span>
                                </a>

                                <button
                                    onClick={() => setIsPreviewModalOpen(false)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - PDF Iframe Viewer / Live Preview */}
                        <div className="flex-1 bg-slate-100 p-4 overflow-y-auto">
                            <iframe
                                src={route('seller.invoices.preview', previewOrder.id)}
                                className="w-full h-[65vh] rounded-2xl border border-slate-300 shadow-sm bg-white"
                                title={`Facture #${previewOrder.tracking_code}`}
                            />
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-200/80 bg-white flex items-center justify-between">
                            <div className="text-xs text-slate-500">
                                Total Facturé : <strong className="text-slate-900 font-black">{new Intl.NumberFormat('fr-FR').format(previewOrder.total_client)} FCFA</strong>
                            </div>
                            <button
                                onClick={() => setIsPreviewModalOpen(false)}
                                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SHARE MODAL */}
            {isShareModalOpen && shareOrder && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-6">
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900">
                                    <Share2 className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Partager la Facture</h3>
                                    <p className="text-xs text-slate-500">Commande #{shareOrder.tracking_code}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsShareModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Share Options */}
                        <div className="space-y-3">
                            
                            {/* WhatsApp Direct Share Button */}
                            <a
                                href={getWhatsAppShareUrl(shareOrder)}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-3 shadow-2xs"
                            >
                                <span className="text-base">💬</span>
                                <span>Envoyer au client sur WhatsApp</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </a>

                            {/* Copy Link Input */}
                            <div className="space-y-1.5 pt-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Lien de la Facture & Suivi Client
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={route('order.track', shareOrder.tracking_code)}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 outline-none"
                                    />
                                    <button
                                        onClick={() => copyShareLink(shareOrder.tracking_code)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 shadow-2xs"
                                    >
                                        {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                                        <span>{copiedLink ? 'Copié !' : 'Copier'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={() => setIsShareModalOpen(false)}
                                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
