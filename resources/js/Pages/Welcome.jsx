import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowRight, BarChart3, Check, Megaphone, Menu, Package, Plus, Receipt, ShoppingBag, Store, Users, Wallet, X } from 'lucide-react';
import { EASE_OUT } from '@/Components/Motion';
import Footer from '@/Components/Landing/Footer';
import Countries from '@/Components/Landing/Countries';
import {
    BalanceCard, CampaignMock, CursorTag, DashboardPanel, InvoiceMock, LinkMock, OperatorLogo, OrderFeed, OrdersMock, PhoneCheckout, PhoneStore, StatsMock,
} from '@/Components/Landing/Illustrations';

const MODULES = [[Store, 'Boutique'], [Package, 'Catalogue'], [ShoppingBag, 'Commandes'], [Receipt, 'Factures'], [Users, 'Clients'], [Megaphone, 'Marketing'], [Wallet, 'Paiements'], [BarChart3, 'Statistiques']];

const NAV = [['#produit', 'Produit'], ['#demarrer', 'Comment ça marche'], ['#tarifs', 'Tarifs'], ['#pays', 'Pays'], ['#questions', 'Questions']];

// Les nombres viennent de User::PLAN_LIMITS (props partagées) pour rester exacts
const pct = (n) => `${String(n ?? '').replace('.', ',')} %`;
const planFeatures = (L, C = {}) => ({
    starter: [`Commission de ${pct(C.starter)} par vente`, `Jusqu'à ${L.starter?.products} produits`, `${L.starter?.smartlinks} liens de paiement`, 'Paiements MTN MoMo et Orange Money', 'Factures automatiques'],
    pro: [`Commission réduite à ${pct(C.pro)}`, `Jusqu'à ${L.pro?.products} produits`, 'Tailles, couleurs et promotions', 'Factures à votre marque', 'Pixels Facebook et TikTok', `${L.pro?.smartlinks} liens de paiement`, '4 campagnes WhatsApp / mois'],
    growth: ['Tout Pro, plus :', `Commission réduite à ${pct(C.growth)}`, `Jusqu'à ${L.growth?.products} produits`, 'Relance automatique des paniers', 'Liens de paiement illimités', '10 campagnes WhatsApp / mois', 'Support prioritaire'],
    business: ['Tout Growth, plus :', `Commission réduite à ${pct(C.business)}`, 'Produits et stock illimités', 'Export comptable', '25 campagnes WhatsApp / mois', 'Conseiller dédié'],
});

const PLANS = [
    { id: 'starter', name: 'Starter', sub: 'Pour faire vos premières ventes' },
    { id: 'pro', name: 'Pro', sub: 'Pour les commerçants actifs', highlight: true },
    { id: 'growth', name: 'Growth', sub: 'Pour accélérer vos ventes' },
    { id: 'business', name: 'Business', sub: 'Pour les marques établies' },
];

const FAQ = [
    ['Que puis-je faire avec Biolinko ?', 'Créer votre boutique en ligne, gérer votre catalogue et vos stocks, suivre vos commandes, envoyer des factures, garder un fichier client, lancer des campagnes WhatsApp, partager des liens de paiement et encaisser par Mobile Money.'],
    ['Quand est-ce que je reçois mon argent ?', 'Chaque vente payée apparaît tout de suite dans votre solde, puis devient retirable après un court délai de sécurité : 4 jours, puis 2 jours une fois que vous avez livré 10 commandes. Vous la retirez vers MTN MoMo ou Orange Money (3 % de frais de retrait).'],
    ['Combien coûte chaque vente ?', 'L’acheteur paie 3,5 % de frais de service en plus de votre prix. De votre côté, Biolinko prélève une commission qui baisse avec votre formule : 7 % en Starter, 4 % en Pro, 2,5 % en Growth et 1,5 % en Business.'],
    ['Mes clients doivent-ils installer une application ?', 'Non. Ils ouvrent votre lien, choisissent leurs articles et valident la demande de paiement sur leur téléphone.'],
    ['Puis-je utiliser mon logo et mes couleurs ?', 'Oui. Logo, couleurs, catégories et liens vers vos réseaux se règlent en quelques minutes depuis le tableau de bord.'],
    ['Puis-je changer de formule ou arrêter ?', 'Oui, sans engagement. Vous pouvez monter en gamme ou revenir au Starter gratuit à tout moment.'],
];

