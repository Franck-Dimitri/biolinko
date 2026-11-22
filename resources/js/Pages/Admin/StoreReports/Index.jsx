import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { ArrowUpRight, Flag } from 'lucide-react';
import { Badge, Button, Card, Empty, PageHeader, Pagination, Tabs, dateTime } from '@/Components/Dashboard/UI';
import { storeUrl } from '@/Components/Storefront/storeUrl';

/** Boutiques signalées par les visiteurs : à examiner, puis suspendre depuis « Boutiques » si nécessaire. */
export default function Index({ reports, status, counts = {} }) {
    return (
        <AuthenticatedLayout>
            <Head title="Signalements de boutiques, Administration Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Signalements de boutiques" sub="Envoyés par les visiteurs depuis le pied de page des boutiques." />
                <Tabs id="store-reports" value={status} onChange={(v) => router.get(route('admin.storeReports.index'), { status: v }, { preserveState: true })}
                    tabs={[['open', 'À traiter', counts.open ?? 0], ['closed', 'Clos', counts.closed ?? 0]]} />

                {reports.data.length === 0 ? (
                    <Empty Icon={Flag} title="Aucun signalement" text={status === 'open' ? 'Rien à traiter pour le moment.' : 'Aucun signalement clos.'} />
                ) : (
                    <Card padded={false}>
                        <ul className="divide-y divide-black/[0.06]">
                            {reports.data.map((r) => (
                                <li key={r.id} className="flex flex-col gap-3 p-5 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0 space-y-1.5">
                                        <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-[#141412]">
                                            {r.store?.name || 'Boutique supprimée'} <Badge tone={r.reason === 'scam' || r.reason === 'fake' ? 'danger' : 'warning'}>{r.reason_label}</Badge>
                                        </p>
                                        <p className="max-w-[680px] whitespace-pre-line rounded-xl bg-[#F6F5F1] px-3 py-2 text-[14px] text-[#3D3C37] [overflow-wrap:anywhere]">{r.message}</p>
                                        <p className="text-[13px] text-[#8B8A83]">{r.contact ? `Contact : ${r.contact} · ` : ''}{dateTime(r.created_at)}</p>
                                    </div>
                                    <div className="flex shrink-0 flex-wrap gap-2">
                                        {r.store && <Button size="sm" href={storeUrl(r.store.slug)} target="_blank" rel="noreferrer">Voir la boutique <ArrowUpRight className="h-4 w-4" /></Button>}
                                        {r.store && <Button size="sm" href={route('admin.stores.index', { search: r.store.name })}>Gérer</Button>}
                                        {r.status === 'open' && <Button size="sm" variant="dark" onClick={() => router.post(route('admin.storeReports.close', r.id), {}, { preserveScroll: true })}>Clore</Button>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}
                <Pagination page={reports} label="signalements" />
            </div>
        </AuthenticatedLayout>
    );
}
