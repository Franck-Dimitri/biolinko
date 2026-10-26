import HeaderBoutique from '@/Components/Storefront/HeaderBoutique';
import FooterBoutique from '@/Components/Storefront/FooterBoutique';
import { Toaster } from 'sonner';
import useCart from '@/Components/Storefront/useCart';
import { MotionConfig } from 'framer-motion';
import { Lock } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { initPixels, track } from '@/Components/Storefront/pixels';

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
    fullBleed = false,
}) {
    const primaryColor = store?.theme_color || '#FFCC00';

    const cart = useCart(store?.id);

    // La page parente (ex. Boutique) passe son compteur à jour ; sinon on lit le panier enregistré.
    const totalCartCount = cartCount ?? cart.count;

    // Pixels du vendeur : une page vue à chaque visite (sauf aperçu de l'éditeur et visites du vendeur)
    useEffect(() => {
        const preview = !store?.is_published || new URLSearchParams(window.location.search).has('apercu');
        if (preview || isOwner) return;
        initPixels(store);
        track('PageView');
    }, [store?.id, typeof window !== 'undefined' ? window.location.href : '']);

    return (
        <MotionConfig reducedMotion="user">
        <div className="min-h-screen bg-white text-[#141412] font-poppins antialiased flex flex-col justify-between selection:bg-brand-honey selection:text-brand-ink">
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
                    <Lock className="w-4 h-4 shrink-0" />
                    <span className="break-words">
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
            <main className={fullBleed ? 'w-full flex-1' : 'mx-auto w-full max-w-[1200px] flex-1 space-y-12 px-5 py-8 lg:px-8'}>
                {children}
            </main>

            {/* UNIFIED FOOTER BOUTIQUE */}
            <FooterBoutique store={store} />
        </div>
        </MotionConfig>
    );
}

