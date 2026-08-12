import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, ArrowRight, RefreshCw, CheckCircle2, ShieldCheck, Mail, AlertCircle, Sparkles } from 'lucide-react';

export default function VerifyEmailOtp({ email, status }) {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    const { data, setData, post, processing, errors } = useForm({
        otp: '',
    });

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleDigitChange = (index, value) => {
        const char = value.replace(/[^0-9]/g, '').slice(-1);
        const newDigits = [...digits];
        newDigits[index] = char;
        setDigits(newDigits);

        const fullOtp = newDigits.join('');
        setData('otp', fullOtp);

        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
        if (pastedData) {
            const newDigits = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
            setDigits(newDigits);
            setData('otp', newDigits.join(''));
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.verify_otp'));
    };

    const handleResend = (e) => {
        e.preventDefault();
        if (!canResend) return;
        post(route('verification.resend_otp'), {
            onSuccess: () => {
                setTimer(60);
                setCanResend(false);
            }
        });
    };

    return (
        <GuestLayout>
            <Head title="Vérification par Code OTP — BIOLINKO" />

            <div className="space-y-6 font-sans">
                
                {/* ICON & TITLE BANNER */}
                <div className="text-center space-y-3">
                    <div className="relative inline-block">
                        <div className="w-16 h-16 rounded-3xl bg-[#FFCC00] text-slate-950 font-black flex items-center justify-center mx-auto shadow-lg border border-amber-300">
                            <KeyRound className="w-8 h-8 text-slate-950" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                            <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                            Vérification Sécurisée (OTP)
                        </h2>
                        <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto leading-relaxed">
                            Saisissez le code à 6 chiffres transmis à l'adresse e-mail vendeur :
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs">
                            <Mail className="w-3.5 h-3.5 text-amber-600" />
                            <span>{email}</span>
                        </div>
                    </div>
                </div>

                {/* STATUS ALERT */}
                <AnimatePresence>
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-2xs"
                        >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{status}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ERROR ALERT */}
                {errors.otp && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 shadow-2xs">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{errors.otp}</span>
                    </div>
                )}

                {/* OTP DIGITS FORM */}
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                            {digits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleDigitChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-2xl border transition-all duration-200 outline-none font-mono ${
                                        digit
                                            ? 'bg-amber-50/80 border-[#FFCC00] text-slate-950 shadow-xs'
                                            : 'bg-white border-slate-200 text-slate-900 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing || data.otp.length < 6}
                        className="w-full py-4 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-amber-300"
                    >
                        <span>Activer Mon Compte Vendeur</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {/* RESEND TIMER & ACTION */}
                <div className="pt-5 border-t border-slate-100 text-center space-y-2">
                    <p className="text-xs text-slate-500 font-medium">Vous n'avez pas reçu le code ?</p>
                    <div>
                        {canResend ? (
                            <button
                                onClick={handleResend}
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold transition-all"
                            >
                                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                                <span>Renvoyer un nouveau code OTP</span>
                            </button>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/60">
                                Renvoyer le code dans <strong className="text-amber-700 font-mono font-bold">{timer}s</strong>
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </GuestLayout>
    );
}
