import { motion } from 'framer-motion';
import { EASE_OUT } from '@/Components/Motion';
import { OperatorLogo } from '@/Components/Landing/Illustrations';

// Le paiement est ouvert au Cameroun (HrSkillsPayService : pays CM, devise XAF).
// Les autres pays sont annoncés comme « Bientôt » : ne passer `live` à true qu'une fois la passerelle activée.
export const COUNTRIES = [
    { code: 'cm', name: 'Cameroun', currency: 'XAF', ops: ['MTN', 'ORANGE'], live: true },
    { code: 'ga', name: 'Gabon', currency: 'XAF', ops: ['AIRTEL', 'MOOV'] },
    { code: 'cg', name: 'Congo', currency: 'XAF', ops: ['MTN', 'AIRTEL'] },
    { code: 'td', name: 'Tchad', currency: 'XAF', ops: ['AIRTEL', 'MOOV'] },
    { code: 'ci', name: 'Côte d’Ivoire', currency: 'XOF', ops: ['ORANGE', 'MTN', 'MOOV', 'WAVE'] },
    { code: 'sn', name: 'Sénégal', currency: 'XOF', ops: ['ORANGE', 'WAVE'] },
    { code: 'bj', name: 'Bénin', currency: 'XOF', ops: ['MTN', 'MOOV'] },
    { code: 'tg', name: 'Togo', currency: 'XOF', ops: ['MOOV'] },
    { code: 'bf', name: 'Burkina Faso', currency: 'XOF', ops: ['ORANGE', 'MOOV'] },
    { code: 'ml', name: 'Mali', currency: 'XOF', ops: ['ORANGE', 'MOOV'] },
    { code: 'gn', name: 'Guinée', currency: 'GNF', ops: ['ORANGE', 'MTN'] },
    { code: 'cd', name: 'RD Congo', currency: 'CDF', ops: ['MPESA', 'ORANGE', 'AIRTEL'] },
];

const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.6, delay, ease: EASE_OUT },
});

export default function Countries() {
    return (
        <section id="pays" className="scroll-mt-20 bg-[#0F0F0E] py-24 text-white sm:py-32">
            <div className="mx-auto grid max-w-[1200px] items-start gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
                <div className="lg:sticky lg:top-28">
                    <motion.h2 {...reveal()} className="text-[38px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
                        Le Cameroun d’abord, l’Afrique ensuite
                    </motion.h2>
                    <motion.p {...reveal(0.08)} className="mt-5 max-w-[460px] text-[18px] leading-relaxed text-white/60">
                        Biolinko est ouvert aux vendeurs du Cameroun, avec MTN Mobile Money et Orange Money. Nous ouvrons progressivement l’Afrique centrale et de l’Ouest, avec les opérateurs de chaque pays.
                    </motion.p>
                    <motion.div {...reveal(0.14)} className="mt-8 flex flex-wrap gap-5 text-[14px] text-white/60">
                        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#22C55E]" /> Disponible</span>
                        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-white/30" /> Bientôt</span>
                    </motion.div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    {COUNTRIES.map((c, i) => (
                        <motion.div key={c.code} {...reveal(Math.min(i, 6) * 0.04)}
                            className={`flex items-center gap-4 rounded-2xl border p-4 ${c.live ? 'border-[#FFCC00]/40 bg-[#FFCC00]/[0.07]' : 'border-white/[0.07] bg-white/[0.03]'}`}>
                            <img src={`/images/flags/${c.code}.svg`} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-white/10" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[15px] font-medium">{c.name}</p>
                                <div className="mt-2.5 flex gap-1.5">
                                    {c.ops.map((op) => <OperatorLogo key={op} op={op} className="h-9 w-9" />)}
                                </div>
                            </div>
                            <div className="shrink-0 text-right">
                                <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] ${c.live ? 'bg-[#22C55E]/15 text-[#4ADE80]' : 'bg-white/[0.06] text-white/50'}`}>{c.live ? 'Disponible' : 'Bientôt'}</span>
                                <p className="mt-1.5 text-[12px] text-white/40">{c.currency}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
