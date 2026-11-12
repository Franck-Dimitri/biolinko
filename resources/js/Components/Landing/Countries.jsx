import { useState } from 'react';
import { motion } from 'framer-motion';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import { Eyebrow, RevealWords, Section, reveal } from '@/Components/Landing/Frame';
import AfricaMap from '@/Components/Landing/AfricaMap';

// Le paiement est ouvert au Cameroun uniquement. Les autres pays sont annoncés « Bientôt » :
// ne passer `live` à true qu'une fois l'agrégateur activé pour le pays.
export const COUNTRIES = [
    { code: 'cm', name: 'Cameroun', currency: 'XAF', region: 'centre', ops: ['MTN', 'ORANGE'], live: true },
    { code: 'ga', name: 'Gabon', currency: 'XAF', region: 'centre', ops: ['AIRTEL', 'MOOV'] },
    { code: 'cg', name: 'Congo', currency: 'XAF', region: 'centre', ops: ['MTN', 'AIRTEL'] },
    { code: 'td', name: 'Tchad', currency: 'XAF', region: 'centre', ops: ['AIRTEL', 'MOOV'] },
    { code: 'cd', name: 'RD Congo', currency: 'CDF', region: 'centre', ops: ['MPESA', 'ORANGE', 'AIRTEL'] },
    { code: 'ci', name: 'Côte d’Ivoire', currency: 'XOF', region: 'ouest', ops: ['ORANGE', 'MTN', 'MOOV', 'WAVE'] },
    { code: 'sn', name: 'Sénégal', currency: 'XOF', region: 'ouest', ops: ['ORANGE', 'WAVE'] },
    { code: 'bj', name: 'Bénin', currency: 'XOF', region: 'ouest', ops: ['MTN', 'MOOV'] },
    { code: 'tg', name: 'Togo', currency: 'XOF', region: 'ouest', ops: ['MOOV'] },
    { code: 'bf', name: 'Burkina Faso', currency: 'XOF', region: 'ouest', ops: ['ORANGE', 'MOOV'] },
    { code: 'ml', name: 'Mali', currency: 'XOF', region: 'ouest', ops: ['ORANGE', 'MOOV'] },
    { code: 'gn', name: 'Guinée', currency: 'GNF', region: 'ouest', ops: ['ORANGE', 'MTN'] },
];

export const OPERATOR_NAMES = { MTN: 'MTN Mobile Money', ORANGE: 'Orange Money', AIRTEL: 'Airtel Money', MOOV: 'Moov Money', WAVE: 'Wave', MPESA: 'M-Pesa' };

const GROUPS = [
    ['Disponible', COUNTRIES.filter((c) => c.live)],
    ['Bientôt · Afrique centrale', COUNTRIES.filter((c) => !c.live && c.region === 'centre')],
    ['Bientôt · Afrique de l’Ouest', COUNTRIES.filter((c) => !c.live && c.region === 'ouest')],
];

/** Pays à venir : carte compacte, deux par ligne. */
function Tile({ c, active, onHover }) {
    const on = active === c.code;
    return (
        <li>
            <button type="button" onMouseEnter={() => onHover(c.code)} onFocus={() => onHover(c.code)} onClick={() => onHover(c.code)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${on ? 'border-white/60 bg-white/[0.08]' : 'border-white/[0.08] bg-white/[0.03] hover:border-white/25'}`}>
                <img src={`/images/flags/${c.code}.svg`} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/10" />
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-white">{c.name}</span>
                    <span className="block text-[11px] tabular-nums text-white/40">{c.currency}</span>
                </span>
                <span className="flex -space-x-1">{c.ops.map((op) => <span key={op} title={OPERATOR_NAMES[op]} className="rounded-md ring-2 ring-[#1A1A18]"><OperatorLogo op={op} className="h-6 w-6" /></span>)}</span>
            </button>
        </li>
    );
}

function Row({ c, active, onHover }) {
    const on = active === c.code;
    return (
        <li>
            <button type="button" onMouseEnter={() => onHover(c.code)} onFocus={() => onHover(c.code)} onClick={() => onHover(c.code)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${on ? 'bg-[#FFCC00]/[0.08]' : 'hover:bg-white/[0.03]'}`}>
                <img src={`/images/flags/${c.code}.svg`} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-white/10" />
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-white">{c.name}</span>
                    <span className="block truncate text-[12px] text-white/50">{c.ops.map((op) => OPERATOR_NAMES[op]).join(' · ')}</span>
                </span>
                <span className="hidden gap-1 sm:flex">{c.ops.map((op) => <OperatorLogo key={op} op={op} className="h-6 w-6" />)}</span>
                <span className="w-10 shrink-0 text-right text-[12px] tabular-nums text-white/40">{c.currency}</span>
            </button>
        </li>
    );
}

function MapPanel({ active, onHover }) {
    return (
        <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-4 sm:p-8">
            <AfricaMap dark countries={COUNTRIES} active={active} onHover={onHover} className="mx-auto w-full max-w-[560px]" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4 text-[13px] text-white/60">
                <span className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#FFCC00] " /> Disponible</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#77766F]" /> Bientôt</span>
                </span>
                <span className="text-[12px] text-white/35">Carte indicative</span>
            </div>
        </div>
    );
}

export default function Countries() {
    const [active, setActive] = useState('cm');

    return (
        <Section id="pays" dark className="bg-[#0F0F0E] py-24 text-white sm:py-32">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
                <div className="min-w-0">
                    <Eyebrow dark>Pays</Eyebrow>
                    <RevealWords text="Le Cameroun d’abord, l’Afrique ensuite" className="mt-4 text-[36px] font-medium leading-[1.05] tracking-[-0.03em] text-white sm:text-[52px]" />
                    <motion.p {...reveal(0.15)} className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-white/60">
                        Biolinko est ouvert aux vendeurs du Cameroun. Douze pays sont prévus en Afrique centrale et de l’Ouest, chacun avec ses opérateurs Mobile Money.
                    </motion.p>

                    {/* Mobile : la carte entre le texte et la liste */}
                    <motion.div {...reveal(0.15)} className="mt-8 lg:hidden"><MapPanel active={active} onHover={setActive} /></motion.div>

                    <motion.div {...reveal(0.2)} className="mt-10 space-y-6">
                        {GROUPS.map(([label, list]) => (
                            <div key={label}>
                                <p className="mb-2 flex items-center gap-2 text-[13px] font-medium text-white/60">
                                    <span className={`h-2 w-2 rounded-full ${label === 'Disponible' ? 'bg-[#4ADE80]' : 'bg-white/30'}`} /> {label}
                                </p>
                                {label === 'Disponible' ? (
                                    <ul className="overflow-hidden rounded-2xl border border-[#FFCC00]/40">
                                        {list.map((c) => <Row key={c.code} c={c} active={active} onHover={setActive} />)}
                                    </ul>
                                ) : (
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                        {list.map((c) => <Tile key={c.code} c={c} active={active} onHover={setActive} />)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </motion.div>
                </div>

                <motion.div {...reveal(0.1)} className="hidden min-w-0 lg:sticky lg:top-24 lg:block lg:self-start">
                    <MapPanel active={active} onHover={setActive} />
                </motion.div>
            </div>
        </Section>
    );
}
