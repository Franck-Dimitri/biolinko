import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    ArrowDown, ArrowLeft, ArrowUp, Check, ChevronRight, ExternalLink, Eye, EyeOff, History, ImagePlus, LayoutTemplate, Monitor, Palette,
    Plus, RotateCcw, Rows3, Smartphone, Star, Store, Trash2, X,
} from 'lucide-react';
import { useForm } from '@inertiajs/react';
import OpeningScheduleEditor from '@/Components/Seller/OpeningScheduleEditor';
import SlugField, { useSlugCheck } from '@/Components/Store/SlugField';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Badge, Button } from '@/Components/Dashboard/UI';
import { PatternLayer, patternLabel } from '@/Components/Storefront/patterns';
import { contrastColor } from '@/Components/Storefront/theme';
import { PREVIEW_READY, SECTION_CLICK, selectInPreview, sendPreview } from '@/Components/Storefront/livePreview';

/*
 * Éditeur de vitrine : aperçu téléphone ou ordinateur, clic sur une section pour la modifier,
 * sections (ordre, visibilité, disposition, réglages), style (palettes, couleur, polices, arrondis, motif),
 * changement de template sans perte de contenu, brouillon automatique, publication et historique.
 */

const PALETTES = [
    ['Biolinko', { background: '#FFFFFF', surface: '#F6F5F1', ink: '#141412', muted: '#5F5E58', line: '#EAE8E2', primary: '#FFCC00', accent: '#B38F00', tint: '#FFF3C2', tint_strong: '#FFE07A', tint_ink: '#7A6100' }],
    ['Rose poudré', { background: '#FFF7F5', surface: '#FFFFFF', ink: '#3A1F2B', muted: '#8A6B76', line: '#F1DCE1', primary: '#C93A6B', accent: '#C93A6B', tint: '#FBD9E2', tint_strong: '#F4B9C9', tint_ink: '#9E2E55' }],
    ['Chocolat et or', { background: '#2A1A14', surface: '#35231A', ink: '#F6E9DA', muted: '#C7AE95', line: '#4A3226', primary: '#E7C08A', accent: '#E7C08A', tint: '#4A2E22', tint_strong: '#6E4733', tint_ink: '#E7C08A' }],
    ['Forêt', { background: '#F3EFE6', surface: '#FBF8F1', ink: '#1F2B22', muted: '#5F6B60', line: '#DCD5C5', primary: '#1F3A2B', accent: '#A87C2F', tint: '#DDE7DC', tint_strong: '#C3D6C4', tint_ink: '#1F3A2B' }],
    ['Océan', { background: '#F4F8FB', surface: '#FFFFFF', ink: '#0F1E2E', muted: '#5B6B7B', line: '#DCE6EE', primary: '#1D5FD1', accent: '#0EA5E9', tint: '#DCEBFF', tint_strong: '#B9D6FF', tint_ink: '#1D4ED8' }],
    ['Terre cuite', { background: '#FBF5EF', surface: '#FFFFFF', ink: '#2E1D14', muted: '#7A6355', line: '#EBDCCF', primary: '#C2410C', accent: '#15803D', tint: '#FDE3D2', tint_strong: '#F9C6A6', tint_ink: '#9A3412' }],
    ['Nuit', { background: '#0F1115', surface: '#181B22', ink: '#F2F3F5', muted: '#9AA0AA', line: '#2A2F38', primary: '#22C55E', accent: '#22C55E', tint: '#1C2A22', tint_strong: '#234A33', tint_ink: '#86EFAC' }],
];
const FONT_PAIRS = [
    ['Fraunces', 'DM Sans', 600], ['Playfair Display', 'Manrope', 600], ['Cormorant Garamond', 'Jost', 500], ['Bricolage Grotesque', 'Bricolage Grotesque', 800],
    ['Outfit', 'Outfit', 700], ['Space Grotesk', 'Inter', 600], ['Poppins', 'Poppins', 600],
];
const SHAPES = [['Carré', 2, 2], ['Doux', 14, 12], ['Rond', 22, 999]];
const INTENSITIES = [['none', 'Aucun'], ['soft', 'Discret'], ['bold', 'Marqué']];
// Étapes, dans l'ordre : activité, template, personnalisation, informations, avis
const STEPS = [['activite', 'Activité'], ['template', 'Template'], ['personnaliser', 'Personnaliser'], ['infos', 'Infos'], ['avis', 'Avis']];
const TABS = [...STEPS, ['versions', 'Versions']];

const clone = (o) => JSON.parse(JSON.stringify(o));
const fontsLink = (pairs) => `https://fonts.googleapis.com/css2?${[...new Set(pairs.flat().filter((f) => typeof f === 'string' && f !== 'Poppins'))].map((f) => `family=${f.replace(/ /g, '+')}`).join('&')}&display=swap`;

/* ------------------------------------------------------------------ Champs de réglages (générés depuis le catalogue) */