const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, delay, ease: EASE_OUT },
});

function PrimaryButton({ href, children, className = '' }) {
    return (
        <Link href={href} className={`group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#FFD633] to-[#FFC200] px-6 text-[15px] font-medium text-[#141412] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_10px_24px_-10px_rgba(230,170,0,0.8)] transition-transform hover:-translate-y-0.5 ${className}`}>
            {children} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
    );
}

function SecondaryButton({ href, children, dark = false, className = '' }) {
    return (
        <a href={href} className={`inline-flex h-12 items-center justify-center rounded-full border px-6 text-[15px] font-medium transition-colors ${dark ? 'border-white/20 text-white hover:border-white/50' : 'border-black/15 text-[#141412] hover:border-black/40'} ${className}`}>
            {children}
        </a>
    );
}

function Header({ auth }) {
    const [open, setOpen] = useState(false);
    const cta = auth?.user ? route('dashboard') : route('register');
    return (
        <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/85 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#FFCC00]">
                        <img src="/images/brand/logo-noir.png" alt="" className="h-12 w-12 max-w-none" />
                    </span>
                    <span className="text-[19px] font-semibold tracking-tight text-[#141412]">Biolinko</span>
                </Link>
                <nav className="hidden items-center gap-8 md:flex">
                    {NAV.map(([href, label]) => (
                        <a key={href} href={href} className="text-[15px] text-[#141412]/75 transition-colors hover:text-[#141412]">{label}</a>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    {!auth?.user && <Link href={route('login')} className="hidden text-[15px] text-[#141412]/75 hover:text-[#141412] sm:block">Se connecter</Link>}
                    <Link href={cta} className="hidden h-10 items-center rounded-full bg-[#141412] px-5 text-[14px] font-medium text-white hover:bg-[#2B2A26] sm:flex">
                        {auth?.user ? 'Tableau de bord' : 'Créer ma boutique'}
                    </Link>
                    <button type="button" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 md:hidden">
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-black/5 bg-white md:hidden">
                        <div className="space-y-1 px-5 py-4">
                            {NAV.map(([href, label]) => (
                                <a key={href} href={href} onClick={() => setOpen(false)} className="block py-2.5 text-base text-[#141412]">{label}</a>
                            ))}
                            {!auth?.user && <Link href={route('login')} className="block py-2.5 text-base text-[#141412]/70">Se connecter</Link>}
                            <PrimaryButton href={cta} className="mt-2 w-full">{auth?.user ? 'Tableau de bord' : 'Créer ma boutique'}</PrimaryButton>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}

function Hero({ auth }) {
    const cta = auth?.user ? route('dashboard') : route('register');
    return (
        <section className="relative overflow-hidden bg-white">
            <div className="relative mx-auto max-w-[1200px] border-x border-black/[0.06]">
                <div className="grid lg:grid-cols-2">
                    <div className="px-5 pb-10 pt-16 sm:pt-24 lg:px-8 lg:pb-20">
                        <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-[13px] text-[#5F5E58]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" /> Disponible au Cameroun
                        </motion.span>
                        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: EASE_OUT }}
                            className="mt-6 text-[44px] font-medium leading-[1.02] tracking-[-0.035em] text-[#141412] sm:text-[64px]">
                            Lancez, gérez et développez votre commerce en ligne.
                        </motion.h1>
                        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT }}
                            className="mt-6 max-w-[520px] text-[18px] leading-relaxed text-[#5F5E58]">
                            Boutique, commandes, factures, clients, marketing et paiements : Biolinko réunit tous les outils pour vendre en ligne, dans une seule application.
                        </motion.p>
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: EASE_OUT }}
                            className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <PrimaryButton href={cta}>{auth?.user ? 'Aller au tableau de bord' : 'Créer ma boutique gratuitement'}</PrimaryButton>
                            <SecondaryButton href="#tarifs">Voir les tarifs</SecondaryButton>
                        </motion.div>
                    </div>

                    <div className="relative hidden flex-col justify-between border-l border-dashed border-black/10 px-8 pb-20 pt-24 lg:flex">
                        <OrderFeed />
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                            <p className="max-w-[420px] text-[16px] leading-relaxed text-[#5F5E58]">
                                Pensé pour les vendeurs de <span className="text-[#141412]">WhatsApp, Instagram et TikTok</span> qui veulent passer à une <span className="text-[#141412]">vraie boutique</span>.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-2">
                                {MODULES.map(([Icon, label]) => (
                                    <span key={label} className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-[14px] text-[#3D3C37]"><Icon className="h-4 w-4 text-[#8B8A83]" /> {label}</span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Composition produit : tableau de bord, solde en direct, vitrine mobile */}
            <div className="relative mx-auto max-w-[1200px] px-5 pb-6 lg:px-8">
                <div aria-hidden className="absolute inset-x-0 bottom-0 top-24 bg-[linear-gradient(to_bottom,#fff,#F6F5F1)]" />
                <div className="relative grid items-start gap-5 md:grid-cols-[1fr_1.05fr_0.8fr]">
                    <motion.div {...reveal(0.3)} className="hidden md:block md:pt-14"><DashboardPanel className="shadow-[0_20px_50px_-30px_rgba(20,20,10,0.3)]" /></motion.div>
                    <motion.div {...reveal(0.4)} className="relative z-10"><BalanceCard /></motion.div>
                    <motion.div {...reveal(0.5)} className="hidden md:block md:pt-8"><PhoneStore /></motion.div>
                </div>
            </div>
        </section>
    );
}

function FeatureCard({ title, text, children, className = '', delay = 0, visualClass = '' }) {
    return (
        <motion.article {...reveal(delay)} className={`relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-3xl border border-black/[0.06] bg-[#F6F5F1] ${className}`}>
            <div className={`relative flex flex-1 items-center justify-center px-6 pt-8 ${visualClass}`}>{children}</div>
            <div className="relative px-7 pb-7 pt-6">
                <h3 className="text-[19px] font-medium text-[#141412]">{title}</h3>
                <p className="mt-1.5 max-w-[440px] text-[15px] text-[#5F5E58]">{text}</p>
            </div>
        </motion.article>
    );
}

function Bento() {
    return (
        <section id="produit" className="scroll-mt-20 bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
                <motion.h2 {...reveal()} className="max-w-[720px] text-[38px] font-medium leading-[1.05] tracking-[-0.03em] text-[#141412] sm:text-[52px]">
                    Une seule application pour tout votre commerce
                </motion.h2>
                <motion.p {...reveal(0.1)} className="mt-5 max-w-[580px] text-[18px] text-[#5F5E58]">
                    De la vitrine à la livraison, en passant par la facture et la relance client : arrêtez de jongler entre WhatsApp, un cahier et la calculatrice.
                </motion.p>

                <div className="mt-14 grid gap-4 lg:grid-cols-6">
                    <FeatureCard className="lg:col-span-3" title="Une boutique en ligne à votre image"
                        text="Logo, couleurs, catalogue avec tailles et couleurs, promotions, avis clients. Prête en quelques minutes, sans site à construire.">
                        <PhoneStore className="w-[230px] translate-y-8" />
                    </FeatureCard>
                    <FeatureCard className="lg:col-span-3" delay={0.08} title="Toutes vos commandes au même endroit"
                        text="Statuts en temps réel, de « payée » à « livrée ». Vos clients suivent leur commande avec un simple lien.">
                        <OrdersMock className="max-w-[380px]" />
                    </FeatureCard>

                    <FeatureCard className="lg:col-span-2" title="Factures et relances"
                        text="Factures automatiques ou manuelles, envoyées par WhatsApp et e-mail, avec relance des impayés.">
                        <InvoiceMock />
                    </FeatureCard>
                    <FeatureCard className="lg:col-span-2" delay={0.06} title="Clients et campagnes WhatsApp"
                        text="Un fichier client construit tout seul à chaque commande. Envoyez vos nouveautés aux bons clients.">
                        <CampaignMock />
                    </FeatureCard>
                    <FeatureCard className="lg:col-span-2" delay={0.12} title="Liens de paiement et packs"
                        text="Un lien pour un produit ou un pack à prix réduit, à coller dans une story ou une conversation.">
                        <LinkMock />
                    </FeatureCard>

                    <FeatureCard className="lg:col-span-4" title="Encaissez sans courir après l’argent"
                        text="Vos clients paient par MTN MoMo ou Orange Money depuis votre boutique. L’argent arrive sur votre solde, vous le retirez quand vous voulez."
                        visualClass="!items-start">
                        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                        <div className="relative flex flex-wrap justify-center gap-3 pt-4">
                            {['MTN', 'ORANGE', 'WHATSAPP', 'INSTAGRAM', 'TIKTOK', 'FACEBOOK'].map((op, i) => (
                                <motion.span key={op} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.07, ease: EASE_OUT }}
                                    whileHover={{ y: -4 }}
                                    className="flex h-20 w-20 items-center justify-center rounded-2xl border border-black/5 bg-gradient-to-b from-white to-[#F1F0EA] shadow-[0_8px_20px_-12px_rgba(20,20,10,0.35)]">
                                    <OperatorLogo op={op} className="h-11 w-11" />
                                </motion.span>
                            ))}
                        </div>
                        <CursorTag label="Votre client" className="left-[12%] top-[62%] hidden sm:block" />
                        <CursorTag label="Vous" color="#FFFFFF" className="right-[14%] top-[66%] hidden sm:block" path={{ x: [0, -24, 0], y: [0, 10, 0] }} delay={1.2} />
                    </FeatureCard>
                    <FeatureCard className="lg:col-span-2" delay={0.08} title="Marketing et statistiques"
                        text="Pixels Facebook, TikTok et Google, relance des paniers abandonnés, export de vos ventes.">
                        <StatsMock className="max-w-[300px]" />
                    </FeatureCard>
                </div>
            </div>
        </section>
    );
}

function Journey({ auth }) {
    const cta = auth?.user ? route('dashboard') : route('register');
    const steps = [
        { title: 'Créez votre boutique', text: 'Ajoutez vos produits, votre logo et vos couleurs en quelques minutes, depuis votre téléphone.', visual: <div className="flex h-full justify-center px-6 pt-8"><PhoneStore className="h-fit w-[230px]" /></div> },
        { title: 'Partagez et vendez', text: 'Votre lien sur WhatsApp, Instagram ou TikTok. Le client commande et paie en une minute.', visual: <div className="flex h-full justify-center pt-8"><PhoneCheckout dark className="h-fit w-[230px]" /></div> },
        { title: 'Gérez et développez', text: 'Commandes, factures, clients et statistiques dans votre tableau de bord. Relancez, analysez, grandissez.', visual: <div className="flex h-full items-end justify-center px-6 pt-8"><DashboardPanel className="w-full max-w-[300px] translate-y-10" /></div> },
    ];
    return (
        <section id="demarrer" className="relative scroll-mt-20 overflow-hidden bg-[#0F0F0E] py-24 text-white sm:py-32">
            <div aria-hidden className="absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-[#FFB800]/20 blur-[120px]" />
            <div className="relative mx-auto max-w-[1200px] px-5 lg:px-8">
                <motion.h2 {...reveal()} className="mx-auto max-w-[620px] text-center text-[38px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
                    De l’inscription à la première vente
                </motion.h2>
                <motion.p {...reveal(0.1)} className="mx-auto mt-5 max-w-[520px] text-center text-[18px] text-white/60">
                    Trois étapes, sans compétence technique.
                </motion.p>

                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {steps.map((s, i) => (
                        <motion.div key={s.title} {...reveal(i * 0.12)}>
                            <div className="h-[320px] overflow-hidden rounded-3xl border border-white/[0.06] bg-[#171715]">{s.visual}</div>
                            <div className="mt-6 text-center">
                                <h3 className="text-[18px] font-medium">{s.title}</h3>
                                <p className="mx-auto mt-2 max-w-[320px] text-[15px] leading-relaxed text-white/55">{s.text}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div {...reveal()} className="mt-14 flex justify-center">
                    <PrimaryButton href={cta}>Commencer maintenant</PrimaryButton>
                </motion.div>
            </div>
        </section>
    );
}

// « Avez-vous déjà un compte ? » : le plan choisi suit le visiteur jusqu'à la page d'abonnement.
function PlanAccountModal({ plan, onClose }) {
    return (
        <AnimatePresence>
            {plan && (
                <motion.div key="plan-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    onClick={onClose} className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4">
                    <motion.div role="dialog" aria-modal="true" aria-labelledby="plan-modal-title" onClick={(e) => e.stopPropagation()}
                        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full max-w-md rounded-t-3xl bg-white p-7 sm:rounded-3xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF8D6] px-3 py-1 text-[13px] font-medium text-[#141412]">
                                    Plan {plan.name} · {plan.price.toLocaleString('fr-FR')} FCFA / mois
                                </span>
                                <h3 id="plan-modal-title" className="mt-4 text-[24px] font-medium tracking-[-0.02em] text-[#141412]">Avez-vous déjà un compte Biolinko ?</h3>
                            </div>
                            <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5"><X className="h-5 w-5" /></button>
                        </div>
                        <p className="mt-2 text-[15px] text-[#5F5E58]">Votre choix est gardé : vous arriverez directement sur le paiement de votre abonnement.</p>
                        <div className="mt-6 grid gap-3">
                            <Link href={route('login', { plan: plan.id })} className="group flex items-center justify-between rounded-2xl border border-black/10 p-4 hover:border-black/30">
                                <span><span className="block text-[16px] font-medium text-[#141412]">Oui, je me connecte</span><span className="text-[14px] text-[#5F5E58]">Puis je choisis ma durée et je paie</span></span>
                                <ArrowRight className="h-5 w-5 text-[#141412] transition-transform group-hover:translate-x-0.5" />
                            </Link>
                            <Link href={route('register', { plan: plan.id })} className="group flex items-center justify-between rounded-2xl bg-[#141412] p-4 text-white hover:bg-[#2B2A26]">
                                <span><span className="block text-[16px] font-medium">Non, je crée mon compte</span><span className="text-[14px] text-white/60">Gratuit, en 1 minute, puis paiement du plan</span></span>
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function Pricing({ auth }) {
    const prices = usePage().props.planPrices || {};
    const pay = usePage().props.payments || {};
    const features = planFeatures(usePage().props.planLimits || {}, pay.commission_percent || {});
    const [yearly, setYearly] = useState(false);
    const [chosen, setChosen] = useState(null); // plan payant choisi par un visiteur non connecté

    // Connecté : directement l'abonnement. Visiteur : on lui demande s'il a déjà un compte.
    const planHref = (p, base) => {
        if (base === 0) return auth?.user ? route('dashboard') : route('register');
        return auth?.user ? route('seller.subscriptions.index', { plan: p.id }) : null;
    };

    return (
        <section id="tarifs" className="scroll-mt-20 bg-white py-24 sm:py-32">
            <PlanAccountModal plan={chosen} onClose={() => setChosen(null)} />
            <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
                <div className="flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <motion.h2 {...reveal()} className="text-[38px] font-medium leading-[1.05] tracking-[-0.03em] text-[#141412] sm:text-[52px]">Des tarifs simples</motion.h2>
                        <motion.p {...reveal(0.1)} className="mt-4 max-w-[480px] text-[18px] text-[#5F5E58]">Commencez gratuitement. Passez à la formule supérieure quand vos ventes décollent.</motion.p>
                    </div>
                    <div className="flex rounded-full border border-black/10 bg-[#F6F5F1] p-1" role="group" aria-label="Période de facturation">
                        {[[false, 'Mensuel'], [true, 'Annuel · −15 %']].map(([val, label]) => (
                            <button key={label} type="button" onClick={() => setYearly(val)} aria-pressed={yearly === val}
                                className={`relative rounded-full px-4 py-2 text-[14px] transition-colors ${yearly === val ? 'text-[#141412]' : 'text-[#5F5E58]'}`}>
                                {yearly === val && <motion.span layoutId="billing" className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                                <span className="relative">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {PLANS.map((p, i) => {
                        const base = Number(prices[p.id] ?? 0);
                        const price = yearly ? Math.round(base * 0.85) : base;
                        return (
                            <motion.article key={p.id} {...reveal(i * 0.06)}
                                className={`relative flex flex-col rounded-3xl border p-7 ${p.highlight ? 'border-[#FFCC00] bg-[#FFFCEF] shadow-[0_20px_50px_-30px_rgba(230,170,0,0.6)]' : 'border-black/[0.08] bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <p className="text-[17px] font-medium text-[#141412]">{p.name}</p>
                                    {p.highlight && <span className="rounded-full bg-[#FFCC00] px-2.5 py-0.5 text-[12px] font-medium text-[#141412]">Populaire</span>}
                                </div>
                                <p className="mt-1 text-[14px] text-[#5F5E58]">{p.sub}</p>
                                <p className="mt-6 flex items-baseline gap-1.5 text-[#141412]">
                                    <motion.span key={price} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[40px] font-medium tracking-[-0.03em] tabular-nums">
                                        {price.toLocaleString('fr-FR')}
                                    </motion.span>
                                    <span className="text-[14px] text-[#5F5E58]">FCFA / mois</span>
                                </p>
                                {(() => {
                                    const href = planHref(p, base);
                                    const cls = `mt-6 flex h-11 w-full items-center justify-center rounded-full text-[14px] font-medium transition-colors ${p.highlight ? 'bg-[#141412] text-white hover:bg-[#2B2A26]' : 'border border-black/15 text-[#141412] hover:border-black/40'}`;
                                    const label = base === 0 ? 'Commencer gratuitement' : `Choisir ${p.name}`;
                                    return href
                                        ? <Link href={href} className={cls}>{label}</Link>
                                        : <button type="button" onClick={() => setChosen({ ...p, price: base })} className={cls}>{label}</button>;
                                })()}
                                <ul className="mt-7 space-y-3 text-[14px] text-[#3D3C37]">
                                    {features[p.id].map((f) => (
                                        <li key={f} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C99A00]" />{f}</li>
                                    ))}
                                </ul>
                            </motion.article>
                        );
                    })}
                </div>
                <p className="mt-6 text-[14px] text-[#8B8A83]">Toutes les formules : {pct(pay.client_fee_percent)} de frais de service payés par l’acheteur, {pct(pay.withdrawal_fee_percent)} de frais par retrait. Sans engagement.</p>
            </div>
        </section>
    );
}

function Faq() {
    const [open, setOpen] = useState(0);
    return (
        <section id="questions" className="scroll-mt-20 border-t border-black/[0.06] bg-white py-24 sm:py-32">
            <div className="mx-auto grid max-w-[1200px] gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
                <div>
                    <motion.h2 {...reveal()} className="text-[38px] font-medium leading-[1.05] tracking-[-0.03em] text-[#141412] sm:text-[52px]">Questions fréquentes</motion.h2>
                    <motion.p {...reveal(0.1)} className="mt-4 text-[17px] text-[#5F5E58]">Une autre question ? L’équipe vous répond sur WhatsApp.</motion.p>
                </div>
                <ul className="divide-y divide-black/[0.08] border-y border-black/[0.08]">
                    {FAQ.map(([q, a], i) => {
                        const isOpen = open === i;
                        return (
                            <li key={q}>
                                <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
                                    className="flex w-full items-center justify-between gap-6 py-6 text-left">
                                    <span className="text-[17px] font-medium text-[#141412]">{q}</span>
                                    <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="shrink-0 text-[#5F5E58]"><Plus className="h-5 w-5" /></motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE_OUT }} className="overflow-hidden">
                                            <p className="max-w-[620px] pb-6 text-[16px] leading-relaxed text-[#5F5E58]">{a}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

function FinalCta({ auth }) {
    const cta = auth?.user ? route('dashboard') : route('register');
    return (
        <section className="bg-white px-5 pb-24 lg:px-8">
            <motion.div {...reveal()} className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px] bg-[#0F0F0E] px-6 py-20 text-center sm:px-12">
                <div aria-hidden className="absolute left-1/2 top-full h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFB800]/30 blur-[110px]" />
                <h2 className="relative mx-auto max-w-[640px] text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-white sm:text-[52px]">
                    Votre commerce en ligne, prêt aujourd’hui.
                </h2>
                <p className="relative mx-auto mt-5 max-w-[460px] text-[18px] text-white/60">Créez votre boutique gratuitement. Aucune carte bancaire demandée.</p>
                <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                    <PrimaryButton href={cta}>Créer ma boutique</PrimaryButton>
                    <SecondaryButton dark href="https://wa.me/237600000000?text=Bonjour%20Biolinko">Parler à l’équipe</SecondaryButton>
                </div>
            </motion.div>
        </section>
    );
}

export default function Welcome({ auth }) {
    return (
        <MotionConfig reducedMotion="user">
            <Head title="Biolinko, la plateforme pour vendre en ligne">
                <meta name="description" content="Boutique en ligne, commandes, factures, clients, marketing et paiements Mobile Money : tous les outils pour vendre en ligne au Cameroun." />
            </Head>
            <div className="min-h-screen bg-white font-poppins text-[#141412] antialiased selection:bg-[#FFCC00]/60">
                <Header auth={auth} />
                <main>
                    <Hero auth={auth} />
                    <Bento />
                    <Journey auth={auth} />
                    <Pricing auth={auth} />
                    <Countries />
                    <Faq />
                    <FinalCta auth={auth} />
                </main>
                <Footer />
            </div>
        </MotionConfig>
    );
}
