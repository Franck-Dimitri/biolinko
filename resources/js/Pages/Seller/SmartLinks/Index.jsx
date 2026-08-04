import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Zap, Plus, Copy, Check, Share2, Trash2, ToggleLeft, ToggleRight, 
    X, ExternalLink, ArrowUpRight, ShoppingBag, Percent, Tag, Eye, 
    TrendingUp, Calendar, AlertCircle, Sparkles, Trophy, PieChart
} from 'lucide-react';

export default function SmartLinksIndex({ smartLinks, topSmartLinks, products, stats }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);
    const { store } = usePage().props;

    // Form state for creating a new SmartLink
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        discount_type: 'fixed',
        discount_value: '',
        max_uses: '',
        expires_at: '',
        items: [], // Array of { product_id, quantity }
    });

    const openCreateModal = () => {
        reset();
        setIsCreateModalOpen(true);
    };

    const handleProductToggle = (product) => {
        const existingIndex = data.items.findIndex(i => i.product_id === product.id);
        if (existingIndex > -1) {
            const updated = [...data.items];
            updated.splice(existingIndex, 1);
            setData('items', updated);
        } else {
            setData('items', [
                ...data.items,
                { product_id: product.id, quantity: 1, unit_price: parseFloat(product.price), name: product.name, image_url: product.image_url }
            ]);
        }
    };

    const handleQuantityChange = (productId, delta) => {
        const updated = data.items.map(item => {
            if (item.product_id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setData('items', updated);
    };

    const calculateSubtotal = () => {
        return data.items.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    };

    const calculateDiscount = () => {
        const subtotal = calculateSubtotal();
        const val = parseFloat(data.discount_value) || 0;
        if (data.discount_type === 'percent') {
            return subtotal * (Math.min(100, val) / 100);
        }
        return Math.min(subtotal, val);
    };

    const calculateTotal = () => {
        return Math.max(0, calculateSubtotal() - calculateDiscount());
    };

    const handleSubmitCreate = (e) => {
        e.preventDefault();
        post(route('seller.smartlinks.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                reset();
            }
        });
    };

    const getSmartLinkFullUrl = (code) => {
        const origin = window.location.origin;
        return `${origin}/store/${store?.slug || 'shop'}/pay/sl/${code}`;
    };

    const copyLink = (code) => {
        const url = getSmartLinkFullUrl(code);
        navigator.clipboard.writeText(url);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const getWhatsAppShareUrl = (sl) => {
        const url = getSmartLinkFullUrl(sl.code);
        const text = `OFFRE DE LA BOUTIQUE ${store?.name || ''} : ${sl.title} !\nProfitez de ce tarif à ${Number(sl.total_amount).toLocaleString()} FCFA.\nCommandez directement ici : ${url}`;
        return `https://wa.me/?text=${encodeURIComponent(text)}`;
    };

    const handleToggleActive = (smartLinkId) => {
        router.patch(route('seller.smartlinks.toggle', smartLinkId), {}, { preserveScroll: true });
    };

    const handleDelete = (smartLinkId) => {
        if (confirm('Voulez-vous vraiment supprimer ce SmartLink ?')) {
            router.delete(route('seller.smartlinks.destroy', smartLinkId), { preserveScroll: true });
        }
    };

    // Prepare Circular Donut Chart Data
    const totalSalesCount = (smartLinks || []).reduce((sum, sl) => sum + (sl.sales_count || 0), 0);
    const sliceColors = ['#FFCC00', '#10B981', '#3B82F6', '#F43F5E', '#8B5CF6'];
    
    let cumulativePercent = 0;
    const donutSlices = (smartLinks || [])
        .filter(sl => (sl.sales_count || 0) > 0)
        .slice(0, 5)
        .map((sl, idx) => {
            const count = sl.sales_count || 0;
            const percent = totalSalesCount > 0 ? (count / totalSalesCount) * 100 : 0;
            const startPercent = cumulativePercent;
            cumulativePercent += percent;
            return {
                id: sl.id,
                title: sl.title,
                count: count,
                percent: Math.round(percent),
                startPercent: startPercent,
                color: sliceColors[idx % sliceColors.length],
            };
        });

    const circumference = 2 * Math.PI * 60; // r=60 => ~376.99

    return (
        <AuthenticatedLayout>
            <Head title="SmartLinks Express — BIOLINKO" />

            <div className="space-y-6 mx-auto pb-12 font-sans">
                
                {/* 1. HEADER BANNER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 font-bold">
                                <Zap className="w-5 h-5 text-amber-600 fill-amber-500" />
                            </div>
                            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">SmartLinks Express</h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold tracking-tight">
                                Boost Conversions
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Créez des liens de commande rapide pré-remplis et partagez-les en 1 clic sur WhatsApp et réseaux sociaux.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="px-5 py-3 rounded-2xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs shrink-0 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Créer un SmartLink</span>
                    </button>
                </div>

                {/* 2. STATS CARDS (CLEAN 3-COLUMN LAYOUT) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total SmartLinks</div>
                            <div className="text-2xl font-extrabold text-slate-950">{stats?.total_links || 0}</div>
                            <div className="text-[11px] text-slate-400 font-medium mt-1">Offres actives & archivées</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60">
                            <Zap className="w-6 h-6 fill-amber-500" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ventes Générées</div>
                            <div className="text-2xl font-extrabold text-slate-950">{stats?.total_sales || 0}</div>
                            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Commandes directes 1-clic</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chiffre d'Affaires SmartLinks</div>
                            <div className="text-2xl font-extrabold text-slate-950">
                                {Number(stats?.total_revenue || 0).toLocaleString()} <span className="text-xs font-bold text-amber-600">FCFA</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-1">Revenus cumulés via liens</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200/60">
                            <Tag className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* 3. VISUAL ANALYTICS ROW (CIRCULAR DONUT STATS + TOP 5 SMARTLINKS) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT: MODERN CIRCULAR DONUT STATS CHART (7 COLS) */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-amber-500" />
                                <h3 className="font-extrabold text-sm text-slate-950">Statistiques Visuelles Circulaires</h3>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Répartition des Ventes</span>
                        </div>

                        {donutSlices.length > 0 ? (
                            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
                                {/* SVG Donut Chart */}
                                <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="60"
                                            fill="transparent"
                                            stroke="#F1F5F9"
                                            strokeWidth="16"
                                        />
                                        {donutSlices.map((slice, i) => {
                                            const strokeDasharray = `${(slice.percent / 100) * circumference} ${circumference}`;
                                            const strokeDashoffset = -((slice.startPercent / 100) * circumference);

                                            return (
                                                <circle
                                                    key={i}
                                                    cx="80"
                                                    cy="80"
                                                    r="60"
                                                    fill="transparent"
                                                    stroke={slice.color}
                                                    strokeWidth="16"
                                                    strokeDasharray={strokeDasharray}
                                                    strokeDashoffset={strokeDashoffset}
                                                    className="transition-all duration-700 ease-out"
                                                />
                                            );
                                        })}
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <div className="text-2xl font-extrabold text-slate-950">{totalSalesCount}</div>
                                        <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Ventes Totales</div>
                                    </div>
                                </div>

                                {/* Legend List */}
                                <div className="space-y-2.5 flex-1 w-full">
                                    {donutSlices.map((slice, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-2 min-w-0 pr-2">
                                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
                                                <span className="font-bold text-slate-900 truncate">{slice.title}</span>
                                            </div>
                                            <div className="font-mono text-slate-950 font-extrabold shrink-0">
                                                {slice.count} ({slice.percent}%)
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 text-center space-y-2">
                                <PieChart className="w-10 h-10 text-slate-300 mx-auto" />
                                <div className="text-xs text-slate-400 font-medium">
                                    Aucune vente enregistrée sur vos liens pour générer le graphique circulaire.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: TOP 5 SMARTLINKS LEADERBOARD (5 COLS) */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-500" />
                                <h3 className="font-extrabold text-sm text-slate-950">Top 5 SmartLinks Performants</h3>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">Classement</span>
                        </div>

                        {topSmartLinks && topSmartLinks.length > 0 ? (
                            <div className="space-y-2.5">
                                {topSmartLinks.map((sl, index) => (
                                    <div key={sl.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                                                #{index + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <div className="font-bold text-xs text-slate-950 truncate">{sl.title}</div>
                                                <div className="text-[11px] text-slate-500 font-medium">{Number(sl.total_amount).toLocaleString()} FCFA</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0 border border-emerald-200">
                                            {sl.sales_count || 0} vente(s)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-xs text-slate-400 font-medium">
                                Aucun SmartLink classé pour le moment.
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. MAIN SMARTLINKS CARDS GRID (ROWS OF 3 CARDS PER ROW) */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                        Tous les Liens SmartLinks ({smartLinks?.length || 0})
                    </h2>

                    {smartLinks && smartLinks.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {smartLinks.map((sl) => {
                                const fullUrl = getSmartLinkFullUrl(sl.code);

                                return (
                                    <div 
                                        key={sl.id} 
                                        className={`bg-white rounded-3xl p-5 border transition-all space-y-4 flex flex-col justify-between ${
                                            sl.is_active ? 'border-slate-200/80 shadow-2xs hover:border-amber-300' : 'border-slate-200 bg-slate-50/50 opacity-75'
                                        }`}
                                    >
                                        {/* SmartLink Card Header */}
                                        <div className="space-y-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2 h-2 rounded-full shrink-0 ${sl.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                        <h3 className="text-base font-bold text-slate-950 truncate">{sl.title}</h3>
                                                    </div>
                                                    <div className="text-[11px] font-mono text-slate-700 bg-slate-100 inline-block px-2 py-0.5 rounded-lg border border-slate-200 truncate max-w-full">
                                                        /store/{store?.slug}/pay/sl/{sl.code}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleToggleActive(sl.id)}
                                                    className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
                                                    title={sl.is_active ? 'Désactiver le lien' : 'Activer le lien'}
                                                >
                                                    {sl.is_active ? (
                                                        <ToggleRight className="w-7 h-7 text-emerald-600" />
                                                    ) : (
                                                        <ToggleLeft className="w-7 h-7 text-slate-400" />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Items Included */}
                                            <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 border border-slate-100">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Articles Inclus ({sl.items?.length || 0})
                                                </div>
                                                <div className="space-y-1">
                                                    {sl.items && sl.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-xs font-medium text-slate-700">
                                                            <span className="truncate">• {item.product_name}</span>
                                                            <span className="font-mono text-slate-950 font-bold shrink-0">x{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-2 border-t border-slate-100">
                                            {/* Pricing Details */}
                                            <div className="flex items-center justify-between text-xs">
                                                <div>
                                                    {sl.subtotal_amount > sl.total_amount && (
                                                        <span className="text-slate-400 line-through mr-2">
                                                            {Number(sl.subtotal_amount).toLocaleString()} FCFA
                                                        </span>
                                                    )}
                                                    <span className="font-extrabold text-base text-slate-950">
                                                        {Number(sl.total_amount).toLocaleString()} FCFA
                                                    </span>
                                                </div>

                                                {sl.discount_value > 0 && (
                                                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                                                        {sl.discount_type === 'percent' ? `-${sl.discount_value}%` : `-${Number(sl.discount_value).toLocaleString()} F`}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Actions & Metrics Footer */}
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                                                    <span>{sl.views_count || 0} vues</span>
                                                    <span>{sl.sales_count || 0} ventes</span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => copyLink(sl.code)}
                                                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                                                        title="Copier le lien"
                                                    >
                                                        {copiedCode === sl.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
                                                        <span>{copiedCode === sl.code ? 'Copié' : 'Copier'}</span>
                                                    </button>

                                                    <a
                                                        href={getWhatsAppShareUrl(sl)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-2xs"
                                                        title="Partager sur WhatsApp"
                                                    >
                                                        <Share2 className="w-3.5 h-3.5" />
                                                    </a>

                                                    <a
                                                        href={fullUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition-all"
                                                        title="Ouvrir la page de checkout"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>

                                                    <button
                                                        onClick={() => handleDelete(sl.id)}
                                                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-2xs text-center space-y-4">
                            <Zap className="w-8 h-8 text-slate-300 mx-auto" />
                            <h3 className="text-sm font-bold text-slate-900">Aucun SmartLink créé pour le moment.</h3>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE SMARTLINK MODAL WITH OPTIONAL DISCOUNT */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#FFCC00] text-slate-950 font-bold">
                                    <Zap className="w-5 h-5 fill-slate-950" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-950">Nouveau SmartLink Express</h3>
                                    <p className="text-xs text-slate-500 font-medium">Sélectionnez les produits (la réduction est facultative)</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCreate} className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-950 uppercase tracking-wider mb-2">
                                    Titre de l'Offre / Pack *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="ex: Pack Offre Spéciale Vendeur"
                                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                />
                                {errors.title && <div className="text-rose-600 text-xs mt-1">{errors.title}</div>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-950 uppercase tracking-wider mb-2">
                                    Produits Inclus *
                                </label>

                                {products && products.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                                        {products.map((p) => {
                                            const selectedItem = data.items.find(i => i.product_id === p.id);
                                            const isSelected = !!selectedItem;

                                            return (
                                                <div 
                                                    key={p.id}
                                                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                                                        isSelected ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 truncate pr-2" onClick={() => handleProductToggle(p)}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={() => {}}
                                                            className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                                                        />
                                                        <div className="truncate">
                                                            <div className="text-xs font-bold text-slate-950 truncate">{p.name}</div>
                                                            <div className="text-[11px] text-slate-500">{Number(p.price).toLocaleString()} FCFA</div>
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-xl px-2 py-1">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(p.id, -1); }}
                                                                className="text-slate-500 hover:text-slate-950 font-bold px-1 cursor-pointer"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="text-xs font-mono font-bold w-4 text-center">{selectedItem.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(p.id, 1); }}
                                                                className="text-slate-500 hover:text-slate-950 font-bold px-1 cursor-pointer"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 text-center font-medium">
                                        Aucun produit dans le catalogue.
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                <div>
                                    <label className="block text-xs font-bold text-slate-950 uppercase tracking-wider mb-2">
                                        Type de Réduction (Facultatif)
                                    </label>
                                    <select
                                        value={data.discount_type}
                                        onChange={(e) => setData('discount_type', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold focus:border-amber-400 outline-none"
                                    >
                                        <option value="fixed">Montant Fixe (FCFA)</option>
                                        <option value="percent">Pourcentage (%)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-950 uppercase tracking-wider mb-2">
                                        Valeur de Réduction (Optionnelle)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={data.discount_value}
                                        onChange={(e) => setData('discount_value', e.target.value)}
                                        placeholder="Laisser vide si pas de réduction"
                                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold focus:border-amber-400 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2 text-xs font-medium">
                                <div className="flex justify-between text-slate-600">
                                    <span>Sous-total Produits :</span>
                                    <span className="font-bold text-slate-950">{Number(calculateSubtotal()).toLocaleString()} FCFA</span>
                                </div>
                                <div className="flex justify-between text-rose-700 font-medium">
                                    <span>Réduction :</span>
                                    <span>-{Number(calculateDiscount()).toLocaleString()} FCFA</span>
                                </div>
                                <div className="flex justify-between text-slate-950 text-sm font-extrabold pt-2 border-t border-amber-200">
                                    <span>Prix Total Client :</span>
                                    <span className="text-amber-900">{Number(calculateTotal()).toLocaleString()} FCFA</span>
                                </div>
                            </div>

                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || data.items.length === 0}
                                    className="px-6 py-2.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Création...' : 'Générer le SmartLink'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
