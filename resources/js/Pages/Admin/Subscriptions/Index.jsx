import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { CalendarClock, ChevronRight, Crown, TrendingUp, Users } from 'lucide-react';
import { Badge, Card, Empty, PageHeader, Pagination, SearchInput, Stat, Table, Tabs, fcfa, shortDate } from '@/Components/Dashboard/UI';

const name = (p) => (p || 'starter').replace(/^./, (c) => c.toUpperCase());

// Échéance lisible : jours restants, expiré, ou gratuit
function Expiry({ user }) {
    if (!user.plan || user.plan === 'starter') return <span className="text-[#8B8A83]">—</span>;
    if (!user.subscription_expires_at) return <Badge tone="danger">Sans échéance</Badge>;
    const days = Math.ceil((new Date(user.subscription_expires_at) - new Date()) / 86400000);
    if (days <= 0) return <Badge tone="danger">Expiré le {shortDate(user.subscription_expires_at)}</Badge>;
    return (
        <span>
            <span className="block text-[#141412]">{shortDate(user.subscription_expires_at)}</span>
            <span className={`text-[13px] ${days <= 7 ? 'text-[#B45309]' : 'text-[#8B8A83]'}`}>{days} jour{days > 1 ? 's' : ''} restant{days > 1 ? 's' : ''}</span>
        </span>
    );
}

export default function Index({ vendors, metrics = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const first = useRef(true);
    const list = vendors?.data || [];

    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = setTimeout(() => router.get(route('admin.subscriptions.index'), { search, plan: filters.plan }, { preserveState: true, replace: true }), 350);
        return () => clearTimeout(t);
    }, [search]);

    const setPlan = (plan) => router.get(route('admin.subscriptions.index'), { search, plan }, { preserveState: true, replace: true });
    const c = metrics.counts || {};

    return (
        <AuthenticatedLayout>
            <Head title="Abonnements, Administration Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Abonnements" sub="Les formules des vendeurs, leurs échéances, et ceux à relancer avant expiration." />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    <Stat label="Abonnements actifs" value={metrics.active_paid ?? 0} hint={`Pro ${c.pro ?? 0} · Growth ${c.growth ?? 0} · Business ${c.business ?? 0}`} Icon={Crown} />
                    <Stat label="Revenu mensuel récurrent" value={fcfa(metrics.mrr)} hint="Si chaque abonnement est renouvelé au mois" Icon={TrendingUp} delay={0.03} />
                    <Stat label="Expirent sous 7 jours" value={metrics.expiring ?? 0} Icon={CalendarClock} accent={(metrics.expiring ?? 0) > 0} delay={0.06} />
                    <Stat label="Vendeurs" value={metrics.sellers ?? 0} hint={`${Math.max(0, (metrics.sellers ?? 0) - (metrics.active_paid ?? 0))} en Starter`} Icon={Users} delay={0.09} />
                </div>

                <Card padded={false}>
                    <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
                        <Tabs id="sub-plan" value={filters.plan || 'all'} onChange={setPlan}
                            tabs={[['all', 'Tous'], ['paid', 'Actifs'], ['expiring', 'Expirent bientôt'], ['expired', 'Expirés'], ['starter', 'Starter']]} />
                        <SearchInput value={search} onChange={setSearch} placeholder="Vendeur ou boutique" className="lg:w-72" />
                    </div>

                    {list.length ? (
                        <Table head={[['Vendeur'], ['Boutique'], ['Formule'], ['Échéance'], ['', 'w-10']]}>
                            {list.map((u) => (
                                <tr key={u.id} className="transition-colors hover:bg-[#FAFAF8]">
                                    <td className="px-4 py-3.5">
                                        <span className="block text-[#141412]">{u.name}</span>
                                        <span className="text-[13px] text-[#8B8A83]">{u.email}</span>
                                    </td>
                                    <td className="px-4 py-3.5">{u.store ? <a href={`/${u.store.slug}`} target="_blank" rel="noreferrer" className="hover:underline">{u.store.name}</a> : '—'}</td>
                                    <td className="px-4 py-3.5"><Badge tone={u.plan && u.plan !== 'starter' ? 'brand' : 'neutral'}>{name(u.plan)}</Badge></td>
                                    <td className="px-4 py-3.5"><Expiry user={u} /></td>
                                    <td className="px-4 py-3.5">
                                        <Link href={route('admin.users.show', u.id)} aria-label={`Gérer la formule de ${u.name}`} className="flex h-8 w-8 items-center justify-center rounded-full text-[#8B8A83] hover:bg-[#F2F1EC] hover:text-[#141412]"><ChevronRight className="h-4 w-4" /></Link>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    ) : <div className="p-6"><Empty Icon={Crown} title="Aucun vendeur" text="Aucun vendeur ne correspond à ces filtres." /></div>}
                    <Pagination page={vendors} label="vendeurs" />
                </Card>

                <p className="text-[13px] text-[#8B8A83]">Pour attribuer ou prolonger une formule, ouvrez la fiche du vendeur.</p>
            </div>
        </AuthenticatedLayout>
    );
}
