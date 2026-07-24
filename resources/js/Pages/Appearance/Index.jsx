import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Palette, Store, Phone, MapPin, Clock, ArrowRight, Check, X, 
    MessageSquare, ExternalLink, Image as ImageIcon, Sparkles, Sliders, Globe, ArrowLeft
} from 'lucide-react';

export default function Index({ store, appUrl }) {
    const user = usePage().props.auth.user;
    const [activeTab, setActiveTab] = useState(1);
    const [logoPreview, setLogoPreview] = useState(store?.logo_url || null);
    const [bannerPreview, setBannerPreview] = useState(store?.banner_url || null);

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
        announcement_header: store?.announcement_header || '⚡ Bienvenue sur notre boutique officielle !',
        instagram_link: store?.instagram_link || '',
        tiktok_link: store?.tiktok_link || '',
        facebook_link: store?.facebook_link || '',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('store.update'));
    };

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
            <Head title="Apparence Boutique — BIOLINKO" />

            <div className="max-w-4xl mx-auto space-y-8 font-sans">
                
                {/* Page Title & View Live Store Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                            Apparence & Configuration Vitrine
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Personnalisez le style, les visuels réels et les coordonnées de votre boutique client.
                        </p>
                    </div>

                    <a
                        href={storeFullUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-5 py-2.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-semibold text-xs shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>Prévisualiser ma vitrine</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                {/* Main Settings Card */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
                    
                    {/* Modern Sleek Tab Indicators (as requested) */}
                    <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab(1)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                activeTab === 1 
                                    ? 'bg-amber-100/70 text-slate-950 border-b-2 border-[#FFCC00]' 
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            1. Identité & Lien URL
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab(2)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                activeTab === 2 
                                    ? 'bg-amber-100/70 text-slate-950 border-b-2 border-[#FFCC00]' 
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            2. Section À propos & Bio
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab(3)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                activeTab === 3 
                                    ? 'bg-amber-100/70 text-slate-950 border-b-2 border-[#FFCC00]' 
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            3. Logo & Bannière (Fichiers)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab(4)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                activeTab === 4 
                                    ? 'bg-amber-100/70 text-slate-950 border-b-2 border-[#FFCC00]' 
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            4. Contacts & Horaires
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab(5)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                activeTab === 5 
                                    ? 'bg-amber-100/70 text-slate-950 border-b-2 border-[#FFCC00]' 
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            5. Header & Réseaux
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                        
                        {/* TAB 1: IDENTITÉ */}
                        {activeTab === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Nom de la Boutique <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        required
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Lien URL personnalisé (Slug) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex items-center">
                                        <span className="px-3.5 py-2.5 rounded-l-xl bg-slate-100 border border-r-0 border-slate-200 text-xs font-mono font-medium text-slate-500">
                                            biolinko.app/
                                        </span>
                                        <input
                                            type="text"
                                            value={data.slug}
                                            required
                                            onChange={(e) => setData('slug', e.target.value)}
                                            className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-200 text-sm font-mono font-semibold text-slate-950 focus:border-amber-400 outline-none"
                                        />
                                    </div>
                                    {errors.slug && <div className="text-xs text-rose-500 mt-1">{errors.slug}</div>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Catégorie Principale <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                    >
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 2: PRÉSENTATION */}
                        {activeTab === 2 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Courte Description Accroche</label>
                                    <input
                                        type="text"
                                        value={data.description}
                                        placeholder="Vente de vêtements haut de gamme à Douala, Cameroun..."
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Section Détaillée "À propos de notre boutique"</label>
                                    <textarea
                                        rows={5}
                                        value={data.about_text}
                                        placeholder="Fondée en 2024, notre boutique vous propose les meilleurs articles certifiés. Livraison rapide dans toutes les villes..."
                                        onChange={(e) => setData('about_text', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 3: VISUELS RÉELS (FILE UPLOADS FOR LOGO & BANNER) */}
                        {activeTab === 3 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Fichier Logo de Boutique (Image réelle)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl">⚡</span>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoFileChange}
                                            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Fichier Bannière d'en-tête (Cover réelle)
                                    </label>
                                    <div className="space-y-3">
                                        {bannerPreview && (
                                            <div className="h-32 w-full rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
                                                <img src={bannerPreview} alt="Bannière" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleBannerFileChange}
                                            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 4: CONTACTS & HORAIRES */}
                        {activeTab === 4 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro WhatsApp Principal</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.phone_whatsapp}
                                            placeholder="+237 6XXXXXXXX"
                                            onChange={(e) => setData('phone_whatsapp', e.target.value)}
                                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Ville & Localisation Physique</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.city_location}
                                            placeholder="Douala, Akwa (Cameroun)"
                                            onChange={(e) => setData('city_location', e.target.value)}
                                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Horaires d'ouverture</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            value={data.opening_hours}
                                            placeholder="Lun - Sam: 08h00 - 18h00"
                                            onChange={(e) => setData('opening_hours', e.target.value)}
                                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 5: HEADER & RÉSEAUX */}
                        {activeTab === 5 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bannière d'Annonce Supérieure</label>
                                    <input
                                        type="text"
                                        value={data.announcement_header}
                                        placeholder="⚡ Livraison gratuite dès 25.000 FCFA d'achat !"
                                        onChange={(e) => setData('announcement_header', e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-amber-400 outline-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                            {activeTab > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(activeTab - 1)}
                                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" /> Précédent
                                </button>
                            ) : <div />}

                            {activeTab < 5 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(activeTab + 1)}
                                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1"
                                >
                                    Suivant <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-[#FFCC00] hover:bg-amber-300 active:scale-95 text-slate-950 font-semibold text-xs shadow-xs transition-all flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Enregistrer la Boutique</span>
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
