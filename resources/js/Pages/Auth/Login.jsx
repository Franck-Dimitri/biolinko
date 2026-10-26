import InputError from '@/Components/InputError';
import PlanIntentBanner from '@/Components/PlanIntentBanner';
import AuthShell, { fieldClass, labelClass, primaryButtonClass } from '@/Components/AuthShell';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Login({ status, canResetPassword, intendedPlan = null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Se connecter, Biolinko" />
            <AuthShell
                title="Bon retour parmi nous"
                subtitle={<>Pas encore de compte ? <Link href={route('register', intendedPlan ? { plan: intendedPlan } : {})} className="font-medium text-[#141412] underline underline-offset-4">Créer un compte</Link></>}
            >
                <PlanIntentBanner plan={intendedPlan} action="Connectez-vous :" />

                {status && <div className="mb-6 rounded-xl bg-[#F0FDF4] p-4 text-[14px] text-[#15803D]">{status}</div>}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className={labelClass}>Adresse e-mail</label>
                        <input id="email" type="email" name="email" value={data.email} required autoFocus autoComplete="username"
                            placeholder="vous@exemple.com" className={fieldClass} onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>

                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <label htmlFor="password" className="text-[14px] font-medium text-[#141412]">Mot de passe</label>
                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-[13px] text-[#5F5E58] hover:text-[#141412]">Mot de passe oublié ?</Link>
                            )}
                        </div>
                        <input id="password" type="password" name="password" value={data.password} required autoComplete="current-password"
                            placeholder="••••••••" className={fieldClass} onChange={(e) => setData('password', e.target.value)} />
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <label className="flex items-center gap-2 text-[14px] text-[#5F5E58]">
                        <input type="checkbox" name="remember" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-black/20 text-[#141412] focus:ring-0" />
                        Se souvenir de moi
                    </label>

                    <button type="submit" disabled={processing} className={primaryButtonClass}>
                        {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Connexion…</> : <>Se connecter <ArrowRight className="h-4 w-4" /></>}
                    </button>
                </form>
            </AuthShell>
        </>
    );
}
