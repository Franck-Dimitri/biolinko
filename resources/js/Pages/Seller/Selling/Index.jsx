import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Tag, Trash2 } from 'lucide-react';
import { Badge, Button, Card, CardHeader, Empty, Field, PageHeader, PlanLock, Tabs, fcfa, fieldClass, shortDate } from '@/Components/Dashboard/UI';

const SUGGESTED = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Kribi'];
const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

function DeliveryTab({ delivery }) {
    const { data, setData, post, processing, errors } = useForm({
        zones: delivery.zones?.length ? delivery.zones : [],
        other_fee: delivery.other_fee ?? '',
        free_from: delivery.free_from ?? '',
    });
    const [deliverOthers, setDeliverOthers] = useState(delivery.other_fee !== null && delivery.other_fee !== undefined);

    const setZone = (i, key, value) => setData('zones', data.zones.map((z, j) => (j === i ? { ...z, [key]: value } : z)));
    const addZone = (name = '') => setData('zones', [...data.zones, { name, fee: '' }]);
    const removeZone = (i) => setData('zones', data.zones.filter((_, j) => j !== i));
    const unused = SUGGESTED.filter((c) => !data.zones.some((z) => z.name.toLowerCase() === c.toLowerCase()));

    const save = (e) => {
        e.preventDefault();
        post(route('seller.delivery.update'), {
            preserveScroll: true,
            transform: (d) => ({ ...d, other_fee: deliverOthers ? num(d.other_fee) ?? 0 : null, free_from: num(d.free_from) }),
        });
    };

    const configured = data.zones.length > 0 || deliverOthers;

    return (
        <form onSubmit={save} className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
            <Card>
                <CardHeader title="Zones de livraison" sub="Le client choisit sa ville au paiement : le prix de livraison s’ajoute automatiquement à sa commande." />
                <div className="mt-5 space-y-3">
                    {data.zones.map((z, i) => (
                        <div key={i} className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                                <input aria-label="Ville ou zone" className={fieldClass} placeholder="Ex. Douala" value={z.name} onChange={(e) => setZone(i, 'name', e.target.value)} />
                                {errors[`zones.${i}.name`] && <p className="mt-1 text-[13px] text-[#B91C1C]">{errors[`zones.${i}.name`]}</p>}
                            </div>
                            <div className="w-36 shrink-0">
                                <div className="relative">
                                    <input aria-label={`Prix de livraison ${z.name}`} type="number" min="0" inputMode="numeric" className={`${fieldClass} pr-14`} placeholder="1000" value={z.fee} onChange={(e) => setZone(i, 'fee', e.target.value)} />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8B8A83]">FCFA</span>
                                </div>
                                {errors[`zones.${i}.fee`] && <p className="mt-1 text-[13px] text-[#B91C1C]">{errors[`zones.${i}.fee`]}</p>}
                            </div>
                            <button type="button" onClick={() => removeZone(i)} aria-label={`Retirer ${z.name || 'la zone'}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#8B8A83] hover:bg-red-50 hover:text-[#B91C1C]"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                    {!data.zones.length && <p className="rounded-2xl bg-[#F6F5F1] p-4 text-[14px] text-[#5F5E58]">Aucune zone pour l’instant. Ajoutez les villes où vous livrez, avec leur prix (0 si la livraison est gratuite).</p>}
                    <div className="flex flex-wrap gap-2 pt-1">
                        {unused.map((c) => <Button key={c} size="sm" onClick={() => addZone(c)}><Plus className="h-3.5 w-3.5" /> {c}</Button>)}
                        <Button size="sm" variant="ghost" onClick={() => addZone()}><Plus className="h-3.5 w-3.5" /> Autre zone</Button>
                    </div>
                </div>

                <div className="mt-6 space-y-4 border-t border-black/[0.06] pt-5">
                    <label className="flex items-start gap-3 text-[14px] text-[#141412]">
                        <input type="checkbox" checked={deliverOthers} onChange={(e) => setDeliverOthers(e.target.checked)} className="mt-0.5 rounded border-black/20 text-[#141412] focus:ring-0" />
                        <span>Je livre aussi les autres villes<span className="block text-[13px] text-[#8B8A83]">Sinon, le client ne peut choisir qu’une de vos zones.</span></span>
                    </label>
                    {deliverOthers && (
                        <Field label="Prix pour les autres villes" error={errors.other_fee} hint="Par exemple une expédition par agence de voyage.">
                            <input type="number" min="0" inputMode="numeric" className={fieldClass} placeholder="2500" value={data.other_fee} onChange={(e) => setData('other_fee', e.target.value)} />
                        </Field>
                    )}
                    <Field label="Livraison offerte à partir de (facultatif)" error={errors.free_from} hint="Montant des articles après remise. Laissez vide pour ne jamais l’offrir.">
                        <input type="number" min="1" inputMode="numeric" className={fieldClass} placeholder="25000" value={data.free_from} onChange={(e) => setData('free_from', e.target.value)} />
                    </Field>
                </div>

                <div className="mt-6 flex justify-end"><Button type="submit" variant="dark" disabled={processing}>{processing ? 'Enregistrement…' : 'Enregistrer'}</Button></div>
            </Card>

            <Card className="bg-[#F6F5F1]">
                <CardHeader title="Bon à savoir" />
                <ul className="mt-3 space-y-2.5 text-[14px] text-[#5F5E58]">
                    <li>La livraison vous revient entièrement : <strong className="font-medium text-[#141412]">Biolinko ne prend aucune commission dessus</strong>.</li>
                    <li>Le client paie produit et livraison en une seule fois : plus besoin de négocier le transport sur WhatsApp.</li>
                    <li>{configured ? 'Vos tarifs s’appliquent à toutes les nouvelles commandes.' : 'Sans zone, la livraison n’est pas facturée au client (comme aujourd’hui).'}</li>
                </ul>
            </Card>
        </form>
    );
}

function DepositTab({ depositPercent }) {
    const [enabled, setEnabled] = useState(!!depositPercent);
    const { data, setData, post, processing, errors } = useForm({ deposit_percent: depositPercent || 30 });
    const pct = Number(data.deposit_percent) || 0;
    const save = (e) => {
        e.preventDefault();
        post(route('seller.deposit.update'), { preserveScroll: true, transform: (d) => ({ deposit_percent: enabled ? Number(d.deposit_percent) : null }) });
    };
    const example = 20000;
    const deposit = Math.min(example, Math.max(Math.ceil(example * pct / 100), 1000));
    return (
        <form onSubmit={save} className="grid items-start gap-4 lg:grid-cols-[1fr_320px]">
            <Card>
                <CardHeader title="Acompte, solde à la livraison" sub="Le client paie une partie en Mobile Money à la commande, et le reste en espèces au livreur." />
                <label className="mt-5 flex items-start gap-3 text-[14px] text-[#141412]">
                    <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="mt-0.5 rounded border-black/20 text-[#141412] focus:ring-0" />
                    <span>Proposer le paiement avec acompte<span className="block text-[13px] text-[#8B8A83]">Le client garde aussi le choix de tout payer en ligne.</span></span>
                </label>
                {enabled && (
                    <div className="mt-5 space-y-4">
                        <Field label="Pourcentage d’acompte" error={errors.deposit_percent} hint="Entre 20 et 90 %. Minimum 1 000 FCFA payés en ligne.">
                            <div className="relative max-w-[200px]">
                                <input type="number" min="20" max="90" inputMode="numeric" className={`${fieldClass} pr-10`} value={data.deposit_percent} onChange={(e) => setData('deposit_percent', e.target.value)} />
                                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#5F5E58]">%</span>
                            </div>
                        </Field>
                        <div className="rounded-2xl bg-[#F6F5F1] p-4 text-[14px] text-[#5F5E58]">
                            Exemple pour une commande de {fcfa(example)} : le client paie <strong className="font-medium text-[#141412]">{fcfa(deposit)}</strong> en ligne, puis <strong className="font-medium text-[#141412]">{fcfa(example - deposit)}</strong> au livreur.
                        </div>
                    </div>
                )}
                <div className="mt-6 flex justify-end"><Button type="submit" variant="dark" disabled={processing}>{processing ? 'Enregistrement…' : 'Enregistrer'}</Button></div>
            </Card>
            <Card className="bg-[#F6F5F1]">
                <CardHeader title="Bon à savoir" />
                <ul className="mt-3 space-y-2.5 text-[14px] text-[#5F5E58]">
                    <li>L’acompte rassure le client qui veut voir l’article avant de tout payer.</li>
                    <li>Il vous protège des faux clients : <strong className="font-medium text-[#141412]">plus de livraison à perte</strong>.</li>
                    <li>La commission Biolinko porte sur toute la vente et se prélève sur l’acompte. Le solde est à vous, en espèces.</li>
                    <li>Passez la commande en « Livrée » quand le livreur a encaissé le solde.</li>
                </ul>
            </Card>
        </form>
    );
}

function PromoForm({ onDone }) {
    const { data, setData, post, processing, errors, reset } = useForm({ code: '', type: 'percent', value: '', min_subtotal: '', max_uses: '', ends_at: '' });
    const submit = (e) => {
        e.preventDefault();
        post(route('seller.promos.store'), {
            preserveScroll: true,
            transform: (d) => ({ ...d, min_subtotal: num(d.min_subtotal), max_uses: num(d.max_uses), ends_at: d.ends_at || null }),
            onSuccess: () => { reset(); onDone(); },
        });
    };
    return (
        <Card>
            <CardHeader title="Nouveau code promo" sub="Partagez-le en story, en statut WhatsApp ou à vos clients fidèles." />
            <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <span className="mb-1.5 block text-[14px] font-medium text-[#141412]">Type de remise</span>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type de remise">
                        {[['percent', 'Pourcentage', 'Ex. −10 % sur le panier'], ['fixed', 'Montant fixe', 'Ex. −2 000 FCFA']].map(([key, label, ex]) => {
                            const on = data.type === key;
                            return (
                                <button key={key} type="button" role="radio" aria-checked={on} onClick={() => setData('type', key)}
                                    className={`rounded-2xl border-2 p-3 text-left transition-colors ${on ? 'border-[#141412] bg-[#F6F5F1]' : 'border-black/10 hover:border-black/25'}`}>
                                    <span className="block text-[15px] font-medium text-[#141412]">{label}</span>
                                    <span className="block text-[13px] text-[#8B8A83]">{ex}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
                <Field label="Code" error={errors.code} hint="Lettres et chiffres, ex. NOEL10">
                    <input className={`${fieldClass} font-mono uppercase`} maxLength={30} placeholder="NOEL10" value={data.code} onChange={(e) => setData('code', e.target.value.toUpperCase().replace(/\s/g, ''))} />
                </Field>
                <Field label={data.type === 'percent' ? 'Pourcentage de remise' : 'Montant de la remise'} error={errors.value} hint={data.type === 'percent' ? 'Entre 1 et 90 %.' : 'Retiré du prix des articles.'}>
                    <div className="relative">
                        <input type="number" min="1" max={data.type === 'percent' ? 90 : undefined} inputMode="numeric" aria-label="Valeur de la remise"
                            className={`${fieldClass} pr-16`} placeholder={data.type === 'percent' ? '10' : '2000'} value={data.value} onChange={(e) => setData('value', e.target.value)} />
                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#5F5E58]">{data.type === 'percent' ? '%' : 'FCFA'}</span>
                    </div>
                </Field>
                <Field label="Achat minimum (facultatif)" error={errors.min_subtotal}>
                    <input type="number" min="0" inputMode="numeric" className={fieldClass} placeholder="10000" value={data.min_subtotal} onChange={(e) => setData('min_subtotal', e.target.value)} />
                </Field>
                <Field label="Nombre d’utilisations max (facultatif)" error={errors.max_uses}>
                    <input type="number" min="1" inputMode="numeric" className={fieldClass} placeholder="50" value={data.max_uses} onChange={(e) => setData('max_uses', e.target.value)} />
                </Field>
                <Field label="Valable jusqu’au (facultatif)" error={errors.ends_at}>
                    <input type="date" className={fieldClass} value={data.ends_at} onChange={(e) => setData('ends_at', e.target.value)} />
                </Field>
                <div className="flex items-end justify-end gap-2">
                    <Button onClick={onDone}>Annuler</Button>
                    <Button type="submit" variant="dark" disabled={processing}>{processing ? 'Création…' : 'Créer le code'}</Button>
                </div>
            </form>
        </Card>
    );
}

function PromosTab({ promos, promoLimit, errors }) {
    const [creating, setCreating] = useState(false);
    const active = promos.filter((p) => p.is_active && !p.expired).length;
    const atLimit = promoLimit !== null && active >= promoLimit;

    return (
        <div className="space-y-4">
            {errors.code && !creating && <p role="alert" className="rounded-2xl bg-red-50 p-3 text-[14px] text-[#B91C1C]">{errors.code}</p>}
            {atLimit && <PlanLock plan={promoLimit < 5 ? 'Pro' : 'Growth'} text={`Votre plan permet ${promoLimit} code${promoLimit > 1 ? 's' : ''} actif${promoLimit > 1 ? 's' : ''} à la fois. Désactivez-en un ou passez au plan supérieur.`} />}
            {creating ? <PromoForm onDone={() => setCreating(false)} /> : (
                <div className="flex justify-end"><Button variant="dark" disabled={atLimit} onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Nouveau code</Button></div>
            )}

            {promos.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                    {promos.map((p) => (
                        <Card key={p.id} className="!p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-mono text-[17px] font-semibold text-[#141412]">{p.code}</p>
                                    <p className="mt-0.5 text-[14px] text-[#5F5E58]">−{p.label}{p.min_subtotal ? ` dès ${fcfa(p.min_subtotal)}` : ''}</p>
                                </div>
                                {p.expired ? <Badge tone="danger">Expiré</Badge> : p.is_active ? <Badge tone="success">Actif</Badge> : <Badge>Désactivé</Badge>}
                            </div>
                            <dl className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#F6F5F1] p-3 text-[13px]">
                                <div><dt className="text-[#8B8A83]">Ventes</dt><dd className="font-medium tabular-nums text-[#141412]">{p.orders}{p.max_uses ? ` / ${p.max_uses}` : ''}</dd></div>
                                <div><dt className="text-[#8B8A83]">Encaissé</dt><dd className="font-medium tabular-nums text-[#141412]">{fcfa(p.revenue)}</dd></div>
                                <div><dt className="text-[#8B8A83]">Remises</dt><dd className="font-medium tabular-nums text-[#141412]">{fcfa(p.discount)}</dd></div>
                            </dl>
                            <div className="mt-4 flex items-center justify-between gap-2">
                                <span className="text-[13px] text-[#8B8A83]">{p.ends_at ? `Jusqu’au ${shortDate(p.ends_at)}` : 'Sans date de fin'}</span>
                                <div className="flex gap-1.5">
                                    {!p.expired && <Button size="sm" onClick={() => router.patch(route('seller.promos.toggle', p.id), {}, { preserveScroll: true })}>{p.is_active ? 'Désactiver' : 'Activer'}</Button>}
                                    <Button size="sm" variant="danger" aria-label={`Supprimer ${p.code}`} onClick={() => confirm(`Supprimer le code ${p.code} ?`) && router.delete(route('seller.promos.destroy', p.id), { preserveScroll: true })}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : !creating && <Empty Icon={Tag} title="Aucun code promo" text="Créez un code comme BIENVENUE10 pour déclencher la première commande, ou NOEL15 pour une période de fête." action={<Button variant="primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Créer mon premier code</Button>} />}
        </div>
    );
}

export default function Index({ delivery, depositPercent, promos, promoLimit, errors = {} }) {
    const [tab, setTab] = useState(() => (['promos', 'deposit'].includes(new URLSearchParams(window.location.search).get('tab')) ? new URLSearchParams(window.location.search).get('tab') : 'delivery'));
    return (
        <AuthenticatedLayout>
            <Head title="Livraison et codes promo" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Livraison et codes promo" sub="Fixez vos prix de livraison par ville et créez des codes de réduction pour vendre plus." />
                <Tabs id="selling" value={tab} onChange={setTab} tabs={[['delivery', 'Livraison'], ['deposit', 'Acompte'], ['promos', 'Codes promo', promos.length]]} />
                {tab === 'delivery' ? <DeliveryTab delivery={delivery} /> : tab === 'deposit' ? <DepositTab depositPercent={depositPercent} /> : <PromosTab promos={promos} promoLimit={promoLimit} errors={errors} />}
            </div>
        </AuthenticatedLayout>
    );
}
