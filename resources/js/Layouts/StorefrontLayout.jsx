import { useState, useEffect } from 'react';
import HeaderBoutique from '@/Components/Storefront/HeaderBoutique';
import FooterBoutique from '@/Components/Storefront/FooterBoutique';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, CheckCircle2, Trash2, ArrowLeft, ShieldCheck, Lock, X } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';

export default function StorefrontLayout({ 
    store, 
    children, 
    activeTab = 'all', 
    setActiveTab, 
    searchQuery = '', 
    setSearchQuery,
    isOwner = false 
}) {
    const primaryColor = store?.theme_color || '#FFCC00';

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);

    // Sync cart items with localStorage
    useEffect(() => {
        if (!store?.id) return;
        const saved = localStorage.getItem(`biolinko_cart_${store.id}`);
        if (saved) {
            try { setCartItems(JSON.parse(saved)); } catch (e) {}
        }
    }, [store?.id]);

    const saveCart = (items) => {
        setCartItems(items);
        if (store?.id) {
            localStorage.setItem(`biolinko_cart_${store.id}`, JSON.stringify(items));
        }
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleClearCart = () => {
        saveCart([]);
        showToast('Panier vidé.');
    };

    const handleUpdateQuantity = (index, delta) => {
        const newItems = [...cartItems];
        newItems[index].quantity += delta;
        if (newItems[index].quantity <= 0) {
            newItems.splice(index, 1);
        }
        saveCart(newItems);
    };

    const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price_display * item.quantity), 0);

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-800 font-sans antialiased flex flex-col justify-between selection:bg-slate-900 selection:text-white">
            <style>{`
                ${store?.border_radius_style === 'square' ? `
                    .rounded-2xl, .rounded-3xl, .rounded-full, .rounded-xl {
                        border-radius: 4px !important;
                    }
                ` : ''}
                ${store?.font_family && store.font_family !== 'Inter' ? `
                    body, button, input, textarea, select, h1, h2, h3, h4, h5, h6, span, p, div {
                        font-family: '${store.font_family}', system-ui, -apple-system, sans-serif !important;
                    }
                ` : ''}
            `}</style>
            
            {/* UNPUBLISHED BANNER / VENDOR PREVIEW MODE */}
            {!store.is_published && (
                <div className="bg-amber-500 text-slate-950 text-xs font-bold py-2.5 px-4 text-center border-b border-amber-600/30 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>
                        {isOwner 
                            ? "MODE APERÇU VENDEUR : Votre boutique n'est pas encore publiée en ligne. Cliquez sur « Publier » dans votre tableau de bord pour l'activer." 
                            : "BOUTIQUE EN COURS DE PRÉPARATION : Le vendeur prépare actuellement sa vitrine officielle."}
                    </span>
                </div>
            )}

            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl bg-slate-950 text-white font-medium text-xs shadow-xl flex items-center gap-3 border border-slate-800"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{toastMessage}</span>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="ml-2 px-2.5 py-1 rounded-lg text-[10px] font-bold underline text-amber-300 hover:text-amber-200 cursor-pointer"
                        >
                            Voir mon Panier →
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* UNIFIED HEADER BOUTIQUE */}
            <HeaderBoutique 
                store={store} 
                cartCount={totalCartCount} 
                onOpenCart={() => setIsCartOpen(true)}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    if (setActiveTab) {
                        setActiveTab(tab);
                    } else {
                        router.visit(`/${store.slug}${tab === 'all' ? '' : `?tab=${tab}`}`);
                    }
                }}
            />

            {/* MAIN CONTENT AREA */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full space-y-12">
                {children}
            </main>

            {/* UNIFIED FOOTER BOUTIQUE */}
            <FooterBoutique store={store} />

            {/* UNIFIED SIDE CART DRAWER (ACCESSIBLE FROM EVERY PAGE) */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        {/* BACKDROP */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="fixed inset-0 bg-slate-950 z-50 backdrop-blur-xs"
                        />

                        {/* DRAWER PANEL */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col justify-between border-l border-slate-200"
                        >
                            {/* DRAWER HEADER */}
                            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
                                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                                    <ShoppingCart className="w-4 h-4 text-amber-500" />
                                    <span>Mon Panier ({totalCartCount} articles)</span>
                                </div>
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* DRAWER CONTENT */}
                            <div className="p-5 flex-1 overflow-y-auto space-y-4">
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-16 space-y-3">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                            <ShoppingCart className="w-8 h-8" />
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-base">Votre panier est vide</h4>
                                        <p className="text-xs text-slate-500 max-w-xs mx-auto">Explorez le catalogue et ajoutez vos articles préférés.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {cartItems.map((item, idx) => (
                                            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                                                <img src={item.image_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" />
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <h5 className="font-bold text-xs text-slate-900 truncate">{item.title}</h5>
                                                    <div className="text-xs font-extrabold text-slate-950">
                                                        {Number(item.price_display).toLocaleString()} FCFA
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs pt-1">
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(idx, -1)}
                                                            className="w-6 h-6 rounded-md bg-white border border-slate-200 font-bold flex items-center justify-center"
                                                        >-</button>
                                                        <span className="font-bold text-slate-900">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => handleUpdateQuantity(idx, 1)}
                                                            className="w-6 h-6 rounded-md bg-white border border-slate-200 font-bold flex items-center justify-center"
                                                        >+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* DRAWER FOOTER */}
                            {cartItems.length > 0 && (
                                <div className="p-5 border-t border-slate-200 bg-white space-y-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                                        <span>Total Panier :</span>
                                        <span className="text-base font-extrabold text-amber-600">{Number(cartSubtotal).toLocaleString()} FCFA</span>
                                    </div>
                                    <a
                                        href={`/${store.slug}?tab=cart`}
                                        className="w-full py-3.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-extrabold text-xs text-center shadow-md block transition-all cursor-pointer"
                                    >
                                        Finaliser la Commande →
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}
