import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Calendar, Check, LayoutGrid, Package, Plus, Search } from 'lucide-react';
import { productImage } from '@/Components/Storefront/ProductCard';
import { durationLabel, earliestDate, leadTimeLabel, optionPrice, variantLabel } from '@/Components/Storefront/useCart';
import { productUrl } from '@/Components/Storefront/storeUrl';
import { Btn, Head, Pic, ProductTile, categoryOf, fmt, priceOf, scrollToId, slugify } from '../ui';
import { PRODUCT_TITLES, sellingKind } from '../content';

/* Catalogue : catégories, produits (5 dispositions), configurateur et prestations. Données réelles de la boutique. */

const pickCategory = (ctx, id) => {
    ctx.onCategory(id);
    setTimeout(() => scrollToId(ctx.catalogAnchor || 'catalog-grid'), 40);
};

/* ------------------------------------------------------------------ Catégories */

function useCategories(ctx) {
    return ctx.categories.map((c) => ({ ...c, image: productImage(ctx.products.find((p) => slugify(categoryOf(p)) === c.id && productImage(p))) }));
}

function Chips({ ctx }) {
    if (!ctx.categories.length) return null;
    return (
        <section className="chips-sec">
            <div className="wrap">
                <div className="chips" role="group" aria-label="Catégories">
                    {[{ id: 'all', label: 'Tout' }, ...ctx.categories].map((c) => (
                        <button key={c.id} type="button" className={`chip ${ctx.selectedCategory === c.id ? 'on' : ''}`} aria-pressed={ctx.selectedCategory === c.id} onClick={() => pickCategory(ctx, c.id)}>{c.label}</button>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Circles({ section, ctx }) {
    const cats = useCategories(ctx);
    if (!cats.length) return null;
    return (
        <section className="sec tight">
            <div className="wrap">
                <Head title={section.settings?.title} />
                <div className="circles">
                    {cats.map((c) => (
                        <button key={c.id} type="button" className={`circ ${ctx.selectedCategory === c.id ? 'on' : ''}`} onClick={() => pickCategory(ctx, c.id)}>
                            <span className="ci">{c.image ? <img src={c.image} alt="" loading="lazy" /> : <LayoutGrid />}</span>
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Tiles({ section, ctx }) {
    const cats = useCategories(ctx).slice(0, 4);
    if (!cats.length) return null;
    return (
        <section className="sec">
            <div className="wrap">
                <Head title={section.settings?.title || 'Par catégorie'} />
                <div className="tiles">
                    {cats.map((c) => (
                        <button key={c.id} type="button" className="tile" onClick={() => pickCategory(ctx, c.id)}>
                            <Pic src={c.image} ar="1/1" icon={LayoutGrid} />
                            <span>{c.label} <ArrowUpRight /></span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Produits */

function useProducts(section, ctx, fallbackLimit) {
    const s = section.settings || {};
    const limit = ctx.fullCatalog ? null : s.limit || fallbackLimit;
    const all = ctx.filteredProducts;
    const filtered = ctx.selectedCategory !== 'all' || ctx.search;
    const shown = limit ? all.slice(0, limit) : all;
    const title = s.title || (ctx.fullCatalog ? 'Tout le catalogue' : PRODUCT_TITLES[ctx.store.business_type] || 'Nos produits');
    const more = !ctx.fullCatalog && limit && all.length > limit ? `Voir les ${all.length}` : null;
    return { s, shown, all, title, more, filtered };
}

function Empty({ ctx, filtered }) {
    return (
        <div className="empty">
            {filtered ? <Search /> : <Package />}
            <p>{filtered ? 'Aucun produit ne correspond à votre recherche.' : 'Les produits arrivent bientôt.'}</p>
            {filtered && <Btn variant="ghost sm" onClick={() => { ctx.onCategory('all'); ctx.onSearch(''); }}>Tout afficher</Btn>}
        </div>
    );
}

/** Recherche dans le catalogue complet (page « Tout le catalogue »). */
function CatalogSearch({ ctx }) {
    if (!ctx.fullCatalog) return null;
    return (
        <div className="cat-tools">
            <label className="search cat-search">
                <Search />
                <span className="sr-only">Rechercher un produit</span>
                <input type="search" value={ctx.search} onChange={(e) => ctx.onSearch(e.target.value)} placeholder="Rechercher un produit" />
            </label>
            {ctx.categories.length > 0 && (
                <div className="chips" role="group" aria-label="Catégories">
                    {[{ id: 'all', label: 'Tout' }, ...ctx.categories].map((c) => (
                        <button key={c.id} type="button" className={`chip ${ctx.selectedCategory === c.id ? 'on' : ''}`} aria-pressed={ctx.selectedCategory === c.id} onClick={() => ctx.onCategory(c.id)}>{c.label}</button>
                    ))}
                </div>
            )}
        </div>
    );
}

function Grid({ section, ctx, anchor }) {
    const d = useProducts(section, ctx, 8);
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <Head title={d.title} more={d.more} onMore={ctx.onSeeAll} />
                <CatalogSearch ctx={ctx} />
                {d.shown.length ? <div className="pgrid">{d.shown.map((p, i) => <ProductTile key={p.id} p={p} ctx={ctx} eager={i < 2} />)}</div> : <Empty ctx={ctx} filtered={d.filtered} />}
            </div>
        </section>
    );
}

function Carousel({ section, ctx, anchor }) {
    const d = useProducts(section, ctx, 12);
    if (ctx.fullCatalog) return <Grid section={section} ctx={ctx} anchor={anchor} />;
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <Head title={d.title} more={d.more || (d.all.length > 3 ? 'Tout voir' : null)} onMore={ctx.onSeeAll} />
                {d.shown.length ? <div className="car">{d.shown.map((p) => <ProductTile key={p.id} p={p} ctx={ctx} />)}</div> : <Empty ctx={ctx} filtered={d.filtered} />}
            </div>
        </section>
    );
}

/** Liste façon carte de restaurant, groupée par catégorie ; avec ou sans pointillés jusqu'au prix. */
function List({ section, ctx, anchor }) {
    const d = useProducts(section, ctx, 24);
    const leaders = Boolean(d.s.leaders);
    const groups = {};
    d.shown.forEach((p) => { (groups[categoryOf(p) || d.title] ||= []).push(p); });
    const many = Object.keys(groups).length > 1;
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <Head title={d.title} more={d.more} onMore={ctx.onSeeAll} />
                <CatalogSearch ctx={ctx} />
                {!d.shown.length && <Empty ctx={ctx} filtered={d.filtered} />}
                <div className={`mlist ${leaders ? 'dots' : ''}`}>
                    {Object.entries(groups).map(([group, items]) => (
                        <div key={group} className="mgroup">
                            {many && <h3>{group}</h3>}
                            {items.map((p) => {
                                const { price, old, from } = priceOf(p);
                                const url = productUrl(ctx.store.slug, p.slug);
                                const label = `${from ? 'à partir de ' : ''}${fmt(price)}`;
                                return leaders ? (
                                    <a key={p.id} href={url} className="mrow">
                                        <span className="ml"><span className="mn">{p.title}</span><span className="lead" /><span className="mp">{label}</span></span>
                                        {p.description && <span className="md">{p.description}</span>}
                                    </a>
                                ) : (
                                    <div key={p.id} className="mrow">
                                        <a href={url} className="mrow-t">
                                            <span className="mn">{p.title}</span>
                                            {p.description && <span className="md">{p.description}</span>}
                                            <span className="mp">{label}{old ? <> <s>{fmt(old)}</s></> : null}</span>
                                        </a>
                                        <div className="mthumb">
                                            <Pic src={productImage(p)} alt={p.title} ar="1/1" />
                                            <button type="button" className="add" onClick={() => ctx.cardProps.onAdd(p)} aria-label={`Ajouter ${p.title} au panier`}><Plus /></button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Lookbook({ section, ctx, anchor }) {
    const d = useProducts(section, ctx, 3);
    if (ctx.fullCatalog) return <Grid section={section} ctx={ctx} anchor={anchor} />;
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <Head title={d.title} more={d.all.length > d.shown.length ? `Voir les ${d.all.length}` : null} onMore={ctx.onSeeAll} />
                {!d.shown.length && <Empty ctx={ctx} filtered={d.filtered} />}
                <div className="lb">
                    {d.shown.map((p, i) => {
                        const { price, from } = priceOf(p);
                        const url = productUrl(ctx.store.slug, p.slug);
                        return (
                            <article key={p.id} className={`lb-item ${i % 2 ? 'alt' : ''}`}>
                                <a href={url} aria-label={p.title}><Pic src={productImage(p)} alt={p.title} ar="4/5" /></a>
                                <div className="lb-t">
                                    <span className="eb">N° {String(i + 1).padStart(2, '0')}</span>
                                    <h3>{p.title}</h3>
                                    {p.description && <p className="clamp3">{p.description}</p>}
                                    <div className="pp">{from && <span className="from">à partir de </span>}{fmt(price)}</div>
                                    <Btn variant="ghost" href={url}>Découvrir <ArrowRight /></Btn>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/** Points clés d'un produit : les lignes courtes de sa description. */
const specsOf = (p) => ((p.specs || []).filter((r) => r.label && r.value).length
    ? p.specs.filter((r) => r.label && r.value).slice(0, 4).map((r) => `${r.label} : ${r.value}`)
    : (p.description || '').split(/\n|•|;|\. /).map((x) => x.trim().replace(/\.$/, '')).filter((x) => x && x.length <= 60).slice(0, 3));

function Specs({ section, ctx, anchor }) {
    const d = useProducts(section, ctx, 6);
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <Head title={d.title} more={d.more} onMore={ctx.onSeeAll} />
                <CatalogSearch ctx={ctx} />
                {!d.shown.length && <Empty ctx={ctx} filtered={d.filtered} />}
                <div className="spgrid">
                    {d.shown.map((p) => {
                        const { price, old } = priceOf(p);
                        const url = productUrl(ctx.store.slug, p.slug);
                        const specs = specsOf(p);
                        return (
                            <article key={p.id} className="spc">
                                <a href={url} aria-label={p.title}><Pic src={productImage(p)} alt={p.title} ar="1/1" /></a>
                                <div className="spb">
                                    <a href={url} className="pn">{p.title}</a>
                                    {specs.length > 0 && <ul>{specs.map((x) => <li key={x}><Check />{x}</li>)}</ul>}
                                    <div className="row">
                                        <div className="pp">{fmt(price)}{old ? <> <s>{fmt(old)}</s></> : null}</div>
                                        <Btn variant="sm" onClick={() => ctx.cardProps.onAdd(p)}><Plus /> Ajouter</Btn>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Configurateur */

/**
 * Commande personnalisée : le produit à composer (réglage, sinon le premier produit personnalisable).
 * Le client choisit ses options, le prix se met à jour (suppléments compris) et la commande part au panier ;
 * la date se choisit au paiement. Le serveur recalcule tout au paiement.
 */
function Builder({ section, ctx }) {
    const s = section.settings || {};
    const { products, store } = ctx;
    const product = products.find((p) => p.id === s.product_id)
        || products.find((p) => (p.custom_fields || []).some((f) => f.label))
        || products.find((p) => p.fulfillment === 'made_to_order' && (p.variants || []).length);
    const variants = (product?.variants || []).filter((v) => variantLabel(v));
    const fields = (product?.custom_fields || []).filter((f) => f.label);
    const [selected, setSelected] = useState(0);
    const [answers, setAnswers] = useState({});
    if (!product) return null;
    const variant = variants[selected];
    const base = variant && Number(variant.price) > 0 ? Math.ceil(Number(variant.price)) : priceOf(product).price;
    const extras = fields.reduce((a, f) => a + (f.type === 'select' ? optionPrice(f, answers[f.label]) : 0), 0);
    const lead = Number(product.lead_time_hours ?? store.template?.lead_time_hours) || 0;
    const date = new Date(`${earliestDate(lead)}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const set = (label, value) => setAnswers((a) => ({ ...a, [label]: value }));

    const add = () => {
        const missing = fields.find((f) => f.required && !(answers[f.label] || '').trim());
        if (missing) {
            ctx.notify?.(`Précisez « ${missing.label} »`);
            return;
        }
        const customizations = fields.map((f) => {
            const value = (answers[f.label] || '').trim();
            const price = f.type === 'select' ? optionPrice(f, value) : 0;
            return { label: f.label, value, ...(price ? { price } : {}) };
        }).filter((c) => c.value);
        ctx.addToCart(product, null, variant || null, customizations);
    };

    return (
        <section className="sec">
            <div className="wrap">
                <div className="bld">
                    <Pic src={productImage(product)} alt={product.title} ar="4/5" className="bld-pic" />
                    <div className="bld-f">
                        <h2>{s.title || `Composez votre ${product.title.toLowerCase()}`}</h2>
                        {variants.length > 0 && (
                            <div className="opt">
                                <span className="lbl">Choix</span>
                                <div className="ochips" role="radiogroup" aria-label="Choix">
                                    {variants.map((v, i) => (
                                        <button key={v.id || i} type="button" role="radio" aria-checked={selected === i} className={`ochip ${selected === i ? 'sel' : ''}`} onClick={() => setSelected(i)}>{variantLabel(v)}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {fields.map((f) => (
                            <div key={f.label} className="opt">
                                <span className="lbl">{f.label}{f.required ? '' : ' (facultatif)'}</span>
                                {f.type === 'select' && (f.options || []).length ? (
                                    <div className="ochips" role="radiogroup" aria-label={f.label}>
                                        {f.options.map((o) => (
                                            <button key={o} type="button" role="radio" aria-checked={answers[f.label] === o} className={`ochip ${answers[f.label] === o ? 'sel' : ''}`} onClick={() => set(f.label, answers[f.label] === o ? '' : o)}>
                                                {o}{optionPrice(f, o) ? <span className="plus">+{fmt(optionPrice(f, o))}</span> : null}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <input className="field-in" aria-label={f.label} maxLength={300} value={answers[f.label] || ''} onChange={(e) => set(f.label, e.target.value)} placeholder="Votre réponse" />
                                )}
                            </div>
                        ))}
                        {product.fulfillment === 'made_to_order' && (
                            <div className="opt">
                                <span className="lbl">{store.template?.date_label || 'Date souhaitée'}</span>
                                <div className="field"><Calendar /> À choisir au paiement, à partir du {date}</div>
                            </div>
                        )}
                        <div className="row tot"><span>Total</span><b>{fmt(base + extras)}</b></div>
                        <Btn variant="full" onClick={add}>Ajouter au panier <ArrowRight /></Btn>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Prestations */

function ServicesList({ section, ctx, anchor }) {
    const title = section.settings?.title || 'Nos prestations';
    const cta = ctx.store.template?.cta || 'Réserver';
    const list = ctx.filteredProducts;
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <Head title={title} />
                {!list.length && <Empty ctx={ctx} filtered={ctx.selectedCategory !== 'all' || ctx.search} />}
                <div className="svlist">
                    {list.map((p) => {
                        const { price, from } = priceOf(p);
                        return (
                            <div key={p.id} className="svc">
                                <a href={productUrl(ctx.store.slug, p.slug)} className="svc-t">
                                    <span className="mn">{p.title}</span>
                                    <span className="md clamp2">{[durationLabel(p.duration_minutes), p.description].filter(Boolean).join(' · ')}</span>
                                </a>
                                <div className="svr">
                                    <span className="pp">{from && <span className="from">dès </span>}{fmt(price)}</span>
                                    <Btn variant="sm" onClick={() => ctx.cardProps.onAdd(p)}>{cta}</Btn>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function ServicesCards({ section, ctx, anchor }) {
    const title = section.settings?.title || 'Nos prestations';
    const cta = ctx.store.template?.cta || 'Réserver';
    const list = ctx.filteredProducts;
    return (
        <section className="sec" id={anchor}>
            <div className="wrap">
                <Head title={title} />
                {!list.length && <Empty ctx={ctx} filtered={ctx.selectedCategory !== 'all' || ctx.search} />}
                <div className="svgrid">
                    {list.map((p) => {
                        const { price, from } = priceOf(p);
                        const url = productUrl(ctx.store.slug, p.slug);
                        return (
                            <article key={p.id} className="svc-c">
                                <a href={url} aria-label={p.title}><Pic src={productImage(p)} alt={p.title} ar="4/3" /></a>
                                <div className="svb">
                                    <div className="row"><a href={url}><b>{p.title}</b></a><span className="pp">{from && <span className="from">dès </span>}{fmt(price)}</span></div>
                                    {p.description && <p className="mu clamp2">{p.description}</p>}
                                    <div className="row">
                                        {p.duration_minutes ? <span className="mu small">Durée : {durationLabel(p.duration_minutes)}</span> : sellingKind(ctx.store) !== 'stock' && p.lead_time_hours > 0 ? <span className="mu small">À réserver {leadTimeLabel(p.lead_time_hours)} avant</span> : <span />}
                                        <Btn variant="sm" onClick={() => ctx.cardProps.onAdd(p)}>{cta}</Btn>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export const Cats = { chips: Chips, circles: Circles, tiles: Tiles };
export const Products = { grid: Grid, list: List, carousel: Carousel, lookbook: Lookbook, specs: Specs };
export const BuilderSection = { simple: Builder };
export const Services = { list: ServicesList, cards: ServicesCards };
