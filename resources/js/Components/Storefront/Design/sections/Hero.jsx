import { useMemo, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Bike, Clock, MapPin, ShieldCheck, ShoppingBag, Smartphone, Star, Truck, Wallet } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TiktokIcon } from '@/Components/UI/BrandIcons';
import { productImage } from '@/Components/Storefront/ProductCard';
import { leadTimeLabel, scheduleKey } from '@/Components/Storefront/useCart';
import { productUrl } from '@/Components/Storefront/storeUrl';
import { Btn, Pic, PatZone, fmt, initials, priceOf, scrollToId } from '../ui';
import { deliveryText, sellingKind } from '../content';

/* Accueil : 9 dispositions. Textes : réglages de la section, sinon ceux de la boutique (Apparence). */

const SLOTS = ['Matin', 'Midi', 'Après-midi', 'Soir'];
const SLOT_KEYS = ['matin', 'midi', 'apres-midi', 'soir'];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Statut d'ouverture calculé par le serveur d'après les horaires : « Ouvert · ferme à 23 h ». */
export function OpenStatus({ store, className = 'chip' }) {
    const st = store.opening_status;
    if (!st) return null;
    return <span className={`${className} ${st.open ? 'is-open' : 'is-closed'}`}><span className="dot" />{st.label}</span>;
}

function useHero(section, ctx) {
    const { store, products } = ctx;
    const s = section.settings || {};
    const withImage = products.filter((p) => productImage(p));
    const tagline = [store.category, store.city_location].filter(Boolean).join(' · ');
    return {
        s,
        badge: s.badge || store.hero_badge_text || tagline,
        title: s.title || store.hero_title || store.name,
        subtitle: s.subtitle || store.hero_subtitle || store.description || 'Commandez en ligne, payez en Mobile Money et recevez votre commande chez vous.',
        button: s.button || store.hero_cta_text || (sellingKind(store) === 'services' ? 'Réserver' : 'Voir les produits'),
        image: s.image || store.banner_url || productImage(withImage[0]),
        pics: withImage.slice(0, 3).map(productImage),
    };
}

function Badge({ children }) {
    return children ? <span className="badge">{children}</span> : null;
}

function Ctas({ h, ctx, ghost = true }) {
    return (
        <div className="btns">
            <Btn onClick={ctx.onShop}>{h.button} <ArrowRight /></Btn>
            {ghost && ctx.reviews.length > 0 && <Btn variant="ghost" onClick={() => scrollToId('reviews')}>Voir les avis</Btn>}
        </div>
    );
}

function Meta({ store }) {
    return (
        <div className="h-meta">
            <span><ShieldCheck /> Paiement protégé</span>
            <span><Smartphone /> Mobile Money</span>
            <span><Truck /> {deliveryText(store)}</span>
        </div>
    );
}

export function Mark({ store, big = false }) {
    return (
        <span className={`mark ${big ? 'big' : ''}`}>
            {store.logo_url ? <img src={store.logo_url} alt="" /> : initials(store.name)}
        </span>
    );
}

function Split({ section, ctx }) {
    const h = useHero(section, ctx);
    return (
        <section className="h-split haspat">
            <PatZone design={ctx.design} zone="hero" />
            <div className="wrap grid2">
                <div className="h-txt">
                    <Badge>{h.badge}</Badge>
                    <h1>{h.title}</h1>
                    <p>{h.subtitle}</p>
                    <Ctas h={h} ctx={ctx} />
                    <Meta store={ctx.store} />
                </div>
                <Pic src={h.image} alt={ctx.store.name} ar="4/5" className="h-pic" eager sizes="(min-width: 760px) 50vw, 100vw" />
            </div>
        </section>
    );
}

function Full({ section, ctx }) {
    const h = useHero(section, ctx);
    return (
        <section className="h-cover">
            <Pic src={h.image} alt={ctx.store.name} ar="auto" className="bgpic" eager sizes="100vw" />
            <div className="wrap">
                <div className="h-txt">
                    <Badge>{h.badge}</Badge>
                    <h1>{h.title}</h1>
                    <p>{h.subtitle}</p>
                    <Ctas h={h} ctx={ctx} />
                </div>
            </div>
        </section>
    );
}

function Editorial({ section, ctx }) {
    const h = useHero(section, ctx);
    return (
        <section className="h-ed haspat">
            <PatZone design={ctx.design} zone="hero" />
            <div className="wrap">
                <Badge>{h.badge}</Badge>
                <h1>{h.title}</h1>
                <p>{h.subtitle}</p>
                <div className="btns ctr"><Btn onClick={ctx.onShop}>{h.button}</Btn></div>
                {h.pics.length === 3 && <div className="ed-strip">{h.pics.map((src, i) => <Pic key={i} src={src} ar="3/4" eager />)}</div>}
            </div>
        </section>
    );
}

