import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Store, ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { Reveal } from '@/Components/Motion';

const IMG = '/images/landing';

const GALLERY_PRODUCTS = [
    {
        id: 'iphone',
        title: 'iPhone 15 Pro Titane (256 Go)',
        category: 'High-Tech & Gadgets',
        shop: 'iStore Yaoundé',
        price: 385000,
        img: `${IMG}/prod-iphone.jpg`,
        tagline: 'Le smartphone de référence en Afrique centrale.',
        desc: 'Châssis en titane de qualité aérospatiale et puce A17 Pro. Vos clients parcourent les spécifications et règlent leur commande en 30 secondes chrono par MTN MoMo ou Orange Money.',
        perk: 'Garantie 12 mois constructeur • Facture PDF avec QR code',
    },
    {
        id: 'robe',
        title: 'Robe Pagne Moderne Adjoa',
        category: 'Mode & Création Africaine',
        shop: 'Maison Kemi Abidjan',
        price: 22000,
        img: `${IMG}/robe-pagne.webp`,
        tagline: 'Élégance africaine contemporaine sur-mesure.',
        desc: 'Confection artisanale en wax hollandais de premier choix avec coupe sirène cintrée. Choix des tailles et validation immédiate directement depuis le lien dans votre bio Instagram ou TikTok.',
        perk: '100% Coton wax véritable • Expédition express sous 24h',
    },
    {
        id: 'sneakers',
        title: 'Sneakers Street Édition Beige',
        category: 'Chaussures & Streetwear',
        shop: 'Kicks Zone Douala',
        price: 32000,
        img: `${IMG}/prod-sneakers.jpg`,
        tagline: 'La référence tendance du streetwear urbain.',
        desc: 'Semelle ergonomique amortissante et empiècements en daim respirant. Gestion automatique des stocks par pointure et validation instantanée sans négociations interminables.',
        perk: 'Pointures 39 à 45 • Échange garanti sous 48h',
    },
    {
        id: 'smartwatch',
        title: 'Montre Connectée Pro Titanium',
        category: 'Horlogerie & Wearables',
        shop: 'Smart Gadgets Yaoundé',
        price: 45000,
        img: `${IMG}/prod-smartwatch.jpg`,
        tagline: 'Suivi santé, sport et autonomie 7 jours.',
        desc: 'Écran AMOLED haute définition avec boîtier étanche en titane brossé. Partagez votre SmartLink en story WhatsApp et encaissez immédiatement sans friction.',
        perk: 'Étanche IP68 certifiée • Compatible iOS & Android',
    },
    {
        id: 'perfume',
        title: 'Parfum Royal Écrin Ambré (100ml)',
        category: 'Beauté & Haute Parfumerie',
        shop: 'Maison Fragrance',
        price: 26000,
        img: `${IMG}/prod-perfume.jpg`,
        tagline: 'Sillage raffiné aux notes ambrées précieuses.',
        desc: 'Notes envoûtantes d’ambre précieux, de vanille de Madagascar et de bois de santal. Vos clients commandent en 1 clic grâce au paiement direct par prompt Mobile Money sécurisé.',
        perk: 'Flacon de luxe 100ml • Tenue olfactive longue durée 24h',
    },
];

const fcfa = (n) => `${Math.round(n).toLocaleString('fr-FR')} FCFA`;

