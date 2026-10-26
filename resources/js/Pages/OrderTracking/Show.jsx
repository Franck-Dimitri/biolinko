import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, ArrowLeft, Check, Clock, Copy, MapPin, Package, Printer, Smartphone, Truck } from 'lucide-react';
import { toast } from 'sonner';
import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { WhatsappIcon } from '@/Components/BrandIcons';
import { ProductImage } from '@/Components/Storefront/ProductCard';
import { contrastColor } from '@/Components/Storefront/theme';
import { formatFcfa } from '@/Components/Storefront/useCart';
import PaymentStatus from '@/Components/Storefront/Checkout/PaymentStatus';
import { track } from '@/Components/Storefront/pixels';

const STEPS = [
    { id: 'paid', label: 'Payée', icon: Check },
    { id: 'preparing', label: 'En préparation', icon: Package },
    { id: 'in_delivery', label: 'En livraison', icon: Truck },
    { id: 'delivered', label: 'Livrée', icon: MapPin },
];

// Position de la commande sur la frise (-1 = paiement pas encore reçu).
function stepIndex(order) {
    if (order.status === 'delivered') return 3;
    if (order.status === 'in_delivery') return 2;
    if (order.payment_status === 'paid' || order.status === 'paid') return 1;
    return -1;
}

