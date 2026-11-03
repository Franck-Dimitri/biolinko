import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Banknote, Crown, Package, ShieldAlert, ShoppingBag, Store, TrendingUp, Users, Wallet } from 'lucide-react';
import { Badge, Card, CardHeader, Empty, PageHeader, Stat, dateTime, fcfa, reveal, shortDate } from '@/Components/Dashboard/UI';
import { EASE_OUT } from '@/Components/Motion';

const PLAN_LABELS = [['starter', 'Starter'], ['pro', 'Pro'], ['growth', 'Growth'], ['business', 'Business']];
const REVENUE_LINES = [
    ['commissions', 'Commissions sur les ventes'],
    ['client_fees', 'Frais de service clients'],
    ['withdrawal_fees', 'Frais de retrait'],
    ['subscriptions', 'Abonnements'],
];
const sum = (r) => REVENUE_LINES.reduce((a, [k]) => a + Number(r?.[k] || 0), 0);

// Tâche qui attend l'admin : nombre, libellé et lien vers l'écran concerné
function Todo({ count, label, hint, href, Icon, tone = 'warning' }) {
    const active = count > 0;
    return (
        <Link href={href} className={`group flex items-center gap-3 rounded-2xl border p-4 transition-colors ${active ? 'border-[#FFCC00]/60 bg-[#FFFBEA] hover:border-[#FFCC00]' : 'border-black/[0.06] bg-white hover:border-black/20'}`}>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? (tone === 'danger' ? 'bg-red-50 text-[#B91C1C]' : 'bg-[#FFCC00] text-[#141412]') : 'bg-[#F6F5F1] text-[#8B8A83]'}`}>
                <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-[#141412]">{count} {label}</span>
                <span className="block truncate text-[13px] text-[#8B8A83]">{hint}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#8B8A83] transition-transform group-hover:translate-x-0.5" />
        </Link>
    );
}

export default function Dashboard({ metrics = {}, revenue = {}, revenue30 = {}, chart = [], planCounts = {}, todo = {}, recentStores = [], pendingWithdrawals = [] }) {
    const max = Math.max(...chart.map((d) => d.total), 1);
    const sellers = PLAN_LABELS.reduce((a, [k]) => a + (planCounts[k] || 0), 0) || 1;

    return (
        <AuthenticatedLayout>
            <Head title="Vue d’ensemble, Administration Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Vue d’ensemble" sub="L’activité de la plateforme, ce qu’elle rapporte et ce qui attend une action." />

                {/* À traiter */}
                <motion.div {...reveal()} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Todo count={todo.withdrawals || 0} label={`retrait${todo.withdrawals > 1 ? 's' : ''} à traiter`} hint={todo.withdrawals ? `${fcfa(todo.withdrawals_amount)} au total` : 'Rien en attente'} href={route('admin.withdrawals.index', { status: 'pending' })} Icon={Wallet} />
                    <Todo count={todo.reports || 0} label={`signalement${todo.reports > 1 ? 's' : ''} en cours`} hint="Ventes gelées le temps d’un accord" href={route('admin.stores.index')} Icon={AlertTriangle} />
                    <Todo count={todo.under_review?.length || 0} label={`vendeur${(todo.under_review?.length || 0) > 1 ? 's' : ''} sous contrôle`} hint={todo.under_review?.length ? todo.under_review.map((s) => s.name).join(', ') : '3 signalements ou plus'} href={route('admin.stores.index')} Icon={ShieldAlert} tone="danger" />
                    <Todo count={todo.unpublished || 0} label={`boutique${todo.unpublished > 1 ? 's' : ''} non publiée${todo.unpublished > 1 ? 's' : ''}`} hint="Créées mais pas encore en ligne" href={route('admin.stores.index')} Icon={Store} />
                </motion.div>

                <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                    {/* Revenus Biolinko */}
                    <motion.section {...reveal(0.04)} className="relative overflow-hidden rounded-3xl bg-[#141412] p-7 text-white">
                        <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FFCC00]/20 blur-3xl" />
                        <p className="relative text-[14px] text-white/60">Revenus Biolinko · 30 derniers jours</p>
                        <p className="relative mt-2 text-[40px] font-medium tracking-[-0.03em] tabular-nums">{fcfa(sum(revenue30))}</p>
                        <dl className="relative mt-5 space-y-2 border-t border-white/10 pt-4 text-[14px]">
                            {REVENUE_LINES.map(([k, label]) => (
                                <div key={k} className="flex justify-between gap-3 text-white/70"><dt>{label}</dt><dd className="tabular-nums text-white">{fcfa(revenue30[k])}</dd></div>
                            ))}
                        </dl>
                        <p className="relative mt-4 text-[13px] text-white/50">Depuis le lancement : {fcfa(sum(revenue))} · avant frais de l’agrégateur</p>
                    </motion.section>

                    {/* Ventes 30 jours */}
                    <Card delay={0.06}>
                        <CardHeader title="Volume de ventes" sub={`${fcfa(metrics.gmv_30)} sur 30 jours · ${metrics.orders_30 || 0} commande${metrics.orders_30 > 1 ? 's' : ''} payée${metrics.orders_30 > 1 ? 's' : ''}`} />
                        <div className="mt-6 flex h-36 items-end gap-[3px]">
                            {chart.map((d, i) => (
                                <motion.span key={d.date} title={`${shortDate(d.date)} : ${fcfa(d.total)}`}
                                    initial={{ height: 0 }} animate={{ height: `${d.total ? Math.max(6, (d.total / max) * 100) : 3}%` }} transition={{ duration: 0.6, delay: i * 0.01, ease: EASE_OUT }}
                                    className={`flex-1 rounded-sm ${i === chart.length - 1 ? 'bg-[#FFCC00]' : 'bg-[#F2F1EC] hover:bg-[#E9E7E0]'}`} />
                            ))}
                        </div>
                        <div className="mt-2 flex justify-between text-[12px] text-[#8B8A83]"><span>Il y a 30 jours</span><span>Aujourd’hui</span></div>
                    </Card>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    <Stat label="Vendeurs" value={metrics.sellers ?? 0} hint={`+${metrics.new_sellers ?? 0} ces 30 jours`} Icon={Users} delay={0.08} />
                    <Stat label="Boutiques en ligne" value={`${metrics.stores_published ?? 0} / ${metrics.stores ?? 0}`} Icon={Store} delay={0.09} />
                    <Stat label="Produits" value={metrics.products ?? 0} Icon={Package} delay={0.1} />
                    <Stat label="Ventes depuis le lancement" value={fcfa(metrics.gmv)} hint={`${metrics.orders_paid ?? 0} commandes payées`} Icon={TrendingUp} delay={0.11} />
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    {/* Répartition des plans */}
                    <Card delay={0.12}>
                        <CardHeader title="Formules des vendeurs" action={<Link href={route('admin.subscriptions.index')} className="text-[13px] text-[#5F5E58] hover:text-[#141412]">Abonnements</Link>} />
                        <ul className="mt-5 space-y-3">
                            {PLAN_LABELS.map(([k, label]) => (
                                <li key={k}>
                                    <div className="flex justify-between text-[14px]"><span className="flex items-center gap-2 text-[#141412]">{k !== 'starter' && <Crown className="h-3.5 w-3.5 text-[#B45309]" />}{label}</span><span className="tabular-nums text-[#5F5E58]">{planCounts[k] || 0}</span></div>
                                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F2F1EC]">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${((planCounts[k] || 0) / sellers) * 100}%` }} transition={{ duration: 0.6, ease: EASE_OUT }} className={`h-full rounded-full ${k === 'starter' ? 'bg-[#D4D3CD]' : 'bg-[#FFCC00]'}`} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Nouvelles boutiques */}
                    <Card delay={0.13} padded={false}>
                        <div className="p-5 pb-0"><CardHeader title="Nouvelles boutiques" action={<Link href={route('admin.stores.index')} className="text-[13px] text-[#5F5E58] hover:text-[#141412]">Tout voir</Link>} /></div>
                        {recentStores.length ? (
                            <ul className="mt-3 divide-y divide-black/[0.05]">
                                {recentStores.map((s) => (
                                    <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F6F5F1]">
                                            {s.logo_url ? <img src={s.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4 text-[#8B8A83]" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[14px] text-[#141412]">{s.name || 'Sans nom'}</span>
                                            <span className="block truncate text-[12px] text-[#8B8A83]">{s.user?.email} · {shortDate(s.created_at)}</span>
                                        </span>
                                        <Badge tone={s.is_published ? 'success' : 'neutral'}>{s.is_published ? 'En ligne' : 'Brouillon'}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : <div className="p-5"><Empty Icon={Store} title="Aucune boutique" text="Les nouvelles boutiques apparaîtront ici." /></div>}
                    </Card>

                    {/* Retraits en attente */}
                    <Card delay={0.14} padded={false}>
                        <div className="p-5 pb-0"><CardHeader title="Retraits à traiter" action={<Link href={route('admin.withdrawals.index')} className="text-[13px] text-[#5F5E58] hover:text-[#141412]">Tout voir</Link>} /></div>
                        {pendingWithdrawals.length ? (
                            <ul className="mt-3 divide-y divide-black/[0.05]">
                                {pendingWithdrawals.map((w) => (
                                    <li key={w.id} className="flex items-center justify-between gap-3 px-5 py-3 text-[14px]">
                                        <span className="min-w-0">
                                            <span className="block truncate text-[#141412]">{w.wallet?.store?.name || 'Boutique'}</span>
                                            <span className="block text-[12px] text-[#8B8A83]">{w.operator === 'ORANGE' ? 'Orange Money' : 'MTN MoMo'} · {dateTime(w.created_at)}</span>
                                        </span>
                                        <span className="shrink-0 tabular-nums text-[#141412]">{fcfa(w.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <div className="p-5"><Empty Icon={Banknote} title="Aucun retrait en attente" text="Les demandes des vendeurs apparaîtront ici." /></div>}
                    </Card>
                </div>

                <p className="flex items-center gap-2 text-[13px] text-[#8B8A83]"><ShoppingBag className="h-4 w-4" /> Les montants des abonnements excluent les paiements simulés.</p>
            </div>
        </AuthenticatedLayout>
    );
}
