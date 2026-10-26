import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, ShoppingBag, Store, X } from 'lucide-react';
import { contrastColor } from '@/Components/Storefront/theme';

export default function HeaderBoutique({ store, cartCount = 0, onOpenCart, searchQuery = '', setSearchQuery, setActiveTab, hasPromos = false, hasSmartLinks = false }) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = contrastColor(primaryColor);
    const [menu, setMenu] = useState(false);
    const [search, setSearch] = useState(false);

    const scrollToSection = (sectionId) => {
        setMenu(false);
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
        ['Produits', 'catalog-grid'],
        ...(hasPromos ? [['Promotions', 'promotions']] : []),
        ...(hasSmartLinks ? [['Packs', 'smartlinks']] : []),
        ['Avis', 'reviews'],
        ['À propos', 'about'],
    ];

    const openCart = onOpenCart || (() => { window.location.href = `/${store.slug}?tab=cart`; });

    return (
        <header className="sticky top-0 z-40">
            {isBannerEnabled && store?.announcement_header && (
                <div className="py-2 text-center text-[13px]" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                    <span className="mx-auto block max-w-4xl truncate px-4" title={store.announcement_header}>{store.announcement_header}</span>
                </div>
            )}

            <div className="border-b border-black/[0.06] bg-white/85 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-5 lg:px-8">
                    <a href={`/${store.slug}`} className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                            {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4" />}
                        </span>
                        <span className="truncate text-[17px] font-semibold tracking-tight text-[#141412]" title={store.name}>{store.name}</span>
                    </a>

                    <nav className="hidden items-center gap-8 lg:flex">
                        {links.map(([label, id]) => (
                            <button key={id} type="button" onClick={() => scrollToSection(id)} className="text-[15px] text-[#141412]/70 transition-colors hover:text-[#141412]">
                                {label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2">
                        {setSearchQuery && (
                            <button type="button" onClick={() => setSearch((v) => !v)} aria-label="Rechercher un produit" aria-expanded={search}
                                className="flex h-10 w-10 items-center justify-center rounded-full text-[#141412]/70 hover:bg-black/[0.04] hover:text-[#141412]">
                                <Search className="h-[18px] w-[18px]" />
                            </button>
                        )}
                        <motion.button type="button" onClick={openCart} whileTap={{ scale: 0.95 }}
                            className="relative flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium"
                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                            aria-label={`Panier, ${cartCount} article${cartCount > 1 ? 's' : ''}`}>
                            <ShoppingBag className="h-4 w-4" />
                            <span className="hidden sm:inline">Panier</span>
                            <AnimatePresence mode="popLayout">
                                {cartCount > 0 && (
                                    <motion.span key={cartCount} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                                        className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-semibold text-[#141412]">
                                        {cartCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                        <button type="button" onClick={() => setMenu((v) => !v)} aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menu}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 lg:hidden">
                            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {search && setSearchQuery && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-black/[0.06]">
                            <label className="relative mx-auto block max-w-[1200px] px-5 py-3 lg:px-8">
                                <span className="sr-only">Rechercher un produit</span>
                                <Search className="absolute left-9 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8A83] lg:left-12" />
                                <input type="search" autoFocus value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); if (setActiveTab) setActiveTab('all'); }}
                                    onKeyDown={(e) => e.key === 'Enter' && scrollToSection('catalog-grid')}
                                    placeholder={`Rechercher chez ${store.name}…`}
                                    className="h-12 w-full rounded-full border-black/10 bg-[#F6F5F1] pl-11 pr-4 text-[16px] text-[#141412] focus:border-black/20 focus:ring-0" />
                            </label>
                        </motion.div>
                    )}
                    {menu && (
                        <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-black/[0.06] lg:hidden">
                            <div className="px-5 py-3">
                                {links.map(([label, id]) => (
                                    <button key={id} type="button" onClick={() => scrollToSection(id)} className="block w-full py-3 text-left text-[16px] text-[#141412]">{label}</button>
                                ))}
                            </div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}
