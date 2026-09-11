import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShoppingBag, PackageSearch, Store, ArrowLeft, Home, Sparkles } from 'lucide-react';

export default function ProductUnavailable({ store, productSlug }) {
    const storeName = store?.name || 'la boutique';
    const storeSlug = store?.slug || '';

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between selection:bg-[#FFCC00] selection:text-slate-950 relative overflow-hidden">
            <Head title={`Produit Indisponible — ${storeName} | BIOLINKO`} />

            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-amber-300/20 via-slate-100/10 to-transparent pointer-events-none blur-3xl" />

            {/* HEADER */}
            <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFCC00] text-slate-950 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                        <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black tracking-tight text-slate-950">
                        biolinko<span className="text-[#FFCC00]">.</span>
                    </span>
                </Link>

                {storeSlug && (
                    <Link
                        href={`/${storeSlug}`}
                        className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-800 hover:text-slate-950 px-4 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <Store className="w-4 h-4 text-amber-500" />
                        <span>Boutique {storeName}</span>
                    </Link>
                )}
            </header>

            {/* MAIN CARD */}
            <main className="w-full max-w-2xl mx-auto px-6 py-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="bg-white rounded-[32px] p-8 sm:p-12 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-6"
                >
                    {/* ICON BADGE */}
                    <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-md">
                            <PackageSearch className="w-8 h-8" />
                        </div>
                    </div>

                    {/* STATUS HEADER */}
                    <div className="space-y-2">
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                            Article Épuisé ou Introuvable
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight pt-1">
                            Ce produit n'est plus disponible
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
                            L'article que vous essayez de consulter a peut-être été victime de son succès (rupture de stock), 
                            a été retiré de la vente par <strong>{storeName}</strong> ou le lien est inexact.
                        </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {storeSlug ? (
                            <Link
                                href={`/${storeSlug}`}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-200/60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <Store className="w-4 h-4" />
                                <span>Voir tous les produits de {storeName}</span>
                            </Link>
                        ) : (
                            <Link
                                href="/"
                                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-200/60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <Home className="w-4 h-4" />
                                <span>Accueil Biolinko</span>
                            </Link>
                        )}

                        <Link
                            href="/"
                            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            <Home className="w-4 h-4 text-slate-600" />
                            <span>Explorer d'autres boutiques</span>
                        </Link>
                    </div>

                    {/* STORE BADGE */}
                    {storeSlug && (
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-3 text-xs text-slate-500 font-medium">
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Découvrez d'autres pépites et promotions sur la vitrine officielle de <strong>{storeName}</strong>.</span>
                        </div>
                    )}
                </motion.div>
            </main>

            {/* FOOTER */}
            <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-400 font-medium">
                © {new Date().getFullYear()} BIOLINKO — Propulsé avec passion pour le commerce digital.
            </footer>
        </div>
    );
}
