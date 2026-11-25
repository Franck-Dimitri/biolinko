import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowRight, BadgeCheck, CalendarCheck, Clock, Flag, MapPin, Menu, Phone, Search, ShieldCheck, ShoppingBag, UserRound, X } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TiktokIcon } from '@/Components/UI/BrandIcons';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import { ReportStoreDialog, TrustBadges } from '@/Components/Storefront/FooterBoutique';
import { leadTimeLabel } from '@/Components/Storefront/useCart';
import { appLink, storeUrl } from '@/Components/Storefront/storeUrl';
import { PatZone, fmt } from './ui';
import { Mark } from './sections/Hero';
import { deliveryText, sellingKind } from './content';
import { designVars } from './tokens';

/* En-tête, pied de page et barre panier des templates (les variantes « classic » gardent HeaderBoutique et FooterBoutique). */

function Announce({ design, store }) {
    const section = design.sections.find((s) => s.type === 'announce');
    const text = section?.settings?.text || store.announcement_header;
    if (!section?.enabled || !text) return null;
    return <div className="ann"><span title={text}>{text}</span></div>;
}

function Socials({ store }) {
    const socials = [[store.instagram_link, InstagramIcon, 'Instagram'], [store.tiktok_link, TiktokIcon, 'TikTok'], [store.facebook_link, FacebookIcon, 'Facebook']].filter(([href]) => href);
    if (!socials.length) return null;
    return <div className="socials">{socials.map(([href, Icon, label]) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="ib soft"><Icon className="h-4 w-4" /></a>)}</div>;
}

export function DesignHeader({ store, design, variant, cartCount = 0, openCart, searchQuery = '', setSearchQuery, setActiveTab, hasPromos, hasSmartLinks }) {
    const [menu, setMenu] = useState(false);
    const [search, setSearch] = useState(false);

    const go = (id) => {
        setMenu(false);
        if (setActiveTab) setActiveTab('all');
        setTimeout(() => {
            const target = document.getElementById(id);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            else window.location.href = storeUrl(store.slug, `#${id}`);
        }, 80);
    };
    const has = (type) => design.sections.some((s) => s.type === type && s.enabled);
    const links = [
        ['Produits', 'catalog-grid'],
        ...(hasPromos ? [['Promotions', 'promotions']] : []),
        ...(hasSmartLinks ? [['Packs', 'smartlinks']] : []),
        ...(has('reviews') ? [['Avis', 'reviews']] : []),
        ...(has('story') ? [['À propos', 'about']] : []),
    ];
    const home = storeUrl(store.slug);
    const name = <a href={home} className="hd-home">{store.name}{store.trust?.verified && <BadgeCheck className="verified" aria-label="Vendeur vérifié par Biolinko" />}</a>;

    const cart = (
        <button type="button" className="ib" onClick={openCart} aria-label={`Panier, ${cartCount} article${cartCount > 1 ? 's' : ''}`}>
            <ShoppingBag />{cartCount > 0 && <b className="cnt">{cartCount}</b>}
        </button>
    );
    // Connexion à l'espace vendeur (biolinko.app/login)
    const login = (
        <a className="ib" href={appLink('/login')} aria-label="Connexion" title="Connexion"><UserRound /></a>
    );
    const searchBtn = setSearchQuery && (
        <button type="button" className="ib" onClick={() => setSearch((v) => !v)} aria-label="Rechercher un produit" aria-expanded={search}><Search /></button>
    );
    const menuBtn = (
        <button type="button" className="ib mob" onClick={() => setMenu((v) => !v)} aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menu}>{menu ? <X /> : <Menu />}</button>
    );
    const nav = (cls) => <nav className={cls} aria-label="Boutique">{links.map(([label, id]) => <button key={id} type="button" onClick={() => go(id)}>{label}</button>)}</nav>;
    const searchField = (
        <label className="search">
            <Search />
            <span className="sr-only">Rechercher un produit</span>
            <input type="search" autoFocus={variant !== 'app'} value={searchQuery} placeholder="Rechercher dans la boutique"
                onChange={(e) => { setSearchQuery(e.target.value); if (setActiveTab) setActiveTab('all'); }}
                onKeyDown={(e) => e.key === 'Enter' && go('catalog-grid')} />
        </label>
    );
    const lead = Number(store.template?.lead_time_hours) || 0;
    const status = store.opening_status?.label || store.opening_hours || [deliveryText(store), lead && sellingKind(store) !== 'stock' ? `prêt en ${leadTimeLabel(lead)}` : null].filter(Boolean).join(' · ');

    let bar;
    if (variant === 'center') {
        bar = (
            <>
                <div className="wrap row hh">{menuBtn}<div className="hd-name">{name}</div><div className="row g4">{searchBtn}{login}{cart}</div></div>
                {nav('wrap hd-nav dsk')}
            </>
        );
    } else if (variant === 'app') {
        bar = (
            <div className="wrap">
                <div className="row hh">
                    <div className="row g10"><Mark store={store} /><div className="min0"><div className="hd-t">{name}</div><div className={`hd-s ${store.opening_status ? (store.opening_status.open ? 'is-open' : 'is-closed') : ''}`}><span className="dot" />{status}</div></div></div>
                    <div className="row g4">{menuBtn}{login}{cart}</div>
                </div>
                {setSearchQuery && searchField}
            </div>
        );
    } else if (variant === 'bold') {
        bar = <div className="wrap row hh"><div className="hd-big">{name}</div><div className="row g4">{searchBtn}{login}{cart}{menuBtn}</div></div>;
    } else {
        bar = (
            <div className="wrap row hh">
                <div className="row g10 min0"><Mark store={store} /><span className="hd-t">{name}</span></div>
                {nav('hd-links dsk')}
                <div className="row g4">{searchBtn}{login}{cart}{menuBtn}</div>
            </div>
        );
    }

    return (
        <div className="sfd sfd-head" style={designVars(design.style)}>
            <Announce design={design} store={store} />
            <header className={`s-hd hd-${variant}`}>
                {bar}
                {search && variant !== 'app' && <div className="wrap hd-search">{searchField}</div>}
                {menu && nav('wrap hd-menu')}
            </header>
            <PatZone design={design} zone="top-ribbon" />
        </div>
    );
}

