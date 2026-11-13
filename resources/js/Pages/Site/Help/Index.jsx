import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CreditCard, Rocket, Search, ShoppingBag, UserCog } from 'lucide-react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Section, reveal } from '@/Components/Landing/Frame';

const ICONS = { demarrer: Rocket, vendre: ShoppingBag, argent: CreditCard, compte: UserCog };
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function HelpIndex({ categories = {}, articles = [] }) {
    const [q, setQ] = useState('');
    const found = useMemo(() => (q.trim() ? articles.filter((a) => norm(`${a.title} ${a.summary}`).includes(norm(q.trim()))) : null), [q, articles]);

    return (
        <SiteLayout title="Centre d’aide" eyebrow="Centre d’aide" heading="Comment pouvons-nous vous aider ?"
            intro="Des guides courts, pas à pas, pour créer votre boutique, vendre, encaisser et retirer votre argent.">
            <Section top={false} className="bg-white py-16 sm:py-20">
                <motion.label {...reveal()} className="flex h-14 max-w-[640px] items-center gap-3 rounded-full border border-black/10 bg-white px-5 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)] focus-within:border-black/30">
                    <Search className="h-5 w-5 text-[#8B8A83]" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher : retrait, livraison, produit…" aria-label="Rechercher dans l’aide"
                        className="h-full flex-1 border-0 bg-transparent p-0 text-[16px] text-[#141412] placeholder:text-[#B5B3AB] focus:outline-none focus:ring-0" />
                </motion.label>

                <AnimatePresence mode="wait">
                    {found ? (
                        <motion.ul key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-10 max-w-[760px] divide-y divide-black/[0.07] border-y border-black/[0.07]">
                            {found.length === 0 && <li className="py-6 text-[15px] text-[#5F5E58]">Aucun guide ne correspond. Écrivez-nous depuis la page <Link href={route('site.contact')} className="underline underline-offset-2">Contact</Link>.</li>}
                            {found.map((a) => (
                                <li key={a.slug}>
                                    <Link href={route('site.help.article', a.slug)} className="group flex items-center justify-between gap-4 py-5">
                                        <span><span className="block text-[16px] font-medium text-[#141412]">{a.title}</span><span className="text-[14px] text-[#5F5E58]">{a.summary}</span></span>
                                        <ArrowRight className="h-4 w-4 shrink-0 text-[#8B8A83] transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </li>
                            ))}
                        </motion.ul>
                    ) : (
                        <motion.div key="cats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-12 grid gap-4 md:grid-cols-2">
                            {Object.entries(categories).map(([id, label], i) => {
                                const Icon = ICONS[id] || Rocket;
                                return (
                                    <motion.section key={id} {...reveal(i * 0.06)} className="rounded-[24px] border border-black/[0.08] p-6 sm:p-7">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#141412] text-[#FFCC00]"><Icon className="h-5 w-5" /></span>
                                            <h2 className="text-[18px] font-medium">{label}</h2>
                                        </div>
                                        <ul className="mt-5 space-y-1">
                                            {articles.filter((a) => a.category === id).map((a) => (
                                                <li key={a.slug}>
                                                    <Link href={route('site.help.article', a.slug)} className="group -mx-3 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-[#F6F5F1]">
                                                        <span className="text-[15px] text-[#141412]">{a.title}</span>
                                                        <ArrowRight className="h-4 w-4 shrink-0 text-[#8B8A83] transition-transform group-hover:translate-x-1" />
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.section>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div {...reveal(0.2)} className="mt-12 flex flex-col items-start justify-between gap-4 rounded-[24px] bg-[#FBFAF6] p-7 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-[17px] font-medium">Vous ne trouvez pas votre réponse ?</p>
                        <p className="mt-1 text-[15px] text-[#5F5E58]">L’équipe Biolinko vous répond.</p>
                    </div>
                    <Link href={route('site.contact')} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#141412] px-5 text-[15px] font-medium text-white hover:bg-[#2B2A26]">Nous contacter <ArrowRight className="h-4 w-4" /></Link>
                </motion.div>
            </Section>
        </SiteLayout>
    );
}
