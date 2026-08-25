import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, Lock, Store, ShoppingCart, CreditCard, Package, Truck, Zap, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Se connecter — BIOLINKO" />

            <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[2.5rem] border border-slate-200/80 shadow-xl overflow-hidden min-h-[640px]">
                    
                    {/* Left Column: Yellow Banner (Chariow Style) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-5 bg-[#FFCC00] p-8 sm:p-12 flex flex-col justify-between relative m-3 rounded-[2rem] overflow-hidden"
                    >
                        <div>
                            <Link href="/" className="inline-flex items-center gap-2 text-slate-950 font-black text-2xl mb-12">
                                <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center text-lg shadow-sm">
                                    ⚡
                                </div>
                                <span>biolinko</span>
                            </Link>

                            <h2 className="text-3xl sm:text-4xl font-black font-serif text-slate-950 tracking-tight leading-snug mb-8">
                                Votre boutique en ligne &amp; encaissement en direct
                            </h2>

                            {/* Category Badges Grid: E-commerce, Boutique, Achats & Paiements */}
                            <div className="flex flex-wrap gap-2.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <Store className="w-3.5 h-3.5 text-amber-600" /> Boutique en Ligne
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <ShoppingCart className="w-3.5 h-3.5 text-blue-600" /> Achat en Ligne
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Paiement MoMo USSD
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <Package className="w-3.5 h-3.5 text-purple-600" /> Catalogue Produits
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Packs SmartLinks
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <Truck className="w-3.5 h-3.5 text-indigo-600" /> Livraison Express
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <ShoppingBag className="w-3.5 h-3.5 text-rose-500" /> Mode &amp; Accessoires
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Cosmétiques &amp; Beauté
                                </span>
                            </div>
                        </div>

                        <div className="pt-12 text-xs font-semibold text-slate-900/80">
                            ⚡ Fast Checkout Mobile Money (MTN &amp; Orange) &amp; Suivi WhatsApp
                        </div>
                    </motion.div>

                    {/* Right Column: Login Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center"
                    >
                        <div className="max-w-md mx-auto w-full">
                            <div className="text-center sm:text-left mb-8">
                                <h1 className="text-3xl font-black text-slate-950 tracking-tight">
                                    Se connecter
                                </h1>
                                <p className="text-sm text-slate-600 mt-2 font-medium">
                                    Pas encore de compte ?{' '}
                                    <Link href={route('register')} className="text-amber-600 font-bold hover:underline">
                                        Créer un compte
                                    </Link>
                                </p>
                            </div>

                            {status && (
                                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-5">
                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Adresse email <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            required
                                            autoFocus
                                            placeholder="votre@email.com"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm font-medium text-slate-900 transition-all outline-none"
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-1.5" />
                                </div>

                                {/* Password Input */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                                            Mot de passe <span className="text-rose-500">*</span>
                                        </label>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                                            >
                                                Mot de passe oublié ?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            required
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm font-medium text-slate-900 transition-all outline-none"
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.password} className="mt-1.5" />
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-400"
                                    />
                                    <label htmlFor="remember" className="ml-2 text-xs font-semibold text-slate-600">
                                        Se souvenir de moi
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 px-6 rounded-xl bg-[#FFCC00] hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-black text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <span>Se connecter</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            {/* Bottom Help Note */}
                            <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
                                Avez-vous besoin d'aide avec votre compte ?{' '}
                                <a href="https://wa.me/" target="_blank" rel="noreferrer" className="text-amber-600 font-bold hover:underline">
                                    Contacter le support WhatsApp ici
                                </a>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </>
    );
}
