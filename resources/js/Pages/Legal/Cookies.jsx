import { Head, Link } from '@inertiajs/react';
import { Zap, Cookie, ArrowLeft, ChevronRight, Lock } from 'lucide-react';
import Footer from '@/Components/Landing/Footer';

export default function Cookies() {
    const lastUpdated = "25 Août 2026";

    const sections = [
        { id: "art1", title: "1. Qu'est-ce qu'un Cookie ?" },
        { id: "art2", title: "2. Types de Cookies Utilisés sur BIOLINKO" },
        { id: "art3", title: "3. Cookies Essentiels (Fonctionnement & Session)" },
        { id: "art4", title: "4. Cookies d'Analyse et de Performance" },
        { id: "art5", title: "5. Durée de Conservation des Cookies" },
        { id: "art6", title: "6. Comment Gérer et Désactiver les Cookies ?" },
    ];

    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <Head title="Politique des Cookies — BIOLINKO" />

            <div className="min-h-screen bg-[#FAF9F5] text-slate-900 font-sans flex flex-col justify-between">
                {/* HEADER */}
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <Link href="/" className="inline-flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFCC00] shadow-xs">
                                <Zap className="w-4 h-4 fill-[#2B2620] text-[#2B2620]" />
                            </span>
                            <span className="text-xl font-bold tracking-tight text-[#2B2620]">biolinko</span>
                        </Link>

                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Retour à l'accueil</span>
                        </Link>
                    </div>
                </header>

                {/* HERO BANNER */}
                <div className="bg-gradient-to-b from-amber-100/50 via-amber-50/20 to-[#FAF9F5] border-b border-slate-200/60 py-12 px-4 sm:px-8">
                    <div className="max-w-3xl mx-auto text-center space-y-3.5">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-slate-700 text-xs font-medium border border-amber-300/80 shadow-2xs">
                            <Cookie className="w-3.5 h-3.5 text-amber-600" />
                            <span>Gestion des Fichiers Témoins</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-[#2B2620] tracking-tight">
                            Politique de Gestion des Cookies
                        </h1>
                        <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
                            Comprendre comment BIOLINKO utilise les cookies pour assurer la sécurité des sessions, enregistrer vos paniers d'achat et optimiser l'expérience utilisateur.
                        </p>
                        <div className="text-xs text-slate-500 pt-1">
                            Dernière mise à jour : {lastUpdated}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
                    
                    {/* STICKY SIDEBAR TABLE OF CONTENTS */}
                    <aside className="lg:col-span-4 hidden lg:block">
                        <div className="sticky top-24 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                <Cookie className="w-4 h-4 text-amber-600" />
                                <span>Sommaire Cookies</span>
                            </div>
                            <nav className="space-y-1">
                                {sections.map((sec) => (
                                    <button
                                        key={sec.id}
                                        onClick={() => scrollTo(sec.id)}
                                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-normal text-slate-600 hover:text-[#2B2620] hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                                    >
                                        <span className="truncate">{sec.title}</span>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* TEXT CONTENT BODY */}
                    <div className="lg:col-span-8 space-y-8 text-slate-600 leading-relaxed text-sm font-normal">
                        
                        {/* SECTION 1 */}
                        <section id="art1" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                1. Qu'est-ce qu'un Cookie ?
                            </h2>
                            <p>
                                Un cookie (ou fichier témoin) est un petit fichier texte déposé sur votre ordinateur, tablette ou smartphone lors de la consultation d'un site internet. Il permet au serveur de reconnaître votre navigateur, de maintenir votre session ouverte de manière sécurisée et d'enregistrer vos préférences d'utilisation.
                            </p>
                        </section>

                        {/* SECTION 2 */}
                        <section id="art2" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                2. Types de Cookies Utilisés sur BIOLINKO
                            </h2>
                            <p>
                                Sur la plateforme BIOLINKO et les vitrines des vendeurs, nous utilisons uniquement des cookies nécessaires au bon fonctionnement technique du service e-commerce.
                            </p>
                        </section>

                        {/* SECTION 3 */}
                        <section id="art3" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                3. Cookies Essentiels (Fonctionnement &amp; Session)
                            </h2>
                            <p>
                                Ces cookies sont strictement indispensables au fonctionnement du service et ne peuvent pas être désactivés :
                            </p>
                            <div className="space-y-3 pt-2">
                                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                                    <div className="font-semibold text-slate-900 text-xs">Cookie de Session Vendeur (XSRF-TOKEN &amp; Session ID)</div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                        Maintient la connexion sécurisée à votre tableau de bord vendeur et protège contre les attaques de type CSRF (Cross-Site Request Forgery).
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                                    <div className="font-semibold text-slate-900 text-xs">Cookie Panier d'Achat Client (Local Cache)</div>
                                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                                        Conserve la liste des articles ajoutés au panier par l'acheteur lorsqu'il navigue sur la boutique en ligne du vendeur.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 4 */}
                        <section id="art4" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                4. Cookies d'Analyse et de Performance
                            </h2>
                            <p>
                                Ces cookies permettent de mesurer l'audience et l'utilisation de la plateforme de manière anonymisée afin d'améliorer l'expérience utilisateur et les temps de chargement.
                            </p>
                            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950 text-xs">
                                <div className="font-semibold flex items-center gap-1.5 text-emerald-900">
                                    <Lock className="w-4 h-4 text-emerald-600" />
                                    <span>Absence de Tracking Tiers Indésirable</span>
                                </div>
                                <p className="text-emerald-900/90 leading-relaxed pt-1 font-normal">
                                    BIOLINKO n'utilise aucun cookie publicitaire tiers intrusif destiné au profilage commercial à votre insu.
                                </p>
                            </div>
                        </section>

                        {/* SECTION 5 */}
                        <section id="art5" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                5. Durée de Conservation des Cookies
                            </h2>
                            <p>
                                Les cookies de session expirent automatiquement dès la fermeture de votre navigateur. Les cookies de préférences (thème de boutique ou choix d'affichage) sont conservés pour une durée maximale de 12 mois.
                            </p>
                        </section>

                        {/* SECTION 6 */}
                        <section id="art6" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                6. Comment Gérer et Désactiver les Cookies ?
                            </h2>
                            <p>
                                Vous pouvez à tout moment configurer votre navigateur pour accepter, refuser ou supprimer les cookies :
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                                <li><span className="font-medium text-slate-800">Google Chrome :</span> Paramètres &gt; Confidentialité et sécurité &gt; Cookies et autres données de site.</li>
                                <li><span className="font-medium text-slate-800">Safari :</span> Réglages &gt; Safari &gt; Confidentialité et sécurité.</li>
                                <li><span className="font-medium text-slate-800">Mozilla Firefox :</span> Options &gt; Vie privée et sécurité &gt; Cookies et données de sites.</li>
                            </ul>
                            <p className="text-xs text-amber-800 font-normal bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/80">
                                Note : La désactivation complète des cookies essentiels peut empêcher le bon fonctionnement de l'authentification et de la validation des paniers sur les boutiques.
                            </p>
                        </section>

                    </div>
                </main>

                {/* FOOTER UNIFIÉ BIOLINKO */}
                <Footer />
            </div>
        </>
    );
}
