import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Reveal } from '@/Components/Motion';

const IMG = '/images/landing';

const TESTIMONIALS = [
    {
        id: 'amina',
        num: '01',
        name: 'Amina Diallo',
        boutique: 'Maison Kemi',
        category: 'Mode & Haute Couture',
        city: 'Dakar, Sénégal',
        slug: 'test',
        image: `${IMG}/portrait-amina.webp`,
        quote: "Avant Biolinko, je passais 3 heures par soirée à vérifier des captures d'écran de paiement. Maintenant, les clientes règlent directement par Orange Money et Wave, et mes colis partent sans aucun stress !",
        stats: '+180 commandes / mois',
        rating: 5,
    },
    {
        id: 'fatou',
        num: '02',
        name: 'Fatou Bamba',
        boutique: 'Bamba Prestige',
        category: 'Prêt-à-Porter Féminin',
        city: 'Abidjan, Côte d’Ivoire',
        slug: 'mrdims-dev',
        image: `${IMG}/hero-vendeuse.webp`,
        quote: "J'ai collé le lien de ma boutique dans ma bio TikTok. En un week-end, j'ai fait 42 ventes sans répondre à un seul 'prix svp' en message privé. C'est magique !",
        stats: 'CA doublé en 60 jours',
        rating: 5,
    },
    {
        id: 'koffi',
        num: '03',
        name: 'Koffi Mensah',
        boutique: 'Kente Heritage',
        category: 'Tissus & Confection Wax',
        city: 'Lomé, Togo',
        slug: 'amy-allen',
        image: `${IMG}/haut-kente.webp`,
        quote: "Les factures automatiques avec QR code ont totalement professionnalisé notre marque. Nos clients sont rassurés et recommandent chaque mois sans hésiter.",
        stats: '98% d’avis 5 étoiles',
        rating: 5,
    },
    {
        id: 'mariam',
        num: '04',
        name: 'Mariam Traoré',
        boutique: 'Afro Botanica',
        category: 'Soins & Cosmétiques Bio',
        city: 'Bamako, Mali',
        slug: 'facebook',
        image: `${IMG}/foulard.webp`,
        quote: "La gestion de stock en direct nous évite de vendre des produits en rupture. Et dès qu'un paiement tombe, l'argent arrive instantanément sur mon compte MoMo.",
        stats: '0 rupture de stock',
        rating: 5,
    },
    {
        id: 'christian',
        num: '05',
        name: 'Christian Kouamé',
        boutique: 'Atelier Kouamé',
        category: 'Maroquinerie Artisanale',
        city: 'Douala, Cameroun',
        slug: 'raymond-curtis',
        image: `${IMG}/sac-cuir.webp`,
        quote: "Nos ventes ont bondi de 65 % dès le premier mois. Les clients choisissent leur modèle, payent en 30 secondes et reçoivent leur reçu officiel par WhatsApp.",
        stats: '+65% de conversion',
        rating: 5,
    },
];

