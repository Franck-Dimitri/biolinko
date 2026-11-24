import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertTriangle, Copy, Eye, ImagePlus, MoreHorizontal, Package, Pencil, Percent, Plus, Trash2, X } from 'lucide-react';
import { compressImages } from '@/Utils/imageCompressor';
import { EXTRA_LABELS, productProfile } from '@/Components/Products/productProfiles';
import { Badge, Button, Empty, Field, PageHeader, SubPage, PlanLock, SearchInput, Stat, Tabs, fcfa, fieldClass, reveal } from '@/Components/Dashboard/UI';

const LOW_STOCK = 3;
const isPromo = (p) => p.is_promo && Number(p.promo_price) > 0 && Number(p.promo_price) < Number(p.price_vendor);
const blank = { title: '', description: '', category: '', seo_title: '', seo_description: '', price_vendor: '', stock: 10, min_order_quantity: 1, is_promo: false, promo_price: '', promo_start_at: '', promo_end_at: '', is_active: true, images_files: [], kept_images: [], variants: [] };

/** Aperçu et champs du résultat Google ; vides, Biolinko les remplit avec le nom, la description et le prix. */
function SeoFields({ data, setData, errors, store }) {
    const price = Number(data.is_promo && data.promo_price ? data.promo_price : data.price_vendor) || 0;
    const autoTitle = `${data.title || 'Nom du produit'} | ${store?.name || 'Ma boutique'}`;
    const plain = String(data.description || '').replace(/\s+/g, ' ').trim();
    const autoDesc = `${data.title || 'Ce produit'} à ${price.toLocaleString('fr-FR')} FCFA chez ${store?.name || 'ma boutique'}. ${plain}`.slice(0, 160);
    const title = data.seo_title || autoTitle;
    const desc = data.seo_description || autoDesc;
    const counter = (v, max) => <span className={`text-[12px] tabular-nums ${v.length > max ? 'text-[#B91C1C]' : 'text-[#8B8A83]'}`}>{v.length}/{max}</span>;
    return (
        <div className="space-y-4">
            <div className="rounded-xl bg-[#F6F5F1] p-3" aria-label="Aperçu Google">
                <p className="truncate text-[12px] text-[#5F5E58]">biolinko.app › {store?.slug || 'boutique'} › p</p>
                <p className="truncate text-[17px] leading-snug text-[#1a0dab]">{title.slice(0, 65)}{title.length > 65 ? '…' : ''}</p>
                <p className="line-clamp-2 text-[13px] text-[#4d5156]">{desc.slice(0, 160)}</p>
            </div>
            <Field label="Titre sur Google" error={errors.seo_title} hint="Laissez vide pour « Nom du produit | Boutique ». Mettez les mots que vos clients tapent.">
                <div><input maxLength={70} value={data.seo_title} onChange={(e) => setData('seo_title', e.target.value)} placeholder={autoTitle} className={fieldClass} /><div className="mt-1 text-right">{counter(data.seo_title, 60)}</div></div>
            </Field>
            <Field label="Description sur Google" error={errors.seo_description}>
                <div><textarea rows={3} maxLength={170} value={data.seo_description} onChange={(e) => setData('seo_description', e.target.value)} placeholder={autoDesc} className={`${fieldClass} h-auto py-3`} /><div className="mt-1 text-right">{counter(data.seo_description, 160)}</div></div>
            </Field>
        </div>
    );
}

// Choix d'une liste avec leur supplément : « 6 parts, 8 parts +3000, 12 parts +6000 »
const toFieldRows = (fields = []) => fields.map((f) => ({
    label: f.label || '', type: f.type || 'text', required: !!f.required,
    options_text: (f.options || []).map((o, i) => (Number(f.prices?.[i]) > 0 ? `${o} +${f.prices[i]}` : o)).join(', '),
}));
const parseOptions = (text) => text.split(',').map((o) => o.trim()).filter(Boolean).map((o) => {
    const m = o.match(/^(.*?)\s*\+\s*([\d\s  .]+)\s*(?:f|fcfa)?$/i);
    return m && m[1] ? [m[1].trim(), parseInt(m[2].replace(/\D/g, ''), 10) || 0] : [o, 0];
});

const DURATIONS = [[15, '15 min'], [30, '30 min'], [45, '45 min'], [60, '1 h'], [90, '1 h 30'], [120, '2 h'], [180, '3 h'], [240, '4 h'], [360, '6 h'], [480, 'Journée (8 h)']];
const removeBtn = 'flex h-11 w-9 shrink-0 items-center justify-center rounded-full text-[#8B8A83] hover:text-[#B91C1C]';

