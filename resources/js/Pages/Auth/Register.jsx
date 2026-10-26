import InputError from '@/Components/InputError';
import PlanIntentBanner from '@/Components/PlanIntentBanner';
import AuthShell, { fieldClass, labelClass, primaryButtonClass } from '@/Components/AuthShell';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Register({ intendedPlan = null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone_whatsapp: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Créer un compte, Biolinko" />
            <AuthShell
                title="Créez votre boutique"
                subtitle={<>Déjà inscrit ? <Link href={route('login', intendedPlan ? { plan: intendedPlan } : {})} className="font-medium text-[#141412] underline underline-offset-4">Se connecter</Link></>}
                footer={<>Votre boutique sera accessible à l’adresse <span className="font-medium text-[#141412]">biolinko.link/votre-boutique</span>.</>}
            >
                <PlanIntentBanner plan={intendedPlan} action="Créez votre compte et validez votre e-mail :" />

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className={labelClass}>Nom ou nom de la boutique</label>
                        <input id="name" type="text" name="name" value={data.name} required autoFocus autoComplete="name"
                            placeholder="Ex. Maison Ngono" className={fieldClass} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} className="mt-1.5" />
                    </div>

                    <div>
                        <label htmlFor="email" className={labelClass}>Adresse e-mail</label>
                        <input id="email" type="email" name="email" value={data.email} required autoComplete="email"
                            placeholder="vous@exemple.com" className={fieldClass} onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>

                    <div>
                        <label htmlFor="phone_whatsapp" className={labelClass}>Numéro WhatsApp <span className="font-normal text-[#8B8A83]">(alertes de ventes)</span></label>
                        <input id="phone_whatsapp" type="tel" name="phone_whatsapp" value={data.phone_whatsapp} autoComplete="tel"
                            placeholder="+237 6XX XX XX XX" className={fieldClass} onChange={(e) => setData('phone_whatsapp', e.target.value)} />
                        <InputError message={errors.phone_whatsapp} className="mt-1.5" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="password" className={labelClass}>Mot de passe</label>
                            <input id="password" type="password" name="password" value={data.password} required autoComplete="new-password"
                                placeholder="••••••••" className={fieldClass} onChange={(e) => setData('password', e.target.value)} />
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" className={labelClass}>Confirmation</label>
                            <input id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation} required autoComplete="new-password"
                                placeholder="••••••••" className={fieldClass} onChange={(e) => setData('password_confirmation', e.target.value)} />
                            <InputError message={errors.password_confirmation} className="mt-1.5" />
                        </div>
                    </div>

                    <label className="flex items-start gap-2 pt-1 text-[14px] text-[#5F5E58]">
                        <input type="checkbox" name="terms" required checked={data.terms} onChange={(e) => setData('terms', e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-black/20 text-[#141412] focus:ring-0" />
                        <span>J’accepte les <Link href={route('legal.terms')} target="_blank" className="text-[#141412] underline underline-offset-2">conditions d’utilisation</Link> et la <Link href={route('legal.privacy')} target="_blank" className="text-[#141412] underline underline-offset-2">politique de confidentialité</Link>.</span>
                    </label>

                    <button type="submit" disabled={processing} className={primaryButtonClass}>
                        {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Création du compte…</> : <>Créer mon compte <ArrowRight className="h-4 w-4" /></>}
                    </button>
                </form>
            </AuthShell>
        </>
    );
}
