import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, Clock, Hourglass, Landmark, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import {
    Badge, Button, Card, CardHeader, SubPage, Empty, Field, PageHeader, Stat, Tabs, dateTime, fcfa, fieldClass, reveal,
} from '@/Components/Dashboard/UI';
import { EASE_OUT } from '@/Components/Motion';

const STATUS = { completed: ['Effectué', 'success'], held: ['En attente', 'neutral'], pending: ['En cours', 'warning'], processing: ['Virement en cours', 'info'], rejected: ['Rejeté', 'danger'] };

function WithdrawDialog({ open, onClose, available, min, feePercent = 3, defaultPhone }) {
    const { errors } = usePage().props;
    const [amount, setAmount] = useState('');
    const [operator, setOperator] = useState('MTN');
    const [phone, setPhone] = useState(defaultPhone || '');
    const [busy, setBusy] = useState(false);
    const value = Number(amount) || 0;
    const invalid = value < min || value > available;
    const fee = Math.ceil(value * feePercent / 100);

    const submit = (e) => {
        e.preventDefault();
        setBusy(true);
        router.post(route('wallet.withdraw'), { amount: value, payment_operator: operator, phone }, {
            preserveScroll: true,
            onSuccess: () => { setAmount(''); onClose(); },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <SubPage open={open} onClose={onClose} title="Retirer vers Mobile Money" sub={`Disponible : ${fcfa(available)}`}>
            <form onSubmit={submit} className="space-y-5">
                <Field label="Montant" hint={`Minimum ${fcfa(min)}.`} error={errors?.amount}>
                    <div className="relative">
                        <input type="number" inputMode="numeric" min={min} max={available} required value={amount} onChange={(e) => setAmount(e.target.value)}
                            placeholder="0" className={`${fieldClass} h-14 pr-20 text-[22px] tabular-nums`} />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-[#8B8A83]">FCFA</span>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                        {[0.25, 0.5, 1].map((r) => (
                            <button key={r} type="button" onClick={() => setAmount(String(Math.floor(available * r)))} disabled={available * r < min}
                                className="rounded-full border border-black/10 px-3 py-1 text-[13px] text-[#5F5E58] hover:border-black/30 disabled:opacity-40">
                                {r === 1 ? 'Tout' : `${r * 100} %`}
                            </button>
                        ))}
                    </div>
                </Field>

                <Field label="Vers">
                    <div className="grid grid-cols-2 gap-2">
                        {[['MTN', 'MTN MoMo'], ['ORANGE', 'Orange Money']].map(([id, label]) => (
                            <button key={id} type="button" aria-pressed={operator === id} onClick={() => setOperator(id)}
                                className={`flex items-center gap-2.5 rounded-2xl border-2 p-3 text-left text-[14px] font-medium transition-colors ${operator === id ? 'border-[#141412] bg-[#FFFBEA]' : 'border-black/[0.08] hover:border-black/20'}`}>
                                <OperatorLogo op={id} className="h-8 w-8" /> {label}
                            </button>
                        ))}
                    </div>
                </Field>

                <Field label="Numéro" error={errors?.phone}>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="6XX XX XX XX" className={fieldClass} />
                </Field>

                <div className="rounded-2xl bg-[#F6F5F1] p-4 text-[14px] text-[#5F5E58]">
                    <div className="flex justify-between"><span>Montant retiré</span><span className="tabular-nums">{fcfa(value)}</span></div>
                    <div className="mt-1 flex justify-between"><span>Frais de retrait ({String(feePercent).replace('.', ',')} %)</span><span className="tabular-nums">−{fcfa(fee)}</span></div>
                    <div className="mt-2 flex justify-between border-t border-black/[0.08] pt-2 text-[#141412]"><span>Vous recevez</span><strong className="font-medium tabular-nums">{fcfa(Math.max(0, value - fee))}</strong></div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Annuler</Button>
                    <Button variant="primary" type="submit" disabled={busy || invalid}><ArrowUpRight className="h-4 w-4" /> Demander le retrait</Button>
                </div>
            </form>
        </SubPage>
    );
}

