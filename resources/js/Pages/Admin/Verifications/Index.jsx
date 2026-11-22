import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { BadgeCheck, Check, IdCard, X } from 'lucide-react';
import { Badge, Button, Card, Empty, Field, PageHeader, Pagination, SubPage, Tabs, dateTime, fieldClass } from '@/Components/Dashboard/UI';

const TONE = { pending: 'warning', approved: 'success', rejected: 'danger' };
const LABEL = { pending: 'À vérifier', approved: 'Validée', rejected: 'Refusée' };
const SUGGESTIONS = ['Photo floue ou illisible.', 'Le nom ne correspond pas à la pièce.', 'Le selfie ne montre pas la pièce.', 'Pièce expirée.'];

/** Contrôle d'une vérification : documents côte à côte, puis validation ou refus motivé. */
function Review({ item, onClose }) {
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);
    const files = [['front', 'Recto'], ...(item.has_back ? [['back', 'Verso']] : []), ['selfie', 'Selfie avec la pièce']];
    const act = (name, data = {}) => {
        setBusy(true);
        router.post(route(`admin.verifications.${name}`, item.id), data, { preserveScroll: true, onSuccess: onClose, onFinish: () => setBusy(false) });
    };
    const payoutMismatch = item.user?.payout_name && item.user.payout_name.trim().toLowerCase() !== item.full_name.trim().toLowerCase();

    return (
        <SubPage title={item.full_name} sub={`${item.id_type}${item.id_number ? ` · n° ${item.id_number}` : ''} · envoyée le ${dateTime(item.submitted_at)}`} onClose={onClose} width="max-w-5xl" backLabel="Retour aux vérifications">
            <div className="space-y-6">
                <div className="grid gap-3 text-[14px] sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#F6F5F1] p-3"><p className="text-[13px] text-[#8B8A83]">Compte</p><p className="text-[#141412] [overflow-wrap:anywhere]">{item.user?.name} · {item.user?.email}</p></div>
                    <div className="rounded-2xl bg-[#F6F5F1] p-3"><p className="text-[13px] text-[#8B8A83]">Boutique</p><p className="text-[#141412]">{item.user?.store?.name || '—'}</p></div>
                    <div className={`rounded-2xl p-3 ${payoutMismatch ? 'bg-[#FFFBEB]' : 'bg-[#F6F5F1]'}`}>
                        <p className="text-[13px] text-[#8B8A83]">Titulaire du numéro de retrait</p>
                        <p className={payoutMismatch ? 'text-[#B45309]' : 'text-[#141412]'}>{item.user?.payout_name ? `${item.user.payout_name} · +${item.user.payout_phone}` : 'Pas encore enregistré'}</p>
                    </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                    {files.map(([kind, label]) => (
                        <a key={kind} href={route('admin.verifications.file', [item.id, kind])} target="_blank" rel="noreferrer" className="group block">
                            <p className="mb-1.5 text-[13px] text-[#8B8A83]">{label}</p>
                            <img src={route('admin.verifications.file', [item.id, kind])} alt={label} className="aspect-[4/3] w-full rounded-2xl border border-black/[0.06] bg-[#F6F5F1] object-contain group-hover:border-black/20" />
                        </a>
                    ))}
                </div>
                {item.status === 'pending' && (
                    <div className="grid gap-4 border-t border-black/[0.06] pt-6 lg:grid-cols-2">
                        <div className="space-y-3">
                            <p className="text-[14px] text-[#5F5E58]">Le nom, la photo et le selfie correspondent, et la pièce est valide ?</p>
                            <Button variant="primary" onClick={() => act('approve')} disabled={busy}><Check className="h-4 w-4" /> Valider l’identité</Button>
                        </div>
                        <div className="space-y-3">
                            <Field label="Motif du refus" hint="Le vendeur le verra et pourra renvoyer ses documents.">
                                <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} className={`${fieldClass} h-auto py-3`} />
                            </Field>
                            <div className="flex flex-wrap gap-1.5">
                                {SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => setReason(s)} className="rounded-full border border-black/10 px-2.5 py-1 text-[12px] text-[#5F5E58] hover:border-black/30">+ {s}</button>)}
                            </div>
                            <Button variant="danger" onClick={() => act('reject', { reason })} disabled={busy || reason.trim().length < 5}><X className="h-4 w-4" /> Refuser</Button>
                        </div>
                    </div>
                )}
            </div>
        </SubPage>
    );
}

/** Pièces d'identité envoyées par les vendeurs avant leur premier retrait. */
export default function Index({ items, status, counts = {} }) {
    const [open, setOpen] = useState(null);
    const tabs = Object.keys(LABEL).map((k) => [k, LABEL[k], Number(counts[k] || 0)]);

    return (
        <AuthenticatedLayout>
            <Head title="Vérifications d’identité, Administration Biolinko" />
            {open && <Review item={open} onClose={() => setOpen(null)} />}
            <div className="space-y-6 pb-12" hidden={!!open}>
                <PageHeader title="Vérifications d’identité" sub="Un vendeur ne peut retirer son argent qu’une fois son identité validée." />
                <Tabs id="kyc" tabs={tabs} value={status} onChange={(v) => router.get(route('admin.verifications.index'), { status: v }, { preserveState: true })} />

                {items.data.length === 0 ? (
                    <Empty Icon={BadgeCheck} title={status === 'pending' ? 'Rien à vérifier' : 'Aucune vérification'} text={status === 'pending' ? 'Les nouvelles demandes apparaîtront ici.' : 'Aucune vérification dans cette catégorie.'} />
                ) : (
                    <Card padded={false}>
                        <ul className="divide-y divide-black/[0.06]">
                            {items.data.map((v) => (
                                <li key={v.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F6F5F1]"><IdCard className="h-5 w-5 text-[#141412]" /></span>
                                        <div className="min-w-0">
                                            <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-[#141412]">{v.full_name} <Badge tone={TONE[v.status]}>{LABEL[v.status]}</Badge></p>
                                            <p className="truncate text-[13px] text-[#8B8A83]">{v.user?.store?.name || v.user?.name} · {v.id_type} · {dateTime(v.submitted_at)}</p>
                                            {v.rejection_reason && <p className="text-[13px] text-[#B91C1C]">{v.rejection_reason}</p>}
                                        </div>
                                    </div>
                                    <Button size="sm" variant={v.status === 'pending' ? 'primary' : 'secondary'} onClick={() => setOpen(v)}>{v.status === 'pending' ? 'Vérifier' : 'Voir'}</Button>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}
                <Pagination page={items} label="vérifications" />
            </div>
        </AuthenticatedLayout>
    );
}
