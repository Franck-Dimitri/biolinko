import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Folder, GraduationCap, Key, Layers, MessageCircle, Zap, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone_whatsapp: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Créer un compte — BIOLINKO" />

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
                                Créez et vendez vos produits en quelques clics
                            </h2>

                            {/* Category Badges Grid */}
                            <div className="flex flex-wrap gap-2.5">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <Folder className="w-3.5 h-3.5 text-amber-500" /> Fichiers
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> Formations
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <Key className="w-3.5 h-3.5 text-purple-500" /> Licences
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <Layers className="w-3.5 h-3.5 text-emerald-500" /> Bundles
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <MessageCircle className="w-3.5 h-3.5 text-pink-500" /> Coaching
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <Zap className="w-3.5 h-3.5 text-amber-600" /> Services
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <ShoppingBag className="w-3.5 h-3.5 text-rose-500" /> Mode & Luxe
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-bold shadow-xs">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Cosmétiques
                                </span>
                            </div>
                        </div>

                        <div className="pt-12 text-xs font-semibold text-slate-900/80">
                            ⚡ Fast Checkout Mobile Money & Relances WhatsApp
                        </div>
                    </motion.div>

                    {/* Right Column: Register Form */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-center"
                    >
                        <div className="max-w-md mx-auto w-full">
                            <div className="text-center sm:text-left mb-6">
                                <h1 className="text-3xl font-black text-slate-950 tracking-tight">
                                    Créer un compte
                                </h1>
                                <p className="text-sm text-slate-600 mt-1.5 font-medium">
                                    Déjà utilisateur de Biolinko ?{' '}
                                    <Link href={route('login')} className="text-amber-600 font-bold hover:underline">
                                        Connectez-vous ici
                                    </Link>
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                {/* Name Input */}
                                <div>
                                    <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                                        Nom complet ou Nom de la Boutique <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            required
                                            autoFocus
                                            placeholder="ex: Luxe Style & Beauty"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm font-medium text-slate-900 transition-all outline-none"
                                            onChange={(e) => setData('name', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
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
                                            placeholder="votre@email.com"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm font-medium text-slate-900 transition-all outline-none"
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                {/* WhatsApp Phone Input */}
                                <div>
                                    <label htmlFor="phone_whatsapp" className="block text-xs font-bold text-slate-700 mb-1">
                                        Numéro WhatsApp (pour alertes ventes)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <input
                                            id="phone_whatsapp"
                                            type="text"
                                            name="phone_whatsapp"
                                            value={data.phone_whatsapp}
                                            placeholder="+237 6XXXXXXXX / +225 XXXXXXXX"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm font-medium text-slate-900 transition-all outline-none"
                                            onChange={(e) => setData('phone_whatsapp', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.phone_whatsapp} className="mt-1" />
                                </div>

                                {/* Password Inputs Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1">
                                            Mot de passe <span className="text-rose-500">*</span>
                                        </label>
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
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm font-medium text-slate-900 transition-all outline-none"
                                                onChange={(e) => setData('password', e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.password} className="mt-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-xs font-bold text-slate-700 mb-1">
                                            Confirmer mot de passe <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <Lock className="w-4 h-4" />
                                            </div>
                                            <input
                                                id="password_confirmation"
                                                type="password"
                                                name="password_confirmation"
                                                value={data.password_confirmation}
                                                required
                                                placeholder="••••••••"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-sm font-medium text-slate-900 transition-all outline-none"
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.password_confirmation} className="mt-1" />
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="flex items-center pt-1">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        name="terms"
                                        required
                                        checked={data.terms}
                                        onChange={(e) => setData('terms', e.target.checked)}
                                        className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-400"
                                    />
                                    <label htmlFor="terms" className="ml-2 text-xs font-semibold text-slate-600">
                                        J'accepte les termes et conditions d'utilisation
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3.5 px-6 rounded-xl bg-[#FFCC00] hover:bg-amber-300 active:scale-[0.99] text-slate-950 font-black text-sm shadow-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                                >
                                    <span>Créer un compte</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </form>

                            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                                En créant un compte, vous obtenez automatiquement votre lien personnel <span className="font-mono text-slate-800 font-bold">biolinko.app/votre-boutique</span>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </>
    );
}
