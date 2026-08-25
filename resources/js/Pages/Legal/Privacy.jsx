import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Lock, ArrowLeft, Mail, CheckCircle2, ChevronRight, Eye, Database, Server } from 'lucide-react';

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
                            <Lock className="w-4 h-4 text-emerald-600" />
                            <span>Protection des Données Personnelles</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
                            Politique de Confidentialité
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl mx-auto">
                            Comment BIOLINKO protège vos informations personnelles et garantit la confidentialité des données de vos transactions Mobile Money.
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
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>Sommaire Confidentialité</span>
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
                                <span>1. Collecte des Données Personnelles</span>
                            </h2>
                            <p>
                                BIOLINKO collecte les informations strictement nécessaires à la fourniture et au bon fonctionnement de ses services de vente en ligne et d'encaissement.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                                    <div className="font-extrabold text-slate-950 text-xs uppercase tracking-wider">Pour les Vendeurs</div>
                                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                                        <li>Nom, prénom, adresse e-mail.</li>
                                        <li>Numéro de téléphone / WhatsApp vérifié.</li>
                                        <li>Informations sur la boutique et catalogue produits.</li>
                                        <li>Numéro Mobile Money (MTN / Orange) pour les retraits.</li>
                                    </ul>
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                                    <div className="font-extrabold text-slate-950 text-xs uppercase tracking-wider">Pour les Clients Acheteurs</div>
                                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                                        <li>Nom complet et numéro de téléphone de livraison.</li>
                                        <li>Ville et adresse de livraison.</li>
                                        <li>Historique des commandes et références de paiement.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 2 */}
                        <section id="art2" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>2. Utilisation &amp; Traitement des Données</span>
                            </h2>
                            <p>
                                Vos données personnelles sont traitées pour des finalités précises :
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
                                <li><strong>Traitement des Commandes :</strong> Permettre aux vendeurs d'exécuter les livraisons et d'émettre des factures et reçus PDF.</li>
                                <li><strong>Initiation des Paiements USSD :</strong> Transmettre la demande de débit Mobile Money à l'opérateur via la passerelle sécurisée.</li>
                                <li><strong>Notifications &amp; Relances WhatsApp :</strong> Informer les acheteurs du statut de leur commande (validation, expédition) et permettre le suivi en direct.</li>
                                <li><strong>Sécurité &amp; Prévention des Fraudes :</strong> Lutter contre les activités de phishing, de contrefaçon ou d'utilisation frauduleuse de numéros.</li>
                            </ul>
                        </section>

                        {/* SECTION 3 */}
                        <section id="art3" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>3. Transmissions aux Tiers (Paiements MoMo &amp; WhatsApp)</span>
                            </h2>
                            <p>
                                BIOLINKO s'engage fermement à <strong>ne jamais vendre, louer ou commercialiser vos données personnelles</strong> à des tiers à des fins publicitaires ou de prospection commerciale.
                            </p>
                            <p>
                                Les données sont partagées uniquement avec les partenaires techniques indispensables :
                            </p>
                            <div className="space-y-2 text-xs text-slate-600">
                                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium">
                                    <strong>Passerelle de Paiement HR-Skills Pay &amp; Opérateurs Télécom (MTN / Orange) :</strong> Transmission sécurisée des numéros et montants pour la validation du prompt USSD.
                                </div>
                                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 font-medium">
                                    <strong>API de Messagerie WhatsApp :</strong> Transmission du numéro de téléphone client pour l'envoi automatisé du reçu et des notifications de suivi.
                                </div>
                            </div>
                        </section>

                        {/* SECTION 4 */}
                        <section id="art4" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>4. Sécurité &amp; Chiffrement des Transactions</span>
                            </h2>
                            <p>
                                BIOLINKO met en œuvre des mesures de sécurité techniques et organisationnelles renforcées :
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                                <li>Chiffrement SSL/TLS (HTTPS) de bout en bout pour l'ensemble des échanges d'informations.</li>
                                <li>Protection du stockage des mots de passe par hachage fort (Bcrypt).</li>
                                <li>Isolation des bases de données et pare-feu d'application web (WAF).</li>
                            </ul>
                        </section>

                        {/* SECTION 5 */}
                        <section id="art5" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>5. Conservation &amp; Durée de Stockage</span>
                            </h2>
                            <p>
                                Les données relatives aux comptes vendeurs et à l'historique des transactions financières sont conservées pendant toute la durée d'activité du compte, puis stockées sous forme d'archives sécurisées conformément aux obligations légales et comptables en vigueur.
                            </p>
                        </section>

                        {/* SECTION 6 */}
                        <section id="art6" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>6. Vos Droits (Accès, Rectification &amp; Suppression)</span>
                            </h2>
                            <p>
                                Conformément aux réglementations relatives à la protection des données personnelles, vous disposez des droits suivants sur vos données :
                            </p>
                            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                                <li><strong>Droit d'accès et de rectification :</strong> Vous pouvez modifier vos informations à tout moment depuis votre profil vendeur.</li>
                                <li><strong>Droit de suppression :</strong> Vous pouvez demander la clôture de votre compte et l'effacement définitif de vos données.</li>
                            </ul>
                        </section>

                        {/* SECTION 7 */}
                        <section id="art7" className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
                            <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
                                <span>7. Contact &amp; Délégué à la Protection des Données</span>
                            </h2>
                            <p>
                                Pour toute question concernant la présente Politique de Confidentialité ou pour exercer vos droits, vous pouvez contacter notre équipe support :
                            </p>
                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-slate-950 text-xs font-semibold space-y-1">
                                <div className="flex items-center gap-2 text-slate-900">
                                    <Mail className="w-4 h-4 text-amber-600" />
                                    <span>E-mail : contact@biolinko.app</span>
                                </div>
                                <div className="text-slate-600 font-medium pt-1">
                                    Support réactif WhatsApp disponible du Lundi au Samedi.
                                </div>
                            </div>
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
