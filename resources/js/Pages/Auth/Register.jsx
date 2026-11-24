import InputError from '@/Components/UI/InputError';
import PlanIntentBanner from '@/Components/Dashboard/PlanIntentBanner';
import AuthShell, { fieldClass, primaryButtonClass } from '@/Layouts/AuthShell';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import SlugField, { slugify, useSlugCheck } from '@/Components/Store/SlugField';

/** « maison-ngono » → « Maison Ngono » (adresse réservée sur la landing). */
const displayName = (slug) => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/*
 * Inscription en trois blocs lisibles, avec des libellés toujours visibles :
 * vous (nom, e-mail, WhatsApp), votre boutique (nom + adresse nom.biolinko.store vérifiée en direct), votre mot de passe.
 */
function Group({ n, title, children }) {
    return (
        <fieldset className="space-y-3">
            <legend className="mb-3 flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[#8B8A83]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#141412] text-[11px] font-semibold text-white">{n}</span>{title}
            </legend>
            {children}
        </fieldset>
    );
}

// Panneau de droite : le parcours qui attend le vendeur après l'inscription
const JOURNEY = [
    ['Créez votre compte', 'Une minute, sans carte bancaire.'],
    ['Choisissez votre activité', 'Pâtisserie, mode, restaurant, services… 14 métiers.'],
    ['Choisissez votre style', '3 templates pensés pour votre métier, modifiables à tout moment.'],
    ['Ajoutez vos produits et publiez', 'Partagez votre lien : vos clients paient en Mobile Money.'],
];
const Journey = () => (
    <div className="max-w-[440px]">
        <p className="text-[34px] font-medium leading-[1.1] tracking-[-0.03em] text-white">Votre boutique en ligne en 4 étapes.</p>
        <ol className="mt-10 space-y-6">
            {JOURNEY.map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold ${i === 0 ? 'bg-[#FFCC00] text-[#141412]' : 'border border-white/20 text-white/70'}`}>{i + 1}</span>
                    <span><span className="block text-[16px] font-medium text-white">{t}</span><span className="mt-0.5 block text-[14px] text-white/55">{d}</span></span>
                </li>
            ))}
        </ol>
    </div>
);

const Label = ({ htmlFor, children, hint }) => (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px] font-medium text-[#141412]">
        {children}{hint && <span className="text-[12px] font-normal text-[#8B8A83]">{hint}</span>}
    </label>
);
export default function Register({ intendedPlan = null, intendedShop = null, intendedTemplate = null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        store_name: intendedShop ? displayName(intendedShop.slug) : '',
        store_slug: intendedShop?.slug || '',
        email: '',
        phone_whatsapp: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const check = useSlugCheck(data.store_slug);

    // L'adresse suit le nom de la boutique tant que le vendeur ne l'a pas modifiée lui-même
    const [slugTouched, setSlugTouched] = useState(false);
    const setStoreName = (value) => setData((d) => ({ ...d, store_name: value, ...(slugTouched ? {} : { store_slug: slugify(value).replace(/-+$/g, '') }) }));

    const submit = (e) => {
        e.preventDefault();
        if (check.status === 'taken') { document.getElementById('store_slug')?.focus(); return; }
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const input = (name, label, placeholder, props = {}, hint = null) => (
        <div>
            <Label htmlFor={name} hint={hint}>{label}</Label>
            <input id={name} name={name} value={data[name]} placeholder={placeholder} required
                className={fieldClass} onChange={(e) => setData(name, e.target.value)} {...props} />
            <InputError message={errors[name]} className="mt-1.5" />
        </div>
    );
    const passwordType = showPassword ? 'text' : 'password';

    return (
        <>
            <Head title="Créer un compte, Biolinko" />
            <AuthShell
                aside={<Journey />}
                title="Créez votre boutique"
                subtitle={<>Déjà inscrit ? <Link href={route('login', intendedPlan ? { plan: intendedPlan } : {})} className="font-medium text-[#141412] underline underline-offset-4">Se connecter</Link></>}
            >
                <PlanIntentBanner plan={intendedPlan} action="Créez votre compte et validez votre e-mail :" />
                {intendedTemplate && (
                    <div className="mb-5 rounded-2xl border border-black/[0.08] bg-[#FFFBEA] p-3.5 text-[14px] text-[#141412]">
                        Template choisi : <strong className="font-semibold">{intendedTemplate.name}</strong>.
                    </div>
                )}

                <form onSubmit={submit} className="space-y-7">
                    <Group n="1" title="Vous">
                        {input('name', 'Nom complet', 'Ex. Awa Mbarga', { type: 'text', autoFocus: true, autoComplete: 'name' })}
                        {input('email', 'Adresse e-mail', 'vous@exemple.com', { type: 'email', inputMode: 'email', autoComplete: 'email' })}
                        <div>
                            <Label htmlFor="phone_whatsapp" hint="Alertes de commande">Numéro WhatsApp</Label>
                            <div className="flex gap-2">
                                <span className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl border border-black/10 bg-[#F6F5F1] px-3 text-[15px] text-[#5F5E58]">
                                    <img src="/images/flags/cm.svg" alt="" className="h-4 w-4 rounded-full object-cover" /> +237
                                </span>
                                <input id="phone_whatsapp" name="phone_whatsapp" type="tel" inputMode="tel" autoComplete="tel-national" required placeholder="6XX XX XX XX"
                                    value={data.phone_whatsapp} onChange={(e) => setData('phone_whatsapp', e.target.value)} className={`${fieldClass} min-w-0 flex-1`} />
                            </div>
                            <InputError message={errors.phone_whatsapp} className="mt-1.5" />
                        </div>
                    </Group>

                    <Group n="2" title="Votre boutique">
                        <div>
                            <Label htmlFor="store_name">Nom de la boutique</Label>
                            <input id="store_name" name="store_name" value={data.store_name} placeholder="Ex. Les Douceurs d’Awa"
                                required maxLength={60} autoComplete="organization" className={fieldClass} onChange={(e) => setStoreName(e.target.value)} />
                            <InputError message={errors.store_name} className="mt-1.5" />
                        </div>
                        <div>
                            <Label htmlFor="store_slug" hint="Modifiable plus tard">Adresse de la boutique</Label>
                            <SlugField value={data.store_slug} check={check}
                                onChange={(v) => { setSlugTouched(true); setData('store_slug', v); }} />
                            <InputError message={errors.store_slug} className="mt-1" />
                        </div>
                    </Group>

                    <Group n="3" title="Mot de passe">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="password">Mot de passe</Label>
                                <input id="password" name="password" type={passwordType} value={data.password} placeholder="8 caractères minimum"
                                    required autoComplete="new-password" className={fieldClass} onChange={(e) => setData('password', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="password_confirmation">Confirmation</Label>
                                <div className="relative">
                                    <input id="password_confirmation" name="password_confirmation" type={passwordType} value={data.password_confirmation}
                                        placeholder="Répétez-le" required autoComplete="new-password"
                                        className={`${fieldClass} pr-11`} onChange={(e) => setData('password_confirmation', e.target.value)} />
                                    <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
                                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#8B8A83] hover:text-[#141412]">
                                        {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <InputError message={errors.password || errors.password_confirmation} className="mt-1.5" />
                    </Group>

                    <div className="space-y-4 border-t border-black/[0.06] pt-5">
                        <label className="flex items-start gap-2.5 text-[13px] leading-snug text-[#5F5E58]">
                            <input type="checkbox" name="terms" required checked={data.terms} onChange={(e) => setData('terms', e.target.checked)}
                                className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/20 text-[#141412] focus:ring-0" />
                            <span>J’accepte les <Link href={route('legal.terms')} target="_blank" className="text-[#141412] underline underline-offset-2">conditions</Link> et la <Link href={route('legal.privacy')} target="_blank" className="text-[#141412] underline underline-offset-2">politique de confidentialité</Link>.</span>
                        </label>
                        <InputError message={errors.terms} />
                        <button type="submit" disabled={processing} className={primaryButtonClass}>
                            {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Création du compte…</> : <>Créer mon compte <ArrowRight className="h-4 w-4" /></>}
                        </button>
                        <p className="text-center text-[13px] text-[#8B8A83]">Gratuit, sans carte bancaire. Vous choisirez ensuite votre activité et votre style.</p>
                    </div>
                </form>
            </AuthShell>
        </>
    );
}
