import { useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, PackagePlus, Plus, Smartphone, X } from 'lucide-react';
import { toast } from 'sonner';
import { ProductImage } from '@/Components/Storefront/ProductCard';
import { formatFcfa, serviceFee, useServiceFeePercent } from '@/Components/Storefront/useCart';

/**
 * Ajout après paiement : le client ajoute un article à sa commande payée. Il part avec elle,
 * sans frais de livraison ; seul l'article (et les frais de paiement) est payé en Mobile Money.
 */
export default function AddonOffers({ order, offers = [], addons = [], primaryColor, primaryTextColor }) {
    const [picked, setPicked] = useState(null);
    if (!offers.length && !addons.length) return null;

    return (
        <section className="space-y-4 rounded-[var(--r,24px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:var(--bg,#FFFFFF)] p-5 text-[15px] sm:p-8 print:hidden" aria-labelledby="addon-title">
            {addons.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-[color:var(--ink,#141412)]">Ajouts à votre commande</h2>
                    <ul className="space-y-2">
                        {addons.map((a) => (
                            <li key={a.tracking_code} className="flex min-w-0 items-center gap-3 rounded-[var(--r,16px)] bg-[color:var(--sf,#F6F5F1)] p-3">
                                <ProductImage src={a.items[0]?.image} alt="" className="h-11 w-11 shrink-0 rounded-[min(var(--r,12px),12px)]" sizes="44px" />
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate font-medium text-[color:var(--ink,#141412)]">{a.items.map((i) => `${i.quantity > 1 ? `${i.quantity} × ` : ''}${i.title}`).join(', ')}</span>
                                    <span className="block text-sm text-[color:var(--mu,#5F5E58)]">{a.paid ? `Payé · ${formatFcfa(a.total)} · livré avec la commande` : `En attente de paiement · ${formatFcfa(a.total)}`}</span>
                                </span>
                                {a.paid
                                    ? <Check className="h-5 w-5 shrink-0 text-[#15803D]" aria-label="Payé" />
                                    : <a href={a.payment_url} className="shrink-0 rounded-[var(--rb,9999px)] px-3.5 py-2 text-sm font-semibold" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>Payer</a>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {offers.length > 0 && (
                <>
                    <div className="flex gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[min(var(--r,12px),12px)]" style={{ backgroundColor: primaryColor, color: primaryTextColor }}><PackagePlus className="h-5 w-5" /></span>
                        <div className="min-w-0">
                            <h2 id="addon-title" className="text-lg font-semibold text-[color:var(--ink,#141412)]">Ajoutez à votre commande</h2>
                            <p className="mt-0.5 text-sm text-[color:var(--mu,#5F5E58)]">Livré avec elle, sans frais de livraison en plus. Vous ne payez que l’article.</p>
                        </div>
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {offers.map((o) => (
                            <li key={o.id}>
                                <button type="button" onClick={() => setPicked(o)} className="flex w-full min-w-0 items-center gap-3 rounded-[var(--r,16px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] p-2.5 text-left hover:border-[color:color-mix(in_srgb,var(--ink,#000000)_30%,transparent)]">
                                    <ProductImage src={o.image} alt="" className="h-14 w-14 shrink-0 rounded-[min(var(--r,12px),12px)]" sizes="56px" />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-medium text-[color:var(--ink,#141412)]">{o.title}</span>
                                        <span className="block text-sm tabular-nums text-[color:var(--mu,#5F5E58)]">{o.min_quantity > 1 ? `${o.min_quantity} × ` : ''}{formatFcfa(o.price)}</span>
                                    </span>
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--rb,9999px)]" style={{ backgroundColor: primaryColor, color: primaryTextColor }}><Plus className="h-4 w-4" /></span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <AnimatePresence>{picked && <AddonSheet order={order} offer={picked} onClose={() => setPicked(null)} primaryColor={primaryColor} primaryTextColor={primaryTextColor} />}</AnimatePresence>
        </section>
    );
}

function AddonSheet({ order, offer, onClose, primaryColor, primaryTextColor }) {
    const feePercent = useServiceFeePercent();
    const [variant, setVariant] = useState(offer.variants[0] || null);
    const [quantity, setQuantity] = useState(offer.min_quantity);
    const [busy, setBusy] = useState(false);
    const unit = variant?.price || offer.price;
    const goods = unit * quantity;
    const fee = serviceFee(goods, feePercent);

    const submit = async () => {
        setBusy(true);
        try {
            const { data } = await axios.post(route('order.addon', order.tracking_code), { product_id: offer.id, variant_id: variant?.id ?? null, quantity });
            window.location.href = data.payment_url;
        } catch (e) {
            toast.error(e.response?.data?.error || 'L’ajout n’a pas pu être créé. Réessayez.');
            setBusy(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="addon-sheet-title" onClick={(e) => e.stopPropagation()}
                initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-md space-y-5 rounded-t-[var(--r,24px)] bg-[color:var(--bg,#FFFFFF)] p-6 sm:rounded-[var(--r,24px)]">
                <div className="flex items-start gap-3">
                    <ProductImage src={offer.image} alt="" className="h-16 w-16 shrink-0 rounded-[min(var(--r,12px),12px)]" sizes="64px" />
                    <div className="min-w-0 flex-1">
                        <h3 id="addon-sheet-title" className="text-lg font-semibold text-[color:var(--ink,#141412)]">{offer.title}</h3>
                        <p className="text-sm text-[color:var(--mu,#5F5E58)]">Livré avec la commande {order.tracking_code}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5"><X className="h-5 w-5" /></button>
                </div>

                {offer.variants.length > 0 && (
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Option">
                        {offer.variants.map((v) => (
                            <button key={v.id} type="button" role="radio" aria-checked={variant?.id === v.id} onClick={() => setVariant(v)}
                                className={`h-9 rounded-[var(--rb,9999px)] border px-3.5 text-sm ${variant?.id === v.id ? 'border-[color:var(--ink,#141412)] text-[color:var(--ink,#141412)]' : 'border-[color:var(--ln,rgba(0,0,0,0.08))] text-[color:var(--mu,#5F5E58)]'}`}>
                                {v.label || 'Option'}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[color:var(--ink,#141412)]">Quantité</span>
                    <div className="flex items-center rounded-[min(var(--r,12px),12px)] border border-[color:var(--ln,rgba(0,0,0,0.08))]">
                        <button type="button" aria-label="Retirer un" disabled={quantity <= offer.min_quantity} onClick={() => setQuantity((q) => q - 1)} className="flex h-9 w-9 items-center justify-center text-[color:var(--ink,#141412)] disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                        <span className="w-8 text-center font-medium tabular-nums text-[color:var(--ink,#141412)]">{quantity}</span>
                        <button type="button" aria-label="Ajouter un" disabled={quantity >= 10} onClick={() => setQuantity((q) => q + 1)} className="flex h-9 w-9 items-center justify-center text-[color:var(--ink,#141412)] disabled:opacity-30"><Plus className="h-4 w-4" /></button>
                    </div>
                </div>

                <dl className="space-y-1.5 border-t border-[color:var(--ln,rgba(0,0,0,0.08))] pt-4 text-sm">
                    <div className="flex justify-between text-[color:var(--mu,#5F5E58)]"><dt>Article</dt><dd className="tabular-nums">{formatFcfa(goods)}</dd></div>
                    <div className="flex justify-between text-[color:var(--mu,#5F5E58)]"><dt>Livraison</dt><dd className="text-[#15803D]">Offerte, part avec votre commande</dd></div>
                    <div className="flex justify-between text-[color:var(--mu,#5F5E58)]"><dt>Frais de paiement ({String(feePercent).replace('.', ',')} %)</dt><dd className="tabular-nums">{formatFcfa(fee)}</dd></div>
                    <div className="flex items-baseline justify-between pt-1 text-[color:var(--ink,#141412)]"><dt className="font-semibold">À payer</dt><dd className="text-lg font-bold tabular-nums">{formatFcfa(goods + fee)}</dd></div>
                </dl>

                <button type="button" onClick={submit} disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--rb,9999px)] font-semibold disabled:opacity-60" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                    <Smartphone className="h-4 w-4" /> {busy ? 'Un instant…' : `Ajouter et payer ${formatFcfa(goods + fee)}`}
                </button>
            </motion.div>
        </motion.div>
    );
}