export default function Index({ ledger = [], monthly = [], pendingWithdrawals = [], heldSales = [], holdRules, metrics, defaultPhone }) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const available = metrics?.available_balance || 0;
    const min = metrics?.min_withdrawal || 1000;
    const max = Math.max(...monthly.map((m) => m.total), 1);
    const rows = ledger.filter((l) => filter === 'all' || l.type === filter);

    return (
        <AuthenticatedLayout>
            <Head title="Portefeuille, Biolinko" />
            <WithdrawDialog open={open} onClose={() => setOpen(false)} available={available} min={min} feePercent={metrics?.withdrawal_fee_percent ?? 3} defaultPhone={defaultPhone} />
            <div className="space-y-6 pb-12" hidden={open}>
                <PageHeader title="Portefeuille" sub="Vos revenus, votre solde et vos retraits vers Mobile Money." />

                <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                    {/* Solde */}
                    <motion.section {...reveal()} className="relative overflow-hidden rounded-3xl bg-[#141412] p-7 text-white">
                        <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FFCC00]/20 blur-3xl" />
                        <p className="relative text-[14px] text-white/60">Solde disponible</p>
                        <p className="relative mt-2 text-[40px] font-medium tracking-[-0.03em] tabular-nums">{fcfa(available)}</p>
                        <div className="relative mt-6 flex flex-wrap items-center gap-3">
                            <Button variant="primary" size="lg" onClick={() => setOpen(true)} disabled={available < min}>
                                <ArrowUpRight className="h-4 w-4" /> Retirer
                            </Button>
                            {available < min && <span className="text-[13px] text-white/55">Retrait possible dès {fcfa(min)}</span>}
                        </div>
                        <div className="relative mt-6 space-y-1.5 text-[14px] text-white/70">
                            {(metrics?.held_balance || 0) > 0 && <p className="flex items-center gap-2"><Hourglass className="h-4 w-4" /> {fcfa(metrics.held_balance)} en attente de disponibilité</p>}
                            {(metrics?.pending_balance || 0) > 0 && <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {fcfa(metrics.pending_balance)} en cours de retrait</p>}
                        </div>
                    </motion.section>

                    {/* Revenus par mois */}
                    <Card delay={0.05}>
                        <CardHeader title="Revenus des 6 derniers mois" sub={`Ce mois-ci : ${fcfa(metrics?.this_month)}`} />
                        <div className="mt-6 flex h-36 items-end gap-3">
                            {monthly.map((m, i) => (
                                <div key={m.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                                    <span className="text-[11px] tabular-nums text-[#8B8A83] opacity-0 transition-opacity group-hover:opacity-100">{Math.round(m.total / 1000)}k</span>
                                    <motion.span initial={{ height: 0 }} animate={{ height: `${m.total ? Math.max(6, (m.total / max) * 100) : 3}%` }} transition={{ duration: 0.7, delay: i * 0.05, ease: EASE_OUT }}
                                        className={`w-full rounded-lg ${i === monthly.length - 1 ? 'bg-[#FFCC00]' : 'bg-[#F2F1EC] group-hover:bg-[#E9E7E0]'}`} />
                                    <span className="text-[12px] text-[#8B8A83]">{m.label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                     <Stat label="Revenus cumulés" value={fcfa(metrics?.lifetime_earnings)} hint={(metrics?.commission_paid || 0) > 0 ? `Commissions Biolinko déduites : ${fcfa(metrics.commission_paid)}` : 'Ventes en ligne payées'} Icon={TrendingUp} delay={0.08} />
                    <Stat label="Déjà retiré" value={fcfa(metrics?.total_withdrawals)} Icon={Landmark} delay={0.1} />
                    <Stat label="En cours de retrait" value={fcfa(metrics?.pending_balance)} hint={`${pendingWithdrawals.length} demande${pendingWithdrawals.length > 1 ? 's' : ''}`} Icon={Clock} delay={0.12} />
                </div>

                {/* Délai de sécurité : ventes bientôt retirables */}
                <Card delay={0.1}>
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F5F1]"><ShieldCheck className="h-5 w-5 text-[#141412]" /></span>
                        <div className="min-w-0">
                            <h2 className="text-[17px] font-medium text-[#141412]">Argent en attente</h2>
                            <p className="mt-1 text-[14px] text-[#5F5E58]">
                                Chaque vente devient retirable <strong className="font-medium text-[#141412]">{holdRules?.current} jours</strong> après le paiement.
                                {holdRules?.current === holdRules?.new
                                    ? ` Après ${holdRules?.after} ventes livrées, ce délai passe à ${holdRules?.established} jours (vous en êtes à ${holdRules?.delivered}).`
                                    : ' Vous bénéficiez du délai réduit des boutiques établies.'}
                            </p>
                        </div>
                    </div>
                    {heldSales.length > 0 ? (
                        <ul className="mt-4 divide-y divide-black/[0.05] rounded-2xl border border-black/[0.06]">
                            {heldSales.map((h) => (
                                <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]">
                                    <span className="min-w-0">
                                        <span className="block truncate text-[#141412]">{h.customer_name} · <span className="font-mono text-[13px]">{h.tracking_code}</span></span>
                                        <span className={`flex items-center gap-1.5 text-[13px] ${h.frozen ? 'text-[#B45309]' : 'text-[#8B8A83]'}`}>
                                            {h.frozen ? <><AlertTriangle className="h-3.5 w-3.5" /> Signalée par le client, en attente de règlement</> : <>Disponible le {dateTime(h.available_at)}</>}
                                        </span>
                                    </span>
                                    <span className="shrink-0 tabular-nums text-[#141412]">{fcfa(h.amount)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="mt-4 text-[14px] text-[#8B8A83]">Aucune vente en attente : tout votre argent est disponible.</p>}
                </Card>

                <Card padded={false} delay={0.12}>
                    <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="px-1 text-[17px] font-medium text-[#141412]">Mouvements</h2>
                        <Tabs id="ledger" value={filter} onChange={setFilter} tabs={[['all', 'Tout'], ['sale', 'Ventes'], ['withdrawal', 'Retraits']]} />
                    </div>
                    {rows.length ? (
                        <ul className="divide-y divide-black/[0.05]">
                            {rows.map((l) => {
                                const credit = l.amount > 0;
                                const [label, tone] = STATUS[l.status] || STATUS.completed;
                                return (
                                    <li key={l.id} className="flex items-center gap-4 px-5 py-3.5">
                                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${credit ? 'bg-[#FFF6CC]' : 'bg-[#F2F1EC]'}`}>
                                            {credit ? <ArrowDownLeft className="h-4 w-4 text-[#141412]" /> : <ArrowUpRight className="h-4 w-4 text-[#141412]" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[15px] text-[#141412]">{l.label}</span>
                                            <span className="text-[13px] text-[#8B8A83]">{l.detail} · {dateTime(l.date)}</span>
                                        </span>
                                        {!credit && <Badge tone={tone}>{label}</Badge>}
                                        <span className={`w-32 shrink-0 text-right text-[15px] tabular-nums ${credit ? 'text-[#15803D]' : 'text-[#141412]'}`}>
                                            {credit ? '+' : '−'}{fcfa(Math.abs(l.amount))}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="p-4"><Empty Icon={Wallet} title="Aucun mouvement" text="Vos ventes payées en ligne apparaîtront ici et créditeront votre solde." /></div>
                    )}
                </Card>
            </div>

        </AuthenticatedLayout>
    );
}
