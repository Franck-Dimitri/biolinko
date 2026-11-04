import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { Badge, Button, Field, dateTime, fcfa, fieldClass } from '@/Components/Dashboard/UI';

const STATUS = { processing: ['En cours', 'warning'], completed: ['Envoyé', 'success'], failed: ['Échoué', 'danger'] };

/** Part remboursable en ligne (même règle que OrderRefunds::refundable). */
export const refundableOf = (o) => (o.payment_status === 'paid' && !o.is_manual
    ? Math.max(0, Number(o.price_vendor) - Number(o.balance_due || 0) - Number(o.refunded_amount || 0)) : 0);

/**
 * Remboursement d'une commande par virement Mobile Money vers le numéro qui a payé.
 * `endpoint` : route de remboursement (vendeur ou admin).
 */
export default function RefundBox({ order, endpoint, admin = false }) {
    const refundable = refundableOf(order);
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({ amount: refundable, reason: '' });
    const refunds = order.refunds || [];
    const rate = Number(order.commission_amount) / Math.max(1, refundable);
    const debit = Math.max(0, Math.round(Number(data.amount) - Number(order.commission_amount) * Number(data.amount) / Math.max(1, refundable)));

    const submit = (e) => {
        e.preventDefault();
        if (!confirm(`Envoyer ${fcfa(data.amount)} au ${order.payment_phone || order.customer_phone} ? Ce virement ne peut pas être annulé.`)) return;
        post(endpoint, {
            preserveScroll: true,
            onSuccess: () => { reset(); setOpen(false); },
            onError: (er) => toast.error(er.refund || er.amount || er.reason || 'Remboursement impossible.'),
        });
    };

    if (!refundable && !refunds.length) return null;

    return (
        <section className="rounded-2xl border border-black/[0.08] p-4 text-[14px]">
            <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-[#141412]">Remboursement</p>
                {refundable > 0 && !open && <Button size="sm" variant="danger" onClick={() => setOpen(true)}><RotateCcw className="h-4 w-4" /> Rembourser le client</Button>}
            </div>

            {refunds.length > 0 && (
                <ul className="mt-3 space-y-2">
                    {refunds.map((r) => {
                        const [label, tone] = STATUS[r.status] || STATUS.processing;
                        return (
                            <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#F6F5F1] px-3 py-2">
                                <span className="min-w-0"><span className="font-medium tabular-nums text-[#141412]">{fcfa(r.amount)}</span> <span className="text-[#8B8A83]">· {dateTime(r.created_at)} · {r.reason}</span></span>
                                <Badge tone={tone}>{label}</Badge>
                            </li>
                        );
                    })}
                </ul>
            )}

            {open && (
                <form onSubmit={submit} className="mt-4 space-y-4">
                    <Field label="Montant à rembourser" error={errors.amount} hint={`Maximum ${fcfa(refundable)}. Les frais de paiement payés par le client ne sont pas remboursés.`}>
                        <div className="relative">
                            <input type="number" min="1" max={refundable} inputMode="numeric" className={`${fieldClass} pr-16`} value={data.amount} onChange={(e) => setData('amount', e.target.value)} />
                            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#5F5E58]">FCFA</span>
                        </div>
                    </Field>
                    <Field label="Raison" error={errors.reason}>
                        <input className={fieldClass} maxLength={500} placeholder="Ex. article en rupture, commande non livrée" value={data.reason} onChange={(e) => setData('reason', e.target.value)} />
                    </Field>
                    <div className="rounded-xl bg-[#FFFBEA] p-3 text-[13px] text-[#7A5B00]">
                        Le client reçoit {fcfa(data.amount)} sur le {order.payment_phone || order.customer_phone}.{' '}
                        {admin ? 'Le portefeuille du vendeur' : 'Votre portefeuille'} est débité de {fcfa(debit)}{rate > 0 ? ' (la commission Biolinko correspondante est rendue)' : ''}.
                    </div>
                    {errors.refund && <p role="alert" className="text-[13px] text-[#B91C1C]">{errors.refund}</p>}
                    <div className="flex justify-end gap-2">
                        <Button onClick={() => setOpen(false)}>Annuler</Button>
                        <Button type="submit" variant="danger" disabled={processing || !data.reason.trim()}>{processing ? 'Envoi…' : `Rembourser ${fcfa(data.amount)}`}</Button>
                    </div>
                </form>
            )}
        </section>
    );
}
