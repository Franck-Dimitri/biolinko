import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Section, reveal } from '@/Components/Landing/Frame';
import { ARTICLES } from '@/Components/Landing/helpArticles';

function Block({ b }) {
    if (b.h) return <h2 className="pt-4 text-[22px] font-medium tracking-[-0.02em] text-[#141412]">{b.h}</h2>;
    if (b.p) return <p className="text-[16px] leading-relaxed text-[#3D3C37]">{b.p}</p>;
    if (b.steps) {
        return (
            <ol className="space-y-3">
                {b.steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-[16px] leading-relaxed text-[#3D3C37]">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FFCC00] text-[13px] font-semibold text-[#141412]">{i + 1}</span>
                        <span>{s}</span>
                    </li>
                ))}
            </ol>
        );
    }
    if (b.list) {
        return (
            <ul className="space-y-2 pl-1">
                {b.list.map((s, i) => <li key={i} className="flex gap-3 text-[16px] leading-relaxed text-[#3D3C37]"><span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#141412]" />{s}</li>)}
            </ul>
        );
    }
    if (b.tip) {
        return (
            <p className="flex gap-3 rounded-2xl border border-[#FFCC00]/60 bg-[#FFFBEA] p-4 text-[15px] leading-relaxed text-[#3D3C37]">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[#B38600]" /> {b.tip}
            </p>
        );
    }
    return null;
}

export default function HelpArticle({ article, category, related = [] }) {
    const blocks = ARTICLES[article.slug] || [];
    return (
        <SiteLayout title={article.title} eyebrow={category} heading={article.title} intro={article.summary}>
            <Section top={false} className="bg-white py-14 sm:py-20" innerClassName="grid gap-12 lg:grid-cols-[1fr_300px] lg:gap-16">
                <motion.article {...reveal()} className="max-w-[720px] space-y-5">
                    <Link href={route('site.help')} className="inline-flex items-center gap-1.5 text-[14px] text-[#5F5E58] hover:text-[#141412]"><ArrowLeft className="h-4 w-4" /> Centre d’aide</Link>
                    {blocks.map((b, i) => <Block key={i} b={b} />)}
                    <div className="!mt-10 rounded-2xl bg-[#FBFAF6] p-5 text-[15px] text-[#5F5E58]">
                        Une question sur ce guide ? <Link href={route('site.contact')} className="font-medium text-[#141412] underline underline-offset-4">Contactez-nous</Link>.
                    </div>
                </motion.article>
                <motion.aside {...reveal(0.1)} className="lg:sticky lg:top-24 lg:self-start">
                    <p className="text-[13px] font-medium text-[#8B8A83]">À lire aussi</p>
                    <ul className="mt-3 space-y-1">
                        {related.map((a) => (
                            <li key={a.slug}>
                                <Link href={route('site.help.article', a.slug)} className="group -mx-3 flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[15px] text-[#141412] hover:bg-[#F6F5F1]">
                                    {a.title} <ArrowRight className="h-4 w-4 shrink-0 text-[#8B8A83] transition-transform group-hover:translate-x-1" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                </motion.aside>
            </Section>
        </SiteLayout>
    );
}
