import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { EASE_OUT } from '@/Components/UI/Motion';
import { WRAP } from '@/Components/Landing/Frame';

const NAV = [['/#produit', 'Produit'], ['/#fonctionnalites', 'Fonctionnalités'], ['/#tarifs', 'Tarifs'], ['/aide', 'Aide'], ['/contact', 'Contact']];

/** En-tête du site public (accueil, pages d'information, centre d'aide). */
export default function SiteHeader({ auth, overHero = false }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.3 });
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    const cta = auth?.user ? route('dashboard') : route('register');
    // Transparent au-dessus du hero sombre de l'accueil, clair partout ailleurs
    const light = !overHero || scrolled || open;

    return (
        <motion.header initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: EASE_OUT }}
            className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${light ? 'border-b border-black/[0.06] bg-white/90 backdrop-blur-md' : 'bg-transparent'}`}>
            <div className={`${WRAP} flex h-16 items-center justify-between`}>
                <Link href="/" className="flex items-center gap-2">
                    <motion.span initial={{ rotate: -90, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
                        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#FFCC00]">
                        <img src="/images/brand/logo-noir.svg" alt="" className="h-12 w-12 max-w-none" />
                    </motion.span>
                    <span className={`text-[19px] font-semibold tracking-tight transition-colors ${light ? 'text-[#141412]' : 'text-white'}`}>Biolinko</span>
                </Link>
                <nav className="hidden items-center gap-7 lg:flex">
                    {NAV.map(([href, label]) => (
                        <a key={href} href={href} className={`text-[15px] transition-colors ${light ? 'text-[#141412]/70 hover:text-[#141412]' : 'text-white/70 hover:text-white'}`}>{label}</a>
                    ))}
                </nav>
                <div className="flex items-center gap-3">
                    {!auth?.user && <Link href={route('login')} className={`hidden text-[15px] sm:block ${light ? 'text-[#141412]/70 hover:text-[#141412]' : 'text-white/70 hover:text-white'}`}>Se connecter</Link>}
                    <Link href={cta} className="hidden h-10 items-center rounded-full bg-[#FFCC00] px-5 text-[14px] font-medium text-[#141412] transition-transform hover:-translate-y-0.5 hover:bg-[#FFD633] sm:flex">
                        {auth?.user ? 'Tableau de bord' : 'Commencer gratuitement'}
                    </Link>
                    <button type="button" onClick={() => setOpen((v) => !v)} aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={open}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border lg:hidden ${light ? 'border-black/10 text-[#141412]' : 'border-white/20 text-white'}`}>
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>
            <motion.div aria-hidden style={{ scaleX: progress }} className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[#FFCC00]" />
            <AnimatePresence>
                {open && (
                    <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-black/5 bg-white lg:hidden">
                        <div className="space-y-1 px-5 py-4">
                            {NAV.map(([href, label], i) => (
                                <motion.a key={href} href={href} onClick={() => setOpen(false)} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}
                                    className="block py-2.5 text-base text-[#141412]">{label}</motion.a>
                            ))}
                            {!auth?.user && <Link href={route('login')} className="block py-2.5 text-base text-[#141412]/70">Se connecter</Link>}
                            <Link href={cta} className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[#FFCC00] text-[15px] font-medium text-[#141412]">
                                {auth?.user ? 'Tableau de bord' : 'Commencer gratuitement'}
                            </Link>
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
