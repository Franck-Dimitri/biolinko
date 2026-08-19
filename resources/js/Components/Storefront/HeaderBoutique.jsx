import { useState } from 'react';
import { Store, ShoppingCart, Search, Share2, Check, Tag, Star, Heart, User, ChevronDown } from 'lucide-react';

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

export default function HeaderBoutique({ store, cartCount = 0, onOpenCart, showBackToStore = false, searchQuery = '', setSearchQuery, activeTab = 'all', setActiveTab, hasPromos = false, hasSmartLinks = false }) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = getContrastColor(primaryColor);

    const scrollToSection = (sectionId) => {
        const el = document.getElementById(sectionId);
        if (el) {
            if (setActiveTab) {
                setActiveTab('all');
            }
            setTimeout(() => {
                const target = document.getElementById(sectionId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            window.location.href = `/${store.slug}#${sectionId}`;
        }
    };

    return (
        <header className="sticky top-0 z-40 font-sans shadow-2xs">
            {/* MAIN NAVBAR ONLY */}
            <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    
                    {/* LOGO & STORE BRAND NAME */}
                    <a 
                        href={`/${store.slug}`} 
                        onClick={(e) => {
                            const el = document.getElementById('hero');
                            if (el) {
                                e.preventDefault();
                                scrollToSection('hero');
                            }
                        }}
                        className="flex items-center gap-3 cursor-pointer shrink-0 group"
                    >
                        <div 
                            className="w-10 h-10 rounded-2xl font-black flex items-center justify-center text-base shadow-2xs overflow-hidden shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                        >
                            {store.logo_url ? (
                                <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Store className="w-5 h-5" style={{ color: primaryTextColor }} />
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-none group-hover:text-amber-600 transition-colors font-sans">{store.name}</h1>
                            <p className="text-[11px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">{store.category || 'Boutique Officielle'}</p>
                        </div>
                    </a>

                    {/* CENTERED NAVIGATION LINKS */}
                    <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
                        <button
                            type="button"
                            onClick={() => scrollToSection('hero')}
                            className="transition-colors hover:text-slate-950 cursor-pointer text-slate-700 hover:border-b-2 hover:border-slate-950 pb-0.5"
                        >
                            Accueil
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToSection('categories')}
                            className="transition-colors hover:text-slate-950 cursor-pointer text-slate-700 hover:border-b-2 hover:border-slate-950 pb-0.5"
                        >
                            Catégories
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToSection('catalog-grid')}
                            className="transition-colors hover:text-slate-950 cursor-pointer text-slate-700 hover:border-b-2 hover:border-slate-950 pb-0.5"
                        >
                            Catalogue
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToSection('best-sellers')}
                            className="transition-colors hover:text-slate-950 cursor-pointer text-slate-700 hover:border-b-2 hover:border-slate-950 pb-0.5"
                        >
                            Meilleures Ventes
                        </button>
                        {hasPromos && (
                            <button
                                type="button"
                                onClick={() => scrollToSection('promotions')}
                                className="transition-colors hover:text-slate-950 flex items-center gap-1 cursor-pointer text-rose-600 hover:border-b-2 hover:border-rose-600 pb-0.5"
                            >
                                <Tag className="w-3.5 h-3.5 text-rose-500" />
                                <span>Promotions</span>
                            </button>
                        )}
                        {hasSmartLinks && (
                            <button
                                type="button"
                                onClick={() => scrollToSection('smartlinks')}
                                className="transition-colors hover:text-slate-950 flex items-center gap-1 cursor-pointer text-amber-700 hover:border-b-2 hover:border-amber-600 pb-0.5"
                            >
                                <span>Packs SmartLinks</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => scrollToSection('reviews')}
                            className="transition-colors hover:text-slate-950 flex items-center gap-1 cursor-pointer text-slate-700 hover:border-b-2 hover:border-slate-950 pb-0.5"
                        >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>Avis</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollToSection('about')}
                            className="transition-colors hover:text-slate-950 cursor-pointer text-slate-700 hover:border-b-2 hover:border-slate-950 pb-0.5"
                        >
                            À Propos &amp; Support
                        </button>
                    </nav>

                    {/* RIGHT UTILITY ICONS (SEARCH & CART) */}
                    <div className="flex items-center gap-4">
                        {setSearchQuery && (
                            <div className="relative hidden sm:block">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="pl-9 pr-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 outline-none w-36 focus:w-48 transition-all"
                                />
                            </div>
                        )}

                        <button
                            onClick={onOpenCart}
                            className="px-5 py-2.5 rounded-full text-xs font-extrabold shadow-sm transition-all active:scale-95 flex items-center gap-2 border cursor-pointer"
                            style={{ backgroundColor: primaryColor, color: primaryTextColor, borderColor: primaryColor }}
                            title="Mon Panier"
                        >
                            <ShoppingCart className="w-4 h-4" style={{ color: primaryTextColor }} />
                            <span className="hidden sm:inline">Panier</span>
                            {cartCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-xs">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
}
