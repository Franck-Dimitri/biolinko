import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
import AppToaster from '@/Components/UI/AppToaster';
import StoreSections from '@/Components/Storefront/Design/StoreSections';
import { DesignFooter, DesignHeader } from '@/Components/Storefront/Design/Chrome';
import { storeTheme } from '@/Components/Storefront/Design/theme';
import { fontsHref } from '@/Components/Storefront/Design/tokens';
import { categoryOf, slugify } from '@/Components/Storefront/Design/ui';
import '@/Components/Storefront/Design/storefront.css';

/**
 * Exemple d'un template avec un contenu de démonstration. Rien ne s'achète ici : les liens et l'ajout
 * au panier rappellent que c'est un exemple. ?apercu = vignette de la galerie (sans barre Biolinko).
 */
// Aperçu dans la création de boutique : le nom et la ville tapés par le vendeur s'affichent en direct
export const PREVIEW_IDENTITY = 'biolinko:template-identity';

export default function Show({ template, siblings = [], store: demoStore, products = [], packs = [] }) {
    const { auth } = usePage().props;
    const preview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('apercu');
    const [identity, setIdentity] = useState(null);
    useEffect(() => {
        if (!preview) return undefined;
        const onMessage = (e) => {
            if (e.origin === window.location.origin && e.data?.type === PREVIEW_IDENTITY) setIdentity(e.data);
        };
        window.addEventListener('message', onMessage);
        window.parent?.postMessage({ type: `${PREVIEW_IDENTITY}:ready` }, window.location.origin);
        return () => window.removeEventListener('message', onMessage);
    }, [preview]);
    const store = identity ? { ...demoStore, name: identity.name || demoStore.name, city_location: identity.city || demoStore.city_location } : demoStore;
    const theme = storeTheme(store);
    const design = theme.design;
    const fonts = fontsHref(design.style);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [search, setSearch] = useState('');

    const example = () => toast('Ceci est une boutique d’exemple', { description: 'Créez votre boutique avec ce template pour vendre vos propres produits.' });
    const categories = useMemo(() => [...new Set(products.map(categoryOf).filter(Boolean))].map((label) => ({ id: slugify(label), label })), [products]);
    const filteredProducts = products.filter((p) => (selectedCategory === 'all' || slugify(categoryOf(p)) === selectedCategory)
        && (!search.trim() || p.title.toLowerCase().includes(search.trim().toLowerCase())));
    const scrollToCatalog = () => document.getElementById('catalog-grid')?.scrollIntoView({ behavior: 'smooth' });

    const ctx = {
        store, theme: { color: theme.primary, text: theme.onPrimary, pattern: design.pattern?.key }, products, filteredProducts, categories,
        selectedCategory, onCategory: setSelectedCategory, search, onSearch: setSearch,
        cardProps: { storeSlug: store.slug, primaryColor: theme.primary, primaryTextColor: theme.onPrimary, onAdd: example, onWishlist: null, wishlist: [] },
        onShop: scrollToCatalog, onSeeAll: scrollToCatalog, promoProducts: products.filter((p) => p.promo_active), promoEndsAt: null,
        packs, benefits: [], reviews: store.reviews || [], onReview: example, addToCart: example, notify: (m) => toast(m),
    };
    const header = design.sections.find((s) => s.type === 'header');
    const footer = design.sections.find((s) => s.type === 'footer');
    // Les liens de la boutique d'exemple ne mènent nulle part
    const intercept = (e) => {
        if (e.target.closest('a')) {
            e.preventDefault();
            example();
        }
    };
    const choose = auth?.user ? route('appearance.index') : `${route('register')}?template=${template.id}`;

    return (
        <MotionConfig reducedMotion="user">
            <Head title={`Template ${template.name} · ${template.activity}`}>{fonts && <link head-key="store-font" rel="stylesheet" href={fonts} />}</Head>
            <AppToaster />
            <div className="sfj min-h-screen" style={{ ...theme.vars, backgroundColor: design.style.background }}>
                {!preview && (
                    <div className="relative z-50 border-b sm:sticky sm:top-0 border-black/10 bg-white font-poppins text-[#141412]">
                        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
                            <Link href={route('site.templates', { activite: template.activityKey })} className="inline-flex items-center gap-1.5 text-[14px] text-[#5F5E58] hover:text-[#141412]">
                                <ArrowLeft className="h-4 w-4" /> Tous les templates
                            </Link>
                            <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto text-[13px] [scrollbar-width:none]">
                                <span className="hidden shrink-0 text-[#8B8A83] sm:inline">{template.activity} :</span>
                                {siblings.map((s) => (
                                    <Link key={s.id} href={route('site.templates.show', s.id)} preserveScroll={false}
                                        className={`shrink-0 rounded-full px-3 py-1.5 ${s.id === template.id ? 'bg-[#141412] text-white' : 'border border-black/10 hover:border-black/30'}`}>{s.name}</Link>
                                ))}
                            </div>
                            <a href={choose} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#FFCC00] px-4 text-[14px] font-medium text-[#141412] hover:bg-[#E6B800]">
                                {auth?.user ? 'Mon espace vendeur' : 'Créer ma boutique avec ce template'} <ArrowRight className="h-4 w-4" />
                            </a>
                        </div>
                        <p className="flex items-center justify-center gap-1.5 bg-[#FFF8D6] px-4 py-1.5 text-center text-[12px] text-[#5F5E58]">
                            <Info className="h-3.5 w-3.5 shrink-0" /> Boutique d’exemple : les produits, les avis et les textes seront remplacés par les vôtres.
                        </p>
                    </div>
                )}
                <div onClickCapture={intercept}>
                    {header && header.variant !== 'classic' && (
                        <DesignHeader store={store} design={design} variant={header.variant} cartCount={0} openCart={example} searchQuery={search} setSearchQuery={setSearch}
                            hasPromos={ctx.promoProducts.length > 0} hasSmartLinks={packs.length > 0} />
                    )}
                    <StoreSections design={design} ctx={ctx} />
                    {footer && <DesignFooter store={store} design={design} variant={footer.variant === 'classic' ? 'simple' : footer.variant} demo />}
                </div>
            </div>
        </MotionConfig>
    );
}