export default function TestimonialsAccordion() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-défilement fluide toutes les 6 secondes avec mise en pause au survol
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [isPaused]);

    return (
        <section
            id="temoignages"
            className="relative bg-white py-20 sm:py-24 border-t border-slate-200/80 overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Lueur d'ambiance très douce */}
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-72 w-[550px] rounded-full bg-amber-200/20 blur-[110px]" />

            <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
                {/* En-tête : Typographie sobre, pas de gras excessif */}
                <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-14">
                    <Reveal>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 mb-3.5">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            <span>Témoignages vendeurs</span>
                        </div>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2620]">
                            Ils développent leurs ventes avec Biolinko.
                        </h2>
                    </Reveal>
                    <Reveal delay={0.14}>
                        <p className="mt-3 text-base text-slate-600 font-normal leading-relaxed">
                            Passez la souris sur une boutique pour voir comment ils vendent sur les réseaux sociaux et encaissent par Mobile Money.
                        </p>
                    </Reveal>
                </div>

                {/* Carrousel accordéon horizontal (Desktop & Tablette) */}
                <Reveal y={24} delay={0.1}>
                    <div className="hidden md:flex gap-3 h-[520px] lg:h-[550px] w-full items-stretch">
                    {TESTIMONIALS.map((item, index) => {
                        const isActive = activeIndex === index;

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                onMouseEnter={() => {
                                    setActiveIndex(index);
                                    setIsPaused(true);
                                }}
                                onClick={() => setActiveIndex(index)}
                                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                                className={`relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${
                                    isActive
                                        ? 'flex-[3.5] lg:flex-[3.8] border-2 border-[#FFCC00] shadow-xl shadow-amber-500/10'
                                        : 'flex-[0.65] lg:flex-[0.75] border border-slate-200 bg-stone-50 hover:border-amber-300 hover:bg-amber-50/30'
                                }`}
                            >
                                {/* Carte ACTIVE */}
                                {isActive && (
                                    <>
                                        <motion.img
                                            initial={{ scale: 1.05 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                            src={item.image}
                                            alt={item.name}
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />

                                        {/* Dégradé doux chaud (pas de noir pur) */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2620]/90 via-[#2B2620]/45 to-transparent" />

                                        {/* Contenu carte active avec micro-animation d'apparition */}
                                        <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-7 lg:p-8">
                                            {/* Haut : Tag catégorie + Étoiles */}
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="flex items-center justify-between gap-3"
                                            >
                                                <span className="rounded-full border border-white/30 bg-white/95 px-3 py-1 text-xs font-semibold text-[#2B2620] shadow-sm backdrop-blur">
                                                    {item.category}
                                                </span>
                                                <div className="flex items-center gap-1 rounded-full bg-[#2B2620]/60 px-2.5 py-1 border border-white/20 backdrop-blur">
                                                    {[...Array(item.rating)].map((_, i) => (
                                                        <Star key={i} className="h-3 w-3 fill-[#FFCC00] text-[#FFCC00]" />
                                                    ))}
                                                </div>
                                            </motion.div>

                                            {/* Bas : Citation, Nom, Boutique & Lien */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.35, delay: 0.08 }}
                                                className="space-y-4"
                                            >
                                                <p className="text-base sm:text-lg text-white font-normal leading-relaxed max-w-xl">
                                                    « {item.quote} »
                                                </p>

                                                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-white/20 pt-4">
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <h3 className="text-lg sm:text-xl font-bold text-white">
                                                                {item.name}
                                                            </h3>
                                                            <CheckCircle2 className="h-4 w-4 text-[#FFCC00]" />
                                                        </div>
                                                        <p className="text-xs sm:text-sm font-medium text-[#FFCC00]">
                                                            {item.boutique} <span className="font-normal text-stone-300">• {item.city}</span>
                                                        </p>
                                                        <div className="mt-1.5 text-xs text-amber-100/90 font-normal">
                                                            ● {item.stats}
                                                        </div>
                                                    </div>

                                                    <motion.a
                                                        href={`/${item.slug}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        whileHover={{ scale: 1.03 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFCC00] px-4 py-2.5 text-xs font-bold text-[#2B2620] shadow-md hover:bg-[#E6B800] transition-colors"
                                                    >
                                                        <span>Visiter la boutique</span>
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </motion.a>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </>
                                )}

                                {/* Carte INACTIVE (Bandelette claire compacte) */}
                                {!isActive && (
                                    <div className="relative z-10 flex h-full flex-col justify-between items-center py-5 px-1.5">
                                        {/* Miniature photo */}
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-xs">
                                            <img
                                                src={item.image}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Nom vertical */}
                                        <div className="flex-1 flex items-center justify-center my-4">
                                            <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-semibold uppercase tracking-wider text-slate-600 group-hover:text-amber-800 transition-colors whitespace-nowrap">
                                                {item.boutique}
                                            </span>
                                        </div>

                                        {/* Numéro */}
                                        <span className="text-[11px] font-mono text-slate-400">
                                            {item.num}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Indicateurs de navigation interactifs */}
                <div className="hidden md:flex items-center justify-center gap-2 mt-6">
                    {TESTIMONIALS.map((t, idx) => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveIndex(idx)}
                            aria-label={`Voir témoignage ${t.name}`}
                            className={`h-2 transition-all rounded-full ${
                                activeIndex === idx ? 'w-8 bg-[#FFCC00]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                            }`}
                        />
                    ))}
                </div>

                {/* Version Mobile tactile */}
                <div className="flex md:hidden flex-col gap-4">
                    {TESTIMONIALS.map((item, index) => {
                        const isActive = activeIndex === index;

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                onClick={() => setActiveIndex(isActive ? -1 : index)}
                                className={`overflow-hidden rounded-xl border transition-all ${
                                    isActive
                                        ? 'border-[#FFCC00] bg-white shadow-md ring-1 ring-amber-300/50'
                                        : 'border-slate-200 bg-white shadow-xs'
                                }`}
                            >
                                <div className="relative h-56 w-full overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#2B2620]/85 via-[#2B2620]/40 to-transparent" />

                                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                        <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-medium text-[#2B2620]">
                                            {item.category}
                                        </span>
                                        <div className="flex items-center gap-0.5 rounded-full bg-[#2B2620]/60 px-2 py-0.5 border border-white/20">
                                            {[...Array(item.rating)].map((_, i) => (
                                                <Star key={i} className="h-3 w-3 fill-[#FFCC00] text-[#FFCC00]" />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-3 left-3 right-3">
                                        <div className="flex items-center gap-1.5">
                                            <h3 className="text-base font-bold text-white">{item.name}</h3>
                                            <CheckCircle2 className="h-3.5 w-3.5 text-[#FFCC00]" />
                                        </div>
                                        <p className="text-xs font-medium text-[#FFCC00]">
                                            {item.boutique} <span className="text-stone-300 font-normal">• {item.city}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3 bg-white">
                                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                                        « {item.quote} »
                                    </p>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                        <span className="text-xs text-amber-800 font-medium">
                                            ● {item.stats}
                                        </span>
                                        <a
                                            href={`/${item.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 rounded-lg bg-[#FFCC00] px-3 py-1.5 text-xs font-semibold text-[#2B2620]"
                                        >
                                            <span>Visiter</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                </Reveal>
            </div>
        </section>
    );
}
