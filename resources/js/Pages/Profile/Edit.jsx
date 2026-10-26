import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Crown, Eye, EyeOff, KeyRound, Lock, ShieldAlert, Store, User } from 'lucide-react';
import { Badge, Button, Card, CardHeader, Field, PageHeader, fieldClass, shortDate } from '@/Components/Dashboard/UI';

const PLAN_LABEL = { starter: 'Starter', pro: 'Pro', growth: 'Growth', business: 'Business' };
const SECTIONS = [['profil', 'Profil', User], ['securite', 'Sécurité', KeyRound], ['abonnement', 'Abonnement et boutique', Crown], ['suppression', 'Supprimer le compte', ShieldAlert]];

function PasswordInput({ id, value, onChange, autoComplete }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <input id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} className={`${fieldClass} pr-11`} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Masquer' : 'Afficher'} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#8B8A83] hover:bg-black/5">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}

function ProfileForm({ user, mustVerifyEmail, status }) {
    const { data, setData, patch, processing, errors, isDirty } = useForm({ name: user.name, email: user.email, phone_whatsapp: user.phone_whatsapp || '' });
    return (
        <Card>
            <CardHeader title="Profil" sub="Ces informations apparaissent sur vos factures et servent à vous contacter." />
            <form onSubmit={(e) => { e.preventDefault(); patch(route('profile.update'), { preserveScroll: true }); }} className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#141412] text-[24px] font-medium text-white">{data.name.charAt(0).toUpperCase() || '?'}</span>
                    <div>
                        <p className="text-[16px] font-medium text-[#141412]">{data.name}</p>
                        <p className="text-[14px] text-[#8B8A83]">{data.email}</p>
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nom complet" error={errors.name}><input value={data.name} onChange={(e) => setData('name', e.target.value)} required autoComplete="name" className={fieldClass} /></Field>
                    <Field label="Numéro WhatsApp" hint="Pour les alertes de ventes et vos retraits." error={errors.phone_whatsapp}>
                        <input type="tel" value={data.phone_whatsapp} onChange={(e) => setData('phone_whatsapp', e.target.value)} placeholder="+237 6XX XX XX XX" autoComplete="tel" className={fieldClass} />
                    </Field>
                </div>
                <Field label="Adresse e-mail" hint={data.email !== user.email ? 'Vous devrez valider la nouvelle adresse.' : undefined} error={errors.email}>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoComplete="username" className={fieldClass} />
                </Field>
                {mustVerifyEmail && user.email_verified_at === null && (
                    <p className="rounded-2xl bg-[#FFFBEA] p-4 text-[14px] text-[#141412]">
                        Votre adresse e-mail n’est pas vérifiée. <Link href={route('verification.send')} method="post" as="button" className="underline underline-offset-2">Renvoyer le code</Link>
                        {status === 'verification-link-sent' && <span className="mt-1 block text-[#15803D]">Un nouveau code vient de vous être envoyé.</span>}
                    </p>
                )}
                <div className="flex justify-end"><Button variant="primary" type="submit" disabled={processing || !isDirty}>Enregistrer</Button></div>
            </form>
        </Card>
    );
}

function PasswordForm() {
    const { data, setData, put, processing, errors, reset } = useForm({ current_password: '', password: '', password_confirmation: '' });
    const strength = [data.password.length >= 8, /[A-Z]/.test(data.password), /\d/.test(data.password), /[^A-Za-z0-9]/.test(data.password)].filter(Boolean).length;
    return (
        <Card>
            <CardHeader title="Sécurité" sub="Utilisez un mot de passe long, que vous n’utilisez nulle part ailleurs." />
            <form onSubmit={(e) => { e.preventDefault(); put(route('password.update'), { preserveScroll: true, onSuccess: () => reset() }); }} className="mt-6 space-y-4">
                <Field label="Mot de passe actuel" error={errors.current_password}><PasswordInput id="current_password" value={data.current_password} onChange={(e) => setData('current_password', e.target.value)} autoComplete="current-password" /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nouveau mot de passe" error={errors.password}>
                        <PasswordInput id="password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="new-password" />
                        {data.password && (
                            <div className="mt-2 flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? (strength >= 3 ? 'bg-[#16A34A]' : 'bg-[#FFCC00]') : 'bg-[#F2F1EC]'}`} />)}</div>
                        )}
                    </Field>
                    <Field label="Confirmation" error={errors.password_confirmation}><PasswordInput id="password_confirmation" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} autoComplete="new-password" /></Field>
                </div>
                <div className="flex justify-end"><Button variant="primary" type="submit" disabled={processing || !data.password}><Lock className="h-4 w-4" /> Mettre à jour</Button></div>
            </form>
        </Card>
    );
}

