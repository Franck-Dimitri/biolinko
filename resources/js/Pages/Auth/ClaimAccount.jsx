import InputError from '@/Components/UI/InputError';
import AuthShell, { fieldClass, primaryButtonClass } from '@/Layouts/AuthShell';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

/** Le vendeur ouvre le lien reçu de l'équipe : il choisit son mot de passe et prend la main sur sa boutique. */
export default function ClaimAccount({ name, email, storeName, action }) {
    const { data, setData, post, processing, errors, reset } = useForm({ password: '', password_confirmation: '', terms: false });
    const [show, setShow] = useState(false);
    const type = show ? 'text' : 'password';
    const submit = (e) => {
        e.preventDefault();
        post(action, { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <>
            <Head title="Votre boutique vous attend, Biolinko" />
            <AuthShell title={`Bienvenue ${name?.split(' ')[0] || ''}`.trim()}
                subtitle={storeName ? <>Votre boutique <b className="font-medium text-[#141412]">{storeName}</b> est prête. Choisissez votre mot de passe pour y accéder.</> : 'Choisissez votre mot de passe pour accéder à votre boutique.'}>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <span className="mb-1.5 block text-[14px] font-medium text-[#141412]">Votre e-mail de connexion</span>
                        <p className="flex h-12 items-center rounded-xl bg-[#F6F5F1] px-4 text-[15px] text-[#141412]">{email}</p>
                    </div>
                    <div>
                        <label htmlFor="password" className="mb-1.5 block text-[14px] font-medium text-[#141412]">Mot de passe</label>
                        <div className="relative">
                            <input id="password" type={type} value={data.password} placeholder="8 caractères minimum" autoFocus required autoComplete="new-password"
                                className={`${fieldClass} pr-11`} onChange={(e) => setData('password', e.target.value)} />
                            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
                                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#8B8A83] hover:text-[#141412]">
                                {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password_confirmation" className="mb-1.5 block text-[14px] font-medium text-[#141412]">Confirmation</label>
                        <input id="password_confirmation" type={type} value={data.password_confirmation} placeholder="Répétez-le" required autoComplete="new-password"
                            className={fieldClass} onChange={(e) => setData('password_confirmation', e.target.value)} />
                        <InputError message={errors.password || errors.password_confirmation} className="mt-1.5" />
                    </div>
                    <label className="flex items-start gap-2.5 pt-1 text-[13px] leading-snug text-[#5F5E58]">
                        <input id="terms" type="checkbox" required checked={data.terms} onChange={(e) => setData('terms', e.target.checked)}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/20 text-[#141412] focus:ring-0" />
                        <span>J’accepte les <Link href={route('legal.terms')} target="_blank" className="text-[#141412] underline underline-offset-2">conditions</Link> et la <Link href={route('legal.privacy')} target="_blank" className="text-[#141412] underline underline-offset-2">politique de confidentialité</Link>.</span>
                    </label>
                    <InputError message={errors.terms} />
                    <button type="submit" disabled={processing} className={primaryButtonClass}>
                        {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Un instant…</> : <>Accéder à ma boutique <ArrowRight className="h-4 w-4" /></>}
                    </button>
                    <p className="text-center text-[13px] text-[#8B8A83]">Vous seul connaissez ce mot de passe. L’équipe Biolinko n’aura plus accès à votre espace.</p>
                </form>
            </AuthShell>
        </>
    );
}
