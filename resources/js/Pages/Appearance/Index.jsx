import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { toast } from 'sonner';
import { 
    Palette, Store, Phone, MapPin, Clock, ArrowRight, Check, X, 
    MessageSquare, ExternalLink, Image as ImageIcon, Sparkles, Sliders, Globe, ArrowLeft,
    Tag, Star, ShieldCheck, Heart, UserCheck, Trash2, Plus, Mail, Layers, CheckCircle2, Eye, EyeOff, GripVertical, RotateCcw,
    Smartphone, Monitor, Settings, Flame, Truck, ShoppingBag, ShoppingCart, RefreshCw, Headphones, Play, FileText, Upload
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

export default function Index({ store, reviews, appUrl }) {
    const user = usePage().props.auth.user;
    
    // Editor State
    const [previewDevice, setPreviewDevice] = useState('mobile'); // 'desktop' | 'mobile'
    const [rightTab, setRightTab] = useState('config'); // 'config' | 'theme'
    const [selectedBlockId, setSelectedBlockId] = useState('brand');
    const [logoPreview, setLogoPreview] = useState(store?.logo_url || null);
    const [bannerPreview, setBannerPreview] = useState(store?.banner_url || null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [mobileActiveTab, setMobileActiveTab] = useState('edit'); // 'blocks' | 'edit' | 'preview'

    // Manual Review Form State
    const [showAddReviewForm, setShowAddReviewForm] = useState(false);
    const [manualReview, setManualReview] = useState({
        customer_name: '',
        customer_city: 'Cotonou',
        rating: 5,
        comment: '',
        is_featured: true,
        is_verified: true,
    });

    // Initial benefits fallback
    const initialBenefits = store?.benefits_json || [
        { title: 'Livraison Express', subtitle: 'Sous 24h à 48h à domicile' },
        { title: 'Paiements Sécurisés MoMo', subtitle: 'Notification Push USSD 30s' },
        { title: 'Satisfait ou Remboursé', subtitle: 'Politique de retour 14 jours' },
        { title: 'Support WhatsApp 7j/7', subtitle: 'Contact direct avec le vendeur' }
    ];

    const defaultSections = [
        { id: 'banner', name: "Bandeau d'Annonce", desc: "Annonce une offre spéciale", enabled: true },
        { id: 'hero', name: "Hero / Bannière", desc: "Accueil avec titre et bouton", enabled: true },
        { id: 'categories', name: "Nos Catégories", desc: "Grille de vos catégories", enabled: true },
        { id: 'products', name: "Catalogue", desc: "Grille de tous vos produits", enabled: true },
        { id: 'best-sellers', name: "Meilleures Ventes", desc: "Produits populaires et tendances", enabled: true },
        { id: 'promotions', name: "Offres en Promotion", desc: "Produits avec réduction", enabled: true },
        { id: 'smartlinks', name: "Packs SmartLinks", desc: "Offres groupées et réductions", enabled: true },
        { id: 'benefits', name: "Engagements", desc: "Garanties & réassurance", enabled: true },
        { id: 'reviews', name: "Avis clients", desc: "Preuves sociales et témoignages", enabled: true },
        { id: 'about', name: "À propos / Contact", desc: "Présentation & coordonnées", enabled: true },
    ];

    const availableLibraryBlocks = [
        { id: 'brand', name: "Logo & Marque", desc: "Logo, nom, sous-domaine & bannière" },
        { id: 'banner', name: "Bandeau promo", desc: "Annonce une offre spéciale" },
        { id: 'hero', name: "Hero / Bannière", desc: "Accueil avec titre et bouton" },
        { id: 'categories', name: "Nos Catégories", desc: "Grille de vos catégories" },
        { id: 'products', name: "Catalogue", desc: "Grille de tous vos produits" },
        { id: 'best-sellers', name: "Meilleures Ventes", desc: "Produits populaires et tendances" },
        { id: 'promotions', name: "Offres en Promotion", desc: "Produits avec réduction" },
        { id: 'smartlinks', name: "Packs SmartLinks", desc: "Offres groupées et réductions" },
        { id: 'benefits', name: "Engagements", desc: "Garanties & réassurance" },
        { id: 'reviews', name: "Avis clients", desc: "Preuves sociales et témoignages" },
        { id: 'about', name: "À propos / Contact", desc: "Présentation, adresse & horaires" },
        { id: 'socials', name: "Réseaux sociaux", desc: "Liens WhatsApp, Instagram, TikTok" },
    ];

    // Presets Color Palettes (BIOLINKO Design System)
    const suggestedPalettes = [
        { name: 'BIOLINKO Gold', primary: '#FFCC00', accent: '#D97706' },
        { name: 'Emerald Fresh', primary: '#059669', accent: '#10B981' },
        { name: 'Indigo Sleek', primary: '#4F46E5', accent: '#F97316' },
        { name: 'Crimson Silk', primary: '#E11D48', accent: '#F43F5E' },
        { name: 'Royal Sapphire', primary: '#1E293B', accent: '#0EA5E9' },
        { name: 'Rose Glamour', primary: '#DB2777', accent: '#F472B6' },
    ];

    // Main Store Appearance Form
    const { data, setData, post, processing, errors } = useForm({
        name: store?.name || user?.name || '',
        slug: store?.slug || '',
        category: store?.category || 'Mode & Accessoires',
        description: store?.description || '',
        about_text: store?.about_text || '',
        logo_url: store?.logo_url || '',
        banner_url: store?.banner_url || '',
        logo_file: null,
        banner_file: null,
        theme_color: store?.theme_color || '#FFCC00',
        accent_color: store?.accent_color || '#F97316',
        font_family: store?.font_family || 'Inter',
        border_radius_style: store?.border_radius_style || 'rounded',
        phone_whatsapp: store?.phone_whatsapp || user?.phone_whatsapp || '',
        city_location: store?.city_location || '',
        opening_hours: store?.opening_hours || 'Lun - Sam: 08h00 - 18h00',
        announcement_header: store?.announcement_header || 'Offres Solde Exclusives !',
        instagram_link: store?.instagram_link || '',
        tiktok_link: store?.tiktok_link || '',
        facebook_link: store?.facebook_link || '',
        hero_badge_text: store?.hero_badge_text || 'PROMOTIONS & TENDANCES',
        hero_title: store?.hero_title || 'Découvrez nos Produits d\'Exception',
        hero_subtitle: store?.hero_subtitle || 'Articles de qualité supérieure expédiés sous 24h-48h. Paiement Mobile Money direct et sécurisé.',
        hero_cta_text: store?.hero_cta_text || 'Acheter Maintenant',
        benefits_json: initialBenefits,
        sections_json: store?.sections_json || defaultSections,
        location_address: store?.location_address || '',
        support_email: store?.support_email || '',
    });

    const storeFullUrl = `${appUrl}/${data.slug || store?.slug || 'ma-boutique'}`;

    const handleLogoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo_file', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('banner_file', file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleBenefitChange = (index, field, value) => {
        const updated = [...data.benefits_json];
        updated[index][field] = value;
        setData('benefits_json', updated);
    };

    const toggleSectionVisibility = (id) => {
        const updated = (data.sections_json || defaultSections).map(sec => {
            if (sec.id === id) {
                return { ...sec, enabled: !sec.enabled };
            }
            return sec;
        });
        setData('sections_json', updated);
    };

    const addBlockToSections = (block) => {
        const current = data.sections_json || defaultSections;
        const exists = current.find(s => s.id === block.id);
        if (exists) {
            toggleSectionVisibility(block.id);
        } else {
            setData('sections_json', [...current, { id: block.id, name: block.name, desc: block.desc, enabled: true }]);
        }
        setSelectedBlockId(block.id);
        setRightTab('config');
        setMobileActiveTab('edit');
    };

    const removeBlockFromSections = (id) => {
        const updated = (data.sections_json || defaultSections).filter(sec => sec.id !== id);
        setData('sections_json', updated);
    };

    const applyPalette = (palette) => {
        setData(prev => ({
            ...prev,
            theme_color: palette.primary,
            accent_color: palette.accent
        }));
    };

    const handleToggleReviewFeatured = (reviewId) => {
        router.patch(route('appearance.reviews.toggle', reviewId), {}, {
            preserveScroll: true
        });
    };

    const handleDeleteReview = (reviewId) => {
        if (confirm("Supprimer cet avis client ?")) {
            router.delete(route('appearance.reviews.destroy', reviewId), {
                preserveScroll: true
            });
        }
    };

    const handleCreateManualReviewSubmit = (e) => {
        e.preventDefault();
        router.post(route('appearance.reviews.store'), manualReview, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddReviewForm(false);
                setManualReview({
                    customer_name: '',
                    customer_city: 'Cotonou',
                    rating: 5,
                    comment: '',
                    is_featured: true,
                    is_verified: true,
                });
            }
        });
    };

    const resetToBaseline = () => {
        setData({
            name: store?.name || user?.name || '',
            slug: store?.slug || '',
            category: 'Mode & Accessoires',
            description: '',
            about_text: "Nous sommes spécialisés dans la fourniture d'articles de haute qualité, soigneusement sélectionnés pour vous offrir la meilleure expérience d'achat. Nos expéditions sont rapides et nos transactions sont 100% sécurisées.",
            logo_url: store?.logo_url || '',
            banner_url: store?.banner_url || '',
            logo_file: null,
            banner_file: null,
            theme_color: '#FFCC00',
            accent_color: '#F97316',
            font_family: 'Inter',
            border_radius_style: 'rounded',
            phone_whatsapp: user?.phone_whatsapp || '',
            city_location: 'Cotonou, Bénin',
            opening_hours: 'Lun - Sam: 08h00 - 18h00',
            announcement_header: 'Livraison Offerte dès 25 000 FCFA !',
            instagram_link: '',
            tiktok_link: '',
            facebook_link: '',
            hero_badge_text: 'PROMOTIONS & TENDANCES',
            hero_title: 'Découvrez nos Produits d\'Exception',
            hero_subtitle: 'Articles de qualité supérieure expédiés sous 24h-48h. Paiement Mobile Money direct et sécurisé.',
            hero_cta_text: 'Acheter Maintenant',
            benefits_json: [
                { title: 'Livraison Express', subtitle: 'Sous 24h à 48h à domicile' },
                { title: 'Paiements Sécurisés MoMo', subtitle: 'Notification Push USSD 30s' },
                { title: 'Satisfait ou Remboursé', subtitle: 'Politique de retour 14 jours' },
                { title: 'Support WhatsApp 7j/7', subtitle: 'Contact direct avec le vendeur' }
            ],
            sections_json: defaultSections,
            location_address: 'Cotonou, Bénin (Expédition Nationale)',
            support_email: user?.email || '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('appearance.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Vitrine mise à jour avec succès !', {
                    description: 'Vos modifications visuelles sont maintenant en ligne.'
                });
                setShowSuccessModal(true);
                setTimeout(() => setShowSuccessModal(false), 3500);
            },
            onError: () => {
                toast.error('Erreur lors de la sauvegarde.', {
                    description: 'Veuillez vérifier les champs du formulaire.'
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Éditeur de Vitrine - BIOLINKO Studio" />

            <div className="-m-4 sm:-m-6 lg:-m-8 bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col font-sans">
                
                {/* 1. TOP CONTROL BAR (CLEAN BIOLINKO LIGHT HEADER) */}
                <header className="min-h-16 h-auto py-2 sm:py-0 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex flex-wrap md:flex-nowrap items-center justify-between shrink-0 z-30 shadow-2xs gap-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center shadow-xs shrink-0">
                            <Store className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight">Éditeur de vitrine</h1>
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-slate-950 font-mono text-[10px] sm:text-[11px] font-bold border border-amber-300">
                                    {data.slug || 'ma-boutique'}
                                </span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">Studio de personnalisation visuelle en direct</p>
                        </div>
                    </div>

                    {/* Center: Device Switcher (Hidden on small mobile screens or compact) */}
                    <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setPreviewDevice('desktop')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                                previewDevice === 'desktop' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 font-medium'
                            }`}
                        >
                            <Monitor className="w-3.5 h-3.5" />
                            <span>Desktop</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setPreviewDevice('mobile')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                                previewDevice === 'mobile' ? 'bg-amber-400 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900 font-medium'
                            }`}
                        >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Mobile</span>
                        </button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        {/* STORE PUBLICATION STATUS TOGGLE */}
                        <Link
                            href={route('store.togglePublish')}
                            method="post"
                            as="button"
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer ${
                                store?.is_published 
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300'
                            }`}
                            title={store?.is_published ? 'Votre boutique est visible du public. Cliquez pour masquer.' : 'Votre boutique est en mode brouillon. Cliquez pour la rendre publique.'}
                        >
                            <span className={`w-2 h-2 rounded-full ${store?.is_published ? 'bg-white animate-pulse' : 'bg-slate-950'}`} />
                            <span>{store?.is_published ? 'Boutique Publiée (En ligne)' : '🚀 Publier ma Boutique'}</span>
                        </Link>

                        <a 
                            href={storeFullUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors border border-slate-200"
                        >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                            <span>Voir le lien</span>
                        </a>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-2xs transition-all flex items-center gap-1.5 border border-slate-800 disabled:opacity-50 cursor-pointer"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>{processing ? 'Enregistrement...' : 'Sauvegarder'}</span>
                        </button>
                    </div>
                </header>

                {/* MOBILE STUDIO NAVIGATION TABS (Visible only on < md screens) */}
                <div className="flex md:hidden items-center justify-around bg-slate-950 text-white p-1.5 border-b border-slate-800 shrink-0 z-30 shadow-md">
                    <button
                        type="button"
                        onClick={() => setMobileActiveTab('blocks')}
                        className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            mobileActiveTab === 'blocks' ? 'bg-[#FFCC00] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>1. Blocs</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMobileActiveTab('edit')}
                        className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            mobileActiveTab === 'edit' ? 'bg-[#FFCC00] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span>2. Config & Thème</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMobileActiveTab('preview')}
                        className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            mobileActiveTab === 'preview' ? 'bg-[#FFCC00] text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>3. Aperçu Direct</span>
                    </button>
                </div>

                {/* MAIN STUDIO BUILDER CONTAINER */}
                <div className="flex-1 flex overflow-hidden">

                    {/* 2. LEFT PANEL: DOUBLE COLUMN (LIBRARY + ACTIVE STRUCTURE) */}
                    <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200/80 flex-col shrink-0 ${mobileActiveTab === 'blocks' ? 'flex' : 'hidden md:flex'}`}>
                        
                        {/* Section 1: Library (+ AJOUTER UN BLOC) */}
                        <div className="p-4 border-b border-slate-200/80 bg-slate-50/60">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                                    <span>AJOUTER UN BLOC</span>
                                </span>
                                <button onClick={resetToBaseline} title="Réinitialiser" className="text-[10px] text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors">
                                    <RotateCcw className="w-3 h-3" /> Reset
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                                {availableLibraryBlocks.map((block) => {
                                    const isAdded = (data.sections_json || defaultSections).some(s => s.id === block.id && s.enabled);
                                    return (
                                        <button
                                            key={block.id}
                                            type="button"
                                            onClick={() => addBlockToSections(block)}
                                            className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                                                isAdded 
                                                    ? 'bg-amber-50/80 border-amber-300 text-slate-900 shadow-2xs' 
                                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 shadow-2xs'
                                            }`}
                                        >
                                            <div>
                                                <div className="text-xs font-bold flex items-center gap-1.5">
                                                    <span>{block.name}</span>
                                                    {isAdded && <Check className="w-3.5 h-3.5 text-amber-600" />}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-medium truncate max-w-[180px]">{block.desc}</div>
                                            </div>
                                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                                                <Plus className="w-3.5 h-3.5" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Section 2: Active Structure Reorderable */}
                        <div className="flex-1 p-4 flex flex-col overflow-y-auto">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5 text-slate-600" />
                                    <span>STRUCTURE ({(data.sections_json || defaultSections).length} BLOCS)</span>
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium">Glisser pour réordonner</span>
                            </div>

                            <Reorder.Group 
                                values={data.sections_json || defaultSections} 
                                onReorder={(newOrder) => {
                                    setData('sections_json', newOrder);
                                }}
                                className="space-y-2"
                            >
                                {(data.sections_json || defaultSections).map((sec) => {
                                    const isSelected = selectedBlockId === sec.id;

                                    return (
                                        <Reorder.Item 
                                            key={sec.id} 
                                            value={sec}
                                            dragListener={true}
                                            className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                                                isSelected 
                                                    ? 'bg-amber-100/80 border-amber-400 text-slate-950 shadow-xs ring-1 ring-amber-400' 
                                                    : sec.enabled 
                                                        ? 'bg-white border-slate-200 text-slate-900 hover:border-slate-300 shadow-2xs' 
                                                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                                            }`}
                                            onClick={() => {
                                                setSelectedBlockId(sec.id);
                                                setRightTab('config');
                                                setMobileActiveTab('edit');
                                            }}
                                        >
                                            <div className="flex items-center gap-2.5 truncate">
                                                <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                                <div className="truncate">
                                                    <div className="text-xs font-bold truncate flex items-center gap-1.5">
                                                        <span>{sec.name}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSectionVisibility(sec.id)}
                                                    className={`p-1.5 rounded-lg transition-colors ${sec.enabled ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                                    title={sec.enabled ? "Masquer la section" : "Afficher la section"}
                                                >
                                                    {sec.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => removeBlockFromSections(sec.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Supprimer du canvas"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>
                        </div>
                    </div>

                    {/* 3. CENTER AREA: LIVE INTERACTIVE PREVIEW SANDBOX */}
                    <div className={`flex-1 bg-slate-100/90 p-2 sm:p-8 items-center justify-center overflow-y-auto relative ${mobileActiveTab === 'preview' ? 'flex' : 'hidden md:flex'}`}>
                        
                        <div className={`transition-all duration-300 flex flex-col ${
                            previewDevice === 'mobile' 
                                ? 'w-[380px] h-[720px] rounded-[40px] border-[10px] border-slate-900 shadow-2xl bg-white overflow-hidden relative ring-1 ring-slate-300' 
                                : 'w-full h-full max-w-5xl rounded-2xl border border-slate-300 shadow-xl bg-white overflow-hidden'
                        }`}>
                            
                            {/* Mobile Frame Speaker & Camera Header */}
                            {previewDevice === 'mobile' && (
                                <div className="h-6 bg-slate-900 w-full flex items-center justify-center shrink-0 z-20">
                                    <div className="w-16 h-3 bg-slate-950 rounded-full flex items-center justify-end px-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                                    </div>
                                </div>
                            )}

                            {/* Store Preview Canvas (Simulated Public Storefront) */}
                            <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 font-sans text-xs">
                                <style>{`
                                    ${data.border_radius_style === 'square' ? `
                                        .rounded-2xl, .rounded-3xl, .rounded-full, .rounded-xl {
                                            border-radius: 4px !important;
                                        }
                                    ` : ''}
                                    ${data.font_family && data.font_family !== 'Inter' ? `
                                        body, button, input, textarea, select, h1, h2, h3, h4, h5, h6, span, p, div {
                                            font-family: '${data.font_family}', system-ui, -apple-system, sans-serif !important;
                                        }
                                    ` : ''}
                                `}</style>
                                
                                {/* 1. Announcement Bar */}
                                {data.sections_json?.find(s => s.id === 'banner')?.enabled && (
                                    <div className="bg-slate-900 text-white text-[10px] font-medium py-1.5 px-3 flex items-center justify-between" style={{ backgroundColor: data.theme_color }}>
                                        <span className="font-bold truncate text-slate-950">{data.announcement_header || 'Livraison Offerte dès 25 000 FCFA'}</span>
                                        <span className="text-[9px] font-semibold text-slate-950 opacity-80">100% MoMo</span>
                                    </div>
                                )}

                                {/* Header Navbar */}
                                <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg text-slate-950 font-bold flex items-center justify-center text-xs shadow-xs" style={{ backgroundColor: data.theme_color }}>
                                            {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover rounded-lg" /> : <Store className="w-4 h-4 text-slate-950" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-xs text-slate-900 leading-none">{data.name || 'Ma Boutique'}</div>
                                            <div className="text-[9px] text-slate-500 font-medium">{data.category}</div>
                                        </div>
                                    </div>
                                    <div className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[10px] font-bold border border-slate-200 flex items-center gap-1">
                                        <ShoppingCart className="w-3 h-3 text-slate-600" />
                                        <span>Panier (0)</span>
                                    </div>
                                </div>

                                {/* Dynamic Rendered Sections */}
                                <div className="p-4 space-y-6">
                                    {(data.sections_json || defaultSections).map((sec) => {
                                        if (!sec.enabled) return null;

                                        if (sec.id === 'hero') {
                                            return (
                                                <div 
                                                    key="hero"
                                                    onClick={() => { setSelectedBlockId('hero'); setRightTab('config'); }}
                                                    className={`p-5 rounded-2xl bg-white border shadow-2xs space-y-3 cursor-pointer transition-all ${selectedBlockId === 'hero' ? 'ring-2 ring-amber-400 border-amber-400' : 'border-slate-200'}`}
                                                >
                                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-slate-950 inline-block" style={{ backgroundColor: data.theme_color }}>
                                                        {data.hero_badge_text || 'PROMOTIONS & TENDANCES'}
                                                    </span>
                                                    <h2 className="text-lg font-bold text-slate-950 leading-snug">{data.hero_title || 'Découvrez nos Produits d\'Exception'}</h2>
                                                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{data.hero_subtitle || 'Articles de qualité supérieure expédiés sous 24h-48h.'}</p>
                                                    <button className="px-4 py-2 rounded-xl text-slate-950 font-bold text-xs shadow-xs" style={{ backgroundColor: data.theme_color }}>
                                                        {data.hero_cta_text || 'Acheter Maintenant'} →
                                                    </button>
                                                </div>
                                            );
                                        }

                                        if (sec.id === 'benefits') {
                                            return (
                                                <div 
                                                    key="benefits"
                                                    onClick={() => { setSelectedBlockId('benefits'); setRightTab('config'); }}
                                                    className={`grid grid-cols-2 gap-2 cursor-pointer ${selectedBlockId === 'benefits' ? 'ring-2 ring-amber-400 rounded-xl' : ''}`}
                                                >
                                                    {(data.benefits_json || initialBenefits).map((b, idx) => (
                                                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                                                            <div className="font-bold text-[11px] text-slate-900 truncate">{b.title}</div>
                                                            <div className="text-[9px] text-slate-500 font-medium truncate">{b.subtitle}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }

                                        if (sec.id === 'products') {
                                            return (
                                                <div 
                                                    key="products"
                                                    onClick={() => { setSelectedBlockId('products'); setRightTab('config'); }}
                                                    className={`space-y-3 cursor-pointer p-3 bg-white rounded-2xl border ${selectedBlockId === 'products' ? 'ring-2 ring-amber-400 border-amber-400' : 'border-slate-200'}`}
                                                >
                                                    <div className="font-bold text-sm text-slate-950">Nos produits</div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                        {[1, 2, 3, 4].map((item) => (
                                                            <div key={item} className="p-2 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-center">
                                                                <div className="h-16 bg-slate-200/80 rounded-lg flex items-center justify-center">
                                                                    <ShoppingBag className="w-6 h-6 text-slate-400" />
                                                                </div>
                                                                <div className="font-semibold text-[10px] text-slate-900 truncate">Produit exemple {item}</div>
                                                                <div className="font-bold text-[10px] text-slate-950">2 500 XAF</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (sec.id === 'reviews') {
                                            const realReviews = (reviews && Array.isArray(reviews)) ? reviews.filter(r => r.is_featured !== false) : [];
                                            return (
                                                <div 
                                                    key="reviews"
                                                    onClick={() => { setSelectedBlockId('reviews'); setRightTab('config'); }}
                                                    className={`p-3 bg-white rounded-2xl border space-y-2 cursor-pointer ${selectedBlockId === 'reviews' ? 'ring-2 ring-amber-400 border-amber-400' : 'border-slate-200'}`}
                                                >
                                                    <div className="font-bold text-xs text-slate-950 flex items-center justify-between">
                                                        <span>Avis & Témoignages</span>
                                                        {realReviews.length > 0 && <span className="text-amber-500 text-[10px]">★ 4.8</span>}
                                                    </div>
                                                    {realReviews.length > 0 ? (
                                                        <div className="space-y-1.5">
                                                            {realReviews.slice(0, 2).map((rev, idx) => (
                                                                <div key={rev.id || idx} className="p-2 rounded-xl bg-slate-50 text-[10px] text-slate-700 font-medium">
                                                                    <div className="font-bold flex items-center justify-between">
                                                                        <span>{rev.customer_name}</span>
                                                                        <span className="text-amber-500 text-[9px]">★ {rev.rating || 5}</span>
                                                                    </div>
                                                                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-2.5 rounded-xl bg-slate-50 text-[10px] text-slate-500 font-medium text-center border border-dashed border-slate-200">
                                                            Aucun avis client pour le moment. Vos avis réels s'afficheront ici.
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        if (sec.id === 'about') {
                                            return (
                                                <div 
                                                    key="about"
                                                    onClick={() => { setSelectedBlockId('about'); setRightTab('config'); }}
                                                    className={`p-4 bg-white rounded-2xl border space-y-2 cursor-pointer ${selectedBlockId === 'about' ? 'ring-2 ring-amber-400 border-amber-400' : 'border-slate-200'}`}
                                                >
                                                    <div className="font-bold text-xs text-slate-950">Nous contacter</div>
                                                    <p className="text-[10px] text-slate-600 font-medium line-clamp-2">{data.about_text || "Adresse, téléphone, WhatsApp direct."}</p>
                                                    <div className="text-[10px] font-semibold text-slate-800 flex items-center gap-1">
                                                        <Phone className="w-3 h-3 text-slate-500" />
                                                        <span>{data.phone_whatsapp || '+229 90 00 00 00'}</span>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return null;
                                    })}
                                </div>

                                {/* Reassurance Footer */}
                                <div className="p-4 border-t border-slate-200 text-center text-[9px] text-slate-500 space-y-1 bg-white">
                                    <div>Livraison locale disponible</div>
                                    <div>Paiement Mobile Money & GIMAC - BIOLINKO Pay</div>
                                    <div className="font-bold text-slate-700">Propulsé par BIOLINKO</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. RIGHT PANEL: TABS (CONFIG vs THÈME) */}
                    <div className={`w-full md:w-80 lg:w-96 bg-white border-l border-slate-200/80 flex-col shrink-0 ${mobileActiveTab === 'edit' ? 'flex' : 'hidden md:flex'}`}>
                        
                        {/* Tabs Switcher */}
                        <div className="h-12 border-b border-slate-200/80 flex items-center justify-between px-2 bg-slate-50/80 shrink-0">
                            <button
                                type="button"
                                onClick={() => setRightTab('config')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                    rightTab === 'config' ? 'bg-white text-slate-950 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-900 font-medium'
                                }`}
                            >
                                <Settings className="w-3.5 h-3.5" />
                                <span>Config</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setRightTab('theme')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                                    rightTab === 'theme' ? 'bg-white text-slate-950 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-900 font-medium'
                                }`}
                            >
                                <Palette className="w-3.5 h-3.5" />
                                <span>Thème</span>
                            </button>
                        </div>

                        {/* TAB 1: CONFIG (BLOCK SPECIFIC EDITS) */}
                        {rightTab === 'config' && (
                            <div className="flex-1 p-4 overflow-y-auto space-y-5 text-xs">
                                <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
                                    <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-amber-600">
                                        Configuration : {selectedBlockId.toUpperCase()}
                                    </span>
                                </div>

                                {/* BLOCK: BRAND & LOGO CONFIG */}
                                {selectedBlockId === 'brand' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Nom de la Boutique</label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Lien Sous-Domaine (Slug)</label>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="text"
                                                    value={data.slug}
                                                    onChange={(e) => setData('slug', e.target.value)}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:border-amber-400 focus:bg-white"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Logo de la Boutique</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                    {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-6 h-6 text-slate-400" />}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoFileChange}
                                                    className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-slate-950 hover:file:bg-amber-300 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Bannière de la Boutique</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                                    {bannerPreview ? <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleBannerFileChange}
                                                    className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Catégorie Principale</label>
                                            <input
                                                type="text"
                                                value={data.category}
                                                onChange={(e) => setData('category', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedBlockId === 'hero' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Badge Héro (Bandeau sup.)</label>
                                            <input
                                                type="text"
                                                value={data.hero_badge_text}
                                                onChange={(e) => setData('hero_badge_text', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Titre Principal Héro</label>
                                            <input
                                                type="text"
                                                value={data.hero_title}
                                                onChange={(e) => setData('hero_title', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Sous-titre / Description</label>
                                            <textarea
                                                rows={3}
                                                value={data.hero_subtitle}
                                                onChange={(e) => setData('hero_subtitle', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Texte du Bouton d'Action</label>
                                            <input
                                                type="text"
                                                value={data.hero_cta_text}
                                                onChange={(e) => setData('hero_cta_text', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedBlockId === 'banner' && (
                                    <div>
                                        <label className="block text-slate-700 font-bold mb-1">Texte du Bandeau d'Annonce</label>
                                        <input
                                            type="text"
                                            value={data.announcement_header}
                                            onChange={(e) => setData('announcement_header', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                        />
                                    </div>
                                )}

                                {selectedBlockId === 'about' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Nom de la Boutique</label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">À propos de la boutique</label>
                                            <textarea
                                                rows={3}
                                                value={data.about_text}
                                                onChange={(e) => setData('about_text', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Numéro WhatsApp Direct</label>
                                            <input
                                                type="text"
                                                value={data.phone_whatsapp}
                                                onChange={(e) => setData('phone_whatsapp', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Ville & Pays</label>
                                            <input
                                                type="text"
                                                value={data.city_location}
                                                onChange={(e) => setData('city_location', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Adresse de Livraison / Magasin</label>
                                            <input
                                                type="text"
                                                value={data.location_address}
                                                onChange={(e) => setData('location_address', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Horaires d'Ouverture</label>
                                            <input
                                                type="text"
                                                value={data.opening_hours}
                                                onChange={(e) => setData('opening_hours', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Email de Support Client</label>
                                            <input
                                                type="email"
                                                value={data.support_email}
                                                onChange={(e) => setData('support_email', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedBlockId === 'socials' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">WhatsApp Direct</label>
                                            <input
                                                type="text"
                                                value={data.phone_whatsapp}
                                                onChange={(e) => setData('phone_whatsapp', e.target.value)}
                                                placeholder="+229 90 00 00 00"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Lien Instagram</label>
                                            <input
                                                type="text"
                                                value={data.instagram_link}
                                                onChange={(e) => setData('instagram_link', e.target.value)}
                                                placeholder="https://instagram.com/votre_boutique"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Lien TikTok</label>
                                            <input
                                                type="text"
                                                value={data.tiktok_link}
                                                onChange={(e) => setData('tiktok_link', e.target.value)}
                                                placeholder="https://tiktok.com/@votre_boutique"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-slate-700 font-bold mb-1">Lien Facebook</label>
                                            <input
                                                type="text"
                                                value={data.facebook_link}
                                                onChange={(e) => setData('facebook_link', e.target.value)}
                                                placeholder="https://facebook.com/votre_boutique"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:border-amber-400 focus:bg-white text-xs"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* REVIEWS MODERATION & SELECTION */}
                                {selectedBlockId === 'reviews' && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-slate-900">Avis Clients Réels ({reviews?.length || 0})</div>
                                        </div>

                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                            Seuls les avis authentiques déposés par vos clients apparaissent ci-dessous. Cliquez sur <strong>« Visible »</strong> ou <strong>« Masqué »</strong> pour choisir d'afficher ou masquer un avis sur votre vitrine.
                                        </p>

                                        {reviews && reviews.length > 0 ? (
                                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                                {reviews.map((rev) => (
                                                    <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="font-bold text-slate-900 text-xs truncate max-w-[140px]">{rev.customer_name} ({rev.customer_city || 'Client BIOLINKO'})</div>
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleReviewFeatured(rev.id)}
                                                                    className={`px-2 py-1 rounded font-bold text-[10px] border transition-all cursor-pointer ${
                                                                        rev.is_featured 
                                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                                                                            : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                                                                    }`}
                                                                >
                                                                    {rev.is_featured ? "✓ Visible sur vitrine" : "👁️ Masqué"}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteReview(rev.id)}
                                                                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                                                                    title="Supprimer définitivement"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-[11px] text-slate-600 font-medium italic">"{rev.comment}"</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-slate-50 rounded-xl text-slate-500 text-center font-medium border border-slate-200 text-xs">
                                                Aucun avis client reçu pour le moment. Les avis envoyés par vos clients apparaîtront ici automatiquement.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedBlockId === 'benefits' && (
                                    <div className="space-y-3">
                                        <div className="font-bold text-slate-900">Garanties &amp; Engagements Vendeur (4 items)</div>
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950 font-medium leading-relaxed">
                                            ℹ️ <strong>Note importante :</strong> Toute modification ou retrait des engagements officiels BIOLINKO est soumis à examen et validation sous 48h par l'équipe support.
                                        </div>
                                        {data.benefits_json?.map((benefit, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                                <input
                                                    type="text"
                                                    value={benefit.title}
                                                    onChange={(e) => handleBenefitChange(idx, 'title', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-bold text-xs"
                                                />
                                                <input
                                                    type="text"
                                                    value={benefit.subtitle}
                                                    onChange={(e) => handleBenefitChange(idx, 'subtitle', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 text-[11px]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedBlockId === 'products' && (
                                    <div className="p-4 bg-slate-50 rounded-xl text-slate-500 text-center font-medium border border-slate-200">
                                        Les articles du catalogue s'affichent automatiquement depuis l'onglet Produit.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 2: THÈME (GLOBAL BRANDING & DESIGN SYSTEM) */}
                        {rightTab === 'theme' && (
                            <div className="flex-1 p-4 overflow-y-auto space-y-6 text-xs">
                                
                                <div>
                                    <div className="font-bold text-slate-900 text-sm mb-0.5">Thème de votre vitrine</div>
                                    <p className="text-[11px] text-slate-500 font-medium">Personnalisez les couleurs et le style général de votre boutique.</p>
                                </div>

                                {/* 1. Palettes Suggérées */}
                                <div className="space-y-2.5">
                                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">PALETTES SUGGÉRÉES</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {suggestedPalettes.map((palette) => (
                                            <button
                                                key={palette.name}
                                                type="button"
                                                onClick={() => applyPalette(palette)}
                                                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                                                    data.theme_color === palette.primary 
                                                        ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400 shadow-xs' 
                                                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: palette.primary }}></div>
                                                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: palette.accent }}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-900 truncate">{palette.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Couleurs Personnalisées */}
                                <div className="space-y-3 pt-2 border-t border-slate-200">
                                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">COULEURS PERSONNALISÉES</div>
                                    
                                    <div className="space-y-1.5">
                                        <label className="block text-slate-700 font-bold">Couleur primaire</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={data.theme_color}
                                                onChange={(e) => setData('theme_color', e.target.value)}
                                                className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={data.theme_color}
                                                onChange={(e) => setData('theme_color', e.target.value)}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-slate-700 font-bold">Couleur d'accent</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={data.accent_color}
                                                onChange={(e) => setData('accent_color', e.target.value)}
                                                className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={data.accent_color}
                                                onChange={(e) => setData('accent_color', e.target.value)}
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono uppercase text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Police d'Écriture */}
                                <div className="space-y-2.5 pt-2 border-t border-slate-200">
                                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">POLICE D'ÉCRITURE</div>
                                    <div className="space-y-2">
                                        {[
                                            { id: 'Inter', name: 'BIOLINKO', desc: 'Police officielle BIOLINKO (Inter - Par défaut)' },
                                            { id: 'Outfit', name: 'BIOLINKO', desc: 'Moderne & Élégante (Outfit)' },
                                            { id: 'Plus Jakarta Sans', name: 'BIOLINKO', desc: 'Tech & Clean (Plus Jakarta Sans)' },
                                            { id: 'Roboto', name: 'BIOLINKO', desc: 'Standard Neutre (Roboto)' }
                                        ].map((font) => (
                                            <button
                                                key={font.id}
                                                type="button"
                                                onClick={() => setData('font_family', font.id)}
                                                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                                                    data.font_family === font.id
                                                        ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400 text-slate-950 font-bold shadow-xs'
                                                        : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                                }`}
                                            >
                                                <div>
                                                    <div className="text-sm font-bold">{font.name}</div>
                                                    <div className="text-[10px] text-slate-500 font-medium">{font.desc}</div>
                                                </div>
                                                {data.font_family === font.id && <Check className="w-4 h-4 text-amber-600" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 4. Style de Coins */}
                                <div className="space-y-2.5 pt-2 border-t border-slate-200">
                                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">STYLE DE COINS</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setData('border_radius_style', 'rounded')}
                                            className={`p-3 rounded-xl border text-center font-bold transition-all ${
                                                data.border_radius_style === 'rounded' 
                                                    ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-xs' 
                                                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            Coins arrondis
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('border_radius_style', 'square')}
                                            className={`p-3 rounded-none border text-center font-bold transition-all ${
                                                data.border_radius_style === 'square' 
                                                    ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-xs' 
                                                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            Coins droits
                                        </button>
                                    </div>
                                </div>

                            </div>
                        )}

                    </div>
                </div>

                {/* FLOATING PUBLISH BUTTON FOR MOBILE (< md) */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={processing}
                    className="md:hidden fixed bottom-5 right-5 z-40 px-5 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-2xl flex items-center gap-2 border-2 border-slate-950 cursor-pointer"
                >
                    <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>{processing ? '...' : 'Publier la vitrine'}</span>
                </button>

                {/* SUCCESS SPRING MODAL */}
                <AnimatePresence>
                    {showSuccessModal && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4"
                        >
                            <motion.div 
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.8, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-slate-950 text-center space-y-4 shadow-2xl border border-slate-200"
                            >
                                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold tracking-tight text-slate-950">Vitrine Publiée !</h3>
                                    <p className="text-xs text-slate-600 font-medium">Vos modifications visuelles et vos paramètres de blocs sont désormais en ligne.</p>
                                </div>
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all border border-amber-300"
                                >
                                    Continuer l'Édition
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </AuthenticatedLayout>
    );
}