// Signalement pendant le délai de sécurité : prévient la boutique, qui reste l'interlocuteur du client
function ReportSection({ order, canReport, reasons, primaryColor, primaryTextColor }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ reason: 'not_received', message: '' });
    const report = order.report;

    if (report) {
        const active = report.status === 'open' || report.status === 'answered';
        return (
            <section className="space-y-3 rounded-3xl border border-black/[0.08] bg-white p-5 text-[15px] sm:p-8 print:hidden">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#141412]"><AlertTriangle className="h-5 w-5 text-[#B45309]" /> Votre signalement</h2>
                <p className="text-[#5F5E58]">{report.reason_label} · « <span className="[overflow-wrap:anywhere]">{report.message}</span> »</p>
                {report.seller_response && (
                    <div className="rounded-2xl bg-[#F6F5F1] p-4">
                        <p className="text-sm text-[#5F5E58]">Réponse de {order.store?.name || 'la boutique'}</p>
                        <p className="mt-1 whitespace-pre-line text-[#141412] [overflow-wrap:anywhere]">{report.seller_response}</p>
                    </div>
                )}
                {active ? (
                    <>
                        <p className="text-sm text-[#5F5E58]">
                            {report.status === 'open'
                                ? 'La boutique a été prévenue et va vous contacter pour trouver une solution.'
                                : 'Si tout est réglé, indiquez-le. Sans nouvelles de votre part sous 3 jours, le signalement sera clos.'}
                        </p>
                        <button type="button" onClick={() => router.post(route('order.report.resolve', order.tracking_code), {}, { preserveScroll: true })}
                            className="inline-flex h-11 items-center gap-2 rounded-full px-5 font-semibold" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                            <Check className="h-4 w-4" /> Problème résolu
                        </button>
                    </>
                ) : <p className="text-sm text-[#15803D]">Signalement clos.</p>}
            </section>
        );
    }

    if (!canReport) return null;

    const submit = (e) => {
        e.preventDefault();
        form.post(route('order.report', order.tracking_code), { preserveScroll: true, onSuccess: () => setOpen(false) });
    };

    return (
        <section className="rounded-3xl border border-black/[0.08] bg-white p-5 text-[15px] sm:p-8 print:hidden">
            {!open ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[#5F5E58]">Un problème avec votre commande ?</p>
                    <button type="button" onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 px-4 text-sm font-medium text-[#141412] hover:border-black/30">
                        <AlertTriangle className="h-4 w-4" /> Signaler un problème
                    </button>
                </div>
            ) : (
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-[#141412]">Signaler un problème</h2>
                        <p className="mt-1 text-sm text-[#5F5E58]">La boutique est prévenue et vous contacte. Biolinko met la vente en attente le temps que vous trouviez une solution ensemble.</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Motif">
                        {Object.entries(reasons || {}).map(([key, label]) => (
                            <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${form.data.reason === key ? 'border-black/40 bg-[#F6F5F1]' : 'border-black/10'}`}>
                                <input type="radio" name="reason" value={key} checked={form.data.reason === key} onChange={() => form.setData('reason', key)} className="text-[#141412] focus:ring-0" />
                                {label}
                            </label>
                        ))}
                    </div>
                    <div>
                        <label htmlFor="report-message" className="mb-1.5 block text-sm font-medium text-[#141412]">Que s’est-il passé ?</label>
                        <textarea id="report-message" rows={4} maxLength={1000} required value={form.data.message} onChange={(e) => form.setData('message', e.target.value)}
                            placeholder="Ex. : Je n’ai rien reçu alors que la livraison était prévue lundi."
                            className="w-full rounded-xl border border-black/10 px-3 py-2 text-[15px] focus:border-black/30 focus:ring-0" />
                        {form.errors.message && <p className="mt-1 text-sm text-[#B91C1C]">{form.errors.message}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="submit" disabled={form.processing} className="inline-flex h-11 items-center rounded-full px-5 font-semibold disabled:opacity-60" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                            {form.processing ? 'Envoi…' : 'Envoyer le signalement'}
                        </button>
                        <button type="button" onClick={() => setOpen(false)} className="inline-flex h-11 items-center rounded-full px-4 text-sm text-[#5F5E58] hover:text-[#141412]">Annuler</button>
                    </div>
                </form>
            )}
        </section>
    );
}

export default function Show({ order, store, canReport = false, reportReasons = {} }) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = contrastColor(primaryColor);
    const [checking, setChecking] = useState(false);
    const [paying, setPaying] = useState(false);
    const [payment, setPayment] = useState(null);

    // Nouvelle demande Mobile Money pour cette commande (lien de relance, demande précédente expirée…)
    const payNow = async () => {
        setPaying(true);
        try {
            const { data } = await axios.post(route('order.pay', order.tracking_code));
            setPayment({ ...data, phone: data.phone ? `+${data.phone}` : '' });
        } catch (e) {
            toast.error(e.response?.data?.error || 'La demande de paiement a échoué. Réessayez.');
        } finally {
            setPaying(false);
        }
    };

    const cancelled = order.status === 'cancelled' || order.payment_status === 'failed';
    const awaitingPayment = !cancelled && stepIndex(order) < 0;
    const current = stepIndex(order);

    // Paiement en attente : on interroge l'opérateur puis on recharge la page dès qu'il est confirmé.
    useEffect(() => {
        if (!awaitingPayment) return;
        const poll = setInterval(async () => {
            try {
                const { data } = await axios.get(route('checkout.status', order.tracking_code));
                if (data.paid || data.status === 'FAILED') router.reload({ only: ['order'] });
            } catch (e) { /* réessai au prochain tour */ }
        }, 5000);
        return () => clearInterval(poll);
    }, [awaitingPayment, order.tracking_code]);

    const checkNow = async () => {
        setChecking(true);
        try {
            const { data } = await axios.get(route('checkout.status', order.tracking_code));
            if (data.paid || data.status === 'FAILED') router.reload({ only: ['order'] });
            else toast('Paiement toujours en attente de validation.');
        } catch (e) {
            toast.error('Impossible de vérifier pour le moment.');
        } finally {
            setChecking(false);
        }
    };

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(order.tracking_code);
            toast.success('Numéro de commande copié');
        } catch (e) { /* presse-papiers indisponible */ }
    };

    const whatsappUrl = store.phone_whatsapp
        ? `https://wa.me/${store.phone_whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
            `Bonjour ${store.name}, je suis ${order.customer_name}. Je vous contacte au sujet de ma commande ${order.tracking_code} (${formatFcfa(order.total_client)}).`,
        )}`
        : null;

    const header = cancelled
        ? { icon: AlertCircle, tone: 'bg-red-50 text-[#B91C1C]', title: 'Paiement non abouti', sub: "Votre commande n'a pas été payée. Vous pouvez la refaire depuis la boutique." }
        : awaitingPayment
            ? { icon: Smartphone, tone: 'bg-[#FFF8D6] text-[#141412]', title: 'En attente de votre paiement', sub: 'Votre commande est réservée. Payez par Mobile Money pour la confirmer, cette page se met à jour toute seule.' }
            : order.status === 'delivered'
                ? { icon: Check, tone: 'bg-green-50 text-[#15803D]', title: 'Commande livrée', sub: `Merci pour votre achat chez ${store.name} !` }
                : { icon: Check, tone: 'bg-green-50 text-[#15803D]', title: 'Merci, votre commande est payée', sub: `${store.name} prépare votre commande et vous contactera pour la livraison.` };
    const HeaderIcon = header.icon;

    return (
        <StorefrontLayout store={store}>
            <Head title={`Commande ${order.tracking_code}, ${store.name}`} />
            <PaymentStatus payment={payment} primaryColor={primaryColor} primaryTextColor={primaryTextColor}
                onPaid={() => track('Purchase', { value: order.total_client })} onRetry={() => setPayment(null)} />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between gap-3 print:hidden">
                    <a href={`/${store.slug}`} className="inline-flex items-center gap-1.5 text-sm text-[#5F5E58] hover:text-[#141412]">
                        <ArrowLeft className="h-4 w-4" /> Retour à la boutique
                    </a>
                    <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-black/[0.08] px-3 text-sm font-medium text-[#141412] hover:border-black/30">
                        <Printer className="h-4 w-4" /> Imprimer le reçu
                    </button>
                </div>

                <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 rounded-3xl border border-black/[0.08] bg-white p-5 sm:p-8">
                    <div className="space-y-3 text-center">
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${header.tone}`}>
                            <HeaderIcon className="h-8 w-8" />
                        </motion.span>
                        <h1 className="text-2xl font-medium tracking-[-0.03em] text-[#141412]">{header.title}</h1>
                        <p className="mx-auto max-w-md text-[#5F5E58]">{header.sub}</p>
                        <button type="button" onClick={copyCode} className="inline-flex items-center gap-1.5 rounded-xl bg-[#F6F5F1] px-3 py-1.5 font-mono text-sm text-[#141412]">
                            {order.tracking_code} <Copy className="h-3.5 w-3.5 text-[#5F5E58]" />
                        </button>
                    </div>

                    {awaitingPayment && (
                        <div className="flex flex-col items-center gap-2 print:hidden">
                            <button type="button" onClick={payNow} disabled={paying} className="inline-flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-full px-5 font-semibold disabled:opacity-60" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                <Smartphone className="h-4 w-4" /> {paying ? 'Envoi de la demande…' : `Payer ${formatFcfa(order.total_client)}`}
                            </button>
                            <button type="button" onClick={checkNow} disabled={checking} className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 px-4 text-sm font-medium text-[#141412] hover:border-black/30 disabled:opacity-60">
                                <Clock className="h-4 w-4" /> {checking ? 'Vérification…' : "J'ai déjà validé, vérifier"}
                            </button>
                            <p className="text-center text-sm text-[#5F5E58]">Le paiement envoie une demande sur le {order.payment_phone || order.customer_phone}. Pas de message ? Composez *126# (MTN) ou #150*50# (Orange).</p>
                        </div>
                    )}

                    {!cancelled && (
                        <ol className="grid grid-cols-4 gap-1" aria-label="Avancement de la commande">
                            {STEPS.map((step, i) => {
                                const done = i < current || (i === current && i === 3);
                                const active = i === current && i !== 3;
                                const Icon = step.icon;
                                return (
                                    <li key={step.id} className="relative flex flex-col items-center gap-2 text-center">
                                        {i > 0 && <span className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${i <= current ? 'bg-[#16A34A]' : 'bg-black/10'}`} aria-hidden />}
                                        <span className={`relative flex h-8 w-8 items-center justify-center rounded-full ${done ? 'bg-[#16A34A] text-white' : active ? '' : 'bg-[#F6F5F1] text-[#5F5E58]'}`}
                                            style={active ? { backgroundColor: primaryColor, color: primaryTextColor } : undefined}>
                                            {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                                        </span>
                                        <span className={`text-xs sm:text-sm ${done || active ? 'font-medium text-[#141412]' : 'text-[#5F5E58]'}`}>{step.label}</span>
                                    </li>
                                );
                            })}
                        </ol>
                    )}

                    {whatsappUrl && (
                        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#16A34A] font-semibold text-white hover:bg-[#15803D] print:hidden">
                            <WhatsappIcon className="h-5 w-5" /> Écrire au vendeur sur WhatsApp
                        </a>
                    )}
                </motion.section>

                <ReportSection order={{ ...order, store }} canReport={canReport} reasons={reportReasons} primaryColor={primaryColor} primaryTextColor={primaryTextColor} />

                <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="space-y-5 rounded-3xl border border-black/[0.08] bg-[#F6F5F1] p-5 sm:p-8">
                    <div className="flex items-baseline justify-between gap-3">
                        <h2 className="text-lg font-semibold text-[#141412]">Reçu</h2>
                        <span className="text-sm text-[#5F5E58]">
                            {new Date(order.paid_at || order.created_at).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                    </div>

                    <ul className="space-y-3">
                        {(order.items || []).map((item) => (
                            <li key={item.id} className="flex min-w-0 items-center gap-3">
                                <ProductImage src={item.product?.image_url || item.product?.images?.[0]} alt={item.product_title} className="h-14 w-12 shrink-0 rounded-full" />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-[15px] font-medium text-[#141412]">{item.product_title}</div>
                                    <div className="text-sm text-[#5F5E58]">{item.variant_label ? `${item.variant_label} · ` : ''}Qté {item.quantity}</div>
                                </div>
                                <span className="shrink-0 tabular-nums text-[15px] text-[#141412]">{formatFcfa(item.total_price_vendor)}</span>
                            </li>
                        ))}
                    </ul>

                    <dl className="space-y-2 border-t border-black/[0.08] pt-4 text-[15px]">
                        <div className="flex justify-between text-[#5F5E58]"><dt>Articles</dt><dd className="tabular-nums">{formatFcfa(order.price_vendor)}</dd></div>
                        <div className="flex justify-between text-[#5F5E58]"><dt>Frais de service</dt><dd className="tabular-nums">{formatFcfa(Number(order.saas_margin) + Number(order.api_fee || 0))}</dd></div>
                        <div className="flex items-baseline justify-between pt-1 text-[#141412]">
                            <dt className="font-semibold">{awaitingPayment || cancelled ? 'Total' : 'Total payé'}</dt>
                            <dd className="text-xl font-bold tabular-nums">{formatFcfa(order.total_client)}</dd>
                        </div>
                    </dl>

                    <dl className="grid gap-3 border-t border-black/[0.08] pt-4 text-[15px] sm:grid-cols-2">
                        <div><dt className="text-sm text-[#5F5E58]">Client</dt><dd className="text-[#141412]">{order.customer_name}<br />{order.customer_phone}</dd></div>
                        <div><dt className="text-sm text-[#5F5E58]">Livraison</dt><dd className="break-words text-[#141412]">{order.city}<br />{order.address_details}</dd></div>
                        <div><dt className="text-sm text-[#5F5E58]">Paiement</dt><dd className="text-[#141412]">{order.payment_operator === 'ORANGE' ? 'Orange Money' : 'MTN MoMo'}</dd></div>
                    </dl>
                </motion.section>
            </div>
        </StorefrontLayout>
    );
}
