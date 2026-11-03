import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, ReceiptText, TrendingUp, XCircle } from 'lucide-react';
import { Badge, Card, Empty, OrderStatus, PageHeader, Pagination, SearchInput, Stat, Table, Tabs, dateTime, fcfa } from '@/Components/Dashboard/UI';

const PROVIDER = { mercypay: 'Mercy Pay', pawapay: 'pawaPay', hrskills: 'HR-Skills' };
const OPERATOR = { MTN: 'MTN MoMo', ORANGE: 'Orange Money' };

export default function Index({ orders, metrics = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const first = useRef(true);
    const list = orders?.data || [];

    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = setTimeout(() => router.get(route('admin.transactions.index'), { search, status: filters.status }, { preserveState: true, replace: true }), 350);
        return () => clearTimeout(t);
    }, [search]);

    const setStatus = (status) => router.get(route('admin.transactions.index'), { search, status }, { preserveState: true, replace: true });

    return (
        <AuthenticatedLayout>
            <Head title="Transactions, Administration Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Transactions" sub="Toutes les commandes passées sur les boutiques, avec leur paiement Mobile Money." />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    <Stat label="Ventes encaissées" value={fcfa(metrics.total_gmv)} hint={`Dont ${fcfa(metrics.total_saas_revenue)} pour Biolinko`} Icon={TrendingUp} />
                    <Stat label="Payées" value={metrics.paid_orders ?? 0} Icon={CheckCircle2} delay={0.03} />
                    <Stat label="En attente de paiement" value={metrics.pending_orders ?? 0} Icon={Clock} delay={0.06} />
                    <Stat label="Échouées ou annulées" value={metrics.cancelled_orders ?? 0} Icon={XCircle} delay={0.09} />
                </div>

                <Card padded={false}>
                    <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <Tabs id="tx-status" value={filters.status || 'all'} onChange={setStatus} tabs={[['all', 'Toutes'], ['paid', 'Payées'], ['pending', 'En attente'], ['failed', 'Échouées']]} />
                        <SearchInput value={search} onChange={setSearch} placeholder="Commande, client, référence" className="sm:w-72" />
                    </div>

                    {list.length ? (
                        <Table head={[['Commande'], ['Boutique'], ['Client'], ['Paiement'], ['Montant', 'text-right'], ['Biolinko', 'text-right'], ['Statut'], ['', 'w-10']]}>
                            {list.map((o) => (
                                <tr key={o.id} className="transition-colors hover:bg-[#FAFAF8]">
                                    <td className="px-4 py-3.5">
                                        <span className="block font-mono text-[13px] text-[#141412]">{o.tracking_code}</span>
                                        <span className="text-[12px] text-[#8B8A83]">{dateTime(o.created_at)}</span>
                                    </td>
                                    <td className="px-4 py-3.5"><span className="block max-w-[160px] truncate">{o.store?.name || '—'}</span></td>
                                    <td className="px-4 py-3.5">
                                        <span className="block max-w-[160px] truncate text-[#141412]">{o.customer_name}</span>
                                        <span className="text-[12px] text-[#8B8A83]">{o.customer_phone}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-[13px] text-[#5F5E58]">
                                        {OPERATOR[o.payment_operator] || o.payment_operator || '—'}
                                        {o.payment_provider && <span className="block text-[12px] text-[#8B8A83]">{PROVIDER[o.payment_provider] || o.payment_provider}</span>}
                                    </td>
                                    <td className="px-4 py-3.5 text-right tabular-nums text-[#141412]">{fcfa(o.total_client)}</td>
                                    <td className="px-4 py-3.5 text-right tabular-nums text-[#5F5E58]">{o.payment_status === 'paid' ? fcfa(Number(o.saas_margin) + Number(o.commission_amount)) : '—'}</td>
                                    <td className="px-4 py-3.5">
                                        <span className="flex flex-wrap gap-1.5">
                                            <OrderStatus status={o.status} />
                                            {o.is_manual ? <Badge>Facture manuelle</Badge> : null}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <a href={route('order.track', o.tracking_code)} target="_blank" rel="noreferrer" aria-label="Voir la page de suivi" className="flex h-8 w-8 items-center justify-center rounded-full text-[#8B8A83] hover:bg-[#F2F1EC] hover:text-[#141412]"><ExternalLink className="h-4 w-4" /></a>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    ) : <div className="p-6"><Empty Icon={ReceiptText} title="Aucune transaction" text="Aucune commande ne correspond à ces filtres." /></div>}
                    <Pagination page={orders} label="commandes" />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
