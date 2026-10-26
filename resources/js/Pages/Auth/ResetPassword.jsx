import InputError from '@/Components/InputError';
import AuthShell, { fieldClass, labelClass, primaryButtonClass } from '@/Components/AuthShell';
import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <>
            <Head title="Nouveau mot de passe, Biolinko" />
            <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe d’au moins 8 caractères.">
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className={labelClass}>Adresse e-mail</label>
                        <input id="email" type="email" name="email" value={data.email} required autoComplete="username"
                            className={fieldClass} onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>
                    <div>
                        <label htmlFor="password" className={labelClass}>Nouveau mot de passe</label>
                        <input id="password" type="password" name="password" value={data.password} required autoFocus autoComplete="new-password"
                            placeholder="••••••••" className={fieldClass} onChange={(e) => setData('password', e.target.value)} />
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>
                    <div>
                        <label htmlFor="password_confirmation" className={labelClass}>Confirmer le mot de passe</label>
                        <input id="password_confirmation" type="password" name="password_confirmation" value={data.password_confirmation} required autoComplete="new-password"
                            placeholder="••••••••" className={fieldClass} onChange={(e) => setData('password_confirmation', e.target.value)} />
                        <InputError message={errors.password_confirmation} className="mt-1.5" />
                    </div>
                    <button type="submit" disabled={processing} className={primaryButtonClass}>
                        {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…</> : <>Enregistrer le mot de passe <ArrowRight className="h-4 w-4" /></>}
                    </button>
                </form>
            </AuthShell>
        </>
    );
}
