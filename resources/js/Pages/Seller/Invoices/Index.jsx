import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Bell, Check, Download, Eye, FileText, Plus, Trash2, Wallet, X } from 'lucide-react';
import {
    Badge, Button, Card, SubPage, Empty, Field, PageHeader, SearchInput, Stat, Table, Tabs, fcfa, fieldClass, shortDate,
} from '@/Components/Dashboard/UI';

function invoiceStatus(o) {
    if (['cancelled', 'failed'].includes(o.status)) return ['Annulée', 'danger'];
    if (o.payment_status === 'paid' || ['paid', 'in_delivery', 'delivered'].includes(o.status)) return ['Payée', 'success'];
    return ['À régler', 'warning'];
}

const emptyLine = () => ({ description: '', quantity: 1, unit_price: '' });

function NewInvoiceDialog({ open, onClose }) {
    const { errors } = usePage().props;
    const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', customer_city: '', delivery_address: '', due_at: '', notes: '', mark_paid: false });
    const [items, setItems] = useState([emptyLine()]);
    const [busy, setBusy] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const setItem = (i, k, v) => setItems((list) => list.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
    const total = items.reduce((a, it) => a + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0), 0);

    const submit = (e) => {
        e.preventDefault();
        setBusy(true);
        router.post(route('seller.invoices.storeManual'), { ...form, items }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Facture créée');
                setItems([emptyLine()]);
                setForm({ customer_name: '', customer_phone: '', customer_email: '', customer_city: '', delivery_address: '', due_at: '', notes: '', mark_paid: false });
                onClose();
            },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <SubPage open={open} onClose={onClose} title="Nouvelle facture" sub="Pour une vente faite en dehors de votre boutique en ligne : magasin, WhatsApp, commande spéciale." width="max-w-3xl">
            <form onSubmit={submit} className="space-y-6">
                <section>
                    <h4 className="mb-3 text-[14px] text-[#8B8A83]">Client</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Nom" error={errors?.customer_name}><input required value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} className={fieldClass} /></Field>
                        <Field label="Téléphone" error={errors?.customer_phone}><input required type="tel" value={form.customer_phone} onChange={(e) => set('customer_phone', e.target.value)} placeholder="6XX XX XX XX" className={fieldClass} /></Field>
                        <Field label="E-mail (facultatif)" hint="La facture lui sera envoyée." error={errors?.customer_email}><input type="email" value={form.customer_email} onChange={(e) => set('customer_email', e.target.value)} className={fieldClass} /></Field>
                        <Field label="Ville"><input value={form.customer_city} onChange={(e) => set('customer_city', e.target.value)} placeholder="Douala" className={fieldClass} /></Field>
                    </div>
                </section>

                <section>
                    <h4 className="mb-3 text-[14px] text-[#8B8A83]">Lignes de la facture</h4>
                    <div className="overflow-hidden rounded-2xl border border-black/[0.08]">
                        <div className="hidden grid-cols-[1fr_80px_140px_120px_40px] gap-2 bg-[#F6F5F1] px-3 py-2 text-[12px] text-[#8B8A83] sm:grid">
                            <span>Désignation</span><span className="text-right">Qté</span><span className="text-right">Prix unitaire</span><span className="text-right">Montant</span><span />
                        </div>
                        {items.map((it, i) => (
                            <div key={i} className="grid grid-cols-2 gap-2 border-t border-black/[0.06] p-3 first:border-0 sm:grid-cols-[1fr_80px_140px_120px_40px] sm:items-center">
                                <input required aria-label="Désignation" value={it.description} onChange={(e) => setItem(i, 'description', e.target.value)} placeholder="Ex. Robe sur mesure" className={`${fieldClass} col-span-2 sm:col-span-1`} />
                                <input required aria-label="Quantité" type="number" min="1" value={it.quantity} onChange={(e) => setItem(i, 'quantity', e.target.value)} className={`${fieldClass} text-right`} />
                                <input required aria-label="Prix unitaire" type="number" min="0" value={it.unit_price} onChange={(e) => setItem(i, 'unit_price', e.target.value)} placeholder="0" className={`${fieldClass} text-right`} />
                                <span className="text-right text-[14px] tabular-nums text-[#141412]">{fcfa((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}</span>
                                <button type="button" aria-label="Supprimer la ligne" disabled={items.length === 1} onClick={() => setItems((l) => l.filter((_, j) => j !== i))}
                                    className="flex h-9 w-9 items-center justify-center justify-self-end rounded-full text-[#8B8A83] hover:bg-red-50 hover:text-[#B91C1C] disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <Button size="sm" onClick={() => setItems((l) => [...l, emptyLine()])}><Plus className="h-4 w-4" /> Ajouter une ligne</Button>
                        <p className="text-[15px] text-[#5F5E58]">Total <span className="ml-2 text-[20px] font-medium tabular-nums text-[#141412]">{fcfa(total)}</span></p>
                    </div>
                    {errors?.items && <p className="mt-2 text-[13px] text-[#B91C1C]">{errors.items}</p>}
                </section>

                <section className="grid gap-3 sm:grid-cols-2">
                    <Field label="Échéance de paiement (facultatif)"><input type="date" value={form.due_at} onChange={(e) => set('due_at', e.target.value)} className={fieldClass} /></Field>
                    <Field label="Note sur la facture (facultatif)"><input value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Ex. Merci pour votre confiance" className={fieldClass} /></Field>
                </section>

                <label className="flex items-center gap-2 rounded-2xl bg-[#F6F5F1] p-4 text-[14px] text-[#141412]">
                    <input type="checkbox" checked={form.mark_paid} onChange={(e) => set('mark_paid', e.target.checked)} className="h-4 w-4 rounded border-black/20 text-[#141412] focus:ring-0" />
                    Le client a déjà payé (espèces, virement…)
                </label>

                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Annuler</Button>
                    <Button variant="primary" type="submit" disabled={busy || total <= 0}><FileText className="h-4 w-4" /> Créer la facture</Button>
                </div>
            </form>
        </SubPage>
    );
}

export default function Index({ invoices, stats, filters }) {
    const list = invoices?.data || [];
    const [creating, setCreating] = useState(false);
    const [search, setSearch] = useState(filters?.search || '');
    const tab = filters?.status || 'all';
    const source = filters?.source || 'all';
    const first = useRef(true);
    const { errors } = usePage().props;

    const go = (params) => router.get(route('seller.invoices.index'), { status: tab, source, search, ...params }, { preserveState: true, replace: true, preserveScroll: true });

    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = setTimeout(() => go({ search }), 350);
        return () => clearTimeout(t);
    }, [search]);
    useEffect(() => { if (errors?.status) toast.error(errors.status); }, [errors]);

    const setStatus = (o, status) => router.patch(route('seller.invoices.updateStatus', o.id), { status }, { preserveScroll: true });
    const remind = (o) => router.post(route('seller.invoices.sendReminder', o.id), {}, { preserveScroll: true });

    return (
        <AuthenticatedLayout>
            <Head title="Factures, Biolinko" />
            <NewInvoiceDialog open={creating} onClose={() => setCreating(false)} />
            <div className="space-y-6 pb-12" hidden={creating}>
                <PageHeader title="Factures" sub="Toutes vos factures : ventes en ligne payées et factures émises à la main."
                    actions={<Button variant="primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Nouvelle facture</Button>} />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Encaissé" value={fcfa(stats?.total_amount)} hint={`${stats?.paid_count ?? 0} facture${(stats?.paid_count ?? 0) > 1 ? 's' : ''} payée${(stats?.paid_count ?? 0) > 1 ? 's' : ''}`} Icon={Wallet} delay={0.03} />
                    <Stat label="À encaisser" value={fcfa(stats?.pending_amount)} hint={`${stats?.pending_count ?? 0} facture${(stats?.pending_count ?? 0) > 1 ? 's' : ''} en attente`} Icon={Bell} accent={(stats?.pending_count ?? 0) > 0} delay={0.06} />
                    <Stat label="Ventes en ligne" value={fcfa(stats?.online_paid_amount)} hint={`${stats?.online_paid_count ?? 0} facture${(stats?.online_paid_count ?? 0) > 1 ? 's' : ''} automatique${(stats?.online_paid_count ?? 0) > 1 ? 's' : ''}`} Icon={FileText} delay={0.09} />
                    <Stat label="Factures manuelles" value={fcfa(stats?.manual_paid_amount)} hint={`${stats?.manual_paid_count ?? 0} payée${(stats?.manual_paid_count ?? 0) > 1 ? 's' : ''}`} Icon={FileText} delay={0.12} />
                </div>

                <Card padded={false} delay={0.1}>
                    <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Tabs id="inv-status" value={tab} onChange={(status) => go({ status })} tabs={[['all', 'Toutes'], ['paid', 'Payées'], ['pending', 'À régler'], ['cancelled', 'Annulées']]} />
                            <Tabs id="inv-source" value={source} onChange={(s) => go({ source: s })} tabs={[['all', 'Toutes sources'], ['online', 'En ligne'], ['manual', 'Manuelles']]} />
                        </div>
                        <SearchInput value={search} onChange={setSearch} placeholder="N°, client ou téléphone" className="xl:w-72" />
                    </div>

                    {list.length ? (
                        <Table head={[['Facture'], ['Client'], ['Émise le'], ['Montant', 'text-right'], ['Statut'], ['', 'text-right']]}>
                            {list.map((o) => {
                                const [label, tone] = invoiceStatus(o);
                                const pendingManual = o.is_manual && o.status === 'pending';
                                return (
                                    <tr key={o.id} className="hover:bg-[#FAFAF8]">
                                        <td className="px-4 py-3.5">
                                            <span className="block font-medium text-[#141412]">{o.invoice_number || o.tracking_code}</span>
                                            <span className="text-[13px] text-[#8B8A83]">{o.is_manual ? 'Manuelle' : 'Vente en ligne'}</span>
                                        </td>
                                        <td className="px-4 py-3.5"><span className="block text-[#141412]">{o.customer_name}</span><span className="text-[13px] text-[#8B8A83]">{o.customer_phone}</span></td>
                                        <td className="px-4 py-3.5 text-[#5F5E58]">
                                            {shortDate(o.invoice_issued_at || o.paid_at || o.created_at)}
                                            {pendingManual && o.invoice_due_at && <span className="block text-[13px] text-[#8B8A83]">Échéance {shortDate(o.invoice_due_at)}</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-right tabular-nums text-[#141412]">{fcfa(o.total_client)}</td>
                                        <td className="px-4 py-3.5"><Badge tone={tone}>{label}</Badge></td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex justify-end gap-1">
                                                {pendingManual && (
                                                    <>
                                                        <Button size="sm" variant="primary" onClick={() => setStatus(o, 'paid')}><Check className="h-4 w-4" /> Payée</Button>
                                                        <Button size="sm" variant="ghost" onClick={() => remind(o)} title="Relancer le client"><Bell className="h-4 w-4" /></Button>
                                                        <Button size="sm" variant="ghost" onClick={() => setStatus(o, 'cancelled')} title="Annuler la facture"><X className="h-4 w-4" /></Button>
                                                    </>
                                                )}
                                                <Button size="sm" variant="ghost" href={route('seller.invoices.preview', o.id)} target="_blank" title="Aperçu"><Eye className="h-4 w-4" /></Button>
                                                <Button size="sm" variant="ghost" href={route('seller.invoices.download', o.id)} target="_blank" title="Télécharger le PDF"><Download className="h-4 w-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </Table>
                    ) : (
                        <div className="p-4">
                            <Empty Icon={FileText} title="Aucune facture" text="Les ventes en ligne payées génèrent leur facture automatiquement. Vous pouvez aussi en créer une à la main."
                                action={<Button variant="primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Nouvelle facture</Button>} />
                        </div>
                    )}

                    {invoices?.links?.length > 3 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] px-4 py-3 text-[14px]">
                            <span className="text-[#8B8A83]">{invoices.from}–{invoices.to} sur {invoices.total}</span>
                            <div className="flex gap-1">
                                {invoices.links.map((l, i) => (
                                    <Link key={i} href={l.url || '#'} preserveScroll preserveState
                                        className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 ${l.active ? 'bg-[#141412] text-white' : l.url ? 'text-[#141412] hover:bg-black/5' : 'pointer-events-none text-[#8B8A83]'}`}
                                        dangerouslySetInnerHTML={{ __html: l.label.replace(/&laquo;.*|pagination\.previous/, '‹').replace(/.*&raquo;|pagination\.next/, '›') }} />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

        </AuthenticatedLayout>
    );
}
