import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Package, Search, ShieldCheck, Tag, ExternalLink, AlertCircle, CheckCircle2, Flame
} from 'lucide-react';

export default function ProductsIndex({ products, metrics, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [promo, setPromo] = useState(filters?.promo || 'all');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.products.index'), { search, promo }, { preserveState: true });
    };

    const handlePromoFilter = (newPromo) => {
        setPromo(newPromo);
        router.get(route('admin.products.index'), { search, promo: newPromo }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Catalogue Produits Réseau — Administration BIOLINKO" />

            <div className="space-y-8 font-sans pb-12">
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-slate-950 shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-semibold uppercase tracking-wider">
                            <Package className="w-3.5 h-3.5 text-[#FFCC00]" /> CATALOGUE PRODUITS DU RÉSEAU
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Supervision des Articles ({metrics?.total_products || 0} produits)
                        </h2>
                        <p className="text-xs text-slate-900 font-medium">
                            Surveillez les produits mis en ligne par l'ensemble des vendeurs et modérez l'activation du catalogue.
                        </p>
                    </div>
                </div>

                {/* 4 ALIGNED METRICS CARDS (EXACT CAPTURE 2 STYLE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Produits au Catalogue</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Package className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {metrics?.total_products || 0} produit(s)
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Réseau BIOLINKO
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Produits Actifs</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-emerald-600">
                            {metrics?.active_products || 0} actif(s)
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> En vente
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Produits en Promo</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                                <Flame className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-rose-600">
                            {metrics?.promo_products || 0} promo(s)
                        </div>
                        <div className="text-[11px] text-rose-600 font-semibold">
                            Offres spéciales
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Ruptures de Stock</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Tag className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-amber-700">
                            {metrics?.out_of_stock || 0} rupture(s)
                        </div>
                        <div className="text-[11px] text-amber-700 font-semibold">
                            Stock épuisé
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTER BAR */}
                <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="w-full sm:w-96 relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un produit, une description, une boutique..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
                        {['all', 'promo', 'regular'].map((pr) => (
                            <button
                                key={pr}
                                onClick={() => handlePromoFilter(pr)}
                                className={`px-3 py-1.5 rounded-xl uppercase transition-all cursor-pointer ${
                                    promo === pr 
                                        ? 'bg-slate-950 text-white font-extrabold shadow-2xs' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {pr === 'all' ? 'Tous les produits' : pr === 'promo' ? 'En Promo' : 'Réguliers'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* PRODUCTS TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="py-4 px-6">Produit</th>
                                    <th className="py-4 px-6">Boutique</th>
                                    <th className="py-4 px-6">Prix Vendeur</th>
                                    <th className="py-4 px-6">Prix Client (+2%)</th>
                                    <th className="py-4 px-6">Stock</th>
                                    <th className="py-4 px-6 text-right">Actions Modération</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {products.data && products.data.length > 0 ? (
                                    products.data.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'} 
                                                        alt={p.title} 
                                                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                                                    />
                                                    <div>
                                                        <div className="font-bold text-slate-950 text-sm flex items-center gap-1.5">
                                                            <span>{p.title}</span>
                                                            {p.is_promo && (
                                                                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[9px] font-extrabold">
                                                                    SOLDE
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-slate-400 text-[11px]">Variantes: {p.variants?.length || 0}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-slate-900">{p.store?.name || 'N/A'}</div>
                                                <div className="text-amber-700 font-mono text-[11px]">biolinko.app/{p.store?.slug}</div>
                                            </td>
                                            <td className="py-4 px-6 font-bold text-slate-900">
                                                {Number(p.price_vendor).toLocaleString()} FCFA
                                            </td>
                                            <td className="py-4 px-6 font-extrabold text-amber-700">
                                                {Number(p.price_display || Math.ceil(p.price_vendor * 1.02)).toLocaleString()} FCFA
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                    p.stock > 3 ? 'bg-slate-100 text-slate-800' : 'bg-amber-100 text-amber-900 font-extrabold'
                                                }`}>
                                                    {p.stock} en stock
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-2">
                                                <Link
                                                    href={route('admin.products.toggleActive', p.id)}
                                                    method="post"
                                                    as="button"
                                                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                                                        p.is_active 
                                                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900' 
                                                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    }`}
                                                >
                                                    {p.is_active ? 'Désactiver' : 'Activer'}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                            Aucun produit trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