/** Option ouverte : titre, aide et « Retirer » (qui efface ce qu'elle contient). */
function Optional({ title, hint, onRemove, children }) {
    return (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="rounded-2xl border border-black/[0.08] p-4">
            <div className="flex items-start justify-between gap-3">
                <span className="min-w-0"><span className="block text-[15px] font-medium text-[#141412]">{title}</span>{hint && <span className="text-[13px] text-[#8B8A83]">{hint}</span>}</span>
                {onRemove && <button type="button" onClick={onRemove} className="shrink-0 text-[13px] text-[#5F5E58] underline underline-offset-4 hover:text-[#B91C1C]">Retirer</button>}
            </div>
            <div className="mt-3">{children}</div>
        </motion.section>
    );
}

/** Lignes « libellé : valeur » (caractéristiques, composition…). */
function SpecsRows({ rows, setData, ex, error }) {
    const setRow = (i, k, v) => setData('specs', rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
    return (
        <div className="space-y-2">
            {rows.map((r, i) => (
                <div key={i} className="flex gap-2">
                    <input aria-label="Libellé" value={r.label} maxLength={40} onChange={(e) => setRow(i, 'label', e.target.value)} placeholder={ex[0]} className={`${fieldClass} w-[38%]`} />
                    <input aria-label="Valeur" value={r.value} maxLength={120} onChange={(e) => setRow(i, 'value', e.target.value)} placeholder={ex[1]} className={`${fieldClass} min-w-0 flex-1`} />
                    <button type="button" aria-label="Supprimer la ligne" onClick={() => setData('specs', rows.filter((_, j) => j !== i))} className={removeBtn}><Trash2 className="h-4 w-4" /></button>
                </div>
            ))}
            {rows.length < 12 && <button type="button" onClick={() => setData('specs', [...rows, { label: '', value: '' }])} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#141412] underline-offset-4 hover:underline"><Plus className="h-3.5 w-3.5" /> Ajouter une ligne</button>}
            {error && <p className="text-[13px] text-[#B91C1C]">{error}</p>}
        </div>
    );
}

/** Questions posées au client à la commande (message sur le gâteau, mensurations…). */
function ClientFields({ data, setData, errors }) {
    const setField = (i, k, v) => setData('custom_fields', data.custom_fields.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
    const fieldError = Object.entries(errors).find(([k]) => k.startsWith('custom_fields'))?.[1];
    return (
        <div className="space-y-2">
            {data.custom_fields.map((f, i) => (
                <div key={i} className="space-y-2 rounded-2xl bg-[#F6F5F1] p-3">
                    <div className="flex gap-2">
                        <input aria-label="Question" value={f.label} maxLength={60} onChange={(e) => setField(i, 'label', e.target.value)} placeholder="Ex. Message sur le gâteau" className={`${fieldClass} min-w-0 flex-1`} />
                        <button type="button" aria-label="Supprimer la question" onClick={() => setData('custom_fields', data.custom_fields.filter((_, j) => j !== i))} className={removeBtn}><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#5F5E58]">
                        <label className="flex items-center gap-2"><input type="checkbox" checked={f.type === 'select'} onChange={(e) => setField(i, 'type', e.target.checked ? 'select' : 'text')} className="h-4 w-4 rounded border-black/20 text-[#141412] focus:ring-0" /> Le client choisit dans une liste</label>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={f.required} onChange={(e) => setField(i, 'required', e.target.checked)} className="h-4 w-4 rounded border-black/20 text-[#141412] focus:ring-0" /> Obligatoire</label>
                    </div>
                    {f.type === 'select' && (
                        <>
                            <input aria-label="Choix proposés" value={f.options_text} onChange={(e) => setField(i, 'options_text', e.target.value)} placeholder="6 parts, 8 parts +3000, 12 parts +6000" className={fieldClass} />
                            <p className="text-[12px] text-[#8B8A83]">Séparez les choix par des virgules. « +montant » ajoute un supplément au prix.</p>
                        </>
                    )}
                </div>
            ))}
            {data.custom_fields.length < 5 && <button type="button" onClick={() => setData('custom_fields', [...data.custom_fields, { label: '', type: 'text', required: false, options_text: '' }])} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#141412] underline-offset-4 hover:underline"><Plus className="h-3.5 w-3.5" /> Ajouter une question</button>}
            {fieldError && <p className="text-[13px] text-[#B91C1C]">{fieldError}</p>}
        </div>
    );
}

function ProductEditor({ product, onClose, limits, categories = [], store, template, leadTimes }) {
    const editing = !!product?.id;
    const profile = productProfile(store?.business_type);
    const madeDefault = template?.fulfillment === 'made_to_order' || !!profile.made;
    const starter = limits.plan === 'starter';
    const defaultLead = template?.lead_time_hours ?? 24;

    const initial = editing ? {
        ...blank,
        title: product.title || '', description: product.description || '', category: product.category || '', seo_title: product.seo_title || '', seo_description: product.seo_description || '', price_vendor: product.price_vendor != null ? Number(product.price_vendor) : '', stock: product.stock ?? 0,
        min_order_quantity: product.min_order_quantity || 1, is_promo: !!product.is_promo, promo_price: product.promo_price ? Number(product.promo_price) : '',
        promo_start_at: product.promo_start_at?.substring(0, 10) || '', promo_end_at: product.promo_end_at?.substring(0, 10) || '', is_active: !!product.is_active,
        kept_images: product.images?.length ? product.images : (product.image_url ? [product.image_url] : []),
        variants: (product.variants || []).map((v) => ({ id: v.id, name: v.name || '', size: v.size || '', color: v.color || '', price: v.price ? Number(v.price) : '', stock_quantity: v.stock_quantity ?? 10 })),
        fulfillment: product.fulfillment || 'stock', lead_time_hours: product.lead_time_hours ?? defaultLead, daily_capacity: product.daily_capacity ?? '',
        custom_fields: toFieldRows(product.custom_fields || []),
        duration_minutes: product.duration_minutes ?? '', specs: product.specs || [],
    } : {
        ...blank,
        // Nouveau produit : réglages du modèle de l'activité (pâtisserie → sur commande, 48 h, questions suggérées)
        fulfillment: madeDefault ? 'made_to_order' : 'stock', lead_time_hours: defaultLead, daily_capacity: '',
        custom_fields: madeDefault ? toFieldRows(template?.fields || []) : [], stock: madeDefault ? 0 : blank.stock,
        duration_minutes: '',
        // Options ouvertes d'office : une ligne vierge prête à remplir
        specs: profile.open.includes('specs') ? [{ label: '', value: '' }] : [],
        variants: profile.open.includes('variants') ? [{ name: '', size: '', color: '', price: '', stock_quantity: 10 }] : [],
    };
    const form = useForm(initial);
    const { data, setData, errors, processing } = form;
    const made = data.fulfillment === 'made_to_order';

    // Options ouvertes : celles qui ont déjà un contenu, plus celles que l'activité rend utiles d'office
    const [open, setOpen] = useState(() => {
        const d = initial;
        const s = new Set(editing ? [] : profile.open);
        if (d.variants.length) s.add('variants');
        if (d.specs.length) s.add('specs');
        if (d.custom_fields.length) s.add('client_fields');
        if (d.is_promo) s.add('promo');
        if (d.category || categories.length) s.add('category');
        if (d.seo_title || d.seo_description) s.add('seo');
        if (Number(d.min_order_quantity) > 1) s.add('min_qty');
        if (d.daily_capacity !== '' && d.daily_capacity != null) s.add('capacity');
        if (!madeDefault && d.fulfillment === 'made_to_order') s.add('made_to_order');
        if (madeDefault && d.fulfillment === 'stock') s.add('in_stock');
        return s;
    });
    const isOpen = (k) => open.has(k);
    const toggle = (k, on) => setOpen((prev) => { const s = new Set(prev); if (on) s.add(k); else s.delete(k); return s; });

    const openExtra = (k) => {
        if (k === 'variants' && !data.variants.length) setData('variants', [{ name: '', size: '', color: '', price: '', stock_quantity: 10 }]);
        if (k === 'specs' && !data.specs.length) setData('specs', [{ label: '', value: '' }]);
        if (k === 'client_fields' && !data.custom_fields.length) setData('custom_fields', template?.fields?.length ? toFieldRows(template.fields) : [{ label: '', type: 'text', required: false, options_text: '' }]);
        if (k === 'promo' && !starter) setData('is_promo', true);
        if (k === 'made_to_order') setData((d) => ({ ...d, fulfillment: 'made_to_order', lead_time_hours: d.lead_time_hours || defaultLead }));
        if (k === 'in_stock') setData((d) => ({ ...d, fulfillment: 'stock', stock: Number(d.stock) > 0 ? d.stock : 10 }));
        toggle(k, true);
    };
    const closeExtra = (k) => {
        const reset = {
            variants: { variants: [] }, specs: { specs: [] }, client_fields: { custom_fields: [] }, capacity: { daily_capacity: '' },
            promo: { is_promo: false, promo_price: '', promo_start_at: '', promo_end_at: '' }, category: { category: '' },
            seo: { seo_title: '', seo_description: '' }, min_qty: { min_order_quantity: 1 },
            made_to_order: { fulfillment: 'stock', custom_fields: [], daily_capacity: '', duration_minutes: '' }, in_stock: { fulfillment: 'made_to_order' },
        }[k];
        setData((d) => ({ ...d, ...reset }));
        setOpen((prev) => {
            const s = new Set(prev);
            s.delete(k);
            if (k === 'made_to_order') { s.delete('client_fields'); s.delete('capacity'); }
            return s;
        });
    };

    // Options proposées : celles de l'activité, plus les questions et la limite par jour dès que le produit est sur commande
    const extras = [...new Set([...profile.extras, ...(made ? ['client_fields', 'capacity'] : [])])].filter((k) => {
        if (k === 'variants') return !!profile.variants;
        if (k === 'specs') return !!profile.specs;
        if (k === 'capacity' || k === 'client_fields') return made;
        if (k === 'in_stock') return madeDefault && !profile.service;
        if (k === 'made_to_order') return !madeDefault;
        return true;
    });
    const remaining = extras.filter((k) => !isOpen(k));
    const extraLabel = (k) => (k === 'variants' ? profile.variants.title : k === 'specs' ? profile.specs.title : EXTRA_LABELS[k]);

    const [previews, setPreviews] = useState([]);
    const slots = limits.max_images - data.kept_images.length - data.images_files.length;
    const addFiles = async (e) => {
        const files = Array.from(e.target.files || []).slice(0, Math.max(0, slots));
        e.target.value = '';
        if (!files.length) return;
        setPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
        const compressed = await compressImages(files);
        setData('images_files', [...data.images_files, ...compressed]);
    };
    const removeNew = (i) => { setPreviews((p) => p.filter((_, j) => j !== i)); setData('images_files', data.images_files.filter((_, j) => j !== i)); };
    const removeKept = (url) => setData('kept_images', data.kept_images.filter((u) => u !== url));

    const setVariant = (i, k, v) => setData('variants', data.variants.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
    const addVariant = () => {
        if (starter && data.variants.length >= 1) return toast.error('Le plan Starter permet 1 variante par produit.');
        setData('variants', [...data.variants, { name: '', size: '', color: '', price: '', stock_quantity: 10 }]);
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { forceFormData: true, preserveScroll: true, onSuccess: () => { toast.success(editing ? 'Produit mis à jour' : 'Produit ajouté'); onClose(); } };
        // Un tableau vide n'est pas transmis en multipart : valeurs neutres pour « tout retirer »
        form.transform((d) => ({
            ...d,
            kept_images: d.kept_images.length ? d.kept_images : [''],
            variants: d.variants.filter((v) => v.size?.trim() || v.color?.trim()).length ? d.variants.filter((v) => v.size?.trim() || v.color?.trim()) : [{ name: '' }],
            stock: d.fulfillment === 'made_to_order' ? 0 : d.stock,
            daily_capacity: d.daily_capacity === '' ? null : d.daily_capacity,
            custom_fields: d.custom_fields.filter((f) => f.label.trim()).map((f) => {
                const o = f.type === 'select' ? parseOptions(f.options_text) : [];
                return { label: f.label.trim(), type: f.type, required: f.required ? 1 : 0, options: o.map((x) => x[0]), prices: o.map((x) => x[1]) };
            }),
            // Liste vide : une ligne vide pour que « tout retirer » soit bien transmis
            specs: d.specs.filter((r) => r.label.trim() && r.value.trim()).length ? d.specs.filter((r) => r.label.trim() && r.value.trim()) : [{ label: '', value: '' }],
            duration_minutes: d.fulfillment === 'made_to_order' ? d.duration_minutes : '',
        }));
        if (editing) form.post(route('products.update.post', product.id), opts);
        else form.post(route('products.store'), opts);
    };

    const v2 = !!profile.variants?.b;
    const sections = {
        variants: profile.variants && (
            <Optional title={profile.variants.title} hint={made ? 'Avec un prix différent si besoin.' : 'Avec un prix et un stock différents si besoin.'} onRemove={() => closeExtra('variants')}>
                <div className="space-y-2">
                    {data.variants.map((v, i) => (
                        <div key={v.id || i} className={`grid gap-2 rounded-2xl bg-[#F6F5F1] p-2.5 ${v2 ? 'grid-cols-2' : 'grid-cols-1'} ${made ? (v2 ? 'sm:grid-cols-[1fr_1fr_120px_36px]' : 'sm:grid-cols-[1fr_120px_36px]') : (v2 ? 'sm:grid-cols-[1fr_1fr_110px_80px_36px]' : 'sm:grid-cols-[1fr_120px_90px_36px]')}`}>
                            <input aria-label={profile.variants.a} value={v.size} onChange={(e) => setVariant(i, 'size', e.target.value)} placeholder={profile.variants.a} className={fieldClass} />
                            {v2 && <input aria-label={profile.variants.b} value={v.color} onChange={(e) => setVariant(i, 'color', e.target.value)} placeholder={profile.variants.b} className={fieldClass} />}
                            <input aria-label="Prix de la variante" type="number" min="0" value={v.price} onChange={(e) => setVariant(i, 'price', e.target.value)} placeholder="Même prix" className={fieldClass} />
                            {!made && <input aria-label="Stock de la variante" type="number" min="0" value={v.stock_quantity} onChange={(e) => setVariant(i, 'stock_quantity', e.target.value)} placeholder="Stock" className={fieldClass} />}
                            <button type="button" aria-label="Supprimer la variante" onClick={() => setData('variants', data.variants.filter((_, j) => j !== i))} className={removeBtn}><Trash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                    <button type="button" onClick={addVariant} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#141412] underline-offset-4 hover:underline"><Plus className="h-3.5 w-3.5" /> Ajouter</button>
                </div>
            </Optional>
        ),
        specs: profile.specs && (
            <Optional title={profile.specs.title} hint="Une information par ligne, 12 au maximum." onRemove={() => closeExtra('specs')}>
                <SpecsRows rows={data.specs} setData={setData} ex={profile.specs.ex} error={errors.specs} />
            </Optional>
        ),
        client_fields: (
            <Optional title="Infos demandées au client" hint="Posées au moment de la commande. 5 au maximum." onRemove={() => closeExtra('client_fields')}>
                <ClientFields data={data} setData={setData} errors={errors} />
            </Optional>
        ),
        capacity: (
            <Optional title="Limite de commandes par jour" hint="Au-delà, la date n’est plus proposée au client." onRemove={() => closeExtra('capacity')}>
                <input type="number" min="1" aria-label="Commandes max. par jour" value={data.daily_capacity} onChange={(e) => setData('daily_capacity', e.target.value)} placeholder="Ex. 5" className={`${fieldClass} sm:max-w-[200px]`} />
                {errors.daily_capacity && <p className="mt-2 text-[13px] text-[#B91C1C]">{errors.daily_capacity}</p>}
            </Optional>
        ),
        promo: (
            <Optional title="Promotion" hint="Prix barré et compte à rebours sur la boutique." onRemove={() => closeExtra('promo')}>
                {starter ? <PlanLock plan="Pro" text="Les promotions sont disponibles à partir du plan Pro." /> : (
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Prix promo" error={errors.promo_price}><input type="number" min="0" value={data.promo_price} onChange={(e) => setData('promo_price', e.target.value)} className={fieldClass} /></Field>
                        <Field label="Début (facultatif)"><input type="date" value={data.promo_start_at} onChange={(e) => setData('promo_start_at', e.target.value)} className={fieldClass} /></Field>
                        <Field label="Fin (facultatif)"><input type="date" value={data.promo_end_at} onChange={(e) => setData('promo_end_at', e.target.value)} className={fieldClass} /></Field>
                    </div>
                )}
            </Optional>
        ),
        category: (
            <Optional title="Catégorie" hint="Vos clients filtrent la boutique par catégorie." onRemove={categories.length ? null : () => closeExtra('category')}>
                <input list="product-categories" maxLength={60} aria-label="Catégorie" value={data.category} onChange={(e) => setData('category', e.target.value)} placeholder="Ex. Robes" className={fieldClass} />
                <datalist id="product-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                {categories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {categories.map((c) => (
                            <button key={c} type="button" onClick={() => setData('category', data.category === c ? '' : c)} className={`rounded-full border px-2.5 py-1 text-[12px] ${data.category === c ? 'border-[#141412] bg-[#141412] text-white' : 'border-black/10 text-[#5F5E58] hover:border-black/25'}`}>{c}</button>
                        ))}
                    </div>
                )}
                {errors.category && <p className="mt-2 text-[13px] text-[#B91C1C]">{errors.category}</p>}
            </Optional>
        ),
        min_qty: (
            <Optional title="Quantité minimum" hint="Pour la vente en gros ou par lot." onRemove={() => closeExtra('min_qty')}>
                <input type="number" min="1" aria-label="Quantité minimum" value={data.min_order_quantity} onChange={(e) => setData('min_order_quantity', e.target.value)} className={`${fieldClass} sm:max-w-[200px]`} />
                {errors.min_order_quantity && <p className="mt-2 text-[13px] text-[#B91C1C]">{errors.min_order_quantity}</p>}
            </Optional>
        ),
        seo: (
            <Optional title="Référencement Google" hint="Rempli automatiquement si vous ne touchez à rien." onRemove={() => closeExtra('seo')}>
                <SeoFields data={data} setData={setData} errors={errors} store={store} />
            </Optional>
        ),
    };

    return (
        <SubPage onClose={onClose} backLabel="Retour au catalogue" title={editing ? 'Modifier le produit' : 'Nouveau produit'}
            sub={editing ? product.title : 'Une photo, un nom et un prix suffisent. Le reste est facultatif.'}>
            <form id="product-form" onSubmit={submit} className="space-y-6">
                {errors.title && errors.title.length > 60 && <div className="rounded-2xl bg-red-50 p-4 text-[14px] text-[#B91C1C]">{errors.title}</div>}

                <section>
                    <div className="mb-2 flex items-baseline justify-between">
                        <span className="text-[14px] font-medium text-[#141412]">Photos</span>
                        <span className="text-[13px] text-[#8B8A83]">{data.kept_images.length + data.images_files.length} / {limits.max_images}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {data.kept_images.map((url, i) => (
                            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-[#F6F5F1]">
                                <img src={url} alt="" className="h-full w-full object-cover" />
                                {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 text-[10px] text-[#141412]">Principale</span>}
                                <button type="button" onClick={() => removeKept(url)} aria-label="Retirer la photo" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
                            </div>
                        ))}
                        {previews.map((url, i) => (
                            <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-[#F6F5F1]">
                                <img src={url} alt="" className="h-full w-full object-cover" />
                                <button type="button" onClick={() => removeNew(i)} aria-label="Retirer la photo" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90"><X className="h-3.5 w-3.5" /></button>
                            </div>
                        ))}
                        {slots > 0 && (
                            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/15 text-[12px] text-[#5F5E58] hover:border-black/30 hover:bg-[#FAFAF8]">
                                <ImagePlus className="h-5 w-5" /> Ajouter
                                <input type="file" accept="image/*" multiple onChange={addFiles} className="sr-only" />
                            </label>
                        )}
                    </div>
                    {slots <= 0 && starter && <p className="mt-2 text-[13px] text-[#8B8A83]">Plus de photos par produit avec le plan Pro.</p>}
                    {errors['images_files.0'] && <p className="mt-2 text-[13px] text-[#B91C1C]">{errors['images_files.0']}</p>}
                </section>

                <Field label="Nom" error={errors.title && errors.title.length <= 60 ? errors.title : null}>
                    <input required value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder={profile.name} className={fieldClass} />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={profile.price || 'Prix'} error={errors.price_vendor}>
                        <div className="relative"><input aria-label="Prix" required type="number" min="0" inputMode="numeric" value={data.price_vendor} onChange={(e) => setData('price_vendor', e.target.value)} className={`${fieldClass} pr-14`} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8B8A83]">FCFA</span></div>
                    </Field>
                    {made ? (
                        <Field label={profile.service ? 'Réservable dans un délai de' : 'Délai de préparation'} error={errors.lead_time_hours}>
                            <select value={data.lead_time_hours} onChange={(e) => setData('lead_time_hours', e.target.value)} className={fieldClass}>
                                {Object.entries(leadTimes || {}).map(([h, label]) => <option key={h} value={h}>{label}</option>)}
                            </select>
                        </Field>
                    ) : (
                        <Field label="Quantité en stock" error={errors.stock}>
                            <input required type="number" min="0" inputMode="numeric" value={data.stock} onChange={(e) => setData('stock', e.target.value)} className={fieldClass} />
                        </Field>
                    )}
                    {made && profile.service && (
                        <Field label="Durée (facultatif)" error={errors.duration_minutes}>
                            <select value={data.duration_minutes} onChange={(e) => setData('duration_minutes', e.target.value)} className={fieldClass}>
                                <option value="">Non précisée</option>
                                {DURATIONS.map(([m, l]) => <option key={m} value={m}>{l}</option>)}
                            </select>
                        </Field>
                    )}
                </div>
                {(isOpen('made_to_order') || isOpen('in_stock')) && (
                    <p className="-mt-3 text-[13px] text-[#5F5E58]">
                        {made ? 'Préparé à la demande : le client choisit une date.' : 'Article déjà prêt : le stock baisse à chaque vente.'}{' '}
                        <button type="button" onClick={() => closeExtra(made ? 'made_to_order' : 'in_stock')} className="underline underline-offset-4 hover:text-[#141412]">{made ? 'Repasser en stock' : 'Repasser sur commande'}</button>
                    </p>
                )}

                <Field label="Description (facultatif)" error={errors.description}>
                    <textarea rows={3} value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder={profile.desc} className={`${fieldClass} h-auto py-3`} />
                </Field>

                {['variants', 'specs', 'client_fields', 'capacity', 'promo', 'category', 'min_qty', 'seo'].filter(isOpen).map((k) => sections[k] && <div key={k}>{sections[k]}</div>)}

                {remaining.length > 0 && (
                    <div>
                        <p className="mb-2 text-[14px] font-medium text-[#141412]">Ajouter si besoin</p>
                        <div className="flex flex-wrap gap-2">
                            {remaining.map((k) => (
                                <button key={k} type="button" onClick={() => openExtra(k)} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 text-[13.5px] text-[#141412] transition-colors hover:border-black/30 active:scale-[0.98]">
                                    <Plus className="h-3.5 w-3.5" /> {extraLabel(k)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <label className="flex items-center justify-between gap-3 border-t border-black/[0.06] pt-5">
                    <span><span className="block text-[14px] font-medium text-[#141412]">Visible sur la boutique</span><span className="text-[13px] text-[#8B8A83]">Décochez pour le masquer sans le supprimer.</span></span>
                    <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="h-5 w-5 rounded border-black/20 text-[#141412] focus:ring-0" />
                </label>
            </form>

            <div className="sticky bottom-0 -mx-1 mt-6 flex justify-end gap-2 border-t border-black/[0.06] bg-white px-1 py-4">
                <Button onClick={onClose}>Annuler</Button>
                <Button variant="primary" type="submit" form="product-form" disabled={processing}>{editing ? 'Enregistrer' : 'Ajouter le produit'}</Button>
            </div>
        </SubPage>
    );
}

function ProductCard({ product, store, onEdit, index }) {
    const [menu, setMenu] = useState(false);
    // Menu « … » : se ferme au toucher ailleurs ou avec Échap (le survol n'existe pas sur téléphone)
    useEffect(() => {
        if (!menu) return undefined;
        const close = () => setMenu(false);
        const onKey = (e) => e.key === 'Escape' && close();
        const t = setTimeout(() => document.addEventListener('click', close), 0);
        document.addEventListener('keydown', onKey);
        return () => { clearTimeout(t); document.removeEventListener('click', close); document.removeEventListener('keydown', onKey); };
    }, [menu]);
    const promo = isPromo(product);
    const made = product.fulfillment === 'made_to_order';
    const low = !product.example_of && !made && Number(product.stock) <= LOW_STOCK;
    const url = `${window.location.origin}/${store.slug}/p/${product.slug}`;
    const image = product.image_url || product.images?.[0];

    const remove = () => {
        if (!confirm(product.example_of ? `Supprimer l’exemple « ${product.title} » ?` : `Supprimer « ${product.title} » ? Cette action est définitive.`)) return;
        router.delete(route('products.destroy', product.id), { preserveScroll: true, onSuccess: () => toast.success('Produit supprimé') });
    };
    const copy = async () => { try { await navigator.clipboard.writeText(url); toast.success('Lien du produit copié'); } catch (e) { /* indisponible */ } setMenu(false); };

    return (
        <motion.article {...reveal(Math.min(index, 10) * 0.03)} className={`group relative flex flex-col rounded-3xl border border-black/[0.06] bg-white ${menu ? 'z-20' : ''} ${product.is_active || product.example_of ? '' : 'opacity-70'}`}>
            <button type="button" onClick={onEdit} className="relative aspect-[4/3] overflow-hidden rounded-t-3xl bg-[#F6F5F1]">
                {image ? <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <Package className="m-auto h-8 w-8 text-[#8B8A83]" />}
                <span className="absolute left-3 top-3 flex gap-1.5">
                    {product.example_of ? <Badge tone="warning">Exemple</Badge> : !product.is_active && <Badge>Masqué</Badge>}
                    {promo && <Badge tone="brand">−{Math.round((1 - product.promo_price / product.price_vendor) * 100)} %</Badge>}
                </span>
            </button>
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-[15px] font-medium text-[#141412]">{product.title}</h3>
                    <div className="relative shrink-0">
                        <button type="button" onClick={() => setMenu((v) => !v)} aria-label="Plus d’actions" className="flex h-8 w-8 items-center justify-center rounded-full text-[#5F5E58] hover:bg-black/5"><MoreHorizontal className="h-4 w-4" /></button>
                        <AnimatePresence>
                            {menu && (
                                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onMouseLeave={() => setMenu(false)}
                                    className="absolute right-0 top-9 z-10 w-48 rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-lg">
                                    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-[14px] text-[#141412] hover:bg-[#F6F5F1]"><Eye className="h-4 w-4" /> Voir sur la boutique</a>
                                    <button type="button" onClick={copy} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[14px] text-[#141412] hover:bg-[#F6F5F1]"><Copy className="h-4 w-4" /> Copier le lien</button>
                                    <button type="button" onClick={() => { setMenu(false); remove(); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[14px] text-[#B91C1C] hover:bg-red-50"><Trash2 className="h-4 w-4" /> Supprimer</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-[16px] font-medium tabular-nums text-[#141412]">{fcfa(promo ? product.promo_price : product.price_vendor)}</span>
                    {promo && <span className="text-[13px] tabular-nums text-[#8B8A83] line-through">{Number(product.price_vendor).toLocaleString('fr-FR')}</span>}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4 text-[13px]">
                    <span className={low || product.example_of ? 'flex items-center gap-1 text-[#B45309]' : 'text-[#8B8A83]'}>
                        {product.example_of ? 'Exemple : modifiez-le puis rendez-le visible' : <>{low && <AlertTriangle className="h-3.5 w-3.5" />}{made ? 'Sur commande' : Number(product.stock) === 0 ? 'Épuisé' : `${product.stock} en stock`}</>}
                        {product.variants?.length ? ` · ${product.variants.length} variante${product.variants.length > 1 ? 's' : ''}` : ''}
                    </span>
                    <Button size="sm" variant="ghost" onClick={onEdit}><Pencil className="h-4 w-4" /> Modifier</Button>
                </div>
                {product.example_of && (
                    <button type="button" onClick={remove} className="mt-3 flex h-10 items-center justify-center gap-2 rounded-full border border-black/10 text-[13.5px] text-[#B91C1C] hover:border-red-200 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" /> Supprimer cet exemple
                    </button>
                )}
            </div>
        </motion.article>
    );
}

export default function Index({ store, products = [], metrics, planLimits, template, leadTimes }) {
    const [editing, setEditing] = useState(null); // null | {} (nouveau) | produit
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const limits = { max_products: 10, max_stock: 25, max_images: 2, plan: 'starter', ...planLimits };
    // Les produits d'exemple ne comptent pas dans la limite du plan
    const examples = products.filter((p) => p.example_of);
    const ownCount = products.length - examples.length;
    const atLimit = ownCount >= limits.max_products;
    const removeExamples = () => {
        if (!confirm(`Supprimer les ${examples.length} produits d’exemple ? Vos propres produits ne sont pas touchés.`)) return;
        router.delete(route('products.examples.destroy'), { preserveScroll: true, onSuccess: () => toast.success('Produits d’exemple supprimés') });
    };

    const counts = useMemo(() => ({
        active: products.filter((p) => p.is_active).length,
        promo: products.filter(isPromo).length,
        low: products.filter((p) => !p.example_of && p.fulfillment !== 'made_to_order' && Number(p.stock) <= LOW_STOCK).length,
        hidden: products.filter((p) => !p.is_active).length,
    }), [products]);

    const shown = products.filter((p) => {
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (tab === 'promo') return isPromo(p);
        if (tab === 'low') return !p.example_of && p.fulfillment !== 'made_to_order' && Number(p.stock) <= LOW_STOCK;
        if (tab === 'hidden') return !p.is_active;
        return true;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Produits, Biolinko" />
            {editing && <ProductEditor key={editing.id || 'new'} product={editing} limits={limits} store={store} template={template} leadTimes={leadTimes} categories={[...new Set(products.map((p) => p.category).filter(Boolean))].sort()} onClose={() => setEditing(null)} />}
            <div className="space-y-6 pb-12" hidden={!!editing}>
                <PageHeader title="Produits" sub="Votre catalogue, vos prix, vos stocks et vos promotions."
                    actions={<Button variant="primary" onClick={() => setEditing({})} disabled={atLimit}><Plus className="h-4 w-4" /> Nouveau produit</Button>} />

                {examples.length > 0 && (
                    <div className="flex flex-col gap-3 rounded-2xl border border-[#FFCC00]/60 bg-[#FFFBEA] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[14px] text-[#141412]">
                            <span className="font-medium">{examples.length > 1 ? `${examples.length} produits d’exemple` : '1 produit d’exemple'}</span> pour vous inspirer. Modifiez-les pour en faire vos produits, ou supprimez-les. Ils ne comptent pas dans votre limite et restent invisibles pour vos clients.
                        </p>
                        {examples.length > 1 && <Button onClick={removeExamples} className="shrink-0"><Trash2 className="h-4 w-4" /> Supprimer tous les exemples</Button>}
                    </div>
                )}

                {atLimit && <PlanLock plan={limits.plan === 'starter' ? 'Pro' : 'Growth'} text={`Vous avez atteint la limite de ${limits.max_products} produits de votre plan.`} />}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Produits" value={`${ownCount} / ${limits.max_products > 9999 ? '∞' : limits.max_products}`} hint={`${counts.active} visible${counts.active > 1 ? 's' : ''} sur la boutique`} Icon={Package} delay={0.03} />
                    <Stat label="Valeur du stock" value={fcfa(metrics?.totalStockValue)} hint="Prix × quantités" Icon={Package} delay={0.06} />
                    <Stat label="Stock faible" value={counts.low} hint={`${LOW_STOCK} unités ou moins`} Icon={AlertTriangle} accent={counts.low > 0} delay={0.09} />
                    <Stat label="En promotion" value={counts.promo} Icon={Percent} delay={0.12} />
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <Tabs id="products" value={tab} onChange={setTab} tabs={[['all', 'Tous', products.length], ['promo', 'En promotion', counts.promo], ['low', 'Stock faible', counts.low], ['hidden', 'Masqués', counts.hidden]]} />
                    <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un produit" className="lg:w-72" />
                </div>

                {shown.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {shown.map((p, i) => <ProductCard key={p.id} product={p} store={store} index={i} onEdit={() => setEditing(p)} />)}
                    </div>
                ) : (
                    <Empty Icon={Package} title={products.length ? 'Aucun produit ici' : 'Ajoutez votre premier produit'}
                        text={products.length ? 'Essayez un autre filtre ou une autre recherche.' : 'Une photo, un nom et un prix suffisent pour commencer à vendre.'}
                        action={!products.length && <Button variant="primary" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Nouveau produit</Button>} />
                )}
            </div>

        </AuthenticatedLayout>
    );
}