export function DesignFooter({ store, design, variant, demo = false }) {
    const [reporting, setReporting] = useState(false);
    const base = storeUrl(store.slug);
    const pay = (
        <div className="ft-pay">
            <OperatorLogo op="MTN" className="h-7 w-7" /><OperatorLogo op="ORANGE" className="h-7 w-7" />
            <span>Paiement protégé par Biolinko</span>
        </div>
    );
    const legal = (
        <div className="ft-b">
            <span>© {new Date().getFullYear()} {store.name} · <a href={route('legal.terms')}>Conditions</a> · <a href={route('legal.privacy')}>Confidentialité</a> · <a href={route('legal.cookies')}>Cookies</a></span>
            {!demo && <button type="button" onClick={() => setReporting(true)}><Flag /> Signaler cette boutique</button>}
            <a href={appLink('/')}>Boutique créée avec <b>Biolinko</b></a>
        </div>
    );
    const phone = store.phone_whatsapp?.replace(/[^0-9+]/g, '');
    // +237690112233 → +237 6 90 11 22 33
    const phoneLabel = phone ? phone.replace(/^\+?237(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/, '+237 $1 $2 $3 $4 $5') : null;

    return (
        <div className="sfd sfd-foot" style={designVars(design.style)}>
            <PatZone design={design} zone="ribbon" />
            {variant === 'rich' ? (
                <footer className="ft rich">
                    <div className="wrap">
                        <div className="ft-g">
                            <div>
                                <a href={base} className="hd-t">{store.name}</a>
                                <TrustBadges store={store} />
                                {store.description && <p className="mu">{store.description}</p>}
                                <Socials store={store} />
                            </div>
                            <div>
                                <b>Contact</b>
                                {phone && <a href={`tel:${phone}`}><Phone /> {phoneLabel}</a>}
                                {(store.location_address || store.city_location) && <span><MapPin /> {store.location_address || store.city_location}</span>}
                                {store.opening_hours && <span><Clock /> {store.opening_hours}</span>}
                            </div>
                            <div>
                                <b>Vos achats</b>
                                <a href={`${base}?tab=cart`}><ShoppingBag /> Mon panier</a>
                                <span><ShieldCheck /> Le vendeur est payé après la livraison</span>
                                {pay}
                            </div>
                        </div>
                        {legal}
                    </div>
                </footer>
            ) : (
                <footer className="ft">
                    <div className="wrap ft-s">
                        <a href={base} className="hd-t">{store.name}</a>
                        <TrustBadges store={store} className="justify-center" />
                        <Socials store={store} />
                        {phone && <a href={`tel:${phone}`} className="mu"><Phone /> {phoneLabel}</a>}
                        {pay}
                        {legal}
                    </div>
                </footer>
            )}
            <AnimatePresence>{reporting && <ReportStoreDialog store={store} onClose={() => setReporting(false)} />}</AnimatePresence>
        </div>
    );
}

/** Barre panier toujours visible quand le panier n'est pas vide : remplace le bouton WhatsApp flottant. */
export function CartBar({ store, design, count, total, onOpen }) {
    const services = sellingKind(store) === 'services';
    const Icon = services ? CalendarCheck : ShoppingBag;
    return (
        <div className="sfd s-cart" style={designVars(design.style)}>
            <button type="button" className="cbar" onClick={onOpen}>
                <span className="cb-i"><Icon /><b>{count}</b></span>
                <span className="cb-t"><small>{count} {services ? `réservation${count > 1 ? 's' : ''}` : `article${count > 1 ? 's' : ''}`} dans le panier</small>{fmt(total)}</span>
                <span className="cb-go">{services ? 'Réserver' : 'Commander'} <ArrowRight /></span>
            </button>
        </div>
    );
}
