import { Head } from '@inertiajs/react';
import { useState } from 'react';
import HeaderBoutique from '@/Components/Storefront/HeaderBoutique';
import FooterBoutique from '@/Components/Storefront/FooterBoutique';
import { 
    Zap, ShoppingBag, ShieldCheck, CheckCircle2, AlertCircle, 
    Smartphone, Truck, ArrowRight, Loader2, Lock, Tag, Store, Check, BadgeCheck
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

export default function SmartLinkShow({ smartLink, store, isValid }) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = getContrastColor(primaryColor);

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
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
            <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex items-center justify-center p-4 font-sans">
                <Head title={`Offre Indisponible — ${store?.name || 'BIOLINKO'}`} />
                <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-4 border border-slate-200 shadow-xl">
                    <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-extrabold text-slate-950">Offre Indisponible</h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Ce lien de commande rapide est expiré ou n'est plus actif.
                    </p>
                    <a
                        href={`/${store?.slug || ''}`}
                        className="inline-block px-6 py-3 rounded-2xl bg-slate-950 text-white font-extrabold text-xs transition-all shadow-md"
                    >
                        Accéder à la boutique {store?.name || ''}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans antialiased flex flex-col justify-between">
            <Head title={`${smartLink.title} — ${store?.name || 'BIOLINKO'}`} />

            {/* STOREFRONT HEADER COMPONENT */}
            <HeaderBoutique store={store} showBackToStore={true} />

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 my-4">
                
                {/* LEFT COL: OFFER DETAILS & PRODUCTS INCLUDED */}
                <div className="md:col-span-6 space-y-6">
                    
                    {/* Offer Title Banner & Photo Showcase */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5 relative overflow-hidden">
                        <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider bg-amber-100 px-3 py-1 rounded-full w-max border border-amber-300">
                            <Zap className="w-4 h-4 fill-amber-500" />
                            <span>Offre Express SmartLink</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight leading-snug">
                            {smartLink.title}
                        </h1>

                        {/* PRODUCT PHOTO SHOWCASE / GALLERY */}
                        {smartLink.items && smartLink.items.length > 0 && (
                            <div className="space-y-3 pt-1">
                                {/* MAIN SELECTED PRODUCT PHOTO PREVIEW */}
                                <div className="w-full h-64 sm:h-72 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative group shadow-2xs">
                                    {smartLink.items[selectedImageIndex]?.image_url ? (
                                        <img 
                                            src={smartLink.items[selectedImageIndex].image_url} 
                                            alt={smartLink.items[selectedImageIndex].product_name || 'Produit'} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                            <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                                            <span className="text-xs font-medium">Offre Pack Spéciale</span>
                                        </div>
                                    )}

                                    {/* ITEM BADGE OVERLAY */}
                                    <div className="absolute bottom-3 left-3 right-3 bg-slate-950/85 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center justify-between shadow-md">
                                        <span className="truncate">{smartLink.items[selectedImageIndex]?.product_name || 'Article du Pack'}</span>
                                        <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ml-2">
                                            x{smartLink.items[selectedImageIndex]?.quantity || 1} inclus
                                        </span>
                                    </div>
                                </div>

                                {/* MINI THUMBNAIL PHOTO SELECTOR (IF MULTIPLE ITEMS) */}
                                {smartLink.items.length > 1 && (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                        {smartLink.items.map((item, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setSelectedImageIndex(idx)}
                                                className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition-all shrink-0 cursor-pointer ${
                                                    selectedImageIndex === idx 
                                                        ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105 shadow-2xs' 
                                                        : 'border-slate-200 opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <ShoppingBag className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Price Breakdown Box */}
                        <div className="p-5 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-md">
                            <div>
                                <div className="text-[11px] text-slate-400 uppercase font-bold">Prix Spécial Offre</div>
                                <div className="text-2xl sm:text-3xl font-extrabold text-[#FFCC00]">
                                    {Number(smartLink.total_amount).toLocaleString()} <span className="text-xs font-bold text-slate-200">FCFA</span>
                                </div>
                            </div>

                            {smartLink.subtotal_amount > smartLink.total_amount && (
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 line-through">
                                        {Number(smartLink.subtotal_amount).toLocaleString()} FCFA
                                    </div>
                                    <span className="inline-block px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[11px] mt-0.5 shadow-2xs">
                                        Économie -{Number(smartLink.subtotal_amount - smartLink.total_amount).toLocaleString()} F
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Products Included List */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 space-y-4 shadow-2xs">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-950 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-amber-500" />
                            <span>Articles Inclus ({smartLink.items?.length || 0})</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {smartLink.items && smartLink.items.map((item, idx) => (
                                <div key={idx} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden shadow-2xs">
                                            {item.image_url ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" /> : <ShoppingBag className="w-5 h-5 text-slate-400" />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-950">{item.product_name}</div>
                                            <div className="text-[11px] text-slate-500">{Number(item.unit_price).toLocaleString()} FCFA / unité</div>
                                        </div>
                                    </div>

                                    <div className="text-xs font-bold text-slate-950 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                                        Qte: x{item.quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reassurance Badges */}
                    <div className="grid grid-cols-2 gap-3 text-slate-700 text-[11px] font-semibold">
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-2 shadow-2xs">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Paiement MoMo Sécurisé</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-2 shadow-2xs">
                            <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Livraison Garanties</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: FAST CHECKOUT FORM */}
                <div className="md:col-span-6">
                    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
                        
                        <div className="border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-extrabold text-slate-950 flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-amber-500" />
                                <span>Paiement Mobile Money Direct</span>
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                Saisissez vos informations pour valider votre commande par prompt USSD instantané.
                            </p>
                        </div>

                        {errorMessage && (
                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                            
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nom & Prénom *
                                </label>
                                <input
                                    type="text"
                                    name="customer_name"
                                    required
                                    value={formData.customer_name}
                                    onChange={handleInputChange}
                                    placeholder="ex: Marie Diallo"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-950 focus:border-amber-400 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Opérateur *
                                    </label>
                                    <select
                                        name="operator"
                                        value={formData.operator}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-950 focus:border-amber-400 outline-none"
                                    >
                                        <option value="MTN">MTN MoMo</option>
                                        <option value="ORANGE">Orange Money</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Téléphone MoMo *
                                    </label>
                                    <input
                                        type="tel"
                                        name="customer_phone"
                                        required
                                        value={formData.customer_phone}
                                        onChange={handleInputChange}
                                        placeholder="ex: 690000000"
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-950 focus:border-amber-400 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Ville *
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_city"
                                        required
                                        value={formData.customer_city}
                                        onChange={handleInputChange}
                                        placeholder="ex: Douala"
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-950 focus:border-amber-400 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                        Adresse de Livraison *
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_address"
                                        required
                                        value={formData.customer_address}
                                        onChange={handleInputChange}
                                        placeholder="ex: Akwa, face boulangerie"
                                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-950 focus:border-amber-400 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    E-mail (pour la facture PDF)
                                </label>
                                <input
                                    type="email"
                                    name="customer_email"
                                    value={formData.customer_email}
                                    onChange={handleInputChange}
                                    placeholder="ex: client@gmail.com"
                                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-950 focus:border-amber-400 outline-none transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 border mt-4 cursor-pointer"
                                style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Envoi de la demande USSD...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Valider & Payer {Number(smartLink.total_amount).toLocaleString()} FCFA ({formData.operator})</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                            <Lock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Paiement USSD sécurisé via HR-Skills Pay API</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* PAYMENT SUCCESS MODAL */}
            {paymentSuccess && (
                <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-8 text-center space-y-6 shadow-2xl">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-extrabold text-slate-950">Demande USSD Envoyée</h3>
                            <p className="text-xs text-slate-600 font-medium">
                                Veuillez approuver le prompt Mobile Money sur votre téléphone pour régler <strong className="text-slate-950 font-bold">{Number(smartLink.total_amount).toLocaleString()} FCFA</strong>.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-950 space-y-1">
                            <div>Réf Commande : {paymentSuccess.tracking_code}</div>
                        </div>

                        <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                            <span>Redirection automatique vers votre commande...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* STOREFRONT FOOTER COMPONENT */}
            <FooterBoutique store={store} />
        </div>
    );
}
