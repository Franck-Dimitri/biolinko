import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Clock, FileText, MapPin, Package, Search, ShieldCheck, Star, Tag, Truck } from 'lucide-react';
import { EASE_OUT } from '@/Components/Motion';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/BrandIcons';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import ProductCard, { ProductImage, productImage } from '@/Components/Storefront/ProductCard';
import { formatFcfa } from '@/Components/Storefront/useCart';

/* Sections de la vitrine publique : une vraie page d'accueil de marque pour chaque vendeur. */

export const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.6, delay, ease: EASE_OUT },
});

export const whatsappUrl = (store, text) => {
    const n = store?.phone_whatsapp?.replace(/[^0-9]/g, '');
    if (!n || n.length < 8) return null;
    return `https://wa.me/${n}?text=${encodeURIComponent(text || `Bonjour ${store.name}, je vous contacte depuis votre boutique en ligne.`)}`;
};

const price = (p) => {
    const promo = p.is_promo && Number(p.promo_price) > 0 && Number(p.promo_price) < Number(p.price_vendor);
    return Math.ceil(promo ? p.promo_price : p.price_vendor);
};

export function Container({ children, className = '' }) {
    return <div className={`mx-auto w-full max-w-[1200px] px-5 lg:px-8 ${className}`}>{children}</div>;
}

export function SectionTitle({ title, sub, action, dark = false, center = false }) {
    return (
        <div className={`flex flex-wrap items-end justify-between gap-6 ${center ? 'justify-center text-center' : ''}`}>
            <div className={center ? 'mx-auto' : ''}>
                <motion.h2 {...reveal()} className={`text-[26px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[44px] ${dark ? 'text-white' : 'text-[#141412]'}`}>{title}</motion.h2>
                {sub && <motion.p {...reveal(0.08)} className={`mt-2 max-w-[540px] text-[15px] sm:mt-3 sm:text-[17px] ${center ? 'mx-auto' : ''} ${dark ? 'text-white/60' : 'text-[#5F5E58]'}`}>{sub}</motion.p>}
            </div>
            {action}
        </div>
    );
}

function Pill({ href, onClick, children, theme, variant = 'primary', className = '', ...rest }) {
    const Tag = href ? 'a' : 'button';
    const base = 'group inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium transition-all hover:-translate-y-0.5 sm:h-12 sm:px-6 sm:text-[15px]';
    const style = variant === 'primary' ? { backgroundColor: theme.color, color: theme.text, boxShadow: `0 10px 24px -12px ${theme.color}` } : undefined;
    const cls = variant === 'primary' ? '' : variant === 'dark' ? 'border border-white/20 text-white hover:border-white/50' : 'border border-black/15 text-[#141412] hover:border-black/40';
    return (
        <Tag href={href} onClick={onClick} type={href ? undefined : 'button'} className={`${base} ${cls} ${className}`} style={style} {...rest}>
            {children}
        </Tag>
    );
}

/* ------------------------------------------------------------------ Hero */

