import { useState, useEffect } from 'react';
import HeaderBoutique from '@/Components/Storefront/HeaderBoutique';
import FooterBoutique from '@/Components/Storefront/FooterBoutique';
import { Toaster, toast } from 'sonner';
import { MotionConfig } from 'framer-motion';
import { Lock } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function StorefrontLayout({ 
    store, 
    children, 
    activeTab = 'all', 
    setActiveTab, 
    searchQuery = '', 
    setSearchQuery,
    isOwner = false,
    hasPromos = false,
    hasSmartLinks = false,
    cartCount = null,
}) {
    const primaryColor = store?.theme_color || '#FFCC00';

    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);

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

    const handleClearCart = () => {
        saveCart([]);
        toast.info('Panier vidé.');
    };

    const handleUpdateQuantity = (index, delta) => {
        const newItems = [...cartItems];
        newItems[index].quantity = (newItems[index].quantity || 1) + delta;
        if (newItems[index].quantity <= 0) {
            newItems.splice(index, 1);
        }
        saveCart(newItems);
    };

    const handleRemoveItem = (index) => {
        const newItems = [...cartItems];
        newItems.splice(index, 1);
        saveCart(newItems);
        toast.info('Article retiré du panier');
    };

    // La page parente (ex. Boutique) passe son compteur à jour ; sinon on lit le panier enregistré.
    const totalCartCount = cartCount ?? cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const handleProceedToCheckout = () => {
        if (setActiveTab) {
            setActiveTab('cart');
        } else {
            router.visit(`/${store.slug}?tab=cart`);
        }
    };

    return (
        <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-white text-brand-ink font-sans antialiased flex flex-col justify-between selection:bg-brand-honey selection:text-brand-ink">
            {/* Sonner Toast Provider */}
            <Toaster position="top-center" richColors closeButton />

            <style>{`
                ${store?.border_radius_style === 'square' ? `
                    .rounded, .rounded-md, .rounded-lg, .rounded-xl, .rounded-2xl, .rounded-3xl {
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
                <div className="bg-brand-honey text-brand-ink text-sm py-2.5 px-4 text-center border-b border-brand-line flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>
                        {isOwner 
                            ? "Aperçu vendeur : votre boutique n'est pas encore publiée. Publiez-la depuis votre tableau de bord." 
                            : "Boutique en préparation : le vendeur finalise sa vitrine."}
                    </span>
                </div>
            )}

            {/* UNIFIED HEADER BOUTIQUE */}
            <HeaderBoutique 
                store={store} 
                cartCount={totalCartCount} 
                onOpenCart={() => {
                    if (setActiveTab) {
                        setActiveTab('cart');
                    } else {
                        router.visit(`/${store.slug}?tab=cart`);
                    }
                }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeTab={activeTab}
                hasPromos={hasPromos}
                hasSmartLinks={hasSmartLinks}
                setActiveTab={(tab) => {
                    if (setActiveTab) {
                        setActiveTab(tab);
                    } else {
                        router.visit(`/${store.slug}${tab === 'all' ? '' : `?tab=${tab}`}`);
                    }
                }}
            />

            {/* MAIN CONTENT AREA */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex-1 w-full space-y-12">
                {children}
            </main>

            {/* UNIFIED FOOTER BOUTIQUE */}
            <FooterBoutique store={store} />
        </div>
        </MotionConfig>
    );
}

