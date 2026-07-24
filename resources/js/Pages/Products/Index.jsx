import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, ShoppingBag, Edit, Trash2, Copy, Check, ExternalLink, 
    X, Sparkles, AlertCircle, ArrowRight, Package, Image as ImageIcon, 
    Trophy, TrendingUp, Layers2, Tag, Calendar, AlertTriangle, Search, Filter, ShieldCheck, Zap, UploadCloud, Star, Heart, Truck, Shield
} from 'lucide-react';

export default function Index({ store, products, metrics, appUrl }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [promoProduct, setPromoProduct] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [variantsList, setVariantsList] = useState([]);
    const [variantInput, setVariantInput] = useState({ size: '', color: '', stock_quantity: 10 });
    const [imagePreviews, setImagePreviews] = useState([]);

    // Create Form
    const createForm = useForm({
        title: '',
        description: '',
        price_vendor: '',
        stock: 10,
        min_order_quantity: 1,
        is_promo: false,
        promo_price: '',
        promo_start_at: '',
        promo_end_at: '',
        images_files: [],
        variants: [],
    });

    // Edit Info Form
    const editForm = useForm({
        _method: 'PUT',
        title: '',
        description: '',
        price_vendor: '',
        stock: 10,
        min_order_quantity: 1,
        is_active: true,
        images_files: [],
    });

    // Dedicated Promo Form
    const promoForm = useForm({
        _method: 'PUT',
        title: '',
        price_vendor: '',
        stock: 10,
        min_order_quantity: 1,
        is_active: true,
        is_promo: true,
        promo_price: '',
        promo_start_at: '',
        promo_end_at: '',
    });

    const openEditModal = (product) => {
        setEditingProduct(product);
        editForm.setData({
            _method: 'PUT',
            title: product.title || '',
            description: product.description || '',
            price_vendor: product.price_vendor || '',
            stock: product.stock || 0,
            min_order_quantity: product.min_order_quantity || 1,
            is_active: Boolean(product.is_active),
            images_files: [],
        });
    };

    const openPromoModal = (product) => {
        setPromoProduct(product);
        promoForm.setData({
            _method: 'PUT',
            title: product.title,
            description: product.description || '',
            price_vendor: product.price_vendor,
            stock: product.stock,
            min_order_quantity: product.min_order_quantity || 1,
            is_active: Boolean(product.is_active),
            is_promo: Boolean(product.is_promo),
            promo_price: product.promo_price || '',
            promo_start_at: product.promo_start_at ? product.promo_start_at.substring(0, 10) : '',
            promo_end_at: product.promo_end_at ? product.promo_end_at.substring(0, 10) : '',
        });
    };

    const handleAddVariant = () => {
        if (!variantInput.size && !variantInput.color) return;
        const updated = [...variantsList, { ...variantInput }];
        setVariantsList(updated);
        createForm.setData('variants', updated);
        setVariantInput({ size: '', color: '', stock_quantity: 10 });
    };

    const handleRemoveVariant = (idx) => {
        const updated = variantsList.filter((_, i) => i !== idx);
        setVariantsList(updated);
        createForm.setData('variants', updated);
    };

    const handleCreateImageChange = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        createForm.setData('images_files', files);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('products.store'), {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
                setVariantsList([]);
                setImagePreviews([]);
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingProduct) return;
        editForm.post(route('products.update', editingProduct.id), {
            onSuccess: () => setEditingProduct(null),
        });
    };

    const handlePromoSubmit = (e) => {
        e.preventDefault();
        if (!promoProduct) return;
        promoForm.post(route('products.update', promoProduct.id), {
            onSuccess: () => setPromoProduct(null),
        });
    };

    const handleDeleteProduct = (product) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.title}" ?`)) {
            createForm.delete(route('products.destroy', product.id));
        }
    };

    const handleCopySmartLink = (product) => {
        const url = `${appUrl}/${store.slug}?product=${product.id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(product.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredProducts = products ? products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (filterCategory === 'promo') return matchesSearch && (p.is_promo && p.promo_price);
        if (filterCategory === 'low_stock') return matchesSearch && p.stock <= 3;
        return matchesSearch;
    }) : [];

    const topProduct = metrics?.topProduct || (products && products.length > 0 ? products[0] : null);

    return (
        <AuthenticatedLayout>
            <Head title="Gestion Avancée des Produits — BIOLINKO" />

            <div className="w-full space-y-8 font-sans">
                
                {/* Header Title & Add Product Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                            Centre de Gestion des Produits
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Gérez votre catalogue, appliquez des promotions et téléversez vos visuels réels.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-semibold text-xs shadow-2xs transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nouveau Produit</span>
                    </button>
                </div>

                {/* 4 PRODUCT STATS METRICS CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Articles au Catalogue</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-900 flex items-center justify-center">
                                <ShoppingBag className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-950">
                            {metrics?.totalProducts || 0} produits
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Vitrine Active
                        </div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Valeur du Stock Total</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-900 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-950">
                            {Number(metrics?.totalStockValue || 0).toLocaleString()} FCFA
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">Revenu potentiel stock</div>
                    </div>

                    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Stock Critique (≤3)</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-950">
                            {metrics?.lowStockCount || 0} alerte(s)
                        </div>
                        <div className="text-[11px] text-rose-600 font-semibold">Réapprovisionnement requis</div>
                    </div>

                    <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-white border border-amber-300/80 shadow-2xs flex flex-col justify-between">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-amber-800 uppercase tracking-wider mb-1">
                            <span><Trophy className="w-3 h-3 inline text-amber-600 mr-1" /> Top Produit #1</span>
                        </div>
                        {topProduct ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center text-lg">
                                    {topProduct.image_url ? (
                                        <img src={topProduct.image_url} alt={topProduct.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingBag className="w-5 h-5 text-amber-700" />
                                    )}
                                </div>
                                <div className="truncate">
                                    <div className="text-xs font-semibold text-slate-950 truncate">{topProduct.title}</div>
                                    <div className="text-xs font-semibold text-amber-900">{Number(topProduct.price_vendor).toLocaleString()} FCFA</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 font-medium">Aucune vente enregistrée</div>
                        )}
                    </div>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-80 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un produit par nom..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setFilterCategory('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                filterCategory === 'all' ? 'bg-[#FFCC00] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Tous ({products?.length || 0})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterCategory('promo')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                                filterCategory === 'promo' ? 'bg-[#FFCC00] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Tag className="w-3 h-3" />
                            <span>En Promotion</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterCategory('low_stock')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                                filterCategory === 'low_stock' ? 'bg-[#FFCC00] text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Stock Critique</span>
                        </button>
                    </div>
                </div>

                {/* PRODUCT CARDS GRID WITH STRICT DESCRIPTION LINE-CLAMP & OVERFLOW PROTECTION */}
                {filteredProducts && filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                whileHover={{ y: -3 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col sm:flex-row gap-5 relative group min-w-0"
                            >
                                {/* LEFT IMAGE CONTAINER */}
                                <div className="w-full sm:w-44 h-44 sm:h-48 shrink-0 rounded-3xl bg-slate-100 overflow-hidden relative flex items-center justify-center border border-slate-200/80">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                    ) : product.images && product.images.length > 0 ? (
                                        <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingBag className="w-12 h-12 text-slate-300" />
                                    )}

                                    {/* PROMO BADGE */}
                                    {product.is_promo && product.promo_price && (
                                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FFCC00] text-slate-950 font-bold text-[11px] shadow-2xs flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            <span>PROMO</span>
                                        </div>
                                    )}

                                    {/* Photos Counter Badge */}
                                    {product.images && product.images.length > 1 && (
                                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-slate-950/80 text-white font-medium text-[10px] flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3 text-[#FFCC00]" />
                                            <span>{product.images.length} photos</span>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT PRODUCT INFO & ACTION BUTTON */}
                                <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-1 break-words truncate min-w-0">
                                                {product.title}
                                            </h3>
                                            
                                            {/* Edit & Delete Action Icons */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product)}
                                                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Price Row */}
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            {product.is_promo && product.promo_price ? (
                                                <>
                                                    <span className="text-lg font-bold text-slate-950">
                                                        {Number(product.promo_price).toLocaleString()} FCFA
                                                    </span>
                                                    <span className="text-xs line-through text-slate-400 font-medium">
                                                        {Number(product.price_vendor).toLocaleString()} FCFA
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-lg font-bold text-slate-950">
                                                    {Number(product.price_vendor).toLocaleString()} FCFA
                                                </span>
                                            )}
                                            <span className="text-[10px] text-slate-400 font-medium">(Prix Vendeur)</span>
                                        </div>

                                        {/* Rating & Reviews Stars */}
                                        <div className="flex items-center gap-1.5 pt-0.5">
                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            </div>
                                            <span className="text-[11px] font-semibold text-slate-600">5.0 (13 avis)</span>
                                        </div>

                                        {/* STRICT DESCRIPTION LINE-CLAMP & OVERFLOW CONTROL */}
                                        {product.description && (
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium pt-0.5 break-words overflow-hidden text-ellipsis">
                                                {product.description}
                                            </p>
                                        )}

                                        {/* Badges Box: MoMo Payment & Shipping */}
                                        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-1.5 text-slate-700 font-medium">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                <span className="truncate">Paiement MoMo</span>
                                            </div>
                                            <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-1.5 text-slate-700 font-medium">
                                                <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                <span className="truncate">Livraison Rapide</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PROMOTION BUTTON */}
                                    <div className="pt-2">
                                        <button
                                            onClick={() => openPromoModal(product)}
                                            className={`w-full py-2 rounded-2xl font-semibold text-[11px] transition-all shadow-2xs flex items-center justify-center gap-1.5 ${
                                                product.is_promo
                                                    ? 'bg-[#FFCC00] text-slate-950 hover:bg-amber-300'
                                                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                            }`}
                                        >
                                            <Tag className="w-3.5 h-3.5" />
                                            <span>{product.is_promo ? 'PROMO ACTIVE (MODIFIER)' : 'METTRE EN PROMOTION'}</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-500 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl">
                            <ShoppingBag className="w-6 h-6 text-amber-800" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">Aucun produit dans le catalogue</h3>
                        <p className="text-xs max-w-sm mx-auto text-slate-500 font-medium">
                            Ajoutez votre premier produit avec une photo obligatoire pour commencer vos ventes.
                        </p>
                    </div>
                )}

                {/* MODAL 1: CREATE PRODUCT */}
                <AnimatePresence>
                    {isCreateModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
                            >
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-950">Créer un Nouveau Produit</h3>
                                    <p className="text-xs text-slate-500 font-medium">Complétez la fiche produit avec des images et variantes réelles</p>
                                </div>

                                <form onSubmit={handleCreateSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Titre du Produit *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="ex: Sac en Cuir Artisanal"
                                            value={createForm.data.title}
                                            onChange={(e) => createForm.setData('title', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Description Détaillée *</label>
                                        <textarea
                                            rows="3"
                                            required
                                            placeholder="Description complète de votre article..."
                                            value={createForm.data.description}
                                            onChange={(e) => createForm.setData('description', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Prix Vendeur (FCFA) *</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                placeholder="ex: 15000"
                                                value={createForm.data.price_vendor}
                                                onChange={(e) => createForm.setData('price_vendor', e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Quantité en Stock *</label>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                placeholder="ex: 20"
                                                value={createForm.data.stock}
                                                onChange={(e) => createForm.setData('stock', e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Qte Min Commande *</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                placeholder="ex: 1"
                                                value={createForm.data.min_order_quantity}
                                                onChange={(e) => createForm.setData('min_order_quantity', e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Images du Produit (Jusqu'à 5 photos, max 5MB/photo) *</label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            required
                                            onChange={handleCreateImageChange}
                                            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200"
                                        />

                                        {imagePreviews.length > 0 && (
                                            <div className="flex items-center gap-3 mt-3 overflow-x-auto">
                                                {imagePreviews.map((src, i) => (
                                                    <img key={i} src={src} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="w-full py-3 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all"
                                    >
                                        Enregistrer le Produit au Catalogue
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* MODAL 2: EDIT PRODUCT */}
                <AnimatePresence>
                    {editingProduct && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-xl w-full p-6 sm:p-8 space-y-6 relative"
                            >
                                <button
                                    onClick={() => setEditingProduct(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-950">Modifier le Produit</h3>
                                    <p className="text-xs text-slate-500 font-medium">{editingProduct.title}</p>
                                </div>

                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Titre du Produit *</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.data.title}
                                            onChange={(e) => editForm.setData('title', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                                        <textarea
                                            rows="3"
                                            required
                                            value={editForm.data.description}
                                            onChange={(e) => editForm.setData('description', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Prix Vendeur (FCFA) *</label>
                                            <input
                                                type="number"
                                                required
                                                value={editForm.data.price_vendor}
                                                onChange={(e) => editForm.setData('price_vendor', e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1">Quantité Stock *</label>
                                            <input
                                                type="number"
                                                required
                                                value={editForm.data.stock}
                                                onChange={(e) => editForm.setData('stock', e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="w-full py-3 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all"
                                    >
                                        Mettre à jour les Informations
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* MODAL 3: PROMOTION MANAGEMENT */}
                <AnimatePresence>
                    {promoProduct && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 sm:p-8 space-y-6 relative"
                            >
                                <button
                                    onClick={() => setPromoProduct(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                <div className="space-y-1">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                                        <Tag className="w-3.5 h-3.5" /> GESTION DE PROMOTION
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-950">{promoProduct.title}</h3>
                                </div>

                                <form onSubmit={handlePromoSubmit} className="space-y-4">
                                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                                        Prix Vendeur Normal : <strong>{Number(promoProduct.price_vendor).toLocaleString()} FCFA</strong>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">Activer la Promotion</label>
                                        <select
                                            value={promoForm.data.is_promo ? '1' : '0'}
                                            onChange={(e) => promoForm.setData('is_promo', e.target.value === '1')}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        >
                                            <option value="1">Oui — Mettre en solde</option>
                                            <option value="0">Non — Désactiver la promotion</option>
                                        </select>
                                    </div>

                                    {promoForm.data.is_promo && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">Prix Vendeur Promotionnel (FCFA) *</label>
                                                <input
                                                    type="number"
                                                    required
                                                    placeholder="ex: 12000"
                                                    value={promoForm.data.promo_price}
                                                    onChange={(e) => promoForm.setData('promo_price', e.target.value)}
                                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date Début</label>
                                                    <input
                                                        type="date"
                                                        value={promoForm.data.promo_start_at}
                                                        onChange={(e) => promoForm.setData('promo_start_at', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date Fin</label>
                                                    <input
                                                        type="date"
                                                        value={promoForm.data.promo_end_at}
                                                        onChange={(e) => promoForm.setData('promo_end_at', e.target.value)}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={promoForm.processing}
                                        className="w-full py-3 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all"
                                    >
                                        Enregistrer la Promotion
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </AuthenticatedLayout>
    );
}
