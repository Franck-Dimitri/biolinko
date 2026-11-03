import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Ban, ChevronRight, Crown, ShieldCheck, Store, UserCheck, Users } from 'lucide-react';
import ModerationModal from '@/Components/Admin/ModerationModal';
import { Badge, Button, Card, Empty, PageHeader, Pagination, SearchInput, Stat, Table, Tabs, fcfa, shortDate } from '@/Components/Dashboard/UI';

const PLAN_TONE = { starter: 'neutral', pro: 'brand', growth: 'brand', business: 'brand' };

export default function Index({ users, metrics = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [banTarget, setBanTarget] = useState(null);
    const [busy, setBusy] = useState(false);
    const first = useRef(true);
    const list = users?.data || [];

    // Recherche côté serveur, déclenchée après une courte pause de frappe
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = setTimeout(() => router.get(route('admin.users.index'), { search, role: filters.role }, { preserveState: true, replace: true }), 350);
        return () => clearTimeout(t);
    }, [search]);

    const setRole = (role) => router.get(route('admin.users.index'), { search, role }, { preserveState: true, replace: true });

    const unban = (u) => router.post(route('admin.users.toggleBan', u.id), {}, { preserveScroll: true, onSuccess: () => toast.success(`${u.name} est réactivé.`) });

    const confirmBan = ({ reason }) => {
        setBusy(true);
        router.post(route('admin.users.toggleBan', banTarget.id), { reason }, {
            preserveScroll: true,
            onSuccess: () => { toast.success(`${banTarget.name} est banni et a été prévenu.`); setBanTarget(null); },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Vendeurs, Administration Biolinko" />
            <div hidden={!!banTarget} className="space-y-6 pb-12">
                <PageHeader title="Vendeurs" sub="Les comptes inscrits, leur boutique, leur formule et leur activité." />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    <Stat label="Comptes" value={metrics.total ?? 0} hint={`${metrics.admins ?? 0} administrateur${metrics.admins > 1 ? 's' : ''}`} Icon={Users} />
                    <Stat label="Vendeurs" value={metrics.sellers ?? 0} Icon={UserCheck} delay={0.03} />
                    <Stat label="Formules payantes" value={metrics.pro_users ?? 0} Icon={Crown} delay={0.06} />
                    <Stat label="Comptes bannis" value={metrics.banned ?? 0} Icon={Ban} accent={(metrics.banned ?? 0) > 0} delay={0.09} />
                </div>

                <Card padded={false}>
                    <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <Tabs id="role" value={filters.role || 'all'} onChange={setRole} tabs={[['all', 'Tous'], ['seller', 'Vendeurs'], ['admin', 'Admins']]} />
                        <SearchInput value={search} onChange={setSearch} placeholder="Nom, e-mail ou téléphone" className="sm:w-72" />
                    </div>

                    {list.length ? (
                        <Table head={[['Compte'], ['Boutique'], ['Formule'], ['Activité', 'text-right'], ['Inscrit le'], ['', 'w-40']]}>
                            {list.map((u) => (
                                <tr key={u.id} className="transition-colors hover:bg-[#FAFAF8]">
                                    <td className="px-4 py-3.5">
                                        <Link href={route('admin.users.show', u.id)} className="flex items-center gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6F5F1] text-[13px] font-medium text-[#141412]">{(u.name || '?').slice(0, 1).toUpperCase()}</span>
                                            <span className="min-w-0">
                                                <span className="flex items-center gap-1.5 truncate text-[#141412]">{u.name}{u.role === 'admin' && <ShieldCheck className="h-3.5 w-3.5 text-[#1D4ED8]" />}</span>
                                                <span className="block truncate text-[13px] text-[#8B8A83]">{u.email}</span>
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {u.store ? (
                                            <a href={`/${u.store.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#141412] hover:underline">
                                                <Store className="h-4 w-4 shrink-0 text-[#8B8A83]" /><span className="max-w-[160px] truncate">{u.store.name}</span>
                                            </a>
                                        ) : <span className="text-[#8B8A83]">—</span>}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {u.role === 'admin' ? <Badge tone="info">Admin</Badge> : <Badge tone={PLAN_TONE[u.plan || 'starter']}>{(u.plan || 'starter').replace(/^./, (c) => c.toUpperCase())}</Badge>}
                                    </td>
                                    <td className="px-4 py-3.5 text-right text-[13px] text-[#5F5E58]">
                                        {u.store ? <>{u.store.products_count} produit{u.store.products_count > 1 ? 's' : ''} · {u.store.orders_count} cmd<br /><span className="tabular-nums">{fcfa(u.store.wallet?.balance_available || 0)} dispo</span></> : '—'}
                                    </td>
                                    <td className="px-4 py-3.5 text-[#5F5E58]">{shortDate(u.created_at)}</td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            {u.role !== 'admin' && (u.is_banned
                                                ? <Button size="sm" onClick={() => unban(u)}>Réactiver</Button>
                                                : <Button size="sm" variant="ghost" onClick={() => setBanTarget(u)}><Ban className="h-4 w-4" /> Bannir</Button>)}
                                            <Link href={route('admin.users.show', u.id)} aria-label={`Fiche de ${u.name}`} className="flex h-8 w-8 items-center justify-center rounded-full text-[#8B8A83] hover:bg-[#F2F1EC] hover:text-[#141412]"><ChevronRight className="h-4 w-4" /></Link>
                                        </div>
                                        {u.is_banned && <p className="mt-1 text-right text-[12px] text-[#B91C1C]">Banni</p>}
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    ) : <div className="p-6"><Empty Icon={Users} title="Aucun compte trouvé" text="Essayez une autre recherche." /></div>}

                    <Pagination page={users} label="comptes" />
                </Card>
            </div>

            <ModerationModal isOpen={!!banTarget} onClose={() => setBanTarget(null)} onConfirm={confirmBan} type="user" isLoading={busy}
                itemName={banTarget?.name || ''} targetInfo={banTarget ? `${banTarget.email} · Boutique : ${banTarget.store?.name || 'aucune'}` : null} />
        </AuthenticatedLayout>
    );
}
