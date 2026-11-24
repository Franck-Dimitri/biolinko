import InputError from '@/Components/UI/InputError';
import PlanIntentBanner from '@/Components/Dashboard/PlanIntentBanner';
import AuthShell, { fieldClass, primaryButtonClass } from '@/Layouts/AuthShell';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import SlugField, { slugify, useSlugCheck } from '@/Components/Store/SlugField';

/** « maison-ngono » → « Maison Ngono » (adresse réservée sur la landing). */
const displayName = (slug) => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

/*
 * Inscription en 3 étapes courtes : vous (nom, e-mail, WhatsApp), votre boutique (nom + adresse vérifiée en direct),
 * votre mot de passe. Chaque étape est vérifiée avant la suivante ; une erreur du serveur ramène à la bonne étape.
 */
// Étapes du formulaire et champs vérifiés à chacune
const STEPS = [
    ['Vous', ['name', 'email', 'phone_whatsapp']],
    ['Boutique', ['store_name', 'store_slug']],
    ['Mot de passe', ['password', 'password_confirmation', 'terms']],
];

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

    const [step, setStep] = useState(0);
    const [local, setLocal] = useState({});
    const errorOf = (k) => local[k] || errors[k];

    // Erreur renvoyée par le serveur : retour à l'étape du champ concerné
    useEffect(() => {
        const i = STEPS.findIndex(([, fields]) => fields.some((f) => errors[f]));
        if (i > -1 && i < step) setStep(i);
    }, [errors]);

    const validate = (i) => {
        const e = {};
        if (i === 0) {
            if (data.name.trim().length < 2) e.name = 'Indiquez votre nom complet.';
            if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) e.email = 'Entrez une adresse e-mail valide.';
            const digits = data.phone_whatsapp.replace(/\D/g, '').replace(/^237/, '');
            if (!/^6\d{8}$/.test(digits)) e.phone_whatsapp = 'Entrez un numéro WhatsApp à 9 chiffres (6XX XX XX XX).';
        }
        if (i === 1) {
            if (data.store_name.trim().length < 2) e.store_name = 'Donnez un nom à votre boutique.';
            if (check.status === 'taken') e.store_slug = 'Cette adresse est déjà prise : choisissez une des propositions.';
            else if (check.status === 'invalid' || data.store_slug.length < 3) e.store_slug = 'L’adresse doit faire au moins 3 caractères.';
        }
        if (i === 2) {
            if (data.password.length < 8) e.password = 'Le mot de passe doit faire au moins 8 caractères.';
            else if (data.password !== data.password_confirmation) e.password = 'Les deux mots de passe ne sont pas identiques.';
            if (!data.terms) e.terms = 'Acceptez les conditions pour créer votre compte.';
        }
        setLocal(e);
        if (Object.keys(e).length) document.getElementById(Object.keys(e)[0])?.focus();
        return !Object.keys(e).length;
    };

    const submit = (e) => {
        e.preventDefault();
        if (!validate(step)) return;
        if (step < STEPS.length - 1) { setStep(step + 1); return; }
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    const input = (name, label, placeholder, props = {}, hint = null) => (
        <div>
            <Label htmlFor={name} hint={hint}>{label}</Label>
            <input id={name} name={name} value={data[name]} placeholder={placeholder} required
                className={fieldClass} onChange={(e) => setData(name, e.target.value)} {...props} />
            <InputError message={errorOf(name)} className="mt-1.5" />
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

                <form onSubmit={submit} noValidate>
                    {/* Étapes */}
                    <ol className="mb-6 flex items-center gap-2" aria-label="Étapes de l’inscription">
                        {STEPS.map(([label], i) => (
                            <li key={label} className="flex min-w-0 flex-1 items-center gap-2">
                                <button type="button" disabled={i > step} onClick={() => setStep(i)} aria-current={i === step ? 'step' : undefined}
                                    className="flex min-w-0 items-center gap-2 text-left disabled:cursor-default">
                                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-colors ${i < step ? 'bg-[#16A34A] text-white' : i === step ? 'bg-[#141412] text-white' : 'bg-[#F2F1EC] text-[#8B8A83]'}`}>
                                        {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                                    </span>
                                    <span className={`truncate text-[13px] ${i === step ? 'font-medium text-[#141412]' : 'hidden text-[#8B8A83] sm:inline'}`}>{label}</span>
                                </button>
                                {i < STEPS.length - 1 && <span className={`h-px min-w-3 flex-1 ${i < step ? 'bg-[#16A34A]' : 'bg-black/10'}`} aria-hidden />}
                            </li>
                        ))}
                    </ol>

                    <AnimatePresence mode="wait">
                        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-4">
                            {step === 0 && (
                                <>
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
                                        <InputError message={errorOf('phone_whatsapp')} className="mt-1.5" />
                                    </div>
                                </>
                            )}

                            {step === 1 && (
                                <>
                                    <div>
                                        <Label htmlFor="store_name">Nom de la boutique</Label>
                                        <input id="store_name" name="store_name" value={data.store_name} placeholder="Ex. Les Douceurs d’Awa" autoFocus
                                            required maxLength={60} autoComplete="organization" className={fieldClass} onChange={(e) => setStoreName(e.target.value)} />
                                        <InputError message={errorOf('store_name')} className="mt-1.5" />
                                    </div>
                                    <div>
                                        <Label htmlFor="store_slug" hint="Modifiable plus tard">Adresse de la boutique</Label>
                                        <SlugField value={data.store_slug} check={check}
                                            onChange={(v) => { setSlugTouched(true); setData('store_slug', v); }} />
                                        <InputError message={errorOf('store_slug')} className="mt-1" />
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <div>
                                        <Label htmlFor="password">Mot de passe</Label>
                                        <div className="relative">
                                            <input id="password" name="password" type={passwordType} value={data.password} placeholder="8 caractères minimum" autoFocus
                                                required autoComplete="new-password" className={`${fieldClass} pr-11`} onChange={(e) => setData('password', e.target.value)} />
                                            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
                                                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#8B8A83] hover:text-[#141412]">
                                                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="password_confirmation">Confirmation</Label>
                                        <input id="password_confirmation" name="password_confirmation" type={passwordType} value={data.password_confirmation}
                                            placeholder="Répétez-le" required autoComplete="new-password" className={fieldClass} onChange={(e) => setData('password_confirmation', e.target.value)} />
                                        <InputError message={errorOf('password') || errorOf('password_confirmation')} className="mt-1.5" />
                                    </div>
                                    <label className="flex items-start gap-2.5 pt-1 text-[13px] leading-snug text-[#5F5E58]">
                                        <input id="terms" type="checkbox" name="terms" required checked={data.terms} onChange={(e) => setData('terms', e.target.checked)}
                                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/20 text-[#141412] focus:ring-0" />
                                        <span>J’accepte les <Link href={route('legal.terms')} target="_blank" className="text-[#141412] underline underline-offset-2">conditions</Link> et la <Link href={route('legal.privacy')} target="_blank" className="text-[#141412] underline underline-offset-2">politique de confidentialité</Link>.</span>
                                    </label>
                                    <InputError message={errorOf('terms')} />
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-6 flex items-center gap-3">
                        {step > 0 && (
                            <button type="button" onClick={() => { setLocal({}); setStep(step - 1); }} aria-label="Étape précédente"
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/15 text-[#141412] hover:border-black/40"><ArrowLeft className="h-4 w-4" /></button>
                        )}
                        <button type="submit" disabled={processing || (step === 1 && check.status === 'checking')} className={primaryButtonClass}>
                            {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Création du compte…</>
                                : step < STEPS.length - 1 ? <>Continuer <ArrowRight className="h-4 w-4" /></> : <>Créer mon compte <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </div>
                    <p className="mt-4 text-center text-[13px] text-[#8B8A83]">Gratuit, sans carte bancaire. Étape {step + 1} sur {STEPS.length}.</p>
                </form>
            </AuthShell>
        </>
    );
}
