import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';

export const EASE_OUT = [0.22, 1, 0.36, 1];

/** Apparition au scroll (une seule fois). */
export function Reveal({ as = 'div', delay = 0, y = 24, className = '', children, ...rest }) {
    const reduce = useReducedMotion();
    const Tag = motion[as] || motion.div;
    return (
        <Tag
            initial={{ opacity: 0, y: reduce ? 0 : y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: EASE_OUT, delay }}
            className={className}
            {...rest}
        >
            {children}
        </Tag>
    );
}

/** Conteneur qui fait apparaître ses <StaggerItem> en cascade. */
export function Stagger({ as = 'div', gap = 0.08, className = '', children, ...rest }) {
    const Tag = motion[as] || motion.div;
    return (
        <Tag
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
            className={className}
            {...rest}
        >
            {children}
        </Tag>
    );
}

export function StaggerItem({ as = 'div', y = 20, className = '', children, ...rest }) {
    const reduce = useReducedMotion();
    const Tag = motion[as] || motion.div;
    return (
        <Tag
            variants={{
                hidden: { opacity: 0, y: reduce ? 0 : y },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
            }}
            className={className}
            {...rest}
        >
            {children}
        </Tag>
    );
}

/** Image avec léger effet de parallaxe pendant le scroll. */
export function Parallax({ strength = 40, className = '', children }) {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [strength, -strength]);
    return (
        <div ref={ref} className={className}>
            <motion.div style={{ y }} className="h-full w-full">
                {children}
            </motion.div>
        </div>
    );
}

/** Bandeau défilant infini ; le contenu est dupliqué pour une boucle sans à-coup. */
export function Marquee({ className = '', speed = 40, children }) {
    const reduce = useReducedMotion();
    return (
        <div className={`group overflow-hidden ${className}`}>
            <div
                className="flex w-max group-hover:[animation-play-state:paused]"
                style={reduce ? undefined : { animation: `marquee ${speed}s linear infinite` }}
            >
                <div className="flex gap-5 pr-5">{children}</div>
                <div aria-hidden="true" className="flex gap-5 pr-5">{children}</div>
            </div>
        </div>
    );
}

/** Nombre qui s'incrémente quand il entre à l'écran. */
export function CountUp({ to, duration = 1.4, format = (n) => Math.round(n).toLocaleString('fr-FR'), className = '' }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const reduce = useReducedMotion();
    const [value, setValue] = useState(reduce ? to : 0);

    useEffect(() => {
        if (!inView || reduce) return;
        const controls = animate(0, to, { duration, ease: EASE_OUT, onUpdate: setValue });
        return () => controls.stop();
    }, [inView, to, duration, reduce]);

    return <span ref={ref} className={className}>{format(value)}</span>;
}
