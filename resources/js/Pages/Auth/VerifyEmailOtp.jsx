import InputError from '@/Components/InputError';
import AuthShell, { primaryButtonClass } from '@/Components/AuthShell';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react';

export default function VerifyEmailOtp({ email, status }) {
    const { data, setData, post, processing, errors } = useForm({ otp: '' });
    const resend = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.verify_otp'));
    };

    return (
        <>
            <Head title="Vérifier votre e-mail, Biolinko" />
            <AuthShell
                title="Vérifiez votre e-mail"
                subtitle={<>Saisissez le code à 6 chiffres envoyé à <strong className="font-medium text-[#141412] [overflow-wrap:anywhere]">{email}</strong>. Il est valable 15 minutes.</>}
                footer={<>Mauvaise adresse ? <Link href={route('logout')} method="post" as="button" className="font-medium text-[#141412] underline underline-offset-4">Se déconnecter</Link> et recommencer l’inscription.</>}
            >
                {status && <div className="mb-6 rounded-xl bg-[#F0FDF4] p-4 text-[14px] text-[#15803D]">{status}</div>}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="otp" className="sr-only">Code de vérification</label>
                        <input id="otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus
                            placeholder="000000" value={data.otp}
                            onChange={(e) => setData('otp', e.target.value.replace(/[^0-9]/g, ''))}
                            className="h-14 w-full rounded-xl border border-black/10 bg-white px-4 text-center font-mono text-[24px] tracking-[0.5em] text-[#141412] placeholder:text-[#D4D3CD] focus:border-black/30 focus:ring-0" />
                        <InputError message={errors.otp} className="mt-1.5" />
                    </div>

                    <button type="submit" disabled={processing || data.otp.length < 6} className={primaryButtonClass}>
                        {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Vérification…</> : <>Activer mon compte <ArrowRight className="h-4 w-4" /></>}
                    </button>
                </form>

                <p className="mt-6 text-center text-[14px] text-[#5F5E58]">
                    Pas reçu ? Vérifiez vos spams, ou{' '}
                    <button type="button" disabled={resend.processing} onClick={() => resend.post(route('verification.resend_otp'), { preserveScroll: true })}
                        className="inline-flex items-center gap-1 font-medium text-[#141412] underline underline-offset-4 disabled:opacity-50">
                        <RefreshCw className={`h-3.5 w-3.5 ${resend.processing ? 'animate-spin' : ''}`} /> renvoyer un code
                    </button>
                </p>
            </AuthShell>
        </>
    );
}
