import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
    ArrowDown, ArrowUp, Check, ExternalLink, Eye, EyeOff, ImagePlus, Lock, Monitor, RefreshCw, Smartphone, Star, Trash2,
} from 'lucide-react';
import { contrastColor } from '@/Components/Storefront/theme';
import { Badge, Button, Field, fieldClass } from '@/Components/Dashboard/UI';

const TABS = [['identity', 'Identité'], ['style', 'Style'], ['home', 'Accueil'], ['sections', 'Sections'], ['contact', 'Contact'], ['reviews', 'Avis']];

const COLORS = ['#FFCC00', '#1F6F5C', '#141412', '#B45309', '#BE123C', '#7C3AED', '#2563EB', '#0F766E'];
const FONTS = [['Inter', 'Moderne et neutre'], ['Poppins', 'Rond et chaleureux'], ['Roboto', 'Classique et lisible']];
const CATEGORIES = ['Mode et vêtements', 'Beauté et cosmétiques', 'Accessoires', 'Chaussures', 'Électronique', 'Alimentation', 'Maison et déco', 'Santé et bien-être', 'Enfants', 'Services', 'Autre'];

// Sections affichées par la vitrine, dans l'ordre par défaut
const SECTION_CATALOG = {
    banner: ['Bandeau d’annonce', 'Message en haut de chaque page'],
    hero: ['Accueil', 'Titre, slogan et bouton', true],
    products: ['Catalogue', 'Tous vos produits', true],
    promotions: ['Promotions', 'Produits en promo, avec compte à rebours'],
    smartlinks: ['Packs', 'Vos liens de paiement actifs'],
    benefits: ['Avantages', 'Livraison, paiement, reçu…'],
    reviews: ['Avis clients', 'Les avis que vous affichez'],
    about: ['À propos et contact', 'Votre histoire, adresse, horaires'],
};
const ALIASES = { promo: 'promotions', 'best-sellers': null, bestsellers: null, categories: null, brand: null };
const DEFAULT_BENEFITS = [
    { title: 'Livraison à domicile', subtitle: 'Le vendeur vous contacte pour organiser la livraison' },
    { title: 'Paiement Mobile Money', subtitle: 'MTN MoMo et Orange Money, validé sur votre téléphone' },
    { title: 'Reçu automatique', subtitle: 'Votre facture envoyée par WhatsApp et e-mail' },
    { title: 'Suivi de commande', subtitle: 'Un lien pour suivre votre commande à tout moment' },
];

function normalizeSections(saved) {
    const list = [];
    (Array.isArray(saved) ? saved : []).forEach((s) => {
        const id = s.id in ALIASES ? ALIASES[s.id] : s.id;
        if (id && SECTION_CATALOG[id] && !list.some((x) => x.id === id)) list.push({ id, enabled: ![false, 'false', 0, '0'].includes(s.enabled) });
    });
    Object.keys(SECTION_CATALOG).forEach((id) => { if (!list.some((x) => x.id === id)) list.push({ id, enabled: true }); });
    return list;
}

function Group({ title, sub, children }) {
    return (
        <section className="space-y-4 border-b border-black/[0.06] pb-6 last:border-0">
            <div><h3 className="text-[15px] font-medium text-[#141412]">{title}</h3>{sub && <p className="mt-0.5 text-[13px] text-[#8B8A83]">{sub}</p>}</div>
            {children}
        </section>
    );
}

