import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Tag } from 'lucide-react';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { ProductImage } from '@/Components/Storefront/ProductCard';
import { contrastColor } from '@/Components/Storefront/theme';
import { formatFcfa, serviceFee, useServiceFeePercent } from '@/Components/Storefront/useCart';
import CheckoutForm from '@/Components/Storefront/Checkout/CheckoutForm';
import OrderSummary from '@/Components/Storefront/Checkout/OrderSummary';

export default function SmartLinkShow({ smartLink, store, isValid }) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = contrastColor(primaryColor);
    const [imageIndex, setImageIndex] = useState(0);

    if (!isValid) {
        return (
            <StorefrontLayout store={store}>
                <Head title={`Offre indisponible, ${store?.name || 'Biolinko'}`} />
                <div className="mx-auto max-w-md space-y-4 rounded-3xl border border-black/[0.08] bg-[#F6F5F1] p-10 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-[#5F5E58]" />
                    <h1 className="text-xl font-semibold text-[#141412]">Cette offre n'est plus disponible</h1>
                    <p className="text-[#5F5E58]">Le lien a expiré ou le stock du pack est épuisé. Découvrez les autres articles de {store?.name}.</p>
                    <a href={`/${store?.slug}`} className="inline-flex h-11 items-center rounded-full px-5 font-semibold" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                        Voir la boutique
                    </a>
                </div>
            </StorefrontLayout>
        );
    }

    const items = (smartLink.items || []).map((it) => ({
        product_id: it.product_id,
        title: it.product_name,
        image_url: it.image_url,
        quantity: it.quantity,
        price_display: it.unit_price,
    }));
    const subtotal = Number(smartLink.subtotal_amount) || items.reduce((a, it) => a + it.price_display * it.quantity, 0);
    const packPrice = Number(smartLink.total_amount);
    const feePercent = useServiceFeePercent();
    const fee = serviceFee(packPrice, feePercent);
    const discount = Math.max(0, subtotal - packPrice);
    const active = items[imageIndex] || items[0];

    return (
        <StorefrontLayout store={store}>
            <Head title={`${smartLink.title}, ${store.name}`} />

            <div className="space-y-8">
                <a href={`/${store.slug}`} className="inline-flex items-center gap-1.5 text-sm text-[#5F5E58] hover:text-[#141412]">
                    <ArrowLeft className="h-4 w-4" /> Voir toute la boutique
                </a>

                <section className="grid items-center gap-6 rounded-xl p-5 sm:p-8 lg:grid-cols-2" style={{ backgroundColor: `${primaryColor}1f` }}>
                    <div className="space-y-3">
                        <div className="relative aspect-square overflow-hidden rounded-3xl bg-white">
                            <AnimatePresence mode="wait">
                                <motion.div key={imageIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="h-full w-full">
                                    <ProductImage src={active?.image_url} alt={active?.title} className="h-full w-full" />
                                </motion.div>
                            </AnimatePresence>
                            {active && (
                                <span className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 text-sm font-medium text-[#141412]">
                                    {active.quantity} × {active.title}
                                </span>
                            )}
                        </div>
                        {items.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
                                {items.map((it, i) => (
                                    <button key={i} type="button" onClick={() => setImageIndex(i)} aria-label={`Voir ${it.title}`}
                                        className={`shrink-0 overflow-hidden rounded-xl border-2 ${i === imageIndex ? 'border-[#141412]' : 'border-transparent opacity-70'}`}>
                                        <ProductImage src={it.image_url} alt="" className="h-16 w-16" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1 text-sm font-medium text-[#141412]">
                            <Tag className="h-4 w-4" /> Pack de {store.name}
                        </span>
                        <h1 className="break-words text-3xl font-medium leading-tight tracking-[-0.03em] text-[#141412] sm:text-4xl">{smartLink.title}</h1>
                        <div className="flex flex-wrap items-baseline gap-3">
                            <span className="text-3xl font-bold tabular-nums text-[#141412]">{formatFcfa(packPrice)}</span>
                            {discount > 0 && (
                                <>
                                    <span className="text-lg text-[#5F5E58] line-through tabular-nums">{formatFcfa(subtotal)}</span>
                                    <span className="rounded bg-[#DC2626] px-2 py-0.5 text-sm font-semibold text-white">−{formatFcfa(discount)}</span>
                                </>
                            )}
                        </div>
                        <ul className="space-y-1.5 text-[15px] text-[#141412]">
                            {items.map((it, i) => (
                                <li key={i} className="flex justify-between gap-3 border-b border-[#141412]/10 pb-1.5">
                                    <span className="min-w-0 truncate">{it.quantity} × {it.title}</span>
                                    <span className="shrink-0 tabular-nums text-[#5F5E58]">{formatFcfa(it.price_display * it.quantity)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <div>
                    <h2 className="mb-4 text-2xl font-medium tracking-[-0.03em] text-[#141412]">Commander ce pack</h2>
                    <CheckoutForm
                        store={store}
                        total={packPrice + fee}
                        endpoint={route('smartlink.checkout', smartLink.code)}
                        payload={{}}
                        summary={<OrderSummary items={items} subtotal={subtotal} discount={discount} fee={fee} total={packPrice + fee} />}
                    />
                </div>
            </div>
        </StorefrontLayout>
    );
}
