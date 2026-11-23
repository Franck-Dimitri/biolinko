import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Check, Copy, ExternalLink, ImagePlus, LogOut, Package, Palette, Share2 } from 'lucide-react';
import AppToaster from '@/Components/UI/AppToaster';
import { Field, fieldClass } from '@/Components/Dashboard/UI';
import { storeAddressParts } from '@/Components/Storefront/storeUrl';
import { PREVIEW_IDENTITY } from '@/Pages/Site/Templates/Show';

/*
 * Création de la boutique en 3 étapes : activité, template (aperçu en direct), puis nom, adresse, ville
 * et WhatsApp. L'aperçu affiche le nom et la ville pendant la saisie. La boutique est en ligne tout de suite.
 */

const STEPS = ['Votre activité', 'Votre style', 'Votre boutique'];

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

function Preview({ template, name, city }) {
    const frame = useRef(null);
    const send = () => frame.current?.contentWindow?.postMessage({ type: PREVIEW_IDENTITY, name, city }, window.location.origin);
    useEffect(() => { send(); }, [name, city, template]);
    useEffect(() => {
        const onReady = (e) => { if (e.origin === window.location.origin && e.data?.type === `${PREVIEW_IDENTITY}:ready`) send(); };
        window.addEventListener('message', onReady);
        return () => window.removeEventListener('message', onReady);
    });
    if (!template) return null;
    return (
        <div className="relative mx-auto overflow-hidden rounded-[34px] border-[7px] border-[#141412] bg-[#141412] shadow-[0_30px_60px_-30px_rgba(20,20,10,0.5)]" style={{ width: 390 * 0.78 + 14, height: 780 * 0.78 + 14 }}>
            <iframe ref={frame} key={template} src={`${route('site.templates.show', template)}?apercu=1`} title="Aperçu de votre boutique" tabIndex={-1}
                className="pointer-events-none origin-top-left rounded-[27px] bg-white" style={{ width: 390, height: 780, transform: 'scale(0.78)' }} onLoad={send} />
        </div>
    );
}

