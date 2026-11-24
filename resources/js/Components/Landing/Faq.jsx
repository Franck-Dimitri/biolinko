import { useState } from 'react';
import faq from '../../../data/faq.json';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Minus, Plus } from 'lucide-react';
import { EASE_OUT } from '@/Components/UI/Motion';
import { Eyebrow, RevealWords, Section, reveal } from '@/Components/Landing/Frame';

// Questions fréquentes : même source pour la page et pour les données structurées (FAQPage) côté serveur
export const FAQ = faq.map(({ q, a }) => [q, a]);

export default function Faq() {
    const [open, setOpen] = useState(0);
    return (
        <Section id="questions" className="bg-[#FBFAF6] py-24 sm:py-32" innerClassName="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
                <Eyebrow>Questions fréquentes</Eyebrow>
                <RevealWords text="Tout ce qu’il faut savoir avant de commencer" className="mt-4 text-[34px] font-medium leading-[1.08] tracking-[-0.03em] text-[#141412] sm:text-[44px]" />
                <motion.div {...reveal(0.15)} className="mt-8 rounded-2xl border border-black/[0.08] bg-white p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#141412] text-white"><Mail className="h-5 w-5" /></span>
                    <p className="mt-4 text-[16px] font-medium text-[#141412]">Une autre question ?</p>
                    <p className="mt-1 text-[14px] text-[#5F5E58]">L’équipe Biolinko vous répond par e-mail.</p>
                    <a href="mailto:contact@biolinko.app" className="mt-4 inline-flex text-[15px] font-medium text-[#141412] underline decoration-black/20 underline-offset-4 hover:decoration-black">contact@biolinko.app</a>
                </motion.div>
            </div>

            <ol className="space-y-3">
                {FAQ.map(([q, a], i) => {
                    const isOpen = open === i;
                    return (
                        <motion.li key={q} {...reveal(Math.min(i, 5) * 0.05)}
                            className={`overflow-hidden rounded-2xl border bg-white transition-colors ${isOpen ? 'border-black/20' : 'border-black/[0.08]'}`}>
                            <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}
                                className="flex w-full items-center gap-5 px-6 py-5 text-left">
                                <span className="w-6 shrink-0 text-[13px] font-medium tabular-nums text-[#8B8A83]">{String(i + 1).padStart(2, '0')}</span>
                                <span className="flex-1 text-[16px] font-medium text-[#141412]">{q}</span>
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${isOpen ? 'border-[#141412] bg-[#141412] text-white' : 'border-black/10 text-[#141412]'}`}>
                                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                </span>
                            </button>
                            <AnimatePresence initial={false}>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE_OUT }}>
                                        <p className="pb-6 pl-[68px] pr-6 text-[15px] leading-relaxed text-[#5F5E58]">{a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.li>
                    );
                })}
            </ol>
        </Section>
    );
}
