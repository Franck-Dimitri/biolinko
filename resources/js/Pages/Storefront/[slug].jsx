import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { 
    Store, ShoppingCart, ArrowLeft, Star, ShieldCheck, CheckCircle2, 
    Truck, Share2, Plus, Minus, Tag, Check,
    ShoppingBag, Eye, ArrowRight, BadgeCheck, CreditCard, FileText, RotateCcw, X, MessageCircle
} from 'lucide-react';

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

export default function ProductSlugShow({ store, product, appUrl }) {
    const authUser = usePage().props.auth?.user;
    const isOwner = authUser && authUser.id === store.user_id;

    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = getContrastColor(primaryColor);
    const isSquareCorners = store?.border_radius_style === 'square';

    const images = Array.isArray(product.images) && product.images.length > 0 
        ? product.images 
        : [product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'];

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
    const [quantity, setQuantity] = useState(product.min_order_quantity || 1);
    const [cartItems, setCartItems] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);
    const [activeDetailTab, setActiveDetailTab] = useState('specs'); // 'specs' | 'desc' | 'vendor' | 'escrow'

    // Sync Cart from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem(`biolinko_cart_${store.id}`);
        if (saved) {
            try { setCartItems(JSON.parse(saved)); } catch (e) {}
        }
    }, [store.id]);

    const saveCart = (items) => {
        setCartItems(items);
        localStorage.setItem(`biolinko_cart_${store.id}`, JSON.stringify(items));
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const handleAddToCart = (openCartAfterAdd = false) => {
        const minQ = product.min_order_quantity || 1;
        const qToAdd = Math.max(quantity, minQ);
        const variantObj = selectedVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : null);

        let currentPv = (product.is_promo && product.promo_price > 0) ? parseFloat(product.promo_price) : parseFloat(product.price_vendor);
        if (variantObj && variantObj.price && parseFloat(variantObj.price) > 0) {
            currentPv = parseFloat(variantObj.price);
        }

        const pbUnit = Math.ceil(currentPv * 1.02);

        const existingIndex = cartItems.findIndex(
            item => item.product_id === product.id && item.variant_id === (variantObj ? variantObj.id : null)
        );

        let updated;
        if (existingIndex > -1) {
            updated = [...cartItems];
            updated[existingIndex].quantity += qToAdd;
        } else {
            updated = [
                ...cartItems,
                {
                    product_id: product.id,
                    title: product.title,
                    image_url: images[0],
                    variant_id: variantObj ? variantObj.id : null,
                    variant_label: variantObj ? (variantObj.name || `${variantObj.size || ''} ${variantObj.color || ''}`) : '',
                    min_order_quantity: minQ,
                    price_vendor: currentPv,
                    price_display: pbUnit,
                    quantity: qToAdd,
                }
            ];
        }

        saveCart(updated);

        if (openCartAfterAdd) {
            // Redirect to store cart page directly
            window.location.href = `/${store.slug}?tab=cart`;
        } else {
            showToast(`"${product.title}" ajouté au panier !`);
        }
    };

    const unitPrice = selectedVariant?.price 
        ? Math.ceil(Math.ceil(parseFloat(selectedVariant.price) * 1.02) / 0.98)
        : (product.price_client_total || Math.ceil(Math.ceil(parseFloat(product.price_vendor) * 1.02) / 0.98));

    const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleShareProduct = () => {
        navigator.clipboard.writeText(window.location.href);
        showToast('Lien du produit copié !');
    };

    const reviewsList = store?.reviews || [];
    const avgRating = reviewsList.length > 0 
        ? (reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1)
        : null;
    // Ensure all active products from store are loaded
    const relatedProducts = (store?.products || []).filter(p => p.id !== product.id).slice(0, 4);

    return (
        <StorefrontLayout store={store} isOwner={isOwner}>
            <Head title={`${product.title} — ${store.name}`} />

            <div className="space-y-12">
                {/* BREADCRUMBS */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <a href={`/${store.slug}`} className="hover:text-slate-950 flex items-center gap-1 text-slate-600">
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-400" /> Accueil Boutique
                    </a>
                    <span>/</span>
                    <span className="text-slate-600">Détail Produit</span>
                    <span>/</span>
                    <span className="text-slate-950 font-semibold truncate max-w-xs">{product.title}</span>
                </div>

                {/* PRODUCT MAIN DISPLAY 3-COLUMN BOX (IMAGE 3 DESIGN) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: MULTI-IMAGE GALLERY & ESCROW COMMITMENT BOX (4 COLS) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="aspect-square bg-white border border-slate-200 shadow-2xs overflow-hidden relative rounded-3xl p-2">
                            <img 
                                src={images[selectedImageIndex]} 
                                alt={product.title} 
                                className="w-full h-full object-cover rounded-2xl"
                            />
                            <div className="absolute bottom-4 left-4 bg-slate-950/90 text-white text-[10px] font-extrabold px-3 py-1 rounded-lg backdrop-blur-xs shadow-md">
                                ✓ Stock Vérifié: {product.stock || 10} unités
                            </div>
                        </div>

                        {/* GALLERY THUMBNAILS (IMAGE 3) */}
                        <div className="grid grid-cols-4 gap-2">
                            {images.slice(0, 4).map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImageIndex(idx)}
                                    className={`w-full aspect-square rounded-xl border-2 overflow-hidden transition-all ${
                                        selectedImageIndex === idx ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-200 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        {/* ENGAGEMENT SERVICE VENDEUR */}
                        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3 text-xs text-slate-800 shadow-2xs">
                            <div className="font-extrabold text-slate-950 flex items-center gap-1.5 text-xs">
                                <Truck className="w-4 h-4 text-amber-500" />
                                <span>Engagement Service &amp; Expédition</span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                                Commandez en toute confiance directement auprès de {store.name}. Traitement rapide et expédition directe.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700 pt-2 border-t border-slate-200/80">
                                <div className="flex items-center gap-1.5">
                                    <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>Expédition 24h - 48h</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Paiement MoMo Direct</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <RotateCcw className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span>Service Après-Vente</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                                    <span>Reçu de Commande</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MIDDLE COLUMN: PRICE, QUANTITY & ACTIONS (5 COLS) */}
                    <div className="lg:col-span-5 space-y-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs">
                        
                        <div className="flex items-center justify-between gap-2">
                            <span className="border border-emerald-300 bg-emerald-50 text-emerald-950 font-extrabold text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Article Officiel Store
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400">
                                SKU : {product.sku || `BLK-PROD-${product.id}`}
                            </span>
                        </div>

                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight">{product.title}</h1>

                        <div className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                            {avgRating ? (
                                <span className="text-amber-600 font-bold flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {avgRating} / 5 ({reviewsList.length} avis)
                                </span>
                            ) : (
                                <span className="text-slate-400 text-[11px] font-medium">Aucun avis pour l'instant</span>
                            )}
                            <span>•</span>
                            {product.stock > 0 ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> En Stock ({product.stock} disponible{product.stock > 1 ? 's' : ''})
                                </span>
                            ) : (
                                <span className="text-rose-600 font-bold flex items-center gap-1">
                                    <X className="w-3.5 h-3.5 text-rose-600" /> Stock Épuisé (Rupture)
                                </span>
                            )}
                        </div>

                        {/* PRIX UNITAIRE (CLEAN SINGLE PRICE DISPLAY) */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                            <div className="text-xs font-bold text-slate-600">Prix Unitaire Article :</div>
                            <div className="text-2xl font-extrabold text-slate-950">{Number(unitPrice).toLocaleString()} FCFA</div>
                        </div>

                        {/* INFO GRID 2x2 */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                                <div className="text-[10px] text-slate-400 font-medium">Origine Expédition</div>
                                <div className="font-bold text-slate-900">{store.city || 'Douala, Cameroun'}</div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                                <div className="text-[10px] text-slate-400 font-medium">Délai de Livraison</div>
                                <div className="font-bold text-slate-900">24h à 48h max</div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5 col-span-2">
                                <div className="text-[10px] text-slate-400 font-medium">Commande Min. (MOQ)</div>
                                <div className="font-bold text-slate-900">{product.min_order_quantity || 1} pièce</div>
                            </div>
                        </div>

                        {/* QUANTITY SELECTOR */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                            <span className="font-bold text-slate-900">Quantité désirée :</span>
                            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
                                <button
                                    disabled={product.stock <= 0}
                                    onClick={() => setQuantity(Math.max(product.min_order_quantity || 1, quantity - 1))}
                                    className="w-7 h-7 rounded-lg bg-white shadow-2xs font-bold text-slate-800 flex items-center justify-center cursor-pointer disabled:opacity-50"
                                >
                                    -
                                </button>
                                <span className="w-10 text-center font-extrabold text-slate-950">{product.stock <= 0 ? 0 : quantity}</span>
                                <button
                                    disabled={product.stock <= 0 || quantity >= product.stock}
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    className="w-7 h-7 rounded-lg bg-white shadow-2xs font-bold text-slate-800 flex items-center justify-center cursor-pointer disabled:opacity-50"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* MONTANT TOTAL BOX */}
                        <div className="bg-[#18181B] text-white p-4 rounded-2xl flex items-center justify-between font-bold text-sm shadow-md">
                            <span>Montant Total à Régler :</span>
                            <span className="text-amber-400 font-extrabold text-base">{Number(unitPrice * (product.stock <= 0 ? 0 : quantity)).toLocaleString()} FCFA</span>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="space-y-2 pt-1">
                            <button
                                disabled={product.stock <= 0}
                                onClick={() => handleAddToCart(true)}
                                className={`w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-md border transition-all flex items-center justify-center gap-2 ${
                                    product.stock <= 0
                                        ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed'
                                        : 'bg-[#FFCC00] hover:bg-amber-400 text-slate-950 border-amber-300 cursor-pointer'
                                }`}
                            >
                                <ShoppingCart className="w-4 h-4" />
                                <span>{product.stock <= 0 ? 'Stock Épuisé' : 'Ajouter au Panier & Voir le Panier'}</span>
                            </button>

                            <button
                                disabled={product.stock <= 0}
                                onClick={() => handleAddToCart(true)}
                                className={`w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                                    product.stock <= 0
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        : 'bg-[#18181B] hover:bg-slate-900 text-white cursor-pointer'
                                }`}
                            >
                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                                <span>{product.stock <= 0 ? 'Rupture de Stock' : 'Achat Rapide 1-Clic Sécurisé'}</span>
                            </button>

                            <p className="text-[10px] text-slate-400 font-medium text-center">
                                Validation Instantanée avec Mobile Money (Orange / MTN MoMo).
                            </p>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: PROFIL FOURNISSEUR CARD (3 COLS) */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-950">BOUTIQUE OFFICIELLE</span>
                                <span className="bg-emerald-50 text-emerald-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    Vendeur Actif
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center shadow-2xs overflow-hidden border border-slate-200 shrink-0">
                                    {store.logo_url ? (
                                        <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Store className="w-6 h-6 text-amber-400" />
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-extrabold text-sm text-slate-950 leading-tight flex items-center gap-1">
                                        <span>{store.name}</span>
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    </h4>
                                    <p className="text-[11px] text-slate-500 font-medium">{store.category || 'Boutique Indépendante'}</p>
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-semibold text-slate-700">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">Évaluation :</span>
                                    <span className="text-slate-900 font-extrabold">{avgRating ? `★ ${avgRating} / 5.0` : 'Boutique Vérifiée'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">Localisation :</span>
                                    <span className="text-slate-900 font-bold">{store.city || 'Douala, Cameroun'}</span>
                                </div>
                            </div>

                            <div className="text-xs text-slate-600 font-medium flex items-center justify-between pt-1">
                                <span className="text-slate-400">Gérant de Store :</span>
                                <span className="font-bold text-slate-900">{store.manager_name || store.name}</span>
                            </div>

                            <a
                                href={`/${store.slug}`}
                                className="w-full py-3 rounded-2xl bg-[#18181B] hover:bg-slate-900 text-white font-bold text-xs text-center shadow-xs block transition-all"
                            >
                                Visiter la Vitrine de la Boutique
                            </a>
                        </div>
                    </div>

                </div>

                {/* BOTTOM TABS SECTION: SPECIFICATIONS TECHNIQUES & DESCRIPTION */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xs">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
                        <button
                            type="button"
                            onClick={() => setActiveDetailTab('specs')}
                            className={`px-4 py-2.5 rounded-xl text-xs shrink-0 font-extrabold transition-all cursor-pointer ${
                                activeDetailTab === 'specs' ? 'bg-[#FFCC00] text-slate-950 shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                            }`}
                        >
                            Spécifications Techniques
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveDetailTab('desc')}
                            className={`px-4 py-2.5 rounded-xl text-xs shrink-0 font-extrabold transition-all cursor-pointer ${
                                activeDetailTab === 'desc' ? 'bg-[#FFCC00] text-slate-950 shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                            }`}
                        >
                            Description &amp; Fiche Complète
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveDetailTab('vendor')}
                            className={`px-4 py-2.5 rounded-xl text-xs shrink-0 font-extrabold transition-all cursor-pointer ${
                                activeDetailTab === 'vendor' ? 'bg-[#FFCC00] text-slate-950 shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                            }`}
                        >
                            À propos du Vendeur
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveDetailTab('escrow')}
                            className={`px-4 py-2.5 rounded-xl text-xs shrink-0 font-extrabold transition-all cursor-pointer ${
                                activeDetailTab === 'escrow' ? 'bg-[#FFCC00] text-slate-950 shadow-2xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                            }`}
                        >
                            Livraison &amp; Modalités de Paiement
                        </button>
                    </div>

                    {activeDetailTab === 'specs' && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">
                                CARACTÉRISTIQUES TECHNIQUES DU PRODUIT
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">Code Article / SKU :</span>
                                    <span className="font-mono font-bold text-slate-950">{product.sku || `BLK-PROD-${product.id}`}</span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">Ville d'expédition :</span>
                                    <span className="font-bold text-slate-950">{store.city || 'Douala, Cameroun'}</span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">Disponibilité du Stock :</span>
                                    <span className="font-bold text-emerald-600">{product.stock || 1} pièces disponibles</span>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                    <span className="text-slate-500 font-medium">Mode d'Expédition :</span>
                                    <span className="font-bold text-slate-950">Livraison Directe Vendeur</span>
                                </div>
                            </div>

                            {product.description && (
                                <div className="pt-4 border-t border-slate-100 space-y-2">
                                    <h5 className="text-xs font-bold text-slate-900">Description Complète :</h5>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-line">{product.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeDetailTab === 'desc' && (
                        <div className="space-y-3 text-xs text-slate-700">
                            <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">DESCRIPTION DÉTAILLÉE DU PRODUIT</h4>
                            <p className="leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                {product.description || 'Aucune description spécifique renseignée par le vendeur pour cet article.'}
                            </p>
                        </div>
                    )}

                    {activeDetailTab === 'vendor' && (
                        <div className="space-y-4 text-xs">
                            <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">INFORMATIONS SUR LE VENDEUR</h4>
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                                <div className="font-bold text-sm text-slate-950">{store.name}</div>
                                <div className="text-slate-600">{store.description || `Bienvenue sur la boutique officielle de ${store.name}.`}</div>
                                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-500 font-medium">
                                    <span>Gérant : {store.manager_name || store.name}</span>
                                    <a href={`/${store.slug}`} className="text-amber-600 font-bold hover:underline">Voir tous les articles de cette boutique →</a>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeDetailTab === 'escrow' && (
                        <div className="space-y-3 text-xs text-slate-700">
                            <h4 className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">LIVRAISON ET MODALITÉS DE PAIEMENT</h4>
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-slate-800 font-medium">
                                <div className="font-bold text-slate-950">Informations sur la commande :</div>
                                <p>Toutes vos commandes sont gérées directement par le vendeur {store.name}. Les livraisons sont effectuées selon l'adresse indiquée lors de la commande et le paiement s'effectue via Mobile Money (Orange Money, MTN Mobile Money).</p>
                            </div>
                        </div>
                    )}

                </div>

                {/* SECTION: PRODUCT REVIEWS */}
                <div className="pt-12 border-t border-slate-200 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
                        <div>
                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-900 font-semibold text-[11px] border border-slate-200">
                                ÉVALUATIONS CLIENTS
                            </span>
                            <h3 className="text-xl font-bold text-slate-950 mt-2">Avis &amp; Témoignages</h3>
                            <p className="text-xs text-slate-500 font-medium">Avis vérifiés d'acheteurs ayant commandé chez {store.name}</p>
                        </div>

                        {avgRating ? (
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-950">{avgRating}</div>
                                    <div className="flex text-amber-400 text-xs justify-center mt-1">
                                        {Array.from({ length: Math.round(avgRating) }).map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                                        ))}
                                    </div>
                                </div>
                                <div className="text-xs text-slate-600 font-medium">
                                    <div>Achats Vérifiés</div>
                                    <div className="text-emerald-600 font-bold">{reviewsList.length} Avis Publiés</div>
                                </div>
                            </div>
                        ) : (
                            <a
                                href={`/${store.slug}#reviews`}
                                className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer border border-amber-300 self-start sm:self-auto"
                            >
                                <Star className="w-4 h-4 text-slate-950 fill-slate-950" />
                                <span>Déposer un Avis sur la Boutique</span>
                            </a>
                        )}
                    </div>

                    {reviewsList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {reviewsList.slice(0, 3).map((rev, idx) => (
                                <div key={rev.id || idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2.5 shadow-2xs">
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-xs text-slate-950">{rev.customer_name || rev.name} ({rev.customer_city || rev.city || 'Client'})</div>
                                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Acheteur Vérifié</span>
                                    </div>
                                    <div className="flex text-amber-400">
                                        {[...Array(rev.rating || 5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        "{rev.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 font-medium text-xs space-y-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                            </div>
                            <div className="font-bold text-slate-950">Aucun avis publié pour le moment</div>
                            <p className="max-w-md mx-auto text-slate-500">Soyez le tout premier client à donner votre avis sur {store.name} !</p>
                            <a
                                href={`/${store.slug}#reviews`}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-white font-extrabold text-xs hover:bg-slate-800 transition-colors shadow-2xs"
                            >
                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span>Déposer le Premier Avis</span>
                            </a>
                        </div>
                    )}
                </div>

                {/* SECTION: RELATED PRODUCTS & "VOIR LE CATALOGUE" BUTTON */}
                <div className="pt-10 border-t border-slate-200 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-950 tracking-tight">Autres Produits de la Boutique</h3>
                            <p className="text-xs text-slate-500 font-medium">Découvrez d'autres articles disponibles chez {store.name}</p>
                        </div>
                        <a
                            href={`/${store.slug}`}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition-all border border-slate-900"
                        >
                            <span>Voir le catalogue complet</span>
                            <ArrowRight className="w-4 h-4 text-amber-400" />
                        </a>
                    </div>

                    {relatedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {relatedProducts.map((relProduct) => {
                                const relUrl = `/${store.slug}/p/${relProduct.slug}`;
                                const relPrice = Math.ceil((relProduct.is_promo && relProduct.promo_price ? relProduct.promo_price : relProduct.price_vendor) * 1.02);

                                return (
                                    <div key={relProduct.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
                                        <a href={relUrl} className="block">
                                            <div className="h-48 bg-slate-50 relative overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
                                                <img 
                                                    src={relProduct.image_url || (relProduct.images?.[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'} 
                                                    alt={relProduct.title} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>

                                            <div className="p-4 space-y-2">
                                                <h4 className="font-semibold text-slate-900 text-xs line-clamp-1 group-hover:text-amber-600 transition-colors">
                                                    {relProduct.title}
                                                </h4>
                                                <div className="text-sm font-bold text-slate-950">
                                                    {relPrice.toLocaleString()} FCFA
                                                </div>
                                            </div>
                                        </a>

                                        <div className="p-4 pt-0">
                                            <a
                                                href={relUrl}
                                                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                                            >
                                                <span>Voir la fiche</span>
                                                <Eye className="w-3.5 h-3.5 text-amber-400" />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-medium text-xs">
                            Aucun autre produit pour le moment.
                        </div>
                    )}
                </div>
            </div>
        </StorefrontLayout>
    );
}
