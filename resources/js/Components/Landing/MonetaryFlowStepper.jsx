import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function MonetaryFlowStepper() {
    // Stepper dynamique subtil (cycle fluide sur les 4 étapes du flux monétaire)
    const [activeStep, setActiveStep] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 4);
        }, 3600);
        return () => clearInterval(interval);
    }, [isHovered]);

    // Les étapes du flux monétaire (exactement 10k -> 10 200 F -> 10k -> 9 800 F) + garanties
    const items = [
        {
            isStep: true,
            stepIndex: 0,
            stepLabel: '01',
            title: 'Article fixé à 10 000 FCFA',
            desc: 'Vous fixez votre prix de vente librement. C’est la valeur exacte de votre travail.',
        },
        {
            isStep: true,
            stepIndex: 1,
            stepLabel: '02',
            title: 'Le client paie 10 200 FCFA',
            desc: 'Les 2% de frais techniques sont réglés directement par l’acheteur lors de sa commande.',
        },
        {
            isStep: true,
            stepIndex: 2,
            stepLabel: '03',
            title: '10 000 FCFA sur votre solde',
            desc: 'Vous encaissez 100% de votre prix de vente. Zéro commission vendeur prélevée.',
        },
        {
            isStep: true,
            stepIndex: 3,
            stepLabel: '04',
            title: '9 800 FCFA nets au retrait',
            desc: 'Au virement vers votre Mobile Money, seuls 2% de frais d’opérateur réseau sont déduits.',
        },
        {
            isStep: false,
            title: 'Abonnements simples & prévisibles',
            desc: 'Un forfait fixe pour vos outils professionnels, sans ponction imprévue sur votre chiffre d’affaires.',
        },
        {
            isStep: false,
            title: 'Retrait Orange & MTN instantané',
            desc: 'Vos fonds arrivent directement et en temps réel sur votre numéro habituel.',
        },
    ];

    return (
        <section
            id="transparence"
            className="relative bg-white py-20 sm:py-28"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
                {/* Badge minimaliste noir style Image 2 */}
                <div className="mb-4">
                    <span className="inline-flex items-center rounded-full bg-black px-3.5 py-1 text-xs font-semibold text-white tracking-wide">
                        Transparence
                    </span>
                </div>

                {/* Grand titre épuré et percutant */}
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                    Nous ne coupons pas votre argent !
                </h2>

                {/* Sous-titre léger et aéré */}
                <p className="mt-3 text-lg sm:text-xl text-slate-500 font-normal max-w-2xl">
                    Gérer son commerce est déjà assez difficile. Vous fixez votre prix, vous encaissez vos gains.
                </p>

                {/* Grille épurée 3 colonnes x 2 lignes style Image 2 */}
                <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 sm:gap-y-12">
                    {items.map((item, idx) => {
                        const isActive = item.isStep && activeStep === item.stepIndex;

                        return (
                            <div
                                key={idx}
                                onClick={() => item.isStep && setActiveStep(item.stepIndex)}
                                className={`group flex items-start gap-3.5 transition-all duration-300 ${
                                    item.isStep ? 'cursor-pointer' : ''
                                }`}
                            >
                                {/* Icône Check minimaliste avec transition subtile si actif */}
                                <div className="shrink-0 mt-0.5">
                                    <div
                                        className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors duration-300 ${
                                            isActive
                                                ? 'bg-slate-900 text-white'
                                                : 'text-slate-900 group-hover:text-black'
                                        }`}
                                    >
                                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                                    </div>
                                </div>

                                {/* Titre & Description courte en une ligne */}
                                <div className="min-w-0">
                                    <h3
                                        className={`text-base font-semibold tracking-tight transition-colors duration-200 ${
                                            isActive
                                                ? 'text-slate-950 font-bold'
                                                : 'text-slate-900 group-hover:text-black'
                                        }`}
                                    >
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-500 font-normal leading-relaxed">
                                        {item.desc}
                                    </p>

                                    {/* Petite barre de progression subtile uniquement sur l'étape active du stepper */}
                                    {item.isStep && (
                                        <div className="mt-2.5 h-0.5 w-12 bg-slate-100 overflow-hidden rounded-full">
                                            {isActive && (
                                                <motion.div
                                                    layoutId="stepProgress"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '100%' }}
                                                    transition={{ duration: 3.6, ease: 'linear' }}
                                                    className="h-full bg-slate-900"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