function Done({ store, examples }) {
    const url = store.public_url;
    const copy = async () => {
        try { await navigator.clipboard.writeText(url); toast.success('Lien copié'); } catch (e) { /* presse-papiers indisponible */ }
    };
    const todo = [
        [Package, examples > 0 ? `Remplacez les ${examples} produits d’exemple` : 'Ajoutez vos produits', 'Ils sont en brouillon : modifiez la photo, le nom et le prix, puis activez-les.', route('products.index')],
        [ImagePlus, 'Ajoutez votre logo et vos coordonnées', 'Ils apparaissent dans l’en-tête et le pied de page.', route('appearance.index')],
        [Palette, 'Personnalisez votre vitrine', 'Couleurs, polices, sections : tout se modifie sans rien casser.', route('seller.editor')],
    ];
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl space-y-8 py-10 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]"><Check className="h-8 w-8" /></span>
            <div>
                <h1 className="text-[30px] font-semibold tracking-[-0.03em] text-[#141412]">Votre boutique est en ligne</h1>
                <p className="mt-2 text-[#5F5E58]">{store.name} est visible à l’adresse <strong className="font-medium text-[#141412]">{store.public_address}</strong>.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                <a href={url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#FFCC00] px-5 font-medium text-[#141412] hover:bg-[#E6B800]"><ExternalLink className="h-4 w-4" /> Voir ma boutique</a>
                <button type="button" onClick={copy} className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-5 font-medium text-[#141412] hover:border-black/40"><Copy className="h-4 w-4" /> Copier le lien</button>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Découvrez ma boutique ${store.name} : ${url}`)}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-5 font-medium text-[#141412] hover:border-black/40"><Share2 className="h-4 w-4" /> Partager</a>
            </div>
            <div className="rounded-3xl border border-black/[0.08] bg-white p-5 text-left">
                <h2 className="text-[17px] font-semibold text-[#141412]">Pour finir</h2>
                <ul className="mt-3 divide-y divide-black/[0.06]">
                    {todo.map(([Icon, title, text, href]) => (
                        <li key={title}>
                            <Link href={href} className="flex items-center gap-3 py-3.5">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F5F1] text-[#141412]"><Icon className="h-5 w-5" /></span>
                                <span className="min-w-0 flex-1"><span className="block font-medium text-[#141412]">{title}</span><span className="block text-[13px] text-[#5F5E58]">{text}</span></span>
                                <ArrowRight className="h-4 w-4 shrink-0 text-[#8B8A83]" />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <Link href={route('seller.dashboard')} className="inline-block text-[14px] text-[#5F5E58] underline underline-offset-4 hover:text-[#141412]">Aller au tableau de bord</Link>
        </motion.div>
    );
}

export default function Creation({ activities = [], store, initialTemplate = null, initialActivity = null, done = false, examples = 0 }) {
    const { errors } = usePage().props;
    const parts = storeAddressParts();
    const [step, setStep] = useState(initialTemplate ? 2 : initialActivity ? 1 : 0);
    const [activity, setActivity] = useState(initialActivity || null);
    const [template, setTemplate] = useState(initialTemplate || null);
    const [form, setForm] = useState({ name: store.name || '', slug: store.slug || '', city_location: store.city_location || '', phone_whatsapp: (store.phone_whatsapp || '').replace(/^\+?237/, '') });
    const [slugEdited, setSlugEdited] = useState(false);
    const [slugState, setSlugState] = useState(null); // null | 'checking' | 'ok' | 'taken'
    const [busy, setBusy] = useState(false);
    const current = activities.find((a) => a.key === activity);

    const set = (k) => (e) => {
        const value = e.target.value;
        setForm((f) => ({ ...f, [k]: value, ...(k === 'name' && !slugEdited ? { slug: slugify(value) } : {}) }));
    };

    // Adresse libre ? (la sienne l'est toujours)
    useEffect(() => {
        if (!form.slug || form.slug === store.slug) { setSlugState(form.slug ? 'ok' : null); return undefined; }
        setSlugState('checking');
        const t = setTimeout(() => {
            axios.get(route('shop.available'), { params: { slug: form.slug } })
                .then(({ data }) => setSlugState(data.available && data.slug === form.slug ? 'ok' : 'taken'))
                .catch(() => setSlugState(null));
        }, 400);
        return () => clearTimeout(t);
    }, [form.slug]);

    const pickActivity = (key) => {
        setActivity(key);
        const list = activities.find((a) => a.key === key)?.templates || [];
        if (!list.some((t) => t.id === template)) setTemplate(list[0]?.id || null);
        setStep(1);
    };

    const submit = (e) => {
        e.preventDefault();
        setBusy(true);
        router.post(route('seller.creation.store'), { business_type: activity, template, ...form }, {
            onError: () => toast.error('Vérifiez les champs signalés.'),
            onFinish: () => setBusy(false),
        });
    };

    if (done) {
        return (
            <div className="min-h-screen bg-[#FBFAF6] px-5 font-poppins">
                <Head title="Votre boutique est en ligne" />
                <AppToaster />
                <Done store={store} examples={examples} />
            </div>
        );
    }

    const canSubmit = activity && template && form.name.trim().length > 1 && slugState === 'ok' && form.city_location.trim() && form.phone_whatsapp.replace(/\D/g, '').length === 9;

    return (
        <div className="min-h-screen bg-[#FBFAF6] font-poppins text-[#141412]">
            <Head title="Créer ma boutique" />
            <AppToaster />
            <header className="flex items-center justify-between border-b border-black/[0.06] bg-white px-5 py-3 lg:px-10">
                <span className="text-[17px] font-semibold tracking-tight">Biolinko</span>
                <ol className="hidden items-center gap-2 text-[13px] sm:flex" aria-label="Étapes">
                    {STEPS.map((label, i) => (
                        <li key={label} className="flex items-center gap-2">
                            <button type="button" disabled={i > step || (i > 0 && !activity)} onClick={() => setStep(i)}
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${i === step ? 'bg-[#141412] text-white' : i < step ? 'text-[#141412]' : 'text-[#8B8A83]'}`}>
                                <span className="tabular-nums">{i + 1}.</span> {label}
                            </button>
                            {i < STEPS.length - 1 && <span className="h-px w-5 bg-black/15" />}
                        </li>
                    ))}
                </ol>
                <Link href={route('logout')} method="post" as="button" className="inline-flex items-center gap-1.5 text-[13px] text-[#5F5E58] hover:text-[#141412]"><LogOut className="h-4 w-4" /> Déconnexion</Link>
            </header>

            <main className="mx-auto grid max-w-[1180px] gap-10 px-5 py-8 lg:grid-cols-[1fr_auto] lg:px-10 lg:py-12">
                <div className="min-w-0">
                    <p className="text-[13px] text-[#8B8A83] sm:hidden">Étape {step + 1} sur 3</p>
                    {step === 0 && (
                        <section>
                            <h1 className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">Que vendez-vous ?</h1>
                            <p className="mt-2 text-[#5F5E58]">Votre boutique aura les sections de votre métier : configurateur de gâteau, carte de restaurant, réservation…</p>
                            <div className="mt-6 grid gap-2 sm:grid-cols-2">
                                {activities.map((a) => (
                                    <button key={a.key} type="button" onClick={() => pickActivity(a.key)} aria-pressed={activity === a.key}
                                        className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-[15px] transition-colors ${activity === a.key ? 'border-[#141412] bg-[#FFFBEA]' : 'border-black/[0.08] bg-white hover:border-black/25'}`}>
                                        {a.label} <span className="flex gap-1" aria-hidden>{a.templates.map((t) => <span key={t.id} className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: t.primary }} />)}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {step === 1 && current && (
                        <section>
                            <button type="button" onClick={() => setStep(0)} className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-[#5F5E58] hover:text-[#141412]"><ArrowLeft className="h-4 w-4" /> {current.label}</button>
                            <h1 className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">Choisissez votre style</h1>
                            <p className="mt-2 text-[#5F5E58]">3 templates pensés pour votre activité. Vous pourrez en changer à tout moment sans perdre vos produits.</p>
                            <div className="mt-6 space-y-2" role="radiogroup" aria-label="Templates">
                                {current.templates.map((t) => (
                                    <button key={t.id} type="button" role="radio" aria-checked={template === t.id} onClick={() => setTemplate(t.id)}
                                        className={`flex w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${template === t.id ? 'border-[#141412] bg-white' : 'border-black/[0.08] bg-white hover:border-black/25'}`}>
                                        <span className="mt-1 h-4 w-4 shrink-0 rounded-full ring-1 ring-black/10" style={{ backgroundColor: t.primary }} />
                                        <span className="min-w-0"><span className="block text-[16px] font-medium">{t.name}</span><span className="block text-[14px] text-[#5F5E58]">{t.pitch}</span></span>
                                        {template === t.id && <Check className="ml-auto h-5 w-5 shrink-0" />}
                                    </button>
                                ))}
                            </div>
                            {errors.template && <p className="mt-2 text-[13px] text-[#B91C1C]">{errors.template}</p>}
                            <button type="button" disabled={!template} onClick={() => setStep(2)} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#FFCC00] px-6 font-medium hover:bg-[#E6B800] disabled:opacity-50">
                                Continuer <ArrowRight className="h-4 w-4" />
                            </button>
                        </section>
                    )}

                    {step === 2 && (
                        <form onSubmit={submit}>
                            <button type="button" onClick={() => setStep(current ? 1 : 0)} className="mb-4 inline-flex items-center gap-1.5 text-[14px] text-[#5F5E58] hover:text-[#141412]"><ArrowLeft className="h-4 w-4" /> Changer de style</button>
                            <h1 className="text-[28px] font-semibold tracking-[-0.03em] sm:text-[34px]">Votre boutique</h1>
                            <p className="mt-2 text-[#5F5E58]">L’aperçu se met à jour pendant que vous tapez.</p>
                            <div className="mt-6 space-y-4">
                                <Field label="Nom de la boutique" error={errors.name}>
                                    <input value={form.name} onChange={set('name')} maxLength={60} placeholder="Ex. Les Douceurs d’Awa" className={fieldClass} autoFocus />
                                </Field>
                                <Field label="Adresse de la boutique" error={errors.slug}>
                                    <div className="flex items-center rounded-xl border border-black/10 bg-white focus-within:border-black/30">
                                        {parts.prefix && <span className="pl-3.5 text-[15px] text-[#8B8A83]">{parts.prefix}</span>}
                                        <input value={form.slug} onChange={(e) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: slugify(e.target.value) })); }} aria-label="Adresse"
                                            className="h-11 min-w-0 flex-1 border-0 bg-transparent px-1 text-[15px] focus:ring-0" />
                                        {parts.suffix && <span className="pr-3.5 text-[15px] text-[#8B8A83]">{parts.suffix}</span>}
                                    </div>
                                    {slugState === 'taken' && <p className="mt-1 text-[13px] text-[#B91C1C]">Cette adresse est déjà prise.</p>}
                                    {slugState === 'ok' && form.slug !== store.slug && <p className="mt-1 text-[13px] text-[#15803D]">Adresse disponible.</p>}
                                </Field>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Ville" error={errors.city_location}>
                                        <input value={form.city_location} onChange={set('city_location')} maxLength={120} placeholder="Ex. Douala" className={fieldClass} />
                                    </Field>
                                    <Field label="WhatsApp de la boutique" hint="Pour vous prévenir de chaque commande." error={errors.phone_whatsapp}>
                                        <div className="flex items-center rounded-xl border border-black/10 bg-white focus-within:border-black/30">
                                            <span className="pl-3.5 text-[15px] text-[#8B8A83]">+237</span>
                                            <input type="tel" inputMode="numeric" value={form.phone_whatsapp} onChange={set('phone_whatsapp')} placeholder="6XX XX XX XX" aria-label="Numéro WhatsApp"
                                                className="h-11 min-w-0 flex-1 border-0 bg-transparent px-2 text-[15px] focus:ring-0" />
                                        </div>
                                    </Field>
                                </div>
                            </div>
                            <button type="submit" disabled={!canSubmit || busy} className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#FFCC00] px-6 font-medium hover:bg-[#E6B800] disabled:opacity-50">
                                {busy ? 'Création…' : 'Mettre ma boutique en ligne'} <ArrowRight className="h-4 w-4" />
                            </button>
                            <p className="mt-3 text-[13px] text-[#8B8A83]">3 produits d’exemple sont ajoutés en brouillon : vos clients ne les voient pas tant que vous ne les activez pas.</p>
                        </form>
                    )}
                </div>

                {step > 0 && (
                    <aside className="lg:sticky lg:top-8 lg:self-start" aria-label="Aperçu">
                        <Preview template={template} name={form.name} city={form.city_location} />
                    </aside>
                )}
            </main>
        </div>
    );
}
