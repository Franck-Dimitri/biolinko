import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { EASE_OUT } from '@/Components/Motion';
import { BalanceCard, OrderFeed } from '@/Components/Landing/Illustrations';

/**
 * Habillage des pages d'authentification : formulaire à gauche, aperçu du produit à droite.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
    return (
        <>
        <Toaster position="top-center" richColors />
        <div className="grid min-h-screen bg-white font-poppins text-[#141412] antialiased lg:grid-cols-[1fr_1.05fr]">
            <div className="flex flex-col px-5 py-6 sm:px-10">
                <Link href="/" className="flex w-fit items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#FFCC00]">
                        <img src="/images/brand/logo-noir.png" alt="" className="h-12 w-12 max-w-none" />
                    </span>
                    <span className="text-[19px] font-semibold tracking-tight">Biolinko</span>
                </Link>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }}
                    className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
                    {title && <h1 className="text-[32px] font-medium leading-tight tracking-[-0.03em]">{title}</h1>}
                    {subtitle && <div className="mt-2 text-[15px] text-[#5F5E58]">{subtitle}</div>}
                    <div className="mt-8">{children}</div>
                    {footer && <div className="mt-8 border-t border-black/[0.06] pt-6 text-[14px] text-[#5F5E58]">{footer}</div>}
                </motion.div>

                <p className="text-[13px] text-[#8B8A83]">© {new Date().getFullYear()} Biolinko · <Link href={route('legal.terms')} className="hover:text-[#141412]">Conditions</Link> · <Link href={route('legal.privacy')} className="hover:text-[#141412]">Confidentialité</Link></p>
            </div>

            <div className="relative hidden overflow-hidden bg-[#0F0F0E] lg:block">
                <div aria-hidden className="absolute left-1/2 top-0 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-[#FFB800]/25 blur-[120px]" />
                <div className="relative flex h-full flex-col justify-center gap-10 px-14">
                    <div>
                        <p className="max-w-[420px] text-[34px] font-medium leading-[1.1] tracking-[-0.03em] text-white">
                            Boutique, commandes, factures et paiements, au même endroit.
                        </p>
                        <p className="mt-4 max-w-[400px] text-[16px] text-white/55">Rejoignez les vendeurs qui gèrent tout leur commerce en ligne avec Biolinko.</p>
                    </div>
                    <div className="relative max-w-[440px]">
                        <OrderFeed />
                        <BalanceCard className="mt-4" />
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export const fieldClass = 'h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-[15px] text-[#141412] placeholder:text-[#8B8A83] focus:border-black/30 focus:ring-0';
export const labelClass = 'mb-1.5 block text-[14px] font-medium text-[#141412]';
export const primaryButtonClass = 'flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#141412] text-[15px] font-medium text-white transition-colors hover:bg-[#2B2A26] disabled:opacity-60';
