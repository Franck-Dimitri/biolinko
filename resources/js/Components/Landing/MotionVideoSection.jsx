import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { Reveal } from '@/Components/Motion';

/**
 * Section Vidéo Démo (YouTube)
 * Épurée et directe avec typographie soignée et sans noir pur
 */
export default function MotionVideoSection({
    youtubeId = '5N1moUCsVhI',
    title = 'Voyez Biolinko en action.',
}) {
    const [isPlaying, setIsPlaying] = useState(false);

    const getCleanYoutubeId = (idOrUrl) => {
        if (!idOrUrl) return '5N1moUCsVhI';
        const match = idOrUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        return match ? match[1] : idOrUrl;
    };

    const cleanId = getCleanYoutubeId(youtubeId);

    return (
        <section id="demo" className="relative bg-[#FAF9F5] py-16 sm:py-20 border-t border-slate-200/80">
            <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
                {/* Titre avec typographie sobre */}
                <div className="mx-auto max-w-3xl text-center mb-10">
                    <Reveal>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#2B2620]">
                            {title}
                        </h2>
                    </Reveal>
                </div>

                {/* Cadre vidéo équilibré (rounded-2xl) */}
                <Reveal delay={0.12}>
                    <div className="relative mx-auto max-w-4xl">
                        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50">
                            {/* Zone du lecteur 16:9 */}
                            <div className="relative aspect-video w-full bg-stone-900">
                                <AnimatePresence mode="wait">
                                    {!isPlaying ? (
                                        <motion.div
                                            key="poster"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            onClick={() => setIsPlaying(true)}
                                            className="group relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-br from-[#2B2620] via-stone-800 to-amber-950 text-white"
                                        >
                                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

                                            {/* Bouton Play jaune Biolinko avec animation au survol */}
                                            <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                                                <motion.div
                                                    whileHover={{ scale: 1.08 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#FFCC00] text-[#2B2620] shadow-lg shadow-yellow-500/30 transition-transform"
                                                >
                                                    <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-current translate-x-0.5" />
                                                </motion.div>
                                                <p className="text-xs sm:text-sm font-medium text-white/90 group-hover:text-amber-200 transition-colors">
                                                    Regarder la démonstration (1 min)
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="youtube-iframe"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="h-full w-full"
                                        >
                                            <iframe
                                                className="h-full w-full border-0"
                                                src={`https://www.youtube-nocookie.com/embed/${cleanId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                                                title="Vidéo explicative Biolinko"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
