import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/BrandIcons';

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

/**
 * Footer Officiel Biolinko (Fond Noir Élégant & Unifié)
 */
export default function Footer() {
    const [credits, setCredits] = useState(false);

    const cols = [
        [
            'Company',
            [
                ['À propos', '/#vitrine'],
                ['Carrières', '#'],
                ['Tarifs', '/#tarifs'],
                ['FAQs', '/#questions'],
                ['Contact', 'mailto:contact@biolinko.com'],
            ],
        ],
        [
            'Products',
            [
                ['Vitrine en ligne', '/#vitrine'],
                ['Paiement Mobile Money', '/#comment'],
                ['SmartLinks', '/#outils'],
                ['Factures automatiques', '/#outils'],
                ['Gestion des stocks', '/#outils'],
            ],
        ],
        [
            'Resources',
            [
                ['Guide vendeur', '#'],
                ['Blog', '#'],
                ['Témoignages', '/#temoignages'],
                ['Vidéo de démonstration', '/#demo'],
            ],
        ],
        [
            'Legal',
            [
                ['Confidentialité', route('legal.privacy'), true],
                ['Sécurité', '#', false],
                ['Conditions d’utilisation', route('legal.terms'), true],
                ['Cookies', route('legal.cookies'), true],
            ],
        ],
    ];

    return (
        <footer className="relative overflow-hidden bg-[#0A0908] text-stone-400 pt-16 pb-12 border-t border-stone-800">
            {/* Lueur d'ambiance jaune dorée subtile Biolinko */}
            <div
                className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[600px] rounded-full bg-[#FFCC00]/[0.08] blur-3xl"
                aria-hidden="true"
            />
            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* 5 Colonnes : Company, Products, Resources, Legal, Contact */}
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 text-sm">
                    {cols.map(([title, links]) => (
                        <div key={title} className="space-y-4">
                            <h4 className="font-semibold text-sm text-white tracking-wide">{title}</h4>
                            <ul className="space-y-2.5 text-xs text-stone-400">
                                {links.map(([label, href, isInternal]) => (
                                    <li key={label}>
                                        {isInternal ? (
                                            <Link href={href} className="hover:text-amber-400 transition-colors">
                                                {label}
                                            </Link>
                                        ) : (
                                            <a href={href} className="hover:text-amber-400 transition-colors">
                                                {label}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Colonne Contact */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-white tracking-wide">Contact</h4>
                        <div className="space-y-2 text-xs text-stone-400">
                            <p className="hover:text-white transition-colors">contact@biolinko.com</p>
                            <p className="hover:text-white transition-colors">+237 600 000 000</p>
                            <div className="flex items-center gap-2 pt-2">
                                <span className="rounded-md bg-[#FFCC00] px-2.5 py-1 text-[11px] font-semibold text-[#2B2620] shadow-xs">
                                    MTN MoMo
                                </span>
                                <span className="rounded-md bg-[#FF7900] px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs">
                                    Orange Money
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Séparateur fin sombre */}
                <div className="my-10 border-t border-stone-800/80" />

                {/* Ligne inférieure : Coordonnées + Réseaux sociaux ronds */}
                <div className="flex flex-wrap items-center justify-between gap-6 text-xs text-stone-400">
                    <div>
                        <p className="text-stone-300 font-medium">Biolinko HQ, Douala & Yaoundé, Cameroun.</p>
                        <p className="mt-1 text-stone-500 font-normal">© {new Date().getFullYear()} Biolinko Inc. Tous droits réservés.</p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {[
                            [InstagramIcon, 'Instagram'],
                            [TiktokIcon, 'TikTok'],
                            [FacebookIcon, 'Facebook'],
                            [WhatsappIcon, 'WhatsApp'],
                        ].map(([Icon, label]) => (
                            <a
                                key={label}
                                href="#"
                                aria-label={label}
                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-stone-300 hover:bg-[#FFCC00] hover:text-[#2B2620] hover:border-amber-400 transition-colors shadow-xs"
                            >
                                <Icon className="h-4 w-4" />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Crédits photos discrets */}
                <div className="mt-6 text-[11px] text-stone-500">
                    <button
                        type="button"
                        onClick={() => setCredits(!credits)}
                        className="inline-flex items-center gap-1 hover:text-stone-300 cursor-pointer"
                        aria-expanded={credits}
                    >
                        Crédits photos <ChevronDown className={`h-3 w-3 transition-transform ${credits ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                        {credits && (
                            <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-2 grid gap-1 overflow-hidden text-[10px] text-stone-400 sm:grid-cols-2"
                            >
                                {PHOTO_CREDITS.map(([what, author, licence, file]) => (
                                    <li key={file}>
                                        {what} :{' '}
                                        <a
                                            className="underline hover:text-white"
                                            href={`https://commons.wikimedia.org/wiki/File:${file}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {author}
                                        </a>
                                        , {licence}
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Filigrane géant "Biolinko" en bas */}
            <div className="pointer-events-none select-none text-center -mb-8 sm:-mb-14 overflow-hidden">
                <span className="inline-block text-[100px] sm:text-[160px] lg:text-[220px] font-bold tracking-tight text-white/[0.04] leading-none">
                    Biolinko
                </span>
            </div>
        </footer>
    );
}
