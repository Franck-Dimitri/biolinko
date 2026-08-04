import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Search, ShoppingBag, MessageSquare, Phone, 
    Mail, MapPin, Calendar, Award, ArrowUpRight, TrendingUp, Sparkles, UserCheck,
    Trophy, ShoppingCart, Send, CheckSquare, Square, X, Zap, Check, Share2, Tag
} from 'lucide-react';

export default function Index({ store, customers, top5Customers, abandonedOrders, products, smartLinks, metrics }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'abandoned', 'broadcast'
    
    // Broadcast Modal State
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [broadcastMessage, setBroadcastMessage] = useState('Bonjour ! Nous avons de superbes nouveautés et promotions en boutique.');
    const [selectedProductAttachment, setSelectedProductAttachment] = useState('');
    const [selectedSmartLinkAttachment, setSelectedSmartLinkAttachment] = useState('');
    const [selectedCustomerIds, setSelectedCustomerIds] = useState(customers ? customers.map(c => c.id) : []);

    const filteredCustomers = customers ? customers.filter(c => {
        const query = searchQuery.toLowerCase();
        return (
            c.name?.toLowerCase().includes(query) ||
            c.phone?.includes(query) ||
            c.email?.toLowerCase().includes(query) ||
            c.whatsapp?.includes(query)
        );
    }) : [];

    const handleSelectAllCustomers = () => {
        if (selectedCustomerIds.length === customers.length) {
            setSelectedCustomerIds([]);
        } else {
            setSelectedCustomerIds(customers.map(c => c.id));
        }
    };

    const handleToggleCustomer = (id) => {
        if (selectedCustomerIds.includes(id)) {
            setSelectedCustomerIds(selectedCustomerIds.filter(cId => cId !== id));
        } else {
            setSelectedCustomerIds([...selectedCustomerIds, id]);
        }
    };

    // Generate WhatsApp URL for an abandoned order
    const getAbandonedWhatsAppUrl = (order) => {
        const phoneClean = (order.customer_phone || '').replace(/[^0-9]/g, '');
        const itemsList = (order.items || []).map(i => i.product_name || i.product_title).join(', ');
        const text = `Bonjour ${order.customer_name || 'cher client'},\nNous avons remarqué que votre commande #${order.tracking_code} (${itemsList}) d'un montant de ${Number(order.price_vendor || order.total_client).toLocaleString()} FCFA chez ${store.name} est en attente de paiement.\nBesoin d'aide pour la valider ? Nous sommes à votre disposition !`;
        return `https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`;
    };

    // Build Broadcast Message Content
    const buildBroadcastContent = () => {
        let msg = broadcastMessage.trim();

        if (selectedProductAttachment) {
            const prod = products.find(p => String(p.id) === String(selectedProductAttachment));
            if (prod) {
                const prodUrl = `${window.location.origin}/${store.slug}/p/${prod.id}`;
                msg += `\n\nArticle en vedette : ${prod.title} (${Number(prod.price_vendor).toLocaleString()} FCFA)\nDécouvrez-le ici : ${prodUrl}`;
            }
        }

        if (selectedSmartLinkAttachment) {
            const sl = smartLinks.find(s => String(s.id) === String(selectedSmartLinkAttachment));
            if (sl) {
                const slUrl = `${window.location.origin}/store/${store.slug}/pay/sl/${sl.code}`;
                msg += `\n\nOffre Spéciale SmartLink : ${sl.title} à ${Number(sl.total_amount).toLocaleString()} FCFA !\nCommandez en 1 clic : ${slUrl}`;
            }
        }

        return msg;
    };

    // Dispatch WhatsApp Broadcast to a customer
    const sendWhatsAppBroadcastToCustomer = (customer) => {
        const phoneClean = (customer.whatsapp || customer.phone || '').replace(/[^0-9]/g, '');
        const text = buildBroadcastContent();
        window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Répertoire & Fidélité Clients — BIOLINKO" />

            <div className="w-full space-y-8 font-sans pb-12">
                
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-6 h-6 text-amber-500" />
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                                Répertoire & Fidélité Clients
                            </h1>
                        </div>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">
                            Gérez votre base de clients, relancez les paniers abandonnés et diffusez des offres WhatsApp.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsBroadcastModalOpen(true)}
                        className="px-5 py-3 rounded-2xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs shrink-0 cursor-pointer"
                    >
                        <Send className="w-4 h-4" />
                        <span>Créer une Campagne WhatsApp</span>
                    </button>
                </div>

                {/* 4 METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <span>Total Clients</span>
                            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <Users className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {metrics?.totalCustomers || 0} client(s)
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Base de données active
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <span>Clients Fidèles (≥2)</span>
                            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                                <UserCheck className="w-5 h-5 text-emerald-700" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {metrics?.repeatCustomersCount || 0} fidèle(s)
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">Taux de récurrence élevé</div>
                    </div>

                    {/* 3RD CARD: MONTANT DES VENTES TERMINÉES */}
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <span>Ventes Terminées</span>
                            <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                                <TrendingUp className="w-5 h-5 text-blue-700" />
                            </div>
                        </div>
                        <div className="text-2xl font-extrabold text-slate-950">
                            {Number(metrics?.completedSalesRevenue || 0).toLocaleString()} <span className="text-xs font-bold text-blue-700">FCFA</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">Chiffre d'affaires livré/payé</div>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-950 text-white shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <span>Panier Moyen</span>
                            <Sparkles className="w-4 h-4 text-[#FFCC00]" />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-white">
                                {Number(metrics?.averageOrderValue || 0).toLocaleString()} FCFA
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-1">Valeur moyenne par achat</div>
                        </div>
                    </div>
                </div>

                {/* TOP 5 CLIENTS FIDÈLES SECTION */}
                {top5Customers && top5Customers.length > 0 && (
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                <h3 className="font-extrabold text-sm text-slate-950">Top 5 Clients les Plus Fidèles</h3>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Classement par volume d'achat</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            {top5Customers.map((c, idx) => {
                                const phoneClean = (c.whatsapp || c.phone || '').replace(/[^0-9]/g, '');
                                const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(`Bonjour ${c.name}, merci pour votre grande fidélité chez ${store.name} !`)}`;

                                return (
                                    <div key={c.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 relative flex flex-col justify-between">
                                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                                            #{idx + 1}
                                        </span>

                                        <div className="space-y-1 pr-6">
                                            <div className="font-bold text-xs text-slate-950 truncate">{c.name}</div>
                                            <div className="text-[11px] text-slate-500 font-medium">{c.phone}</div>
                                        </div>

                                        <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-extrabold text-slate-950">{Number(c.pivot?.total_spent || 0).toLocaleString()} F</div>
                                                <div className="text-[10px] text-emerald-700 font-bold">{c.pivot?.total_orders_count || 1} achat(s)</div>
                                            </div>

                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-2xs"
                                                title="Contacter sur WhatsApp"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5 fill-white" />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TABS NAVIGATION */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all cursor-pointer ${
                            activeTab === 'directory' ? 'bg-slate-950 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Tous les Clients ({customers?.length || 0})
                    </button>

                    <button
                        onClick={() => setActiveTab('abandoned')}
                        className={`px-4 py-2 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === 'abandoned' ? 'bg-amber-500 text-slate-950 shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Paniers Abandonnés ({abandonedOrders?.length || 0})</span>
                    </button>
                </div>

                {/* TAB 1: REPERTOIRE CLIENTS */}
                {activeTab === 'directory' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="w-full sm:w-96 relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher un client par nom, téléphone, whatsapp..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                            {filteredCustomers && filteredCustomers.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                                                <th className="py-3.5 px-6">Identité Client</th>
                                                <th className="py-3.5 px-6">Contacts (MoMo / WhatsApp)</th>
                                                <th className="py-3.5 px-6">Nb Achats</th>
                                                <th className="py-3.5 px-6">Total Dépensé</th>
                                                <th className="py-3.5 px-6">Dernier Achat</th>
                                                <th className="py-3.5 px-6 text-right">Relance WhatsApp</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {filteredCustomers.map((customer) => {
                                                const phoneClean = (customer.whatsapp || customer.phone || '').replace(/[^0-9]/g, '');
                                                const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(`Bonjour ${customer.name}, merci pour votre fidélité chez ${store.name} !`)}`;

                                                return (
                                                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="py-4 px-6">
                                                            <div className="font-bold text-slate-950 text-sm flex items-center gap-2">
                                                                <div className="w-7 h-7 rounded-full bg-[#FFCC00] text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                                                                    {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                                                                </div>
                                                                <span>{customer.name}</span>
                                                            </div>
                                                            {customer.city && (
                                                                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                                    <MapPin className="w-3 h-3 text-slate-400" /> {customer.city}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="py-4 px-6 space-y-0.5">
                                                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                                <Phone className="w-3 h-3 text-slate-400" /> {customer.phone}
                                                            </div>
                                                            {customer.whatsapp && (
                                                                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                                                    <MessageSquare className="w-3 h-3 text-emerald-600 fill-emerald-600" /> WhatsApp: {customer.whatsapp}
                                                                </div>
                                                            )}
                                                        </td>

                                                        <td className="py-4 px-6">
                                                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 font-bold text-xs">
                                                                <ShoppingBag className="w-3 h-3 text-amber-600" />
                                                                <span>{customer.pivot?.total_orders_count || 1} commande(s)</span>
                                                            </div>
                                                        </td>

                                                        <td className="py-4 px-6">
                                                            <div className="font-bold text-slate-950 text-sm">
                                                                {Number(customer.pivot?.total_spent || 0).toLocaleString()} FCFA
                                                            </div>
                                                        </td>

                                                        <td className="py-4 px-6 text-slate-500 text-[11px]">
                                                            {customer.pivot?.last_order_at
                                                                ? new Date(customer.pivot.last_order_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                                                                : new Date(customer.updated_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </td>

                                                        <td className="py-4 px-6 text-right">
                                                            <a
                                                                href={waUrl}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-2xs inline-flex items-center gap-1.5 transition-all"
                                                            >
                                                                <MessageSquare className="w-3.5 h-3.5 fill-white" />
                                                                <span>WhatsApp</span>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center text-slate-500 space-y-2">
                                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                                    <h4 className="font-bold text-slate-900">Aucun client trouvé</h4>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 2: PANIERS ABANDONNÉS */}
                {activeTab === 'abandoned' && (
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="w-5 h-5 text-amber-500" />
                                <h3 className="text-base font-extrabold text-slate-950">Commandes & Paniers Non Payés ({abandonedOrders?.length || 0})</h3>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Relancez vos clients en 1 clic</span>
                        </div>

                        {abandonedOrders && abandonedOrders.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {abandonedOrders.map((order) => {
                                    const waUrl = getAbandonedWhatsAppUrl(order);

                                    return (
                                        <div key={order.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-slate-950 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                        #{order.tracking_code}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-900">{order.customer_name}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase">
                                                        En attente
                                                    </span>
                                                </div>

                                                <div className="text-xs text-slate-500 font-medium flex items-center gap-3">
                                                    <span>Téléphone : {order.customer_phone}</span>
                                                    <span>•</span>
                                                    <span>Montant : <strong className="text-slate-950 font-bold">{Number(order.price_vendor || order.total_client).toLocaleString()} FCFA</strong></span>
                                                </div>

                                                {order.items && order.items.length > 0 && (
                                                    <div className="text-[11px] text-slate-400 font-medium pt-1">
                                                        Articles : {order.items.map(i => i.product_name || i.product_title).join(', ')}
                                                    </div>
                                                )}
                                            </div>

                                            <a
                                                href={waUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-4 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-2xs shrink-0"
                                            >
                                                <MessageSquare className="w-4 h-4 fill-white" />
                                                <span>Relancer par WhatsApp</span>
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-400 space-y-2">
                                <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
                                <h4 className="font-bold text-slate-900 text-sm">Aucun panier abandonné pour le moment !</h4>
                            </div>
                        )}
                    </div>
                )}

                {/* BROADCAST PROMOTIONAL CAMPAIGN MODAL */}
                {isBroadcastModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            
                            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-[#FFCC00] text-slate-950 font-bold">
                                        <Send className="w-5 h-5 fill-slate-950" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-extrabold text-slate-950">Campagne de Diffusion WhatsApp</h3>
                                        <p className="text-xs text-slate-500 font-medium">Rédigez un message promo et envoyez-le aux clients sélectionnés</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsBroadcastModalOpen(false)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                
                                {/* Message Body */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-950 uppercase tracking-wider mb-2">
                                        Texte du Message WhatsApp *
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={broadcastMessage}
                                        onChange={(e) => setBroadcastMessage(e.target.value)}
                                        placeholder="Ex: Chers clients, découvrez notre nouvelle promotion spéciale boutique !"
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                {/* Attachments */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                                            <span>Joindre un Produit</span>
                                        </label>
                                        <select
                                            value={selectedProductAttachment}
                                            onChange={(e) => setSelectedProductAttachment(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:border-amber-400 outline-none"
                                        >
                                            <option value="">-- Aucun Produit Joindre --</option>
                                            {products && products.map(p => (
                                                <option key={p.id} value={p.id}>{p.title} ({Number(p.price_vendor).toLocaleString()} F)</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                            <span>Joindre un SmartLink Express</span>
                                        </label>
                                        <select
                                            value={selectedSmartLinkAttachment}
                                            onChange={(e) => setSelectedSmartLinkAttachment(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold focus:border-amber-400 outline-none"
                                        >
                                            <option value="">-- Aucun SmartLink --</option>
                                            {smartLinks && smartLinks.map(s => (
                                                <option key={s.id} value={s.id}>{s.title} ({Number(s.total_amount).toLocaleString()} F)</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Recipient Selection */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                                            Sélectionner les Destinataires ({selectedCustomerIds.length} / {customers?.length || 0})
                                        </label>

                                        <button
                                            type="button"
                                            onClick={handleSelectAllCustomers}
                                            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                                        >
                                            {selectedCustomerIds.length === customers?.length ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                                            <span>{selectedCustomerIds.length === customers?.length ? 'Désélectionner Tout' : 'Tout Sélectionner'}</span>
                                        </button>
                                    </div>

                                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl p-2 bg-white">
                                        {customers && customers.map(c => {
                                            const isSelected = selectedCustomerIds.includes(c.id);

                                            return (
                                                <div 
                                                    key={c.id} 
                                                    onClick={() => handleToggleCustomer(c.id)}
                                                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                                                        isSelected ? 'bg-amber-50/60' : 'hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                                                        />
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-950">{c.name}</div>
                                                            <div className="text-[11px] text-slate-500">{c.phone}</div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); sendWhatsAppBroadcastToCustomer(c); }}
                                                        className="px-3 py-1 rounded-lg bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 hover:bg-emerald-600"
                                                    >
                                                        <MessageSquare className="w-3 h-3 fill-white" />
                                                        <span>Envoyer direct</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                                <span className="text-xs text-slate-500 font-medium">
                                    {selectedCustomerIds.length} client(s) recevront la diffusion
                                </span>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsBroadcastModalOpen(false)}
                                        className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                                    >
                                        Fermer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
