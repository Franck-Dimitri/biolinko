import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Eye, LayoutTemplate, ShoppingBag, ShoppingCart, Wallet } from 'lucide-react';
import { Badge, Card, PageHeader, Stat, Table, Tabs, fcfa } from '@/Components/Dashboard/UI';

/** Mesures de lancement par template : on ouvre une activité à tous quand ses templates vendent bien chez les pilotes. */
const MODES = {
    off: ['Fermé', 'Aucun vendeur ne voit encore les templates (sauf les boutiques activées depuis l’admin).', 'neutral'],
    pilot: ['Offre pilote', 'Seuls les vendeurs de l’offre pilote créent leur boutique avec un template et ont accès à l’éditeur de Ma boutique.', 'warning'],
    all: ['Ouvert à tous', 'Tous les vendeurs créent leur boutique avec un template ; les anciennes boutiques sont invitées à essayer.', 'success'],
};

export default function Index({ rows = [], days = 30, periods = [], rollout, totals }) {
    const [label, text, tone] = MODES[rollout.mode] || MODES.pilot;
    const setDays = (d) => router.get(route('admin.templates.index'), { jours: d }, { preserveState: true, replace: true });

    return (
        <AuthenticatedLayout>
            <Head title="Templates, Administration Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Templates" sub="Visites, ajouts au panier et commandes par template, pour piloter le lancement." />

                <Card>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="flex items-center gap-2 text-[15px] font-medium text-[#141412]"><LayoutTemplate className="h-4 w-4" /> Lancement : <Badge tone={tone}>{label}</Badge></p>
                            <p className="mt-1 text-[14px] text-[#5F5E58]">{text}{rollout.activities ? ` Activités ouvertes : ${rollout.activities.join(', ')}.` : ''}</p>
                        </div>
                        <p className="text-[13px] text-[#8B8A83]">Réglage : <code className="rounded bg-[#F6F5F1] px-1.5 py-0.5">BIOLINKO_TEMPLATES</code> et <code className="rounded bg-[#F6F5F1] px-1.5 py-0.5">BIOLINKO_TEMPLATES_ACTIVITIES</code> dans .env</p>
                    </div>
                </Card>

                <Tabs id="template-days" value={String(days)} onChange={(v) => setDays(Number(v))} tabs={periods.map((p) => [String(p), `${p} jours`])} />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    <Stat label="Visites" value={totals.views.toLocaleString('fr-FR')} Icon={Eye} />
                    <Stat label="Ajouts au panier" value={totals.carts.toLocaleString('fr-FR')} Icon={ShoppingCart} delay={0.03} />
                    <Stat label="Commandes payées" value={totals.orders.toLocaleString('fr-FR')} Icon={ShoppingBag} delay={0.06} />
                    <Stat label="Ventes" value={fcfa(totals.revenue)} Icon={Wallet} delay={0.09} />
                </div>

                <Card padded={false}>
                    <Table head={[['Template'], ['Boutiques', 'text-right'], ['Visites', 'text-right'], ['Paniers', 'text-right'], ['Commandes', 'text-right'], ['Ventes', 'text-right'], ['Conversion', 'text-right']]}>
                        {rows.map((r) => (
                            <tr key={r.id} className="transition-colors hover:bg-[#FAFAF8]">
                                <td className="px-4 py-3">
                                    <span className="block text-[#141412]">{r.name}</span>
                                    <span className="block text-[13px] text-[#8B8A83]">{r.activity}</span>
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums">{r.stores}</td>
                                <td className="px-4 py-3 text-right tabular-nums">{r.views.toLocaleString('fr-FR')}</td>
                                <td className="px-4 py-3 text-right tabular-nums">{r.carts.toLocaleString('fr-FR')}</td>
                                <td className="px-4 py-3 text-right tabular-nums">{r.orders.toLocaleString('fr-FR')}</td>
                                <td className="px-4 py-3 text-right tabular-nums">{fcfa(r.revenue)}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-[#5F5E58]">{r.conversion === null ? '—' : `${String(r.conversion).replace('.', ',')} %`}</td>
                            </tr>
                        ))}
                    </Table>
                </Card>
                <p className="text-[13px] text-[#8B8A83]">Visites : pages de vitrine et de produits, hors vendeur, aperçus et robots. Conversion : commandes payées pour 100 visites. Les commandes passées avant le lancement n’ont pas de template.</p>
            </div>
        </AuthenticatedLayout>
    );
}
