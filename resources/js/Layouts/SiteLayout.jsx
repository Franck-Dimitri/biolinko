import { Head, usePage } from '@inertiajs/react';
import { MotionConfig, motion } from 'framer-motion';
import Footer from '@/Components/Landing/Footer';
import SiteHeader from '@/Components/Landing/SiteHeader';
import { Rails, WRAP } from '@/Components/Landing/Frame';
import { EASE_OUT } from '@/Components/UI/Motion';

/**
 * Gabarit des pages d'information du site public (À propos, Contact, Aide, Programme pilote…) :
 * même en-tête, même cadre et même pied de page que l'accueil.
 */
export default function SiteLayout({ title, eyebrow, heading, intro, children, wide = false }) {
    const { auth } = usePage().props;
    return (
        <MotionConfig reducedMotion="user">
            <Head title={`${title} | Biolinko`} />
            <div className="min-h-screen overflow-x-clip bg-white font-poppins text-[#141412] antialiased selection:bg-[#FFCC00]/60">
                <SiteHeader auth={auth} />
                <main className="pt-16">
                    <section className="relative border-b border-black/[0.06] bg-[#FBFAF6] pb-14 pt-16 sm:pb-20 sm:pt-24">
                        <Rails top={false} />
                        <div className={WRAP}>
                            <div className={wide ? 'max-w-[900px]' : 'max-w-[760px]'}>
                                {eyebrow && (
                                    <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 text-[14px] font-medium text-[#B38600]">
                                        <span className="h-px w-6 bg-[#B38600]/50" /> {eyebrow}
                                    </motion.p>
                                )}
                                <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05, ease: EASE_OUT }}
                                    className="mt-4 text-[36px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
                                    {heading}
                                </motion.h1>
                                {intro && (
                                    <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12, ease: EASE_OUT }}
                                        className="mt-5 text-[18px] leading-relaxed text-[#5F5E58]">
                                        {intro}
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    </section>
                    {children}
                </main>
                <Footer />
            </div>
        </MotionConfig>
    );
}
