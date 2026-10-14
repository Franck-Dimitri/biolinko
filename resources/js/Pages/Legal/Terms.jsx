import { Head, Link } from '@inertiajs/react';
import { Zap, ShieldCheck, FileText, ArrowLeft, ChevronRight } from 'lucide-react';
import Footer from '@/Components/Landing/Footer';

export default function Terms() {
    const lastUpdated = "25 Août 2026";

    const sections = [
        { id: "art1", title: "1. Objet et Présentation de la Plateforme" },
        { id: "art2", title: "2. Inscription et Accès aux Services Vendeurs" },
        { id: "art3", title: "3. Neutralité de la Plateforme & Indépendance des Vendeurs" },
        { id: "art4", title: "4. Modalités de Paiement, Tarifs et Commission" },
        { id: "art5", title: "5. Demandes de Retrait Mobile Money (Portefeuille)" },
        { id: "art6", title: "6. Produits Interdits et Responsabilités du Vendeur" },
        { id: "art7", title: "7. Propriété Intellectuelle" },
        { id: "art8", title: "8. Modification des CGU & Suspension de Compte" },
        { id: "art9", title: "9. Droit Applicable et Juridiction Compétente" },
    ];

    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <Head title="Conditions Générales d'Utilisation (CGU) — BIOLINKO" />

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
                            <FileText className="w-3.5 h-3.5 text-amber-600" />
                            <span>Document Juridique Officiel</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-[#2B2620] tracking-tight">
                            Conditions Générales d'Utilisation (CGU)
                        </h1>
                        <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
                            Règles d'utilisation du service BIOLINKO, des boutiques en ligne, du paiement Mobile Money et des engagements réciproques.
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
                                <ShieldCheck className="w-4 h-4 text-amber-600" />
                                <span>Sommaire du Document</span>
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
                                1. Objet et Présentation de la Plateforme
                            </h2>
                            <p>
                                BIOLINKO est une plateforme SaaS (Logiciel en tant que Service) d'e-commerce permettant aux vendeurs, créateurs, indépendants et entreprises de créer rapidement leur boutique en ligne, d'ajouter des catalogues de produits, de générer des liens d'achat SmartLinks express et d'encaisser par Mobile Money (MTN &amp; Orange Money) via la passerelle partenaire certifiée <span className="font-medium text-slate-800">HR-Skills Pay</span>.
                            </p>
                            <p>
                                Les présentes Conditions Générales d'Utilisation (CGU) régissent sans réserve l'accès et l'utilisation de la plateforme BIOLINKO par tout utilisateur (vendeurs et acheteurs).
                            </p>
                        </section>

                        {/* SECTION 2 */}
                        <section id="art2" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                2. Inscription et Accès aux Services Vendeurs
                            </h2>
                            <p>
                                Pour créer une boutique et accéder au tableau de bord vendeur, l'utilisateur doit remplir le formulaire d'inscription en fournissant des informations exactes et à jour (Nom complet, adresse e-mail valide, numéro WhatsApp actif).
                            </p>
                            <p>
                                L'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion. Toute action réalisée à partir de son compte est réputée effectuée par lui-même.
                            </p>
                        </section>

                        {/* SECTION 3 */}
                        <section id="art3" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                3. Neutralité de la Plateforme &amp; Indépendance des Vendeurs
                            </h2>
                            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-950 text-xs space-y-1">
                                <div className="font-semibold flex items-center gap-1.5 text-amber-900">
                                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                                    <span>Principe Fondamental de Neutralité</span>
                                </div>
                                <p className="text-amber-900/90 leading-relaxed font-normal">
                                    BIOLINKO intervient exclusivement en tant que prestataire technique d'hébergement et d'infrastructure SaaS. BIOLINKO n'est en aucun cas le vendeur direct des biens et services commercialisés sur les vitrines des utilisateurs et ne garantit pas le contenu des offres des vendeurs.
                                </p>
                            </div>
                            <p>
                                Chaque vendeur est entièrement responsable de la conformité des produits qu'il met en ligne, du respect des stocks, des prix affichés, des livraisons et du traitement des réclamations clients.
                            </p>
                        </section>

                        {/* SECTION 4 */}
                        <section id="art4" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                4. Modalités de Paiement, Tarifs et Commission
                            </h2>
                            <p>
                                Les paiements des clients sur les vitrines BIOLINKO s'effectuent par invite USSD Mobile Money direct (MTN Mobile Money &amp; Orange Money). Les transactions sont sécurisées par l'opérateur agréé <span className="font-medium text-slate-800">HR-Skills Pay</span>.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                                <li><span className="font-medium text-slate-800">Tarifs d'Abonnement SaaS :</span> L'accès aux fonctionnalités avancées (personnalisation avancée, SmartLinks illimités, relances WhatsApp) peut faire l'objet de forfaits d'abonnement affichés dans le tableau de bord vendeur.</li>
                                <li><span className="font-medium text-slate-800">Frais de Transaction :</span> Une commission de traitement technique est prélevée sur chaque transaction réussie selon le plan en vigueur.</li>
                            </ul>
                        </section>

                        {/* SECTION 5 */}
                        <section id="art5" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                5. Demandes de Retrait Mobile Money (Portefeuille)
                            </h2>
                            <p>
                                Les sommes perçues par le vendeur lors de ses ventes sont créditées sur son Portefeuille BIOLINKO. Le vendeur peut soumettre à tout moment une demande de retrait vers son numéro Mobile Money vérifié (MTN ou Orange).
                            </p>
                            <p>
                                Les demandes de retrait sont validées après vérification automatisée de sécurité et créditées sur le compte Mobile Money du vendeur dans les meilleurs délais.
                            </p>
                        </section>

                        {/* SECTION 6 */}
                        <section id="art6" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                6. Produits Interdits et Responsabilités du Vendeur
                            </h2>
                            <p>
                                Il est strictement interdit de vendre ou de promouvoir sur BIOLINKO :
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                                <li>Des produits illégaux, contrefaçons ou marchandises volées.</li>
                                <li>Des contenus violents, pornographiques ou incitant à la haine.</li>
                                <li>Des substances médicales ou dangereuses non autorisées.</li>
                                <li>Des systèmes de fraude ou de phishing.</li>
                            </ul>
                            <p className="text-xs text-rose-600 font-medium">
                                Tout manquement à ces règles entraînera le blocage immédiat du compte vendeur et le gel conservatoire des fonds.
                            </p>
                        </section>

                        {/* SECTION 7 */}
                        <section id="art7" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                7. Propriété Intellectuelle
                            </h2>
                            <p>
                                L'ensemble des éléments constituant la plateforme BIOLINKO (interfaces, code source, graphismes, marques, logos) est la propriété exclusive de BIOLINKO. Toute reproduction sans autorisation préalable est interdite.
                            </p>
                        </section>

                        {/* SECTION 8 */}
                        <section id="art8" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                8. Modification des CGU &amp; Suspension de Compte
                            </h2>
                            <p>
                                BIOLINKO se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des mises à jour majeures par publication sur la plateforme.
                            </p>
                        </section>

                        {/* SECTION 9 */}
                        <section id="art9" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                9. Droit Applicable et Juridiction Compétente
                            </h2>
                            <p>
                                Les présentes CGU sont régies et interprétées conformément au droit camerounais. En cas de litige relatif à l'interprétation ou à l'exécution du contrat, les parties s'efforceront de trouver une solution amiable avant de saisir les juridictions compétentes.
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
