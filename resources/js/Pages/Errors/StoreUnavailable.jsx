import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { 
    ShoppingBag, Store, ShieldAlert, Sparkles, Home, 
    ArrowRight, LogIn, Search, PlusCircle, HelpCircle 
} from 'lucide-react';

export default function StoreUnavailable({ reason = 'not_found', storeName, slug }) {
    const reasonsConfig = {
        unpublished: {
            badge: 'Vitrine Privée & En Préparation 🚧',
            badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
            title: storeName ? `La boutique « ${storeName} » arrive très bientôt !` : 'Cette vitrine est en cours de préparation',
            description: "Le marchand configure actuellement ses articles, ses prix et ses offres exclusives. La vitrine ouvrira ses portes très prochainement.",
            icon: Sparkles,
            iconBg: 'bg-amber-100 text-amber-800',
            primaryAction: {
                label: 'Se connecter au Dashboard Marchand',
                href: '/login',
                icon: LogIn,
                style: 'bg-[#FFCC00] hover:bg-amber-300 text-slate-950',
            },
            secondaryAction: {
                label: "Découvrir Biolinko",
                href: '/',
                icon: Home,
            },
            showOwnerNotice: true,
        },
        banned: {
            badge: 'Vitrine Suspendue par Modération 🛡️',
            badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
            title: 'Cette boutique est temporairement suspendue',
            description: "L'accès à cette vitrine a été suspendu par les équipes de conformité BIOLINKO suite à un contrôle de sécurité ou de conformité commerciale.",
            icon: ShieldAlert,
            iconBg: 'bg-rose-100 text-rose-700',
            primaryAction: {
                label: "Retour à l'accueil",
                href: '/',
                icon: Home,
                style: 'bg-slate-950 hover:bg-slate-800 text-white',
            },
            secondaryAction: {
                label: "Contacter le support",
                href: 'mailto:support@biolinko.app',
                icon: HelpCircle,
            },
            showOwnerNotice: false,
        },
        not_found: {
            badge: 'Boutique Introuvable 🔍',
            badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
            title: `Aucune boutique à l'adresse « ${slug || 'inconnue'} »`,
            description: "Le lien que vous avez suivi est peut-être incomplet, la boutique a peut-être changé d'adresse ou ce nom n'a pas encore été réservé.",
            icon: Store,
            iconBg: 'bg-amber-100 text-slate-950',
            primaryAction: {
                label: `Créer la boutique « ${slug || 'votre-nom'} » maintenant`,
                href: '/register',
                icon: PlusCircle,
                style: 'bg-[#FFCC00] hover:bg-amber-300 text-slate-950',
            },
            secondaryAction: {
                label: "Retour à l'accueil",
                href: '/',
                icon: Home,
            },
            showOwnerNotice: false,
        }
    };

    const config = reasonsConfig[reason] || reasonsConfig.not_found;
    const IconComponent = config.icon;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between selection:bg-[#FFCC00] selection:text-slate-950 relative overflow-hidden">
            <Head title={`${config.title} | BIOLINKO`} />

            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-amber-300/20 via-slate-100/10 to-transparent pointer-events-none blur-3xl" />

            {/* HEADER */}
            <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <ApplicationLogo className="w-10 h-10 shadow-xs group-hover:scale-105 transition-transform" />
                    <span className="text-2xl font-black tracking-tight text-slate-950 font-display">
                        biolinko<span className="text-[#FFCC00]">.</span>
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-xs font-extrabold text-slate-700 hover:text-slate-950 transition-colors hidden sm:inline"
                    >
                        Espace Marchand
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-700 hover:text-slate-950 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <Home className="w-3.5 h-3.5 text-amber-500" />
                        <span>Accueil</span>
                    </Link>
                </div>
            </header>

            {/* MAIN CONTENT CARD */}
            <main className="w-full max-w-2xl mx-auto px-6 py-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="bg-white rounded-[32px] p-8 sm:p-12 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-6"
                >
                    {/* ICON */}
                    <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md ${config.iconBg}`}>
                            <IconComponent className="w-8 h-8" />
                        </div>
                    </div>

                    {/* STATUS HEADER */}
                    <div className="space-y-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${config.badgeBg}`}>
                            {config.badge}
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight pt-1">
                            {config.title}
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
                            {config.description}
                        </p>
                    </div>

                    {/* OWNER NOTICE (IF UNPUBLISHED) */}
                    {config.showOwnerNotice && (
                        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left flex items-start gap-3 text-xs text-slate-700 font-medium">
                            <Store className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <strong className="text-slate-950 font-bold block mb-0.5">Vous êtes le propriétaire de cette vitrine ?</strong>
                                Connectez-vous à votre compte vendeur pour voir le rendu en direct grâce au <strong>Mode Prévisualisation</strong> et rendre votre boutique publique en 1 clic.
                            </div>
                        </div>
                    )}

                    {/* ACTION BUTTONS */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        {config.primaryAction && (
                            <Link
                                href={config.primaryAction.href}
                                className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${config.primaryAction.style || 'bg-[#FFCC00] hover:bg-amber-300 text-slate-950 shadow-amber-200/60'}`}
                            >
                                <config.primaryAction.icon className="w-4 h-4" />
                                <span>{config.primaryAction.label}</span>
                            </Link>
                        )}

                        {config.secondaryAction && (
                            <Link
                                href={config.secondaryAction.href}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                                <config.secondaryAction.icon className="w-4 h-4 text-slate-600" />
                                <span>{config.secondaryAction.label}</span>
                            </Link>
                        )}
                    </div>

                    {/* FOOTER SHORTCUTS */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-6 text-xs font-bold text-slate-500">
                        <Link href="/register" className="hover:text-amber-600 transition-colors">
                            Ouvrir une vitrine
                        </Link>
                        <span>•</span>
                        <Link href="/conditions-generales" className="hover:text-amber-600 transition-colors">
                            Conditions &amp; CGU
                        </Link>
                        <span>•</span>
                        <a href="mailto:support@biolinko.app" className="hover:text-amber-600 transition-colors flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Aide &amp; Support</span>
                        </a>
                    </div>
                </motion.div>
            </main>

            {/* FOOTER */}
            <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-slate-400 font-medium">
                © {new Date().getFullYear()} BIOLINKO — La plateforme e-commerce tout-en-un pour créateurs et marchands.
            </footer>
        </div>
    );
}
