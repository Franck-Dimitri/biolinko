import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PackageCheck, Wallet, TrendingUp, ArrowUpRight, Clock, 
    CheckCircle2, AlertCircle, Phone, MapPin, Search, Filter, 
    Download, Eye, X, ArrowRight, Sparkles, Truck, ShieldCheck, 
    Calendar, Check, User, ExternalLink, RefreshCw, MessageSquare, DollarSign
} from 'lucide-react';

export default function Index({ store, orders, wallet, withdrawals, metrics, filters }) {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusTab, setStatusTab] = useState(filters?.status || 'all');
    const { flash } = usePage().props;

    // Withdrawal Form
    const withdrawForm = useForm({
        amount: '',
        phone_momo: store.phone_whatsapp || '',
    });

    // Status Update Form
    const statusForm = useForm({
        status: '',
    });

    const handleFilterChange = (status) => {
        setStatusTab(status);
        router.get(route('orders.index'), { status }, { preserveState: true, replace: true });
    };

    const handleStatusUpdate = (order, newStatus) => {
        statusForm.patch(route('orders.updateStatus', order.id), {
            data: { status: newStatus },
            onSuccess: () => {
                if (selectedOrder && selectedOrder.id === order.id) {
                    setSelectedOrder({ ...selectedOrder, status: newStatus });
                }
            },
        });
    };

    const handleWithdrawSubmit = (e) => {
        e.preventDefault();
        withdrawForm.post(route('wallet.withdraw'), {
            onSuccess: () => {
                setIsWithdrawModalOpen(false);
                withdrawForm.reset('amount');
            },
        });
    };

    const filteredOrders = orders ? orders.filter(o => {
        const matchesSearch = (o.tracking_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.customer_phone?.includes(searchQuery));
        return matchesSearch;
    }) : [];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1 border border-emerald-200"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Commande Payée</span>;
            case 'in_delivery':
                return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center gap-1 border border-blue-200"><Truck className="w-3 h-3 text-blue-600" /> En Cours de Livraison</span>;
            case 'delivered':
                return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] flex items-center gap-1 border border-purple-200"><Check className="w-3 h-3 text-purple-600" /> Livrée au Client</span>;
            case 'cancelled':
                return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] flex items-center gap-1 border border-rose-200"><X className="w-3 h-3 text-rose-600" /> Annulée</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1 border border-amber-200"><Clock className="w-3 h-3 text-amber-600" /> En Attente</span>;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Commandes & Portefeuille MoMo — BIOLINKO" />

            <div className="w-full space-y-8 font-sans">

                {/* Toast Success Message */}
                <AnimatePresence>
                    {flash?.message && (
                        <motion.div
                            initial={{ opacity: 0, y: -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="p-4 rounded-2xl bg-emerald-950 text-white font-medium text-xs shadow-md flex items-center gap-3 border border-emerald-800"
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{flash.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Title & Retrait Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                            Gestion des Commandes & Portefeuille
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Suivez l'état de vos ventes, gérez vos expéditions et effectuez vos retraits Mobile Money direct.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="px-5 py-2.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-semibold text-xs shadow-2xs transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Wallet className="w-4 h-4" />
                        <span>Demander un Retrait MoMo</span>
                    </button>
                </div>

                {/* 4 FINANCIAL METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Chiffre d'Affaires Vendeur</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-900 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-950">
                            {Number(metrics?.totalRevenue || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Payé via USSD MoMo
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Solde Disponible au Retrait</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                MoMo
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-950">
                            {Number(wallet?.balance_available || 0).toLocaleString()} FCFA
                        </div>
                        <button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="text-[11px] text-amber-800 hover:underline font-bold"
                        >
                            Retirer vers mon numéro MoMo →
                        </button>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>En Attente de Traitement</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-950">
                            {Number(wallet?.balance_pending || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">Demandes en cours</div>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                            <span>Total Commandes</span>
                            <PackageCheck className="w-4 h-4 text-[#FFCC00]" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {metrics?.totalOrdersCount || 0} commande(s)
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-1">
                                {metrics?.paidOrdersCount || 0} payée(s) · {metrics?.deliveredOrdersCount || 0} livrée(s)
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEARCH & STATUS FILTER TABS */}
                <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-80 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher par code, nom, téléphone..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => handleFilterChange('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                statusTab === 'all' ? 'bg-[#FFCC00] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Toutes
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('paid')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                statusTab === 'paid' ? 'bg-[#FFCC00] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Payées
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('in_delivery')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                statusTab === 'in_delivery' ? 'bg-[#FFCC00] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            En Livraison
                        </button>
                        <button
                            type="button"
                            onClick={() => handleFilterChange('delivered')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                statusTab === 'delivered' ? 'bg-[#FFCC00] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Livrées
                        </button>
                    </div>
                </div>

                {/* ORDERS TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                            <PackageCheck className="w-5 h-5 text-amber-500" />
                            <span>Liste des Commandes ({filteredOrders.length})</span>
                        </h3>
                    </div>

                    {filteredOrders && filteredOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                                        <th className="py-3.5 px-6">Code & Date</th>
                                        <th className="py-3.5 px-6">Client</th>
                                        <th className="py-3.5 px-6">Articles</th>
                                        <th className="py-3.5 px-6">Total Vendeur</th>
                                        <th className="py-3.5 px-6">Statut & Action</th>
                                        <th className="py-3.5 px-6 text-right">Détails</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-950 font-mono text-xs">{order.tracking_code}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 space-y-0.5">
                                                <div className="font-bold text-slate-900">{order.customer_name}</div>
                                                <div className="text-slate-500 text-[11px] flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {order.customer_phone}
                                                </div>
                                            </td>

                                            <td className="py-4 px-6">
                                                {order.items && order.items.length > 0 ? (
                                                    <div className="space-y-1">
                                                        <div className="font-semibold text-slate-900 line-clamp-1">
                                                            {order.items[0].product_title} {order.items.length > 1 ? `(+${order.items.length - 1} autre(s))` : ''}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-medium">
                                                            Qte totale: {order.items.reduce((acc, it) => acc + it.quantity, 0)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">1 article</span>
                                                )}
                                            </td>

                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-950 text-sm">
                                                    {Number(order.price_vendor).toLocaleString()} FCFA
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-medium">
                                                    Client TTC: {Number(order.total_client).toLocaleString()} FCFA
                                                </div>
                                            </td>

                                            <td className="py-4 px-6 space-y-1.5">
                                                <div>{getStatusBadge(order.status)}</div>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order, e.target.value)}
                                                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-[10px] font-semibold text-slate-700 outline-none"
                                                >
                                                    <option value="pending">Marquer: En Attente</option>
                                                    <option value="paid">Marquer: Payée</option>
                                                    <option value="in_delivery">Marquer: En Livraison</option>
                                                    <option value="delivered">Marquer: Livrée</option>
                                                    <option value="cancelled">Marquer: Annulée</option>
                                                </select>
                                            </td>

                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors inline-flex items-center gap-1 font-semibold text-xs"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>Voir</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-500 space-y-2">
                            <PackageCheck className="w-10 h-10 text-slate-300 mx-auto" />
                            <h4 className="font-bold text-slate-900">Aucune commande trouvée</h4>
                            <p className="text-xs text-slate-500 font-medium">Les commandes passées par vos clients sur votre vitrine s'afficheront ici en temps réel.</p>
                        </div>
                    )}
                </div>

                {/* WITHDRAWAL HISTORY SECTION */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-600" />
                            <span>Historique des Retraits Mobile Money</span>
                        </h3>
                    </div>

                    {withdrawals && withdrawals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px]">
                                        <th className="py-3 px-4">Date</th>
                                        <th className="py-3 px-4">Numéro MoMo</th>
                                        <th className="py-3 px-4">Montant Demandé</th>
                                        <th className="py-3 px-4">Opérateur</th>
                                        <th className="py-3 px-4">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                    {withdrawals.map((w) => (
                                        <tr key={w.id}>
                                            <td className="py-3 px-4">
                                                {new Date(w.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-slate-950">{w.phone_number}</td>
                                            <td className="py-3 px-4 font-bold text-slate-950">{Number(w.amount).toLocaleString()} FCFA</td>
                                            <td className="py-3 px-4 text-slate-500">{w.operator || 'Mobile Money'}</td>
                                            <td className="py-3 px-4">
                                                {w.status === 'completed' ? (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Transféré</span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">En Cours MoMo</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-slate-400 text-xs font-medium">
                            Aucun historique de retrait pour le moment.
                        </div>
                    )}
                </div>

                {/* MODAL 1: WITHDRAWAL REQUEST MODAL */}
                <AnimatePresence>
                    {isWithdrawModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6 relative"
                            >
                                <button
                                    onClick={() => setIsWithdrawModalOpen(false)}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="space-y-1">
                                    <div className="w-10 h-10 rounded-2xl bg-[#FFCC00] text-slate-950 flex items-center justify-center mb-2">
                                        <Wallet className="w-5 h-5 text-slate-950" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-950">Demande de Retrait Mobile Money</h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Solde disponible : <strong className="text-slate-900 font-bold">{Number(wallet?.balance_available || 0).toLocaleString()} FCFA</strong>
                                    </p>
                                </div>

                                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Montant à retirer (FCFA) *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1000"
                                            max={wallet?.balance_available || 0}
                                            placeholder="ex: 25000"
                                            value={withdrawForm.data.amount}
                                            onChange={(e) => withdrawForm.setData('amount', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                        {withdrawForm.errors.amount && (
                                            <div className="text-[11px] text-rose-600 font-medium mt-1">{withdrawForm.errors.amount}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro Mobile Money (MTN / Moov / Orange) *</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="ex: 0102030405"
                                            value={withdrawForm.data.phone_momo}
                                            onChange={(e) => withdrawForm.setData('phone_momo', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={withdrawForm.processing}
                                        className="w-full py-3 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all"
                                    >
                                        Confirmer le Retrait MoMo
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* MODAL 2: ORDER DETAILS MODAL */}
                <AnimatePresence>
                    {selectedOrder && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
                            >
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="space-y-1 border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-950">Commande {selectedOrder.tracking_code}</h3>
                                        <div>{getStatusBadge(selectedOrder.status)}</div>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Passée le {new Date(selectedOrder.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                                        <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider">Informations Client & Livraison</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                                            <div><strong>Nom Client :</strong> {selectedOrder.customer_name}</div>
                                            <div><strong>Téléphone :</strong> {selectedOrder.customer_phone}</div>
                                            {selectedOrder.customer_email && (
                                                <div><strong>Email :</strong> {selectedOrder.customer_email}</div>
                                            )}
                                            <div className="sm:col-span-2"><strong>Adresse Livraison :</strong> {selectedOrder.address_details || selectedOrder.city}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-bold text-slate-900 text-xs">Articles Commandés ({selectedOrder.items?.length || 1})</h4>
                                        <div className="space-y-2">
                                            {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                                                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-medium">
                                                    <div>
                                                        <div className="font-bold text-slate-950">{item.product_title}</div>
                                                        {item.variant_label && <div className="text-[10px] text-slate-500">{item.variant_label}</div>}
                                                    </div>
                                                    <div className="text-right">
                                                        <div>x{item.quantity}</div>
                                                        <div className="font-bold text-slate-950">{Number(item.total_price_vendor).toLocaleString()} FCFA</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1.5 text-xs font-medium">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Total Payé par le Client TTC :</span>
                                            <span>{Number(selectedOrder.total_client).toLocaleString()} FCFA</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-emerald-400 text-sm pt-1 border-t border-slate-800">
                                            <span>Votre Part Vendeur Créditée :</span>
                                            <span>+{Number(selectedOrder.price_vendor).toLocaleString()} FCFA</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </AuthenticatedLayout>
    );
}
