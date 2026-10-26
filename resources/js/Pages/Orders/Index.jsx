import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertTriangle, ArrowRight, Clock, Copy, Download, FileText, MapPin, PackageCheck, Phone, ShoppingBag, Truck, Wallet, X } from 'lucide-react';
import ExportSalesModal from '@/Components/ExportSalesModal';
import { WhatsappIcon } from '@/Components/BrandIcons';
import {
    Badge, Button, Card, Empty, OrderStatus, PageHeader, SubPage, SearchInput, Stat, Table, Tabs, dateTime, fcfa, shortDate,
} from '@/Components/Dashboard/UI';

// Prochaine étape proposée au vendeur selon le statut
const NEXT_STEP = {
    paid: ['in_delivery', 'Marquer en livraison', Truck],
    in_delivery: ['delivered', 'Marquer comme livrée', PackageCheck],
};

const TIMELINE = [
    ['pending', 'Commande passée'],
    ['paid', 'Paiement confirmé'],
    ['in_delivery', 'En livraison'],
    ['delivered', 'Livrée'],
];
const RANK = { pending: 0, paid: 1, in_delivery: 2, delivered: 3 };

function whatsappLink(order, store) {
    let phone = (order.customer_phone || '').replace(/\D/g, '');
    if (phone.length === 9) phone = `237${phone}`;
    const text = `Bonjour ${order.customer_name}, c’est ${store.name}. Je vous contacte au sujet de votre commande ${order.tracking_code}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

// Signalement du client : la vente est gelée, le vendeur contacte le client puis répond ici
function ReportBlock({ order }) {
    const report = order.report;
    const [response, setResponse] = useState('');
    const [busy, setBusy] = useState(false);
    const { errors } = usePage().props;
    if (!report) return null;

    const open = report.status === 'open' || report.status === 'answered';
    const send = (e) => {
        e.preventDefault();
        setBusy(true);
        router.post(route('orders.report.respond', order.id), { response }, {
            preserveScroll: true,
            onSuccess: () => setResponse(''),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <section className={`rounded-2xl border p-4 text-[14px] ${open ? 'border-[#F59E0B]/50 bg-[#FFFBEB]' : 'border-black/[0.06] bg-[#F6F5F1]'}`}>
            <p className="flex items-center gap-2 font-medium text-[#141412]"><AlertTriangle className="h-4 w-4 text-[#B45309]" /> Signalement du client · {report.reason_label}</p>
            <p className="mt-2 whitespace-pre-line text-[#3D3C37] [overflow-wrap:anywhere]">« {report.message} »</p>
            <p className="mt-1 text-[13px] text-[#8B8A83]">Le {dateTime(report.created_at)}</p>

            {report.seller_response && (
                <div className="mt-3 rounded-xl bg-white p-3">
                    <p className="text-[13px] text-[#8B8A83]">Votre réponse · {dateTime(report.seller_responded_at)}</p>
                    <p className="mt-1 whitespace-pre-line text-[#141412] [overflow-wrap:anywhere]">{report.seller_response}</p>
                </div>
            )}

            {report.status === 'open' && (
                <form onSubmit={send} className="mt-3 space-y-2">
                    <p className="text-[#5F5E58]">Cette vente reste en attente. Appelez ou écrivez au client pour trouver une solution, puis expliquez ce qui a été fait.</p>
                    <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={3} required minLength={5} maxLength={1000}
                        placeholder="Ex. : Livré le 12 à Akwa, le client a reçu son colis. Échange de taille prévu demain."
                        className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-[14px] focus:border-black/30 focus:ring-0" />
                    {errors?.response && <p className="text-[13px] text-[#B91C1C]">{errors.response}</p>}
                    <Button type="submit" variant="primary" size="sm" disabled={busy || response.trim().length < 5}>Envoyer ma réponse</Button>
                </form>
            )}

            <p className="mt-3 text-[13px] text-[#5F5E58]">
                {report.status === 'answered' && 'Si le client ne réagit pas sous 3 jours, la vente sera libérée automatiquement.'}
                {report.status === 'resolved' && 'Le client a indiqué que le problème est résolu. La vente est libérée.'}
                {report.status === 'released' && 'Clos sans réaction du client : la vente a été libérée.'}
            </p>
        </section>
    );
}

// Disponibilité de l'argent de la vente (délai de sécurité)
function FundsLine({ order }) {
    if (order.payment_status !== 'paid' || order.is_manual) return null;
    if (order.funds_released_at) return <p className="flex items-center gap-2 text-[13px] text-[#15803D]"><Wallet className="h-4 w-4" /> Argent disponible dans votre portefeuille</p>;
    const frozen = order.report && ['open', 'answered'].includes(order.report.status);
    return (
        <p className="flex items-center gap-2 text-[13px] text-[#5F5E58]">
            <Clock className="h-4 w-4" /> {frozen ? 'Argent en attente le temps de régler le signalement' : `Argent disponible le ${dateTime(order.funds_release_at)}`}
        </p>
    );
}

function OrderPanel({ order, store, onClose }) {
    const [busy, setBusy] = useState(false);
    if (!order) return null;
    const next = NEXT_STEP[order.status];
    const trackUrl = `${window.location.origin}/track/${order.tracking_code}`;
    const fee = Number(order.saas_margin || 0) + Number(order.api_fee || 0);

    const move = (status) => {
        setBusy(true);
        router.patch(route('orders.updateStatus', order.id), { status }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Statut mis à jour. Le client est prévenu sur WhatsApp.'),
            onError: (e) => toast.error(e.status || 'Mise à jour impossible.'),
            onFinish: () => setBusy(false),
        });
    };

    const copy = async () => {
        try { await navigator.clipboard.writeText(trackUrl); toast.success('Lien de suivi copié'); } catch (e) { /* indisponible */ }
    };

    return (
        <SubPage onClose={onClose} backLabel="Retour aux commandes" width="max-w-4xl" title={`Commande ${order.tracking_code}`}
            sub={`${order.customer_name} · ${fcfa(order.total_client)}`}>
                <div className="mb-6 flex flex-wrap items-center gap-2"><OrderStatus status={order.status} />{order.is_manual ? <Badge>Facture manuelle</Badge> : null}</div>
                <div className="space-y-6">
                    <ReportBlock order={order} />
                    <FundsLine order={order} />
                    {order.status !== 'cancelled' && order.status !== 'failed' && (
                        <ol className="grid grid-cols-4 gap-1">
                            {TIMELINE.map(([key, label], i) => {
                                const done = RANK[order.status] >= i;
                                return (
                                    <li key={key} className="text-center">
                                        <span className={`mx-auto block h-1.5 rounded-full ${done ? 'bg-[#FFCC00]' : 'bg-[#F2F1EC]'}`} />
                                        <span className={`mt-2 block text-[12px] ${done ? 'text-[#141412]' : 'text-[#8B8A83]'}`}>{label}</span>
                                    </li>
                                );
                            })}
                        </ol>
                    )}

                    {next && (
                        <Button variant="primary" size="lg" className="w-full" disabled={busy} onClick={() => move(next[0])}>
                            {(() => { const I = next[2]; return <I className="h-4 w-4" />; })()} {next[1]}
                        </Button>
                    )}

                    <section>
                        <h3 className="text-[14px] text-[#8B8A83]">Client</h3>
                        <p className="mt-2 text-[16px] font-medium text-[#141412]">{order.customer_name}</p>
                        <ul className="mt-2 space-y-1.5 text-[14px] text-[#3D3C37]">
                            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#8B8A83]" /> {order.customer_phone}</li>
                            {(order.city || order.address_details) && (
                                <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8B8A83]" /> {[order.city, order.address_details].filter(Boolean).join(' · ')}</li>
                            )}
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button size="sm" href={whatsappLink(order, store)} target="_blank" rel="noreferrer"><WhatsappIcon className="h-4 w-4 text-[#16A34A]" /> WhatsApp</Button>
                            <Button size="sm" href={`tel:+${(order.customer_phone || '').replace(/\D/g, '')}`}><Phone className="h-4 w-4" /> Appeler</Button>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-[14px] text-[#8B8A83]">Articles</h3>
                        <ul className="mt-2 divide-y divide-black/[0.05] rounded-2xl border border-black/[0.06]">
                            {(order.items || []).map((it) => (
                                <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]">
                                    <span className="min-w-0">
                                        <span className="block truncate text-[#141412]">{it.product_title}</span>
                                        <span className="text-[13px] text-[#8B8A83]">{it.variant_label ? `${it.variant_label} · ` : ''}Qté {it.quantity}</span>
                                    </span>
                                    <span className="shrink-0 tabular-nums text-[#141412]">{fcfa(it.total_price_vendor)}</span>
                                </li>
                            ))}
                        </ul>
                        <dl className="mt-3 space-y-1.5 px-1 text-[14px]">
                            <div className="flex justify-between text-[#5F5E58]"><dt>Vos articles</dt><dd className="tabular-nums">{fcfa(order.price_vendor)}</dd></div>
                            {fee > 0 && <div className="flex justify-between text-[#5F5E58]"><dt>Frais de service (payés par le client)</dt><dd className="tabular-nums">{fcfa(fee)}</dd></div>}
                            {Number(order.commission_amount) > 0 && <div className="flex justify-between text-[#5F5E58]"><dt>Commission Biolinko ({String(Number(order.commission_rate)).replace('.', ',')} %)</dt><dd className="tabular-nums">−{fcfa(order.commission_amount)}</dd></div>}
                            {Number(order.commission_amount) > 0 && <div className="flex justify-between font-medium text-[#15803D]"><dt>Vous recevez</dt><dd className="tabular-nums">{fcfa(Number(order.price_vendor) - Number(order.commission_amount))}</dd></div>}
                            <div className="flex justify-between font-medium text-[#141412]"><dt>Payé par le client</dt><dd className="tabular-nums">{fcfa(order.total_client)}</dd></div>
                        </dl>
                    </section>

                    <section className="rounded-2xl bg-[#F6F5F1] p-4 text-[14px]">
                        <p className="text-[#5F5E58]">Lien de suivi envoyé au client</p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#141412]">{trackUrl}</span>
                            <Button size="sm" onClick={copy}><Copy className="h-4 w-4" /> Copier</Button>
                        </div>
                    </section>

                    <p className="text-[13px] text-[#8B8A83]">Créée le {dateTime(order.created_at)}{order.paid_at ? ` · payée le ${dateTime(order.paid_at)}` : ''}</p>
                </div>

                <div className="mt-8 flex flex-wrap gap-2 border-t border-black/[0.06] pt-6">
                    <Button href={route('seller.invoices.preview', order.id)} target="_blank"><FileText className="h-4 w-4" /> Facture</Button>
                    {order.status === 'pending' && <Button variant="danger" disabled={busy} onClick={() => move('cancelled')}>Annuler la commande</Button>}
                </div>
        </SubPage>
    );
}

export default function Index({ store, orders, metrics, filters, canExportSales = false }) {
    const list = orders?.data || [];
    const [showExport, setShowExport] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');
    const tab = filters?.status || 'all';
    const first = useRef(true);
    const selected = list.find((o) => o.id === selectedId) || null;
    const { errors } = usePage().props;

    // Recherche côté serveur, avec un léger délai pendant la frappe
    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = setTimeout(() => router.get(route('orders.index'), { status: tab, search }, { preserveState: true, replace: true }), 350);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => { if (errors?.status) toast.error(errors.status); }, [errors]);

    const changeTab = (status) => router.get(route('orders.index'), { status, search }, { preserveState: true, replace: true });

    return (
        <AuthenticatedLayout>
            <Head title="Commandes, Biolinko" />
            {selected && <OrderPanel order={selected} store={store} onClose={() => setSelectedId(null)} />}
            <ExportSalesModal show={showExport} onClose={() => setShowExport(false)} canExport={canExportSales} />
            <div className="space-y-6 pb-12" hidden={!!selected || showExport}>
                <PageHeader
                    title="Commandes"
                    sub="Suivez vos ventes, de la commande à la livraison."
                    actions={<Button onClick={() => setShowExport(true)}><Download className="h-4 w-4" /> Exporter{!canExportSales && <Badge className="ml-1">Business</Badge>}</Button>}
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="À livrer" value={metrics?.toDeliverOrdersCount ?? 0} hint="Payées, en attente d’expédition" Icon={Truck} accent={(metrics?.toDeliverOrdersCount ?? 0) > 0} delay={0.03} />
                    <Stat label="Livrées" value={metrics?.deliveredOrdersCount ?? 0} Icon={PackageCheck} delay={0.06} />
                    <Stat label="Non payées" value={metrics?.abandonedOrdersCount ?? 0} hint="En attente ou annulées" Icon={ShoppingBag} delay={0.09} />
                    <Stat label="Ventes encaissées" value={fcfa(metrics?.totalRevenue)} Icon={Wallet} delay={0.12} />
                </div>

                <Card padded={false} delay={0.1}>
                    <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
                        <Tabs id="orders" value={tab} onChange={changeTab} tabs={[
                            ['all', 'Toutes', metrics?.totalOrdersCount],
                            ['to_deliver', 'À livrer', metrics?.toDeliverOrdersCount],
                            ['delivered', 'Livrées'],
                            ['pending', 'Non payées'],
                            ['cancelled', 'Annulées'],
                        ]} />
                        <SearchInput value={search} onChange={setSearch} placeholder="Code, nom ou téléphone" className="lg:w-72" />
                    </div>

                    {list.length ? (
                        <Table head={[['Commande'], ['Client'], ['Date'], ['Montant', 'text-right'], ['Statut'], ['', 'w-10']]}>
                            {list.map((o) => (
                                <tr key={o.id} onClick={() => setSelectedId(o.id)} className="cursor-pointer transition-colors hover:bg-[#FAFAF8]">
                                    <td className="px-4 py-3.5">
                                        <span className="block font-mono text-[13px] text-[#141412]">{o.tracking_code}</span>
                                        <span className="block max-w-[220px] truncate text-[13px] text-[#8B8A83]">{(o.items || []).map((i) => i.product_title).join(', ')}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="block text-[#141412]">{o.customer_name}</span>
                                        <span className="text-[13px] text-[#8B8A83]">{o.city}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-[#5F5E58]">{shortDate(o.created_at)}</td>
                                    <td className="px-4 py-3.5 text-right tabular-nums text-[#141412]">{fcfa(o.total_client)}</td>
                                    <td className="px-4 py-3.5">
                                        <span className="flex flex-wrap items-center gap-1.5">
                                            <OrderStatus status={o.status} />
                                            {o.report && ['open', 'answered'].includes(o.report.status) && <Badge tone="warning">Signalée</Badge>}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-[#8B8A83]"><ArrowRight className="h-4 w-4" /></td>
                                </tr>
                            ))}
                        </Table>
                    ) : (
                        <div className="p-4">
                            <Empty Icon={ShoppingBag} title={search ? 'Aucune commande ne correspond' : 'Aucune commande ici'}
                                text={search ? 'Essayez un autre code, nom ou numéro.' : 'Partagez le lien de votre boutique pour recevoir vos premières commandes.'} />
                        </div>
                    )}

                    {orders?.links?.length > 3 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] px-4 py-3 text-[14px]">
                            <span className="text-[#8B8A83]">{orders.from}–{orders.to} sur {orders.total}</span>
                            <div className="flex gap-1">
                                {orders.links.map((l, i) => (
                                    <Link key={i} href={l.url || '#'} preserveScroll preserveState disabled={!l.url}
                                        className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 ${l.active ? 'bg-[#141412] text-white' : l.url ? 'text-[#141412] hover:bg-black/5' : 'pointer-events-none text-[#8B8A83]'}`}
                                        dangerouslySetInnerHTML={{ __html: l.label.replace('&laquo; Previous', '‹').replace('Next &raquo;', '›').replace('pagination.previous', '‹').replace('pagination.next', '›') }} />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

        </AuthenticatedLayout>
    );
}
