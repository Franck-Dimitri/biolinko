import { motion } from 'framer-motion';
import {
    CakeSlice, Check, HeartPulse, Palette, Scissors, Shirt, ShoppingBasket, Smartphone, Sofa, Sparkles, Store, ToyBrick, UtensilsCrossed, Watch, Wrench,
} from 'lucide-react';
import { PatternLayer, patternLabel } from '@/Components/Storefront/patterns';

const ICONS = {
    mode: Shirt, accessoires: Watch, beaute: Sparkles, electronique: Smartphone, alimentation: ShoppingBasket, maison: Sofa, sante: HeartPulse,
    enfants: ToyBrick, patisserie: CakeSlice, restauration: UtensilsCrossed, couture: Scissors, artisanat: Palette, services: Wrench, autre: Store,
};

/** Grille visuelle des activités : chaque carte montre l'icône, la couleur et le motif de l'activité. */
export function ActivityPicker({ types = {}, value, onChange }) {
    return (
        <div role="radiogroup" aria-label="Activité de la boutique" className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(128px,1fr))]">
            {Object.entries(types).map(([key, t], i) => {
                const Icon = ICONS[key] || Store;
                const color = t.style?.theme_color || '#141412';
                const on = value === key;
                return (
                    <motion.button key={key} type="button" role="radio" aria-checked={on} onClick={() => onChange(key)}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.02 }}
                        className={`group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-white text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141412]/30 ${on ? 'border-[#141412] ring-1 ring-[#141412]' : 'border-black/[0.08] hover:border-black/25'}`}>
                        <span className="relative flex h-[72px] w-full items-center justify-center overflow-hidden" style={{ backgroundColor: `${color}0F` }}>
                            <PatternLayer pattern={t.patterns?.[0]} color={color} opacity={0.4} scale={0.5} fade={false} />
                            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[0_6px_16px_-8px_rgba(20,20,10,0.4)] transition-transform group-hover:scale-105">
                                <Icon className="h-5 w-5" style={{ color }} />
                            </span>
                            {on && (
                                <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#141412] text-white">
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                </span>
                            )}
                        </span>
                        <span className="flex w-full flex-1 flex-col gap-1 px-3 py-2.5">
                            <span className="line-clamp-2 text-[13px] font-medium leading-snug text-[#141412]" title={t.label}>{t.label}</span>
                            {t.made_to_order && <span className="text-[11px] text-[#8B8A83]">{t.cta === 'Réserver' ? 'Sur réservation' : 'Sur commande'}</span>}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}

/** Vignettes des motifs d'une activité (et « Aucun »), dans la couleur de la boutique. */
export function PatternPicker({ patterns = [], value, color, onChange }) {
    return (
        <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(112px,1fr))]">
            {['none', ...patterns].map((key) => {
                const on = (value || 'none') === key;
                return (
                    <button key={key} type="button" onClick={() => onChange(key)} aria-pressed={on}
                        className={`overflow-hidden rounded-2xl border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141412]/30 ${on ? 'border-[#141412] ring-1 ring-[#141412]' : 'border-black/[0.08] hover:border-black/25'}`}>
                        <span className="relative block h-20 w-full overflow-hidden bg-white">
                            {key === 'none'
                                ? <span className="absolute inset-0 flex items-center justify-center text-[12px] text-[#8B8A83]">Sans motif</span>
                                : <PatternLayer pattern={key} color={color} opacity={0.55} scale={0.6} fade={false} />}
                        </span>
                        <span className="flex w-full items-center justify-between gap-2 border-t border-black/[0.06] px-3 py-2 text-[12px] text-[#141412]">
                            <span className="truncate">{patternLabel(key)}</span>
                            {on && <Check className="h-3.5 w-3.5 shrink-0" />}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

/** Activité choisie, repliée sur une ligne : la grille complète ne revient que sur « Changer ». */
export function ActivitySummary({ types = {}, value, onChange }) {
    const t = types[value];
    if (!t) return null;
    const Icon = ICONS[value] || Store;
    const color = t.style?.theme_color || '#141412';
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-[#141412] bg-white p-2.5 pr-3">
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ backgroundColor: `${color}0F` }}>
                <PatternLayer pattern={t.patterns?.[0]} color={color} opacity={0.45} scale={0.45} fade={false} />
                <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-[0_6px_16px_-8px_rgba(20,20,10,0.4)]">
                    <Icon className="h-[18px] w-[18px]" style={{ color }} />
                </span>
            </span>
            <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[15px] font-medium leading-snug text-[#141412]">{t.label}</span>
                <span className="block text-[12px] text-[#8B8A83]">{t.made_to_order ? (t.cta === 'Réserver' ? 'Sur réservation' : 'Produits sur commande') : 'Produits en stock'}</span>
            </span>
            <button type="button" onClick={onChange}
                className="shrink-0 rounded-full border border-black/10 px-3 py-1.5 text-[13px] font-medium text-[#141412] hover:border-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141412]/30">
                Changer
            </button>
        </div>
    );
}
