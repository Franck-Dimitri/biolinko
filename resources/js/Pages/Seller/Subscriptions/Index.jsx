import UpgradeHint from '@/Components/Dashboard/UpgradeHint';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { AlertCircle, Check, Crown, RefreshCw, Smartphone } from 'lucide-react';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import { BackButton, Badge, Button, Card, CardHeader, SubPage, Empty, Field, PageHeader, Table, Tabs, fcfa, fieldClass, reveal, shortDate } from '@/Components/Dashboard/UI';

const CYCLES = [[1, '1 mois', 0], [12, '1 an', 0.15], [24, '2 ans', 0.2]];
const pricing = (monthly, months) => {
    const rate = CYCLES.find(([m]) => m === months)?.[2] || 0;
    const full = monthly * months;
    const total = Math.round(full * (1 - rate));
    return { total, perMonth: Math.round(total / months), savings: full - total };
};
const PAY_STATUS = { paid: ['Payé', 'success'], pending: ['En attente', 'warning'], failed: ['Échoué', 'danger'] };

const RANK = { starter: 0, pro: 1, growth: 2, business: 3 };
const PLAN_NAMES = { starter: 'Starter', pro: 'Pro', growth: 'Growth', business: 'Business' };

function Step({ n, title, children }) {
    return (
        <section className="rounded-3xl border border-black/[0.06] bg-white p-6">
            <h2 className="flex items-center gap-3 text-[16px] font-medium text-[#141412]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#141412] text-[13px] text-white">{n}</span>{title}
            </h2>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function PayDialog({ plan, cycle, setCycle, user, onClose, onStarted }) {
    const [phone, setPhone] = useState((user.phone_whatsapp || '').replace(/\D/g, '').replace(/^237/, ''));
    const [operator, setOperator] = useState(null);
    const [busy, setBusy] = useState(false);
    const [showFeatures, setShowFeatures] = useState(false);
    const detected = /^(237)?6(9|4|5[5-9])/.test(phone.replace(/\D/g, '')) ? 'ORANGE' : 'MTN';
    const op = operator || detected;
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
    if (!plan) return null;

    const activePaid = user.is_active && user.plan !== 'starter' && user.subscription_expires_at;
    const isRenewal = activePaid && plan.id === user.plan;
    const change = activePaid && plan.id !== user.plan ? (RANK[plan.id] > RANK[user.plan] ? 'upgrade' : 'downgrade') : null;
    const fmt = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const currentEnd = activePaid ? new Date(user.subscription_expires_at.replace(' ', 'T')) : null;
    const bonusDays = change ? (user.conversion_days?.[plan.id] || 0) : 0;
    const until = (() => { const from = isRenewal ? new Date(currentEnd) : new Date(); from.setMonth(from.getMonth() + cycle); from.setDate(from.getDate() + bonusDays); return fmt(from); })();
    const p = pricing(plan.price, cycle);
    const title = isRenewal ? `Prolonger le plan ${plan.name}` : change === 'downgrade' ? `Passer au plan ${plan.name}` : `Passer au plan ${plan.name}`;

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
            const { data } = await axios.post(route('seller.subscriptions.subscribe'), { plan: plan.id, phone_momo: phone, operator: op, cycle });
            if (data.requires_ussd) onStarted(data);
        } catch (err) {
            toast.error(err.response?.data?.error || err.response?.data?.message || 'Le paiement n’a pas pu être lancé. Vérifiez le numéro.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[980px] space-y-6 pb-12">
            <div>
                <BackButton onClick={onClose} label="Retour aux plans" />
                <h1 className="text-[28px] font-medium tracking-[-0.03em] text-[#141412]">{title}</h1>
                <p className="mt-1 text-[15px] text-[#5F5E58]">{plan.tagline}</p>
            </div>

            {change && (
                <div className="flex gap-3 rounded-2xl border border-[#FFCC00]/60 bg-[#FFFBEA] p-4 text-[14px] text-[#141412]">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                        Le plan {plan.name} remplace votre plan <strong className="font-medium">{PLAN_NAMES[user.plan]}</strong> dès le paiement confirmé.{' '}
                        {bonusDays > 0
                            ? <>Vos {user.days_remaining} jours restants ne sont pas perdus : ils deviennent <strong className="font-medium">{bonusDays} jour{bonusDays > 1 ? 's' : ''} offert{bonusDays > 1 ? 's' : ''}</strong> de {plan.name}.</>
                            : <>Il reste moins d’un jour de {PLAN_NAMES[user.plan]}, rien à convertir.</>}
                    </p>
                </div>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                    <Step n={1} title="Durée">
                        <div className="divide-y divide-black/[0.06] overflow-hidden rounded-2xl border border-black/[0.08]" role="radiogroup" aria-label="Durée">
                            {CYCLES.map(([m, label, rate]) => {
                                const on = cycle === m;
                                const pr = pricing(plan.price, m);
                                return (
                                    <label key={m} className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors ${on ? 'bg-[#FFFBEA]' : 'hover:bg-[#FAFAF8]'}`}>
                                        <input type="radio" name="cycle" checked={on} onChange={() => setCycle(m)} className="h-4 w-4 border-black/30 text-[#141412] focus:ring-0" />
                                        <span className="flex-1 text-[15px] text-[#141412]">{label}{rate > 0 && <Badge tone="brand" className="ml-2">−{rate * 100} %</Badge>}</span>
                                        <span className="text-right">
                                            <span className="block text-[15px] tabular-nums text-[#141412]">{fcfa(pr.total)}</span>
                                            {m > 1 && <span className="block text-[12px] tabular-nums text-[#8B8A83]">{fcfa(pr.perMonth)} / mois</span>}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </Step>

                    <Step n={2} title="Paiement Mobile Money">
                        <div className="grid grid-cols-2 gap-2">
                            {[['MTN', 'MTN MoMo'], ['ORANGE', 'Orange Money']].map(([id, label]) => (
                                <button key={id} type="button" aria-pressed={op === id} onClick={() => setOperator(id)}
                                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[14px] transition-colors ${op === id ? 'border-[#141412] bg-[#FFFBEA] font-medium' : 'border-black/[0.08] hover:border-black/25'}`}>
                                    <OperatorLogo op={id} className="h-7 w-7" /> {label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-4">
                            <Field label="Numéro qui va payer" hint="Vous recevrez une demande de validation sur ce téléphone.">
                                <div className="flex gap-2">
                                    <span className="flex h-11 items-center rounded-xl border border-black/10 bg-[#F6F5F1] px-3 text-[15px] text-[#5F5E58]">+237</span>
                                    <input type="tel" inputMode="numeric" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="6XX XX XX XX" className={fieldClass} />
                                </div>
                            </Field>
                        </div>
                    </Step>
                </div>

                {/* Récapitulatif */}
                <aside className="space-y-4 lg:sticky lg:top-24">
                    <div className="rounded-3xl border border-black/[0.06] bg-white p-6">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFCC00]"><Crown className="h-5 w-5 text-[#141412]" /></span>
                            <span><span className="block text-[16px] font-medium text-[#141412]">Plan {plan.name}</span><span className="text-[13px] text-[#8B8A83]">{CYCLES.find(([m]) => m === cycle)[1]}</span></span>
                        </div>
                        <dl className="mt-5 space-y-2 border-t border-black/[0.06] pt-4 text-[14px]">
                            <div className="flex justify-between text-[#5F5E58]"><dt>{fcfa(plan.price)} × {cycle} mois</dt><dd className="tabular-nums">{fcfa(plan.price * cycle)}</dd></div>
                            {p.savings > 0 && <div className="flex justify-between text-[#15803D]"><dt>Remise</dt><dd className="tabular-nums">−{fcfa(p.savings)}</dd></div>}
                            {bonusDays > 0 && <div className="flex justify-between text-[#15803D]"><dt>Jours restants convertis</dt><dd className="tabular-nums">+{bonusDays} j offert{bonusDays > 1 ? 's' : ''}</dd></div>}
                            <div className="flex items-baseline justify-between pt-2 text-[#141412]"><dt className="font-medium">Total</dt><dd className="text-[24px] font-medium tracking-[-0.02em] tabular-nums">{fcfa(p.total)}</dd></div>
                        </dl>
                        <p className="mt-1 text-[13px] text-[#8B8A83]">Actif jusqu’au {until} · sans renouvellement automatique</p>
                        <Button variant="primary" size="lg" type="submit" className="mt-5 w-full" disabled={busy || phone.replace(/\D/g, '').length < 9}>
                            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : null} Payer {fcfa(p.total)}
                        </Button>
                        <button type="button" onClick={onClose} className="mt-2 w-full py-2 text-[14px] text-[#5F5E58] hover:text-[#141412]">Annuler</button>
                    </div>

                    <div className="rounded-3xl border border-black/[0.06] bg-white p-5">
                        <button type="button" onClick={() => setShowFeatures((v) => !v)} className="flex w-full items-center justify-between text-[14px] text-[#141412]" aria-expanded={showFeatures}>
                            Ce qui est inclus <span className="text-[#8B8A83]">{showFeatures ? 'Masquer' : `${plan.features.length} avantages`}</span>
                        </button>
                        {showFeatures && (
                            <ul className="mt-4 space-y-2 text-[13px] text-[#3D3C37]">
                                {plan.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C99A00]" />{f}</li>)}
                            </ul>
                        )}
                    </div>
                </aside>
            </div>
        </motion.form>
    );
}

function PaymentWait({ payment, onClose }) {
    const [status, setStatus] = useState('PENDING');
    useEffect(() => {
        if (!payment || status !== 'PENDING') return;
        const t = setInterval(async () => {
            try {
                const { data } = await axios.get(route('seller.subscriptions.status', payment.reference));
                if (data.paid) {
                    setStatus('SUCCESS');
                    setTimeout(() => { window.location.href = route('seller.subscriptions.index'); }, 1500);
                } else if (data.status === 'FAILED') setStatus('FAILED');
            } catch (e) { /* nouvel essai au prochain tour */ }
        }, 3000);
        return () => clearInterval(t);
    }, [payment, status]);

    if (!payment) return null;
    return (
        <SubPage onClose={onClose} backLabel="Retour aux plans" width="max-w-xl" title={status === 'SUCCESS' ? 'Abonnement activé' : status === 'FAILED' ? 'Paiement non abouti' : 'Validez sur votre téléphone'}
            sub={status === 'PENDING' ? 'Cette page se met à jour dès que l’opérateur confirme le paiement.' : null}>
            <div className="py-4 text-center">
                <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${status === 'SUCCESS' ? 'bg-[#16A34A] text-white' : status === 'FAILED' ? 'bg-red-50 text-[#B91C1C]' : 'bg-[#FFCC00] text-[#141412]'}`}>
                    {status === 'SUCCESS' ? <Check className="h-8 w-8" /> : status === 'FAILED' ? <AlertCircle className="h-8 w-8" /> : <Smartphone className="h-7 w-7" />}
                </span>
                <p className="mx-auto mt-5 max-w-sm text-[15px] text-[#5F5E58]">
                    {status === 'SUCCESS' && `Votre plan ${payment.plan_name} est actif. Merci !`}
                    {status === 'FAILED' && 'Le paiement a été refusé ou annulé. Vous pouvez réessayer.'}
                    {status === 'PENDING' && <>Demande de <strong className="font-medium text-[#141412]">{fcfa(payment.amount)}</strong> envoyée au {payment.phone}. Tapez votre code secret pour valider.</>}
                </p>
                {status === 'PENDING' && <p className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#8B8A83]"><RefreshCw className="h-4 w-4 animate-spin" /> En attente de confirmation</p>}
                {status === 'FAILED' && <Button className="mt-5" variant="primary" onClick={onClose}>Choisir à nouveau</Button>}
            </div>
        </SubPage>
    );
}

export default function Index({ upgradeHint = null, user, plans = [], history = [], intendedPlan = null, simulation = false }) {
    const [cycle, setCycle] = useState(1);
    const [selected, setSelected] = useState(null);
    const [payment, setPayment] = useState(null);
    const current = plans.find((p) => p.id === user.plan) || plans[0];
    const isPaid = user.plan !== 'starter';
    const usage = Math.min(100, Math.round(((user.products_count || 0) / Math.max(1, user.max_products)) * 100));

    useEffect(() => {
        const plan = plans.find((p) => p.id === intendedPlan);
        if (plan && plan.price > 0) setSelected(plan);
    }, [intendedPlan]);

    return (
        <AuthenticatedLayout>
            <Head title="Abonnement, Biolinko" />
            {selected && (
                <PayDialog plan={selected} cycle={cycle} setCycle={setCycle} user={user} onClose={() => setSelected(null)}
                    onStarted={(data) => { setSelected(null); setPayment(data); }} />
            )}
            <PaymentWait payment={payment} onClose={() => setPayment(null)} />
            <div className="space-y-6 pb-12" hidden={!!selected || !!payment}>
                <PageHeader title="Abonnement" sub="−15 % en payant pour 1 an, −20 % pour 2 ans. Sans renouvellement automatique." />
                <UpgradeHint hint={upgradeHint} compact />

                {simulation && (
                    <div className="flex items-start gap-3 rounded-2xl border border-[#FFCC00]/60 bg-[#FFFBEA] p-4 text-[14px] text-[#141412]">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p><strong className="font-medium">Mode test</strong> : les paiements d’abonnement sont simulés, aucune somme n’est débitée.</p>
                    </div>
                )}

                {/* Plan actuel */}
                <Card>
                    <div className="grid gap-6 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
                        <div className="flex items-center gap-4">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFCC00]"><Crown className="h-5 w-5 text-[#141412]" /></span>
                            <div>
                                <p className="text-[14px] text-[#8B8A83]">Votre plan</p>
                                <p className="flex items-center gap-2 text-[22px] font-medium tracking-[-0.02em] text-[#141412]">
                                    {current?.name}
                                    {isPaid && <Badge tone={user.is_active ? 'success' : 'danger'}>{user.is_active ? 'Actif' : 'Expiré'}</Badge>}
                                </p>
                                <p className="text-[14px] text-[#5F5E58]">
                                    {isPaid
                                        ? (user.is_active ? `Jusqu’au ${shortDate(user.subscription_expires_at?.replace(' ', 'T'))} · ${user.days_remaining} jours restants` : 'Renouvelez pour retrouver vos avantages.')
                                        : 'Gratuit, sans limite de durée.'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[14px]"><span className="text-[#5F5E58]">Produits utilisés</span><span className="tabular-nums text-[#141412]">{user.products_count} / {user.max_products > 9999 ? '∞' : user.max_products}</span></div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F2F1EC]">
                                <motion.div className={`h-full rounded-full ${usage >= 90 ? 'bg-[#B91C1C]' : 'bg-[#FFCC00]'}`} initial={{ width: 0 }} animate={{ width: `${usage}%` }} transition={{ duration: 0.8 }} />
                            </div>
                        </div>
                        {isPaid && <Button variant="primary" onClick={() => setSelected(current)}>{user.is_active ? 'Prolonger' : 'Renouveler'}</Button>}
                    </div>
                </Card>

                {/* Plans */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <h2 className="text-[19px] font-medium text-[#141412]">Comparer les plans</h2>
                    <Tabs id="cycle" value={cycle} onChange={setCycle} tabs={[[1, 'Mensuel'], [12, '1 an · −15 %'], [24, '2 ans · −20 %']]} />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {plans.map((p, i) => {
                        const pr = pricing(p.price, cycle);
                        const isCurrent = p.id === user.plan;
                        return (
                            <motion.article key={p.id} {...reveal(i * 0.05)}
                                className={`flex flex-col rounded-3xl border bg-white p-6 ${p.popular ? 'border-[#FFCC00] shadow-[0_20px_50px_-30px_rgba(230,170,0,0.6)]' : 'border-black/[0.06]'}`}>
                                <div className="flex items-center justify-between">
                                    <p className="text-[17px] font-medium text-[#141412]">{p.name}</p>
                                    {isCurrent ? <Badge tone="neutral">Plan actuel</Badge> : p.popular ? <Badge tone="brand">Populaire</Badge> : null}
                                </div>
                                <p className="mt-1 text-[14px] text-[#5F5E58]">{p.tagline}</p>
                                <p className="mt-5 flex items-baseline gap-1.5 text-[#141412]">
                                    <span className="text-[34px] font-medium tracking-[-0.03em] tabular-nums">{pr.perMonth.toLocaleString('fr-FR')}</span>
                                    <span className="text-[14px] text-[#5F5E58]">FCFA / mois</span>
                                </p>
                                <p className="h-5 text-[13px] text-[#8B8A83]">{p.price > 0 && cycle > 1 ? `${fcfa(pr.total)} payés en une fois` : ''}</p>
                                {p.price > 0 ? (
                                    <Button className="mt-4 w-full" variant={p.popular || isCurrent ? 'primary' : 'secondary'} onClick={() => setSelected(p)}>
                                        {isCurrent ? (user.is_active ? 'Prolonger' : 'Renouveler') : `Choisir ${p.name}`}
                                    </Button>
                                ) : (
                                    <Button className="mt-4 w-full" disabled>{isCurrent ? 'Plan actuel' : 'Inclus'}</Button>
                                )}
                                <ul className="mt-6 space-y-2.5 text-[14px] text-[#3D3C37]">
                                    {p.features.map((f) => <li key={f} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C99A00]" />{f}</li>)}
                                </ul>
                            </motion.article>
                        );
                    })}
                </div>

                {/* Historique */}
                <Card padded={false}>
                    <div className="border-b border-black/[0.06] p-5"><CardHeader title="Historique des paiements" /></div>
                    {history.length ? (
                        <Table head={[['Date'], ['Plan'], ['Durée'], ['Montant', 'text-right'], ['Statut']]}>
                            {history.map((h) => {
                                const [label, tone] = PAY_STATUS[h.payment_status] || PAY_STATUS.pending;
                                return (
                                    <tr key={h.id}>
                                        <td className="px-4 py-3 text-[#5F5E58]">{shortDate(h.created_at)}</td>
                                        <td className="px-4 py-3 capitalize text-[#141412]">{h.plan}</td>
                                        <td className="px-4 py-3 text-[#5F5E58]">{h.billing_cycle >= 12 ? `${h.billing_cycle / 12} an${h.billing_cycle > 12 ? 's' : ''}` : `${h.billing_cycle} mois`}</td>
                                        <td className="px-4 py-3 text-right tabular-nums text-[#141412]">{fcfa(h.amount)}</td>
                                        <td className="px-4 py-3"><Badge tone={tone}>{label}</Badge></td>
                                    </tr>
                                );
                            })}
                        </Table>
                    ) : <div className="p-4"><Empty Icon={Crown} title="Aucun paiement" text="Vos paiements d’abonnement apparaîtront ici." /></div>}
                </Card>
            </div>

        </AuthenticatedLayout>
    );
}
