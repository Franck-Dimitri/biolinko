import { Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { EASE_OUT } from '@/Components/Motion';

/*
 * Kit d'interface du tableau de bord : une seule source pour les couleurs et les formes.
 * Charte : fond #FAFAF8, cartes blanches, encre #141412, jaune #FFCC00 réservé à l'action principale
 * et aux éléments actifs. Les couleurs vert / ambre / rouge ne servent qu'aux statuts.
 */

export const fcfa = (n) => `${Math.round(Number(n) || 0).toLocaleString('fr-FR')} FCFA`;
export const shortDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const dateTime = (d) => (d ? new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

export const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: EASE_OUT },
});

export function BackButton({ onClick, label = 'Retour' }) {
    return (
        <button type="button" onClick={onClick}
            className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[13px] text-[#5F5E58] hover:border-black/25 hover:text-[#141412]">
            <ArrowLeft className="h-4 w-4" /> {label}
        </button>
    );
}

/** `onBack` : affiche un bouton « Retour » au-dessus du titre (vues intégrées à la page). */
export function PageHeader({ title, sub, actions, onBack, backLabel }) {
    return (
        <motion.div {...reveal()} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0">
                {onBack && <BackButton onClick={onBack} label={backLabel} />}
                <h1 className="text-[28px] font-medium tracking-[-0.03em] text-[#141412]">{title}</h1>
                {sub && <p className="mt-1 text-[15px] text-[#5F5E58]">{sub}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </motion.div>
    );
}

const BTN = {
    primary: 'bg-[#FFCC00] text-[#141412] hover:bg-[#F5C400]',
    dark: 'bg-[#141412] text-white hover:bg-[#2B2A26]',
    secondary: 'border border-black/10 bg-white text-[#141412] hover:border-black/25',
    ghost: 'text-[#5F5E58] hover:bg-black/[0.04] hover:text-[#141412]',
    danger: 'border border-red-200 bg-white text-[#B91C1C] hover:bg-red-50',
};

export function Button({ variant = 'secondary', size = 'md', href, as, method, className = '', children, ...rest }) {
    const sizes = { sm: 'h-9 px-3.5 text-[13px]', md: 'h-10 px-4 text-[14px]', lg: 'h-12 px-6 text-[15px]' };
    const cls = `inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${BTN[variant]} ${className}`;
    if (href) {
        const external = /^(https?:|mailto:|tel:)/.test(href) || rest.target === '_blank';
        return external
            ? <a href={href} className={cls} {...rest}>{children}</a>
            : <Link href={href} as={as} method={method} className={cls} {...rest}>{children}</Link>;
    }
    return <button type="button" className={cls} {...rest}>{children}</button>;
}

export function Card({ children, className = '', delay = 0, padded = true }) {
    return (
        <motion.section {...reveal(delay)} className={`rounded-3xl border border-black/[0.06] bg-white ${padded ? 'p-6' : ''} ${className}`}>
            {children}
        </motion.section>
    );
}

export function CardHeader({ title, sub, action, className = '' }) {
    return (
        <div className={`flex items-start justify-between gap-4 ${className}`}>
            <div className="min-w-0">
                <h2 className="text-[17px] font-medium text-[#141412]">{title}</h2>
                {sub && <p className="mt-0.5 text-[14px] text-[#8B8A83]">{sub}</p>}
            </div>
            {action}
        </div>
    );
}

export function Stat({ label, value, hint, Icon, accent = false, delay = 0 }) {
    return (
        <motion.div {...reveal(delay)} className={`rounded-3xl border p-5 ${accent ? 'border-[#FFCC00]/60 bg-[#FFFBEA]' : 'border-black/[0.06] bg-white'}`}>
            <div className="flex items-center justify-between text-[14px] text-[#5F5E58]">
                {label}
                {Icon && <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${accent ? 'bg-[#FFCC00]' : 'bg-[#F6F5F1]'} text-[#141412]`}><Icon className="h-4 w-4" /></span>}
            </div>
            <p className="mt-4 text-[26px] font-medium tracking-[-0.02em] tabular-nums text-[#141412]">{value}</p>
            {hint && <p className="mt-1 text-[13px] text-[#8B8A83]">{hint}</p>}
        </motion.div>
    );
}

const TONES = {
    success: 'bg-[#DCFCE7] text-[#15803D]',
    warning: 'bg-[#FFF3C4] text-[#7A5B00]',
    danger: 'bg-red-50 text-[#B91C1C]',
    info: 'bg-[#E0EAFF] text-[#1D4ED8]',
    neutral: 'bg-[#F2F1EC] text-[#5F5E58]',
    brand: 'bg-[#FFCC00] text-[#141412]',
};

export function Badge({ tone = 'neutral', children, className = '' }) {
    return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium ${TONES[tone]} ${className}`}>{children}</span>;
}

/** Statuts de commande communs à toutes les vues. */
export const ORDER_STATUS = {
    pending: ['En attente de paiement', 'warning'],
    paid: ['Payée · à livrer', 'success'],
    in_delivery: ['En livraison', 'info'],
    delivered: ['Livrée', 'neutral'],
    cancelled: ['Annulée', 'danger'],
};

export function OrderStatus({ status }) {
    const [label, tone] = ORDER_STATUS[status] || ORDER_STATUS.pending;
    return <Badge tone={tone}>{label}</Badge>;
}

/** Onglets en pilule ; l'onglet actif prend l'encre de la charte. */
export function Tabs({ tabs, value, onChange, id = 'tabs' }) {
    return (
        <div className="flex gap-1 overflow-x-auto rounded-full bg-[#F2F1EC] p-1 [scrollbar-width:none]" role="tablist">
            {tabs.map(([key, label, count]) => {
                const on = value === key;
                return (
                    <button key={key} type="button" role="tab" aria-selected={on} onClick={() => onChange(key)}
                        className={`relative flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] transition-colors ${on ? 'text-[#141412]' : 'text-[#5F5E58] hover:text-[#141412]'}`}>
                        {on && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                        <span className="relative">{label}</span>
                        {count !== undefined && <span className={`relative rounded-full px-1.5 text-[12px] tabular-nums ${on ? 'bg-[#FFCC00]' : 'bg-white/70'}`}>{count}</span>}
                    </button>
                );
            })}
        </div>
    );
}

export function SearchInput({ value, onChange, placeholder = 'Rechercher…', className = '' }) {
    return (
        <label className={`relative block ${className}`}>
            <span className="sr-only">{placeholder}</span>
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8A83]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                className="h-10 w-full rounded-full border-black/10 bg-white pl-10 pr-4 text-[14px] text-[#141412] placeholder:text-[#8B8A83] focus:border-black/25 focus:ring-0" />
        </label>
    );
}

export function Empty({ Icon, title, text, action }) {
    return (
        <div className="flex flex-col items-center rounded-2xl bg-[#F6F5F1] px-6 py-12 text-center">
            {Icon && <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#141412]"><Icon className="h-5 w-5" /></span>}
            <p className="mt-4 text-[16px] font-medium text-[#141412]">{title}</p>
            {text && <p className="mt-1 max-w-sm text-[14px] text-[#5F5E58]">{text}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}

export const fieldClass = 'h-11 w-full rounded-xl border border-black/10 bg-white px-3.5 text-[15px] text-[#141412] placeholder:text-[#8B8A83] focus:border-black/30 focus:ring-0';
export const labelClass = 'mb-1.5 block text-[14px] font-medium text-[#141412]';

export function Field({ label, hint, error, children }) {
    return (
        <div>
            {label && <span className={labelClass}>{label}</span>}
            {children}
            {hint && !error && <p className="mt-1.5 text-[13px] text-[#8B8A83]">{hint}</p>}
            {error && <p className="mt-1.5 text-[13px] text-[#B91C1C]">{error}</p>}
        </div>
    );
}

/**
 * Sous-page intégrée : remplace le contenu de la page (pas de fenêtre par-dessus).
 * Bouton « Retour » vers la vue précédente, titre, puis le contenu dans une carte.
 */
export function SubPage({ open = true, onClose, title, sub, children, width = 'max-w-3xl', backLabel = 'Retour', aside }) {
    useEffect(() => {
        if (open) window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [open]);
    if (!open) return null;
    return (
        <motion.div key={title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE_OUT }} className="space-y-6 pb-12">
            <div>
                <BackButton onClick={onClose} label={backLabel} />
                <h1 className="text-[28px] font-medium tracking-[-0.03em] text-[#141412]">{title}</h1>
                {sub && <p className="mt-1 max-w-2xl text-[15px] text-[#5F5E58]">{sub}</p>}
            </div>
            <div className={aside ? 'grid items-start gap-4 xl:grid-cols-[1fr_340px]' : ''}>
                <div className={`rounded-3xl border border-black/[0.06] bg-white p-6 sm:p-8 ${aside ? '' : width}`}>{children}</div>
                {aside}
            </div>
        </motion.div>
    );
}

/** Tableau sobre : en-têtes discrets, lignes séparées par un trait fin. */
export function Table({ head, children }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[14px]">
                <thead>
                    <tr className="border-b border-black/[0.06] text-[13px] text-[#8B8A83]">
                        {head.map(([label, cls = '']) => <th key={label} className={`px-4 py-3 font-normal ${cls}`}>{label}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">{children}</tbody>
            </table>
        </div>
    );
}

export function PlanLock({ plan = 'Pro', text }) {
    return (
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#FFCC00]/50 bg-[#FFFBEA] p-4 sm:flex-row sm:items-center">
            <p className="text-[14px] text-[#141412]">{text || `Disponible à partir du plan ${plan}.`}</p>
            <Button variant="primary" size="sm" href={route('seller.subscriptions.index', { plan: plan.toLowerCase() })}>Passer au {plan}</Button>
        </div>
    );
}