function Collage({ section, ctx }) {
    const h = useHero(section, ctx);
    const pics = [h.image, ...h.pics.filter((p) => p !== h.image)].slice(0, 3);
    return (
        <section className="h-col haspat">
            <PatZone design={ctx.design} zone="hero" />
            <div className="wrap col-grid">
                <div className="h-txt">
                    <Badge>{h.badge}</Badge>
                    <h1>{h.title}</h1>
                    <p>{h.subtitle}</p>
                    <Ctas h={h} ctx={ctx} />
                </div>
                <div className="col-pics">
                    {[0, 1, 2].map((i) => <Pic key={i} src={pics[i]} ar={i ? '1/1' : '3/4'} className={`cp${i}`} eager />)}
                </div>
            </div>
        </section>
    );
}

function Menu({ section, ctx }) {
    const h = useHero(section, ctx);
    const { store } = ctx;
    const lead = store.template?.lead_time_hours;
    return (
        <section className="h-menu haspat">
            <PatZone design={ctx.design} zone="hero" />
            <div className="wrap">
                <Pic src={h.image} alt={store.name} ar="16/7" className="cover" eager sizes="100vw" />
                <div className="menu-info">
                    <Mark store={store} big />
                    <h1>{store.name}</h1>
                    <p>{h.subtitle}</p>
                    <div className="chips2">
                        {store.opening_status ? <OpenStatus store={store} /> : store.opening_hours && <span className="chip"><Clock /> {store.opening_hours}</span>}
                        {lead > 0 && <span className="chip"><Bike /> Prêt en {leadTimeLabel(lead)}</span>}
                        {Number(store.min_order_amount) > 0 && <span className="chip"><Wallet /> Minimum {fmt(store.min_order_amount)}</span>}
                        {Number(store.delivery_free_from) > 0 && <span className="chip"><Wallet /> Livraison offerte dès {fmt(store.delivery_free_from)}</span>}
                        {store.city_location && <span className="chip"><MapPin /> {store.city_location}</span>}
                    </div>
                    <div className="btns"><Btn onClick={ctx.onShop}>{h.button} <ArrowRight /></Btn></div>
                </div>
            </div>
        </section>
    );
}

/** Choix d'une date et d'un moment de la journée ; la réservation se termine sur la fiche de la prestation. */
function Booking({ section, ctx }) {
    const h = useHero(section, ctx);
    const { store, products } = ctx;
    const lead = Number(store.template?.lead_time_hours) || 0;
    const days = useMemo(() => {
        const start = new Date(Date.now() + lead * 3600 * 1000);
        return Array.from({ length: 4 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const today = d.toDateString() === new Date().toDateString();
            return { key: d.toDateString(), iso: iso(d), label: today ? 'Auj.' : d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '') + '.', day: d.getDate() };
        });
    }, [lead]);
    const [day, setDay] = useState(0);
    const [slot, setSlot] = useState(0);
    const service = products[0];
    const deposit = Number(store.deposit_percent) || 0;
    return (
        <section className="h-split haspat">
            <PatZone design={ctx.design} zone="hero" />
            <div className="wrap grid2">
                <div className="h-txt">
                    <Badge>{h.badge}</Badge>
                    <h1>{h.title}</h1>
                    <p>{h.subtitle}</p>
                    <Meta store={store} />
                </div>
                <div className="slot-card">
                    <div className="row"><b>Choisissez votre date</b>{service && <span className="mu small">{service.title}</span>}</div>
                    <div className="days" role="radiogroup" aria-label="Jour">
                        {days.map((d, i) => (
                            <button key={d.key} type="button" role="radio" aria-checked={day === i} className={day === i ? 'on' : ''} onClick={() => setDay(i)}>
                                {d.label}<b>{d.day}</b>
                            </button>
                        ))}
                    </div>
                    <div className="times" role="radiogroup" aria-label="Moment de la journée">
                        {SLOTS.map((t, i) => (
                            <button key={t} type="button" role="radio" aria-checked={slot === i} className={slot === i ? 'on' : ''} onClick={() => setSlot(i)}>{t}</button>
                        ))}
                    </div>
                    {service
                        ? <Btn variant="full" href={productUrl(store.slug, service.slug)} onClick={() => {
                            // Repris au paiement : le client n'a pas à choisir deux fois
                            try { localStorage.setItem(scheduleKey(store.id), JSON.stringify({ date: days[day].iso, slot: SLOT_KEYS[slot] })); } catch (e) { /* stockage indisponible */ }
                        }}>Réserver · {days[day].label} {days[day].day}, {SLOTS[slot].toLowerCase()}{deposit > 0 ? ` · acompte ${deposit} %` : ''}</Btn>
                        : <Btn variant="full" onClick={ctx.onShop}>{h.button}</Btn>}
                </div>
            </div>
        </section>
    );
}