export function StoreHero({ store, products, theme, onShop }) {
    const reduce = useReducedMotion();
    const featured = products.filter((p) => productImage(p)).slice(0, 5);
    const [i, setI] = useState(0);
    useEffect(() => {
        if (reduce || featured.length < 2) return;
        const t = setInterval(() => setI((v) => (v + 1) % featured.length), 3800);
        return () => clearInterval(t);
    }, [featured.length, reduce]);
    const current = featured[i];
    const cover = store.banner_url || productImage(current);
    const wa = whatsappUrl(store);
    const tagline = [store.category, store.city_location].filter(Boolean).join(' · ');

    return (
        <section id="hero" className="relative overflow-hidden">
            <div aria-hidden className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full opacity-25 blur-[120px]" style={{ backgroundColor: theme.color }} />
            <Container className="relative grid items-center gap-8 py-8 sm:gap-12 sm:py-20 lg:grid-cols-[1.05fr_1fr]">
                <div className="min-w-0">
                    {tagline && (
                        <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            className="inline-flex max-w-full items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[13px] text-[#5F5E58]">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: theme.color }} />
                            <span className="truncate">{store.hero_badge_text || tagline}</span>
                        </motion.span>
                    )}
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05, ease: EASE_OUT }}
                        className="mt-4 break-words text-[32px] font-medium leading-[1.05] tracking-[-0.035em] text-[#141412] sm:mt-6 sm:text-[60px]">
                        {store.hero_title || store.name}
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT }}
                        className="mt-3 max-w-[520px] break-words text-[16px] leading-relaxed text-[#5F5E58] sm:mt-5 sm:text-[18px]">
                        {store.hero_subtitle || store.description || 'Commandez en ligne, payez par Mobile Money et recevez votre commande chez vous.'}
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25, ease: EASE_OUT }}
                        className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
                        <Pill onClick={onShop} theme={theme}>{store.hero_cta_text || 'Voir les produits'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></Pill>
                        {wa && <Pill href={wa} target="_blank" rel="noreferrer" theme={theme} variant="outline"><WhatsappIcon className="h-4 w-4 text-[#16A34A]" /> Commander sur WhatsApp</Pill>}
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                        className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-[#5F5E58] sm:mt-9 sm:text-[14px]">
                        <span className="flex items-center gap-2">
                            <span className="flex -space-x-1"><OperatorLogo op="MTN" className="h-6 w-6 ring-2 ring-white" /><OperatorLogo op="ORANGE" className="h-6 w-6 ring-2 ring-white" /></span>
                            Paiement Mobile Money
                        </span>
                        <span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Livraison à domicile</span>
                        <span className="flex items-center gap-2"><FileText className="h-4 w-4" /> Reçu par WhatsApp</span>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT }}
                    className="relative mx-auto w-full max-w-[520px]">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#F6F5F1] shadow-[0_40px_80px_-40px_rgba(20,20,10,0.45)] sm:aspect-[5/5.4] sm:rounded-[28px]">
                        <AnimatePresence mode="sync">
                            <motion.div key={store.banner_url ? 'banner' : current?.id || 'empty'} className="absolute inset-0"
                                initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
                                <ProductImage src={cover} alt={store.banner_url ? store.name : current?.title || store.name} className="h-full w-full" />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Produit mis en avant (les vrais produits de la boutique défilent) */}
                    {current && (
                        <div className="absolute -bottom-6 left-3 right-3 sm:-left-8 sm:right-auto sm:w-[300px]">
                            <AnimatePresence mode="wait">
                                <motion.a key={current.id} href={`/${store.slug}/p/${current.slug}`}
                                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.45, ease: EASE_OUT }}
                                    className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white/95 p-3 shadow-[0_20px_40px_-20px_rgba(20,20,10,0.45)] backdrop-blur">
                                    <ProductImage src={productImage(current)} alt="" className="h-14 w-14 shrink-0 rounded-xl" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-[14px] font-medium text-[#141412]">{current.title}</span>
                                        <span className="block text-[14px] tabular-nums text-[#5F5E58]">{formatFcfa(price(current))}</span>
                                    </span>
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: theme.color, color: theme.text }}><ArrowRight className="h-4 w-4" /></span>
                                </motion.a>
                            </AnimatePresence>
                        </div>
                    )}

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
                        className="absolute -right-3 top-6 hidden items-center gap-2 rounded-full border border-black/[0.06] bg-white/95 py-2 pl-2 pr-4 text-[13px] text-[#141412] shadow-lg backdrop-blur sm:flex">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#DCFCE7]"><ShieldCheck className="h-4 w-4 text-[#16A34A]" /></span>
                        Paiement sécurisé
                    </motion.div>
                </motion.div>
            </Container>
        </section>
    );
}

/* ------------------------------------------------------------------ Catalogue */

