import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
    ArrowDown, ArrowLeft, ArrowUp, Check, ChevronRight, ExternalLink, Eye, EyeOff, History, ImagePlus, LayoutTemplate, Monitor, Palette,
    Plus, RotateCcw, Rows3, Smartphone, Trash2, X,
} from 'lucide-react';
import AppToaster from '@/Components/UI/AppToaster';
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
const TABS = [['sections', 'Sections', Rows3], ['style', 'Style', Palette], ['templates', 'Templates', LayoutTemplate], ['history', 'Historique', History]];

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

/* ------------------------------------------------------------------ Éditeur */

export default function Editor({ store, draft: initialDraft, published, catalog, patterns = [], templates = [], products = [], versions = [] }) {
    const [draft, setDraft] = useState(initialDraft);
    const [tab, setTab] = useState('sections');
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
            if (e.data?.type === SECTION_CLICK) { setSelected(e.data.id); setTab('sections'); }
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
        toast.success(`Template « ${t.name} » appliqué au brouillon`, { description: 'Vos produits et vos textes sont gardés. Publiez pour le mettre en ligne.' });
    });

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
    const scale = device === 'phone' ? Math.min(1, (boxWidth - 32) / 390) : Math.min(1, (boxWidth - 32) / 1280);
    const width = device === 'phone' ? 390 : 1280;
    const height = device === 'phone' ? 844 : 800;
    const st = draft.style;

    return (
        <div className="flex h-screen flex-col bg-[#F2F1EC] font-poppins text-[#141412]">
            <Head title="Ma vitrine">{<link rel="stylesheet" href={fontsLink(FONT_PAIRS.map((p) => [p[0], p[1]]))} />}</Head>
            <AppToaster />

            <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-black/[0.08] bg-white px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                    <Link href={route('seller.dashboard')} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5" aria-label="Retour au tableau de bord"><ArrowLeft className="h-5 w-5" /></Link>
                    <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold">Ma vitrine</p>
                        <p className="text-[12px] text-[#8B8A83]" aria-live="polite">
                            {save === 'saving' ? 'Enregistrement du brouillon…' : save === 'error' ? <span className="text-[#B91C1C]">{saveError}</span> : dirty ? 'Brouillon enregistré · non publié' : 'À jour avec la boutique en ligne'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-[#F2F1EC] p-1" role="radiogroup" aria-label="Aperçu">
                    {[['phone', Smartphone, 'Téléphone'], ['desktop', Monitor, 'Ordinateur']].map(([k, Icon, l]) => (
                        <button key={k} type="button" role="radio" aria-checked={device === k} aria-label={l} onClick={() => setDevice(k)}
                            className={`flex h-8 w-10 items-center justify-center rounded-full ${device === k ? 'bg-white shadow-sm' : 'text-[#5F5E58]'}`}><Icon className="h-4 w-4" /></button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <a href={store.public_url} target="_blank" rel="noreferrer" className="hidden h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-[#5F5E58] hover:bg-black/5 sm:inline-flex"><ExternalLink className="h-4 w-4" /> Ma boutique</a>
                    {published && dirty && <button type="button" onClick={reset} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-[#5F5E58] hover:bg-black/5"><RotateCcw className="h-4 w-4" /> Annuler</button>}
                    <button type="button" onClick={publish} disabled={(!dirty && !!published) || save === 'error'}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#FFCC00] px-4 text-[14px] font-medium hover:bg-[#E6B800] disabled:opacity-50">
                        <Check className="h-4 w-4" /> Publier
                    </button>
                </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col-reverse lg:flex-row">
                {/* Panneau de réglages */}
                <aside className="flex max-h-[48vh] min-h-0 w-full shrink-0 flex-col border-t border-black/[0.08] bg-white lg:max-h-none lg:w-[380px] lg:border-r lg:border-t-0">
                    <nav className="flex shrink-0 gap-1 border-b border-black/[0.06] p-2" aria-label="Réglages">
                        {TABS.map(([k, l, Icon]) => (
                            <button key={k} type="button" onClick={() => { setTab(k); setAdding(false); }} aria-pressed={tab === k}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[13px] ${tab === k ? 'bg-[#141412] text-white' : 'text-[#5F5E58] hover:bg-black/5'}`}>
                                <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{l}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                        {tab === 'sections' && !section && !adding && (
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

                        {tab === 'sections' && adding && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between"><p className="text-[15px] font-semibold">Ajouter une section</p><button type="button" onClick={() => setAdding(false)} aria-label="Fermer"><X className="h-5 w-5" /></button></div>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(catalog).filter(([type, def]) => !def.required && !(def.single && existing.has(type)) && type !== 'announce').map(([type, def]) => (
                                        <button key={type} type="button" onClick={() => add(type)} className="rounded-xl border border-black/[0.08] p-3 text-left text-[13px] font-medium hover:border-black/30">{def.label}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {tab === 'sections' && section && (
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

                        {tab === 'style' && (
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

                        {tab === 'templates' && (
                            <div className="space-y-3">
                                <p className="text-[13px] text-[#5F5E58]">Changer de template ne fait rien perdre : vos produits, vos avis et vos textes restent. Le changement va dans le brouillon, publiez pour le mettre en ligne.</p>
                                {templates.map((t) => (
                                    <div key={t.id} className={`rounded-xl border p-3 ${draft.template === t.id ? 'border-[#141412]' : 'border-black/[0.08]'}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: t.design.style.primary }} />
                                            <span className="font-medium">{t.name}</span>
                                            {draft.template === t.id && <span className="ml-auto text-[12px] text-[#15803D]">Actuel</span>}
                                        </div>
                                        <p className="mt-1 text-[13px] text-[#5F5E58]">{t.pitch}</p>
                                        {draft.template !== t.id && (
                                            <button type="button" onClick={() => applyTemplate(t)} className="mt-2 rounded-full border border-black/15 px-3 py-1.5 text-[13px] font-medium hover:border-black/40">Essayer ce template</button>
                                        )}
                                    </div>
                                ))}
                                <a href={route('site.templates')} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[13px] text-[#5F5E58] underline underline-offset-2">Voir tous les templates <ExternalLink className="h-3.5 w-3.5" /></a>
                            </div>
                        )}

                        {tab === 'history' && (
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
                </aside>

                {/* Aperçu */}
                <main ref={box} className="flex min-h-0 flex-1 items-start justify-center overflow-auto p-4">
                    <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_20px_50px_-25px_rgba(20,20,10,0.35)] ring-1 ring-black/10" style={{ width: width * scale, height: height * scale }}>
                        <iframe ref={frame} title="Aperçu de la vitrine" src={`/${store.slug}?apercu=editeur`} onLoad={push}
                            className="origin-top-left border-0" style={{ width, height, transform: `scale(${scale})` }} />
                    </div>
                </main>
            </div>
        </div>
    );
}
