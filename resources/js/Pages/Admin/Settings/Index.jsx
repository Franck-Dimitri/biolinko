import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Settings, ShieldCheck, DollarSign, CheckCircle2, Zap, Radio, Lock
} from 'lucide-react';

export default function SettingsIndex({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        platform_fee_percent: settings?.platform_fee_percent || 2.0,
        support_email: settings?.support_email || 'support@biolinko.app',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Paramètres Plateforme & APIs — Administration BIOLINKO" />

            <div className="space-y-8 font-sans pb-12">
                {/* HERO BANNER */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FFCC00] text-slate-950 shadow-xs border border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-white text-[11px] font-semibold uppercase tracking-wider">
                            <Settings className="w-3.5 h-3.5 text-[#FFCC00]" /> PARAMÈTRES RÉSEAU &amp; PASSERELLES
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Configuration de la Plateforme BIOLINKO
                        </h2>
                        <p className="text-xs text-slate-900 font-medium">
                            Contrôlez les frais de commission (2%), la passerelle Mobile Money et le statut des microservices.
                        </p>
                    </div>
                </div>

                {/* 4 ALIGNED METRICS CARDS (EXACT CAPTURE 2 STYLE) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Frais Plateforme Ventes</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            {settings?.platform_fee_percent || 2.0}%
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                            Commission Fast Checkout
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Frais Virement Payout</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-emerald-600">
                            1.0% MoMo
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold">
                            Frais de retrait vendeur
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Passerelle Mobile Money</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center">
                                <Zap className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-slate-950">
                            HR-Skills Pay
                        </div>
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Opérationnelle
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                            <span>Passerelle WhatsApp</span>
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                                <Radio className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-semibold text-purple-700">
                            Evolution API
                        </div>
                        <div className="text-[11px] text-purple-700 font-semibold">
                            Node.js WhatsApp Node
                        </div>
                    </div>
                </div>

                {/* SETTINGS CARDS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* PLATFORM CONFIGURATION FORM */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <DollarSign className="w-5 h-5 text-amber-700" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-950 text-sm">Frais &amp; Commissions Vendeurs</h3>
                                <p className="text-xs text-slate-500 font-medium">Taux prélevé sur les commandes Fast Checkout</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                            <div>
                                <label className="block font-bold text-slate-950 mb-1">
                                    Commission BIOLINKO Plateforme (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={data.platform_fee_percent}
                                    onChange={(e) => setData('platform_fee_percent', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none font-mono"
                                />
                                {errors.platform_fee_percent && <div className="text-rose-600 text-[11px] mt-1">{errors.platform_fee_percent}</div>}
                                <p className="text-[10px] text-slate-400 mt-1">Actuellement fixé à 2.0% (Calculé sur les prix d'affichage client).</p>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-950 mb-1">
                                    Email du Support Officiel
                                </label>
                                <input
                                    type="email"
                                    value={data.support_email}
                                    onChange={(e) => setData('support_email', e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-amber-400 outline-none"
                                />
                                {errors.support_email && <div className="text-rose-600 text-[11px] mt-1">{errors.support_email}</div>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                            >
                                Enregistrer les modifications
                            </button>
                        </form>
                    </div>

                    {/* GATEWAYS & SERVICES STATUS CARD */}
                    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                                <Zap className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-950 text-sm">État des Microservices &amp; Passerelles</h3>
                                <p className="text-xs text-slate-500 font-medium">Statut d'intégration en temps réel</p>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-slate-950">Passerelle Mobile Money (HR-Skills Pay)</div>
                                    <div className="text-slate-400 font-mono text-[11px]">{settings?.hrskills_pay_url}</div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Opérationnelle
                                </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-slate-950">Passerelle WhatsApp (Evolution API Node.js)</div>
                                    <div className="text-slate-400 font-mono text-[11px]">{settings?.whatsapp_gateway_url}</div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Connectée
                                </span>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="font-bold text-slate-950">Moteur de Facturation PDF Certifiée</div>
                                    <div className="text-slate-400 text-[11px]">QR Code &amp; Filigrane Officiel</div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Actif
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
