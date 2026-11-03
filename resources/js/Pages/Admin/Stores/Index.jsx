import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, ChevronRight, ExternalLink, Eye, EyeOff, FileEdit, Globe, Store } from 'lucide-react';
import ModerationModal from '@/Components/Admin/ModerationModal';
import { Badge, Button, Card, Empty, PageHeader, Pagination, SearchInput, Stat, Table, Tabs, fcfa, shortDate } from '@/Components/Dashboard/UI';

const planOf = (u) => (u?.plan || 'starter').replace(/^./, (c) => c.toUpperCase());

export default function Index({ stores, metrics = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [target, setTarget] = useState(null);
    const [busy, setBusy] = useState(false);
    const first = useRef(true);
    const list = stores?.data || [];

    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = setTimeout(() => router.get(route('admin.stores.index'), { search, status: filters.status }, { preserveState: true, replace: true }), 350);
        return () => clearTimeout(t);
    }, [search]);

    const setStatus = (status) => router.get(route('admin.stores.index'), { search, status }, { preserveState: true, replace: true });

    const republish = (s) => router.post(route('admin.stores.toggleStatus', s.id), {}, { preserveScroll: true, onSuccess: () => toast.success(`${s.name} est de nouveau en ligne.`) });

    const suspend = ({ reason }) => {
        setBusy(true);
        router.post(route('admin.stores.moderate', target.id), { reason, action: 'suspend' }, {
            preserveScroll: true,
            onSuccess: () => { toast.success(`${target.name} est suspendue, le vendeur a été prévenu.`); setTarget(null); },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Boutiques, Administration Biolinko" />
            <div hidden={!!target} className="space-y-6 pb-12">
                <PageHeader title="Boutiques" sub="Toutes les vitrines, leur état de publication et les signalements reçus." />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    <Stat label="Boutiques" value={metrics.total ?? 0} Icon={Store} />
                    <Stat label="En ligne" value={metrics.published ?? 0} Icon={Globe} delay={0.03} />
                    <Stat label="Brouillons" value={metrics.draft ?? 0} Icon={FileEdit} delay={0.06} />
                    <Stat label="Avec signalements" value={metrics.reported ?? 0} Icon={AlertTriangle} accent={(metrics.reported ?? 0) > 0} delay={0.09} />
                </div>

                <Card padded={false}>
                    <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <Tabs id="store-status" value={filters.status || 'all'} onChange={setStatus} tabs={[['all', 'Toutes'], ['published', 'En ligne'], ['draft', 'Brouillons'], ['reported', 'Signalées']]} />
                        <SearchInput value={search} onChange={setSearch} placeholder="Boutique, adresse ou vendeur" className="sm:w-72" />
                    </div>

                    {list.length ? (
                        <Table head={[['Boutique'], ['Vendeur'], ['Activité', 'text-right'], ['Solde', 'text-right'], ['État'], ['', 'w-44']]}>
                            {list.map((s) => (
                                <tr key={s.id} className="transition-colors hover:bg-[#FAFAF8]">
                                    <td className="px-4 py-3.5">
                                        <span className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F6F5F1]">{s.logo_url ? <img src={s.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4 text-[#8B8A83]" />}</span>
                                            <span className="min-w-0">
                                                <span className="block max-w-[200px] truncate text-[#141412]">{s.name || 'Sans nom'}</span>
                                                <span className="block text-[13px] text-[#8B8A83]">/{s.slug} · {shortDate(s.created_at)}</span>
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        {s.user ? (
                                            <Link href={route('admin.users.show', s.user.id)} className="block hover:underline">
                                                <span className="block max-w-[180px] truncate text-[#141412]">{s.user.name}</span>
                                                <span className="text-[13px] text-[#8B8A83]">{planOf(s.user)}{s.user.is_banned ? ' · banni' : ''}</span>
                                            </Link>
                                        ) : '—'}
                                    </td>
                                    <td className="px-4 py-3.5 text-right text-[13px] text-[#5F5E58]">{s.products_count} produit{s.products_count > 1 ? 's' : ''}<br />{s.orders_count} commande{s.orders_count > 1 ? 's' : ''}</td>
                                    <td className="px-4 py-3.5 text-right tabular-nums text-[#141412]">{fcfa(s.wallet?.balance_available || 0)}</td>
                                    <td className="px-4 py-3.5">
                                        <span className="flex flex-wrap gap-1.5">
                                            <Badge tone={s.is_published ? 'success' : 'neutral'}>{s.is_published ? 'En ligne' : 'Brouillon'}</Badge>
                                            {s.reports_count > 0 && <Badge tone={s.reports_count >= 3 ? 'danger' : 'warning'}>{s.reports_count} signalement{s.reports_count > 1 ? 's' : ''}</Badge>}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center justify-end gap-1">
                                            <a href={`/${s.slug}`} target="_blank" rel="noreferrer" aria-label="Voir la boutique" className="flex h-8 w-8 items-center justify-center rounded-full text-[#5F5E58] hover:bg-[#F2F1EC]"><ExternalLink className="h-4 w-4" /></a>
                                            {s.is_published
                                                ? <Button size="sm" variant="ghost" onClick={() => setTarget(s)}><EyeOff className="h-4 w-4" /> Suspendre</Button>
                                                : <Button size="sm" onClick={() => republish(s)}><Eye className="h-4 w-4" /> Publier</Button>}
                                            {s.user && <Link href={route('admin.users.show', s.user.id)} aria-label="Fiche du vendeur" className="flex h-8 w-8 items-center justify-center rounded-full text-[#8B8A83] hover:bg-[#F2F1EC] hover:text-[#141412]"><ChevronRight className="h-4 w-4" /></Link>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    ) : <div className="p-6"><Empty Icon={Store} title="Aucune boutique" text="Aucune boutique ne correspond à ces filtres." /></div>}

                    <Pagination page={stores} label="boutiques" />
                </Card>
            </div>

            <ModerationModal isOpen={!!target} onClose={() => setTarget(null)} onConfirm={suspend} type="store" isLoading={busy}
                itemName={target?.name || ''} targetInfo={target ? `biolinko.link/${target.slug} · ${target.user?.email || ''}` : null} />
        </AuthenticatedLayout>
    );
}
