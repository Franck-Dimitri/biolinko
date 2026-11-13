import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, ChevronDown, Mail, MapPin } from 'lucide-react';
import { EASE_OUT } from '@/Components/UI/Motion';
import { FacebookIcon, InstagramIcon, LinkedinIcon, TiktokIcon, WhatsappIcon, YoutubeIcon } from '@/Components/UI/BrandIcons';

export const PHOTO_CREDITS = [
    ['Robe pagne', 'ItunuIjila', 'CC BY-SA 4.0', 'A_BEAUTIFUL_Ankara_dress.jpg'],
    ['Jupe soleil', 'Exclusive by Tola', 'CC BY-SA 4.0', 'Ankara_monostrap_dress.jpg'],
    ['Robe sirène', 'Jeremyida002', 'CC0', 'The_traditional_Ankara_dress.jpg'],
    ['Jupe kente', 'Wanjirakinyua', 'CC BY-SA 4.0', 'White_ankara_dress.jpg'],
    ['Sac à chaîne', 'Vivid Eloquence', 'CC BY-SA 4.0', 'I_Love_Naija_Shoulder_Bag.JPG'],
    ['Tunique', 'Artista Poetica', 'CC BY-SA 4.0', 'Cameroonian_model.JPG'],
    ['Foulard', 'Artista Poetica', 'CC BY-SA 4.0', 'Model_in_head_wrap.JPG'],
    ['Pagnes wax', 'Naa2Darkoa', 'CC BY-SA 4.0', 'Obaa_pa.jpg'],
    ['Haut kente', 'Nationaal Museum van Wereldculturen', 'CC BY-SA 3.0', 'Shirt_van_Afrikaanse_kente_stof-_Stichting_Nationaal_Museum_van_Wereldculturen_-_R-3633c.jpg'],
];

const DEFAULT_EMAIL = 'contact@biolinko.link';

// Réseaux sociaux : les liens se règlent dans .env (BIOLINKO_SOCIAL_*, voir config/biolinko.php).
// Tant qu'un lien est vide, l'icône s'affiche sans être cliquable.
const SOCIALS = [
    { key: 'whatsapp', name: 'WhatsApp', Icon: WhatsappIcon },
    { key: 'instagram', name: 'Instagram', Icon: InstagramIcon },
    { key: 'tiktok', name: 'TikTok', Icon: TiktokIcon },
    { key: 'facebook', name: 'Facebook', Icon: FacebookIcon },
    { key: 'linkedin', name: 'LinkedIn', Icon: LinkedinIcon },
    { key: 'youtube', name: 'YouTube', Icon: YoutubeIcon },
];
const WRAP = 'relative mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12';

