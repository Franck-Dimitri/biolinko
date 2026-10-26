import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/Components/Landing/Footer';
import { EASE_OUT } from '@/Components/Motion';

const PAGES = [
    ['legal.terms', 'Conditions d’utilisation'],
    ['legal.privacy', 'Confidentialité'],
    ['legal.cookies', 'Cookies'],
];

/**
 * Gabarit des pages légales : en-tête de la landing, sommaire qui suit la lecture, contenu.
 * `sections` = [{ id, title, body }].
 */
export default function LegalLayout({ title, intro, updatedAt, sections }) {
    const [active, setActive] = useState(sections[0]?.id);

    // Met en évidence la section en cours de lecture dans le sommaire
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
            { rootMargin: '-30% 0px -60% 0px' },
        );
        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [sections]);

    return (
        <MotionConfig reducedMotion="user">
            <Head title={`${title}, Biolinko`} />
            <div className="min-h-screen bg-white font-poppins text-[#141412] antialiased">
                <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/85 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#FFCC00]">
                                <img src="/images/brand/logo-noir.png" alt="" className="h-12 w-12 max-w-none" />
                            </span>
                            <span className="text-[19px] font-semibold tracking-tight">Biolinko</span>
                        </Link>
                        <nav className="hidden items-center gap-1 md:flex">
                            {PAGES.map(([name, label]) => (
                                <Link key={name} href={route(name)}
                                    className={`rounded-full px-4 py-2 text-[14px] transition-colors ${route().current(name) ? 'bg-[#F2F1EC] text-[#141412]' : 'text-[#5F5E58] hover:text-[#141412]'}`}>
                                    {label}
                                </Link>
                            ))}
                        </nav>
                        <Link href="/" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/10 px-4 text-[14px] text-[#141412] hover:border-black/30">
                            <ArrowLeft className="h-4 w-4" /> Accueil
                        </Link>
                    </div>
                </header>

                <section className="border-b border-black/[0.06] bg-[#F6F5F1]">
                    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}
                        className="mx-auto max-w-[1200px] px-5 py-14 sm:py-20 lg:px-8">
                        <p className="text-[14px] text-[#8B8A83]">Mis à jour le {updatedAt}</p>
                        <h1 className="mt-3 max-w-[720px] text-[40px] font-medium leading-[1.05] tracking-[-0.035em] sm:text-[56px]">{title}</h1>
                        <p className="mt-5 max-w-[640px] text-[18px] leading-relaxed text-[#5F5E58]">{intro}</p>
                        <div className="mt-6 flex flex-wrap gap-2 md:hidden">
                            {PAGES.map(([name, label]) => (
                                <Link key={name} href={route(name)} className={`rounded-full px-3 py-1.5 text-[13px] ${route().current(name) ? 'bg-[#141412] text-white' : 'border border-black/10 text-[#5F5E58]'}`}>{label}</Link>
                            ))}
                        </div>
                    </motion.div>
                </section>

                <main className="mx-auto grid max-w-[1200px] gap-12 px-5 py-14 lg:grid-cols-[260px_1fr] lg:px-8">
                    <aside className="hidden lg:block">
                        <nav className="sticky top-24 space-y-0.5" aria-label="Sommaire">
                            <p className="px-3 pb-2 text-[13px] text-[#8B8A83]">Sommaire</p>
                            {sections.map((s) => (
                                <a key={s.id} href={`#${s.id}`}
                                    className={`block rounded-lg px-3 py-2 text-[14px] leading-snug transition-colors ${active === s.id ? 'bg-[#F2F1EC] text-[#141412]' : 'text-[#5F5E58] hover:text-[#141412]'}`}>
                                    {s.title}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    <article className="max-w-[720px] space-y-12">
                        {sections.map((s, i) => (
                            <section key={s.id} id={s.id} className="scroll-mt-24">
                                <h2 className="text-[24px] font-medium tracking-[-0.02em]">
                                    <span className="mr-2 text-[#8B8A83]">{i + 1}.</span>{s.title}
                                </h2>
                                <div className="legal-body mt-4 space-y-4 text-[16px] leading-relaxed text-[#3D3C37] [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-[#141412] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                                    {s.body}
                                </div>
                            </section>
                        ))}
                    </article>
                </main>

                <Footer />
            </div>
        </MotionConfig>
    );
}

/** Encadré d'information dans le texte légal. */
export function Note({ children }) {
    return <div className="rounded-2xl border border-black/[0.06] bg-[#F6F5F1] p-5 text-[15px] text-[#3D3C37]">{children}</div>;
}
