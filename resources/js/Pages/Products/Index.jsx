import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, ShoppingBag, Edit, Trash2, Copy, Check, ExternalLink, 
    X, Sparkles, AlertCircle, ArrowRight, Package, Image as ImageIcon, 
    Trophy, TrendingUp, Layers2, Tag, Calendar, AlertTriangle, Search, Filter, ShieldCheck, Zap, UploadCloud, Star, Heart, Truck, Shield, Eye
} from 'lucide-react';

export default function Index({ store, products, metrics, appUrl }) {
    const user = usePage().props.auth.user;
    const userPlan = user?.plan || 'starter';

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Multi-Image Preview States
    const [createImagePreviews, setCreateImagePreviews] = useState([]);
    const [editImagePreviews, setEditImagePreviews] = useState([]);

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
        is_active: true,
        images_files: [],
        variants: [],
    });

    // Unified Edit Form
    const editForm = useForm({
        title: '',
        description: '',
        price_vendor: '',
        stock: 10,
        min_order_quantity: 1,
        is_promo: false,
        promo_price: '',
        promo_start_at: '',
        promo_end_at: '',
        is_active: true,
        images_files: [],
        variants: [],
    });

    const openEditModal = (product) => {
        setEditingProduct(product);
        const existingImgs = product.images && product.images.length > 0 
            ? product.images 
            : [product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'];
        
        setEditImagePreviews(existingImgs);
        editForm.clearErrors();
        editForm.setData({
            title: product.title || '',
            description: product.description || '',
            price_vendor: product.price_vendor || '',
            stock: product.stock ?? 10,
            min_order_quantity: product.min_order_quantity || 1,
            is_promo: Boolean(product.is_promo),
            promo_price: product.promo_price || '',
            promo_start_at: product.promo_start_at ? product.promo_start_at.substring(0, 10) : '',
            promo_end_at: product.promo_end_at ? product.promo_end_at.substring(0, 10) : '',
            is_active: Boolean(product.is_active),
            images_files: [],
            variants: product.variants ? product.variants.map(v => ({
                id: v.id,
                name: v.name || '',
                size: v.size || '',
                color: v.color || '',
                price: v.price || '',
                stock_quantity: v.stock_quantity ?? 10
            })) : [],
        });
    };

    // Quick stock replenishment
    const handleQuickStockAdd = (product, amountToAdd = 10) => {
        const newStock = Number(product.stock || 0) + amountToAdd;
        editForm.setData({
            title: product.title,
            description: product.description || '',
            price_vendor: product.price_vendor,
            stock: newStock,
            min_order_quantity: product.min_order_quantity || 1,
            is_promo: Boolean(product.is_promo),
            promo_price: product.promo_price || '',
            promo_start_at: product.promo_start_at ? product.promo_start_at.substring(0, 10) : '',
            promo_end_at: product.promo_end_at ? product.promo_end_at.substring(0, 10) : '',
            is_active: Boolean(product.is_active),
            images_files: [],
            variants: product.variants ? product.variants.map(v => ({
                id: v.id,
                name: v.name || '',
                size: v.size || '',
                color: v.color || '',
                price: v.price || '',
                stock_quantity: v.stock_quantity ?? 10
            })) : [],
        });

        editForm.put(route('products.update', product.id), {
            preserveScroll: true,
            onSuccess: () => {
                setToastMessage(`Stock réassorti (+${amountToAdd} unités) pour "${product.title}" !`);
                setTimeout(() => setToastMessage(null), 3500);
            },
        });
    };

    // Create Image Handlers
    const handleCreateImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const currentFiles = createForm.data.images_files || [];
        const newFilesList = [...currentFiles, ...files].slice(0, 5);
        createForm.setData('images_files', newFilesList);

        const newPreviews = newFilesList.map(f => typeof f === 'string' ? f : URL.createObjectURL(f));
        setCreateImagePreviews(newPreviews);
    };

    const handleRemoveCreateImage = (index) => {
        const updatedFiles = createForm.data.images_files.filter((_, i) => i !== index);
        createForm.setData('images_files', updatedFiles);
        const updatedPreviews = createImagePreviews.filter((_, i) => i !== index);
        setCreateImagePreviews(updatedPreviews);
    };

    // Edit Image Handlers
    const handleEditImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const currentFiles = editForm.data.images_files || [];
        const newFilesList = [...currentFiles, ...files].slice(0, 5);
        editForm.setData('images_files', newFilesList);

        const newPreviews = files.map(f => URL.createObjectURL(f));
        setEditImagePreviews([...editImagePreviews, ...newPreviews].slice(0, 5));
    };

    // Variant Helpers
    const addCreateVariantRow = () => {
        const current = createForm.data.variants || [];
        if (userPlan === 'starter' && current.length >= 1) {
            alert("La formule STARTER est limitée à 1 variante par produit. Passez au plan PRO pour ajouter des variantes illimitées.");
            return;
        }
        createForm.setData('variants', [
            ...current,
            { name: '', size: '', color: '', price: '', stock_quantity: 10 }
        ]);
    };

    const removeCreateVariantRow = (index) => {
        const current = createForm.data.variants || [];
        createForm.setData('variants', current.filter((_, i) => i !== index));
    };

    const updateCreateVariantRow = (index, field, value) => {
        const current = [...(createForm.data.variants || [])];
        current[index] = { ...current[index], [field]: value };
        createForm.setData('variants', current);
    };

    const addEditVariantRow = () => {
        const current = editForm.data.variants || [];
        if (userPlan === 'starter' && current.length >= 1) {
            alert("La formule STARTER est limitée à 1 variante par produit. Passez au plan PRO pour ajouter des variantes illimitées.");
            return;
        }
        editForm.setData('variants', [
            ...current,
            { name: '', size: '', color: '', price: '', stock_quantity: 10 }
        ]);
    };

    const removeEditVariantRow = (index) => {
        const current = editForm.data.variants || [];
        editForm.setData('variants', current.filter((_, i) => i !== index));
    };

    const updateEditVariantRow = (index, field, value) => {
        const current = [...(editForm.data.variants || [])];
        current[index] = { ...current[index], [field]: value };
        editForm.setData('variants', current);
    };

    // Submissions
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post(route('products.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
                setCreateImagePreviews([]);
                setToastMessage('Nouveau produit ajouté au catalogue !');
                setTimeout(() => setToastMessage(null), 3500);
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingProduct) return;
        editForm.post(route('products.update.post', editingProduct.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setEditingProduct(null);
                setToastMessage('Fiche produit mise à jour avec succès !');
                setTimeout(() => setToastMessage(null), 3500);
            },
        });
    };

    const handleDeleteProduct = (product) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.title}" ?`)) {
            createForm.delete(route('products.destroy', product.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setToastMessage('Produit supprimé du catalogue.');
                    setTimeout(() => setToastMessage(null), 3500);
                },
            });
        }
    };

    const handleCopyDirectLink = (product) => {
        const directUrl = `${appUrl}/${store.slug}/p/${product.slug}`;
        navigator.clipboard.writeText(directUrl);
        setCopiedId(product.id);
        setToastMessage('Lien direct vers le produit copié !');
        setTimeout(() => setCopiedId(null), 2000);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const filteredProducts = products ? products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
        if (filterCategory === 'promo') return matchesSearch && (p.is_promo && p.promo_price);
        if (filterCategory === 'low_stock') return matchesSearch && p.stock <= 3;
        return matchesSearch;
    }) : [];

    const topProduct = metrics?.topProduct || (products && products.length > 0 ? products[0] : null);

    return (
        <AuthenticatedLayout>
            <Head title="Gestion Avancée des Produits — BIOLINKO" />

            {/* TOAST NOTIFICATION BANNER */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-950 text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-slate-800"
                    >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full space-y-8 font-sans">
                
                {/* Header Title & Add Product Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                            Centre de Gestion des Produits
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Gérez votre catalogue, vos prix, vos variantes et téléversez vos visuels réels.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            createForm.reset();
                            setCreateImagePreviews([]);
                            setIsCreateModalOpen(true);
                        }}
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
                            <div className="text-xs text-slate-400 font-medium">Aucun produit en stock</div>
                        )}
                    </div>
                </div>

                {/* SUBSCRIPTION PLAN QUOTA INDICATOR BANNER */}
                <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold text-sm shrink-0">
                            <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                                    ABONNEMENT {userPlan.toUpperCase()}
                                </span>
                                {userPlan === 'starter' && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-bold border border-amber-400/20">
                                        Pack Gratuit
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-300 font-medium">
                                Limites du plan : <strong className="text-white">{products ? products.length : 0} / {userPlan === 'starter' ? 10 : userPlan === 'pro' ? 50 : userPlan === 'growth' ? 200 : 'Illimité'}</strong> produits • Stock cumulé total : <strong className="text-white">{(products || []).reduce((acc, p) => acc + Number(p.stock || 0), 0)} / {userPlan === 'starter' ? 25 : userPlan === 'pro' ? 500 : userPlan === 'growth' ? 2500 : 'Illimité'}</strong> articles.
                            </p>
                        </div>
                    </div>
                    {userPlan === 'starter' && (
                        <a
                            href={route('seller.subscriptions.index')}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-extrabold text-xs shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
                        >
                            <span>Passer au Plan PRO</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-80 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher par nom de produit..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setFilterCategory('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                filterCategory === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Tous ({products ? products.length : 0})
                        </button>

                        <button
                            onClick={() => setFilterCategory('promo')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                                filterCategory === 'promo' ? 'bg-[#FFCC00] text-slate-950 font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Tag className="w-3.5 h-3.5" />
                            <span>En Promo</span>
                        </button>

                        <button
                            onClick={() => setFilterCategory('low_stock')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                                filterCategory === 'low_stock' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Stock Critique</span>
                        </button>
                    </div>
                </div>

                {/* PRODUCTS CATALOGUE GRID */}
                {filteredProducts && filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => {
                            const directUrl = `${appUrl}/${store.slug}/p/${product.slug}`;
                            const isPromoActive = product.is_promo && product.promo_price > 0;

                            return (
                                <motion.div
                                    key={product.id}
                                    whileHover={{ y: -3 }}
                                    className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
                                >
                                    <div>
                                        {/* Image Box */}
                                        <div className="h-48 bg-slate-50 relative overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : product.images && product.images.length > 0 ? (
                                                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <ShoppingBag className="w-12 h-12 text-slate-300" />
                                            )}

                                            {isPromoActive && (
                                                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#FFCC00] text-slate-950 font-bold text-[10px] shadow-2xs flex items-center gap-1">
                                                    <Tag className="w-3 h-3 text-slate-950" />
                                                    <span>PROMO {Number(product.promo_price).toLocaleString()} FCFA</span>
                                                </div>
                                            )}

                                            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1">
                                                <button
                                                    onClick={() => handleCopyDirectLink(product)}
                                                    className="p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-slate-700 hover:text-slate-950 shadow-2xs text-[10px] font-semibold flex items-center gap-1 border border-slate-200"
                                                    title="Copier le lien direct vers ce produit"
                                                >
                                                    {copiedId === product.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-600" />}
                                                    <span>{copiedId === product.id ? 'Copié !' : 'Lien Direct'}</span>
                                                </button>

                                                <a
                                                    href={directUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-slate-700 hover:text-slate-950 shadow-2xs border border-slate-200"
                                                    title="Voir la page produit publique"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </div>

                                        <div className="p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-bold text-slate-950 truncate">{product.title}</div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => openEditModal(product)}
                                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-950 transition-colors"
                                                        title="Modifier le produit"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product)}
                                                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-baseline justify-between gap-1 flex-wrap">
                                                <div className="text-base font-extrabold text-slate-950">
                                                    {Number(product.price_vendor).toLocaleString()} FCFA
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="text-[11px] text-slate-500 font-medium">
                                                        Stock: <strong className={product.stock <= 3 ? 'text-rose-600 font-bold' : 'text-slate-900 font-semibold'}>{product.stock}</strong>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickStockAdd(product, 10)}
                                                        className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold transition-all border border-amber-300"
                                                        title="Réassort rapide (+10 unités)"
                                                    >
                                                        +10 Stock
                                                    </button>
                                                </div>
                                            </div>

                                            {product.variants && product.variants.length > 0 && (
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                                    <Layers2 className="w-3 h-3 text-amber-500" />
                                                    <span>{product.variants.length} variante(s)</span>
                                                </div>
                                            )}

                                            {product.description && (
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium pt-0.5 break-words overflow-hidden text-ellipsis">
                                                    {product.description}
                                                </p>
                                            )}

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
                                    </div>

                                    {/* Action Edit Button */}
                                    <div className="p-5 pt-0">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="w-full py-2.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-2xs flex items-center justify-center gap-1.5 border border-amber-300"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                            <span>Modifier le Produit</span>
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 space-y-4">
                        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-950">Aucun produit trouvé</h3>
                            <p className="text-xs text-slate-500">Ajoutez votre premier produit au catalogue pour commencer à vendre.</p>
                        </div>
                    </div>
                )}

            </div>

            {/* CREATE PRODUCT MODAL */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-950">Nouveau Produit au Catalogue</h3>
                                    <p className="text-xs text-slate-500 font-medium">Formulaire complet d'enregistrement d'article</p>
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit} className="space-y-5 text-xs font-medium">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Titre de l'Article *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="ex: Sac en Cuir Artisanal Premium"
                                        value={createForm.data.title}
                                        onChange={(e) => createForm.setData('title', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-amber-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Description *</label>
                                    <textarea
                                        rows={3}
                                        required
                                        placeholder="Description détaillée, matériaux, spécifications..."
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-amber-400"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Prix Vendeur Net (FCFA) *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            placeholder="15000"
                                            value={createForm.data.price_vendor}
                                            onChange={(e) => createForm.setData('price_vendor', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold focus:bg-white focus:border-amber-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Stock Initial *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={createForm.data.stock}
                                            onChange={(e) => createForm.setData('stock', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white focus:border-amber-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Qte Min Commande *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={createForm.data.min_order_quantity}
                                            onChange={(e) => createForm.setData('min_order_quantity', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white focus:border-amber-400"
                                        />
                                    </div>
                                </div>

                                {/* PROMOTIONS SECTION */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-rose-600" />
                                            <span className="font-bold text-slate-900">Activer le Prix Promotionnel</span>
                                        </div>
                                        {userPlan === 'starter' ? (
                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">Pack Pro Requis</span>
                                        ) : (
                                            <input
                                                type="checkbox"
                                                checked={createForm.data.is_promo}
                                                onChange={(e) => createForm.setData('is_promo', e.target.checked)}
                                                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400 cursor-pointer"
                                            />
                                        )}
                                    </div>

                                    {userPlan === 'starter' && (
                                        <p className="text-[11px] text-amber-800 font-medium">La mise en promotion des produits est réservée aux abonnements PRO, GROWTH et BUSINESS.</p>
                                    )}

                                    {createForm.data.is_promo && userPlan !== 'starter' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                            <div>
                                                <label className="block text-slate-700 font-bold mb-1">Prix Promo Net (FCFA)</label>
                                                <input
                                                    type="number"
                                                    value={createForm.data.promo_price}
                                                    onChange={(e) => createForm.setData('promo_price', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-rose-600 font-extrabold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-700 font-bold mb-1">Date Début Promo</label>
                                                <input
                                                    type="date"
                                                    value={createForm.data.promo_start_at}
                                                    onChange={(e) => createForm.setData('promo_start_at', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-700 font-bold mb-1">Date Fin Promo</label>
                                                <input
                                                    type="date"
                                                    value={createForm.data.promo_end_at}
                                                    onChange={(e) => createForm.setData('promo_end_at', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* IMAGES FILE UPLOAD */}
                                <div className="space-y-2">
                                    <label className="block text-slate-700 font-bold">Images du Produit (Jusqu'à 5 photos)</label>
                                    <div className="flex items-center gap-3">
                                        <label className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold cursor-pointer transition-colors inline-flex items-center gap-2 border border-amber-300">
                                            <UploadCloud className="w-4 h-4 text-amber-900" />
                                            <span>Télécharger des photos ({createImagePreviews.length}/5)</span>
                                            <input type="file" multiple accept="image/*" onChange={handleCreateImageChange} className="hidden" />
                                        </label>
                                    </div>

                                    {createImagePreviews.length > 0 && (
                                        <div className="flex items-center gap-3 mt-3 overflow-x-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                                            {createImagePreviews.map((src, i) => (
                                                <div key={i} className="relative group shrink-0 w-20 h-20">
                                                    <img src={src} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-300" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCreateImage(i)}
                                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* VARIANTS SECTION */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900">Variantes de Produit (Tailles & Couleurs)</span>
                                        <button
                                            type="button"
                                            onClick={addCreateVariantRow}
                                            className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs shadow-2xs"
                                        >
                                            + Ajouter une variante
                                        </button>
                                    </div>

                                    {createForm.data.variants && createForm.data.variants.length > 0 && (
                                        <div className="space-y-2">
                                            {createForm.data.variants.map((varRow, idx) => (
                                                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-5 gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Taille (ex: XL)"
                                                        value={varRow.size}
                                                        onChange={(e) => updateCreateVariantRow(idx, 'size', e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Couleur (ex: Noir)"
                                                        value={varRow.color}
                                                        onChange={(e) => updateCreateVariantRow(idx, 'color', e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Surprix FCFA"
                                                        value={varRow.price}
                                                        onChange={(e) => updateCreateVariantRow(idx, 'price', e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Stock"
                                                        value={varRow.stock_quantity}
                                                        onChange={(e) => updateCreateVariantRow(idx, 'stock_quantity', e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCreateVariantRow(idx)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 text-center"
                                                    >
                                                        <Trash2 className="w-4 h-4 mx-auto" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="w-full py-3.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all border border-amber-300"
                                >
                                    <span>Enregistrer le Produit au Catalogue</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* UNIFIED COMPLETE EDIT PRODUCT MODAL */}
            <AnimatePresence>
                {editingProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div>
                                    <h3 className="text-xl font-extrabold text-slate-950">Modifier le Produit</h3>
                                    <p className="text-xs text-slate-500 font-medium">Modification intégrale du produit et de ses images</p>
                                </div>
                                <button onClick={() => setEditingProduct(null)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="space-y-5 text-xs font-medium">
                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Titre de l'Article *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.data.title}
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white focus:border-amber-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 font-bold mb-1">Description *</label>
                                    <textarea
                                        rows={3}
                                        required
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-medium focus:bg-white focus:border-amber-400"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Prix Vendeur Net (FCFA) *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={editForm.data.price_vendor}
                                            onChange={(e) => editForm.setData('price_vendor', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-extrabold focus:bg-white focus:border-amber-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Stock Disponible *</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={editForm.data.stock}
                                            onChange={(e) => editForm.setData('stock', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white focus:border-amber-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Qte Min Commande *</label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={editForm.data.min_order_quantity}
                                            onChange={(e) => editForm.setData('min_order_quantity', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-bold focus:bg-white focus:border-amber-400"
                                        />
                                    </div>
                                </div>

                                {/* PROMOTIONS SECTION IN EDIT */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-rose-600" />
                                            <span className="font-bold text-slate-900">Activer le Prix Promotionnel</span>
                                        </div>
                                        {userPlan === 'starter' ? (
                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">Pack Pro Requis</span>
                                        ) : (
                                            <input
                                                type="checkbox"
                                                checked={editForm.data.is_promo}
                                                onChange={(e) => editForm.setData('is_promo', e.target.checked)}
                                                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400 cursor-pointer"
                                            />
                                        )}
                                    </div>

                                    {userPlan === 'starter' && (
                                        <p className="text-[11px] text-amber-800 font-medium">La mise en promotion des produits est réservée aux abonnements PRO, GROWTH et BUSINESS.</p>
                                    )}

                                    {editForm.data.is_promo && userPlan !== 'starter' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                            <div>
                                                <label className="block text-slate-700 font-bold mb-1">Prix Promo Net (FCFA)</label>
                                                <input
                                                    type="number"
                                                    value={editForm.data.promo_price}
                                                    onChange={(e) => editForm.setData('promo_price', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-rose-600 font-extrabold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-700 font-bold mb-1">Date Début Promo</label>
                                                <input
                                                    type="date"
                                                    value={editForm.data.promo_start_at}
                                                    onChange={(e) => editForm.setData('promo_start_at', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-700 font-bold mb-1">Date Fin Promo</label>
                                                <input
                                                    type="date"
                                                    value={editForm.data.promo_end_at}
                                                    onChange={(e) => editForm.setData('promo_end_at', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* EDIT IMAGES FILES UPLOAD & PREVIEW */}
                                <div className="space-y-2">
                                    <label className="block text-slate-700 font-bold">Modifier / Remplacer les Images</label>
                                    
                                    {editImagePreviews.length > 0 && (
                                        <div className="flex items-center gap-3 overflow-x-auto p-2 bg-slate-50 rounded-2xl border border-slate-200 mb-2">
                                            {editImagePreviews.map((src, i) => (
                                                <div key={i} className="relative shrink-0 w-20 h-20">
                                                    <img src={src} alt="" className="w-20 h-20 rounded-xl object-cover border border-slate-300" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <label className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold cursor-pointer transition-colors inline-flex items-center gap-2 border border-amber-300">
                                        <UploadCloud className="w-4 h-4 text-amber-900" />
                                        <span>Sélectionner de nouvelles photos</span>
                                        <input type="file" multiple accept="image/*" onChange={handleEditImageChange} className="hidden" />
                                    </label>
                                </div>

                                {/* EDIT VARIANTS SECTION */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900">Variantes de Produit (Tailles & Couleurs)</span>
                                        <button
                                            type="button"
                                            onClick={addEditVariantRow}
                                            className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs shadow-2xs"
                                        >
                                            + Ajouter une variante
                                        </button>
                                    </div>

                                    {editForm.data.variants && editForm.data.variants.length > 0 && (
                                        <div className="space-y-2">
                                            {editForm.data.variants.map((varRow, idx) => (
                                                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-5 gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Taille (ex: XL)"
                                                        value={varRow.size}
                                                        onChange={(e) => updateEditVariantRow(idx, 'size', e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Couleur (ex: Noir)"
                                                        value={varRow.color}
                                                        onChange={(e) => updateEditVariantRow(idx, 'color', e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Surprix FCFA"
                                                        value={varRow.price}
                                                        onChange={(e) => updateEditVariantRow(idx, 'price', e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder="Stock"
                                                        value={varRow.stock_quantity}
                                                        onChange={(e) => updateEditVariantRow(idx, 'stock_quantity', e.target.value)}
                                                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEditVariantRow(idx)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 text-center"
                                                    >
                                                        <Trash2 className="w-4 h-4 mx-auto" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="w-full py-3.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-md transition-all border border-amber-300"
                                >
                                    <span>Enregistrer les Modifications du Produit</span>
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </AuthenticatedLayout>
    );
}
