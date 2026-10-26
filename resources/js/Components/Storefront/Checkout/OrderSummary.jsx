import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Trash2, Truck } from 'lucide-react';
import { ProductImage } from '@/Components/Storefront/ProductCard';
import { formatFcfa, useServiceFeePercent } from '@/Components/Storefront/useCart';

/**
 * Récapitulatif de commande. Passer `onQuantity` / `onRemove` pour un panier modifiable.
 * `discount` (montant) s'affiche pour les packs avec remise.
 */
export default function OrderSummary({ items, subtotal, fee, total, discount = 0, onQuantity, onRemove, title = 'Récapitulatif' }) {
    const feePercent = useServiceFeePercent();
    const count = items.reduce((acc, it) => acc + (it.quantity || 1), 0);

    return (
        <div className="space-y-4 rounded-3xl border border-black/[0.08] bg-[#F6F5F1] p-5 sm:p-6">
            <h2 className="flex items-baseline justify-between text-lg font-semibold text-[#141412]">
                {title} <span className="text-sm font-normal text-[#5F5E58]">{count} article{count > 1 ? 's' : ''}</span>
            </h2>

            <ul className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                    {items.map((item, idx) => (
                        <motion.li key={`${item.product_id}-${item.variant_id ?? idx}`} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}
                            className="flex min-w-0 items-center gap-3">
                            <span className="relative shrink-0">
                                <ProductImage src={item.image_url} alt={item.title} className="h-16 w-14 rounded-xl" />
                                {!onQuantity && (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#141412] px-1 text-[11px] font-semibold text-white">{item.quantity}</span>
                                )}
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-[15px] font-medium text-[#141412]" title={item.title}>{item.title}</div>
                                {item.variant_label && <div className="truncate text-sm text-[#5F5E58]">{item.variant_label}</div>}
                                {onQuantity && (
                                    <div className="mt-1.5 flex items-center gap-1">
                                        <div className="flex items-center rounded-xl border border-black/[0.08] bg-white">
                                            <button type="button" aria-label="Retirer un article" onClick={() => onQuantity(idx, item.quantity - 1)} disabled={item.quantity <= (item.min_order_quantity || 1)}
                                                className="flex h-9 w-9 items-center justify-center text-[#141412] disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button>
                                            <span className="w-6 text-center text-sm font-medium tabular-nums text-[#141412]">{item.quantity}</span>
                                            <button type="button" aria-label="Ajouter un article" onClick={() => onQuantity(idx, item.quantity + 1)}
                                                className="flex h-9 w-9 items-center justify-center text-[#141412]"><Plus className="h-3.5 w-3.5" /></button>
                                        </div>
                                        <button type="button" aria-label={`Supprimer ${item.title}`} onClick={() => onRemove?.(idx)}
                                            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#5F5E58] hover:text-[#B91C1C]"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                )}
                            </div>
                            <span className="shrink-0 whitespace-nowrap text-[15px] font-medium tabular-nums text-[#141412]">
                                {Math.ceil((item.price_display || item.price_vendor || item.unit_price || 0) * item.quantity).toLocaleString('fr-FR')} F
                            </span>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>

            <dl className="space-y-2 border-t border-black/[0.08] pt-4 text-[15px]">
                <div className="flex justify-between text-[#5F5E58]"><dt>Sous-total</dt><dd className="tabular-nums">{formatFcfa(subtotal)}</dd></div>
                {discount > 0 && (
                    <div className="flex justify-between text-[#15803D]"><dt>Remise pack</dt><dd className="tabular-nums">−{formatFcfa(discount)}</dd></div>
                )}
                <div className="flex justify-between text-[#5F5E58]"><dt>Frais de service ({String(feePercent).replace('.', ',')} %)</dt><dd className="tabular-nums">{formatFcfa(fee)}</dd></div>
                <div className="flex justify-between text-[#5F5E58]"><dt className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Livraison</dt><dd>À convenir avec le vendeur</dd></div>
                <div className="flex items-baseline justify-between pt-2 text-[#141412]">
                    <dt className="font-semibold">Total à payer</dt>
                    <motion.dd key={total} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold tabular-nums">{formatFcfa(total)}</motion.dd>
                </div>
            </dl>
        </div>
    );
}
