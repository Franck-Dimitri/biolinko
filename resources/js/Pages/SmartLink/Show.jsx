import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Zap, ShoppingBag, ShieldCheck, CheckCircle2, AlertCircle, 
    Smartphone, Truck, ArrowRight, Loader2, Lock, Tag, Store
} from 'lucide-react';

export default function SmartLinkShow({ smartLink, store, isValid }) {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_city: 'Douala',
        customer_address: '',
        operator: 'MTN',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const response = await fetch(route('smartlink.checkout', smartLink.code), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok && result.status === 'SUCCESS') {
                setPaymentSuccess(result);
                // Automatically redirect to live tracking page after 3 seconds
                setTimeout(() => {
                    window.location.href = result.redirect_url;
                }, 3500);
            } else {
                setErrorMessage(result.message || 'Échec du paiement. Veuillez réessayer.');
            }
        } catch (err) {
            setErrorMessage('Erreur réseau. Veuillez vérifier votre connexion et réessayez.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isValid) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
                <Head title="Offre Expirée - BIOLINKO" />
                <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 text-center space-y-4 border border-slate-700 shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-black">Offre Expirée ou Indisponible</h1>
                    <p className="text-xs text-slate-400">
                        Désolé, ce lien de commande rapide n'est plus actif ou a atteint sa limite d'utilisation.
                    </p>
                    <a
                        href={`/${store?.slug || ''}`}
                        className="inline-block px-6 py-3 rounded-2xl bg-[#FFCC00] text-slate-950 font-black text-xs transition-all"
                    >
                        Visiter la boutique {store?.name || ''}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-100 font-sans antialiased flex flex-col justify-between selection:bg-[#FFCC00] selection:text-slate-950">
            <Head title={`${smartLink.title} - ${store?.name || 'BIOLINKO'}`} />

            {/* HEADER BAR */}
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 py-3.5 px-4 sm:px-8">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-[#FFCC00] text-slate-950 font-black flex items-center justify-center overflow-hidden">
                            {store?.logo_url ? <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-slate-950" />}
                        </div>
                        <div>
                            <div className="text-xs font-black text-white tracking-tight">{store?.name || 'BIOLINKO Store'}</div>
                            <div className="text-[10px] text-amber-400 font-mono">Boutique Vérifiée 🇨🇲</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Commande Express 1-Clic
                        </span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 my-4">
                
                {/* LEFT COL: OFFER DETAILS & PRODUCTS INCLUDED */}
                <div className="md:col-span-6 space-y-6">
                    
                    {/* Offer Title Banner */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/40 p-6 rounded-3xl border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-4">
                        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                            <Zap className="w-4 h-4 fill-amber-400" />
                            <span>Offre Spéciale Vendeur</span>
                        </div>

                        <h1 className="text-2xl font-black text-white tracking-tight leading-snug">
                            {smartLink.title}
                        </h1>

                        {/* Price Breakdown Card */}
                        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                            <div>
                                <div className="text-[11px] text-slate-400 uppercase font-bold">Prix Total Promo</div>
                                <div className="text-2xl font-black text-[#FFCC00] tracking-tight">
                                    {new Intl.NumberFormat('fr-FR').format(smartLink.total_amount)} <span className="text-xs font-bold text-slate-300">FCFA</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-xs text-slate-400 line-through">
                                    {new Intl.NumberFormat('fr-FR').format(smartLink.subtotal_amount)} FCFA
                                </div>
                                <span className="inline-block px-2.5 py-1 rounded-full bg-rose-500 text-white font-black text-[11px] mt-0.5">
                                    {smartLink.discount_type === 'percent' ? `-${smartLink.discount_value}%` : `-${new Intl.NumberFormat('fr-FR').format(smartLink.discount_value)} FCFA`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Products Included Breakdown */}
                    <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 space-y-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-amber-400" />
                            <span>Articles Inclus dans le Pack ({smartLink.items?.length || 0})</span>
                        </div>

                        <div className="divide-y divide-slate-800">
                            {smartLink.items && smartLink.items.map((item, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0 overflow-hidden">
                                            {item.image_url ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" /> : <ShoppingBag className="w-5 h-5 text-amber-400" />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-100">{item.product_name}</div>
                                            <div className="text-[11px] text-slate-400">{new Intl.NumberFormat('fr-FR').format(item.unit_price)} FCFA</div>
                                        </div>
                                    </div>

                                    <div className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg">
                                        x{item.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Guarantee Badges */}
                    <div className="grid grid-cols-2 gap-3 text-slate-400 text-[11px] font-semibold">
                        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Paiement MoMo Sécurisé</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Livraison Rapide 🇨🇲</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: FAST CHECKOUT FORM */}
                <div className="md:col-span-6">
                    <div className="bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
                        
                        <div className="border-b border-slate-800 pb-4">
                            <h2 className="text-lg font-black text-white flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-amber-400" />
                                <span>Paiement Mobile Money</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Renseignez votre numéro Mobile Money pour recevoir le prompt USSD de confirmation.
                            </p>
                        </div>

                        {errorMessage && (
                            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                            
                            {/* Nom complet */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                    Nom & Prénom *
                                </label>
                                <input
                                    type="text"
                                    name="customer_name"
                                    required
                                    value={formData.customer_name}
                                    onChange={handleInputChange}
                                    placeholder="ex: Jean Emmanuel"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:border-amber-400 outline-none transition-all"
                                />
                            </div>

                            {/* Numéro Mobile Money & Opérateur */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Opérateur *
                                    </label>
                                    <select
                                        name="operator"
                                        value={formData.operator}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-amber-400 focus:border-amber-400 outline-none"
                                    >
                                        <option value="MTN">MTN MoMo</option>
                                        <option value="ORANGE">Orange Money</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Téléphone MoMo *
                                    </label>
                                    <input
                                        type="tel"
                                        name="customer_phone"
                                        required
                                        value={formData.customer_phone}
                                        onChange={handleInputChange}
                                        placeholder="ex: 690123456"
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-white focus:border-amber-400 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Ville & Adresse de Livraison */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Ville *
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_city"
                                        required
                                        value={formData.customer_city}
                                        onChange={handleInputChange}
                                        placeholder="ex: Douala"
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:border-amber-400 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                        Quartier / Adresse *
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_address"
                                        required
                                        value={formData.customer_address}
                                        onChange={handleInputChange}
                                        placeholder="ex: Akwa, face boulangerie"
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:border-amber-400 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* E-mail (Optionnel) */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                                    E-mail (pour recevoir la facture PDF)
                                </label>
                                <input
                                    type="email"
                                    name="customer_email"
                                    value={formData.customer_email}
                                    onChange={handleInputChange}
                                    placeholder="ex: client@gmail.com"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:border-amber-400 outline-none transition-all"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-2xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-amber-500/20 disabled:opacity-50 mt-4 cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Envoi de la demande USSD...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Payer {new Intl.NumberFormat('fr-FR').format(smartLink.total_amount)} FCFA par {formData.operator}</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Paiement direct sécurisé via HR-Skills Pay API</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* PAYMENT SUCCESS USSD PROMPT MODAL */}
            {paymentSuccess && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fade-in">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white">Demande USSD Envoyée !</h3>
                            <p className="text-xs text-slate-300">
                                Veuillez composer votre code secret Mobile Money sur votre téléphone pour valider le paiement de <strong className="text-[#FFCC00] font-black">{new Intl.NumberFormat('fr-FR').format(smartLink.total_amount)} FCFA</strong>.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400 space-y-1">
                            <div>Code Commande : #{paymentSuccess.tracking_code}</div>
                            <div className="text-[10px] text-slate-500">Réf : {paymentSuccess.reference}</div>
                        </div>

                        <div className="text-xs text-slate-400 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Redirection automatique vers le reçu...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="py-4 border-t border-slate-800 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} <strong className="text-slate-300">BIOLINKO</strong> — Plateforme e-Commerce & Bio-Liens pour Vendeurs 🇨🇲
            </footer>
        </div>
    );
}
