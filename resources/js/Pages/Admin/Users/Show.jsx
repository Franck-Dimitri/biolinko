import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Ban, Crown, ExternalLink, Eye, EyeOff, Mail, Package, Phone, ShieldCheck, ShoppingBag, Store, Trash2, Wallet } from 'lucide-react';
import ModerationModal from '@/Components/Admin/ModerationModal';
import { Badge, Button, Card, CardHeader, Empty, Field, OrderStatus, PageHeader, Stat, Table, Tabs, dateTime, fcfa, fieldClass, shortDate } from '@/Components/Dashboard/UI';

const PLANS = [['starter', 'Starter'], ['pro', 'Pro'], ['growth', 'Growth'], ['business', 'Business']];
const REPORT_STATUS = { open: ['Ouvert', 'warning'], answered: ['Vendeur a répondu', 'info'], resolved: ['Résolu', 'success'], released: ['Clos', 'neutral'] };
const WITHDRAWAL_STATUS = { pending: ['En attente', 'warning'], processing: ['Virement en cours', 'info'], completed: ['Payé', 'success'], rejected: ['Rejeté', 'danger'] };
const SUB_SOURCE = { admin: 'Attribué par l’admin', simulation: 'Paiement simulé', mercypay: 'Mercy Pay', pawapay: 'pawaPay', hrskills: 'HR-Skills' };

