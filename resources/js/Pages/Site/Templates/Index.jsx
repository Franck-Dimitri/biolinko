import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ExternalLink } from 'lucide-react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Section, reveal } from '@/Components/Landing/Frame';

/**
 * Galerie des templates : une activité à la fois, ses 3 templates en aperçu téléphone (la vraie vitrine,
 * avec un contenu d'exemple), puis l'exemple en grand.
 */
const PHONE_W = 390;
const PHONE_H = 780;
const SCALE = 0.7;

function Phone({ id, name }) {
    return (
        <div className="relative mx-auto overflow-hidden rounded-[32px] border-[6px] border-[#141412] bg-[#141412] shadow-[0_30px_60px_-30px_rgba(20,20,10,0.5)]"
            style={{ width: PHONE_W * SCALE + 12, height: PHONE_H * SCALE + 12 }}>
            <iframe src={`${route('site.templates.show', id)}?apercu=1`} title={`Aperçu du template ${name}`} loading="lazy" tabIndex={-1} aria-hidden
                className="pointer-events-none origin-top-left rounded-[26px] bg-white" style={{ width: PHONE_W, height: PHONE_H, transform: `scale(${SCALE})` }} />
        </div>
    );
}

export default function Index({ activities = [], credits = [] }) {
    const { auth } = usePage().props;
    const initial = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('activite') : null;
    const [active, setActive] = useState(activities.some((a) => a.key === initial) ? initial : activities[0]?.key);
    const [showCredits, setShowCredits] = useState(false);
    const activity = activities.find((a) => a.key === active);

    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('activite', active);
        window.history.replaceState(window.history.state, '', url);
    }, [active]);

    return (
        <SiteLayout title="Templates de boutique" eyebrow="Templates" wide heading="Une boutique à l’image de votre métier"
            intro="3 templates par activité, avec les sections qui comptent pour votre métier : configurateur de gâteau, carte de restaurant, réservation de prestations… Gratuits pour tous les plans, modifiables à tout moment sans perdre vos produits.">
            <Section top={false} className="bg-white py-14 sm:py-20">
                <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Activités">
                    {activities.map((a) => (
                        <button key={a.key} type="button" role="tab" aria-selected={a.key === active} onClick={() => setActive(a.key)}
                            className={`h-10 shrink-0 rounded-full px-4 text-[14px] transition-colors ${a.key === active ? 'bg-[#141412] text-white' : 'border border-black/10 text-[#141412] hover:border-black/30'}`}>
                            {a.label}
                        </button>
                    ))}
                </div>

                {activity && (
                    <div key={activity.key} className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3" role="tabpanel">
                        {activity.templates.map((t, i) => (
                            <motion.article key={t.id} {...reveal(i * 0.06)} className="flex flex-col items-center text-center">
                                <Link href={route('site.templates.show', t.id)} aria-label={`Voir le template ${t.name} en grand`} className="block transition-transform hover:-translate-y-1">
                                    <Phone id={t.id} name={t.name} />
                                </Link>
                                <h2 className="mt-6 flex items-center gap-2 text-[22px] font-medium tracking-[-0.02em]">
                                    <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: t.primary }} aria-hidden /> {t.name}
                                </h2>
                                <p className="mt-2 max-w-[340px] text-[15px] leading-relaxed text-[#5F5E58]">{t.pitch}</p>
                                <p className="mt-2 max-w-[340px] text-[13px] text-[#8B8A83]">Pour : {t.who}</p>
                                <div className="mt-5 flex flex-wrap justify-center gap-2">
                                    <Link href={route('site.templates.show', t.id)} className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/15 px-4 text-[14px] font-medium hover:border-black/40">
                                        Voir l’exemple <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    {!auth?.user && (
                                        <a href={`${route('register')}?template=${t.id}`} className="inline-flex h-10 items-center rounded-full bg-[#FFCC00] px-4 text-[14px] font-medium hover:bg-[#E6B800]">
                                            Choisir ce template
                                        </a>
                                    )}
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}

                <div className="mt-20 border-t border-black/[0.06] pt-6 text-[13px] text-[#8B8A83]">
                    <button type="button" onClick={() => setShowCredits((v) => !v)} aria-expanded={showCredits} className="inline-flex items-center gap-1.5 hover:text-[#141412]">
                        Crédits des photos d’exemple <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showCredits ? 'rotate-180' : ''}`} />
                    </button>
                    {showCredits && (
                        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                            {credits.map((c) => (
                                <li key={c.file}>
                                    « {c.title} », {c.creator} · {c.license} · <a href={c.source} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-[#141412]">source <ExternalLink className="h-3 w-3" /></a>
                                </li>
                            ))}
                            <li>Photos de mode et de produits : voir les crédits du pied de page.</li>
                        </ul>
                    )}
                </div>
            </Section>
        </SiteLayout>
    );
}
