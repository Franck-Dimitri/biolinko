import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { 
    ShoppingBag, Home, ArrowLeft, RefreshCw, ShieldAlert, 
    SearchX, ServerCrash, Wrench, Clock, HelpCircle 
} from 'lucide-react';

export default function ErrorIndex({ status = 404 }) {
    const errorConfigs = {
        404: {
            badge: 'Erreur 404 — Introuvable',
            title: 'Oups ! Page Introuvable',
            description: "La page que vous essayez d'atteindre n'existe pas, a été déplacée ou son adresse a été modifiée.",
            icon: SearchX,
            color: 'text-amber-500',
            bgGlow: 'from-amber-400/15',
        },
        403: {
            badge: 'Erreur 403 — Accès Refusé',
            title: 'Accès Réservé ou Non Autorisé',
            description: "Vous ne possédez pas les privilèges suffisants pour consulter cette page ou cette ressource protégée.",
            icon: ShieldAlert,
            color: 'text-rose-500',
            bgGlow: 'from-rose-500/15',
        },
        500: {
            badge: 'Erreur 500 — Incident Serveur',
            title: 'Erreur Serveur Temporaire',
            description: "Une difficulté technique inattendue s'est produite. Nos équipes ont été alertées pour rétablir la situation.",
            icon: ServerCrash,
            color: 'text-amber-600',
            bgGlow: 'from-amber-500/15',
        },
        503: {
            badge: 'Erreur 503 — Maintenance',
            title: 'Plateforme en Maintenance',
            description: "BIOLINKO subit actuellement une mise à niveau pour optimiser vos performances. Nous revenons très vite.",
            icon: Wrench,
            color: 'text-indigo-500',
            bgGlow: 'from-indigo-500/15',
        },
        419: {
            badge: 'Erreur 419 — Session Expirée',
            title: 'Votre Session a Expiré',
            description: "Pour des raisons de sécurité, votre session a été clôturée suite à une période d'inactivité.",
            icon: Clock,
            color: 'text-amber-500',
            bgGlow: 'from-amber-400/15',
        },
    };

    const config = errorConfigs[status] || errorConfigs[404];
    const IconComponent = config.icon;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between selection:bg-[#FFCC00] selection:text-slate-950 relative overflow-hidden">
            <Head title={`${status} — ${config.title} | BIOLINKO`} />

            {/* Background Ambient Glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b ${config.bgGlow} via-transparent to-transparent pointer-events-none blur-3xl`} />

            {/* HEADER */}
            <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <ApplicationLogo className="w-10 h-10 shadow-xs group-hover:scale-105 transition-transform" />
                    <span className="text-2xl font-black tracking-tight text-slate-950 font-display">
                        biolinko<span className="text-[#FFCC00]">.</span>
                    </span>
                </Link>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-slate-950 px-4 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
                >
                    <Home className="w-4 h-4 text-amber-500" />
                    <span>Accueil</span>
                </Link>
            </header>

            {/* MAIN ERROR CARD */}
            <main className="w-full max-w-2xl mx-auto px-6 py-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="bg-white rounded-[32px] p-8 sm:p-12 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-6"
                >
                    {/* ICON BADGE */}
                    <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                        <div className="w-16 h-16 rounded-2xl bg-[#FFCC00] text-slate-950 flex items-center justify-center shadow-md">
                            <IconComponent className="w-8 h-8" />
                        </div>
                    </div>

                    {/* STATUS NUMBER */}
                    <div className="space-y-2">
                        <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider">
                            {config.badge}
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
                            {config.title}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg mx-auto leading-relaxed pt-1">
                            {config.description}
                        </p>
                    </div>

                    {/* ACTIONS BUTTONS */}
                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/"
                            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-200/60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            <Home className="w-4 h-4" />
                            <span>Retour à l'accueil</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-600" />
                            <span>Page précédente</span>
                        </button>

                        {(status === 500 || status === 419) && (
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#18181B] hover:bg-slate-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
                            >
                                <RefreshCw className="w-4 h-4 text-amber-400" />
                                <span>Rafraîchir</span>
                            </button>
                        )}
                    </div>

                    {/* HELPFUL LINKS */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-6 text-xs font-bold text-slate-500">
                        <Link href="/register" className="hover:text-amber-600 transition-colors">
                            Créer ma boutique
                        </Link>
                        <span>•</span>
                        <Link href="/login" className="hover:text-amber-600 transition-colors">
                            Espace Marchand
                        </Link>
                        <span>•</span>
                        <a href="mailto:support@biolinko.app" className="hover:text-amber-600 transition-colors flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Assistance</span>
                        </a>
                    </div>
                </motion.div>
            </main>

            {/* FOOTER */}
            <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-400 font-medium">
                © {new Date().getFullYear()} BIOLINKO — Propulsé avec passion pour le commerce digital.
            </footer>
        </div>
    );
}
