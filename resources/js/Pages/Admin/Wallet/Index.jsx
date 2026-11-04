import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Crown, Percent, ShoppingBag, Wallet } from 'lucide-react';
import { Card, CardHeader, Empty, PageHeader, Stat, Table, dateTime, fcfa, reveal } from '@/Components/Dashboard/UI';
import { EASE_OUT } from '@/Components/UI/Motion';

const LINES = [
    ['commissions', 'Commissions sur les ventes', 'bg-[#141412]'],
    ['client_fees', 'Frais de service clients', 'bg-[#FFCC00]'],
    ['withdrawal_fees', 'Frais de retrait', 'bg-[#B45309]'],
    ['subscriptions', 'Abonnements', 'bg-[#16A34A]'],
];
const pct = (n) => `${String(n).replace('.', ',')} %`;

export default function Index({ total = {}, thisMonth = {}, months = [], gatewayCost = {}, latestSales = [], latestSubscriptions = [] }) {
    const max = Math.max(...months.map((m) => m.gross), 1);

    return (
        <AuthenticatedLayout>
            <Head title="Revenus, Administration Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Revenus Biolinko" sub="L’argent réellement encaissé par la plateforme, et ce qu’il en reste après les frais de l’agrégateur." />

                <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                    <motion.section {...reveal()} className="relative overflow-hidden rounded-3xl bg-[#141412] p-7 text-white">
                        <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FFCC00]/20 blur-3xl" />
                        <p className="relative text-[14px] text-white/60">Revenu net ce mois-ci</p>
                        <p className="relative mt-2 text-[40px] font-medium tracking-[-0.03em] tabular-nums">{fcfa(thisMonth.net)}</p>
                        <dl className="relative mt-5 space-y-2 border-t border-white/10 pt-4 text-[14px]">
                            {LINES.map(([k, label]) => (
                                <div key={k} className="flex justify-between gap-3 text-white/70"><dt>{label}</dt><dd className="tabular-nums text-white">{fcfa(thisMonth[k])}</dd></div>
                            ))}
                            <div className="flex justify-between gap-3 text-white/70"><dt>Frais agrégateur (estimés)</dt><dd className="tabular-nums text-[#FCA5A5]">−{fcfa(thisMonth.gateway_cost)}</dd></div>
                        </dl>
                    </motion.section>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <Stat label="Revenu net depuis le lancement" value={fcfa(total.net)} hint={`${fcfa(total.gross)} brut − ${fcfa(total.gateway_cost)} de frais estimés`} Icon={Wallet} delay={0.03} />
                        <Stat label="Ventes traitées" value={fcfa(total.gmv)} hint={`${total.orders ?? 0} commandes payées`} Icon={ShoppingBag} delay={0.06} />
                    </div>
                </div>

                <Card delay={0.08}>
                    <CardHeader title="Six derniers mois" sub="Revenus bruts par source" />
                    <div className="mt-6 flex h-48 items-end gap-3">
                        {months.map((m, i) => (
                            <div key={m.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                                <span className="text-[11px] tabular-nums text-[#8B8A83] opacity-0 transition-opacity group-hover:opacity-100">{fcfa(m.gross)}</span>
                                <motion.div initial={{ height: 0 }} animate={{ height: `${m.gross ? Math.max(4, (m.gross / max) * 100) : 2}%` }} transition={{ duration: 0.7, delay: i * 0.05, ease: EASE_OUT }}
                                    className="flex w-full max-w-[56px] flex-col-reverse overflow-hidden rounded-lg bg-[#F2F1EC]">
                                    {m.gross > 0 && LINES.map(([k, , color]) => <span key={k} className={color} style={{ height: `${(m[k] / m.gross) * 100}%` }} />)}
                                </motion.div>
                                <span className="text-[12px] text-[#8B8A83]">{m.label}</span>
                            </div>
                        ))}
                    </div>
                    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#5F5E58]">
                        {LINES.map(([k, label, color]) => <li key={k} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-sm ${color}`} />{label}</li>)}
                    </ul>
                </Card>

                <Card padded={false} delay={0.1}>
                    <div className="p-5 pb-3"><CardHeader title="Détail par mois" /></div>
                    <Table head={[['Mois'], ['Ventes', 'text-right'], ['Commissions', 'text-right'], ['Frais clients', 'text-right'], ['Frais retrait', 'text-right'], ['Abonnements', 'text-right'], ['Frais agrégateur', 'text-right'], ['Net', 'text-right']]}>
                        {[...months].reverse().map((m) => (
                            <tr key={m.key}>
                                <td className="px-4 py-3 text-[#141412]">{m.label}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-[#5F5E58]">{fcfa(m.gmv)}</td>
                                <td className="px-4 py-3 text-right tabular-nums">{fcfa(m.commissions)}</td>
                                <td className="px-4 py-3 text-right tabular-nums">{fcfa(m.client_fees)}</td>
                                <td className="px-4 py-3 text-right tabular-nums">{fcfa(m.withdrawal_fees)}</td>
                                <td className="px-4 py-3 text-right tabular-nums">{fcfa(m.subscriptions)}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-[#B91C1C]">−{fcfa(m.gateway_cost)}</td>
                                <td className="px-4 py-3 text-right font-medium tabular-nums text-[#141412]">{fcfa(m.net)}</td>
                            </tr>
                        ))}
                    </Table>
                    <p className="border-t border-black/[0.06] p-4 text-[13px] text-[#8B8A83]">
                        Frais de l’agrégateur estimés à {pct(gatewayCost.collection)} des encaissements et {pct(gatewayCost.payout)} des virements (réglables dans config/payments.php). Les abonnements attribués par l’admin ou simulés ne sont pas comptés.
                    </p>
                </Card>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card padded={false} delay={0.12}>
                        <div className="p-5 pb-3"><CardHeader title="Dernières ventes" /></div>
                        {latestSales.length ? (
                            <ul className="divide-y divide-black/[0.05]">
                                {latestSales.map((o) => (
                                    <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3 text-[14px]">
                                        <span className="min-w-0"><span className="block truncate text-[#141412]">{o.store?.name} · <span className="font-mono text-[13px]">{o.tracking_code}</span></span><span className="text-[12px] text-[#8B8A83]">{dateTime(o.paid_at)} · {fcfa(o.total_client)}</span></span>
                                        <span className="shrink-0 text-right"><span className="block tabular-nums text-[#141412]">+{fcfa(Number(o.saas_margin) + Number(o.commission_amount))}</span><span className="text-[12px] text-[#8B8A83]">commission {pct(Number(o.commission_rate))}</span></span>
                                    </li>
                                ))}
                            </ul>
                        ) : <div className="p-5"><Empty Icon={Percent} title="Aucune vente" text="Les revenus des ventes apparaîtront ici." /></div>}
                    </Card>
                    <Card padded={false} delay={0.14}>
                        <div className="p-5 pb-3"><CardHeader title="Derniers abonnements payés" /></div>
                        {latestSubscriptions.length ? (
                            <ul className="divide-y divide-black/[0.05]">
                                {latestSubscriptions.map((s) => (
                                    <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-3 text-[14px]">
                                        <span className="min-w-0"><span className="block truncate text-[#141412]">{s.user?.name}</span><span className="text-[12px] text-[#8B8A83]">{(s.plan || '').replace(/^./, (c) => c.toUpperCase())} · {s.billing_cycle} mois · {dateTime(s.updated_at)}</span></span>
                                        <span className="shrink-0 tabular-nums text-[#141412]">+{fcfa(s.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <div className="p-5"><Empty Icon={Crown} title="Aucun abonnement payé" text="Les paiements d’abonnement réels apparaîtront ici." /></div>}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
