import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, Search, ShoppingBag, MessageSquare, Phone, 
    Mail, MapPin, Calendar, Award, ArrowUpRight, TrendingUp, Sparkles, UserCheck
} from 'lucide-react';

export default function Index({ store, customers, metrics }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCustomers = customers ? customers.filter(c => {
        const query = searchQuery.toLowerCase();
        return (
            c.name?.toLowerCase().includes(query) ||
            c.phone?.includes(query) ||
            c.email?.toLowerCase().includes(query) ||
            c.whatsapp?.includes(query)
        );
    }) : [];

    return (
        <AuthenticatedLayout>
            <Head title="Répertoire Clients — BIOLINKO" />

            <div className="w-full space-y-8 font-sans">
                
                {/* Header Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                            Répertoire & Fidélité Clients
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Tous les acheteurs enregistrés lors de leurs commandes dans votre boutique.
                        </p>
                    </div>
                </div>

                {/* 4 METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Total Clients Enregistrés</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-900 flex items-center justify-center">
                                <Users className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-950">
                            {metrics?.totalCustomers || 0} client(s)
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Base de données active
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Clients Fidèles (≥2 Achats)</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <UserCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-950">
                            {metrics?.repeatCustomersCount || 0} fidèle(s)
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">Taux de récurrence élevé</div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Chiffre Ventes Clients</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-950">
                            {Number(metrics?.totalRevenueFromCustomers || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">Cumul achats boutique</div>
                    </div>

                    <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                            <span>Panier Moyen / Commande</span>
                            <Sparkles className="w-4 h-4 text-[#FFCC00]" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {Number(metrics?.averageOrderValue || 0).toLocaleString()} FCFA
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-1">Valeur moyenne par achat</div>
                        </div>
                    </div>
                </div>

                {/* SEARCH BAR */}
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

                {/* CUSTOMERS DIRECTORY TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                            <Users className="w-5 h-5 text-amber-500" />
                            <span>Répertoire des Clients ({filteredCustomers.length})</span>
                        </h3>
                    </div>

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
                                                    {customer.email && (
                                                        <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                            <Mail className="w-3 h-3 text-slate-400" /> {customer.email}
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
                            <p className="text-xs text-slate-500 font-medium">Les clients ayant passé une commande dans votre boutique s'afficheront ici automatiquement.</p>
                        </div>
                    )}
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
