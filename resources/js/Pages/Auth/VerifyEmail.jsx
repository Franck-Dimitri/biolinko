import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, LogOut, Sparkles } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Vérification E-mail — BIOLINKO" />

            <div className="space-y-6 font-sans text-center">
                
                {/* ICON HEADER */}
                <div className="relative inline-block">
                    <div className="w-16 h-16 rounded-3xl bg-[#FFCC00] text-slate-950 font-black flex items-center justify-center mx-auto shadow-lg border border-amber-300">
                        <Mail className="w-8 h-8 text-slate-950" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                        Vérifiez Votre Adresse E-mail
                    </h2>
                    <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                        Merci de vous être inscrit sur BIOLINKO ! Veuillez consulter votre boîte de réception pour valider votre compte vendeur via le code OTP ou le lien de confirmation.
                    </p>
                </div>

                {status === 'verification-link-sent' && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 text-center shadow-2xs">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Un nouveau lien et code de vérification ont été envoyés à votre adresse e-mail.</span>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-amber-300"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Renvoyer l'E-mail de Vérification</span>
                    </button>

                    <div className="pt-2">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Se déconnecter</span>
                        </Link>
                    </div>
                </form>

            </div>
        </GuestLayout>
    );
}
