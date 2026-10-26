import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { EASE_OUT } from '@/Components/Motion';

/**
 * Page d'erreur publique : même habillage que la landing.
 * `actions` = [{ label, href, primary?, onClick? }].
 */
export default function ErrorShell({ headTitle, code, Icon, badge, title, description, actions = [], children }) {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-white font-poppins text-[#141412] antialiased">
            <Head title={headTitle} />
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[#FFCC00]/15 blur-[120px]" />

            <header className="relative mx-auto flex h-16 w-full max-w-[1200px] items-center px-5 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#FFCC00]">
                        <img src="/images/brand/logo-noir.png" alt="" className="h-12 w-12 max-w-none" />
                    </span>
                    <span className="text-[19px] font-semibold tracking-tight">Biolinko</span>
                </Link>
            </header>

            <main className="relative flex flex-1 items-center justify-center px-5 py-16">
                <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE_OUT }}
                    className="w-full max-w-[560px] text-center">
                    {code && <p className="text-[96px] font-medium leading-none tracking-[-0.05em] text-[#141412]/10 sm:text-[128px]">{code}</p>}
                    {Icon && (
                        <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6F5F1] ${code ? '-mt-10 sm:-mt-14' : ''} relative`}>
                            <Icon className="h-6 w-6 text-[#141412]" />
                        </span>
                    )}
                    {badge && <p className="mt-6 text-[14px] text-[#8B8A83]">{badge}</p>}
                    <h1 className="mt-2 text-[32px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[40px]">{title}</h1>
                    <p className="mx-auto mt-4 max-w-[460px] text-[17px] leading-relaxed text-[#5F5E58]">{description}</p>
                    {actions.length > 0 && (
                        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                            {actions.map((a) => {
                                const cls = `inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-colors ${a.primary ? 'bg-[#141412] text-white hover:bg-[#2B2A26]' : 'border border-black/15 text-[#141412] hover:border-black/40'}`;
                                return a.onClick
                                    ? <button key={a.label} type="button" onClick={a.onClick} className={cls}>{a.label}</button>
                                    : <a key={a.label} href={a.href} className={cls}>{a.label}</a>;
                            })}
                        </div>
                    )}
                    {children}
                </motion.div>
            </main>

            <footer className="relative py-6 text-center text-[13px] text-[#8B8A83]">© {new Date().getFullYear()} Biolinko</footer>
        </div>
    );
}
