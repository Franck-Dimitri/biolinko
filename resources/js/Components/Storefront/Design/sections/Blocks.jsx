import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Check, Clock, Flame, MapPin, MessageSquareQuote, Plus, Smartphone, Truck, Zap } from 'lucide-react';
import { productImage } from '@/Components/Storefront/ProductCard';
import { productUrl } from '@/Components/Storefront/storeUrl';
import { Btn, Head, Pic, PatZone, Stars, fmt, initials, priceOf } from '../ui';
import { defaultCta, defaultFaq, defaultSteps, deliveryText, trustItems } from '../content';

/* Sections de contenu. Rien d'inventé : avis, chiffres, offres et infos viennent de la boutique. */

/* ------------------------------------------------------------------ Étapes */

function useSteps(section, ctx) {
    const items = (section.settings?.items || []).filter((x) => x?.title);
    const defaults = defaultSteps(ctx.store);
    return items.length ? items.map((x, i) => ({ ...x, icon: defaults[i % defaults.length].icon })) : defaults;
}

function StepsLine({ section, ctx }) {
    const steps = useSteps(section, ctx);
    return (
        <section className="sec">
            <div className="wrap">
                <Head title={section.settings?.title || 'Comment commander'} />
                <ol className="stl">
                    {steps.map((x, i) => <li key={i}><span className="num">{i + 1}</span><div><b>{x.title}</b>{x.text && <p>{x.text}</p>}</div></li>)}
                </ol>
            </div>
        </section>
    );
}

