import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Check, Link2, MessageCircle, ShoppingBag, Smartphone, Wallet } from 'lucide-react';
import { EASE_OUT } from '@/Components/UI/Motion';
import { WhatsappIcon } from '@/Components/UI/BrandIcons';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import { WRAP } from '@/Components/Landing/Frame';
import ShopClaim from '@/Components/Landing/ShopClaim';

const STEP_MS = 2600;

/* Les 4 écrans d'une vente, du message WhatsApp à l'argent sur le portefeuille */

function Chat() {
    return (
        <div className="space-y-2 text-[13px]">
            <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[#141412] shadow-sm">Bonsoir, c’est combien la robe pagne ?</div>
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#D9FDD3] px-3 py-2 text-[#141412] shadow-sm">
                18 500 FCFA. Commandez ici 👇
                <span className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-white/70 px-2 py-1 text-[12px] text-[#0B6B3A]"><Link2 className="h-3 w-3" /> biolinko.link/chez-awa</span>
            </div>
        </div>
    );
}

function ProductCard() {
    return (
        <div className="flex gap-3">
            <img src="/images/landing/wall/robe-pagne.webp" alt="" className="h-24 w-20 rounded-xl object-cover" />
            <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                    <p className="text-[14px] font-medium text-[#141412]">Robe pagne</p>
                    <p className="text-[12px] text-[#5F5E58]">Taille M · En stock</p>
                </div>
                <p className="text-[15px] font-semibold text-[#141412]">18 500 FCFA</p>
                <span className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#FFCC00] text-[12px] font-medium text-[#141412]"><ShoppingBag className="h-3.5 w-3.5" /> Acheter</span>
            </div>
        </div>
    );
}

function MomoPrompt() {
    return (
        <div className="rounded-2xl bg-[#141412] p-4 text-white">
            <div className="flex items-center gap-2.5">
                <OperatorLogo op="MTN" className="h-8 w-8" />
                <p className="text-[13px] text-white/70">MTN Mobile Money</p>
            </div>
            <p className="mt-3 text-[13px] text-white/60">Confirmez le paiement de</p>
            <p className="text-[22px] font-semibold tabular-nums">19 148 FCFA</p>
            <div className="mt-3 flex gap-1.5">{[0, 1, 2, 3, 4].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-white/70" />)}</div>
        </div>
    );
}

function Received() {
    return (
        <div>
            <div className="flex items-center gap-3 rounded-2xl bg-[#E8F7EE] p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16A34A] text-white"><Check className="h-4 w-4" strokeWidth={3} /></span>
                <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#141412]">Paiement reçu</p>
                    <p className="text-[12px] text-[#5F5E58]">Robe pagne · Douala</p>
                </div>
                <p className="text-[14px] font-semibold tabular-nums text-[#16A34A]">+17 205</p>
            </div>
            <p className="mt-3 text-[12px] text-[#5F5E58]">Solde Biolinko</p>
            <p className="text-[22px] font-semibold tabular-nums text-[#141412]">245 700 FCFA</p>
        </div>
    );
}

const STEPS = [
    { Icon: MessageCircle, title: 'Le client écrit', text: 'Sur WhatsApp, Instagram ou TikTok', screen: <Chat />, tint: '#ECE5DD' },
    { Icon: Link2, title: 'Il ouvre votre lien', text: 'Votre boutique, vos prix, votre stock', screen: <ProductCard />, tint: '#FFFFFF' },
    { Icon: Smartphone, title: 'Il paie en Mobile Money', text: 'Validé sur son téléphone', screen: <MomoPrompt />, tint: '#FFFFFF' },
    { Icon: Wallet, title: 'Vous êtes payé', text: 'Retrait gratuit quand vous voulez', screen: <Received />, tint: '#FFFFFF' },
];

/**
 * Variante B du hero : fond clair, titre centré, et le récit animé d'une vente en 4 étapes.
 */
export default function HeroStory() {
    const [step, setStep] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref);
    const reduce = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
    const titleY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
    const titleOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    useEffect(() => {
        if (!inView) return undefined;
        const t = setTimeout(() => setStep((v) => (v + 1) % STEPS.length), STEP_MS);
        return () => clearTimeout(t);
    }, [step, inView]);

    const line = 'Vendez en ligne. Encaissez en Mobile Money.'.split(' ');

    return (
        <section ref={ref} className="relative overflow-hidden bg-[#FBFAF6] pb-20 pt-32 sm:pb-24 sm:pt-40">
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[1320px] -translate-x-1/2 border-x border-black/[0.07] md:block" />

            <div className={WRAP}>
                <motion.div style={{ y: titleY, opacity: titleOpacity }} className="mx-auto max-w-[1100px] text-center">
                    <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[13px] text-[#5F5E58]">
                        <WhatsappIcon className="h-4 w-4 text-[#25D366]" /> Pour les vendeurs WhatsApp, Instagram et TikTok du Cameroun
                    </motion.span>
                    <h1 className="mt-7 text-[44px] font-semibold leading-[1.02] tracking-[-0.035em] text-[#141412] sm:text-[60px] lg:text-[76px]" aria-label="Vendez en ligne. Encaissez en Mobile Money.">
                        {line.map((w, i) => (
                            <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                                <motion.span className="relative inline-block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.2 + i * 0.07, ease: EASE_OUT }}>
                                    {i >= 5 && (
                                        <motion.span aria-hidden className="absolute inset-x-[-0.05em] bottom-[0.12em] -z-10 h-[0.32em] origin-left rounded-sm bg-[#FFCC00]"
                                            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 1 + (i - 5) * 0.12, ease: EASE_OUT }} />
                                    )}
                                    {w}{i < line.length - 1 ? ' ' : ''}
                                </motion.span>
                            </span>
                        )).flatMap((el, i) => (i === 2 ? [el, <br key="br" />] : [el]))}
                    </h1>
                    <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.75, ease: EASE_OUT }}
                        className="mx-auto mt-6 max-w-[600px] text-[18px] leading-relaxed text-[#5F5E58]">
                        Boutique, catalogue, commandes, livraison, factures et marketing : tout votre commerce dans une seule application, payé en MTN MoMo et Orange Money.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9, ease: EASE_OUT }} className="mx-auto mt-9 max-w-[580px] text-left">
                        <ShopClaim />
                    </motion.div>
                </motion.div>

                {/* Le récit d'une vente */}
                <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.05, ease: EASE_OUT }} className="relative mt-16">
                    <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-[26px] hidden h-px bg-black/10 lg:block">
                        <motion.div className="h-full origin-left bg-[#141412]" animate={{ scaleX: step / (STEPS.length - 1) }} transition={{ duration: 0.6, ease: EASE_OUT }} />
                    </div>
                    <ol className="grid grid-cols-4 gap-2 lg:gap-4">
                        {STEPS.map((s, i) => {
                            const on = i === step;
                            const done = i < step;
                            return (
                                <li key={s.title}>
                                    <button type="button" onClick={() => setStep(i)} className="group w-full text-left" aria-current={on ? 'step' : undefined}>
                                        <div className="flex flex-col items-center text-center">
                                            <motion.span animate={{ scale: on ? 1.1 : 1, backgroundColor: on ? '#FFCC00' : done ? '#141412' : '#FFFFFF', color: done && !on ? '#FFCC00' : '#141412' }}
                                                transition={{ duration: 0.3 }} className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-black/10 shadow-sm lg:h-[52px] lg:w-[52px]">
                                                {done && !on ? <Check className="h-5 w-5" strokeWidth={3} /> : <s.Icon className="h-5 w-5" />}
                                            </motion.span>
                                            <p className="mt-3 text-[12px] font-medium leading-tight text-[#141412] lg:text-[15px]">{s.title}</p>
                                            <p className="hidden text-[13px] text-[#8B8A83] lg:block">{s.text}</p>
                                        </div>
                                        <motion.div animate={{ y: on ? -6 : 0, opacity: on ? 1 : 0.55 }} transition={{ duration: 0.35, ease: EASE_OUT }}
                                            className={`mt-5 hidden min-h-[168px] rounded-3xl border p-4 transition-shadow lg:block ${on ? 'border-[#FFCC00] shadow-[0_24px_48px_-24px_rgba(20,20,18,0.35)]' : 'border-black/[0.07]'}`}
                                            style={{ backgroundColor: s.tint }}>
                                            <AnimatePresence mode="wait">
                                                <motion.div key={on ? 'on' : 'off'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                                    {s.screen}
                                                </motion.div>
                                            </AnimatePresence>
                                        </motion.div>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                    {/* Mobile : seul l'écran de l'étape en cours */}
                    <div className="mx-auto mt-6 max-w-[380px] lg:hidden">
                        <AnimatePresence mode="wait">
                            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: EASE_OUT }}
                                className="min-h-[168px] rounded-3xl border border-[#FFCC00] p-4 shadow-[0_24px_48px_-24px_rgba(20,20,18,0.35)]" style={{ backgroundColor: STEPS[step].tint }}>
                                {STEPS[step].screen}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
