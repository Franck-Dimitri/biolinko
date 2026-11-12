import { motion } from 'framer-motion';
import { EASE_OUT } from '@/Components/UI/Motion';

/** Largeur commune à toutes les sections de la landing (rails compris). */
export const WRAP = 'relative mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12';

/** Petite croix posée à l'intersection d'un rail et du haut d'une section. */
function Cross({ className = '' }) {
    return (
        <svg aria-hidden viewBox="0 0 11 11" className={`absolute h-[11px] w-[11px] ${className}`}>
            <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" strokeWidth="1" />
        </svg>
    );
}

/**
 * Rails verticaux fins qui délimitent la zone de contenu sur toute la page,
 * avec un trait horizontal et des croix en haut de chaque section.
 */
export function Rails({ dark = false, top = true }) {
    const line = dark ? 'border-white/[0.08] text-white/25' : 'border-black/[0.07] text-black/25';
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
            {top && <div className={`absolute inset-x-0 top-0 border-t ${line}`} />}
            <div className={`absolute inset-y-0 left-1/2 w-full max-w-[1320px] -translate-x-1/2 border-x ${line}`}>
                {top && <><Cross className="-left-[6px] -top-[6px]" /><Cross className="-right-[6px] -top-[6px]" /></>}
            </div>
        </div>
    );
}

/** Section de landing : fond, rails et conteneur commun. */
export function Section({ id, dark = false, top = true, className = '', innerClassName = '', children }) {
    return (
        <section id={id} className={`relative scroll-mt-20 ${className}`}>
            <Rails dark={dark} top={top} />
            <div className={`${WRAP} ${innerClassName}`}>{children}</div>
        </section>
    );
}

/** Titre révélé mot par mot à l'entrée dans l'écran. */
export function RevealWords({ text, as: Tag = 'h2', className = '', delay = 0 }) {
    const words = text.split(' ');
    return (
        <Tag className={className} aria-label={text}>
            {words.map((w, i) => (
                <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <motion.span className="inline-block" initial={{ y: '105%' }} whileInView={{ y: 0 }} viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.7, delay: delay + i * 0.045, ease: EASE_OUT }}>
                        {w}{i < words.length - 1 ? ' ' : ''}
                    </motion.span>
                </span>
            ))}
        </Tag>
    );
}

export const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, delay, ease: EASE_OUT },
});

export function Eyebrow({ children, dark = false }) {
    return (
        <motion.p {...reveal()} className={`inline-flex items-center gap-2 text-[14px] font-medium ${dark ? 'text-[#FFCC00]' : 'text-[#B38600]'}`}>
            <span className={`h-px w-6 ${dark ? 'bg-[#FFCC00]/60' : 'bg-[#B38600]/50'}`} /> {children}
        </motion.p>
    );
}
