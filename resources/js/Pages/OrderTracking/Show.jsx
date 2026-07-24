import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, Package, Truck, Check, MessageSquare, 
    Printer, ArrowLeft, ShieldCheck, MapPin, Clock, FileText, Phone
} from 'lucide-react';

export default function Show({ order, store }) {
    const handlePrint = () => {
        window.print();
    };

    const whatsappMessage = encodeURIComponent(
        `Bonjour ${store.name}, je suis ${order.customer_name}. Je viens d'effectuer le paiement Mobile Money pour ma commande N° ${order.tracking_code} (${Number(order.total_client).toLocaleString()} FCFA). Merci !`
    );

    const whatsappUrl = `https://wa.me/${store.phone_whatsapp?.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

    return (
        <>
            <Head title={`Suivi de Commande ${order.tracking_code} — BIOLINKO`} />

            <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans antialiased py-10 px-4 sm:px-6 lg:px-8 selection:bg-amber-400 selection:text-slate-950">
                <div className="max-w-2xl mx-auto space-y-6">
                    
                    {/* Top Navigation */}
                    <div className="flex items-center justify-between">
                        <a
                            href={`/${store.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Retour à la boutique {store.name}</span>
                        </a>

                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimer le reçu</span>
                        </button>
                    </div>

                    {/* Order Confirmation Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg text-center space-y-6"
                    >
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>

                        <div>
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                                Paiement Mobile Money Validé
                            </span>
                            <h1 className="text-3xl font-black font-serif text-slate-950 tracking-tight mt-3">
                                Commande N° {order.tracking_code}
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                Merci pour votre achat chez <span className="font-bold text-slate-950">{store.name}</span> !
                            </p>
                        </div>

                        {/* Interactive Status Stepper */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left pt-6">
                            <div className="grid grid-cols-4 gap-2 text-center relative">
                                <div className="space-y-1">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs mx-auto">
                                        ✓
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-950">Payée</div>
                                </div>
                                <div className="space-y-1">
                                    <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs mx-auto">
                                        2
                                    </div>
                                    <div className="text-[11px] font-bold text-slate-950">En préparation</div>
                                </div>
                                <div className="space-y-1 opacity-50">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs mx-auto">
                                        3
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500">En livraison</div>
                                </div>
                                <div className="space-y-1 opacity-50">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs mx-auto">
                                        4
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500">Livrée</div>
                                </div>
                            </div>
                        </div>

                        {/* Direct WhatsApp Contact Button */}
                        {store.phone_whatsapp && (
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-5 h-5 fill-white" />
                                <span>Envoyer ma commande au vendeur sur WhatsApp</span>
                            </a>
                        )}

                        {/* Official Receipt Breakdown */}
                        <div className="border-t border-slate-100 pt-6 text-left space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-black font-serif text-slate-950">Reçu Numérique Officiel</h3>
                                <span className="text-xs font-mono text-slate-400">
                                    {order.paid_at ? new Date(order.paid_at).toLocaleString() : 'Instantané'}
                                </span>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs">
                                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                    <span className="text-slate-500 font-semibold">Client :</span>
                                    <span className="font-bold text-slate-950">{order.customer_name} ({order.customer_phone})</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                    <span className="text-slate-500 font-semibold">Livraison à :</span>
                                    <span className="font-bold text-slate-950">{order.city} {order.address_details && `(${order.address_details})`}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                    <span className="text-slate-500 font-semibold">Moyen de Paiement :</span>
                                    <span className="font-bold text-amber-700">Mobile Money (Fast Checkout Push USSD)</span>
                                </div>
                            </div>

                            {/* Itemized list */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Articles commandés</div>
                                {order.items && order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs">
                                        <div>
                                            <div className="font-bold text-slate-950">{item.product_title}</div>
                                            {item.variant_label && (
                                                <div className="text-[11px] text-slate-500">{item.variant_label}</div>
                                            )}
                                            <div className="text-[11px] text-slate-400">Quantité: {item.quantity}</div>
                                        </div>
                                        <div className="font-black text-slate-950">
                                            {Number(order.total_client).toLocaleString()} FCFA
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 rounded-2xl bg-[#FFCC00]/20 border border-amber-300 flex items-center justify-between">
                                <span className="text-xs font-black text-slate-950">Montant Total Payé TTC :</span>
                                <span className="text-xl font-black text-amber-700">{Number(order.total_client).toLocaleString()} FCFA</span>
                            </div>
                        </div>

                    </motion.div>

                </div>
            </div>
        </>
    );
}
