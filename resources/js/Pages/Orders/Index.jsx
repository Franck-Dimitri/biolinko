import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PackageCheck, TrendingUp, Clock, 
    CheckCircle2, AlertCircle, Phone, MapPin, Search, Filter, 
    Download, Eye, X, ArrowRight, Sparkles, Truck, ShieldCheck, 
    Calendar, Check, User, ExternalLink, RefreshCw, MessageSquare, DollarSign,
    FileText, ChevronLeft, ChevronRight, ShoppingBag, Store, Printer, Share2, Award, Zap
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

export default function Index({ store, orders, metrics, filters, appUrl }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusTab, setStatusTab] = useState(filters?.status || 'all');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const { flash } = usePage().props;

    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = getContrastColor(primaryColor);

    const ordersList = orders?.data || (Array.isArray(orders) ? orders : []);
    const paginationLinks = orders?.links || [];

    const handleWhatsAppContact = (order, customText = '') => {
        let cleanPhone = (order.customer_phone || '').replace(/[^0-9]/g, '');
        if (!cleanPhone.startsWith('237') && !cleanPhone.startsWith('229')) {
            cleanPhone = '237' + cleanPhone;
        }
        const message = customText || `Bonjour ${order.customer_name} 👋,\n\nConcernant votre commande *${order.tracking_code}* sur la boutique *${store.name}* :`;
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleFilterChange = (status) => {
        setStatusTab(status);
        router.get(route('orders.index'), { status }, { preserveState: true, replace: true });
    };

    const handleStatusUpdate = (order, newStatus) => {
        setIsUpdatingStatus(true);
        router.patch(route('orders.updateStatus', order.id), { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUpdatingStatus(false);
                if (selectedOrder && selectedOrder.id === order.id) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            },
            onError: () => {
                setIsUpdatingStatus(false);
            }
        });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 font-bold text-[10px] flex items-center gap-1 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Payée — En attente de livraison</span>;
            case 'in_delivery':
                return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-950 font-bold text-[10px] flex items-center gap-1 border border-blue-300"><Truck className="w-3.5 h-3.5 text-blue-600" /> En cours de livraison</span>;
            case 'delivered':
                return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-950 font-bold text-[10px] flex items-center gap-1 border border-purple-300"><Check className="w-3.5 h-3.5 text-purple-600" /> Livrée & Clôturée</span>;
            case 'cancelled':
            case 'failed':
                return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-950 font-bold text-[10px] flex items-center gap-1 border border-rose-300"><X className="w-3.5 h-3.5 text-rose-600" /> Abandonnée / Échouée</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 font-bold text-[10px] flex items-center gap-1 border border-amber-300"><Clock className="w-3.5 h-3.5 text-amber-700" /> En Attente de Règlement</span>;
        }
    };

    const getInvoiceStamp = (status) => {
        if (status === 'delivered') {
            return (
                <div className="border-4 border-purple-600 text-purple-700 font-black text-sm px-4 py-1.5 rounded-2xl uppercase tracking-widest rotate-[-6deg] inline-block shadow-xs bg-purple-50/90">
                    ✓ PAYÉE & LIVRÉE
                </div>
            );
        }
        if (status === 'paid' || status === 'in_delivery') {
            return (
                <div className="border-4 border-emerald-600 text-emerald-700 font-black text-sm px-4 py-1.5 rounded-2xl uppercase tracking-widest rotate-[-6deg] inline-block shadow-xs bg-emerald-50/90">
                    ✓ PAYÉE (REÇU CONFIRMÉ)
                </div>
            );
        }
        if (status === 'cancelled' || status === 'failed') {
            return (
                <div className="border-4 border-rose-600 text-rose-700 font-black text-sm px-4 py-1.5 rounded-2xl uppercase tracking-widest rotate-[-6deg] inline-block shadow-xs bg-rose-50/90">
                    ✕ ANNULÉE / ÉCHOUÉE
                </div>
            );
        }
        return (
            <div className="border-4 border-amber-500 text-amber-800 font-black text-sm px-4 py-1.5 rounded-2xl uppercase tracking-widest rotate-[-6deg] inline-block shadow-xs bg-amber-50/90">
                ⏳ EN ATTENTE DE RÈGLEMENT
            </div>
        );
    };

    const filteredOrders = ordersList.filter(o => {
        const matchesSearch = (
            (o.tracking_code?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.customer_phone?.includes(searchQuery))
        );
        return matchesSearch;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Gestion des Commandes — BIOLINKO" />

            <div className="w-full space-y-8 font-sans">

                {/* Toast Message */}
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

                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                            Commandes
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Gérez vos expéditions, passez les commandes payées à livrées et visualisez les factures intégrées.
                        </p>
                    </div>
                </div>

                {/* METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    
                    {/* CARD 1: COMMANDES A LIVRER */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Commandes à Livrer</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                                <Truck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {metrics?.toDeliverOrdersCount || 0}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Payées & en attente de livraison
                        </div>
                    </div>

                    {/* CARD 2: COMMANDES LIVREES & CLOSES */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Commandes Livrées & Clôturées</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold">
                                <PackageCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {metrics?.deliveredOrdersCount || 0}
                        </div>
                        <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Flux de vente accompli
                        </div>
                    </div>

                    {/* CARD 3: COMMANDES ABANDONNEES */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Commandes Abandonnées</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center font-bold">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {metrics?.abandonedOrdersCount || 0}
                        </div>
                        <div className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Paniers non réglés
                        </div>
                    </div>

                    {/* CARD 4: REVENUE CUMULE */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Ventes Cumulées Nettes</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {Number(metrics?.totalRevenue || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-amber-800 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Encaissements MoMo validés
                        </div>
                    </div>

                </div>

                {/* SEARCH & STATUS FILTER TABS */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 space-y-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                            <button
                                onClick={() => handleFilterChange('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                    statusTab === 'all' ? 'bg-slate-950 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Toutes ({metrics?.totalOrdersCount || 0})
                            </button>
                            <button
                                onClick={() => handleFilterChange('paid')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                    statusTab === 'paid' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                À Livrer ({metrics?.toDeliverOrdersCount || 0})
                            </button>
                            <button
                                onClick={() => handleFilterChange('delivered')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                    statusTab === 'delivered' ? 'bg-purple-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Livrées ({metrics?.deliveredOrdersCount || 0})
                            </button>
                            <button
                                onClick={() => handleFilterChange('pending')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                    statusTab === 'pending' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Abandonnées ({metrics?.abandonedOrdersCount || 0})
                            </button>
                        </div>

                        <div className="w-full sm:w-72 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                placeholder="Rechercher par code BLK-CMD-..., nom..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-amber-400"
                            />
                        </div>
                    </div>

                    {/* ORDERS TABLE */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    <th className="py-3 px-4">Référence Commande</th>
                                    <th className="py-3 px-4">Client & Contact</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Montant Total</th>
                                    <th className="py-3 px-4">Statut</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="py-4 px-4 font-mono font-bold text-slate-950">
                                                {order.tracking_code}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-slate-950">{order.customer_name}</div>
                                                <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                                                    <span>{order.customer_phone}</span>
                                                    <button
                                                        onClick={() => handleWhatsAppContact(order)}
                                                        className="text-emerald-600 hover:text-emerald-700 font-bold ml-1"
                                                        title="Contacter sur WhatsApp"
                                                    >
                                                        <MessageSquare className="w-3.5 h-3.5 inline" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-500">
                                                {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-4 px-4 font-extrabold text-slate-950">
                                                {Number(order.total_client || order.price_client_total || order.price_vendor).toLocaleString()} FCFA
                                            </td>
                                            <td className="py-4 px-4">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white transition-colors font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                                                        <span>Détails</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setSelectedInvoiceOrder(order)}
                                                        className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 transition-colors font-bold text-xs flex items-center gap-1.5 border border-amber-300"
                                                    >
                                                        <FileText className="w-3.5 h-3.5 text-amber-800" />
                                                        <span>Facture</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                                            Aucune commande enregistrée.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION LINKS (10 ITEMS PER PAGE) */}
                    {paginationLinks.length > 3 && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-xs text-slate-500 font-medium">
                                Affichage de 10 commandes par page
                            </div>
                            <div className="flex items-center gap-1">
                                {paginationLinks.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                            link.active 
                                                ? 'bg-slate-950 text-white' 
                                                : link.url ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'text-slate-300 pointer-events-none'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* HIGH-END BIOLINKO BRANDED ORDER DETAILS MODAL */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto relative font-sans"
                        >
                            {/* MODAL HEADER */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#FFCC00] text-slate-950 flex items-center justify-center font-extrabold shadow-2xs">
                                        <PackageCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-extrabold text-slate-950">Détails de la Commande</h3>
                                        <p className="text-xs text-slate-500 font-mono">Code Réf: <strong className="text-slate-950">{selectedOrder.tracking_code}</strong></p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* STATUS BADGE DISPLAY */}
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                <span className="text-xs font-bold text-slate-700">Statut de la commande :</span>
                                {getStatusBadge(selectedOrder.status)}
                            </div>

                            {/* CUSTOMER & DELIVERY INFO CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Acheteur</div>
                                    <div className="font-bold text-slate-950 text-sm">{selectedOrder.customer_name}</div>
                                    <div className="text-xs text-slate-600 font-mono">{selectedOrder.customer_phone}</div>
                                    {selectedOrder.customer_email && <div className="text-xs text-slate-500">{selectedOrder.customer_email}</div>}
                                </div>

                                <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Lieu de Livraison</div>
                                    <div className="font-bold text-slate-950 flex items-center gap-1.5 text-sm">
                                        <MapPin className="w-4 h-4 text-rose-500" />
                                        <span>{selectedOrder.delivery_city || 'Douala'}</span>
                                    </div>
                                    <div className="text-xs text-slate-600 font-medium">{selectedOrder.delivery_address || 'Non renseignée'}</div>
                                </div>
                            </div>

                            {/* ORDER ITEMS TABLE */}
                            <div className="space-y-3">
                                <h4 className="font-extrabold text-xs text-slate-950 uppercase tracking-wider">Articles Commandés</h4>
                                <div className="space-y-2">
                                    {(selectedOrder.items || []).map((item, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                                            <div>
                                                <div className="font-bold text-slate-950 text-sm">{item.product_title || item.title || 'Produit'}</div>
                                                {item.variant_label && <div className="text-[11px] text-amber-800 font-semibold">{item.variant_label}</div>}
                                                <div className="text-slate-500 font-medium pt-0.5">Quantité : <strong className="text-slate-950">{item.quantity}</strong></div>
                                            </div>
                                            <div className="font-extrabold text-slate-950 text-base">
                                                {Number((item.unit_price_vendor || item.price || 0) * item.quantity).toLocaleString()} FCFA
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TOTAL PRICE BREAKDOWN */}
                            <div className="p-5 rounded-2xl bg-slate-950 text-white flex items-center justify-between shadow-md">
                                <div>
                                    <div className="text-xs text-slate-400 font-medium">Revenu Net Vendeur :</div>
                                    <div className="text-lg font-extrabold text-[#FFCC00]">
                                        {Number(selectedOrder.price_vendor || selectedOrder.total_amount).toLocaleString()} FCFA
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 font-medium">Total Payé Client TTC :</div>
                                    <div className="text-lg font-extrabold text-white">
                                        {Number(selectedOrder.total_client || selectedOrder.price_client_total || selectedOrder.price_vendor).toLocaleString()} FCFA
                                    </div>
                                </div>
                            </div>

                            {/* MODAL ACTIONS FOOTER */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                                {(selectedOrder.status === 'paid' || selectedOrder.status === 'in_delivery') && (
                                    <button
                                        disabled={isUpdatingStatus}
                                        onClick={() => handleStatusUpdate(selectedOrder, 'delivered')}
                                        className="w-full sm:w-1/2 py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{isUpdatingStatus ? 'Mise à jour...' : 'Marquer comme Livrée'}</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => handleWhatsAppContact(selectedOrder)}
                                    className="w-full sm:w-1/2 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Contacter sur WhatsApp</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setSelectedInvoiceOrder(selectedOrder);
                                    }}
                                    className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-extrabold text-xs border border-amber-300 flex items-center justify-center gap-1.5"
                                >
                                    <FileText className="w-4 h-4 text-amber-800" />
                                    <span>Voir la Facture</span>
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* IN-APP INVOICE MODAL WITH STAMP */}
            <AnimatePresence>
                {selectedInvoiceOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-10 space-y-8 max-h-[92vh] overflow-y-auto relative font-sans"
                        >
                            {/* CLOSE BUTTON & PRINT */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-2xl bg-[#FFCC00] text-slate-950 flex items-center justify-center font-extrabold shadow-2xs">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="font-extrabold text-slate-950 text-base">Facture / Reçu d'Achat — {store.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a
                                        href={route('seller.invoices.preview', selectedInvoiceOrder.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center gap-1.5"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Imprimer PDF</span>
                                    </a>
                                    <button
                                        onClick={() => setSelectedInvoiceOrder(null)}
                                        className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* INVOICE CONTENT HEADER */}
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
                                    {store.description && <p className="text-xs text-slate-600 font-medium max-w-sm">{store.description}</p>}
                                </div>

                                <div className="text-left sm:text-right space-y-2">
                                    {getInvoiceStamp(selectedInvoiceOrder.status)}
                                    <div className="text-xs text-slate-500 font-mono pt-1">
                                        Réf Commande : <strong className="text-slate-950">{selectedInvoiceOrder.tracking_code}</strong>
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        Date : {new Date(selectedInvoiceOrder.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {/* CLIENT DETAILS */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <div className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Facturé à :</div>
                                    <div className="font-bold text-slate-950 text-sm">{selectedInvoiceOrder.customer_name}</div>
                                    <div className="text-slate-600 font-mono">{selectedInvoiceOrder.customer_phone}</div>
                                    {selectedInvoiceOrder.customer_email && <div className="text-slate-500">{selectedInvoiceOrder.customer_email}</div>}
                                </div>

                                <div>
                                    <div className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider mb-1">Livraison :</div>
                                    <div className="font-bold text-slate-950">{selectedInvoiceOrder.delivery_city || 'Douala'}</div>
                                    <div className="text-slate-600 font-medium">{selectedInvoiceOrder.delivery_address || 'Non spécifiée'}</div>
                                </div>
                            </div>

                            {/* ITEMS TABLE */}
                            <div className="space-y-2">
                                <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                                            <th className="py-2.5 px-3">Article</th>
                                            <th className="py-2.5 px-3 text-center">Qte</th>
                                            <th className="py-2.5 px-3 text-right">Prix Unitaire</th>
                                            <th className="py-2.5 px-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                                        {(selectedInvoiceOrder.items || []).map((item, idx) => (
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

                            {/* INVOICE TOTALS */}
                            <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200/90 space-y-2 text-xs font-medium">
                                <div className="flex justify-between text-slate-600">
                                    <span>Sous-total Net Vendeur :</span>
                                    <span className="font-bold text-slate-950">{Number(selectedInvoiceOrder.price_vendor || selectedInvoiceOrder.total_amount).toLocaleString()} FCFA</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Frais de paiement Mobile Money inclus (2%) :</span>
                                    <span>+{Number(selectedInvoiceOrder.api_fee || 0).toLocaleString()} FCFA</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-950">
                                    <span>Total Général TTC Client :</span>
                                    <span className="text-emerald-700 text-base">{Number(selectedInvoiceOrder.total_client || selectedInvoiceOrder.price_client_total || selectedInvoiceOrder.price_vendor).toLocaleString()} FCFA</span>
                                </div>
                            </div>

                            {/* INVOICE FOOTER BRANDING */}
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-4 border-t border-slate-100">
                                <div>Merci de votre confiance !</div>
                                <div className="flex items-center gap-1 text-slate-600 font-semibold">
                                    <span>Propulsé par</span>
                                    <span className="font-extrabold text-amber-500">BIOLINKO</span>
                                </div>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AuthenticatedLayout>
    );
}
