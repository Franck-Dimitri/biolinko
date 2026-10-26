import InputError from '@/Components/InputError';
import AuthShell, { fieldClass, labelClass, primaryButtonClass } from '@/Components/AuthShell';
import { Head, useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Confirmer le mot de passe, Biolinko" />
            <AuthShell title="Confirmez votre identité" subtitle="Cette zone est protégée. Saisissez votre mot de passe pour continuer.">
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="password" className={labelClass}>Mot de passe</label>
                        <input id="password" type="password" name="password" value={data.password} required autoFocus autoComplete="current-password"
                            placeholder="••••••••" className={fieldClass} onChange={(e) => setData('password', e.target.value)} />
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>
                    <button type="submit" disabled={processing} className={primaryButtonClass}>
                        {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Vérification…</> : 'Confirmer'}
                    </button>
                </form>
            </AuthShell>
        </>
    );
}