// Changement de formule par l'admin : plan + durée, avec échéance réelle
function PlanBox({ vendor, daysRemaining }) {
    const [plan, setPlan] = useState(vendor.plan || 'starter');
    const [months, setMonths] = useState(1);
    const [busy, setBusy] = useState(false);
    const submit = () => {
        setBusy(true);
        router.post(route('admin.users.plan', vendor.id), { plan, months }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Formule mise à jour.'),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <Card>
            <CardHeader title="Formule" sub={vendor.plan && vendor.plan !== 'starter'
                ? `${(vendor.plan || '').replace(/^./, (c) => c.toUpperCase())} jusqu’au ${shortDate(vendor.subscription_expires_at)}${daysRemaining !== null ? ` · ${daysRemaining} j restants` : ''}`
                : 'Starter, gratuit'} />
            <div className="mt-4 grid grid-cols-2 gap-2">
                {PLANS.map(([id, label]) => (
                    <button key={id} type="button" aria-pressed={plan === id} onClick={() => setPlan(id)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-[14px] transition-colors ${plan === id ? 'border-[#141412] bg-[#FFFBEA] font-medium' : 'border-black/10 hover:border-black/30'}`}>
                        {id !== 'starter' && <Crown className="h-3.5 w-3.5 text-[#B45309]" />}{label}
                    </button>
                ))}
            </div>
            {plan !== 'starter' && (
                <div className="mt-3">
                    <Field label="Durée offerte">
                        <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className={fieldClass}>
                            {[1, 3, 6, 12].map((m) => <option key={m} value={m}>{m} mois</option>)}
                        </select>
                    </Field>
                </div>
            )}
            <Button variant="primary" className="mt-4 w-full" disabled={busy} onClick={submit}>
                {plan === 'starter' ? 'Repasser au Starter' : `Attribuer ${months} mois de ${PLANS.find(([k]) => k === plan)[1]}`}
            </Button>
            <p className="mt-2 text-[12px] text-[#8B8A83]">Sans paiement : l’opération est notée dans l’historique des abonnements.</p>
        </Card>
    );
}

export default function Show({ vendor, stats = {}, reports = [], withdrawals = [], subscriptions = [], daysRemaining = null }) {
    const store = vendor.store;
    const [tab, setTab] = useState('products');
    const [moderation, setModeration] = useState(null); // { type, id, name, info }
    const [busy, setBusy] = useState(false);

    const confirm = ({ reason }) => {
        const { type, id } = moderation;
        const done = { preserveScroll: true, onSuccess: () => { toast.success('Action effectuée, le vendeur a été prévenu.'); setModeration(null); }, onFinish: () => setBusy(false) };
        setBusy(true);
        if (type === 'product') router.delete(route('admin.products.destroy', id), { data: { reason }, ...done });
        else if (type === 'store') router.post(route('admin.stores.moderate', id), { reason, action: 'suspend' }, done);
        else router.post(route('admin.users.toggleBan', id), { reason }, done);
    };

    const products = store?.products || [];
    const orders = store?.orders || [];

    return (
        <AuthenticatedLayout>
            <Head title={`${vendor.name}, Administration Biolinko`} />
            <div hidden={!!moderation} className="space-y-6 pb-12">
                <PageHeader title={vendor.name} onBack={() => router.visit(route('admin.users.index'))} backLabel="Retour aux vendeurs"
                    sub={<span className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{vendor.email}</span>
                        {vendor.phone_whatsapp && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{vendor.phone_whatsapp}</span>}
                        <span>Inscrit le {shortDate(vendor.created_at)}</span>
                        {vendor.is_banned && <Badge tone="danger">Banni</Badge>}
                        {vendor.role === 'admin' && <Badge tone="info"><ShieldCheck className="h-3.5 w-3.5" /> Admin</Badge>}
                    </span>}
                    actions={vendor.role !== 'admin' && (vendor.is_banned
                        ? <Button onClick={() => router.post(route('admin.users.toggleBan', vendor.id), {}, { preserveScroll: true })}>Réactiver le compte</Button>
                        : <Button variant="danger" onClick={() => setModeration({ type: 'user', id: vendor.id, name: vendor.name, info: vendor.email })}><Ban className="h-4 w-4" /> Bannir</Button>)} />

                {reports.some((r) => ['open', 'answered'].includes(r.status)) || reports.length >= 3 ? (
                    <div className="flex gap-3 rounded-2xl border border-[#F59E0B]/50 bg-[#FFFBEB] p-4 text-[14px] text-[#141412]">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" />
                        <p>{reports.length} signalement{reports.length > 1 ? 's' : ''} client{reports.length >= 3 ? ' : ce vendeur est sous contrôle, vérifiez ses retraits avant de les valider.' : '.'}</p>
                    </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    <Stat label="Ventes encaissées" value={fcfa(stats.total_revenue)} hint={`${stats.orders_breakdown?.paid ?? 0} payées · ${stats.delivered_count ?? 0} livrées`} Icon={ShoppingBag} />
                    <Stat label="Commissions Biolinko" value={fcfa(stats.commission_paid)} Icon={Crown} delay={0.03} />
                    <Stat label="Solde disponible" value={fcfa(stats.wallet_available)} hint={`${fcfa(stats.wallet_held)} en attente · ${fcfa(stats.wallet_pending)} en retrait`} Icon={Wallet} delay={0.06} />
                    <Stat label="Produits" value={`${stats.active_products_count ?? 0} / ${stats.products_count ?? 0}`} hint="visibles / total" Icon={Package} delay={0.09} />
                </div>

                <div className="grid items-start gap-4 xl:grid-cols-[1fr_340px]">
                    <Card padded={false}>
                        <div className="border-b border-black/[0.06] p-4">
                            <Tabs id="vendor" value={tab} onChange={setTab} tabs={[['products', `Produits (${products.length})`], ['orders', 'Commandes'], ['reports', `Signalements (${reports.length})`], ['money', 'Retraits & abonnements']]} />
                        </div>

                        {tab === 'products' && (products.length ? (
                            <Table head={[['Produit'], ['Prix', 'text-right'], ['Stock', 'text-right'], ['Statut'], ['', 'w-28']]}>
                                {products.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3">
                                            <span className="flex items-center gap-3">
                                                <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#F6F5F1]">{p.image_url && <img src={p.image_url} alt="" className="h-full w-full object-cover" />}</span>
                                                <span className="max-w-[260px] truncate text-[#141412]">{p.title}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">{fcfa(p.is_promo && p.promo_price ? p.promo_price : p.price_vendor)}</td>
                                        <td className="px-4 py-3 text-right tabular-nums">{p.stock}</td>
                                        <td className="px-4 py-3"><Badge tone={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'Visible' : 'Masqué'}</Badge></td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Link href={route('admin.products.toggleActive', p.id)} method="post" as="button" preserveScroll aria-label={p.is_active ? 'Masquer' : 'Rendre visible'}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#5F5E58] hover:bg-[#F2F1EC]">{p.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Link>
                                                <button type="button" aria-label="Supprimer" onClick={() => setModeration({ type: 'product', id: p.id, name: p.title, info: store?.name })}
                                                    className="flex h-8 w-8 items-center justify-center rounded-full text-[#B91C1C] hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Table>
                        ) : <div className="p-6"><Empty Icon={Package} title="Aucun produit" text="Ce vendeur n’a pas encore ajouté de produit." /></div>)}

                        {tab === 'orders' && (orders.length ? (
                            <Table head={[['Commande'], ['Client'], ['Date'], ['Montant', 'text-right'], ['Statut']]}>
                                {orders.map((o) => (
                                    <tr key={o.id}>
                                        <td className="px-4 py-3"><a href={route('order.track', o.tracking_code)} target="_blank" rel="noreferrer" className="font-mono text-[13px] text-[#141412] hover:underline">{o.tracking_code}</a></td>
                                        <td className="px-4 py-3">{o.customer_name}</td>
                                        <td className="px-4 py-3 text-[#5F5E58]">{shortDate(o.created_at)}</td>
                                        <td className="px-4 py-3 text-right tabular-nums">{fcfa(o.total_client)}</td>
                                        <td className="px-4 py-3"><OrderStatus status={o.status} /></td>
                                    </tr>
                                ))}
                            </Table>
                        ) : <div className="p-6"><Empty Icon={ShoppingBag} title="Aucune commande" text="Les 25 dernières commandes s’affichent ici." /></div>)}

                        {tab === 'reports' && (reports.length ? (
                            <ul className="divide-y divide-black/[0.05]">
                                {reports.map((r) => {
                                    const [label, tone] = REPORT_STATUS[r.status] || REPORT_STATUS.open;
                                    return (
                                        <li key={r.id} className="space-y-2 p-4 text-[14px]">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-[#141412]">{r.reason_label} · <span className="font-mono text-[13px]">{r.order?.tracking_code}</span></span>
                                                <Badge tone={tone}>{label}</Badge>
                                            </div>
                                            <p className="text-[#3D3C37] [overflow-wrap:anywhere]">« {r.message} »</p>
                                            {r.seller_response && <p className="rounded-xl bg-[#F6F5F1] p-3 text-[#3D3C37] [overflow-wrap:anywhere]"><span className="text-[#8B8A83]">Réponse du vendeur : </span>{r.seller_response}</p>}
                                            <p className="text-[12px] text-[#8B8A83]">{dateTime(r.created_at)} · client {r.customer_phone}</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : <div className="p-6"><Empty Icon={AlertTriangle} title="Aucun signalement" text="Aucun client n’a signalé de problème." /></div>)}

                        {tab === 'money' && (
                            <div className="space-y-6 p-4">
                                <section>
                                    <h3 className="mb-2 text-[14px] text-[#8B8A83]">Retraits</h3>
                                    {withdrawals.length ? (
                                        <ul className="divide-y divide-black/[0.05] rounded-2xl border border-black/[0.06]">
                                            {withdrawals.map((w) => {
                                                const [label, tone] = WITHDRAWAL_STATUS[w.status] || WITHDRAWAL_STATUS.pending;
                                                return (
                                                    <li key={w.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]">
                                                        <span><span className="block tabular-nums text-[#141412]">{fcfa(w.amount)}{Number(w.fee) > 0 && <span className="text-[13px] text-[#8B8A83]"> · net {fcfa(w.net_amount)}</span>}</span><span className="text-[12px] text-[#8B8A83]">{w.phone_number} · {dateTime(w.created_at)}</span></span>
                                                        <Badge tone={tone}>{label}</Badge>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : <p className="text-[14px] text-[#8B8A83]">Aucun retrait.</p>}
                                </section>
                                <section>
                                    <h3 className="mb-2 text-[14px] text-[#8B8A83]">Abonnements</h3>
                                    {subscriptions.length ? (
                                        <ul className="divide-y divide-black/[0.05] rounded-2xl border border-black/[0.06]">
                                            {subscriptions.map((s) => (
                                                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3 text-[14px]">
                                                    <span><span className="block text-[#141412]">{(s.plan || '').replace(/^./, (c) => c.toUpperCase())} · {s.billing_cycle} mois</span><span className="text-[12px] text-[#8B8A83]">{SUB_SOURCE[s.payment_provider] || 'Mobile Money'} · {dateTime(s.created_at)}</span></span>
                                                    <span className="text-right"><span className="block tabular-nums">{fcfa(s.amount)}</span><Badge tone={s.payment_status === 'paid' ? 'success' : s.payment_status === 'failed' ? 'danger' : 'warning'}>{s.payment_status === 'paid' ? 'Payé' : s.payment_status === 'failed' ? 'Échoué' : 'En attente'}</Badge></span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <p className="text-[14px] text-[#8B8A83]">Aucun abonnement.</p>}
                                </section>
                            </div>
                        )}
                    </Card>

                    <div className="space-y-4">
                        {vendor.role !== 'admin' && <PlanBox vendor={vendor} daysRemaining={daysRemaining} />}

                        <Card>
                            <CardHeader title="Boutique" />
                            {store ? (
                                <div className="mt-4 space-y-3 text-[14px]">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F6F5F1]">{store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-5 w-5 text-[#8B8A83]" />}</span>
                                        <span className="min-w-0"><span className="block truncate font-medium text-[#141412]">{store.name}</span><span className="block truncate text-[13px] text-[#8B8A83]">biolinko.link/{store.slug}</span></span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge tone={store.is_published ? 'success' : 'neutral'}>{store.is_published ? 'En ligne' : 'Brouillon'}</Badge>
                                        {stats.hold_days && <Badge>Délai de retrait : {stats.hold_days} j</Badge>}
                                    </div>
                                    {store.city_location && <p className="text-[#5F5E58]">{store.city_location}</p>}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Button size="sm" href={`/${store.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Voir</Button>
                                        {store.is_published
                                            ? <Button size="sm" onClick={() => setModeration({ type: 'store', id: store.id, name: store.name, info: `biolinko.link/${store.slug}` })}><EyeOff className="h-4 w-4" /> Suspendre</Button>
                                            : <Button size="sm" href={route('admin.users.toggleStore', vendor.id)} method="post" as="button" preserveScroll><Eye className="h-4 w-4" /> Republier</Button>}
                                    </div>
                                </div>
                            ) : <p className="mt-3 text-[14px] text-[#8B8A83]">Pas encore de boutique.</p>}
                        </Card>
                    </div>
                </div>
            </div>

            <ModerationModal isOpen={!!moderation} onClose={() => setModeration(null)} onConfirm={confirm} type={moderation?.type || 'user'} isLoading={busy}
                itemName={moderation?.name || ''} targetInfo={moderation?.info} />
        </AuthenticatedLayout>
    );
}
