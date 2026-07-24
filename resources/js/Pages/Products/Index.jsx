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

    // Edit Info Form (Separate)
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

    // Dedicated Promo Form (Separate)
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

            {/* FULL-WIDTH CONTAINER (REMOVED RESTRICTIVE MAX-WIDTH) */}
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

                {/* PRODUCT CARDS GRID BASED ON ATTACHED DESIGN IMAGE 2 */}
                {filteredProducts && filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                whileHover={{ y: -3 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col sm:flex-row gap-5 relative group"
                            >
                                {/* LEFT IMAGE CONTAINER (ROUNDED SQUARE AS IN ATTACHED DESIGN IMAGE 2) */}
                                <div className="w-full sm:w-48 h-48 sm:h-52 shrink-0 rounded-3xl bg-slate-100 overflow-hidden relative flex items-center justify-center border border-slate-200/80">
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

                                {/* RIGHT PRODUCT INFO & ACTION BUTTON (EXACTLY AS IMAGE 2) */}
                                <div className="flex-1 flex flex-col justify-between space-y-3">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-900 text-lg leading-snug">
                                                {product.title}
                                            </h3>
                                            
                                            {/* Edit & Delete Action Icons */}
                                            <div className="flex items-center gap-1">
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
                                        <div className="flex items-baseline gap-2">
                                            {product.is_promo && product.promo_price ? (
                                                <>
                                                    <span className="text-xl font-bold text-slate-950">
                                                        {Number(product.promo_price).toLocaleString()} FCFA
                                                    </span>
                                                    <span className="text-xs line-through text-slate-400 font-medium">
                                                        {Number(product.price_vendor).toLocaleString()} FCFA
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-xl font-bold text-slate-950">
                                                    {Number(product.price_vendor).toLocaleString()} FCFA
                                                </span>
                                            )}
                                            <span className="text-[11px] text-slate-400 font-medium">(Prix Vendeur)</span>
                                        </div>

                                        {/* Rating & Reviews Stars (SVG Icons as in Image 2) */}
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

                                        {product.description && (
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium pt-1">
                                                {product.description}
                                            </p>
                                        )}

                                        {/* Badges Box: MoMo Payment & Shipping (As in Image 2) */}
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

                                    {/* PROMOTION BUTTON (REPLACES WISHLIST BUTTON AS REQUESTED) */}
                                    <div className="pt-2">
                                        <button
                                            onClick={() => openPromoModal(product)}
                                            className={`w-full py-2.5 rounded-2xl font-semibold text-xs transition-all shadow-2xs flex items-center justify-center gap-2 ${
                                                product.is_promo
                                                    ? 'bg-[#FFCC00] text-slate-950 hover:bg-amber-300'
                                                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                            }`}
                                        >
                                            <Tag className="w-4 h-4" />
                                            <span>{product.is_promo ? 'PROMOTION ACTIVE (MODIFIER)' : 'METTRE EN PROMOTION'}</span>
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

            </div>

            {/* CREATE PRODUCT MODAL */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 relative my-8"
                        >
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-[#FFCC00] flex items-center justify-center text-slate-950 font-semibold">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">Nouveau Produit au Catalogue</h3>
                                    <p className="text-xs text-slate-500 font-medium">Téléversement de photos réelles obligatoire</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-4" encType="multipart/form-data">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Titre du Produit <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.title}
                                        required
                                        placeholder="ex: Sac à Main en Cuir Italien"
                                        onChange={(e) => createForm.setData('title', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                {/* CUSTOM VISIBLE SQUARE DROPZONE */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Photos du Produit (Zone de dépôt carrée — 1 à 5 photos max, Obligatoire) <span className="text-rose-500">*</span>
                                    </label>

                                    <div className="relative">
                                        <input
                                            type="file"
                                            required
                                            multiple
                                            accept="image/*"
                                            onChange={handleCreateImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                                        />
                                        <div className="w-full h-40 rounded-3xl border-2 border-dashed border-amber-400/80 bg-amber-50/50 flex flex-col items-center justify-center text-center p-4 hover:bg-amber-100/60 transition-all cursor-pointer space-y-2">
                                            <div className="w-12 h-12 rounded-2xl bg-[#FFCC00] text-slate-950 flex items-center justify-center shadow-2xs">
                                                <UploadCloud className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-slate-950">
                                                    Cliquez ou glissez-déposez vos photos réelles ici
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                    Format PNG, JPG, WEBP (1 à 5 fichiers max, obligatoire)
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {imagePreviews.length > 0 && (
                                        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
                                            {imagePreviews.map((src, idx) => (
                                                <div key={idx} className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                                                    <img src={src} alt="Aperçu" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Prix Vendeur (FCFA) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={createForm.data.price_vendor}
                                            required
                                            placeholder="15000"
                                            onChange={(e) => createForm.setData('price_vendor', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Quantité Stock <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={createForm.data.stock}
                                            required
                                            onChange={(e) => createForm.setData('stock', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Qte Min Commande
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={createForm.data.min_order_quantity}
                                            onChange={(e) => createForm.setData('min_order_quantity', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description Détaillée</label>
                                    <textarea
                                        rows={3}
                                        value={createForm.data.description}
                                        placeholder="Description du produit, matières, conseils d'entretien..."
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="px-6 py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 active:scale-95 text-slate-950 font-semibold text-xs shadow-2xs transition-all"
                                    >
                                        Enregistrer le Produit
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SEPARATE EDIT PRODUCT MODAL */}
            <AnimatePresence>
                {editingProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 relative my-8"
                        >
                            <button
                                onClick={() => setEditingProduct(null)}
                                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-900 font-semibold">
                                    <Edit className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">Modifier les Informations du Produit</h3>
                                    <p className="text-xs text-slate-500 font-medium">Informations du produit pré-remplies</p>
                                </div>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-4" encType="multipart/form-data">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Titre du Produit <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.title}
                                        required
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Prix Vendeur (FCFA) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.data.price_vendor}
                                            required
                                            onChange={(e) => editForm.setData('price_vendor', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Quantité Stock <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.data.stock}
                                            required
                                            onChange={(e) => editForm.setData('stock', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                                            Qte Min Commande
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={editForm.data.min_order_quantity}
                                            onChange={(e) => editForm.setData('min_order_quantity', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description Détaillée</label>
                                    <textarea
                                        rows={3}
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setEditingProduct(null)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="px-6 py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 active:scale-95 text-slate-950 font-semibold text-xs shadow-2xs transition-all"
                                    >
                                        Enregistrer les Modifications
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SEPARATE DEDICATED PROMOTION MODAL */}
            <AnimatePresence>
                {promoProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 relative my-8"
                        >
                            <button
                                onClick={() => setPromoProduct(null)}
                                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-[#FFCC00] flex items-center justify-center text-slate-950 font-semibold">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900">Gestion de la Promotion</h3>
                                    <p className="text-xs text-slate-500 font-medium">{promoProduct.title}</p>
                                </div>
                            </div>

                            <form onSubmit={handlePromoSubmit} className="space-y-4">
                                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="dedicated_is_promo"
                                            checked={promoForm.data.is_promo}
                                            onChange={(e) => promoForm.setData('is_promo', e.target.checked)}
                                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                                        />
                                        <label htmlFor="dedicated_is_promo" className="text-xs font-bold text-slate-900 cursor-pointer">
                                            Activer la Promotion / Solde sur ce produit
                                        </label>
                                    </div>

                                    {promoForm.data.is_promo && (
                                        <div className="space-y-3 pt-2">
                                            <div className="text-xs text-slate-500">
                                                Prix Normal Actuel : <span className="font-semibold text-slate-900">{Number(promoProduct.price_vendor).toLocaleString()} FCFA</span>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                                    Nouveau Prix Promo Réduit (FCFA) <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    required={promoForm.data.is_promo}
                                                    value={promoForm.data.promo_price}
                                                    placeholder="ex: 12000"
                                                    onChange={(e) => promoForm.setData('promo_price', e.target.value)}
                                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none bg-white"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date Début</label>
                                                    <input
                                                        type="date"
                                                        value={promoForm.data.promo_start_at}
                                                        onChange={(e) => promoForm.setData('promo_start_at', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none bg-white"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date Échéance (Fin)</label>
                                                    <input
                                                        type="date"
                                                        value={promoForm.data.promo_end_at}
                                                        onChange={(e) => promoForm.setData('promo_end_at', e.target.value)}
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none bg-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPromoProduct(null)}
                                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={promoForm.processing}
                                        className="px-6 py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 active:scale-95 text-slate-950 font-semibold text-xs shadow-2xs transition-all"
                                    >
                                        Appliquer la Promotion
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AuthenticatedLayout>
    );
}