function SettingField({ name, field, value, onChange, products, variant }) {
    if (field.variants && !field.variants.includes(variant)) return null;
    const cls = 'w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[14px] text-[#141412] focus:border-black/30 focus:ring-0';
    const label = <span className="mb-1 block text-[13px] font-medium text-[#141412]">{field.label}</span>;
    if (field.type === 'boolean') {
        return <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked || undefined)} className="h-4 w-4 rounded border-black/20 focus:ring-0" /> {field.label}</label>;
    }
    if (field.type === 'textarea') return <label className="block">{label}<textarea rows={3} maxLength={field.max} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Texte par défaut de la boutique" className={cls} /></label>;
    if (field.type === 'number') return <label className="block">{label}<input type="number" min={field.min} max={field.max} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? undefined : Math.max(field.min, Math.min(field.max, parseInt(e.target.value, 10) || field.min)))} placeholder="Par défaut" className={cls} /></label>;
    if (field.type === 'product') {
        return (
            <label className="block">{label}
                <select value={value || ''} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)} className={cls}>
                    <option value="">Automatique (premier produit personnalisable)</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
            </label>
        );
    }
    if (field.type === 'image') return <ImageField label={label} value={value} onChange={onChange} />;
    if (field.type === 'list') {
        const items = Array.isArray(value) ? value : [];
        const setItem = (i, k, v) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
        return (
            <div>
                {label}
                <div className="space-y-2">
                    {items.map((it, i) => (
                        <div key={i} className="space-y-1.5 rounded-xl bg-[#F6F5F1] p-2.5">
                            {Object.entries(field.fields).map(([k, f]) => (
                                f.type === 'textarea'
                                    ? <textarea key={k} rows={2} maxLength={f.max} value={it[k] || ''} onChange={(e) => setItem(i, k, e.target.value)} placeholder={f.label} className={cls} />
                                    : <input key={k} maxLength={f.max} value={it[k] || ''} onChange={(e) => setItem(i, k, e.target.value)} placeholder={f.label} className={cls} />
                            ))}
                            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-[12px] text-[#B91C1C]">Retirer</button>
                        </div>
                    ))}
                    {items.length < field.max && (
                        <button type="button" onClick={() => onChange([...items, {}])} className="inline-flex items-center gap-1 text-[13px] font-medium text-[#141412]"><Plus className="h-4 w-4" /> Ajouter</button>
                    )}
                    {!items.length && <p className="text-[12px] text-[#8B8A83]">Vide : les textes proposés par Biolinko s’affichent.</p>}
                </div>
            </div>
        );
    }
    return <label className="block">{label}<input maxLength={field.max} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="Texte par défaut de la boutique" className={cls} /></label>;
}

