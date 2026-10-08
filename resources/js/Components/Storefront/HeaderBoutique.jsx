import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Search, ShoppingBag, Store } from 'lucide-react';
import { contrastColor } from '@/Components/Storefront/theme';

export default function HeaderBoutique({ store, cartCount = 0, onOpenCart, searchQuery = '', setSearchQuery, setActiveTab, hasPromos = false, hasSmartLinks = false }) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = contrastColor(primaryColor);
    const [compact, setCompact] = useState(false);
    const { scrollY } = useScroll();
    useMotionValueEvent(scrollY, 'change', (v) => setCompact(v > 40));

    const scrollToSection = (sectionId) => {
        if (setActiveTab) setActiveTab('all');
        setTimeout(() => {
            const target = document.getElementById(sectionId);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            else window.location.href = `/${store.slug}#${sectionId}`;
        }, 80);
    };

    const sections = store?.sections_json;
    const isBannerEnabled = Array.isArray(sections)
        ? sections.some((s) => s.id === 'banner' && ![false, 'false', 0, '0'].includes(s.enabled))
        : true;

    const links = [
        ['Accueil', 'hero'],
        ['Catalogue', 'catalog-grid'],
        ['Meilleures ventes', 'best-sellers'],
        ...(hasPromos ? [['Promotions', 'promotions']] : []),
        ...(hasSmartLinks ? [['Packs', 'smartlinks']] : []),
        ['Avis', 'reviews'],
        ['À propos', 'about'],
    ];

    return (
        <header className="sticky top-0 z-40">
            {isBannerEnabled && store?.announcement_header && (
                <div className="overflow-hidden py-2 text-center text-[13px] font-medium" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                    <motion.span
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-block px-4"
                    >
                        {store.announcement_header}
                    </motion.span>
                </div>
            )}

            <motion.div
                animate={{ boxShadow: compact ? '0 8px 24px -16px rgba(43,38,32,0.35)' : '0 0 0 rgba(0,0,0,0)' }}
                className="border-b border-brand-line bg-white/95 backdrop-blur-md"
            >
                <motion.div
                    animate={{ height: compact ? 60 : 72 }}
                    transition={{ duration: 0.25 }}
                    className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-8"
                >
                    <a
                        href={`/${store.slug}`}
                        onClick={(e) => {
                            if (document.getElementById('hero')) {
                                e.preventDefault();
                                scrollToSection('hero');
                            }
                        }}
                        className="flex min-w-0 items-center gap-3"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                            {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-5 w-5" />}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-lg font-bold leading-tight tracking-tight text-brand-ink">{store.name}</span>
                            <span className="block truncate text-xs text-brand-muted">{store.category || 'Boutique officielle'}</span>
                        </span>
                    </a>

                    <nav className="hidden items-center gap-6 text-sm font-medium text-brand-ink/75 lg:flex">
                        {links.map(([label, id]) => (
                            <button key={id} type="button" onClick={() => scrollToSection(id)} className="relative py-1 transition-colors hover:text-brand-ink">
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        {setSearchQuery && (
                            <label className="relative hidden sm:block">
                                <span className="sr-only">Rechercher un produit</span>
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="h-10 w-40 rounded-md border-brand-line bg-brand-sand pl-9 pr-3 text-sm text-brand-ink transition-all focus:w-56 focus:border-brand-ink/30 focus:ring-0"
                                />
                            </label>
                        )}
                        <motion.button
                            type="button"
                            onClick={onOpenCart || (() => { window.location.href = `/${store.slug}?tab=cart`; })}
                            whileTap={{ scale: 0.95 }}
                            className="relative flex h-10 items-center gap-2 rounded-md px-3.5 text-sm font-semibold sm:px-4"
                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                            aria-label={`Panier, ${cartCount} article${cartCount > 1 ? 's' : ''}`}
                        >
                            <ShoppingBag className="h-4 w-4" />
                            <span className="hidden sm:inline">Panier</span>
                            <AnimatePresence mode="popLayout">
                                {cartCount > 0 && (
                                    <motion.span
                                        key={cartCount}
                                        initial={{ scale: 0.4, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.4, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                                        className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-semibold text-brand-ink"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </motion.div>

                <nav className="flex gap-5 overflow-x-auto px-4 pb-2.5 text-sm font-medium text-brand-ink/75 [scrollbar-width:none] lg:hidden">
                    {links.map(([label, id]) => (
                        <button key={id} type="button" onClick={() => scrollToSection(id)} className="shrink-0 py-1">{label}</button>
                    ))}
                </nav>
            </motion.div>
        </header>
    );
}