export function ProductsSection({ products, total, categories, selectedCategory, onCategory, search, onSearch, cardProps, onSeeAll, limit = 8 }) {
    const shown = limit ? products.slice(0, limit) : products;
    return (
        <section id="catalog-grid" className="scroll-mt-24 py-10 sm:py-24">
            <Container>
                <SectionTitle title="Nos produits" sub={`${total} article${total > 1 ? 's' : ''} disponible${total > 1 ? 's' : ''}, payables par Mobile Money.`}
                    action={
                        <label className="relative w-full sm:w-72">
                            <span className="sr-only">Rechercher un produit</span>
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8A83]" />
                            <input type="search" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Rechercher un produit"
                                className="h-11 w-full rounded-full border-black/10 bg-[#F6F5F1] pl-10 pr-4 text-[15px] text-[#141412] focus:border-black/25 focus:ring-0" />
                        </label>
                    } />

                {categories.length > 0 && (
                    <div className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
                        {[{ id: 'all', label: 'Tout' }, ...categories].map((c) => {
                            const on = selectedCategory === c.id;
                            return (
                                <button key={c.id} type="button" onClick={() => onCategory(c.id)} aria-pressed={on}
                                    className={`relative h-10 shrink-0 rounded-full px-4 text-[14px] transition-colors ${on ? 'text-white' : 'border border-black/10 text-[#141412] hover:border-black/30'}`}>
                                    {on && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-[#141412]" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                                    <span className="relative">{c.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {shown.length > 0 ? (
                    <motion.div layout className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
                        <AnimatePresence>
                            {shown.map((p) => <ProductCard key={p.id} product={p} isWished={cardProps.wishlist.includes(p.id)} {...cardProps} />)}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="mt-10 rounded-3xl bg-[#F6F5F1] p-12 text-center text-[#5F5E58]">
                        <Package className="mx-auto mb-3 h-8 w-8 text-[#8B8A83]" />
                        Aucun produit ne correspond à votre recherche.
                    </div>
                )}

                {limit && products.length > limit && (
                    <div className="mt-12 flex justify-center">
                        <button type="button" onClick={onSeeAll} className="inline-flex h-12 items-center gap-2 rounded-full border border-black/15 px-6 text-[15px] font-medium text-[#141412] hover:border-black/40">
                            Voir les {products.length} produits <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </Container>
        </section>
    );
}

/* ------------------------------------------------------------------ Promotions */

function Countdown({ endsAt }) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);
    const left = Math.max(0, endsAt - now);
    const parts = [[Math.floor(left / 86400000), 'jours'], [Math.floor((left % 86400000) / 3600000), 'heures'], [Math.floor((left % 3600000) / 60000), 'min'], [Math.floor((left % 60000) / 1000), 'sec']];
    return (
        <div className="flex gap-2" aria-label="Temps restant avant la fin des promotions">
            {parts.map(([v, u]) => (
                <span key={u} className="min-w-[64px] rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                    <span className="block text-[24px] font-medium tabular-nums text-white">{String(v).padStart(2, '0')}</span>
                    <span className="text-[11px] text-white/50">{u}</span>
                </span>
            ))}
        </div>
    );
}

export function PromotionsSection({ products, endsAt, theme, cardProps }) {
    if (!products.length) return null;
    return (
        <section id="promotions" className="scroll-mt-24 py-6">
            <Container>
                <motion.div {...reveal()} className="relative overflow-hidden rounded-[32px] bg-[#0F0F0E] px-5 py-14 sm:px-12 sm:py-16">
                    <div aria-hidden className="absolute -top-32 left-1/2 h-[380px] w-[760px] -translate-x-1/2 rounded-full opacity-30 blur-[110px]" style={{ backgroundColor: theme.color }} />
                    <div className="relative flex flex-wrap items-end justify-between gap-8">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[13px] text-white/70"><Tag className="h-3.5 w-3.5" /> Offres limitées</span>
                            <h2 className="mt-4 text-[32px] font-medium leading-[1.08] tracking-[-0.03em] text-white sm:text-[44px]">Promotions en cours</h2>
                        </div>
                        {endsAt && <Countdown endsAt={endsAt} />}
                    </div>
                    <div className="relative -mx-5 mt-10 flex snap-x gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                        {products.slice(0, 8).map((p) => (
                            <div key={p.id} className="w-[64%] shrink-0 snap-start rounded-3xl bg-white p-3 sm:w-auto">
                                <ProductCard product={p} isWished={cardProps.wishlist.includes(p.id)} {...cardProps} />
                            </div>
                        ))}
                    </div>
                </motion.div>
            </Container>
        </section>
    );
}

/* ------------------------------------------------------------------ Packs */

export function PacksSection({ packs, theme }) {
    if (!packs.length) return null;
    return (
        <section id="smartlinks" className="scroll-mt-24 py-10 sm:py-24">
            <Container>
                <SectionTitle title="Packs" sub="Plusieurs produits, une seule commande, un prix réduit." />
                <div className="mt-10 grid gap-4 md:grid-cols-2">
                    {packs.map((sl, i) => {
                        const saving = Math.max(0, Number(sl.subtotal_amount || 0) - Number(sl.total_amount || 0));
                        return (
                            <motion.a key={sl.id} href={route('smartlink.show', sl.code)} {...reveal(i * 0.06)} whileHover={{ y: -4 }}
                                className="group flex min-w-0 items-center gap-5 rounded-3xl border border-black/[0.06] bg-[#F6F5F1] p-5">
                                <div className="flex shrink-0 -space-x-6">
                                    {(sl.items || []).slice(0, 3).map((it, k) => (
                                        <ProductImage key={k} src={it.image_url} alt="" className="h-20 w-20 rounded-2xl border-4 border-[#F6F5F1]" />
                                    ))}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="line-clamp-2 text-[17px] font-medium text-[#141412]">{sl.title}</h3>
                                    <p className="mt-1 flex flex-wrap items-baseline gap-2 text-[15px]">
                                        <span className="font-semibold tabular-nums text-[#141412]">{formatFcfa(sl.total_amount)}</span>
                                        {saving > 0 && <span className="rounded-full px-2 py-0.5 text-[12px] font-medium" style={{ backgroundColor: `${theme.color}26`, color: '#141412' }}>−{formatFcfa(saving)}</span>}
                                    </p>
                                </div>
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:translate-x-1" style={{ backgroundColor: theme.color, color: theme.text }}><ArrowRight className="h-4 w-4" /></span>
                            </motion.a>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}

/* ------------------------------------------------------------------ Avantages */

const BENEFIT_ICONS = [Truck, ShieldCheck, FileText, BadgeCheck];

export function BenefitsSection({ store, benefits, theme }) {
    return (
        <section id="benefits" className="py-10 sm:py-24">
            <Container>
                <SectionTitle title={`Pourquoi commander chez ${store.name}`} />
                <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
                    {benefits.map((b, i) => {
                        const Icon = BENEFIT_ICONS[i % BENEFIT_ICONS.length];
                        return (
                            <motion.div key={i} {...reveal(i * 0.06)} className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-[#F6F5F1] p-4 sm:min-h-[200px] sm:rounded-3xl sm:p-6">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl" style={{ backgroundColor: `${theme.color}2E` }}>
                                    <Icon className="h-5 w-5 text-[#141412]" />
                                </span>
                                <div className="mt-4 sm:mt-8">
                                    <h3 className="text-[15px] font-medium leading-snug text-[#141412] sm:text-[17px]">{b.title}</h3>
                                    <p className="mt-1 line-clamp-3 text-[13px] text-[#5F5E58] sm:text-[14px]">{b.subtitle}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </Container>
        </section>
    );
}

/* ------------------------------------------------------------------ Avis */

export function ReviewsSection({ reviews, onReview }) {
    const avg = reviews.length ? reviews.reduce((a, r) => a + (Number(r.rating) || 5), 0) / reviews.length : 0;
    return (
        <section id="reviews" className="scroll-mt-24 border-t border-black/[0.06] py-10 sm:py-24">
            <Container>
                <SectionTitle
                    title="Avis clients"
                    sub={reviews.length ? `${avg.toFixed(1).replace('.', ',')} sur 5, d’après ${reviews.length} avis.` : 'Vous avez commandé ici ? Partagez votre expérience.'}
                    action={
                        <button type="button" onClick={onReview} className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-5 text-[15px] font-medium text-[#141412] hover:border-black/40">
                            <Star className="h-4 w-4" /> Donner mon avis
                        </button>
                    } />
                {reviews.length > 0 && (
                    <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
                        {reviews.slice(0, 9).map((r, i) => (
                            <motion.figure key={r.id || i} {...reveal((i % 3) * 0.06)} className="mb-4 break-inside-avoid rounded-3xl border border-black/[0.06] bg-white p-6">
                                <div className="flex gap-0.5">
                                    {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`h-4 w-4 ${s < (r.rating || 5) ? 'fill-[#F5B800] text-[#F5B800]' : 'text-black/10'}`} />)}
                                </div>
                                <blockquote className="mt-4 break-words text-[16px] leading-relaxed text-[#141412]">« {r.comment} »</blockquote>
                                <figcaption className="mt-5 flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F5F1] text-[13px] font-medium text-[#141412]">{(r.customer_name || r.name || '?').charAt(0).toUpperCase()}</span>
                                    <span className="min-w-0 text-[14px]">
                                        <span className="block truncate font-medium text-[#141412]">{r.customer_name || r.name}</span>
                                        {(r.customer_city || r.city) && <span className="block truncate text-[#8B8A83]">{r.customer_city || r.city}</span>}
                                    </span>
                                </figcaption>
                            </motion.figure>
                        ))}
                    </div>
                )}
            </Container>
        </section>
    );
}

/* ------------------------------------------------------------------ À propos + contact */

export function AboutSection({ store, theme }) {
    const wa = whatsappUrl(store);
    const socials = [[store.instagram_link, InstagramIcon, 'Instagram'], [store.tiktok_link, TiktokIcon, 'TikTok'], [store.facebook_link, FacebookIcon, 'Facebook']].filter(([h]) => h);
    return (
        <section id="about" className="scroll-mt-24 py-10 sm:py-24">
            <Container className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
                <motion.div {...reveal()} className="min-w-0 rounded-3xl bg-[#F6F5F1] p-6 sm:p-12">
                    <h2 className="text-[26px] font-medium leading-[1.1] tracking-[-0.03em] text-[#141412] [overflow-wrap:anywhere] sm:text-[40px]">À propos de {store.name}</h2>
                    <p className="mt-3 whitespace-pre-line text-[15px] [overflow-wrap:anywhere] leading-relaxed sm:mt-5 sm:text-[17px] text-[#5F5E58]">
                        {store.about_text || store.description || `Bienvenue chez ${store.name}. Nous sélectionnons nos articles avec soin et les livrons rapidement.`}
                    </p>
                </motion.div>
                <motion.div {...reveal(0.08)} className="flex min-w-0 flex-col justify-between gap-6 rounded-3xl border border-black/[0.06] p-6 sm:gap-8 sm:p-8">
                    <ul className="space-y-4 text-[15px] text-[#141412]">
                        {store.city_location && <li className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#8B8A83]" /> {store.city_location}</li>}
                        {store.opening_hours && <li className="flex gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#8B8A83]" /> {store.opening_hours}</li>}
                        <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#16A34A]" /> Paiement sécurisé MTN MoMo et Orange Money</li>
                    </ul>
                    <div className="space-y-4">
                        {wa && <Pill href={wa} target="_blank" rel="noreferrer" theme={theme} className="w-full"><WhatsappIcon className="h-4 w-4" /> Écrire sur WhatsApp</Pill>}
                        {socials.length > 0 && (
                            <div className="flex gap-2">
                                {socials.map(([href, Icon, label]) => (
                                    <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-[#141412] hover:border-black/30"><Icon className="h-4 w-4" /></a>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </Container>
        </section>
    );
}

/* ------------------------------------------------------------------ Appel final */

export function StoreCta({ store, theme, onShop }) {
    const wa = whatsappUrl(store, `Bonjour ${store.name}, j’ai une question avant de commander.`);
    return (
        <section className="pb-12 pt-2 sm:pb-20 sm:pt-4">
            <Container>
                <motion.div {...reveal()} className="relative overflow-hidden rounded-3xl bg-[#0F0F0E] px-5 py-10 text-center sm:rounded-[32px] sm:px-6 sm:py-20">
                    <div aria-hidden className="absolute left-1/2 top-full h-[380px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-[110px]" style={{ backgroundColor: theme.color }} />
                    <h2 className="relative mx-auto max-w-[620px] text-[24px] font-medium leading-[1.12] tracking-[-0.03em] text-white sm:text-[44px]">
                        Trouvé votre bonheur ? Commandez en 1 minute.
                    </h2>
                    <p className="relative mx-auto mt-3 max-w-[460px] text-[15px] text-white/60 sm:mt-4 sm:text-[17px]">Paiement par Mobile Money, confirmation immédiate et reçu sur WhatsApp.</p>
                    <div className="relative mt-6 flex flex-col justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
                        <Pill onClick={onShop} theme={theme}>Voir les produits <ArrowRight className="h-4 w-4" /></Pill>
                        {wa && <Pill href={wa} target="_blank" rel="noreferrer" theme={theme} variant="dark"><WhatsappIcon className="h-4 w-4" /> Poser une question</Pill>}
                    </div>
                </motion.div>
            </Container>
        </section>
    );
}