function ImagePicker({ label, hint, current, onFile, shape = 'square' }) {
    const [preview, setPreview] = useState(null);
    const src = preview || current;
    return (
        <Field label={label} hint={hint}>
            <label className={`group relative flex cursor-pointer items-center justify-center overflow-hidden border border-dashed border-black/15 bg-[#FAFAF8] hover:border-black/30 ${shape === 'square' ? 'h-24 w-24 rounded-2xl' : 'h-32 w-full rounded-2xl'}`}>
                {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-1 text-[12px] text-[#5F5E58]"><ImagePlus className="h-5 w-5" />Choisir</span>}
                {src && <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[12px] text-white opacity-0 transition-opacity group-hover:opacity-100">Changer</span>}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPreview(URL.createObjectURL(f)); onFile(f); } }} />
            </label>
        </Field>
    );
}

function Preview({ slug, version, published }) {
    const [device, setDevice] = useState('desktop');
    const box = useRef(null);
    const [size, setSize] = useState({ w: 0, h: 0 });
    const width = device === 'mobile' ? 390 : 1280;
    const pad = device === 'mobile' ? 24 : 0;
    const scale = size.w ? Math.min(1, (size.w - pad * 2) / width) : 0;

    useEffect(() => {
        if (!box.current) return;
        const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
        ro.observe(box.current);
        return () => ro.disconnect();
    }, []);

    return (
        <div className="flex h-full flex-col rounded-3xl border border-black/[0.06] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 py-3">
                <div className="flex rounded-full bg-[#F2F1EC] p-1">
                    {[['desktop', Monitor, 'Ordinateur'], ['mobile', Smartphone, 'Mobile']].map(([id, Icon, label]) => (
                        <button key={id} type="button" onClick={() => setDevice(id)} aria-pressed={device === id}
                            className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] ${device === id ? 'bg-white text-[#141412] shadow-sm' : 'text-[#5F5E58]'}`}>
                            <Icon className="h-4 w-4" /> {label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 text-[13px] text-[#8B8A83]">
                    {!published && <Badge tone="warning">Non publiée</Badge>}
                    <a href={`/${slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-[#141412]">Ouvrir <ExternalLink className="h-3.5 w-3.5" /></a>
                </div>
            </div>
            {/* Le cadre garde la taille réelle de l'écran simulé, puis il est réduit pour tenir dans la place disponible */}
            <div ref={box} className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-b-3xl bg-[#F2F1EC]">
                {scale > 0 && (
                    <div className="absolute top-0" style={{
                        width,
                        height: (size.h - pad * 2) / scale,
                        left: (size.w - width * scale) / 2,
                        top: pad,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                    }}>
                        <iframe key={`${version}-${slug}`} title="Aperçu de la boutique" src={`/${slug}?apercu=${version}`}
                            className={`h-full w-full bg-white ${device === 'mobile' ? 'rounded-[32px] border-[8px] border-[#141412]' : ''}`} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Index({ store, reviews = [], stats = {} }) {
    const [tab, setTab] = useState('identity');
    const [version, setVersion] = useState(Date.now());
    const form = useForm({
        name: store.name || '', slug: store.slug || '', category: store.category || '', description: store.description || '', about_text: store.about_text || '',
        theme_color: store.theme_color || '#FFCC00', font_family: store.font_family || 'Inter', border_radius_style: store.border_radius_style || 'rounded',
        announcement_header: store.announcement_header || '', hero_badge_text: store.hero_badge_text || '', hero_title: store.hero_title || '',
        hero_subtitle: store.hero_subtitle || '', hero_cta_text: store.hero_cta_text || '',
        phone_whatsapp: store.phone_whatsapp || '', city_location: store.city_location || '', opening_hours: store.opening_hours || '',
        instagram_link: store.instagram_link || '', tiktok_link: store.tiktok_link || '', facebook_link: store.facebook_link || '',
        sections: normalizeSections(store.sections_json),
        benefits: Array.isArray(store.benefits_json) && store.benefits_json.length ? store.benefits_json : DEFAULT_BENEFITS,
        logo_file: null, banner_file: null,
    });
    const { data, setData, errors, processing, isDirty } = form;
    const set = (k) => (e) => setData(k, e?.target ? e.target.value : e);

    const save = () => {
        form.transform((d) => {
            const { sections, benefits, ...rest } = d;
            return { ...rest, sections_json: JSON.stringify(sections), benefits_json: JSON.stringify(benefits) };
        });
        form.post(route('appearance.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { setVersion(Date.now()); form.setDefaults(); setData((d) => ({ ...d, logo_file: null, banner_file: null })); },
            onError: (e) => { toast.error('Vérifiez les champs signalés.'); if (e.name || e.slug || e.category) setTab('identity'); },
        });
    };

    const move = (i, dir) => {
        const list = [...data.sections];
        const j = i + dir;
        if (j < 0 || j >= list.length) return;
        [list[i], list[j]] = [list[j], list[i]];
        setData('sections', list);
    };
    const toggleSection = (i) => setData('sections', data.sections.map((s, j) => (j === i ? { ...s, enabled: !s.enabled } : s)));
    const setBenefit = (i, k, v) => setData('benefits', data.benefits.map((b, j) => (j === i ? { ...b, [k]: v } : b)));

    const toggleReview = (r) => router.patch(route('appearance.reviews.toggle', r.id), {}, { preserveScroll: true, onSuccess: () => setVersion(Date.now()) });
    const deleteReview = (r) => { if (confirm('Supprimer cet avis ?')) router.delete(route('appearance.reviews.destroy', r.id), { preserveScroll: true, onSuccess: () => setVersion(Date.now()) }); };

    const sectionHint = { promotions: stats.promos ? null : 'Aucun produit en promotion : la section reste invisible', smartlinks: stats.packs ? null : 'Aucun pack actif : la section reste invisible', reviews: reviews.length ? null : 'Pas encore d’avis' };

    return (
        <AuthenticatedLayout>
            <Head title="Apparence, Biolinko" />
            <div className="grid gap-6 pb-6 xl:grid-cols-[460px_1fr]">
                {/* Éditeur */}
                <div className="min-w-0">
                    <div className="mb-5 flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-[28px] font-medium tracking-[-0.03em] text-[#141412]">Apparence</h1>
                            <p className="mt-1 text-[15px] text-[#5F5E58]">Personnalisez votre boutique, l’aperçu se met à jour à l’enregistrement.</p>
                        </div>
                    </div>

                    <div className="sticky top-16 z-10 -mx-1 mb-4 flex gap-1 overflow-x-auto bg-[#FAFAF8] px-1 py-2 [scrollbar-width:none]">
                        {TABS.map(([id, label]) => (
                            <button key={id} type="button" onClick={() => setTab(id)} aria-pressed={tab === id}
                                className={`h-9 shrink-0 rounded-full px-3 text-[14px] transition-colors ${tab === id ? 'bg-[#141412] text-white' : 'text-[#5F5E58] hover:bg-black/5 hover:text-[#141412]'}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 rounded-3xl border border-black/[0.06] bg-white p-6">
                        {tab === 'identity' && (
                            <>
                                <Group title="Votre marque">
                                    <div className="flex items-start gap-4">
                                        <ImagePicker label="Logo" current={store.logo_url} onFile={(f) => setData('logo_file', f)} />
                                        <div className="flex-1 space-y-3">
                                            <Field label="Nom de la boutique" error={errors.name}><input value={data.name} onChange={set('name')} className={fieldClass} /></Field>
                                            <Field label="Catégorie" error={errors.category}>
                                                <select value={data.category} onChange={set('category')} className={fieldClass}>
                                                    {!CATEGORIES.includes(data.category) && data.category && <option value={data.category}>{data.category}</option>}
                                                    <option value="">Choisir…</option>
                                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </Field>
                                        </div>
                                    </div>
                                </Group>
                                <Group title="Adresse de la boutique" sub="Si vous la changez, les anciens liens partagés ne fonctionneront plus.">
                                    <Field error={errors.slug}>
                                        <div className="flex items-center overflow-hidden rounded-xl border border-black/10 focus-within:border-black/30">
                                            <span className="bg-[#F6F5F1] px-3 py-3 text-[14px] text-[#5F5E58]">biolinko.link/</span>
                                            <input value={data.slug} onChange={(e) => setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))} className="h-11 flex-1 border-0 px-2 text-[15px] focus:ring-0" />
                                        </div>
                                    </Field>
                                </Group>
                                <Group title="Description courte" sub="Affichée sous le titre et dans le pied de page.">
                                    <textarea rows={3} maxLength={300} value={data.description} onChange={set('description')} placeholder="Ex. Robes et tuniques en wax cousues à Douala." className={`${fieldClass} h-auto py-3`} />
                                </Group>
                            </>
                        )}

                        {tab === 'style' && (
                            <>
                                <Group title="Couleur principale" sub="Boutons, prix et éléments actifs de votre vitrine.">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {COLORS.map((c) => (
                                            <button key={c} type="button" onClick={() => setData('theme_color', c)} aria-label={`Couleur ${c}`}
                                                className={`flex h-10 w-10 items-center justify-center rounded-full ring-offset-2 transition ${data.theme_color.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-[#141412]' : 'hover:scale-105'}`} style={{ backgroundColor: c }}>
                                                {data.theme_color.toLowerCase() === c.toLowerCase() && <Check className="h-4 w-4" style={{ color: contrastColor(c) }} />}
                                            </button>
                                        ))}
                                        <label className="flex h-10 items-center gap-2 rounded-full border border-black/10 pl-1 pr-3 text-[13px] text-[#5F5E58]">
                                            <input type="color" value={data.theme_color} onChange={set('theme_color')} className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent p-0" />
                                            {data.theme_color.toUpperCase()}
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl bg-[#F6F5F1] p-4">
                                        <span className="rounded-full px-4 py-2 text-[14px] font-medium" style={{ backgroundColor: data.theme_color, color: contrastColor(data.theme_color) }}>Voir les produits</span>
                                        <span className="text-[13px] text-[#8B8A83]">Aperçu d’un bouton</span>
                                    </div>
                                </Group>
                                <Group title="Police d’écriture">
                                    <div className="grid gap-2">
                                        {FONTS.map(([f, desc]) => (
                                            <button key={f} type="button" onClick={() => setData('font_family', f)} aria-pressed={data.font_family === f}
                                                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${data.font_family === f ? 'border-[#141412] bg-[#FFFBEA]' : 'border-black/[0.08] hover:border-black/25'}`}>
                                                <span><span className="block text-[17px] text-[#141412]" style={{ fontFamily: f }}>{f}</span><span className="text-[13px] text-[#8B8A83]">{desc}</span></span>
                                                {data.font_family === f && <Check className="h-4 w-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </Group>
                                <Group title="Forme des éléments">
                                    <div className="grid grid-cols-2 gap-2">
                                        {[['rounded', 'Arrondie', 'rounded-2xl'], ['square', 'Droite', 'rounded-sm']].map(([v, label, r]) => (
                                            <button key={v} type="button" onClick={() => setData('border_radius_style', v)} aria-pressed={data.border_radius_style === v}
                                                className={`flex items-center gap-3 rounded-2xl border p-3 ${data.border_radius_style === v ? 'border-[#141412] bg-[#FFFBEA]' : 'border-black/[0.08] hover:border-black/25'}`}>
                                                <span className={`h-9 w-12 border-2 border-[#141412] ${r}`} /><span className="text-[14px] text-[#141412]">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </Group>
                            </>
                        )}

                        {tab === 'home' && (
                            <>
                                <Group title="Bandeau d’annonce" sub="Laissez vide pour ne rien afficher.">
                                    <input maxLength={120} value={data.announcement_header} onChange={set('announcement_header')} placeholder="Ex. Livraison offerte dès 25 000 FCFA à Douala" className={fieldClass} />
                                </Group>
                                <Group title="Haut de page">
                                    <Field label="Petite étiquette" hint="Par défaut : votre catégorie et votre ville."><input maxLength={60} value={data.hero_badge_text} onChange={set('hero_badge_text')} placeholder="Ex. Nouvelle collection" className={fieldClass} /></Field>
                                    <Field label="Titre" hint="Par défaut : le nom de la boutique."><input maxLength={90} value={data.hero_title} onChange={set('hero_title')} placeholder="Ex. Le wax, coupé pour vous." className={fieldClass} /></Field>
                                    <Field label="Sous-titre"><textarea rows={3} maxLength={220} value={data.hero_subtitle} onChange={set('hero_subtitle')} placeholder="Une phrase qui donne envie d’acheter." className={`${fieldClass} h-auto py-3`} /></Field>
                                    <Field label="Texte du bouton"><input maxLength={30} value={data.hero_cta_text} onChange={set('hero_cta_text')} placeholder="Voir les produits" className={fieldClass} /></Field>
                                    <ImagePicker label="Image d’accueil" hint="Facultative. Sans image, vos produits défilent automatiquement." current={store.banner_url} shape="wide" onFile={(f) => setData('banner_file', f)} />
                                </Group>
                            </>
                        )}

                        {tab === 'sections' && (
                            <>
                                <Group title="Sections de la page" sub="Activez, masquez et réordonnez les blocs de votre vitrine.">
                                    <ul className="space-y-2">
                                        {data.sections.map((s, i) => {
                                            const [label, desc, locked] = SECTION_CATALOG[s.id];
                                            return (
                                                <li key={s.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${s.enabled ? 'border-black/[0.08] bg-white' : 'border-dashed border-black/10 bg-[#FAFAF8]'}`}>
                                                    <div className="flex flex-col">
                                                        <button type="button" aria-label="Monter" disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-0.5 text-[#8B8A83] hover:text-[#141412] disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                                                        <button type="button" aria-label="Descendre" disabled={i === data.sections.length - 1} onClick={() => move(i, 1)} className="rounded p-0.5 text-[#8B8A83] hover:text-[#141412] disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                                                    </div>
                                                    <span className="min-w-0 flex-1">
                                                        <span className={`block text-[14px] ${s.enabled ? 'text-[#141412]' : 'text-[#8B8A83]'}`}>{label}</span>
                                                        <span className="block text-[12px] text-[#8B8A83]">{sectionHint[s.id] || desc}</span>
                                                    </span>
                                                    {locked ? <span className="flex items-center gap-1 text-[12px] text-[#8B8A83]"><Lock className="h-3.5 w-3.5" /> Toujours</span> : (
                                                        <button type="button" onClick={() => toggleSection(i)} aria-label={s.enabled ? 'Masquer' : 'Afficher'}
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${s.enabled ? 'bg-[#FFF6CC] text-[#141412]' : 'text-[#8B8A83] hover:bg-black/5'}`}>
                                                            {s.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                        </button>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </Group>
                                <Group title="Vos avantages" sub="4 engagements affichés dans la section Avantages.">
                                    {data.benefits.map((b, i) => (
                                        <div key={i} className="grid gap-2 rounded-2xl bg-[#F6F5F1] p-3">
                                            <input aria-label="Titre de l’avantage" value={b.title} onChange={(e) => setBenefit(i, 'title', e.target.value)} className={fieldClass} />
                                            <input aria-label="Description de l’avantage" value={b.subtitle} onChange={(e) => setBenefit(i, 'subtitle', e.target.value)} className={fieldClass} />
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setData('benefits', DEFAULT_BENEFITS)} className="text-[13px] text-[#5F5E58] underline underline-offset-2">Rétablir les textes proposés</button>
                                </Group>
                            </>
                        )}

                        {tab === 'contact' && (
                            <>
                                <Group title="À propos" sub="Votre histoire, en quelques phrases.">
                                    <textarea rows={5} value={data.about_text} onChange={set('about_text')} placeholder="Qui êtes-vous, que vendez-vous, pourquoi vous faire confiance ?" className={`${fieldClass} h-auto py-3`} />
                                </Group>
                                <Group title="Coordonnées">
                                    <Field label="WhatsApp de la boutique" hint="Bouton « Commander sur WhatsApp » et bulle de contact." error={errors.phone_whatsapp}><input type="tel" value={data.phone_whatsapp} onChange={set('phone_whatsapp')} placeholder="+237 6XX XX XX XX" className={fieldClass} /></Field>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Field label="Ville ou quartier"><input value={data.city_location} onChange={set('city_location')} placeholder="Akwa, Douala" className={fieldClass} /></Field>
                                        <Field label="Horaires"><input value={data.opening_hours} onChange={set('opening_hours')} placeholder="Lun – Sam, 9h – 19h" className={fieldClass} /></Field>
                                    </div>
                                </Group>
                                <Group title="Réseaux sociaux">
                                    {[['instagram_link', 'Instagram', 'https://instagram.com/…'], ['tiktok_link', 'TikTok', 'https://tiktok.com/@…'], ['facebook_link', 'Facebook', 'https://facebook.com/…']].map(([k, label, ph]) => (
                                        <Field key={k} label={label} error={errors[k]}><input value={data[k]} onChange={set(k)} placeholder={ph} className={fieldClass} /></Field>
                                    ))}
                                </Group>
                            </>
                        )}

                        {tab === 'reviews' && (
                            <Group title="Avis clients" sub="Les avis sont laissés par vos clients sur la boutique. Choisissez ceux que vous affichez.">
                                {reviews.length ? (
                                    <ul className="space-y-2">
                                        {reviews.map((r) => (
                                            <li key={r.id} className={`rounded-2xl border p-4 ${r.is_featured ? 'border-black/[0.08]' : 'border-dashed border-black/10 opacity-70'}`}>
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-[14px] font-medium text-[#141412]">{r.customer_name}{r.customer_city ? ` · ${r.customer_city}` : ''}</p>
                                                        <p className="flex items-center gap-1.5 text-[12px] text-[#8B8A83]">
                                                            {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`h-3.5 w-3.5 ${s < r.rating ? 'fill-[#F5B800] text-[#F5B800]' : 'text-black/10'}`} />)}
                                                            {r.is_verified ? <Badge tone="success">Acheteur</Badge> : null}
                                                        </p>
                                                    </div>
                                                    <div className="flex shrink-0 gap-1">
                                                        <Button size="sm" variant="ghost" onClick={() => toggleReview(r)}>{r.is_featured ? <><EyeOff className="h-4 w-4" /> Masquer</> : <><Eye className="h-4 w-4" /> Afficher</>}</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => deleteReview(r)} aria-label="Supprimer l’avis"><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-[14px] text-[#3D3C37]">{r.comment}</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : <p className="rounded-2xl bg-[#F6F5F1] p-5 text-[14px] text-[#5F5E58]">Aucun avis pour l’instant. Vos clients peuvent en laisser un depuis votre boutique.</p>}
                            </Group>
                        )}
                    </motion.div>

                    {/* Barre d'enregistrement */}
                    <div className="sticky bottom-4 z-10 mt-4 flex items-center justify-between gap-3 rounded-full border border-black/[0.08] bg-white/95 py-2 pl-5 pr-2 shadow-[0_10px_30px_-15px_rgba(20,20,10,0.35)] backdrop-blur">
                        <span className="text-[14px] text-[#5F5E58]">{isDirty || data.logo_file || data.banner_file ? 'Modifications non enregistrées' : 'Tout est enregistré'}</span>
                        <Button variant="primary" onClick={save} disabled={processing || !(isDirty || data.logo_file || data.banner_file)}>
                            {processing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Enregistrer
                        </Button>
                    </div>
                </div>

                {/* Aperçu */}
                <div className="hidden h-[calc(100vh-112px)] min-w-0 xl:sticky xl:top-20 xl:block">
                    <Preview slug={store.slug} version={version} published={store.is_published} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
