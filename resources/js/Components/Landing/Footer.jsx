import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Mail, MapPin } from 'lucide-react';
import { OperatorLogo } from '@/Components/Landing/Illustrations';

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

const CONTACT_EMAIL = 'contact@biolinko.link';

/**
 * Footer de la landing et des pages légales.
 */
export default function Footer() {
    const [credits, setCredits] = useState(false);
    const year = new Date().getFullYear();

    const cols = [
        ['Produit', [
            ['Boutique en ligne', '/#produit'],
            ['Commandes et suivi', '/#produit'],
            ['Factures et relances', '/#produit'],
            ['Clients et campagnes', '/#produit'],
            ['Liens de paiement', '/#produit'],
            ['Marketing et statistiques', '/#produit'],
        ]],
        ['Ressources', [
            ['Comment ça marche', '/#demarrer'],
            ['Tarifs', '/#tarifs'],
            ['Pays couverts', '/#pays'],
            ['Questions fréquentes', '/#questions'],
        ]],
        ['Entreprise', [
            ['Contact', `mailto:${CONTACT_EMAIL}`],
            ['Se connecter', route('login')],
            ['Créer un compte', route('register')],
        ]],
        ['Légal', [
            ['Conditions d’utilisation', route('legal.terms')],
            ['Confidentialité', route('legal.privacy')],
            ['Cookies', route('legal.cookies')],
        ]],
    ];

    return (
        <footer className="border-t border-black/[0.06] bg-white font-poppins text-[#141412]">
            <div className="mx-auto max-w-[1200px] px-5 lg:px-8">
                {/* Haut : marque + colonnes */}
                <div className="grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
                    <div className="max-w-[340px]">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#FFCC00]">
                                <img src="/images/brand/logo-noir.png" alt="" className="h-12 w-12 max-w-none" />
                            </span>
                            <span className="text-[19px] font-semibold tracking-tight">Biolinko</span>
                        </Link>
                        <p className="mt-5 text-[15px] leading-relaxed text-[#5F5E58]">
                            La plateforme pour lancer, gérer et développer votre commerce en ligne : boutique, commandes, factures, clients et paiements.
                        </p>
                        <ul className="mt-6 space-y-2.5 text-[14px] text-[#5F5E58]">
                            <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 shrink-0" /> Douala, Cameroun</li>
                            <li><a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-2.5 hover:text-[#141412]"><Mail className="h-4 w-4 shrink-0" /> {CONTACT_EMAIL}</a></li>
                        </ul>
                        <Link href={route('register')} className="group mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-[#141412] px-5 text-[14px] font-medium text-white hover:bg-[#2B2A26]">
                            Créer ma boutique <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
                        {cols.map(([title, links]) => (
                            <div key={title}>
                                <h4 className="text-[14px] font-medium">{title}</h4>
                                <ul className="mt-4 space-y-3 text-[14px] text-[#5F5E58]">
                                    {links.map(([label, href]) => (
                                        <li key={label}><a href={href} className="transition-colors hover:text-[#141412]">{label}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Moyens de paiement */}
                <div className="flex flex-col gap-4 border-t border-black/[0.06] py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[13px] text-[#8B8A83]">Paiements acceptés</span>
                        <span className="flex items-center gap-2 rounded-full border border-black/[0.08] py-1 pl-1 pr-3 text-[13px]"><OperatorLogo op="MTN" className="h-7 w-7" /> MTN Mobile Money</span>
                        <span className="flex items-center gap-2 rounded-full border border-black/[0.08] py-1 pl-1 pr-3 text-[13px]"><OperatorLogo op="ORANGE" className="h-7 w-7" /> Orange Money</span>
                    </div>
                    <a href="/#pays" className="flex items-center gap-2 text-[13px] text-[#5F5E58] hover:text-[#141412]">
                        <img src="/images/flags/cm.svg" alt="" className="h-5 w-5 rounded-full object-cover" /> Cameroun · d’autres pays bientôt
                    </a>
                </div>

                {/* Bas */}
                <div className="flex flex-col gap-3 border-t border-black/[0.06] py-6 text-[13px] text-[#8B8A83] sm:flex-row sm:items-center sm:justify-between">
                    <p>© {year} Biolinko. Tous droits réservés.</p>
                    <button type="button" onClick={() => setCredits((v) => !v)} aria-expanded={credits} className="flex items-center gap-1 hover:text-[#141412]">
                        Crédits photos <ChevronDown className={`h-3.5 w-3.5 transition-transform ${credits ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                <AnimatePresence initial={false}>
                    {credits && (
                        <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="grid gap-x-6 gap-y-1.5 overflow-hidden pb-8 text-[12px] text-[#8B8A83] sm:grid-cols-2 lg:grid-cols-3">
                            {PHOTO_CREDITS.map(([what, author, licence, file]) => (
                                <li key={file}>
                                    {what} : <a href={`https://commons.wikimedia.org/wiki/File:${file}`} target="_blank" rel="noreferrer" className="underline hover:text-[#141412]">{author}</a>, {licence}
                                </li>
                            ))}
                            <li>Logos MTN, Orange, Airtel, Moov, M-Pesa et drapeaux : Wikimedia Commons. Marques de leurs propriétaires respectifs.</li>
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        </footer>
    );
}
