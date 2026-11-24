import HeaderBoutique from '@/Components/Storefront/HeaderBoutique';
import FooterBoutique from '@/Components/Storefront/FooterBoutique';
import AppToaster from '@/Components/UI/AppToaster';
import useCart from '@/Components/Storefront/useCart';
import { MotionConfig } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import { useEffect } from 'react';
import { initPixels, track } from '@/Components/Storefront/pixels';
import { storeUrl } from '@/Components/Storefront/storeUrl';
import { storeDesign } from '@/Components/Storefront/Design/classic';
import { DesignFooter, DesignHeader } from '@/Components/Storefront/Design/Chrome';
import { fontsHref } from '@/Components/Storefront/Design/tokens';
import { storeTheme } from '@/Components/Storefront/Design/theme';
import { PatternBand } from '@/Components/Storefront/Design/ui';
import '@/Components/Storefront/Design/storefront.css';
import { StorefrontPageSkeleton, useSlowNavigation } from '@/Components/UI/Skeleton';

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
    patternBand = false,
}) {
    const loading = useSlowNavigation();
    // Vitrine : en-tête et pied de page du template, sinon ceux d'origine (template « Classique »)
    // Template : ses variables (couleurs, polices, arrondis) s'appliquent à tout le parcours d'achat
    const theme = storeTheme(store);
    const design = theme.design;
    const header = design.sections.find((s) => s.type === 'header');
    const footer = design.sections.find((s) => s.type === 'footer');
    const legacy = design.template === 'classique';
    const fonts = legacy ? null : fontsHref(design.style);

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
        <div className={`min-h-screen bg-white text-[#141412] font-poppins antialiased flex flex-col justify-between selection:bg-brand-honey selection:text-brand-ink ${legacy ? '' : 'sfj'}`}
            {...(legacy
                // Classique « coins carrés » : les pages du parcours lisent l'arrondi dans --r
                ? (store?.border_radius_style === 'square' ? { style: { '--r': '4px' } } : {})
                : { 'data-template': design.template, style: { ...theme.vars, backgroundColor: design.style.background } })}>
            {/* Sonner Toast Provider */}
            <AppToaster />

            {/* Police choisie par le vendeur (Poppins est déjà chargée par la page) */}
            {fonts && <Head><link head-key="store-font" rel="stylesheet" href={fonts} /></Head>}
            {legacy && store?.font_family && store.font_family !== 'Poppins' && (
                <Head><link head-key="store-font" rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(store.font_family)}:wght@400;500;600;700&display=swap`} /></Head>
            )}
            {legacy && <style>{`
                ${store?.border_radius_style === 'square' ? `
                    .rounded, .rounded-md, .rounded-lg, .rounded-xl, .rounded-2xl, .rounded-3xl {
                        border-radius: 4px !important;
                    }
                ` : ''}
                ${store?.font_family === 'Playfair Display' ? `
                    h1, h2, h3 {
                        font-family: 'Playfair Display', Georgia, serif !important;
                        letter-spacing: -0.01em !important;
                    }
                ` : store?.font_family && store.font_family !== 'Poppins' ? `
                    body, button, input, textarea, select, h1, h2, h3, h4, h5, h6, span, p, div {
                        font-family: '${store.font_family}', system-ui, -apple-system, sans-serif !important;
                    }
                ` : ''}
            `}</style>}
            
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

            {/* EN-TÊTE : celui du template, sinon l'en-tête Biolinko d'origine */}
            {(() => {
                const openCart = () => {
                    if (setActiveTab) setActiveTab('cart');
                    else router.visit(storeUrl(store.slug, `?tab=cart`));
                };
                const changeTab = (tab) => {
                    if (setActiveTab) setActiveTab(tab);
                    else router.visit(storeUrl(store.slug, tab === 'all' ? '' : `?tab=${tab}`));
                };
                const props = { store, cartCount: totalCartCount, searchQuery, setSearchQuery, hasPromos, hasSmartLinks, setActiveTab: changeTab };
                return header && header.variant !== 'classic'
                    ? <DesignHeader {...props} design={design} variant={header.variant} openCart={openCart} />
                    : <HeaderBoutique {...props} onOpenCart={openCart} activeTab={activeTab} />;
            })()}

            {/* MAIN CONTENT AREA */}
            {patternBand && <PatternBand design={design} />}
            <main className={fullBleed && !loading ? 'w-full flex-1' : 'mx-auto w-full max-w-[1200px] flex-1 space-y-12 px-5 py-8 lg:px-8'}>
                {loading ? <StorefrontPageSkeleton /> : children}
            </main>

            {/* PIED DE PAGE : celui du template, sinon celui d'origine */}
            {footer && footer.variant !== 'classic'
                ? <DesignFooter store={store} design={design} variant={footer.variant} />
                : <FooterBoutique store={store} />}
        </div>
        </MotionConfig>
    );
}