/** Pied de page de la landing et des pages légales : fond noir, colonnes de liens, grand logotype. */
export default function Footer() {
    const [credits, setCredits] = useState(false);
    const year = new Date().getFullYear();
    const site = usePage().props.site || {};
    const links = site.socials || {};
    const CONTACT_EMAIL = site.contact?.email || DEFAULT_EMAIL;

    const cols = [
        ['Produit', [
            ['Fonctionnalités', '/#fonctionnalites'],
            ['Boutique en ligne', '/#produit'],
            ['Tarifs', '/#tarifs'],
        ]],
        ['Ressources', [
            ['Centre d’aide', route('site.help')],
            ['Paiement et sécurité', route('site.security')],
            ['Pays couverts', '/#pays'],
            ['Questions fréquentes', '/#questions'],
        ]],
        ['Biolinko', [
            ['À propos', route('site.about')],
            ['Contact', route('site.contact')],
            ['Programme pilote', route('site.pilot')],
            ['Se connecter', route('login')],
        ]],
        ['Légal', [
            ['Mentions légales', route('legal.notice')],
            ['Conditions d’utilisation', route('legal.terms')],
            ['Confidentialité', route('legal.privacy')],
            ['Cookies', route('legal.cookies')],
        ]],
    ];

    return (
        <footer className="relative overflow-hidden bg-[#0F0F0E] font-poppins text-white">
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[1320px] -translate-x-1/2 border-x border-white/[0.07] md:block" />
            <div className={WRAP}>
                <div className="grid gap-12 py-16 lg:grid-cols-[1.1fr_2fr]">
                    <div className="max-w-[340px]">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#FFCC00]">
                                <img src="/images/brand/logo-noir.svg" alt="" className="h-12 w-12 max-w-none" />
                            </span>
                            <span className="text-[19px] font-semibold tracking-tight">Biolinko</span>
                        </Link>
                        <p className="mt-5 text-[15px] leading-relaxed text-white/55">
                            La plateforme de commerce en ligne des vendeurs africains : boutique, commandes, livraison, factures, marketing et paiements Mobile Money.
                        </p>
                        <ul className="mt-6 space-y-2.5 text-[14px] text-white/55">
                            <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 shrink-0" /> {site.contact?.city || 'Douala, Cameroun'}</li>
                            <li><a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2.5 hover:text-white"><Mail className="h-4 w-4 shrink-0" /> {CONTACT_EMAIL}</a></li>
                        </ul>
                        <ul className="mt-7 flex flex-wrap gap-2" aria-label="Biolinko sur les réseaux sociaux">
                            {SOCIALS.map(({ key, name, Icon }) => {
                                const href = links[key];
                                const cls = 'flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors';
                                return (
                                    <li key={name}>
                                        {href
                                            ? <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Biolinko sur ${name}`} className={`${cls} hover:border-white/50 hover:bg-white hover:text-[#141412]`}><Icon className="h-[18px] w-[18px]" /></a>
                                            : <span title={`${name} : bientôt`} aria-label={`${name} : bientôt`} className={`${cls} cursor-default opacity-70`}><Icon className="h-[18px] w-[18px]" /></span>}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                        {cols.map(([title, links]) => (
                            <div key={title}>
                                <h4 className="text-[13px] font-medium text-white/40">{title}</h4>
                                <ul className="mt-4 space-y-3 text-[14px]">
                                    {links.map(([label, href]) => (
                                        <li key={label}><a href={href} className="text-white/75 transition-colors hover:text-white">{label}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-white/[0.08] py-6 text-[13px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {year} Biolinko. Tous droits réservés.</p>
                    <div className="flex flex-wrap items-center gap-5">
                        <span className="flex items-center gap-1.5"><img src="/images/flags/cm.svg" alt="" className="h-4 w-4 rounded-full object-cover" /> Cameroun</span>
                        <button type="button" onClick={() => setCredits((v) => !v)} aria-expanded={credits} className="flex items-center gap-1 hover:text-white">
                            Crédits photos <ChevronDown className={`h-3.5 w-3.5 transition-transform ${credits ? 'rotate-180' : ''}`} />
                        </button>
                        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-1 hover:text-white">
                            Haut de page <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
                <AnimatePresence initial={false}>
                    {credits && (
                        <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="grid gap-x-6 gap-y-1.5 overflow-hidden pb-8 text-[12px] text-white/40 sm:grid-cols-2 lg:grid-cols-3">
                            {PHOTO_CREDITS.map(([what, author, licence, file]) => (
                                <li key={file}>
                                    {what} : <a href={`https://commons.wikimedia.org/wiki/File:${file}`} target="_blank" rel="noreferrer" className="underline hover:text-white">{author}</a>, {licence}
                                </li>
                            ))}
                            <li>Logos MTN, Orange, Airtel, Moov, M-Pesa et drapeaux : Wikimedia Commons. Marques de leurs propriétaires respectifs.</li>
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>

            {/* Grand logotype, révélé en arrivant en bas de page */}
            <div aria-hidden className="relative select-none overflow-hidden border-t border-white/[0.06]">
                <motion.p initial={{ y: '45%', opacity: 0 }} whileInView={{ y: '16%', opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE_OUT }}
                    className="bg-gradient-to-b from-white/[0.16] to-white/0 bg-clip-text pt-6 text-center text-[24vw] font-semibold leading-[0.82] tracking-[-0.06em] text-transparent lg:text-[300px]">
                    biolinko
                </motion.p>
            </div>
        </footer>
    );
}