function Profile({ section, ctx }) {
    const h = useHero(section, ctx);
    const { store } = ctx;
    const socials = [[store.instagram_link, InstagramIcon, 'Instagram'], [store.tiktok_link, TiktokIcon, 'TikTok'], [store.facebook_link, FacebookIcon, 'Facebook']].filter(([href]) => href);
    const place = store.location_address || store.city_location;
    return (
        <section className="h-prof haspat">
            <PatZone design={ctx.design} zone="hero" />
            <div className="wrap">
                <div className="prof">
                    {store.logo_url ? <Pic src={store.logo_url} alt={store.name} ar="1/1" className="avatar" eager /> : <Mark store={store} big />}
                    <h1>{store.name}</h1>
                    <p>{h.subtitle}</p>
                    {socials.length > 0 && (
                        <div className="socials">
                            {socials.map(([href, Icon, label]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="ib soft"><Icon className="h-4 w-4" /></a>)}
                        </div>
                    )}
                    <div className="plinks">
                        <button type="button" className="plink pri" onClick={ctx.onShop}><ShoppingBag /> {h.button} <ArrowDown /></button>
                        {ctx.reviews.length > 0 && <button type="button" className="plink" onClick={() => scrollToId('reviews')}><Star /> Avis clients ({ctx.reviews.length}) <ArrowDown /></button>}
                        {place && <a className="plink" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`} target="_blank" rel="noreferrer"><MapPin /> {place} <ArrowUpRight /></a>}
                    </div>
                </div>
            </div>
        </section>
    );
}

function Type({ section, ctx }) {
    const h = useHero(section, ctx);
    const words = h.title.replace(/\./g, '.|').split('|').map((w) => w.trim()).filter(Boolean);
    const names = ctx.categories.length ? ctx.categories.map((c) => c.label) : ctx.products.slice(0, 6).map((p) => p.title);
    const line = names.join(' ✦ ');
    return (
        <section className="h-type haspat">
            <PatZone design={ctx.design} zone="hero" />
            <div className="wrap">
                <h1>{words.map((w, i) => <span key={i} className={i % 2 ? 'hl' : ''}>{w} </span>)}</h1>
                <div className="type-row">
                    <p>{h.subtitle}</p>
                    <Btn onClick={ctx.onShop}>{h.button} <ArrowRight /></Btn>
                </div>
                {h.image && <Pic src={h.image} alt={ctx.store.name} ar="16/8" className="type-pic" eager sizes="100vw" />}
            </div>
            {line && <div className="mq" aria-hidden><div>{Array(6).fill(line).join(' ✦ ')}</div></div>}
        </section>
    );
}

/** Bannière promo : la promotion en cours la plus forte, sinon le message d'accueil. */
function Banner({ section, ctx }) {
    const h = useHero(section, ctx);
    const promo = [...ctx.promoProducts].sort((a, b) => (priceOf(b).old - priceOf(b).price) / priceOf(b).old - (priceOf(a).old - priceOf(a).price) / priceOf(a).old)[0];
    const p = promo && priceOf(promo);
    const discount = p?.old ? Math.round(((p.old - p.price) / p.old) * 100) : 0;
    return (
        <section className="h-ban">
            <div className="wrap">
                <div className="ban haspat">
                    <PatZone design={ctx.design} zone="hero" />
                    <div className="ban-t">
                        <Badge>{promo ? 'Promotion' : h.badge}</Badge>
                        <h1>{h.s.title || (promo && discount > 0 ? `−${discount} % sur ${promo.title}` : h.title)}</h1>
                        <p>{promo && !h.s.subtitle ? `${fmt(p.price)} au lieu de ${fmt(p.old)}` : h.subtitle}</p>
                        {promo
                            ? <Btn href={productUrl(ctx.store.slug, promo.slug)}>{h.s.button || 'J’en profite'}</Btn>
                            : <Btn onClick={ctx.onShop}>{h.button}</Btn>}
                    </div>
                    <Pic src={(promo && productImage(promo)) || h.image} alt="" ar="1/1" className="ban-pic" eager />
                </div>
            </div>
        </section>
    );
}

export default { split: Split, full: Full, editorial: Editorial, collage: Collage, menu: Menu, booking: Booking, profile: Profile, type: Type, banner: Banner };
