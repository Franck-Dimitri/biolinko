import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Palette, Store, Phone, MapPin, Clock, ArrowRight, Check, X, 
    MessageSquare, ExternalLink, Image as ImageIcon, Sparkles, Sliders, Globe, ArrowLeft,
    Tag, Star, ShieldCheck, Heart, UserCheck, Trash2, Plus, Mail, Layers, CheckCircle2, Eye
} from 'lucide-react';

export default function Index({ store, reviews, appUrl }) {
    const user = usePage().props.auth.user;
    const [activeTab, setActiveTab] = useState('branding'); // 'branding', 'hero', 'benefits', 'reviews', 'about'
    const [logoPreview, setLogoPreview] = useState(store?.logo_url || null);
    const [bannerPreview, setBannerPreview] = useState(store?.banner_url || null);

    // Initial benefits fallback
    const initialBenefits = store?.benefits_json || [
        { title: 'Livraison Express', subtitle: 'Sous 24h à 48h à domicile' },
        { title: 'Paiements Sécurisés MoMo', subtitle: 'Notification Push USSD 30s' },
        { title: 'Satisfait ou Remboursé', subtitle: 'Politique de retour 14 jours' },
        { title: 'Support WhatsApp 7j/7', subtitle: 'Contact direct avec le vendeur' }
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
        phone_whatsapp: store?.phone_whatsapp || user?.phone_whatsapp || '',
        city_location: store?.city_location || '',
        opening_hours: store?.opening_hours || 'Lun - Sam: 08h00 - 18h00',
        announcement_header: store?.announcement_header || '🔥 Offres Solde Exclusives !',
        instagram_link: store?.instagram_link || '',
        tiktok_link: store?.tiktok_link || '',
        facebook_link: store?.facebook_link || '',
        hero_badge_text: store?.hero_badge_text || 'PROMOTIONS & TENDANCES',
        hero_title: store?.hero_title || 'Découvrez nos Produits d\'Exception',
        hero_subtitle: store?.hero_subtitle || 'Articles de qualité supérieure expédiés sous 24h-48h. Paiement Mobile Money direct et sécurisé.',
        hero_cta_text: store?.hero_cta_text || 'Acheter Maintenant',
        benefits_json: initialBenefits,
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

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('appearance.update'));
    };

    const handleToggleFeatured = (reviewId) => {
        useForm().patch(route('appearance.reviews.toggle', reviewId));
    };

    const handleDeleteReview = (reviewId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet avis client ?')) {
            useForm().delete(route('appearance.reviews.destroy', reviewId));
        }
    };

    const colorPalettes = [
        { name: 'Jaune BIOLINKO', hex: '#FFCC00', bg: 'bg-[#FFCC00]' },
        { name: 'Noir Ardoise Luxe', hex: '#0F172A', bg: 'bg-slate-900' },
        { name: 'Rose Tendance', hex: '#E11D48', bg: 'bg-rose-600' },
        { name: 'Vert Émeraude', hex: '#059669', bg: 'bg-emerald-600' },
        { name: 'Bleu Saphir', hex: '#2563EB', bg: 'bg-blue-600' }
    ];

    const categories = [
        "Mode & Accessoires",
        "Cosmétiques & Beauté",
        "Chaussures & Luxe",
        "High-Tech & Gadgets",
        "Formations & Ebooks",
        "Services & Coaching",
        "Autre Commerce"
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Apparence & Personnalisation — BIOLINKO" />

            <div className="w-full space-y-6 font-sans">
                
                {/* Header Title & View Store Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            Studio d'Apparence & Personnalisation Vitrine
                        </h1>
                        <p className="text-slate-500 text-xs font-medium mt-1">
                            Personnalisez le style visuel, la bannière d'accueil, vos engagements et vos coordonnées.
                        </p>
                    </div>

                    <a
                        href={storeFullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-semibold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 border border-amber-300 shrink-0"
                    >
                        <Eye className="w-4 h-4 text-slate-950" />
                        <span>Prévisualiser en Direct</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                </div>

                {/* LIGHT TAB NAVIGATION HEADER */}
                <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => setActiveTab('branding')}
                        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'branding'
                                ? 'bg-[#FFCC00] text-slate-950 font-bold border border-amber-300 shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <Palette className="w-4 h-4 text-slate-900" />
                        <span>1. Marque & Thème Couleur</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('hero')}
                        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'hero'
                                ? 'bg-[#FFCC00] text-slate-950 font-bold border border-amber-300 shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <Sparkles className="w-4 h-4 text-slate-900" />
                        <span>2. Section Hero (Bannière)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('benefits')}
                        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'benefits'
                                ? 'bg-[#FFCC00] text-slate-950 font-bold border border-amber-300 shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4 text-slate-900" />
                        <span>3. Barre des 4 Avantages</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('reviews')}
                        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'reviews'
                                ? 'bg-[#FFCC00] text-slate-950 font-bold border border-amber-300 shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <Star className="w-4 h-4 text-slate-900 fill-slate-900" />
                        <span>4. Sélection des Avis ({reviews ? reviews.length : 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('about')}
                        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'about'
                                ? 'bg-[#FFCC00] text-slate-950 font-bold border border-amber-300 shadow-2xs'
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        <UserCheck className="w-4 h-4 text-slate-900" />
                        <span>5. À Propos & Contact</span>
                    </button>
                </div>

                {/* MAIN FORM CONTAINER */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <AnimatePresence mode="wait">
                        
                        {/* TAB 1: BRANDING & THEME COLOR */}
                        {activeTab === 'branding' && (
                            <motion.div
                                key="tab-branding"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5 shadow-2xs"
                            >
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-bold text-slate-950">Identité Visuelle & Thème Couleur</h3>
                                    <p className="text-xs text-slate-500 font-medium">Configurez le nom, l'URL slug et la couleur dominante de votre boutique</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Nom de la Boutique *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Identifiant Unique (Slug URL) *</label>
                                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden text-xs font-medium">
                                            <span className="px-3 text-slate-400 bg-slate-100 py-2 border-r border-slate-200 shrink-0">biolinko.com/</span>
                                            <input
                                                type="text"
                                                required
                                                value={data.slug}
                                                onChange={(e) => setData('slug', e.target.value)}
                                                className="w-full px-3 py-2 bg-transparent outline-none text-slate-950 font-semibold"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Secteur d'Activité / Catégorie *</label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        >
                                            {categories.map((cat, idx) => (
                                                <option key={idx} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Bandeau d'Annonce Top Bar</label>
                                        <input
                                            type="text"
                                            value={data.announcement_header}
                                            onChange={(e) => setData('announcement_header', e.target.value)}
                                            placeholder="ex: 🔥 Offres Solde Exclusives jusqu'à -50% !"
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Logo & Banner File Uploads */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-medium text-slate-700">Logo de la Boutique (Carré)</label>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                                            <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-slate-300" />}
                                            </div>
                                            <input type="file" accept="image/*" onChange={handleLogoFileChange} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-medium text-slate-700">Bannière de Fond (Optionnelle)</label>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                                            <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                                {bannerPreview ? <img src={bannerPreview} alt="Bannière" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-300" />}
                                            </div>
                                            <input type="file" accept="image/*" onChange={handleBannerFileChange} className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Theme Color Picker */}
                                <div className="space-y-2.5 pt-2">
                                    <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Couleur Thème de la Vitrine Vendeur</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {colorPalettes.map((p, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setData('theme_color', p.hex)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                                                    data.theme_color === p.hex ? 'border-slate-950 ring-2 ring-amber-400 font-bold scale-105' : 'border-slate-200'
                                                }`}
                                            >
                                                <span className={`w-3.5 h-3.5 rounded-full ${p.bg} border border-slate-300`} />
                                                <span>{p.name}</span>
                                            </button>
                                        ))}

                                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium">
                                            <span>Sur mesure:</span>
                                            <input
                                                type="color"
                                                value={data.theme_color}
                                                onChange={(e) => setData('theme_color', e.target.value)}
                                                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 2: HERO SECTION PERSONALIZATION */}
                        {activeTab === 'hero' && (
                            <motion.div
                                key="tab-hero"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5 shadow-2xs"
                            >
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-bold text-slate-950">Personnalisation de la Bannière Hero (Accueil)</h3>
                                    <p className="text-xs text-slate-500 font-medium">Modifiez les textes d'accroche et les boutons de la bannière principale</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Badge Supérieur Hero</label>
                                        <input
                                            type="text"
                                            value={data.hero_badge_text}
                                            onChange={(e) => setData('hero_badge_text', e.target.value)}
                                            placeholder="ex: PROMOTIONS DU MOMENT"
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Titre Principal d'Accroche *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.hero_title}
                                            onChange={(e) => setData('hero_title', e.target.value)}
                                            placeholder="ex: Découvrez nos Produits d'Exception pour Votre Style"
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-950 focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Sous-titre / Description d'Accueil</label>
                                        <textarea
                                            rows={2}
                                            value={data.hero_subtitle}
                                            onChange={(e) => setData('hero_subtitle', e.target.value)}
                                            placeholder="ex: Articles de qualité supérieure expédiés sous 24h-48h. Paiement Mobile Money direct et sécurisé."
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">Texte du Bouton d'Action (CTA)</label>
                                        <input
                                            type="text"
                                            value={data.hero_cta_text}
                                            onChange={(e) => setData('hero_cta_text', e.target.value)}
                                            placeholder="ex: Acheter Maintenant"
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Preview Card for Hero Section */}
                                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-100/40 via-amber-50/20 to-white border border-amber-200 space-y-2 text-slate-950">
                                    <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Aperçu Réel de la Bannière :</div>
                                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFCC00] text-slate-950 font-bold text-[10px] inline-block uppercase">
                                        {data.hero_badge_text || 'PROMOTIONS DU MOMENT'}
                                    </span>
                                    <h4 className="text-lg font-bold text-slate-950 leading-snug">{data.hero_title || 'Titre Hero'}</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{data.hero_subtitle || 'Sous-titre hero...'}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 3: 4 BENEFITS / ENGAGEMENTS CARDS */}
                        {activeTab === 'benefits' && (
                            <motion.div
                                key="tab-benefits"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5 shadow-2xs"
                            >
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-bold text-slate-950">Personnalisation des 4 Engagements Vendeur</h3>
                                    <p className="text-xs text-slate-500 font-medium">Saisissez les 4 arguments de vente affichés sous la bannière d'accueil</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {data.benefits_json && data.benefits_json.map((b, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                                            <div className="text-xs font-bold text-amber-900 uppercase">Bloc d'Engagement #{idx + 1}</div>
                                            
                                            <div>
                                                <label className="block text-[11px] font-medium text-slate-600 mb-1">Titre de l'Avantage</label>
                                                <input
                                                    type="text"
                                                    value={b.title}
                                                    onChange={(e) => handleBenefitChange(idx, 'title', e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:border-amber-400 outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-medium text-slate-600 mb-1">Sous-titre Explicatif</label>
                                                <input
                                                    type="text"
                                                    value={b.subtitle}
                                                    onChange={(e) => handleBenefitChange(idx, 'subtitle', e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 4: REVIEWS SELECTION (NO MANUAL CREATION AS REQUESTED BY USER) */}
                        {activeTab === 'reviews' && (
                            <motion.div
                                key="tab-reviews"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-2xs"
                            >
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-bold text-slate-950">Sélection des Avis Clients Réels à Afficher sur la Vitrine</h3>
                                    <p className="text-xs text-slate-500 font-medium">Activez ou désactivez les avis réels laissés par vos acheteurs pour qu'ils apparaissent en vitrine</p>
                                </div>

                                {reviews && reviews.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {reviews.map((rev) => (
                                            <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-semibold text-xs text-slate-950">{rev.customer_name} ({rev.customer_city || 'Cotonou'})</div>
                                                        <span className="text-[10px] text-amber-600 font-bold">★ {rev.rating}/5</span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 italic font-medium">"{rev.comment}"</p>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleFeatured(rev.id)}
                                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                                            rev.is_featured ? 'bg-[#FFCC00] text-slate-950 border border-amber-300' : 'bg-slate-200 text-slate-600'
                                                        }`}
                                                    >
                                                        <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                                                        <span>{rev.is_featured ? 'Affiché en Vitrine' : 'Masqué de la vitrine'}</span>
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteReview(rev.id)}
                                                        className="text-rose-600 hover:text-rose-800 p-1 text-xs font-semibold flex items-center gap-1"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        <span>Supprimer</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-slate-200">
                                        Aucun avis client disponible pour le moment.
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* TAB 5: ABOUT SECTION WITH CUSTOM VENDOR TEXT EDITOR */}
                        {activeTab === 'about' && (
                            <motion.div
                                key="tab-about"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5 shadow-2xs"
                            >
                                <div className="border-b border-slate-100 pb-3">
                                    <h3 className="text-base font-bold text-slate-950">Section À Propos & Coordonnées Vendeur</h3>
                                    <p className="text-xs text-slate-500 font-medium">Rédigez votre propre texte de présentation et renseignez vos coordonnées réelles</p>
                                </div>

                                <div className="space-y-4">
                                    {/* VENDOR CUSTOM ABOUT TEXT AS DIRECTED BY USER */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-950 mb-1">
                                            Rédaction du Texte de Présentation (À Propos de la Boutique) *
                                        </label>
                                        <textarea
                                            rows={5}
                                            required
                                            value={data.about_text}
                                            onChange={(e) => setData('about_text', e.target.value)}
                                            placeholder="Rédigez ici la présentation personnalisée de votre boutique, votre histoire et vos engagements..."
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium leading-relaxed focus:border-amber-400 outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Numéro WhatsApp Direct *</label>
                                            <input
                                                type="text"
                                                required
                                                value={data.phone_whatsapp}
                                                onChange={(e) => setData('phone_whatsapp', e.target.value)}
                                                placeholder="ex: +229 97 00 00 00"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Ville & Emplacement Physical</label>
                                            <input
                                                type="text"
                                                value={data.city_location}
                                                onChange={(e) => setData('city_location', e.target.value)}
                                                placeholder="ex: Cotonou, Bénin"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Adresse Complète / Quartier</label>
                                            <input
                                                type="text"
                                                value={data.location_address}
                                                onChange={(e) => setData('location_address', e.target.value)}
                                                placeholder="ex: Haie Vive, Rue 12.054"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">Email de Support Direct</label>
                                            <input
                                                type="email"
                                                value={data.support_email}
                                                onChange={(e) => setData('support_email', e.target.value)}
                                                placeholder="ex: contact@maboutique.com"
                                                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    <div className="space-y-2.5 pt-3 border-t border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Réseaux Sociaux Officiels</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-medium text-slate-600 mb-1">Page Instagram</label>
                                                <input
                                                    type="url"
                                                    value={data.instagram_link}
                                                    onChange={(e) => setData('instagram_link', e.target.value)}
                                                    placeholder="https://instagram.com/..."
                                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-medium text-slate-600 mb-1">Compte TikTok</label>
                                                <input
                                                    type="url"
                                                    value={data.tiktok_link}
                                                    onChange={(e) => setData('tiktok_link', e.target.value)}
                                                    placeholder="https://tiktok.com/@..."
                                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-medium text-slate-600 mb-1">Page Facebook</label>
                                                <input
                                                    type="url"
                                                    value={data.facebook_link}
                                                    onChange={(e) => setData('facebook_link', e.target.value)}
                                                    placeholder="https://facebook.com/..."
                                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {/* MAIN SUBMIT BUTTON */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                        <div className="text-xs text-slate-500 font-medium">
                            Enregistrez vos modifications pour mettre à jour la vitrine.
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-3 rounded-xl bg-[#FFCC00] hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 border border-amber-300"
                        >
                            <CheckCircle2 className="w-4 h-4 text-slate-950" />
                            <span>Enregistrer toutes les modifications</span>
                        </button>
                    </div>

                </form>

            </div>
        </AuthenticatedLayout>
    );
}
