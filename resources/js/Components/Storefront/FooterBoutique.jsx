import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Clock, Flag, MapPin, PackageCheck, ShieldCheck, Store, X } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/UI/BrandIcons';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import { contrastColor } from '@/Components/Storefront/theme';
import { appLink, storeUrl } from '@/Components/Storefront/storeUrl';

const REPORT_REASONS = [
    ['fake', 'Fausse boutique ou usurpation'],
    ['scam', 'Arnaque : payé mais rien reçu'],
    ['prohibited', 'Produits interdits ou dangereux'],
    ['other', 'Autre problème'],
];

/** Signalement de la boutique à l'équipe Biolinko (pas au vendeur). */
export function ReportStoreDialog({ store, onClose }) {
    const form = useForm({ reason: 'fake', message: '', contact: '', website: '' });
    const submit = (e) => {
        e.preventDefault();
        form.post(route('storefront.report', store.slug), { preserveScroll: true, onSuccess: () => onClose() });
    };
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
            <motion.form onSubmit={submit} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="report-store-title"
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-lg space-y-4 rounded-t-3xl bg-white p-6 text-[#141412] sm:rounded-3xl">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 id="report-store-title" className="text-lg font-semibold">Signaler cette boutique</h2>
                        <p className="mt-1 text-sm text-[#5F5E58]">Votre signalement est envoyé à l’équipe Biolinko, pas au vendeur.</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5"><X className="h-5 w-5" /></button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Motif">
                    {REPORT_REASONS.map(([key, label]) => (
                        <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${form.data.reason === key ? 'border-black/40 bg-[#F6F5F1]' : 'border-black/10'}`}>
                            <input type="radio" name="reason" value={key} checked={form.data.reason === key} onChange={() => form.setData('reason', key)} className="text-[#141412] focus:ring-0" />
                            {label}
                        </label>
                    ))}
                </div>
                <div>
                    <label htmlFor="report-store-message" className="mb-1.5 block text-sm font-medium">Que s’est-il passé ?</label>
                    <textarea id="report-store-message" rows={4} maxLength={1500} required value={form.data.message} onChange={(e) => form.setData('message', e.target.value)}
                        className="w-full rounded-xl border border-black/10 px-3 py-2 text-[15px] focus:border-black/30 focus:ring-0" />
                    {form.errors.message && <p className="mt-1 text-sm text-[#B91C1C]">{form.errors.message}</p>}
                </div>
                <div>
                    <label htmlFor="report-store-contact" className="mb-1.5 block text-sm font-medium">Votre téléphone ou e-mail <span className="font-normal text-[#8B8A83]">(facultatif)</span></label>
                    <input id="report-store-contact" value={form.data.contact} onChange={(e) => form.setData('contact', e.target.value)} maxLength={120}
                        className="h-11 w-full rounded-xl border border-black/10 px-3 text-[15px] focus:border-black/30 focus:ring-0" />
                </div>
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden value={form.data.website} onChange={(e) => form.setData('website', e.target.value)} className="hidden" />
                <button type="submit" disabled={form.processing} className="h-11 w-full rounded-full bg-[#141412] font-medium text-white disabled:opacity-60">
                    {form.processing ? 'Envoi…' : 'Envoyer le signalement'}
                </button>
            </motion.form>
        </motion.div>
    );
}

/** Repères de confiance : vendeur vérifié, ancienneté, commandes livrées. */
export function TrustBadges({ store, className = '' }) {
    const t = store?.trust;
    if (!t) return null;
    const since = t.since ? new Date(t.since).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : null;
    return (
        <ul className={`flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-[#5F5E58] ${className}`}>
            {t.verified && <li className="flex items-center gap-1.5 font-medium text-[#15803D]"><BadgeCheck className="h-4 w-4" /> Vendeur vérifié</li>}
            {since && <li className="flex items-center gap-1.5"><Store className="h-4 w-4 text-[#8B8A83]" /> Sur Biolinko depuis {since}</li>}
            {t.delivered > 0 && <li className="flex items-center gap-1.5"><PackageCheck className="h-4 w-4 text-[#8B8A83]" /> {t.delivered} commande{t.delivered > 1 ? 's' : ''} livrée{t.delivered > 1 ? 's' : ''}</li>}
        </ul>
    );
}

/**
 * Pied de page des vitrines : marque du vendeur, navigation, contact, moyens de paiement,
 * puis une ligne discrète avec les mentions et la signature Biolinko.
 */
export default function FooterBoutique({ store }) {
    const [reporting, setReporting] = useState(false);
    if (!store) return null;
    const color = store.theme_color || '#FFCC00';
    const wa = store.phone_whatsapp?.replace(/[^0-9]/g, '');
    const waUrl = wa && wa.length >= 8 ? `https://wa.me/${wa}?text=${encodeURIComponent(`Bonjour ${store.name}, je vous contacte depuis votre boutique.`)}` : null;
    const socials = [
        [store.instagram_link, InstagramIcon, 'Instagram'],
        [store.tiktok_link, TiktokIcon, 'TikTok'],
        [store.facebook_link, FacebookIcon, 'Facebook'],
    ].filter(([href]) => href);
    const base = storeUrl(store.slug);
    const links = [['Produits', `${base}#catalog-grid`], ['Promotions', `${base}#promotions`], ['Avis clients', `${base}#reviews`], ['À propos', `${base}#about`], ['Mon panier', `${base}?tab=cart`]];

    return (
        <footer className="mt-6 border-t border-black/[0.06] bg-[#FAFAF8] text-[#141412] print:hidden">
            <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-10 sm:grid-cols-2 sm:py-14 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
                {/* Marque */}
                <div className="min-w-0 max-w-sm">
                    <a href={base} className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ backgroundColor: color, color: contrastColor(color) }}>
                            {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0 truncate text-[17px] font-semibold tracking-tight">{store.name}</span>
                    </a>
                    <TrustBadges store={store} className="mt-3" />
                    {store.description && <p className="mt-3 line-clamp-3 text-[14px] [overflow-wrap:anywhere] leading-relaxed text-[#5F5E58]">{store.description}</p>}
                    {(waUrl || socials.length > 0) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {waUrl && (
                                <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full bg-[#16A34A] px-3.5 text-[13px] font-medium text-white hover:bg-[#15803D]">
                                    <WhatsappIcon className="h-4 w-4" /> WhatsApp
                                </a>
                            )}
                            {socials.map(([href, Icon, label]) => (
                                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white hover:border-black/30"><Icon className="h-4 w-4" /></a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav aria-label="Boutique">
                    <h3 className="text-[13px] text-[#8B8A83]">La boutique</h3>
                    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[14px] sm:grid-cols-1">
                        {links.map(([label, href]) => <li key={label}><a href={href} className="text-[#3D3C37] hover:text-[#141412]">{label}</a></li>)}
                    </ul>
                </nav>

                {/* Infos pratiques */}
                <div>
                    <h3 className="text-[13px] text-[#8B8A83]">Infos pratiques</h3>
                    <ul className="mt-3 space-y-2 text-[14px] text-[#3D3C37]">
                        {store.city_location && <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8B8A83]" />{store.city_location}</li>}
                        {store.opening_hours && <li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#8B8A83]" />{store.opening_hours}</li>}
                    </ul>
                    <p className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-[#141412]"><ShieldCheck className="h-4 w-4" /> Paiement protégé par Biolinko</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[#5F5E58]">Le vendeur n’est payé qu’une fois votre commande reçue.</p>
                    <div className="mt-2 flex items-center gap-2">
                        <OperatorLogo op="MTN" className="h-8 w-8" />
                        <OperatorLogo op="ORANGE" className="h-8 w-8" />
                        <span className="text-[13px] text-[#5F5E58]">MTN MoMo · Orange Money</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-black/[0.06]">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 pb-24 pt-4 text-[12px] text-[#8B8A83] sm:flex-row sm:items-center sm:justify-between sm:pb-4 lg:px-8">
                    <p>© {new Date().getFullYear()} {store.name} · <a href={route('legal.terms')} className="hover:text-[#141412]">Conditions</a> · <a href={route('legal.privacy')} className="hover:text-[#141412]">Confidentialité</a></p>
                    <button type="button" onClick={() => setReporting(true)} className="inline-flex items-center gap-1.5 hover:text-[#141412]">
                        <Flag className="h-3.5 w-3.5" /> Signaler cette boutique
                    </button>
                    <a href={appLink('/')} className="inline-flex items-center gap-1.5 hover:text-[#141412]">
                        Boutique créée avec <span className="font-semibold text-[#141412]">Biolinko</span>
                    </a>
                </div>
            </div>
            <AnimatePresence>{reporting && <ReportStoreDialog store={store} onClose={() => setReporting(false)} />}</AnimatePresence>
        </footer>
    );
}
