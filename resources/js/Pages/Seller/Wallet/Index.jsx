import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
    RefreshCw, CheckCircle2, Clock, Smartphone, AlertCircle, Sparkles, DollarSign
} from 'lucide-react';

export default function Index({ store, wallet, withdrawals, metrics, appUrl }) {
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        amount: 50100,
        payment_operator: 'MTN',
        phone: store?.phone_whatsapp || '',
    });

    const requestedAmount = Number(data.amount) || 0;
    const appFee = Math.round(requestedAmount * 0.01);
    const momoFee = Math.round(requestedAmount * 0.01);
    const totalFee = appFee + momoFee;
    const netPayout = Math.max(0, requestedAmount - totalFee);

    const handleWithdrawSubmit = (e) => {
        e.preventDefault();
        post(route('seller.wallet.withdraw'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowWithdrawModal(false);
                reset();
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Portefeuille & Retraits MoMo - BIOLINKO" />

            <div className="space-y-8 max-w-7xl mx-auto pb-12">
                
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[11px] border border-amber-300">
                                COMPTE VENDEUR VERIFIÉ
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">Portefeuille & Solde MoMo</h1>
                        <p className="text-xs text-slate-500 font-medium">Gérez vos revenus nets, vos soldes et demandez vos retraits Mobile Money en 1 clic.</p>
                    </div>

                    <button
                        onClick={() => setShowWithdrawModal(true)}
                        disabled={metrics.available_balance < 50100}
                        className="px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 border border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Demander un Retrait MoMo</span>
                    </button>
                </div>

                {/* 4 METRIC CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1: Available Balance */}
                    <motion.div 
                        whileHover={{ y: -2 }}
                        className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solde Disponible</span>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                <WalletIcon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-950">
                            {Number(metrics.available_balance).toLocaleString()} <span className="text-sm font-bold text-slate-500">FCFA</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Retirable immédiatement vers MoMo</span>
                        </div>
                    </motion.div>

                    {/* Card 2: Pending Balance */}
                    <motion.div 
                        whileHover={{ y: -2 }}
                        className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solde en Attente</span>
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-950">
                            {Number(metrics.pending_balance).toLocaleString()} <span className="text-sm font-bold text-slate-500">FCFA</span>
                        </div>
                        <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Commandes en cours de livraison</span>
                        </div>
                    </motion.div>

                    {/* Card 3: Lifetime Earnings */}
                    <motion.div 
                        whileHover={{ y: -2 }}
                        className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ventes Nettes Cumulées</span>
                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-950">
                            {Number(metrics.lifetime_earnings).toLocaleString()} <span className="text-sm font-bold text-slate-500">FCFA</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">Revenus nets réels après frais</div>
                    </motion.div>

                    {/* Card 4: Total Withdrawn */}
                    <motion.div 
                        whileHover={{ y: -2 }}
                        className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Solde Total Retiré</span>
                            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-950">
                            {Number(metrics.total_withdrawals || 0).toLocaleString()} <span className="text-sm font-bold text-slate-500">FCFA</span>
                        </div>
                        <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Total déjà versé par MoMo</span>
                        </div>
                    </motion.div>
                </div>

                {/* INFORMATIVE BANNER */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs font-medium flex items-start gap-3 shadow-2xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <span className="font-extrabold text-amber-900 block">Règle de Sécurité des Retraits Portefeuille :</span>
                        <p className="text-[11px] leading-relaxed text-amber-900/90">
                            Votre solde disponible retirable provient exclusivement des encaissements enregistrés en ligne via l'API Mobile Money Biolinko. Les factures enregistrées manuellement pour vos clients directs en magasin n'alimentent pas ce solde retirable.
                        </p>
                    </div>
                </div>

                {/* WITHDRAWAL HISTORY TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-950">Historique des Retraits Mobile Money</h2>
                            <p className="text-xs text-slate-500 font-medium">Suivez toutes vos demandes de virement vers votre compte MoMo</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                            Seuil min: 50 100 FCFA
                        </span>
                    </div>

                    {withdrawals && withdrawals.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                                        <th className="py-3 px-4 rounded-l-xl">Référence / Date</th>
                                        <th className="py-3 px-4">Montant Demandé</th>
                                        <th className="py-3 px-4">Frais (2%)</th>
                                        <th className="py-3 px-4">Montant Net Reçu</th>
                                        <th className="py-3 px-4">Opérateur & Téléphone</th>
                                        <th className="py-3 px-4 rounded-r-xl text-right">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {withdrawals.map((w) => (
                                        <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-4 font-bold text-slate-900">
                                                <div>#{w.id}</div>
                                                <div className="text-[10px] text-slate-400 font-normal">{new Date(w.created_at).toLocaleDateString('fr-FR')}</div>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-slate-950">{Number(w.amount).toLocaleString()} FCFA</td>
                                            <td className="py-3.5 px-4 text-slate-500">{Number(w.fee).toLocaleString()} FCFA</td>
                                            <td className="py-3.5 px-4 font-extrabold text-emerald-600">{Number(w.net_amount).toLocaleString()} FCFA</td>
                                            <td className="py-3.5 px-4">
                                                <span className="font-bold text-slate-900">{w.operator}</span> ({w.phone})
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                                    w.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                                    w.status === 'PENDING' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                                                    'bg-rose-100 text-rose-800 border border-rose-300'
                                                }`}>
                                                    {w.status === 'APPROVED' ? 'Virement Effectué' : w.status === 'PENDING' ? 'En Cours (< 4h)' : 'Rejeté'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 font-medium">
                            Aucune demande de retrait effectuée pour le moment.
                        </div>
                    )}
                </div>

            </div>

            {/* WITHDRAWAL MODAL */}
            <AnimatePresence>
                {showWithdrawModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-950">Demande de Retrait Mobile Money</h3>
                                    <p className="text-xs text-slate-500 font-medium">Transfert vers votre compte MTN / Orange</p>
                                </div>
                                <button onClick={() => setShowWithdrawModal(false)} className="p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100">
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs font-medium">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Montant à retirer (FCFA) *</label>
                                    <input
                                        type="number"
                                        min={50100}
                                        required
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold text-sm focus:bg-white focus:border-amber-400"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">Montant minimum : 50 100 FCFA</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Opérateur MoMo *</label>
                                        <select
                                            value={data.payment_operator}
                                            onChange={(e) => setData('payment_operator', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold"
                                        >
                                            <option value="MTN">MTN MoMo 🟡</option>
                                            <option value="ORANGE">Orange Money 🍊</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Numéro de Téléphone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="ex: 690000000"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold"
                                        />
                                    </div>
                                </div>

                                {/* FEE BREAKDOWN */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Frais BIOLINKO App (1%) :</span>
                                        <span className="font-bold text-slate-900">{appFee.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Frais Retrait MoMo (1%) :</span>
                                        <span className="font-bold text-slate-900">{momoFee.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-950 text-sm">
                                        <span>Montant Net Versé :</span>
                                        <span className="text-emerald-600">{netPayout.toLocaleString()} FCFA</span>
                                    </div>
                                </div>

                                {errors.amount && <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">{errors.amount}</div>}

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all border border-amber-300 disabled:opacity-50"
                                >
                                    <span>{processing ? 'Envoi de la demande...' : `Confirmer le Retrait de ${netPayout.toLocaleString()} FCFA`}</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
