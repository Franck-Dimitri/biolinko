import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    BadgePercent, Bell, ChevronDown, Boxes, CalendarClock, ChartColumn, FileSpreadsheet, FileText, Flag, Globe, HandCoins, Images, Layers, LayoutTemplate,
    Link2, Megaphone, Eye, Palette, PackageCheck, Receipt, RefreshCcw, Repeat, Search, ShieldCheck, ShoppingCart, Star, Tag, Target, Truck, Undo2, Wallet,
} from 'lucide-react';
import { EASE_OUT } from '@/Components/UI/Motion';

// Uniquement des fonctionnalités réellement présentes dans Biolinko
const GROUPS = [
    ['boutique', 'Boutique', [
        [Palette, 'Votre marque', 'Logo, couleurs, police et coins arrondis ou carrés.'],
        [LayoutTemplate, 'Sections modulables', 'Bandeau, héro, promotions, avis, à propos : activez ce que vous voulez.'],
        [Eye, 'Aperçu avant publication', 'Préparez votre vitrine en privé, publiez quand elle est prête.'],
        [Globe, 'Votre adresse', 'votre-boutique.biolinko.store, facile à retenir et à partager.'],
    ]],
    ['catalogue', 'Catalogue', [
        [Layers, 'Tailles et couleurs', 'Des options par produit, chacune avec son prix et son stock.'],
        [Images, 'Plusieurs photos', 'Une galerie par produit, adaptée au téléphone.'],
        [Boxes, 'Stock suivi', 'Le stock baisse à chaque vente, le produit passe en rupture tout seul.'],
        [Tag, 'Catégories', 'Vos clients filtrent la vitrine par type de produit.'],
    ]],
    ['vente', 'Vente', [
        [BadgePercent, 'Codes promo', 'Pourcentage ou montant, avec plafond d’utilisation et date de fin.'],
        [CalendarClock, 'Promotions programmées', 'Un prix barré qui démarre et s’arrête tout seul aux dates choisies.'],
        [Link2, 'Liens de paiement et packs', 'Un lien pour un produit ou un lot à prix réduit, à coller dans une discussion.'],
        [Truck, 'Zones de livraison', 'Un tarif par ville, et la livraison offerte à partir d’un montant.'],
        [HandCoins, 'Acompte', 'Le client paie une partie en ligne, le reste au livreur.'],
    ]],
    ['commandes', 'Commandes', [
        [PackageCheck, 'Suivi par lien', 'Le client suit sa commande de « payée » à « livrée », sans compte.'],
        [Receipt, 'Factures automatiques', 'Une facture PDF à votre nom, envoyée à chaque paiement.'],
        [FileText, 'Factures manuelles', 'Pour vos ventes en boutique ou par téléphone, avec relance.'],
        [Bell, 'Relance des impayés', 'Les commandes non payées sont relancées automatiquement.'],
        [Flag, 'Signalement de problème', 'Le client signale, vous répondez, la vente reste protégée.'],
        [Undo2, 'Remboursements', 'Total ou partiel, renvoyé sur le Mobile Money du client.'],
    ]],
    ['marketing', 'Marketing', [
        [Megaphone, 'Campagnes WhatsApp', 'Envoyez vos nouveautés à vos clients en un clic.'],
        [ShoppingCart, 'Paniers abandonnés', 'Retrouvez les clients qui n’ont pas payé et relancez-les.'],
        [Target, 'Pixels publicitaires', 'Meta, TikTok et Google Analytics pour mesurer vos publicités.'],
        [Search, 'Référencement Google', 'Vos produits trouvables sur Google, avec prix et disponibilité.'],
        [Star, 'Avis clients', 'Des avis sur la boutique et sur chaque produit, mis en avant.'],
    ]],
    ['argent', 'Argent', [
        [Wallet, 'Portefeuille en direct', 'Chaque vente payée apparaît tout de suite dans votre solde.'],
        [RefreshCcw, 'Retraits gratuits', 'Vers MTN MoMo ou Orange Money, sans frais.'],
        [ShieldCheck, 'Délai de sécurité', 'L’argent est protégé quelques jours, le temps de livrer.'],
        [Repeat, 'Abonnement depuis le solde', 'Renouvellement automatique depuis votre portefeuille, désactivable.'],
        [ChartColumn, 'Statistiques', 'Chiffre d’affaires, commandes et clients sur votre tableau de bord.'],
        [FileSpreadsheet, 'Export comptable', 'Toutes vos ventes dans un fichier pour votre comptabilité.'],
    ]],
];

const ALL = GROUPS.flatMap(([id, , items]) => items.map((it) => [id, ...it]));

export default function Features() {
    const [group, setGroup] = useState('all');
    const [expanded, setExpanded] = useState(false);
    const filtered = group === 'all' ? ALL : ALL.filter(([id]) => id === group);
    // « Tout » : 12 fonctionnalités d'abord, le reste sur demande pour garder la page courte
    const items = group === 'all' && !expanded ? filtered.slice(0, 12) : filtered;
    const tabs = [['all', 'Tout', ALL.length], ...GROUPS.map(([id, label, list]) => [id, label, list.length])];

    return (
        <div>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="tablist" aria-label="Familles de fonctionnalités">
                {tabs.map(([id, label, n]) => (
                    <button key={id} type="button" role="tab" aria-selected={group === id} onClick={() => { setGroup(id); setExpanded(false); }}
                        className={`relative flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[14px] transition-colors ${group === id ? 'border-transparent text-[#141412]' : 'border-black/10 text-[#5F5E58] hover:border-black/25 hover:text-[#141412]'}`}>
                        {group === id && <motion.span layoutId="feature-tab" className="absolute inset-0 rounded-full bg-[#FFCC00]" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                        <span className="relative font-medium">{label}</span>
                        <span className="relative text-[12px] tabular-nums opacity-60">{n}</span>
                    </button>
                ))}
            </div>

            <motion.ul layout className="mt-8 grid gap-px overflow-hidden rounded-[24px] border border-black/[0.07] bg-black/[0.07] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout" initial={false}>
                    {items.map(([, Icon, title, text], i) => (
                        <motion.li key={title} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.3, delay: Math.min(i, 9) * 0.025, ease: EASE_OUT }}
                            className={`group flex gap-4 bg-white p-5 transition-colors hover:bg-[#FFFCEF] ${group === 'all' && !expanded && i >= 6 ? 'max-sm:hidden' : ''}`}>
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F5F1] text-[#141412] transition-colors group-hover:bg-[#FFCC00]">
                                <Icon className="h-[18px] w-[18px]" />
                            </span>
                            <div className="min-w-0">
                                <h3 className="text-[15px] font-medium text-[#141412]">{title}</h3>
                                <p className="mt-1 text-[14px] leading-relaxed text-[#5F5E58]">{text}</p>
                            </div>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </motion.ul>
            {group === 'all' && (
                <div className="mt-6 flex justify-center">
                    <button type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}
                        className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-5 text-[14px] font-medium text-[#141412] transition-colors hover:border-black/40">
                        {expanded ? 'Voir moins' : `Voir les ${ALL.length} fonctionnalités`}
                        <motion.span animate={{ rotate: expanded ? 180 : 0 }}><ChevronDown className="h-4 w-4" /></motion.span>
                    </button>
                </div>
            )}
        </div>
    );
}
