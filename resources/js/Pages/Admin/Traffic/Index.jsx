import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Eye, MousePointerClick, ShoppingBag, Users } from 'lucide-react';
import { Card, CardHeader, PageHeader, Stat, Tabs } from '@/Components/Dashboard/UI';
import { Breakdown, COUNTRY, DEVICE, PAGE, SOURCE, VisitsChart } from '@/Components/Dashboard/TrafficParts';
import { storeUrl } from '@/Components/Storefront/storeUrl';

/** Fréquentation de la plateforme : visiteurs, pays, sources, appareils et boutiques les plus visitées. */
export default function Index({ stats, filters }) {
    const go = (k, v) => router.get(route('admin.traffic.index'), { ...filters, [k]: v }, { preserveState: true, preserveScroll: true });
    const n = (x) => Number(x || 0).toLocaleString('fr-FR');

    return (
        <AuthenticatedLayout>
            <Head title="Trafic, Administration Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Trafic" sub="Visites des boutiques et du site Biolinko, sans donnée personnelle (robots, vendeurs et admins exclus)." />
                <div className="flex flex-wrap gap-3">
                    <Tabs id="perimetre" value={filters.perimetre} onChange={(v) => go('perimetre', v)} tabs={[['all', 'Toute la plateforme'], ['site', 'Site Biolinko']]} />
                    <Tabs id="jours" value={String(filters.jours)} onChange={(v) => go('jours', v)} tabs={[['7', '7 jours'], ['30', '30 jours'], ['90', '90 jours']]} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Visiteurs uniques" value={n(stats.visitors)} Icon={Users} hint={`Sur ${stats.days} jours`} />
                    <Stat label="Pages vues" value={n(stats.views)} Icon={Eye} hint={stats.visitors ? `${(stats.views / stats.visitors).toFixed(1).replace('.', ',')} pages par visiteur` : '—'} />
                    <Stat label="Commandes payées" value={n(stats.paid_orders)} Icon={ShoppingBag} hint="Sur la même période" />
                    <Stat label="Conversion" value={stats.conversion === null ? '—' : `${String(stats.conversion).replace('.', ',')} %`} Icon={MousePointerClick} hint="Commandes payées / visiteurs" />
                </div>

                <Card>
                    <CardHeader title="Visiteurs par jour" sub="Survolez une barre pour le détail." />
                    <div className="mt-6"><VisitsChart series={stats.series} /></div>
                </Card>

                <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                    <Card><CardHeader title="Pays" sub="D’après le réseau en production" /><div className="mt-5"><Breakdown rows={stats.countries} labels={COUNTRY} flag /></div></Card>
                    <Card><CardHeader title="Sources" sub="D’où viennent les visiteurs" /><div className="mt-5"><Breakdown rows={stats.sources} labels={SOURCE} /></div></Card>
                    <Card><CardHeader title="Appareils" /><div className="mt-5"><Breakdown rows={stats.devices} labels={DEVICE} /></div></Card>
                    <Card><CardHeader title="Pages" /><div className="mt-5"><Breakdown rows={stats.pages} labels={PAGE} /></div></Card>
                </div>

                {stats.stores && (
                    <Card padded={false}>
                        <div className="p-5 sm:p-6"><CardHeader title="Boutiques les plus visitées" /></div>
                        {stats.stores.length ? (
                            <ul className="divide-y divide-black/[0.05] border-t border-black/[0.06]">
                                {stats.stores.map((s, i) => (
                                    <li key={s.slug} className="flex items-center gap-4 px-5 py-3 text-[14px]">
                                        <span className="w-5 text-[13px] tabular-nums text-[#8B8A83]">{i + 1}</span>
                                        <a href={storeUrl(s.slug)} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-[#141412] hover:underline">{s.name}</a>
                                        <span className="shrink-0 tabular-nums text-[#5F5E58]">{n(s.visitors)} visiteurs · {n(s.views)} pages</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="border-t border-black/[0.06] px-5 py-6 text-[13px] text-[#8B8A83]">Pas encore de visites sur les boutiques.</p>}
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
