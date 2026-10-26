import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Megaphone, Repeat, Send, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { WhatsappIcon } from '@/Components/BrandIcons';
import {
    Badge, Button, Card, CardHeader, SubPage, Empty, Field, PageHeader, PlanLock, SearchInput, Stat, Table, Tabs,
    fcfa, fieldClass, shortDate,
} from '@/Components/Dashboard/UI';

const VARIABLES = [['{prenom}', 'Prénom'], ['{ville}', 'Ville'], ['{nom_boutique}', 'Boutique'], ['{lien_produit}', 'Lien']];

const waNumber = (raw) => {
    let n = (raw || '').replace(/\D/g, '');
    if (n.length === 9) n = `237${n}`;
    return n;
};

function CampaignDialog({ open, onClose, store, recipients, products, smartLinks, quota }) {
    const { errors } = usePage().props;
    const [title, setTitle] = useState('Nouveautés en boutique');
    const [message, setMessage] = useState('Bonjour {prenom}, découvrez nos nouveautés chez {nom_boutique} : {lien_produit}');
    const [attachment, setAttachment] = useState('');
    const [sending, setSending] = useState(false);

    const tooMany = recipients.length > quota.max_recipients_per_campaign;
    const noCampaignLeft = quota.remaining_campaigns <= 0;
    const sample = recipients[0];

    const preview = useMemo(() => {
        const link = attachment.startsWith('p:')
            ? `${window.location.origin}/${store.slug}/p/${products.find((p) => `p:${p.id}` === attachment)?.slug || ''}`
            : attachment.startsWith('s:')
                ? `${window.location.origin}/pay/${smartLinks.find((s) => `s:${s.id}` === attachment)?.code || ''}`
                : `${window.location.origin}/${store.slug}`;
        return message
            .replaceAll('{prenom}', (sample?.name || 'Awa').split(' ')[0])
            .replaceAll('{ville}', sample?.city || 'Douala')
            .replaceAll('{nom_boutique}', store.name)
            .replaceAll('{lien_produit}', link);
    }, [message, attachment, sample]);

    const send = () => {
        setSending(true);
        router.post(route('customers.campaign.store'), {
            title,
            message_template: message,
            recipients: recipients.map((c) => ({ name: c.name, phone: c.whatsapp || c.phone, city: c.city })),
            attached_products: attachment.startsWith('p:') ? [attachment.slice(2)] : [],
            smart_link_id: attachment.startsWith('s:') ? attachment.slice(2) : null,
        }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Campagne envoyée'); onClose(); },
            onFinish: () => setSending(false),
        });
    };

    return (
        <SubPage open={open} onClose={onClose} title="Nouvelle campagne WhatsApp" sub={`${recipients.length} destinataire${recipients.length > 1 ? 's' : ''} sélectionné${recipients.length > 1 ? 's' : ''}`} width="max-w-2xl">
            <div className="grid gap-6 md:grid-cols-[1fr_240px]">
                <div className="space-y-4">
                    <Field label="Nom de la campagne" error={errors?.title}>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
                    </Field>
                    <Field label="Message" error={errors?.message_template}>
                        <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className={`${fieldClass} h-auto py-3`} />
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {VARIABLES.map(([v, label]) => (
                                <button key={v} type="button" onClick={() => setMessage((m) => `${m} ${v}`)} className="rounded-full border border-black/10 px-2.5 py-1 text-[12px] text-[#5F5E58] hover:border-black/30">+ {label}</button>
                            ))}
                        </div>
                    </Field>
                    <Field label="Lien à joindre" error={errors?.smart_link || errors?.products}>
                        <select value={attachment} onChange={(e) => setAttachment(e.target.value)} className={fieldClass}>
                            <option value="">Ma boutique</option>
                            <optgroup label="Produits">
                                {products.map((p) => <option key={p.id} value={`p:${p.id}`}>{p.title}</option>)}
                            </optgroup>
                            {quota.allow_smartlinks && smartLinks.length > 0 && (
                                <optgroup label="Liens de paiement">
                                    {smartLinks.map((s) => <option key={s.id} value={`s:${s.id}`}>{s.title}</option>)}
                                </optgroup>
                            )}
                        </select>
                    </Field>
                </div>

                <div>
                    <span className="mb-1.5 block text-[14px] font-medium text-[#141412]">Aperçu</span>
                    <div className="rounded-2xl bg-[#E7E2D8] p-3">
                        <div className="ml-4 whitespace-pre-line rounded-2xl rounded-tr-sm bg-[#DCF8C6] p-3 text-[13px] leading-relaxed text-[#141412] shadow-sm">{preview}</div>
                    </div>
                    <p className="mt-2 text-[12px] text-[#8B8A83]">Exemple pour {sample?.name || 'un client'}.</p>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                {errors?.campaign && <p className="text-[14px] text-[#B91C1C]">{errors.campaign}</p>}
                {(tooMany || errors?.recipients) && <PlanLock plan="Growth" text={errors?.recipients || `Votre plan permet ${quota.max_recipients_per_campaign} destinataires par campagne. Réduisez la sélection ou passez à un plan supérieur.`} />}
                {noCampaignLeft && <PlanLock plan="Pro" text={`Vous avez utilisé vos ${quota.max_campaigns_per_month} campagne(s) du mois.`} />}
                <div className="flex justify-end gap-2">
                    <Button onClick={onClose}>Annuler</Button>
                    <Button variant="primary" disabled={sending || tooMany || noCampaignLeft || !recipients.length} onClick={send}><Send className="h-4 w-4" /> Envoyer</Button>
                </div>
            </div>
        </SubPage>
    );
}

