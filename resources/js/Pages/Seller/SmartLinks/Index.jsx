import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Zap, Plus, Copy, Check, Share2, Trash2, ToggleLeft, ToggleRight, 
    X, ExternalLink, ArrowUpRight, ShoppingBag, Percent, Tag, Eye, 
    TrendingUp, Calendar, AlertCircle, Sparkles
} from 'lucide-react';

export default function SmartLinksIndex({ smartLinks, products, stats }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    // Form state for creating a new SmartLink
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        discount_type: 'fixed',
        discount_value: 0,
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

    // Calculate real-time totals
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

    const copyLink = (code) => {
        const url = route('smartlink.show', code);
        navigator.clipboard.writeText(url);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const getWhatsAppShareUrl = (sl) => {
        const url = route('smartlink.show', sl.code);
        const text = `🔥 OFFRE SPÉCIALE : ${sl.title} !\nProfitez de notre tarif promo à ${new Intl.NumberFormat('fr-FR').format(sl.total_amount)} FCFA seulement.\nCommandez en 1 clic ici : ${url}`;
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

    return (
        <AuthenticatedLayout>
            <Head title="SmartLinks (Commandes Rapides) - BIOLINKO" />

            <div className="space-y-6 mx-auto pb-12">
                
                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="p-2 rounded-xl bg-amber-100 text-amber-900">
                                <Zap className="w-5 h-5 text-amber-600 fill-amber-500" />
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">SmartLinks Express</h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black tracking-tight">
                                Boost Conversions
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Créez des liens de commande rapide pré-remplis (packs, promotions, remises) et partagez-les en 1 clic sur WhatsApp & les réseaux sociaux.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="px-5 py-3 rounded-2xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-2xs shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Créer un SmartLink</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total SmartLinks</div>
                            <div className="text-2xl font-black text-slate-900">{stats?.total_links || 0}</div>
                            <div className="text-[11px] text-slate-400 mt-1">Offres créées</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600">
                            <Zap className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ventes Générées</div>
                            <div className="text-2xl font-black text-slate-900">{stats?.total_sales || 0}</div>
                            <div className="text-[11px] text-emerald-600 font-semibold mt-1">Commandes en 1-clic</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Chiffre d'Affaires SmartLinks</div>
                            <div className="text-2xl font-black text-slate-900">
                                {new Intl.NumberFormat('fr-FR').format(stats?.total_revenue || 0)} <span className="text-xs font-bold text-amber-600">FCFA</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">CA généré via les liens</div>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600">
                            <Tag className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* SmartLinks Grid / Cards */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider px-1">
                        Vos Liens de Commande Rapide ({smartLinks?.length || 0})
                    </h2>

                    {smartLinks && smartLinks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {smartLinks.map((sl) => (
                                <div 
                                    key={sl.id} 
                                    className={`bg-white rounded-3xl p-6 border transition-all space-y-4 ${
                                        sl.is_active ? 'border-slate-200/80 shadow-2xs hover:border-amber-300' : 'border-slate-200 bg-slate-50/50 opacity-75'
                                    }`}
                                >
                                    {/* SmartLink Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${sl.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                <h3 className="text-base font-bold text-slate-900">{sl.title}</h3>
                                            </div>
                                            <div className="text-xs font-mono text-amber-700 bg-amber-50 inline-block px-2.5 py-0.5 rounded-md font-semibold">
                                                biolinko.app/pay/{sl.code}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleToggleActive(sl.id)}
                                            className="text-slate-400 hover:text-slate-600"
                                            title={sl.is_active ? 'Désactiver le lien' : 'Activer le lien'}
                                        >
                                            {sl.is_active ? (
                                                <ToggleRight className="w-8 h-8 text-emerald-600" />
                                            ) : (
                                                <ToggleLeft className="w-8 h-8 text-slate-400" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Items Included */}
                                    <div className="bg-slate-50 p-3 rounded-2xl space-y-2 border border-slate-100">
                                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Produits Inclus ({sl.items?.length || 0})
                                        </div>
                                        <div className="space-y-1">
                                            {sl.items && sl.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-xs font-medium text-slate-700">
                                                    <span className="truncate">• {item.product_name}</span>
                                                    <span className="font-mono text-slate-500 font-bold shrink-0">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pricing & Discount Details */}
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                                        <div>
                                            <span className="text-slate-400 line-through mr-2">
                                                {new Intl.NumberFormat('fr-FR').format(sl.subtotal_amount)} FCFA
                                            </span>
                                            <span className="font-black text-base text-slate-900">
                                                {new Intl.NumberFormat('fr-FR').format(sl.total_amount)} FCFA
                                            </span>
                                        </div>

                                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                                            {sl.discount_type === 'percent' ? `-${sl.discount_value}%` : `-${new Intl.NumberFormat('fr-FR').format(sl.discount_value)} FCFA`}
                                        </span>
                                    </div>

                                    {/* Stats & Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                                            <span>👀 {sl.views_count || 0} vues</span>
                                            <span>🛍️ {sl.sales_count || 0} ventes</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Copy Link */}
                                            <button
                                                onClick={() => copyLink(sl.code)}
                                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5"
                                                title="Copier le lien"
                                            >
                                                {copiedCode === sl.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                                                <span>{copiedCode === sl.code ? 'Copié !' : 'Copier'}</span>
                                            </button>

                                            {/* Share WhatsApp */}
                                            <a
                                                href={getWhatsAppShareUrl(sl)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
                                                title="Partager sur WhatsApp"
                                            >
                                                <Share2 className="w-4 h-4" />
                                            </a>

                                            {/* Open Public Link */}
                                            <a
                                                href={route('smartlink.show', sl.code)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-2 rounded-xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
                                                title="Ouvrir la page de checkout"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>

                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDelete(sl.id)}
                                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-2xs text-center space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                                <Zap className="w-6 h-6 fill-amber-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-slate-900">Aucun SmartLink créé pour le moment</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto">
                                    Créez des offres packs et des remises express avec des liens uniques à partager directement avec vos clients sur WhatsApp & réseaux sociaux.
                                </p>
                            </div>
                            <button
                                onClick={openCreateModal}
                                className="px-5 py-2.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all inline-flex items-center gap-2 shadow-2xs"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Créer mon premier SmartLink</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE SMARTLINK MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#FFCC00] text-slate-950">
                                    <Zap className="w-5 h-5 fill-slate-950" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Nouveau SmartLink Express</h3>
                                    <p className="text-xs text-slate-500">Sélectionnez les produits et appliquez la réduction</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmitCreate} className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Titre de l'Offre / Pack *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="ex: Pack Promo 2 Parfums + Savon (-15%)"
                                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                />
                                {errors.title && <div className="text-rose-600 text-xs mt-1">{errors.title}</div>}
                            </div>

                            {/* Select Products from Catalogue */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Produits Inclus dans l'Offre *
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
                                                            <div className="text-xs font-bold text-slate-900 truncate">{p.name}</div>
                                                            <div className="text-[11px] text-slate-500">{new Intl.NumberFormat('fr-FR').format(p.price)} FCFA</div>
                                                        </div>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="flex items-center gap-1.5 shrink-0 bg-white border border-slate-200 rounded-xl px-2 py-1">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(p.id, -1); }}
                                                                className="text-slate-500 hover:text-slate-900 font-bold px-1"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="text-xs font-mono font-bold w-4 text-center">{selectedItem.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); handleQuantityChange(p.id, 1); }}
                                                                className="text-slate-500 hover:text-slate-900 font-bold px-1"
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
                                    <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 text-center">
                                        Aucun produit dans votre catalogue. Ajoutez d'abord des produits.
                                    </div>
                                )}
                                {errors.items && <div className="text-rose-600 text-xs mt-1">{errors.items}</div>}
                            </div>

                            {/* Discount Configuration */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Type de Réduction
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
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Valeur de la Réduction
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={data.discount_value}
                                        onChange={(e) => setData('discount_value', e.target.value)}
                                        placeholder={data.discount_type === 'fixed' ? 'ex: 2000' : 'ex: 15'}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold focus:border-amber-400 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Real-time Price Calculation Summary */}
                            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Sous-total Produits :</span>
                                    <span className="font-semibold">{new Intl.NumberFormat('fr-FR').format(calculateSubtotal())} FCFA</span>
                                </div>
                                <div className="flex justify-between text-rose-700 font-medium">
                                    <span>Réduction Appliquée :</span>
                                    <span>-{new Intl.NumberFormat('fr-FR').format(calculateDiscount())} FCFA</span>
                                </div>
                                <div className="flex justify-between text-slate-900 text-sm font-black pt-2 border-t border-amber-200/80">
                                    <span>Prix Final Client :</span>
                                    <span className="text-amber-800">{new Intl.NumberFormat('fr-FR').format(calculateTotal())} FCFA</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || data.items.length === 0}
                                    className="px-6 py-2.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-2xs disabled:opacity-50"
                                >
                                    Générer le SmartLink
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
