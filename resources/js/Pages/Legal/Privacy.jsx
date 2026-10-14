import { Head, Link } from '@inertiajs/react';
import { Zap, ShieldCheck, Lock, ArrowLeft, Mail, ChevronRight } from 'lucide-react';
import Footer from '@/Components/Landing/Footer';

export default function Privacy() {
    const lastUpdated = "25 Août 2026";

    const sections = [
        { id: "art1", title: "1. Collecte des Données Personnelles" },
        { id: "art2", title: "2. Utilisation & Traitement des Données" },
        { id: "art3", title: "3. Transmissions aux Tiers (Paiements MoMo & WhatsApp)" },
        { id: "art4", title: "4. Sécurité & Chiffrement des Transactions" },
        { id: "art5", title: "5. Conservation & Durée de Stockage" },
        { id: "art6", title: "6. Vos Droits (Accès, Rectification & Suppression)" },
        { id: "art7", title: "7. Contact & Délégué à la Protection des Données" },
    ];

    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <Head title="Politique de Confidentialité — BIOLINKO" />

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
                            <Lock className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Protection des Données Personnelles</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-[#2B2620] tracking-tight">
                            Politique de Confidentialité
                        </h1>
                        <p className="text-sm text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
                            Comment BIOLINKO protège vos informations personnelles et garantit la confidentialité des données de vos transactions Mobile Money.
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
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Sommaire Confidentialité</span>
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
                                1. Collecte des Données Personnelles
                            </h2>
                            <p>
                                BIOLINKO collecte les informations strictement nécessaires à la fourniture et au bon fonctionnement de ses services de vente en ligne et d'encaissement.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                                    <div className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Pour les Vendeurs</div>
                                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                                        <li>Nom, prénom, adresse e-mail.</li>
                                        <li>Numéro de téléphone / WhatsApp vérifié.</li>
                                        <li>Informations sur la boutique et catalogue produits.</li>
                                        <li>Numéro Mobile Money (MTN / Orange) pour les retraits.</li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                                    <div className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Pour les Clients Acheteurs</div>
                                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                                        <li>Nom complet et numéro de téléphone de livraison.</li>
                                        <li>Ville et adresse de livraison.</li>
                                        <li>Historique des commandes et références de paiement.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 2 */}
                        <section id="art2" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                2. Utilisation &amp; Traitement des Données
                            </h2>
                            <p>
                                Vos données personnelles sont traitées pour des finalités précises :
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                                <li><span className="font-medium text-slate-800">Traitement des Commandes :</span> Permettre aux vendeurs d'exécuter les livraisons et d'émettre des factures et reçus PDF.</li>
                                <li><span className="font-medium text-slate-800">Initiation des Paiements USSD :</span> Transmettre la demande de débit Mobile Money à l'opérateur via la passerelle sécurisée.</li>
                                <li><span className="font-medium text-slate-800">Notifications &amp; Relances WhatsApp :</span> Informer les acheteurs du statut de leur commande (validation, expédition) et permettre le suivi en direct.</li>
                                <li><span className="font-medium text-slate-800">Sécurité &amp; Prévention des Fraudes :</span> Lutter contre les activités de phishing, de contrefaçon ou d'utilisation frauduleuse de numéros.</li>
                            </ul>
                        </section>

                        {/* SECTION 3 */}
                        <section id="art3" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                3. Transmissions aux Tiers (Paiements MoMo &amp; WhatsApp)
                            </h2>
                            <p>
                                BIOLINKO s'engage fermement à <span className="font-medium text-slate-800">ne jamais vendre, louer ou commercialiser vos données personnelles</span> à des tiers à des fins publicitaires ou de prospection commerciale.
                            </p>
                            <p>
                                Les données sont partagées uniquement avec les partenaires techniques indispensables :
                            </p>
                            <div className="space-y-2.5 text-xs text-slate-600">
                                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-950 font-normal">
                                    <span className="font-semibold text-emerald-900">Passerelle de Paiement HR-Skills Pay &amp; Opérateurs Télécom (MTN / Orange) :</span> Transmission sécurisée des numéros et montants pour la validation de la requête USSD.
                                </div>
                                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-950 font-normal">
                                    <span className="font-semibold text-blue-900">API de Messagerie WhatsApp :</span> Transmission du numéro de téléphone client pour l'envoi automatisé du reçu et des notifications de suivi.
                                </div>
                            </div>
                        </section>

                        {/* SECTION 4 */}
                        <section id="art4" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                4. Sécurité &amp; Chiffrement des Transactions
                            </h2>
                            <p>
                                BIOLINKO met en œuvre des mesures de sécurité techniques et organisationnelles rigoureuses :
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                                <li>Chiffrement SSL/TLS (HTTPS) de bout en bout pour l'ensemble des échanges d'informations.</li>
                                <li>Protection du stockage des mots de passe par hachage fort (Bcrypt).</li>
                                <li>Isolation des bases de données et pare-feu d'application web (WAF).</li>
                            </ul>
                        </section>

                        {/* SECTION 5 */}
                        <section id="art5" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                5. Conservation &amp; Durée de Stockage
                            </h2>
                            <p>
                                Les données relatives aux comptes vendeurs et à l'historique des transactions financières sont conservées pendant toute la durée d'activité du compte, puis stockées sous forme d'archives sécurisées conformément aux obligations légales et comptables en vigueur.
                            </p>
                        </section>

                        {/* SECTION 6 */}
                        <section id="art6" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                6. Vos Droits (Accès, Rectification &amp; Suppression)
                            </h2>
                            <p>
                                Conformément aux réglementations relatives à la protection des données personnelles, vous disposez des droits suivants sur vos données :
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                                <li><span className="font-medium text-slate-800">Droit d'accès et de rectification :</span> Vous pouvez modifier vos informations à tout moment depuis votre profil vendeur.</li>
                                <li><span className="font-medium text-slate-800">Droit de suppression :</span> Vous pouvez demander la clôture de votre compte et l'effacement définitif de vos données.</li>
                            </ul>
                        </section>

                        {/* SECTION 7 */}
                        <section id="art7" className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3.5">
                            <h2 className="text-lg font-bold text-[#2B2620] tracking-tight border-b border-slate-100 pb-3">
                                7. Contact &amp; Délégué à la Protection des Données
                            </h2>
                            <p>
                                Pour toute question concernant la présente Politique de Confidentialité ou pour exercer vos droits, vous pouvez contacter notre équipe support :
                            </p>
                            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-300/70 text-slate-800 text-xs space-y-1">
                                <div className="flex items-center gap-2 text-slate-900 font-medium">
                                    <Mail className="w-4 h-4 text-amber-600" />
                                    <span>E-mail : contact@biolinko.com</span>
                                </div>
                                <div className="text-slate-600 font-normal pt-1">
                                    Support réactif WhatsApp disponible du Lundi au Samedi.
                                </div>
                            </div>
                        </section>

                    </div>
                </main>

                {/* FOOTER UNIFIÉ BIOLINKO */}
                <Footer />
            </div>
        </>
    );
}
