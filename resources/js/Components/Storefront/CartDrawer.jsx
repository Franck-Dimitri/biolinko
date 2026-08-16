import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, ShoppingCart } from 'lucide-react';

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

export default function CartDrawer({
    isOpen,
    onClose,
    store,
    cartItems = [],
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onProceedToCheckout
}) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = getContrastColor(primaryColor);

    const totalCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const cartSubtotal = cartItems.reduce((acc, item) => acc + ((item.price_display || item.price_vendor || 0) * (item.quantity || 1)), 0);
    const estimatedMomoFee = Math.ceil((cartSubtotal / 0.98) - cartSubtotal);
    const cartTotalClient = cartSubtotal + estimatedMomoFee;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden font-sans">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                    />

                    {/* Sliding Drawer Container */}
                    <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
                            className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200"
                        >
                            {/* Drawer Header */}
                            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs font-extrabold"
                                        style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                                    >
                                        <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-extrabold text-slate-950 tracking-tight">Mon Panier</h2>
                                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-900 text-xs font-bold font-mono">
                                                {totalCartCount} {totalCartCount > 1 ? 'articles' : 'article'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium">{store?.name || 'Vitrine Officielle'}</p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="p-2 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-all cursor-pointer active:scale-95"
                                    aria-label="Fermer le panier"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Body: Cart Item List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {cartItems.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pb-1 border-b border-slate-100">
                                            <span>Articles sélectionnés</span>
                                            <button
                                                type="button"
                                                onClick={onClearCart}
                                                className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>Vider</span>
                                            </button>
                                        </div>

                                        {cartItems.map((item, idx) => (
                                            <motion.div
                                                key={item.product_id ? `${item.product_id}-${item.variant_id || idx}` : idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 shadow-2xs group hover:border-slate-300 transition-all"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                        {item.image_url ? (
                                                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag className="w-6 h-6 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="text-xs font-bold text-slate-950 truncate leading-snug">{item.title}</h4>
                                                        {item.variant_label && (
                                                            <span className="inline-block text-[10px] text-slate-500 font-medium bg-slate-200/60 px-1.5 py-0.5 rounded-md mt-0.5 truncate">
                                                                {item.variant_label}
                                                            </span>
                                                        )}
                                                        <div className="text-xs font-extrabold text-slate-950 mt-1">
                                                            {Number(item.price_display || item.price_vendor || 0).toLocaleString()} FCFA
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quantity Controls & Remove */}
                                                <div className="flex flex-col items-end gap-2 shrink-0">
                                                    <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
                                                        <button
                                                            type="button"
                                                            onClick={() => onUpdateQuantity && onUpdateQuantity(idx, -1)}
                                                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-xs flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                                                        >
                                                            <Minus className="w-3 h-3 text-slate-700" />
                                                        </button>
                                                        <span className="w-7 text-center font-extrabold text-slate-950 text-xs">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => onUpdateQuantity && onUpdateQuantity(idx, 1)}
                                                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-xs flex items-center justify-center cursor-pointer transition-colors active:scale-95"
                                                        >
                                                            <Plus className="w-3 h-3 text-slate-700" />
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => onRemoveItem && onRemoveItem(idx)}
                                                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                                                        title="Supprimer l'article"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-slate-400">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                            <ShoppingBag className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-slate-800">Votre panier est vide</h3>
                                            <p className="text-xs text-slate-500 max-w-xs">Découvrez le catalogue et ajoutez des articles pour commencer votre commande.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-950 text-white hover:bg-slate-900 shadow-xs transition-all active:scale-97 cursor-pointer"
                                        >
                                            Parcourir les produits
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Drawer Footer: Price Summary & Checkout Button */}
                            {cartItems.length > 0 && (
                                <div className="p-6 border-t border-slate-100 bg-slate-50/80 space-y-4 shrink-0">
                                    <div className="space-y-2 text-xs font-medium text-slate-600">
                                        <div className="flex items-center justify-between">
                                            <span>Sous-total articles</span>
                                            <span className="font-bold text-slate-900">{cartSubtotal.toLocaleString()} FCFA</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <span>Frais MoMo USSD (estimé ~2%)</span>
                                            </span>
                                            <span>+{estimatedMomoFee.toLocaleString()} FCFA</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-sm">
                                            <span className="font-extrabold text-slate-950">Total à régler</span>
                                            <span className="font-black text-slate-950 text-base">{cartTotalClient.toLocaleString()} FCFA</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                if (onProceedToCheckout) onProceedToCheckout();
                                            }}
                                            className="w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 border active:scale-97 cursor-pointer"
                                            style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                                        >
                                            <span>Passer la commande</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>

                                        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-medium pt-1">
                                            <span className="flex items-center gap-1">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Paiement USSD MoMo 100% Sécurisé
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Truck className="w-3.5 h-3.5 text-slate-600" /> Livraison 24h-48h
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}