function StepsCards({ section, ctx }) {
    const steps = useSteps(section, ctx);
    return (
        <section className="sec alt haspat">
            <PatZone design={ctx.design} zone="alt" />
            <div className="wrap">
                <Head title={section.settings?.title || 'Comment commander'} />
                <div className="stc">
                    {steps.map((x, i) => {
                        const Icon = x.icon;
                        return <div key={i} className="stcard"><span className="sti"><Icon /></span><b>{x.title}</b>{x.text && <p>{x.text}</p>}</div>;
                    })}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Histoire */

function useStory(section, ctx) {
    const s = section.settings || {};
    const { store, products } = ctx;
    const about = store.about_text || store.description || `Bienvenue chez ${store.name}. Nous préparons chaque commande avec soin.`;
    const [first, ...rest] = about.split(/(?<=[.!?])\s+/);
    return {
        eyebrow: s.title || 'Notre histoire',
        heading: s.heading || (s.text ? first : `À propos de ${store.name}`),
        text: s.text || about,
        quote: s.heading || first,
        quoteText: s.text || rest.join(' '),
        signature: s.signature || '',
        image: s.image || store.banner_url || productImage(products.find((p) => productImage(p))),
    };
}

function StorySplit({ section, ctx, anchor }) {
    const st = useStory(section, ctx);
    return (
        <section className="sec" id={anchor}>
            <div className="wrap grid2 story">
                <Pic src={st.image} alt={ctx.store.name} ar="4/5" />
                <div className="h-txt">
                    <span className="eb">{st.eyebrow}</span>
                    <h2>{st.heading}</h2>
                    <p className="pre">{st.text}</p>
                    {st.signature && <span className="sig">{st.signature}</span>}
                </div>
            </div>
        </section>
    );
}

function StoryQuote({ section, ctx, anchor }) {
    const st = useStory(section, ctx);
    return (
        <section className="sec alt haspat" id={anchor}>
            <PatZone design={ctx.design} zone="alt" />
            <div className="wrap story-q">
                <span className="qm" aria-hidden>“</span>
                <blockquote>{st.quote}</blockquote>
                {st.quoteText && <p>{st.quoteText}</p>}
                <cite>— {st.signature ? `${st.signature}, ` : ''}{ctx.store.name}</cite>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Réalisations */

function Gallery({ section, ctx }) {
    const images = [...new Set(ctx.products.flatMap((p) => [p.image_url, ...(p.images || [])]).filter(Boolean))].slice(0, 6);
    if (images.length < 3) return null;
    const ars = ['4/5', '1/1', '3/4', '1/1', '4/5', '3/4'];
    return (
        <section className="sec">
            <div className="wrap">
                <Head title={section.settings?.title || 'Nos réalisations'} more={ctx.store.instagram_link ? 'Instagram' : null} moreHref={ctx.store.instagram_link} />
                <div className="gal">{images.map((src, i) => <Pic key={src} src={src} ar={ars[i % 6]} />)}</div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Avis */

const reviewer = (r) => r.customer_name || r.name || 'Client';
const city = (r) => r.customer_city || r.city;

function ReviewsHead({ section, ctx }) {
    const n = ctx.reviews.length;
    const avg = n ? ctx.reviews.reduce((a, r) => a + (Number(r.rating) || 5), 0) / n : 0;
    return (
        <>
            <Head title={section.settings?.title || 'Ils ont commandé'} more="Donner mon avis" onMore={ctx.onReview} />
            {n > 0 && <p className="rv-sum"><Stars value={Math.round(avg)} /> {avg.toFixed(1).replace('.', ',')} sur 5, d’après {n} avis</p>}
        </>
    );
}

function NoReviews({ ctx }) {
    return (
        <div className="empty">
            <MessageSquareQuote />
            <p>Vous avez commandé ici ? Soyez le premier à donner votre avis.</p>
            <Btn variant="ghost sm" onClick={ctx.onReview}>Donner mon avis</Btn>
        </div>
    );
}

function ReviewsCards({ section, ctx, anchor }) {
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <ReviewsHead section={section} ctx={ctx} />
                {!ctx.reviews.length && <NoReviews ctx={ctx} />}
                <div className="rvgrid">
                    {ctx.reviews.slice(0, 6).map((r, i) => (
                        <figure key={r.id || i} className="rv">
                            <Stars value={Number(r.rating) || 5} />
                            <blockquote>{r.comment}</blockquote>
                            <figcaption>
                                <span className="wa-av">{initials(reviewer(r))}</span>
                                <div><b>{reviewer(r)}</b><small>{city(r)}{r.is_verified ? <>{city(r) ? ' · ' : ''}<BadgeCheck /> Commande vérifiée</> : null}</small></div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

/** Avis présentés comme des messages, aux couleurs de la boutique. */
function ReviewsMessages({ section, ctx, anchor }) {
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <ReviewsHead section={section} ctx={ctx} />
                {!ctx.reviews.length && <NoReviews ctx={ctx} />}
                <div className="wa-grid">
                    {ctx.reviews.slice(0, 6).map((r, i) => (
                        <div key={r.id || i} className="wa">
                            <div className="wa-top">
                                <span className="wa-av">{initials(reviewer(r))}</span>
                                <div><b>{reviewer(r)}</b><small>{[city(r), r.is_verified ? 'Commande vérifiée' : null].filter(Boolean).join(' · ')}</small></div>
                            </div>
                            <div className="bub"><Stars value={Number(r.rating) || 5} />{r.comment}</div>
                        </div>
                    ))}
                </div>
                {ctx.reviews.some((r) => r.is_verified) && <p className="note"><BadgeCheck /> « Commande vérifiée » : avis laissé après une commande passée sur la boutique.</p>}
            </div>
        </section>
    );
}

function ReviewsBig({ section, ctx, anchor }) {
    const reviews = ctx.reviews.slice(0, 5);
    const [i, setI] = useState(0);
    const reduce = useReducedMotion();
    useEffect(() => {
        if (reduce || reviews.length < 2) return undefined;
        const t = setInterval(() => setI((v) => (v + 1) % reviews.length), 7000);
        return () => clearInterval(t);
    }, [reviews.length, reduce]);
    const r = reviews[i];
    return (
        <section className="sec alt" id={anchor}>
            <div className="wrap rv-big">
                {r ? (
                    <>
                        <Stars value={Number(r.rating) || 5} />
                        <blockquote aria-live="polite">« {r.comment} »</blockquote>
                        <cite>{reviewer(r)}{city(r) ? ` · ${city(r)}` : ''}</cite>
                        {reviews.length > 1 && (
                            <div className="rv-dots">
                                {reviews.map((_, k) => <button key={k} type="button" className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Avis ${k + 1}`} />)}
                            </div>
                        )}
                        <Btn variant="ghost sm" onClick={ctx.onReview}>Donner mon avis</Btn>
                    </>
                ) : <NoReviews ctx={ctx} />}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Infos pratiques */

function infoItems(store) {
    return [
        store.opening_hours && { icon: Clock, title: 'Horaires', text: store.opening_hours },
        { icon: Truck, title: 'Livraison', text: deliveryText(store) },
        (store.location_address || store.city_location) && { icon: MapPin, title: 'Adresse', text: store.location_address || store.city_location },
        { icon: Smartphone, title: 'Paiement', text: 'MTN MoMo · Orange Money' },
    ].filter(Boolean);
}

function InfoStrip({ ctx }) {
    return (
        <section className="inf-strip">
            <div className="wrap">
                <div className="infs">{infoItems(ctx.store).map(({ icon: Icon, title, text }) => <div key={title}><Icon /><span><small>{title}</small>{text}</span></div>)}</div>
            </div>
        </section>
    );
}

function InfoCards({ section, ctx }) {
    return (
        <section className="sec">
            <div className="wrap">
                <Head title={section.settings?.title || 'Infos pratiques'} />
                <div className="infc">{infoItems(ctx.store).map(({ icon: Icon, title, text }) => <div key={title} className="inf-card"><Icon /><small>{title}</small><b>{text}</b></div>)}</div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Offres */

function Countdown({ endsAt }) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);
    const left = Math.max(0, endsAt - now);
    const parts = [[Math.floor(left / 86400000), 'j'], [Math.floor((left % 86400000) / 3600000), 'h'], [Math.floor((left % 3600000) / 60000), 'min'], [Math.floor((left % 60000) / 1000), 's']];
    return <div className="timer" aria-label="Temps restant">{parts.map(([v, u]) => <span key={u}><b>{String(v).padStart(2, '0')}</b>{u}</span>)}</div>;
}

const discountOf = (p) => {
    const { price, old } = priceOf(p);
    return old ? Math.round(((old - price) / old) * 100) : 0;
};

/** Vente flash : les produits en promotion, avec le compte à rebours de la promo qui finit le plus tôt. */
function Flash({ section, ctx, anchor }) {
    const promos = ctx.promoProducts;
    if (!promos.length) return null;
    const best = Math.max(...promos.map(discountOf));
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <div className="flash haspat">
                    <PatZone design={ctx.design} zone="band" />
                    <div className="fl-t">
                        <span className="fl-b"><Zap /> {section.settings?.title || 'Vente flash'}</span>
                        <h2>{best > 0 ? `Jusqu’à −${best} %` : 'Prix réduits'}{promos.length > 1 ? ` sur ${promos.length} articles` : ''}</h2>
                        {ctx.promoEndsAt && <Countdown endsAt={ctx.promoEndsAt} />}
                    </div>
                    <div className="fl-p">
                        {promos.slice(0, 3).map((p) => {
                            const { price, old } = priceOf(p);
                            return (
                                <a key={p.id} href={productUrl(ctx.store.slug, p.slug)} className="flc">
                                    <Pic src={productImage(p)} alt="" ar="1/1" />
                                    <div><div className="pn">{p.title}</div><div className="pp">{fmt(price)} {old ? <s>{fmt(old)}</s> : null}</div></div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

const packUrl = (pack) => route('smartlink.show', pack.code);
const packSaving = (pack) => Math.max(0, Number(pack.subtotal_amount || 0) - Number(pack.total_amount || 0));

/** Combo : le premier pack de la boutique (plusieurs produits, un prix réduit). */
function Combo({ section, ctx, anchor }) {
    const pack = ctx.packs[0];
    if (!pack) return null;
    const items = pack.items || [];
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <div className="combo">
                    <Pic src={items.find((it) => it.image_url)?.image_url} alt="" ar="4/3" />
                    <div className="cb-t">
                        <span className="badge"><Flame /> {section.settings?.title || 'Combo'}</span>
                        <h2>{pack.title}</h2>
                        <p className="mu">{items.map((it) => `${it.quantity > 1 ? `${it.quantity} × ` : ''}${it.product_name}`).join(' + ')}</p>
                        <div className="pp big">{fmt(pack.total_amount)} {packSaving(pack) > 0 && <s>{fmt(pack.subtotal_amount)}</s>}</div>
                        <Btn href={packUrl(pack)}><Plus /> Prendre le combo</Btn>
                    </div>
                </div>
            </div>
        </section>
    );
}

/** Panier de la semaine : un pack présenté comme un panier composé. */
function Basket({ section, ctx, anchor }) {
    const pack = ctx.packs[0];
    if (!pack) return null;
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <div className="basket">
                    <div>
                        <span className="badge">{section.settings?.title || 'Panier composé'}</span>
                        <h2>{pack.title}</h2>
                        <ul>{(pack.items || []).map((it, i) => <li key={i}><Check />{it.quantity > 1 ? `${it.quantity} × ` : ''}{it.product_name}</li>)}</ul>
                    </div>
                    <div className="bk-side">
                        <div className="pp big">{fmt(pack.total_amount)} {packSaving(pack) > 0 && <s>{fmt(pack.subtotal_amount)}</s>}</div>
                        {packSaving(pack) > 0 && <span className="mu small">Vous économisez {fmt(packSaving(pack))}</span>}
                        <Btn variant="full" href={packUrl(pack)}>Commander le panier</Btn>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PacksCards({ section, ctx, anchor }) {
    const packs = ctx.packList ?? ctx.packs;
    if (!packs.length) return null;
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <Head title={section.settings?.title || 'Packs'} />
                <div className="packs">
                    {packs.map((pack) => (
                        <a key={pack.id} href={packUrl(pack)} className="pack">
                            <span className="pack-pics">{(pack.items || []).slice(0, 3).map((it, k) => <Pic key={k} src={it.image_url} alt="" ar="1/1" />)}</span>
                            <span className="pack-t">
                                <b>{pack.title}</b>
                                <span className="pp">{fmt(pack.total_amount)} {packSaving(pack) > 0 && <span className="save">−{fmt(packSaving(pack))}</span>}</span>
                            </span>
                            <span className="pack-go"><ArrowRight /></span>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Garanties */

function TrustIcons({ section, ctx }) {
    return (
        <section className="sec tight">
            <div className="wrap">
                <Head title={section.settings?.title} />
                <div className="trust">
                    {trustItems(ctx.store).map(({ icon: Icon, title, text }) => <div key={title}><span className="ti"><Icon /></span><b>{title}</b><small>{text}</small></div>)}
                </div>
            </div>
        </section>
    );
}

/** Chiffres clés réels : commandes livrées, note moyenne, articles, ancienneté. */
function TrustStats({ section, ctx }) {
    const { store, reviews, products } = ctx;
    const delivered = Number(store.trust?.delivered) || 0;
    const avg = reviews.length >= 3 ? reviews.reduce((a, r) => a + (Number(r.rating) || 5), 0) / reviews.length : null;
    const since = store.trust?.since ? new Date(store.trust.since).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : null;
    const stats = [
        delivered > 0 && [delivered.toLocaleString('fr-FR'), `commande${delivered > 1 ? 's' : ''} livrée${delivered > 1 ? 's' : ''}`],
        avg && [`${avg.toFixed(1).replace('.', ',')}/5`, `note moyenne (${reviews.length} avis)`],
        products.length > 0 && [String(products.length), `article${products.length > 1 ? 's' : ''} en boutique`],
        since && [since, 'sur Biolinko depuis'],
    ].filter(Boolean).slice(0, 3);
    if (stats.length < 2) return <TrustIcons section={section} ctx={ctx} />;
    return (
        <section className="sec tight">
            <div className="wrap">
                <Head title={section.settings?.title} />
                <div className="stats">{stats.map(([a, b]) => <div key={b}><b>{a}</b><span>{b}</span></div>)}</div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ FAQ */

function Faq({ section, ctx }) {
    const items = (section.settings?.items || []).filter((x) => x?.question && x?.answer);
    const list = items.length ? items : defaultFaq(ctx.store);
    return (
        <section className="sec">
            <div className="wrap faq-w">
                <Head title={section.settings?.title || 'Questions fréquentes'} />
                <div className="faq">
                    {list.map((x, i) => (
                        <details key={i} open={i === 0}>
                            <summary>{x.question}<Plus /></summary>
                            <p>{x.answer}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Appel à commander */

function useCta(section, ctx) {
    const s = section.settings || {};
    const d = defaultCta(ctx.store);
    return { title: s.title || d.title, text: s.text || d.text, button: s.button || d.button };
}

function CtaBand({ section, ctx }) {
    const c = useCta(section, ctx);
    return (
        <section className="cta-band haspat">
            <PatZone design={ctx.design} zone="band" />
            <div className="wrap">
                <h2>{c.title}</h2>
                {c.text && <p>{c.text}</p>}
                <Btn variant="inv" onClick={ctx.onShop}>{c.button} <ArrowRight /></Btn>
            </div>
        </section>
    );
}

function CtaCard({ section, ctx }) {
    const c = useCta(section, ctx);
    return (
        <section className="sec">
            <div className="wrap">
                <div className="cta-card">
                    <div><h2>{c.title}</h2>{c.text && <p>{c.text}</p>}</div>
                    <Btn onClick={ctx.onShop}>{c.button} <ArrowRight /></Btn>
                </div>
            </div>
        </section>
    );
}

export const Steps = { line: StepsLine, cards: StepsCards };
export const Story = { split: StorySplit, quote: StoryQuote };
export const GallerySection = { simple: Gallery };
export const Reviews = { cards: ReviewsCards, messages: ReviewsMessages, big: ReviewsBig };
export const Info = { strip: InfoStrip, cards: InfoCards };
export const Promo = { flash: Flash, combo: Combo, basket: Basket };
export const Packs = { cards: PacksCards };
export const Trust = { icons: TrustIcons, stats: TrustStats };
export const FaqSection = { simple: Faq };
export const Cta = { band: CtaBand, card: CtaCard };
