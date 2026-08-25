import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, FileText, ArrowLeft, Lock, CheckCircle2, ChevronRight } from 'lucide-react';

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

            <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans flex flex-col justify-between">
                {/* HEADER */}
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <Link href="/" className="inline-flex items-center gap-2 text-slate-950 font-black text-xl">
                            <div className="w-8 h-8 rounded-xl bg-[#FFCC00] text-slate-950 flex items-center justify-center text-sm shadow-xs border border-amber-300">
                                <Zap className="w-4 h-4 fill-slate-950" />
                            </div>
                            <span>biolinko</span>
                        </Link>

                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Retour à l'accueil</span>
                        </Link>
                    </div>
                </header>

                {/* HERO BANNER */}
                <div className="bg-gradient-to-b from-amber-100/60 via-amber-50/30 to-[#FAFAFA] border-b border-slate-200/60 py-12 px-4 sm:px-8">
                    <div className="max-w-4xl mx-auto text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold border border-amber-300 shadow-2xs">
                            <FileText className="w-4 h-4 text-amber-600" />
                            <span>Document Juridique Officiel</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                            Conditions Générales d'Utilisation (CGU)
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
                            Règles d'utilisation du service BIOLINKO, des boutiques en ligne, du paiement Mobile Money et des engagements réciproques.
                        </p>
                        <div className="text-[11px] font-semibold text-slate-500 pt-2">
                            Dernière mise à jour : {lastUpdated}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
                    
                    {/* STICKY SIDEBAR TABLE OF CONTENTS */}
                    <aside className="lg:col-span-4 hidden lg:block">
                        <div className="sticky top-24 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <div className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-amber-600" />
                                <span>Sommaire du Document</span>
                            </div>
                            <nav className="space-y-1">
                                {sections.map((sec) => (
                                    <button
                                        key={sec.id}
                                        onClick={() => scrollTo(sec.id)}
                                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                                    >
                                        <span className="truncate">{sec.title}</span>
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* TEXT CONTENT BODY */}
                    <div className="lg:col-span-8 space-y-10 text-slate-700 leading-relaxed text-sm">
                        
                        {/* SECTION 1 */}
                        <section id="art1" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>1. Objet et Présentation de la Plateforme</span>
                            </h2>
                            <p>
                                BIOLINKO est une plateforme SaaS (Logiciel en tant que Service) d'e-commerce éditée pour permettre aux vendeurs, créateurs, indépendants et entreprises de créer rapidement leur boutique en ligne, d'ajouter des catalogues de produits, de générer des liens d'achat SmartLinks express et de recevoir des paiements par Mobile Money (MTN &amp; Orange Money) via la passerelle partenaire certifiée <strong>HR-Skills Pay</strong>.
                            </p>
                            <p>
                                Les présentes Conditions Générales d'Utilisation (CGU) régissent sans réserve l'accès et l'utilisation de la plateforme BIOLINKO par tout utilisateur (vendeurs et acheteurs).
                            </p>
                        </section>

                        {/* SECTION 2 */}
                        <section id="art2" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>2. Inscription et Accès aux Services Vendeurs</span>
                            </h2>
                            <p>
                                Pour créer une boutique et accéder au tableau de bord vendeur, l'utilisateur doit remplir le formulaire d'inscription en fournissant des informations exactes et à jour (Nom complet, adresse e-mail valide, numéro WhatsApp actif).
                            </p>
                            <p>
                                L'utilisateur est seul responsable de la confidentialité de ses identifiants de connexion. Toute action réalisée à partir de son compte est réputée effectuée par lui-même.
                            </p>
                        </section>

                        {/* SECTION 3 */}
                        <section id="art3" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>3. Neutralité de la Plateforme &amp; Indépendance des Vendeurs</span>
                            </h2>
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold space-y-1">
                                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                                    <span>Principe Fondamental de Neutralité</span>
                                </div>
                                <p className="text-amber-900/90 leading-relaxed">
                                    BIOLINKO intervient exclusivement en tant que prestataire technique d'hébergement et d'infrastructure SaaS. BIOLINKO n'est en aucun cas le vendeur direct des biens et services commercialisés sur les vitrines des utilisateurs et ne garantit pas le contenu des offres des vendeurs.
                                </p>
                            </div>
                            <p>
                                Chaque vendeur est entièrement responsable de la conformité des produits qu'il met en ligne, du respect des stocks, des prix affichés, des livraisons et du traitement des réclamations clients.
                            </p>
                        </section>

                        {/* SECTION 4 */}
                        <section id="art4" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>4. Modalités de Paiement, Tarifs et Commission</span>
                            </h2>
                            <p>
                                Les paiements des clients sur les vitrines BIOLINKO s'effectuent par invite USSD Mobile Money direct (MTN Mobile Money &amp; Orange Money). Les paiements sont sécurisés par l'opérateur agréé <strong>HR-Skills Pay</strong>.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-xs font-medium text-slate-600">
                                <li><strong>Tarifs d'Abonnement SaaS :</strong> L'accès aux fonctionnalités avancées (personnalisation avancée, SmartLinks illimités, relances WhatsApp) peut faire l'objet de forfaits d'abonnement affichés dans le tableau de bord vendeur.</li>
                                <li><strong>Frais de Transaction :</strong> Une commission de traitement technique est prélevée sur chaque transaction réussie selon le plan en vigueur.</li>
                            </ul>
                        </section>

                        {/* SECTION 5 */}
                        <section id="art5" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>5. Demandes de Retrait Mobile Money (Portefeuille)</span>
                            </h2>
                            <p>
                                Les sommes perçues par le vendeur lors de ses ventes sont créditées sur son Portefeuille BIOLINKO. Le vendeur peut soumettre à tout moment une demande de retrait vers son numéro Mobile Money vérifié (MTN ou Orange).
                            </p>
                            <p>
                                Les demandes de retrait sont validées après vérification automatisée de sécurité et créditées sur le compte Mobile Money du vendeur dans les meilleurs délais.
                            </p>
                        </section>

                        {/* SECTION 6 */}
                        <section id="art6" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>6. Produits Interdits et Responsabilités du Vendeur</span>
                            </h2>
                            <p>
                                Il est strictly interdit de vendre ou de promouvoir sur BIOLINKO :
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                                <li>Des produits illégaux, contrefaçons ou marchandises volées.</li>
                                <li>Des contenus violents, pornographiques ou incitant à la haine.</li>
                                <li>Des substances médicales ou dangereuses non autorisées.</li>
                                <li>Des systèmes de fraude ou de phishing.</li>
                            </ul>
                            <p className="text-xs text-rose-600 font-semibold">
                                Tout manquement à ces règles entraînera le blocage immédiat du compte vendeur et le gel conservatoire des fonds.
                            </p>
                        </section>

                        {/* SECTION 7 */}
                        <section id="art7" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>7. Propriété Intellectuelle</span>
                            </h2>
                            <p>
                                L'ensemble des éléments constituant la plateforme BIOLINKO (interfaces, code source, graphismes, marques, logos) est la propriété exclusive de BIOLINKO. Toute reproduction sans autorisation préalable est interdite.
                            </p>
                        </section>

                        {/* SECTION 8 */}
                        <section id="art8" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>8. Modification des CGU &amp; Suspension de Compte</span>
                            </h2>
                            <p>
                                BIOLINKO se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des mises à jour majeures par publication sur la plateforme.
                            </p>
                        </section>

                        {/* SECTION 9 */}
                        <section id="art9" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>9. Droit Applicable et Juridiction Compétente</span>
                            </h2>
                            <p>
                                Les présentes CGU sont régies et interprétées conformément au droit camerounais. En cas de litige relatif à l'interprétation ou à l'exécution du contrat, les parties s'efforceront de trouver une solution amiable avant de saisir les juridictions compétentes.
                            </p>
                        </section>

                    </div>
                </main>

                {/* FOOTER */}
                <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-3">
                    <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-slate-700">
                        <Link href="/conditions-generales" className="hover:text-amber-600 transition-colors">Conditions Générales</Link>
                        <Link href="/politique-de-confidentialite" className="hover:text-amber-600 transition-colors">Politique de Confidentialité</Link>
                        <Link href="/politique-des-cookies" className="hover:text-amber-600 transition-colors">Politique des Cookies</Link>
                    </div>
                    <div>© 2026 BIOLINKO. Tous droits réservés.</div>
                </footer>
            </div>
        </>
    );
}