function ImageField({ label, value, onChange }) {
    const [busy, setBusy] = useState(false);
    const upload = async (file) => {
        if (!file) return;
        setBusy(true);
        try {
            const body = new FormData();
            body.append('image', file);
            const { data } = await axios.post(route('seller.editor.image'), body);
            onChange(data.path);
        } catch (e) {
            toast.error(e.response?.data?.message || 'La photo n’a pas pu être envoyée.');
        } finally {
            setBusy(false);
        }
    };
    return (
        <div>
            {label}
            <div className="flex items-center gap-3">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F6F5F1]">
                    {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-[#8B8A83]" />}
                </span>
                <label className="cursor-pointer rounded-full border border-black/15 px-3 py-2 text-[13px] font-medium hover:border-black/40">
                    {busy ? 'Envoi…' : value ? 'Changer' : 'Choisir une photo'}
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
                </label>
                {value && <button type="button" onClick={() => onChange(undefined)} className="text-[13px] text-[#B91C1C]">Retirer</button>}
            </div>
            {!value && <p className="mt-1 text-[12px] text-[#8B8A83]">Sans photo : votre bannière ou un de vos produits.</p>}
        </div>
    );
}

/* ------------------------------------------------------------------ Infos de la boutique */

const inputCls = 'w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[14px] text-[#141412] focus:border-black/30 focus:ring-0';

function Row({ label, hint, error, children }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[13px] font-medium text-[#141412]">{label}</span>
            {children}
            {hint && !error && <span className="mt-1 block text-[12px] text-[#8B8A83]">{hint}</span>}
            {error && <span className="mt-1 block text-[12px] text-[#B91C1C]">{error}</span>}
        </label>
    );
}

/** Nom, adresse, activité, logo, coordonnées, horaires : enregistrés tout de suite (pas de brouillon). */
function InfoPanel({ info, activities, onSaved, bind, onDirty }) {
    const form = useForm({
        name: info.name || '', slug: info.slug || '', business_type: info.business_type || '', description: info.description || '', about_text: info.about_text || '',
        phone_whatsapp: info.phone_whatsapp || '', city_location: info.city_location || '', location_address: info.location_address || '',
        opening_hours: info.opening_hours || '', opening_schedule: info.opening_schedule || null, min_order_amount: info.min_order_amount ?? '',
        instagram_link: info.instagram_link || '', tiktok_link: info.tiktok_link || '', facebook_link: info.facebook_link || '', support_email: info.support_email || '',
        theme_color: info.theme_color || '#FFCC00', logo_file: null, banner_file: null,
    });
    const { data, setData, errors, processing } = form;
    const slugCheck = useSlugCheck(data.slug, info.slug);
    const set = (k) => (e) => setData(k, e.target.value);
    // Enregistrées par la barre unique « Publier » de la page (promesse : true si tout s'est bien passé)
    const save = (e) => new Promise((resolve) => {
        e?.preventDefault?.();
        // L'activité se choisit à l'étape 1 : on renvoie toujours la valeur à jour
        form.transform((d) => ({ ...d, business_type: info.business_type || '', opening_schedule: JSON.stringify(d.opening_schedule || {}) }));
        form.post(route('appearance.update'), {
            forceFormData: true, preserveScroll: true, preserveState: true,
            onSuccess: () => { setData((d) => ({ ...d, logo_file: null, banner_file: null })); form.setDefaults(); onSaved(); resolve(true); },
            onError: () => { toast.error('Vérifiez les champs signalés dans l’onglet Infos.'); resolve(false); },
        });
    });
    const dirtyInfo = form.isDirty || !!data.logo_file || !!data.banner_file;
    useEffect(() => { onDirty?.(dirtyInfo); }, [dirtyInfo]);
    if (bind) bind.current = save;
    const file = (k, current, label) => (
        <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F6F5F1]">
                {data[k] ? <img src={URL.createObjectURL(data[k])} alt="" className="h-full w-full object-cover" /> : current ? <img src={current} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-[#8B8A83]" />}
            </span>
            <label className="cursor-pointer rounded-full border border-black/15 px-3 py-2 text-[13px] font-medium hover:border-black/40">
                {current || data[k] ? 'Changer' : label}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => setData(k, e.target.files?.[0] || null)} />
            </label>
        </div>
    );
    return (
        <form onSubmit={save} className="space-y-5">
            <p className="text-[13px] text-[#5F5E58]">Ces informations s’affichent sur toute la boutique. Elles sont enregistrées avec le bouton « Publier » en haut de la page.</p>
            <Row label="Nom de la boutique" error={errors.name}><input value={data.name} onChange={set('name')} maxLength={60} className={inputCls} /></Row>
            <Row label="Adresse de la boutique" error={errors.slug}>
                <SlugField value={data.slug} current={info.slug} check={slugCheck} size="sm" id="info_slug" onChange={(v) => setData('slug', v)} />
            </Row>
            <div className="grid gap-3">
                <span className="text-[13px] font-medium">Logo</span>{file('logo_file', info.logo_url, 'Ajouter un logo')}
                <span className="text-[13px] font-medium">Photo d’accueil (bannière)</span>{file('banner_file', info.banner_url, 'Ajouter une photo')}
            </div>
            <Row label="En une phrase" hint="Sous le nom de la boutique et sur Google." error={errors.description}><textarea rows={2} value={data.description} onChange={set('description')} className={inputCls} /></Row>
            <Row label="À propos" hint="Votre histoire, en quelques phrases." error={errors.about_text}><textarea rows={4} value={data.about_text} onChange={set('about_text')} className={inputCls} /></Row>
            <Row label="WhatsApp de la boutique" hint="Pour vous prévenir des commandes ; affiché en pied de page." error={errors.phone_whatsapp}><input type="tel" value={data.phone_whatsapp} onChange={set('phone_whatsapp')} placeholder="+237 6XX XX XX XX" className={inputCls} /></Row>
            <div className="grid grid-cols-2 gap-3">
                <Row label="Ville" error={errors.city_location}><input value={data.city_location} onChange={set('city_location')} className={inputCls} /></Row>
                <Row label="Commande minimum" error={errors.min_order_amount}><input type="number" min="0" step="500" value={data.min_order_amount} onChange={set('min_order_amount')} placeholder="Aucune" className={inputCls} /></Row>
            </div>
            <Row label="Adresse ou point de repère (facultatif)" error={errors.location_address}><input value={data.location_address} onChange={set('location_address')} className={inputCls} /></Row>
            <div>
                <span className="mb-2 block text-[13px] font-medium">Horaires d’ouverture</span>
                <OpeningScheduleEditor value={data.opening_schedule} onChange={(v) => setData('opening_schedule', v)} />
            </div>
            {[['instagram_link', 'Instagram'], ['tiktok_link', 'TikTok'], ['facebook_link', 'Facebook']].map(([k, l]) => (
                <Row key={k} label={l} error={errors[k]}><input value={data[k]} onChange={set(k)} placeholder="https://…" className={inputCls} /></Row>
            ))}
        </form>
    );
}

/** Avis des clients : afficher ou masquer sur la boutique, supprimer. */
function ReviewsPanel({ reviews }) {
    if (!reviews.length) return <p className="text-[13px] text-[#8B8A83]">Aucun avis pour le moment. Ils apparaîtront ici dès vos premières commandes.</p>;
    return (
        <div className="space-y-2">
            <p className="text-[13px] text-[#5F5E58]">Choisissez les avis affichés sur votre boutique.</p>
            {reviews.map((r) => (
                <div key={r.id} className={`rounded-xl border p-3 ${r.is_featured ? 'border-black/[0.08]' : 'border-dashed border-black/15 opacity-70'}`}>
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-[14px] font-medium">{r.customer_name} <span className="text-[#F5B800]">{'★'.repeat(r.rating)}</span></p>
                            <p className="text-[12px] text-[#8B8A83]">{[r.customer_city, r.product?.title, r.is_verified ? 'Commande vérifiée' : null].filter(Boolean).join(' · ')}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                            <button type="button" onClick={() => router.patch(route('appearance.reviews.toggle', r.id), {}, { preserveScroll: true, preserveState: true })}
                                aria-label={r.is_featured ? 'Masquer de la boutique' : 'Afficher sur la boutique'} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5">
                                {r.is_featured ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                            <button type="button" onClick={() => { if (window.confirm('Supprimer cet avis ?')) router.delete(route('appearance.reviews.destroy', r.id), { preserveScroll: true, preserveState: true }); }}
                                aria-label="Supprimer l’avis" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B91C1C] hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    </div>
                    <p className="mt-1.5 text-[13px] text-[#141412] [overflow-wrap:anywhere]">{r.comment}</p>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ Éditeur */

export default function Editor({ store, info = {}, activities = {}, reviews = [], draft: initialDraft, published, catalog, patterns = [], templates = [], products = [], versions = [] }) {
    const [draft, setDraft] = useState(initialDraft);
    const initialTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('onglet') : null;
    const legacyTabs = { sections: 'personnaliser', style: 'personnaliser', templates: 'template', history: 'versions' };
    const wanted = legacyTabs[initialTab] || initialTab;
    const [tab, setTab] = useState(TABS.some(([k]) => k === wanted) ? wanted
        : !info.business_type ? 'activite' : !published ? 'template' : 'personnaliser');
    const [sub, setSub] = useState(initialTab === 'style' ? 'style' : 'sections'); // Personnaliser : sections ou style
    const [previewOpen, setPreviewOpen] = useState(false);
    const [frameKey, setFrameKey] = useState(0);
    const [selected, setSelected] = useState(null);
    const [device, setDevice] = useState('phone');
    const [save, setSave] = useState('saved'); // saved | saving | error
    const [saveError, setSaveError] = useState('');
    const [adding, setAdding] = useState(false);
    const frame = useRef(null);
    const box = useRef(null);
    const [boxWidth, setBoxWidth] = useState(800);
    const first = useRef(true);
    const dirty = JSON.stringify(draft) !== JSON.stringify(published);

    const update = (fn) => setDraft((d) => { const next = clone(d); fn(next); return next; });
    const setStyle = (patch) => update((d) => { Object.assign(d.style, patch); });
    const sectionIndex = draft.sections.findIndex((s) => s.id === selected);
    const section = draft.sections[sectionIndex];

    // Brouillon enregistré automatiquement (rien ne change pour les clients avant « Publier »)
    useEffect(() => {
        if (first.current) { first.current = false; return undefined; }
        setSave('saving');
        const t = setTimeout(() => {
            axios.put(route('seller.editor.draft'), { design: draft })
                .then(() => { setSave('saved'); setSaveError(''); })
                .catch((e) => { setSave('error'); setSaveError(Object.values(e.response?.data?.errors || {})[0]?.[0] || 'Enregistrement impossible.'); });
        }, 900);
        return () => clearTimeout(t);
    }, [draft]);

    // Aperçu : la vitrine reçoit le brouillon ; un clic dans l'aperçu sélectionne la section
    const push = () => sendPreview(frame.current, { storefront_design: draft });
    useEffect(() => { push(); }, [draft]);
    useEffect(() => {
        const onMessage = (e) => {
            if (e.origin !== window.location.origin) return;
            if (e.data?.type === PREVIEW_READY) { push(); selectInPreview(frame.current, selected, false); }
            if (e.data?.type === SECTION_CLICK) { setSelected(e.data.id); setTab('personnaliser'); setSub('sections'); }
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    });
    useEffect(() => { selectInPreview(frame.current, selected); }, [selected]);
    useEffect(() => {
        const ro = new ResizeObserver(([e]) => setBoxWidth(e.contentRect.width));
        if (box.current) ro.observe(box.current);
        return () => ro.disconnect();
    }, []);

    const move = (i, dir) => update((d) => {
        const j = i + dir;
        if (j < 0 || j >= d.sections.length) return;
        [d.sections[i], d.sections[j]] = [d.sections[j], d.sections[i]];
    });
    const sells = (sections) => sections.some((s) => ['products', 'services'].includes(s.type) && s.enabled);
    const toggle = (i) => update((d) => {
        const next = !d.sections[i].enabled;
        d.sections[i].enabled = next;
        if (!sells(d.sections)) { d.sections[i].enabled = true; toast.error('Gardez au moins une section Produits ou Prestations visible.'); }
    });
    const remove = (i) => update((d) => {
        const s = d.sections[i];
        if (catalog[s.type]?.required) { toast.error('L’en-tête et le pied de page sont obligatoires.'); return; }
        const rest = d.sections.filter((_, j) => j !== i);
        if (!sells(rest)) { toast.error('Gardez au moins une section Produits ou Prestations.'); return; }
        d.sections = rest;
        setSelected(null);
    });
    const add = (type) => update((d) => {
        const n = d.sections.filter((s) => s.type === type).length;
        const id = n ? `${type}-${Date.now().toString(36)}` : type;
        const variant = Object.keys(catalog[type].variants).find((v) => v !== 'classic') || Object.keys(catalog[type].variants)[0];
        const footer = d.sections.findIndex((s) => s.type === 'footer');
        d.sections.splice(footer > -1 ? footer : d.sections.length, 0, { id, type, variant, enabled: true, settings: {} });
        setSelected(id);
        setAdding(false);
    });
    const setSetting = (key, value) => update((d) => {
        const s = d.sections[sectionIndex];
        s.settings = { ...(s.settings || {}) };
        if (value === undefined || value === '' || (Array.isArray(value) && !value.length)) delete s.settings[key];
        else s.settings[key] = value;
    });

    // Changer de template : style, motif et sections du template ; les réglages déjà saisis sont gardés par type
    const applyTemplate = (t) => update((d) => {
        const kept = Object.fromEntries(d.sections.filter((s) => Object.keys(s.settings || {}).length).map((s) => [s.type, s.settings]));
        const next = clone(t.design);
        next.sections = next.sections.map((s) => ({ ...s, settings: Object.keys(s.settings || {}).length ? s.settings : (kept[s.type] || {}) }));
        Object.assign(d, next);
        setSelected(null);
        toast.success(`Template « ${t.name} » choisi`, { description: 'Personnalisez-le, puis publiez pour le mettre en ligne. Vos produits et vos textes sont gardés.' });
    });

    // Une seule action pour tout : informations enregistrées, puis vitrine publiée si elle a changé
    const infoSave = useRef(null);
    const [infoDirty, setInfoDirty] = useState(false);
    const pending = infoDirty || dirty || !published;
    const publishAll = async () => {
        if (infoDirty) {
            const ok = await infoSave.current?.();
            if (!ok) { setTab('infos'); return; }
            if (!dirty && published) { toast.success('Informations enregistrées'); return; }
        }
        publish();
    };
    const publish = () => router.post(route('seller.editor.publish'), { design: draft }, {
        preserveScroll: true, preserveState: true,
        onSuccess: () => toast.success('Votre vitrine est publiée'),
        onError: (e) => toast.error(Object.values(e)[0] || 'Publication impossible.'),
    });
    const reset = () => { if (published && window.confirm('Revenir à la version en ligne ? Les modifications non publiées seront perdues.')) setDraft(clone(published)); };
    const restore = (v) => {
        if (!window.confirm('Remettre en ligne cette version ? La version actuelle sera gardée dans l’historique.')) return;
        router.post(route('seller.editor.restore', v.id), {}, { onSuccess: () => { toast.success('Version remise en ligne'); router.reload(); } });
    };

    const existing = useMemo(() => new Set(draft.sections.map((s) => s.type)), [draft.sections]);
    const chooseActivity = (key) => router.post(route('seller.editor.activity'), { business_type: key }, {
        preserveScroll: true, preserveState: true, onSuccess: () => setTab('template'),
    });
    const scale = device === 'phone' ? Math.min(1, (boxWidth - 32) / 390) : Math.min(1, (boxWidth - 32) / 1280);
    const width = device === 'phone' ? 390 : 1280;
    const height = device === 'phone' ? 844 : 800;
    const st = draft.style;

    const status = save === 'saving' ? 'Enregistrement du brouillon…' : save === 'error' ? saveError
        : !published ? (draft.template === 'classique' ? 'Suivez les étapes : activité, template, puis personnalisez.' : 'Votre template est prêt : publiez-le pour le mettre en ligne.')
            : infoDirty ? 'Informations modifiées, pas encore enregistrées'
                : dirty ? 'Modifications enregistrées, pas encore publiées' : 'Votre boutique en ligne est à jour';

    return (
        <AuthenticatedLayout>
            <Head title="Ma boutique">{<link rel="stylesheet" href={fontsLink(FONT_PAIRS.map((p) => [p[0], p[1]]))} />}</Head>
            <div className="grid gap-6 pb-6 xl:grid-cols-[530px_1fr]">
                {/* Réglages */}
                <div className="min-w-0">
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                            <h1 className="text-[28px] font-medium tracking-[-0.03em] text-[#141412]">Ma boutique</h1>
                            <p className="mt-1 text-[15px] text-[#5F5E58]">Choisissez votre activité et votre template, puis personnalisez : l’aperçu change en direct.</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <Button size="sm" variant="dark" onClick={() => setPreviewOpen(true)} className="xl:hidden"><Eye className="h-4 w-4" /> Aperçu</Button>
                            <Button size="sm" href={store.public_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Ouvrir ma boutique</Button>
                        </div>
                    </div>

                    {/* Publication : rien ne change pour les clients avant « Publier » */}
                    {/* Barre de publication et étapes : toujours visibles en défilant */}
                    <div className="sticky top-16 z-20 -mx-1 mb-2 bg-[#FAFAF8] px-1 pt-2">
                    <div className={`mb-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 ${pending ? 'border-[#FFCC00]/70 bg-[#FFFBEA]' : 'border-black/[0.06] bg-white'}`}>
                        <p className={`flex items-center gap-2 text-[14px] ${save === 'error' ? 'text-[#B91C1C]' : pending ? 'text-[#141412]' : 'text-[#15803D]'}`} aria-live="polite">
                            {!pending && save !== 'error' && <Check className="h-4 w-4 shrink-0" />}{status}
                        </p>
                        {/* Le bouton n'apparaît que s'il y a quelque chose à publier */}
                        {pending && (
                            <div className="flex items-center gap-2">
                                {published && dirty && <button type="button" onClick={reset} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-[#5F5E58] hover:bg-black/5"><RotateCcw className="h-4 w-4" /> Annuler</button>}
                                <button type="button" onClick={publishAll} disabled={save === 'error' || save === 'saving'}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#FFCC00] px-4 text-[14px] font-medium hover:bg-[#E6B800] disabled:opacity-50">
                                    <Check className="h-4 w-4" /> {infoDirty && !dirty && published ? 'Enregistrer' : 'Publier'}
                                </button>
                            </div>
                        )}
                    </div>

                    <nav className="-mx-1 mb-2 flex gap-0.5 overflow-x-auto bg-[#FAFAF8] px-1 py-2 [scrollbar-width:none]" aria-label="Étapes">
                        {STEPS.map(([k, l], i) => (
                            <button key={k} type="button" onClick={() => { setTab(k); setAdding(false); }} aria-pressed={tab === k}
                                className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] transition-colors ${tab === k ? 'bg-[#141412] text-white' : 'text-[#5F5E58] hover:bg-black/5 hover:text-[#141412]'}`}>
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${tab === k ? 'bg-white text-[#141412]' : 'bg-black/[0.06]'}`}>{i + 1}</span> {l}
                            </button>
                        ))}
                        <button type="button" onClick={() => setTab('versions')} aria-pressed={tab === 'versions'}
                            aria-label="Versions publiées" title="Versions publiées"
                            className={`ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tab === 'versions' ? 'bg-[#141412] text-white' : 'text-[#8B8A83] hover:bg-black/5'}`}><History className="h-4 w-4" /></button>
                    </nav>
                    </div>

                    <div className="rounded-3xl border border-black/[0.06] bg-white p-5 sm:p-6">
                        {tab === 'activite' && (
                            <div className="space-y-4">
                                <div><h2 className="text-[17px] font-medium">Que vendez-vous ?</h2><p className="mt-0.5 text-[13px] text-[#8B8A83]">Votre activité décide des templates proposés à l’étape suivante.</p></div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {Object.entries(activities).map(([k, l]) => (
                                        <button key={k} type="button" onClick={() => chooseActivity(k)} aria-pressed={info.business_type === k}
                                            className={`flex items-center justify-between gap-2 rounded-2xl border-2 px-4 py-3 text-left text-[14px] transition-colors ${info.business_type === k ? 'border-[#141412] bg-[#FFFBEA]' : 'border-black/[0.08] hover:border-black/25'}`}>
                                            {l} {info.business_type === k && <Check className="h-4 w-4 shrink-0" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === 'template' && (
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-[17px] font-medium">Choisissez votre template</h2>
                                    <p className="mt-0.5 text-[13px] text-[#8B8A83]">{info.business_type ? `3 templates pensés pour « ${activities[info.business_type]} ».` : 'Choisissez d’abord votre activité.'} Vos produits et vos textes restent si vous changez.</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {templates.filter((t) => t.id !== 'classique').map((t) => (
                                        <button key={t.id} type="button" onClick={() => { applyTemplate(t); setTab('personnaliser'); }} aria-pressed={draft.template === t.id}
                                            className={`group min-w-0 rounded-2xl border-2 p-1.5 text-left transition-colors ${draft.template === t.id ? 'border-[#141412]' : 'border-transparent hover:border-black/20'}`}>
                                            <span className="relative block overflow-hidden rounded-xl bg-[#F2F1EC]" style={{ aspectRatio: '390 / 700' }}>
                                                <iframe src={`${route('site.templates.show', t.id)}?apercu=1`} title={`Template ${t.name}`} loading="lazy" tabIndex={-1} aria-hidden
                                                    className="pointer-events-none absolute left-0 top-0 origin-top-left border-0" style={{ width: 390, height: 700, transform: 'scale(var(--s))' }}
                                                    ref={(el) => { if (el) el.style.setProperty('--s', String(el.parentElement.clientWidth / 390)); }} />
                                                {draft.template === t.id && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#141412] text-white"><Check className="h-4 w-4" /></span>}
                                            </span>
                                            <span className="mt-2 block px-1 text-[14px] font-medium">{t.name}</span>
                                            <span className="block px-1 text-[12px] leading-snug text-[#8B8A83] line-clamp-3">{t.pitch}</span>
                                        </button>
                                    ))}
                                </div>
                                {templates.some((t) => t.id === 'classique') && draft.template !== 'classique' && published?.template === 'classique' && (
                                    <p className="text-[12px] text-[#8B8A83]">Votre boutique est encore sur l’apparence Biolinko d’origine tant que vous ne publiez pas.</p>
                                )}
                            </div>
                        )}

                        {tab === 'personnaliser' && (
                            <div className="mb-4 flex gap-1 rounded-full bg-[#F2F1EC] p-1" role="tablist" aria-label="Personnaliser">
                                {[['sections', 'Sections', Rows3], ['style', 'Couleurs et polices', Palette]].map(([k, l, Icon]) => (
                                    <button key={k} type="button" role="tab" aria-selected={sub === k} onClick={() => { setSub(k); setAdding(false); }}
                                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-[13px] ${sub === k ? 'bg-white shadow-sm' : 'text-[#5F5E58]'}`}><Icon className="h-4 w-4" /> {l}</button>
                                ))}
                            </div>
                        )}
                        {tab === 'personnaliser' && sub === 'sections' && !section && !adding && (
                            <div className="space-y-3">
                                <p className="text-[13px] text-[#5F5E58]">Cliquez sur une section de l’aperçu, ou ici, pour la modifier.</p>
                                <ul className="space-y-1.5">
                                    {draft.sections.map((s, i) => (
                                        <li key={s.id} className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 ${s.enabled ? 'border-black/[0.08] bg-white' : 'border-dashed border-black/15 bg-[#FAFAF8] opacity-70'}`}>
                                            <button type="button" onClick={() => setSelected(s.id)} className="min-w-0 flex-1 px-1 py-1 text-left">
                                                <span className="block truncate text-[14px] font-medium">{catalog[s.type]?.label}</span>
                                                <span className="block truncate text-[12px] text-[#8B8A83]">{catalog[s.type]?.variants[s.variant]}{s.enabled ? '' : ' · masquée'}</span>
                                            </button>
                                            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter" className="flex h-8 w-7 items-center justify-center rounded-lg text-[#5F5E58] hover:bg-black/5 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                                            <button type="button" onClick={() => move(i, 1)} disabled={i === draft.sections.length - 1} aria-label="Descendre" className="flex h-8 w-7 items-center justify-center rounded-lg text-[#5F5E58] hover:bg-black/5 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                                            {!catalog[s.type]?.required && (
                                                <button type="button" onClick={() => toggle(i)} aria-label={s.enabled ? 'Masquer' : 'Afficher'} className="flex h-8 w-7 items-center justify-center rounded-lg text-[#5F5E58] hover:bg-black/5">{s.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                                            )}
                                            <ChevronRight className="h-4 w-4 shrink-0 text-[#8B8A83]" />
                                        </li>
                                    ))}
                                </ul>
                                <button type="button" onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-black/20 py-2.5 text-[14px] font-medium hover:border-black/40"><Plus className="h-4 w-4" /> Ajouter une section</button>
                            </div>
                        )}

                        {tab === 'personnaliser' && sub === 'sections' && adding && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between"><p className="text-[15px] font-semibold">Ajouter une section</p><button type="button" onClick={() => setAdding(false)} aria-label="Fermer"><X className="h-5 w-5" /></button></div>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(catalog).filter(([type, def]) => !def.required && !(def.single && existing.has(type)) && type !== 'announce').map(([type, def]) => (
                                        <button key={type} type="button" onClick={() => add(type)} className="rounded-xl border border-black/[0.08] p-3 text-left text-[13px] font-medium hover:border-black/30">{def.label}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === 'personnaliser' && sub === 'sections' && section && (
                            <div className="space-y-5">
                                <button type="button" onClick={() => setSelected(null)} className="inline-flex items-center gap-1.5 text-[13px] text-[#5F5E58] hover:text-[#141412]"><ArrowLeft className="h-4 w-4" /> Toutes les sections</button>
                                <div className="flex items-center justify-between gap-2">
                                    <h2 className="text-[17px] font-semibold">{catalog[section.type].label}</h2>
                                    <div className="flex gap-1">
                                        <button type="button" onClick={() => move(sectionIndex, -1)} aria-label="Monter" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"><ArrowUp className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => move(sectionIndex, 1)} aria-label="Descendre" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"><ArrowDown className="h-4 w-4" /></button>
                                        {!catalog[section.type].required && <button type="button" onClick={() => toggle(sectionIndex)} aria-label={section.enabled ? 'Masquer' : 'Afficher'} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5">{section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>}
                                        {!catalog[section.type].required && <button type="button" onClick={() => remove(sectionIndex)} aria-label="Retirer la section" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B91C1C] hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>}
                                    </div>
                                </div>
                                {Object.keys(catalog[section.type].variants).length > 1 && (
                                    <div>
                                        <p className="mb-2 text-[13px] font-medium">Disposition</p>
                                        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Disposition">
                                            {Object.entries(catalog[section.type].variants).map(([v, l]) => (
                                                <button key={v} type="button" role="radio" aria-checked={section.variant === v} onClick={() => update((d) => { d.sections[sectionIndex].variant = v; })}
                                                    className={`rounded-full border px-3 py-1.5 text-[13px] ${section.variant === v ? 'border-[#141412] bg-[#141412] text-white' : 'border-black/10 hover:border-black/30'}`}>{l}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-3">
                                    {Object.entries(catalog[section.type].settings || {}).map(([k, f]) => (
                                        <SettingField key={k} name={k} field={f} variant={section.variant} value={section.settings?.[k]} onChange={(v) => setSetting(k, v)} products={products} />
                                    ))}
                                    {!Object.keys(catalog[section.type].settings || {}).length && <p className="text-[13px] text-[#8B8A83]">Cette section se remplit toute seule avec les informations de votre boutique.</p>}
                                </div>
                            </div>
                        )}

                        {tab === 'personnaliser' && sub === 'style' && (
                            <div className="space-y-6">
                                <div>
                                    <p className="mb-2 text-[13px] font-medium">Palettes</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PALETTES.map(([name, p]) => (
                                            <button key={name} type="button" onClick={() => setStyle({ ...p, on_primary: null, announce_bg: null, announce_fg: null })}
                                                className={`flex items-center gap-2 rounded-xl border p-2 text-left text-[13px] ${st.primary === p.primary && st.background === p.background ? 'border-[#141412]' : 'border-black/[0.08] hover:border-black/30'}`}>
                                                <span className="flex shrink-0 overflow-hidden rounded-md ring-1 ring-black/10">{[p.background, p.primary, p.ink].map((c) => <span key={c} className="h-6 w-4" style={{ backgroundColor: c }} />)}</span> {name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-2 text-[13px] font-medium">Couleur principale</p>
                                    <div className="flex items-center gap-3">
                                        <input type="color" value={st.primary} onChange={(e) => setStyle({ primary: e.target.value.toUpperCase(), on_primary: null })} className="h-10 w-14 cursor-pointer rounded-lg border border-black/10" aria-label="Couleur principale" />
                                        <span className="rounded-full px-3 py-1.5 text-[13px] font-medium" style={{ backgroundColor: st.primary, color: contrastColor(st.primary) }}>Texte des boutons lisible</span>
                                    </div>
                                    <p className="mt-1 text-[12px] text-[#8B8A83]">Le texte des boutons passe en clair ou en foncé automatiquement.</p>
                                </div>
                                <div>
                                    <p className="mb-2 text-[13px] font-medium">Polices</p>
                                    <div className="space-y-1.5">
                                        {FONT_PAIRS.map(([display, body, weight]) => (
                                            <button key={display + body} type="button" onClick={() => setStyle({ font_display: display, font_body: body, heading_weight: weight })}
                                                className={`flex w-full items-baseline justify-between gap-2 rounded-xl border px-3 py-2 text-left ${st.font_display === display && st.font_body === body ? 'border-[#141412]' : 'border-black/[0.08] hover:border-black/30'}`}>
                                                <span style={{ fontFamily: `'${display}'`, fontWeight: weight }} className="text-[18px]">{display}</span>
                                                <span style={{ fontFamily: `'${body}'` }} className="text-[12px] text-[#5F5E58]">{body}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-2 text-[13px] font-medium">Arrondis</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {SHAPES.map(([name, r, rb]) => (
                                            <button key={name} type="button" onClick={() => setStyle({ radius: r, radius_button: rb })}
                                                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-[13px] ${st.radius === r ? 'border-[#141412]' : 'border-black/[0.08] hover:border-black/30'}`}>
                                                <span className="h-7 w-12 border-2 border-[#141412]" style={{ borderRadius: Math.min(r, 14) }} /> {name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="mb-2 text-[13px] font-medium">Motif</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[null, ...patterns].map((key) => (
                                            <button key={key || 'none'} type="button" onClick={() => update((d) => { d.pattern = { key, intensity: key ? (d.pattern.intensity === 'none' ? 'soft' : d.pattern.intensity) : 'none' }; })}
                                                className={`relative h-14 overflow-hidden rounded-xl border text-[12px] font-medium ${(draft.pattern.key || null) === key ? 'border-[#141412]' : 'border-black/[0.08] hover:border-black/30'}`} style={{ backgroundColor: st.background }}>
                                                {key && <PatternLayer pattern={key} color={st.primary} opacity={0.5} fade={false} scale={0.6} />}
                                                <span className="relative rounded bg-white/85 px-1.5 py-0.5 text-[#141412]">{key ? patternLabel(key) : 'Sans motif'}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {draft.pattern.key && (
                                        <div className="mt-2 flex gap-1 rounded-full bg-[#F2F1EC] p-1" role="radiogroup" aria-label="Intensité du motif">
                                            {INTENSITIES.map(([k, l]) => (
                                                <button key={k} type="button" role="radio" aria-checked={draft.pattern.intensity === k} onClick={() => update((d) => { d.pattern.intensity = k; })}
                                                    className={`flex-1 rounded-full py-1.5 text-[13px] ${draft.pattern.intensity === k ? 'bg-white shadow-sm' : 'text-[#5F5E58]'}`}>{l}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div hidden={tab !== 'infos'}><InfoPanel info={info} activities={activities} bind={infoSave} onDirty={setInfoDirty} onSaved={() => setFrameKey((k) => k + 1)} /></div>

                        {tab === 'avis' && <ReviewsPanel reviews={reviews} />}

                        {tab === 'versions' && (
                            <div className="space-y-3">
                                <p className="text-[13px] text-[#5F5E58]">Les {versions.length || ''} dernières versions publiées. Remettez-en une en ligne en un clic.</p>
                                {!versions.length && <p className="text-[13px] text-[#8B8A83]">Aucune version précédente pour le moment.</p>}
                                {versions.map((v) => (
                                    <div key={v.id} className="flex items-center justify-between gap-2 rounded-xl border border-black/[0.08] p-3">
                                        <span className="min-w-0"><span className="block truncate text-[14px] font-medium">{v.template}</span><span className="text-[12px] text-[#8B8A83]">Publiée le {new Date(v.at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</span></span>
                                        <button type="button" onClick={() => restore(v)} className="shrink-0 rounded-full border border-black/15 px-3 py-1.5 text-[13px] font-medium hover:border-black/40">Restaurer</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Aperçu : colonne collante sur ordinateur, plein écran sur téléphone */}
                <div className={previewOpen ? 'fixed inset-0 z-[60] flex flex-col bg-[#F2F1EC] p-2 sm:p-4' : 'hidden h-[calc(100vh-112px)] min-w-0 xl:sticky xl:top-20 xl:flex xl:flex-col'}>
                    <div className="flex h-full flex-col rounded-3xl border border-black/[0.06] bg-white">
                        <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 py-3">
                            <div className="flex rounded-full bg-[#F2F1EC] p-1" role="radiogroup" aria-label="Aperçu">
                                {[['desktop', Monitor, 'Ordinateur'], ['phone', Smartphone, 'Mobile']].map(([k, Icon, l]) => (
                                    <button key={k} type="button" role="radio" aria-checked={device === k} onClick={() => setDevice(k)}
                                        className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] ${device === k ? 'bg-white text-[#141412] shadow-sm' : 'text-[#5F5E58]'}`}><Icon className="h-4 w-4" /> {l}</button>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-[13px] text-[#8B8A83]">
                                {dirty && <Badge tone="warning">Non publié</Badge>}
                                {previewOpen && <button type="button" onClick={() => setPreviewOpen(false)} aria-label="Fermer l’aperçu" className="flex h-9 w-9 items-center justify-center rounded-full text-[#141412] hover:bg-black/5"><X className="h-5 w-5" /></button>}
                            </div>
                        </div>
                        <div ref={box} className="flex min-h-0 flex-1 justify-center overflow-auto rounded-b-3xl bg-[#F2F1EC] p-4">
                            <div className={`shrink-0 overflow-hidden bg-white ${device === 'phone' ? 'rounded-[32px] border-[8px] border-[#141412]' : 'rounded-xl ring-1 ring-black/10'}`} style={{ width: width * scale + (device === 'phone' ? 16 : 0), height: height * scale + (device === 'phone' ? 16 : 0) }}>
                                <iframe key={frameKey} ref={frame} title="Aperçu de la vitrine" src={`/${store.slug}?apercu=editeur`} onLoad={push}
                                    className="origin-top-left border-0" style={{ width, height, transform: `scale(${scale})` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
