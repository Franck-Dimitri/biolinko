import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getConsent, setConsent } from '@/Components/consent';
import { contrastColor } from '@/Components/Storefront/theme';

// Pages publiques où le bandeau s'affiche (pas le tableau de bord ni l'administration)
const PUBLIC = ['Welcome', 'Site/', 'Legal/', 'Storefront/', 'Payment/', 'OrderTracking/', 'Errors/'];
const isPublic = (component = '') => PUBLIC.some((p) => component === p || component.startsWith(p));

/** Bandeau de consentement : accepter ou refuser les outils de mesure et de publicité. */
export default function CookieBanner({ initialPage }) {
    const [page, setPage] = useState(initialPage);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(getConsent() === null);
        const offNav = router.on('navigate', (e) => setPage(e.detail.page));
        const reopen = () => setOpen(true);
        window.addEventListener('biolinko:consent-open', reopen);
        return () => { offNav(); window.removeEventListener('biolinko:consent-open', reopen); };
    }, []);

    const choose = (value) => { setConsent(value); setOpen(false); };
    const color = page?.props?.store?.theme_color || '#FFCC00';
    const show = open && isPublic(page?.component);
    const policy = typeof route === 'function' ? route('legal.cookies') : '/politique-des-cookies';

    return (
        <AnimatePresence>
            {show && (
                <motion.div role="dialog" aria-live="polite" aria-label="Cookies"
                    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-[460px] rounded-2xl border border-black/[0.08] bg-white p-5 font-sans text-[#2B2620] shadow-[0_18px_50px_-12px_rgba(0,0,0,0.25)] sm:left-6 sm:right-auto sm:mx-0">
                    <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6F5F1]"><Cookie className="h-[18px] w-[18px]" /></span>
                        <div className="min-w-0">
                            <p className="text-[15px] font-semibold">Vos cookies, votre choix</p>
                            <p className="mt-1 text-[13.5px] leading-relaxed text-[#5F5E58]">
                                Les cookies essentiels font fonctionner le site (connexion, panier). Avec votre accord, nous mesurons aussi les visites et les vendeurs peuvent utiliser leurs outils publicitaires (Meta, TikTok, Google).{' '}
                                <a href={policy} className="underline underline-offset-2 hover:text-[#2B2620]">En savoir plus</a>
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => choose('refused')} className="h-11 rounded-full border border-black/15 text-[14px] font-medium hover:border-black/40 active:scale-[0.98]">Refuser</button>
                        <button type="button" onClick={() => choose('accepted')} style={{ backgroundColor: color, color: contrastColor(color) }} className="h-11 rounded-full text-[14px] font-medium hover:brightness-95 active:scale-[0.98]">Accepter</button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
