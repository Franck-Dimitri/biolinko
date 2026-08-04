import { useState } from 'react';
import { Store, ShoppingCart, Search, Truck, Share2, Check, Tag, Star, ArrowLeft } from 'lucide-react';

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

export default function HeaderBoutique({ store, cartCount = 0, onOpenCart, showBackToStore = false, searchQuery = '', setSearchQuery, activeTab = 'all', setActiveTab }) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = getContrastColor(primaryColor);
    const [copiedLink, setCopiedLink] = useState(false);

    const handleShareStore = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
    };

    const handleNavClick = (tabName) => {
        if (setActiveTab) {
            setActiveTab(tabName);
        } else {
            window.location.href = `/${store.slug}${tabName === 'all' ? '' : `?tab=${tabName}`}`;
        }
    };

    return (
        <header className="sticky top-0 z-40 font-sans shadow-2xs">
            {/* 1. TOP ANNOUNCEMENT BAR */}
            <div className="bg-slate-900 text-white text-[11px] font-medium py-2 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-slate-800">
                <div className="flex items-center gap-4 mx-auto sm:mx-0">
                    <span className="flex items-center gap-1.5 font-semibold" style={{ color: primaryColor }}>
                        <Truck className="w-3.5 h-3.5" style={{ color: primaryColor }} /> {store.announcement_header || 'Livraison Offerte dès 25 000 FCFA'}
                    </span>
                    <span className="hidden md:inline text-slate-700">|</span>
                    <span className="hidden md:inline text-slate-300">🔥 Ventes & Offres Solde Exclusives</span>
                </div>

                <div className="flex items-center gap-4 text-slate-300 text-[11px]">
                    <button onClick={handleShareStore} className="hover:text-white flex items-center gap-1 transition-colors">
                        {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                        <span>{copiedLink ? 'Partagé !' : 'Partager la boutique'}</span>
                    </button>
                </div>
            </div>

            {/* 2. MAIN NAVBAR */}
            <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    
                    <a href={`/${store.slug}`} className="flex items-center gap-3 cursor-pointer shrink-0 group">
                        <div 
                            className="w-10 h-10 rounded-2xl font-bold flex items-center justify-center text-sm shadow-2xs overflow-hidden shrink-0 border border-slate-200 group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                        >
                            {store.logo_url ? (
                                <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Store className="w-5 h-5" style={{ color: primaryTextColor }} />
                            )}
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-amber-600 transition-colors">{store.name}</h1>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{store.category || 'Boutique Officielle Certifiée'}</p>
                        </div>
                    </a>

                    <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold">
                        <button
                            onClick={() => handleNavClick('all')}
                            className={`transition-colors hover:text-slate-950 ${activeTab === 'all' && !showBackToStore ? 'text-slate-950 border-b-2 pb-1 font-extrabold' : 'text-slate-600'}`}
                            style={{ borderColor: activeTab === 'all' && !showBackToStore ? primaryColor : 'transparent' }}
                        >
                            Accueil
                        </button>
                        <button
                            onClick={() => handleNavClick('products')}
                            className={`transition-colors hover:text-slate-950 ${activeTab === 'products' && !showBackToStore ? 'text-slate-950 border-b-2 pb-1 font-extrabold' : 'text-slate-600'}`}
                            style={{ borderColor: activeTab === 'products' && !showBackToStore ? primaryColor : 'transparent' }}
                        >
                            Catalogue Produits
                        </button>
                        <button
                            onClick={() => handleNavClick('promo')}
                            className={`transition-colors hover:text-slate-950 flex items-center gap-1 ${activeTab === 'promo' && !showBackToStore ? 'text-slate-950 border-b-2 pb-1 font-extrabold' : 'text-slate-600'}`}
                            style={{ borderColor: activeTab === 'promo' && !showBackToStore ? primaryColor : 'transparent' }}
                        >
                            <Tag className="w-3.5 h-3.5 text-rose-500" />
                            <span>Promotions &amp; Soldes</span>
                        </button>
                        <button
                            onClick={() => handleNavClick('smartlinks')}
                            className={`transition-colors hover:text-slate-950 flex items-center gap-1 ${activeTab === 'smartlinks' && !showBackToStore ? 'text-slate-950 border-b-2 pb-1 font-extrabold' : 'text-slate-600'}`}
                            style={{ borderColor: activeTab === 'smartlinks' && !showBackToStore ? primaryColor : 'transparent' }}
                        >
                            <span>Offres SmartLinks</span>
                        </button>
                        <button
                            onClick={() => handleNavClick('reviews')}
                            className={`transition-colors hover:text-slate-950 flex items-center gap-1 ${activeTab === 'reviews' && !showBackToStore ? 'text-slate-950 border-b-2 pb-1 font-extrabold' : 'text-slate-600'}`}
                            style={{ borderColor: activeTab === 'reviews' && !showBackToStore ? primaryColor : 'transparent' }}
                        >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span>Avis Clients</span>
                        </button>
                        <button
                            onClick={() => handleNavClick('support')}
                            className={`transition-colors hover:text-slate-950 ${activeTab === 'support' && !showBackToStore ? 'text-slate-950 border-b-2 pb-1 font-extrabold' : 'text-slate-600'}`}
                            style={{ borderColor: activeTab === 'support' && !showBackToStore ? primaryColor : 'transparent' }}
                        >
                            Garantie &amp; Support
                        </button>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onOpenCart}
                            className="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-bold shadow-2xs relative border bg-white text-slate-900 border-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                            <ShoppingCart className="w-4 h-4 text-amber-500" />
                            <span>Mon Panier</span>
                            {cartCount > 0 && (
                                <span 
                                    className="px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-2xs"
                                    style={{ backgroundColor: primaryColor, color: primaryTextColor }}
                                >
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>

                </div>
            </div>

            {/* STORE REASSURANCE BAR BELOW NAVBAR */}
            <div className="bg-slate-50 border-b border-slate-200/80 py-2 px-4 text-center">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-[11px] font-medium text-slate-600">
                    <span className="font-extrabold text-slate-950">{store.name} — Boutique Certifiée Propulsée par BIOLINKO</span>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-slate-700 font-semibold">
                        <span className="flex items-center gap-1"><span className="text-amber-500 font-bold">✓</span> Produits Authentiques &amp; Garantis</span>
                        <span className="flex items-center gap-1"><span className="text-amber-500 font-bold">✓</span> Livraison Rapide 24h-48h</span>
                        <span className="flex items-center gap-1"><span className="text-amber-500 font-bold">✓</span> 100% Paiement Sécurisé Mobile Money</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
