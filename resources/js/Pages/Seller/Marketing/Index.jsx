import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Megaphone, Sparkles, BarChart3, ShieldCheck, Check, Save, Lock, ArrowRight } from 'lucide-react';

export default function Index({ store, user, marketing }) {
    const { data, setData, post, processing, errors } = useForm({
        facebook_pixel_id: marketing.facebook_pixel_id || '',
        tiktok_pixel_id: marketing.tiktok_pixel_id || '',
        google_analytics_id: marketing.google_analytics_id || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('seller.marketing.update'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Marketing & Pixels — BIOLINKO" />

            <div className="w-full space-y-8 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                            <span>Marketing & Acquisition Client</span>
                            <Megaphone className="w-6 h-6 text-amber-500" />
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Configurez vos Pixels de suivi Facebook, TikTok et Google Analytics pour optimiser vos campagnes publicitaires.
                        </p>
                    </div>
                </div>

                {!user.has_marketing && (
                    <div className="p-6 rounded-3xl bg-amber-950 text-amber-200 border border-amber-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 font-bold text-amber-300">
                                <Lock className="w-4 h-4 text-amber-400" />
                                <span>Fonctionnalités Marketing Réservez au Plan Pro et Supérieur</span>
                            </div>
                            <p className="text-xs text-amber-300/80">
                                Le suivi par Pixels Facebook/TikTok et le ciblage des paniers abandonnés nécessitent le Plan Pro (7 000 FCFA/mois).
                            </p>
                        </div>
                        <a
                            href={route('seller.subscriptions.index')}
                            className="px-4 py-2.5 rounded-2xl bg-[#FFCC00] text-slate-950 font-bold text-xs shadow-md hover:bg-amber-300 transition-all flex items-center gap-2 shrink-0"
                        >
                            <span>Mettre à Jour Mon Plan</span>
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* FORM SECTION */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
                        <h2 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-amber-500" />
                            <span>Configuration des Pixels Publicitaires</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Facebook Pixel */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-800">
                                    ID Facebook Pixel (Meta Pixel)
                                </label>
                                <input
                                    type="text"
                                    placeholder="ex: 123456789012345"
                                    disabled={!user.has_marketing}
                                    value={data.facebook_pixel_id}
                                    onChange={(e) => setData('facebook_pixel_id', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                                />
                                <p className="text-[11px] text-slate-400">
                                    Permet le suivi des événements `PageView` et `Purchase` dans Facebook Ads Manager.
                                </p>
                            </div>

                            {/* TikTok Pixel */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-800">
                                    ID TikTok Pixel
                                </label>
                                <input
                                    type="text"
                                    placeholder="ex: C123456789ABCDEF"
                                    disabled={!user.has_marketing}
                                    value={data.tiktok_pixel_id}
                                    onChange={(e) => setData('tiktok_pixel_id', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                                />
                                <p className="text-[11px] text-slate-400">
                                    Enregistre automatiquement les conversions issues de vos publicités TikTok Ads.
                                </p>
                            </div>

                            {/* Google Analytics */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-800">
                                    ID Google Analytics (GA4)
                                </label>
                                <input
                                    type="text"
                                    placeholder="ex: G-XXXXXXXXXX"
                                    disabled={!user.has_marketing}
                                    value={data.google_analytics_id}
                                    onChange={(e) => setData('google_analytics_id', e.target.value)}
                                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                                />
                                <p className="text-[11px] text-slate-400">
                                    Mesure le trafic en direct et l'engagement sur votre vitrine e-commerce BIOLINKO.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <button
                                    type="submit"
                                    disabled={!user.has_marketing || processing}
                                    className="px-6 py-3 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4 text-slate-950" />
                                    <span>Enregistrer les Paramètres</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* SIDEBAR TIPS */}
                    <div className="space-y-6">
                        <div className="bg-slate-950 text-white rounded-3xl p-6 space-y-4 shadow-xl">
                            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span>Relance WhatsApp Paniers Abandonnés</span>
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                Lorsqu'un client saisit son numéro mais ne confirme pas son règlement Mobile Money, notre bot WhatsApp lui envoie une relance automatique dans les 15 minutes.
                            </p>
                            <div className="p-3 rounded-2xl bg-white/10 text-[11px] font-bold text-amber-300 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Taux de conversion moyen : +28%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
