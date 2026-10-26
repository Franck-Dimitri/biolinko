import InputError from '@/Components/InputError';
import AuthShell, { fieldClass, labelClass, primaryButtonClass } from '@/Components/AuthShell';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Mot de passe oublié, Biolinko" />
            <AuthShell
                title="Mot de passe oublié"
                subtitle="Indiquez l’adresse e-mail de votre compte, nous vous envoyons un lien pour choisir un nouveau mot de passe."
                footer={<>Vous vous en souvenez ? <Link href={route('login')} className="font-medium text-[#141412] underline underline-offset-4">Se connecter</Link></>}
            >
                {status && <div className="mb-6 rounded-xl bg-[#F0FDF4] p-4 text-[14px] text-[#15803D]">{status}</div>}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className={labelClass}>Adresse e-mail</label>
                        <input id="email" type="email" name="email" value={data.email} required autoFocus autoComplete="username"
                            placeholder="vous@exemple.com" className={fieldClass} onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>
                    <button type="submit" disabled={processing} className={primaryButtonClass}>
                        {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Envoi…</> : <>Envoyer le lien <ArrowRight className="h-4 w-4" /></>}
                    </button>
                </form>
            </AuthShell>
        </>
    );
}
