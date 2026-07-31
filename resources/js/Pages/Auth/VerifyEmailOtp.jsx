import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, useForm } from '@inertiajs/react';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';

export default function VerifyEmailOtp({ email, status }) {
    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.verify_otp'));
    };

    const handleResend = (e) => {
        e.preventDefault();
        post(route('verification.resend_otp'));
    };

    return (
        <GuestLayout>
            <Head title="Vérification par Code OTP — BIOLINKO" />

            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-[#FFCC00] text-slate-950 font-bold flex items-center justify-center mx-auto shadow-md">
                        <KeyRound className="w-7 h-7 text-slate-950" />
                    </div>
                    <h2 className="text-xl font-black text-slate-950">Vérification de votre E-mail</h2>
                    <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto">
                        Un code de sécurité à 6 chiffres a été envoyé à l'adresse <strong className="text-slate-900">{email}</strong>. Saisissez-le ci-dessous pour activer votre compte vendeur BIOLINKO.
                    </p>
                </div>

                {status && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-800 text-center mb-2">
                            Code de Vérification à 6 Chiffres *
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            required
                            autoFocus
                            placeholder="000000"
                            value={data.otp}
                            onChange={(e) => setData('otp', e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full text-center tracking-[12px] text-2xl font-black px-4 py-3.5 rounded-2xl border border-slate-200 focus:border-amber-400 outline-none text-slate-900 font-mono shadow-inner"
                        />
                        {errors.otp && (
                            <p className="text-xs text-rose-600 font-medium text-center mt-1.5">{errors.otp}</p>
                        )}
                    </div>

                    <PrimaryButton
                        className="w-full py-3.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                        disabled={processing || data.otp.length < 6}
                    >
                        <span>Valider et Activer Mon Compte</span>
                        <ArrowRight className="w-4 h-4" />
                    </PrimaryButton>
                </form>

                <div className="pt-4 border-t border-slate-100 text-center space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Vous n'avez pas reçu le code ?</p>
                    <button
                        onClick={handleResend}
                        disabled={processing}
                        className="text-xs font-bold text-amber-900 hover:text-amber-800 underline inline-flex items-center gap-1"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Renvoyer un nouveau code OTP</span>
                    </button>
                </div>
            </div>
        </GuestLayout>
    );
}