function AccountSummary({ account }) {
    const plan = account?.plan || 'starter';
    return (
        <Card>
            <CardHeader title="Abonnement et boutique" />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#F6F5F1] p-4">
                    <p className="flex items-center gap-2 text-[14px] text-[#5F5E58]"><Crown className="h-4 w-4" /> Plan</p>
                    <p className="mt-1 text-[18px] font-medium text-[#141412]">{PLAN_LABEL[plan]}</p>
                    <p className="text-[13px] text-[#8B8A83]">{plan !== 'starter' && account.expires_at ? `Jusqu’au ${shortDate(account.expires_at)}` : 'Gratuit'}</p>
                    <Link href={route('seller.subscriptions.index')} className="mt-3 inline-flex items-center gap-1 text-[14px] text-[#141412] underline underline-offset-2">Gérer l’abonnement</Link>
                </div>
                {account?.store && (
                    <div className="rounded-2xl bg-[#F6F5F1] p-4">
                        <p className="flex items-center gap-2 text-[14px] text-[#5F5E58]"><Store className="h-4 w-4" /> Boutique</p>
                        <p className="mt-1 text-[18px] font-medium text-[#141412]">{account.store.name}</p>
                        <p className="text-[13px] text-[#8B8A83]">biolinko.link/{account.store.slug} · <Badge tone={account.store.is_published ? 'success' : 'warning'}>{account.store.is_published ? 'En ligne' : 'Non publiée'}</Badge></p>
                        <a href={`/${account.store.slug}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[14px] text-[#141412] underline underline-offset-2">Voir la boutique <ArrowUpRight className="h-4 w-4" /></a>
                    </div>
                )}
            </div>
            {account?.member_since && <p className="mt-4 text-[13px] text-[#8B8A83]">Membre depuis le {shortDate(account.member_since)}.</p>}
        </Card>
    );
}

function DeleteAccount() {
    const [open, setOpen] = useState(false);
    const { data, setData, delete: destroy, processing, errors, reset } = useForm({ password: '' });
    return (
        <Card className="border-red-100">
            <CardHeader title="Supprimer le compte" sub="Votre boutique, vos produits et votre historique seront définitivement supprimés." />
            {!open ? (
                <div className="mt-5"><Button variant="danger" onClick={() => setOpen(true)}>Supprimer mon compte</Button></div>
            ) : (
                <form onSubmit={(e) => { e.preventDefault(); destroy(route('profile.destroy'), { preserveScroll: true }); }} className="mt-5 space-y-4 rounded-2xl border border-red-100 bg-red-50/50 p-5">
                    <p className="text-[14px] text-[#141412]">Cette action est irréversible. Pensez à retirer d’abord le solde de votre portefeuille.</p>
                    <Field label="Confirmez avec votre mot de passe" error={errors.password}><PasswordInput id="delete_password" value={data.password} onChange={(e) => setData('password', e.target.value)} autoComplete="current-password" /></Field>
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => { setOpen(false); reset(); }}>Annuler</Button>
                        <Button variant="danger" type="submit" disabled={processing || !data.password}>Supprimer définitivement</Button>
                    </div>
                </form>
            )}
        </Card>
    );
}

export default function Edit({ mustVerifyEmail, status, account }) {
    const user = usePage().props.auth.user;
    const [active, setActive] = useState('profil');

    useEffect(() => {
        const obs = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: '-30% 0px -60% 0px' });
        SECTIONS.forEach(([id]) => { const el = document.getElementById(id); if (el) obs.observe(el); });
        return () => obs.disconnect();
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Mon compte, Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Mon compte" sub="Vos informations personnelles, votre sécurité et votre abonnement." />
                <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                    <nav className="hidden lg:block" aria-label="Sections du compte">
                        <div className="sticky top-24 space-y-0.5">
                            {SECTIONS.map(([id, label, Icon]) => (
                                <a key={id} href={`#${id}`} className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] transition-colors ${active === id ? 'bg-[#FFF6CC] font-medium text-[#141412]' : 'text-[#5F5E58] hover:bg-[#F6F5F1] hover:text-[#141412]'}`}>
                                    <Icon className="h-4 w-4" /> {label}
                                </a>
                            ))}
                        </div>
                    </nav>
                    <div className="max-w-3xl space-y-4">
                        <div id="profil" className="scroll-mt-24"><ProfileForm user={user} mustVerifyEmail={mustVerifyEmail} status={status} /></div>
                        <div id="securite" className="scroll-mt-24"><PasswordForm /></div>
                        <div id="abonnement" className="scroll-mt-24"><AccountSummary account={account} /></div>
                        <div id="suppression" className="scroll-mt-24"><DeleteAccount /></div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
