import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, Play, MessageCircle } from 'lucide-react';
import { WhatsappIcon } from '@/Components/BrandIcons';
import { Reveal } from '@/Components/Motion';

const FAQ = [
    {
        q: 'Quand et comment est-ce que je reçois mon argent ?',
        a: 'Dès que votre client valide son paiement avec son code secret Mobile Money, les fonds sont immédiatement crédités dans votre portefeuille Biolinko. Vous pouvez retirer votre solde vers votre compte MTN MoMo ou Orange Money à tout moment dès 5 000 FCFA, 24h/24 et 7j/7.',
    },
    {
        q: 'Combien coûte chaque vente réalisée ?',
        a: 'Des frais de service transparents de 3 % sont appliqués au panier du client au moment du paiement. Le montant exact fixé sur vos articles est reversé à 100 % dans votre solde vendeur, sans aucune retenue imprévue ni frais cachés.',
    },
    {
        q: 'Mes clients ont-ils besoin d’installer une application ?',
        a: 'Non, absolument pas. Vos clients cliquent simplement sur le lien de votre boutique depuis votre bio Instagram, vos statuts WhatsApp ou vos vidéos TikTok. Ils sélectionnent leurs articles et reçoivent directement le prompt de paiement Mobile Money sur leur téléphone.',
    },
    {
        q: 'Puis-je personnaliser ma boutique avec mon logo et mes couleurs ?',
        a: 'Oui ! Vous pouvez importer votre logo officiel, choisir vos couleurs de marque, organiser vos catégories de produits et ajouter vos liens vers tous vos réseaux sociaux en 2 minutes depuis votre tableau de bord.',
    },
    {
        q: 'Puis-je changer de forfait ou annuler à tout moment ?',
        a: 'Oui, sans aucun engagement. Vous pouvez passer à une formule supérieure dès que vos ventes s’accélèrent, ou repasser au forfait Starter 100 % gratuit à tout moment sans aucun frais de pénalité.',
    },
    {
        q: 'Mes données et les paiements sont-ils sécurisés ?',
        a: 'Toutes les transactions sont chiffrées de bout en bout et opérées directement avec les serveurs agréés de MTN et Orange. Vos fonds sont sécurisés et vos informations client strictement protégées.',
    },
    {
        q: 'Que faire si j’ai besoin d’aide pour démarrer ?',
        a: 'Notre équipe d’assistance est disponible 7j/7 sur WhatsApp pour vous accompagner : configuration de votre boutique, ajout de vos premiers articles et réalisation de votre première vente test.',
    },
];

export default function FaqSection() {
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <section id="questions" className="relative bg-white py-20 sm:py-24 border-t border-slate-200/80">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    {/* Colonne GAUCHE : Titre, sous-titre & contact */}
                    <div className="lg:col-span-5 lg:sticky lg:top-32 lg:pr-6">
                        <Reveal>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 mb-3.5">
                                <Play className="h-2.5 w-2.5 fill-amber-800 text-amber-800" />
                                <span>Questions fréquentes</span>
                            </div>
                        </Reveal>

                        <Reveal delay={0.08}>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B2620] leading-tight">
                                Questions, <br />
                                <span className="text-slate-600">réponses.</span>
                            </h2>
                        </Reveal>

                        <Reveal delay={0.14}>
                            <p className="mt-4 text-base text-slate-500 font-normal leading-relaxed max-w-sm">
                                Ce que les commerçants nous demandent le plus souvent. Une question spécifique ? Notre équipe vous accompagne pas à pas.
                            </p>
                        </Reveal>

                        <Reveal delay={0.2}>
                            <div className="mt-7">
                                <motion.a
                                    href="https://wa.me/237600000000?text=Bonjour%20Biolinko,%20j'ai%20une%20question"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 shadow-xs hover:border-amber-300 hover:bg-amber-50/40 hover:text-slate-900 transition-colors"
                                >
                                    <WhatsappIcon className="h-4 w-4 text-emerald-600" />
                                    <span>Poser une question sur WhatsApp</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-700" />
                                </motion.a>
                            </div>
                        </Reveal>
                    </div>

                    {/* Colonne DROITE : Accordéon avec séparateur vertical fin */}
                    <Reveal y={24} delay={0.12} className="lg:col-span-7 lg:border-l lg:border-slate-200/90 lg:pl-10">
                        <div className="divide-y divide-slate-200/90 border-t lg:border-t-0 border-b border-slate-200/90">
                            {FAQ.map((item, index) => {
                                const isOpen = openIndex === index;

                                return (
                                    <div key={index} className="group py-1">
                                        <button
                                            type="button"
                                            onClick={() => toggle(index)}
                                            aria-expanded={isOpen}
                                            className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors"
                                        >
                                            <span className={`text-base font-medium transition-colors ${
                                                isOpen ? 'text-amber-800 font-semibold' : 'text-slate-800 group-hover:text-amber-800'
                                            }`}>
                                                {item.q}
                                            </span>

                                            <motion.span
                                                animate={{ rotate: isOpen ? 180 : 0 }}
                                                transition={{ duration: 0.25 }}
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                                    isOpen
                                                        ? 'bg-[#FFCC00] text-[#2B2620]'
                                                        : 'border border-slate-200 bg-white text-slate-400 group-hover:text-slate-700 group-hover:border-slate-300'
                                                }`}
                                            >
                                                <ChevronDown className="h-3.5 w-3.5" />
                                            </motion.span>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: 'easeOut' }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="pb-4 pt-1 text-sm text-slate-500 font-normal leading-relaxed pr-6">
                                                        {item.a}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