export default function Index({ store, customers = [], top5Customers = [], abandonedOrders = [], products = [], smartLinks = [], metrics, whatsappQuota, campaignsHistory = [] }) {
    const [tab, setTab] = useState('clients');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState([]);
    const [campaignOpen, setCampaignOpen] = useState(false);
    const quota = whatsappQuota || { max_campaigns_per_month: 1, max_recipients_per_campaign: 10, remaining_campaigns: 0, used_campaigns_this_month: 0, allow_smartlinks: false };

    const filtered = customers.filter((c) => {
        const q = search.toLowerCase();
        return !q || c.name?.toLowerCase().includes(q) || (c.phone || '').includes(q) || c.city?.toLowerCase().includes(q);
    });
    const allSelected = filtered.length > 0 && filtered.every((c) => selected.includes(c.id));
    const toggleAll = () => setSelected(allSelected ? [] : filtered.map((c) => c.id));
    const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    const recipients = customers.filter((c) => selected.includes(c.id));
    const openCampaign = () => {
        if (!selected.length) setSelected(customers.slice(0, quota.max_recipients_per_campaign).map((c) => c.id));
        setCampaignOpen(true);
    };

    const relance = (o) => {
        const items = (o.items || []).map((i) => i.product_title).join(', ');
        const text = `Bonjour ${o.customer_name}, votre commande ${o.tracking_code} (${items}) chez ${store.name} n’est pas encore payée. Voulez-vous de l’aide pour la finaliser ?`;
        return `https://wa.me/${waNumber(o.customer_phone)}?text=${encodeURIComponent(text)}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Clients, Biolinko" />
            <CampaignDialog open={campaignOpen} onClose={() => setCampaignOpen(false)} store={store} recipients={recipients}
                products={products} smartLinks={smartLinks} quota={quota} />
            <div className="space-y-6 pb-12" hidden={campaignOpen}>
                <PageHeader title="Clients" sub="Votre fichier client se construit à chaque commande."
                    actions={<Button variant="primary" onClick={openCampaign} disabled={!customers.length}><Megaphone className="h-4 w-4" /> Nouvelle campagne</Button>} />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Clients" value={metrics?.totalCustomers ?? 0} Icon={Users} delay={0.03} />
                    <Stat label="Clients fidèles" value={metrics?.repeatCustomersCount ?? 0} hint="2 commandes ou plus" Icon={Repeat} delay={0.06} />
                    <Stat label="Panier moyen" value={fcfa(metrics?.averageOrderValue)} Icon={ShoppingCart} delay={0.09} />
                    <Stat label="Ventes encaissées" value={fcfa(metrics?.completedSalesRevenue)} Icon={TrendingUp} delay={0.12} />
                </div>

                <Tabs id="customers" value={tab} onChange={setTab} tabs={[
                    ['clients', 'Clients', customers.length],
                    ['abandoned', 'Commandes non payées', abandonedOrders.length],
                    ['campaigns', 'Campagnes', campaignsHistory.length],
                ]} />

                {tab === 'clients' && (
                    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                        <Card padded={false}>
                            <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                                <SearchInput value={search} onChange={setSearch} placeholder="Nom, téléphone ou ville" className="sm:w-72" />
                                {selected.length > 0 && (
                                    <div className="flex items-center gap-2 text-[14px] text-[#5F5E58]">
                                        {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
                                        <Button size="sm" variant="primary" onClick={() => setCampaignOpen(true)}><Megaphone className="h-4 w-4" /> Contacter</Button>
                                    </div>
                                )}
                            </div>
                            {filtered.length ? (
                                <Table head={[['', 'w-10'], ['Client'], ['Ville'], ['Commandes', 'text-right'], ['Dépensé', 'text-right'], ['Dernière commande'], ['', 'w-12']]}>
                                    <tr className="bg-[#FAFAF8]">
                                        <td className="px-4 py-2"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Tout sélectionner" className="h-4 w-4 rounded border-black/20 text-[#141412] focus:ring-0" /></td>
                                        <td colSpan={6} className="px-4 py-2 text-[13px] text-[#8B8A83]">Tout sélectionner</td>
                                    </tr>
                                    {filtered.map((c) => (
                                        <tr key={c.id} className="hover:bg-[#FAFAF8]">
                                            <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} aria-label={`Sélectionner ${c.name}`} className="h-4 w-4 rounded border-black/20 text-[#141412] focus:ring-0" /></td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-3">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F1EC] text-[13px] font-medium text-[#141412]">{(c.name || '?').charAt(0).toUpperCase()}</span>
                                                    <span><span className="block text-[#141412]">{c.name}</span><span className="text-[13px] text-[#8B8A83]">{c.phone}</span></span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-[#5F5E58]">{c.city || '—'}</td>
                                            <td className="px-4 py-3 text-right tabular-nums text-[#141412]">
                                                {c.pivot?.total_orders_count ?? 0}
                                                {(c.pivot?.total_orders_count ?? 0) >= 2 && <Badge tone="brand" className="ml-2">Fidèle</Badge>}
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums text-[#141412]">{fcfa(c.pivot?.total_spent)}</td>
                                            <td className="px-4 py-3 text-[#5F5E58]">{shortDate(c.pivot?.last_order_at)}</td>
                                            <td className="px-4 py-3">
                                                <a href={`https://wa.me/${waNumber(c.whatsapp || c.phone)}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${c.name}`}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#16A34A] hover:bg-[#DCFCE7]"><WhatsappIcon className="h-4 w-4" /></a>
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            ) : (
                                <div className="p-4"><Empty Icon={Users} title={search ? 'Aucun client trouvé' : 'Pas encore de client'} text={search ? 'Essayez un autre nom ou numéro.' : 'Chaque acheteur est ajouté automatiquement à votre fichier.'} /></div>
                            )}
                        </Card>

                        <Card>
                            <CardHeader title="Meilleurs clients" sub="Par montant dépensé" />
                            {top5Customers.length ? (
                                <ol className="mt-4 space-y-3">
                                    {top5Customers.map((c, i) => (
                                        <li key={c.id} className="flex items-center gap-3">
                                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-medium ${i === 0 ? 'bg-[#FFCC00] text-[#141412]' : 'bg-[#F6F5F1] text-[#5F5E58]'}`}>{i + 1}</span>
                                            <span className="min-w-0 flex-1"><span className="block truncate text-[14px] text-[#141412]">{c.name}</span><span className="text-[12px] text-[#8B8A83]">{c.pivot?.total_orders_count} commande{c.pivot?.total_orders_count > 1 ? 's' : ''}</span></span>
                                            <span className="shrink-0 text-[13px] tabular-nums text-[#141412]">{fcfa(c.pivot?.total_spent)}</span>
                                        </li>
                                    ))}
                                </ol>
                            ) : <p className="mt-4 text-[14px] text-[#8B8A83]">Le classement apparaîtra après vos premières ventes.</p>}
                        </Card>
                    </div>
                )}

                {tab === 'abandoned' && (
                    <Card padded={false}>
                        <div className="border-b border-black/[0.06] p-5"><CardHeader title="Commandes non payées" sub="Le client a commandé mais n’a pas validé le paiement. Une relance suffit souvent." /></div>
                        {abandonedOrders.length ? (
                            <ul className="divide-y divide-black/[0.05]">
                                {abandonedOrders.map((o) => (
                                    <li key={o.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[15px] text-[#141412]">{o.customer_name} <span className="font-mono text-[13px] text-[#8B8A83]">· {o.tracking_code}</span></p>
                                            <p className="truncate text-[13px] text-[#8B8A83]">{(o.items || []).map((i) => i.product_title).join(', ')} · {shortDate(o.created_at)}</p>
                                        </div>
                                        <span className="shrink-0 tabular-nums text-[15px] text-[#141412]">{fcfa(o.total_client)}</span>
                                        <Button size="sm" href={relance(o)} target="_blank" rel="noreferrer"><WhatsappIcon className="h-4 w-4 text-[#16A34A]" /> Relancer</Button>
                                    </li>
                                ))}
                            </ul>
                        ) : <div className="p-4"><Empty Icon={ShoppingCart} title="Aucune commande en attente" text="Toutes vos commandes ont été payées ou annulées." /></div>}
                    </Card>
                )}

                {tab === 'campaigns' && (
                    <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
                        <Card>
                            <CardHeader title="Quota du mois" />
                            <p className="mt-4 text-[28px] font-medium tabular-nums text-[#141412]">{quota.used_campaigns_this_month}<span className="text-[16px] text-[#8B8A83]"> / {quota.max_campaigns_per_month}</span></p>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F2F1EC]">
                                <div className="h-full rounded-full bg-[#FFCC00]" style={{ width: `${Math.min(100, (quota.used_campaigns_this_month / Math.max(1, quota.max_campaigns_per_month)) * 100)}%` }} />
                            </div>
                            <ul className="mt-4 space-y-1.5 text-[14px] text-[#5F5E58]">
                                <li>{quota.max_recipients_per_campaign} destinataires max par campagne</li>
                                <li>{quota.allow_smartlinks ? 'Liens de paiement autorisés' : 'Liens de paiement : plan Pro'}</li>
                            </ul>
                            <Button variant="primary" className="mt-5 w-full" onClick={openCampaign} disabled={!customers.length}><Megaphone className="h-4 w-4" /> Nouvelle campagne</Button>
                        </Card>
                        <Card padded={false}>
                            <div className="border-b border-black/[0.06] p-5"><CardHeader title="Historique" /></div>
                            {campaignsHistory.length ? (
                                <ul className="divide-y divide-black/[0.05]">
                                    {campaignsHistory.map((c) => (
                                        <li key={c.id} className="flex items-center gap-4 px-5 py-4">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F5F1]"><Megaphone className="h-4 w-4" /></span>
                                            <span className="min-w-0 flex-1"><span className="block truncate text-[15px] text-[#141412]">{c.title}</span><span className="text-[13px] text-[#8B8A83]">{shortDate(c.created_at)} · {c.recipients_count} destinataire{c.recipients_count > 1 ? 's' : ''}</span></span>
                                            <Badge tone={c.status === 'completed' ? 'success' : 'neutral'}>{c.status === 'completed' ? 'Envoyée' : c.status}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : <div className="p-4"><Empty Icon={Megaphone} title="Aucune campagne" text="Prévenez vos clients de vos nouveautés et promotions en quelques clics." /></div>}
                        </Card>
                    </div>
                )}
            </div>

        </AuthenticatedLayout>
    );
}