export default function CardHandGallery() {
    const [selectedIndex, setSelectedIndex] = useState(0); // Carte active (0 = premier produit par défaut)
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const total = GALLERY_PRODUCTS.length;
    const current = GALLERY_PRODUCTS[selectedIndex];

    const handlePrev = () => {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
    };

    // Navigation au clavier (flèches gauche / droite)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <section id="vitrine" className="relative overflow-hidden bg-[#0D0B0A] text-white py-20 sm:py-28 border-y border-stone-800/80">
            {/* Lueur d'ambiance jaune dorée centrale façon studio haut de gamme */}
            <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[600px] sm:w-[800px] rounded-full bg-[#FFCC00]/[0.07] blur-[120px]"
                aria-hidden="true"
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* En-tête discret */}
                <Reveal className="mb-12 sm:mb-16 text-center max-w-2xl mx-auto space-y-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-xs font-medium text-amber-300 backdrop-blur-xs">
                        ✨ Vos articles en vitrine
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                        Peu importe ce que vous vendez, <span className="text-amber-400">tout part avec un lien</span>.
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-400 font-normal leading-relaxed">
                        Mode, électronique, cosmétiques, accessoires... Cliquez sur une carte pour explorer l’article.
                    </p>
                </Reveal>

                {/* Galerie en éventail (Card Hand) : 3 Colonnes équilibrées */}
                <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10">
                    
                    {/* Colonne Gauche : Compteur 01 / 05 & Titre du Produit Actif */}
                    <Reveal y={20} delay={0.08} className="lg:col-span-3 text-center lg:text-left space-y-4 order-2 lg:order-1">
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                            <span className="font-mono text-xs font-bold tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-md">
                                {String(selectedIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                            </span>
                            <span className="text-xs font-medium text-stone-400">
                                {current.category}
                            </span>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-2"
                            >
                                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                                    {current.title}
                                </h3>
                                
                                <div className="text-xl sm:text-2xl font-bold text-amber-400 pt-1">
                                    {fcfa(current.price)}
                                </div>

                                <div className="inline-flex items-center gap-1.5 text-xs text-stone-400 font-normal pt-1">
                                    <Store className="h-3.5 w-3.5 text-amber-400" />
                                    <span>{current.shop}</span>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Boutons de navigation Prev / Next */}
                        <div className="flex items-center justify-center lg:justify-start gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={handlePrev}
                                aria-label="Produit précédent"
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white hover:border-amber-400/60 transition-colors shadow-xs cursor-pointer"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                aria-label="Produit suivant"
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white hover:border-amber-400/60 transition-colors shadow-xs cursor-pointer"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <span className="text-[11px] text-stone-500 pl-2 hidden sm:inline">
                                Flèches clavier actives
                            </span>
                        </div>
                    </Reveal>

                    {/* Colonne Centrale : Éventail de 5 cartes interactives (Card Hand) */}
                    <Reveal y={30} delay={0.16} className="lg:col-span-6 flex justify-center order-1 lg:order-2">
                        <div className="relative h-[360px] sm:h-[420px] w-full max-w-[480px] sm:max-w-[540px] flex items-center justify-center select-none">
                            {GALLERY_PRODUCTS.map((prod, index) => {
                                const isSelected = index === selectedIndex;
                                const isHovered = index === hoveredIndex;

                                // Calcul de l'écartement par rapport à la carte sélectionnée
                                let diff = (index - selectedIndex + total) % total;
                                if (diff > total / 2) diff -= total; // Valeurs entre -2, -1, 0, 1, 2

                                // Configuration géométrique de l'éventail (fan layout)
                                // diff === 0 : Carte active centrale surélevée et droite
                                // diff < 0 : Cartes orientées vers la gauche
                                // diff > 0 : Cartes orientées vers la droite
                                const baseRotate = diff * 8; // -16deg, -8deg, 0deg, +8deg, +16deg
                                const baseX = diff * 76; // -152px, -76px, 0px, +76px, +152px
                                const baseY = Math.abs(diff) * 14; // Courbe douce vers le bas

                                // Si la carte est sélectionnée, elle est relevée en majesté au centre
                                const y = isSelected
                                    ? -48
                                    : isHovered
                                    ? baseY - 16
                                    : baseY;

                                const rotate = isSelected ? 0 : baseRotate;
                                const scale = isSelected ? 1.08 : isHovered ? 1.02 : 0.94;
                                const opacity = isSelected ? 1 : Math.abs(diff) === 1 ? 0.9 : 0.75;
                                const zIndex = isSelected ? 30 : 20 - Math.abs(diff) * 5;

                                return (
                                    <motion.div
                                        key={prod.id}
                                        onClick={() => setSelectedIndex(index)}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        style={{ zIndex }}
                                        animate={{
                                            x: baseX,
                                            y,
                                            rotate,
                                            scale,
                                            opacity,
                                        }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 320,
                                            damping: 25,
                                        }}
                                        className={`absolute cursor-pointer w-[165px] sm:w-[195px] h-[235px] sm:h-[285px] rounded-2xl overflow-hidden bg-stone-900 border transition-all duration-300 ${
                                            isSelected
                                                ? 'border-amber-400 shadow-2xl shadow-black/90 ring-2 ring-amber-400/40'
                                                : 'border-white/10 shadow-xl shadow-black/60 hover:border-white/30'
                                        }`}
                                    >
                                        <img
                                            src={prod.img}
                                            alt={prod.title}
                                            draggable={false}
                                            className="h-full w-full object-cover pointer-events-none"
                                        />

                                        {/* Dégradé discret pour la lisibilité sur chaque carte */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3 text-white">
                                            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                                                {prod.category.split('&')[0]}
                                            </span>
                                            <span className="text-xs font-semibold truncate text-white">
                                                {prod.title}
                                            </span>
                                            <span className="text-[11px] font-medium text-amber-200">
                                                {fcfa(prod.price)}
                                            </span>
                                        </div>

                                        {/* Badge En vedette sur la carte sélectionnée */}
                                        {isSelected && (
                                            <div className="absolute top-2.5 right-2.5 rounded-full bg-[#FFCC00] text-[#2B2620] px-2 py-0.5 text-[9px] font-bold shadow-xs">
                                                Actif
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </Reveal>

                    {/* Colonne Droite : Description & CTA d'achat express */}
                    <Reveal y={20} delay={0.24} className="lg:col-span-3 text-center lg:text-left space-y-4 order-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-3.5"
                            >
                                <div className="text-xs font-medium text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg inline-block">
                                    {current.tagline}
                                </div>

                                <p className="text-xs sm:text-sm text-stone-300 font-normal leading-relaxed">
                                    {current.desc}
                                </p>

                                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-stone-300 flex items-center gap-2.5">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 stroke-[2.5]" />
                                    <span className="font-normal text-[11px]">{current.perk}</span>
                                </div>

                                <div className="pt-1">
                                    <a
                                        href="/register"
                                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#FFCC00] px-5 py-2.5 text-xs font-bold text-[#2B2620] hover:bg-[#E6B800] transition-colors shadow-md shadow-yellow-500/20"
                                    >
                                        <ShoppingBag className="h-3.5 w-3.5" />
                                        Créer ma boutique Biolinko
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </Reveal>

                </div>
            </div>
        </section>
    );
}
