import { Head, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, CalendarClock, Check, Copy, CreditCard, Lock, RefreshCw, Store } from 'lucide-react';
import { toast } from 'sonner';
import AppToaster from '@/Components/UI/AppToaster';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import PaymentStatus from '@/Components/Storefront/Checkout/PaymentStatus';
import { contrastColor } from '@/Components/Storefront/theme';
import { formatFcfa } from '@/Components/Storefront/useCart';
import { track } from '@/Components/Storefront/pixels';
import { EASE_OUT } from '@/Components/UI/Motion';

const OP_LABEL = { MTN: 'MTN Mobile Money', ORANGE: 'Orange Money' };
const SLOT_LABEL = { matin: 'le matin', midi: 'à midi', 'apres-midi': 'l’après-midi', soir: 'le soir' };

const formatLocal = (v) => String(v || '').replace(/\D/g, '').slice(0, 9).replace(/^(\d)(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2}).*/, (m, a, b, c, d, e) => [a, b, c, d, e].filter(Boolean).join(' '));

function detect(prefixes, digits) {
    for (const [op, list] of Object.entries(prefixes || {})) {
        if (list.some((p) => digits.startsWith(p))) return op;
    }
    return null;
}

function Line({ label, value, strong = false, muted = false }) {
    return (
        <div className={`flex items-start justify-between gap-4 ${strong ? 'text-[16px] font-semibold text-[#141412]' : muted ? 'text-[14px] text-[#5F5E58]' : 'text-[14px] text-[#141412]'}`}>
            <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
            <span className="shrink-0 tabular-nums">{value}</span>
        </div>
    );
}

/**
 * Page de paiement Biolinko (même esprit que la page hébergée de l'agrégateur, sans quitter Biolinko) :
 * récapitulatif de la commande à gauche, moyen de paiement et numéro à droite.
 */
export default function Show({ order, items = [], store, country, trackUrl, storeHome }) {
    const { payments, site } = usePage().props;
    const testMode = Boolean(payments?.test_mode);
    const color = store?.theme_color || '#FFCC00';
    const onColor = contrastColor(color);
    const local = String(order.payment_phone || order.customer_whatsapp || order.customer_phone || '').replace(/\D/g, '').replace(new RegExp(`^${country.dial}`), '');

    const [method, setMethod] = useState('momo');
    const [phone, setPhone] = useState(formatLocal(local));
    const [email, setEmail] = useState(order.customer_email || '');
    const digits = phone.replace(/\D/g, '');
    const detected = useMemo(() => detect(country.prefixes, digits), [digits]);
    const [operator, setOperator] = useState(null);
    const op = operator || detected || country.operators[0];
    const phoneOk = digits.length === 9 && digits.startsWith('6');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [payment, setPayment] = useState(null);

    useEffect(() => { setOperator(null); }, [detected]);

    const total = Number(order.total_client);
    const fee = Number(order.saas_margin);
    const balance = Number(order.balance_due);

    const pay = async (e) => {
        e.preventDefault();
        if (!phoneOk) return setError('Entrez votre numéro Mobile Money à 9 chiffres (6XX XX XX XX).');
        setError('');
        setBusy(true);
        try {
            const { data } = await axios.post(route('order.pay', order.tracking_code), { phone: `${country.dial}${digits}`, operator: op, email: email || null });
            if (data.checkout_url) { window.location.href = data.checkout_url; return; }
            setPayment({
                reference: data.reference || order.tracking_code, tracking_code: order.tracking_code, redirect_url: trackUrl,
                amount: total, operator: data.operator || op, phone: `+${country.dial} ${formatLocal(digits)}`,
            });
        } catch (err) {
            setError(err.response?.data?.error || 'La demande de paiement a échoué. Vérifiez votre connexion et réessayez.');
        } finally {
            setBusy(false);
        }
    };

    const copyRef = async () => {
        try { await navigator.clipboard.writeText(order.tracking_code); toast.success('Référence copiée'); } catch (e) { /* indisponible */ }
    };

    return (
        <div className="min-h-screen bg-white font-poppins text-[#141412] antialiased">
            <Head title={`Paiement, ${store.name}`} />
            <AppToaster />
            <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* Récapitulatif */}
                <section className="min-w-0 bg-[#F6F5F1] px-5 pb-8 pt-8 sm:px-10 lg:flex lg:justify-end lg:px-16 lg:pb-24 lg:pt-20">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE_OUT }} className="mx-auto w-full max-w-[440px] lg:mx-0">
                        <a href={storeHome} className="inline-flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-black/[0.08]">
                                {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4 text-[#5F5E58]" />}
                            </span>
                            <span className="text-[16px] font-medium">{store.name}</span>
                        </a>

                        <p className="mt-8 text-[15px] text-[#5F5E58] lg:mt-14">Payer {store.name}</p>
                        <p className="mt-1 text-[36px] font-semibold leading-tight tracking-[-0.02em] tabular-nums sm:text-[40px]">{formatFcfa(total)}</p>

                        <div className="mt-8 space-y-3 border-b border-black/[0.08] pb-5">
                            {items.map((it, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="min-w-0 flex-1 text-[14px]">
                                        <p className="[overflow-wrap:anywhere]">{it.title}{it.quantity > 1 ? ` × ${it.quantity}` : ''}</p>
                                        {it.variant && <p className="text-[13px] text-[#5F5E58]">{it.variant}</p>}
                                        {(it.customizations || []).map((c) => <p key={c.label} className="text-[13px] text-[#5F5E58] [overflow-wrap:anywhere]">{c.label} : {c.value}</p>)}
                                    </div>
                                    <span className="shrink-0 text-[14px] tabular-nums">{formatFcfa(it.total)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2.5 border-b border-black/[0.08] py-5">
                            {Number(order.discount_amount) > 0 && <Line label={`Réduction${order.promo_code ? ` (${order.promo_code})` : ''}`} value={`−${formatFcfa(order.discount_amount)}`} muted />}
                            {Number(order.delivery_fee) > 0 && <Line label="Livraison" value={formatFcfa(order.delivery_fee)} muted />}
                            {balance > 0 && <Line label="Reste à payer au livreur" value={`−${formatFcfa(balance)}`} muted />}
                            <Line label="Frais de paiement" value={formatFcfa(fee)} muted />
                            <div className="pt-1"><Line label="Total à payer" value={formatFcfa(total)} strong /></div>
                        </div>
                        <dl className="space-y-3 py-5 text-[14px]">
                            <div className="flex justify-between gap-4"><dt className="text-[#5F5E58]">Bénéficiaire</dt><dd className="text-right">{store.name}</dd></div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-[#5F5E58]">Référence</dt>
                                <dd className="flex min-w-0 items-center gap-2 font-mono text-[13px]">
                                    <span className="truncate">{order.tracking_code}</span>
                                    <button type="button" onClick={copyRef} aria-label="Copier la référence" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#5F5E58] hover:bg-black/5"><Copy className="h-4 w-4" /></button>
                                </dd>
                            </div>
                            {order.desired_date && (
                                <div className="flex justify-between gap-4">
                                    <dt className="flex items-center gap-1.5 text-[#5F5E58]"><CalendarClock className="h-4 w-4" /> Pour le</dt>
                                    <dd className="text-right">{new Date(`${String(order.desired_date).substring(0, 10)}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}{order.desired_slot ? `, ${SLOT_LABEL[order.desired_slot] || ''}` : ''}</dd>
                                </div>
                            )}
                        </dl>
                    </motion.div>
                </section>

                {/* Moyen de paiement */}
                <section className="min-w-0 px-5 pb-8 pt-8 sm:px-10 lg:px-16 lg:pb-28 lg:pt-20">
                    <motion.form onSubmit={pay} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08, ease: EASE_OUT }} className="mx-auto w-full max-w-[420px] lg:mx-0">
                        {testMode && (
                            <div className="mb-6 rounded-2xl border border-[#F59E0B]/50 bg-[#FFFBEB] p-3.5 text-[13px] text-[#7A5B00]">
                                <span className="font-medium">Mode test :</span> aucun argent n’est débité. Le paiement est validé automatiquement après quelques secondes ; un numéro qui finit par 0000 simule un refus.
                            </div>
                        )}

                        <h1 className="text-[20px] font-semibold">Moyen de paiement</h1>
                        <div className="mt-4 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Moyen de paiement">
                            <button type="button" role="radio" aria-checked={method === 'momo'} onClick={() => setMethod('momo')}
                                className="rounded-2xl border-2 p-3.5 text-left transition-colors"
                                style={method === 'momo' ? { borderColor: color, backgroundColor: `${color}12` } : { borderColor: 'rgba(0,0,0,0.08)' }}>
                                <span className="flex gap-1.5">{country.operators.map((o) => <OperatorLogo key={o} op={o} className="h-6 w-6" />)}</span>
                                <span className="mt-2.5 block text-[14px] font-medium">Mobile money</span>
                            </button>
                            <button type="button" role="radio" aria-checked={false} aria-disabled="true" disabled
                                className="cursor-not-allowed rounded-2xl border-2 border-black/[0.06] p-3.5 text-left opacity-60">
                                <span className="flex items-center gap-1.5">
                                    <span className="rounded bg-[#1A1F71] px-1.5 py-0.5 text-[10px] font-bold italic text-white">VISA</span>
                                    <span className="flex"><span className="h-4 w-4 rounded-full bg-[#EB001B]" /><span className="-ml-1.5 h-4 w-4 rounded-full bg-[#F79E1B]/90" /></span>
                                    <CreditCard className="h-4 w-4 text-[#5F5E58]" />
                                </span>
                                <span className="mt-2.5 block text-[14px] font-medium">Carte bancaire</span>
                                <span className="block text-[12px] text-[#8B8A83]">Bientôt</span>
                            </button>
                        </div>

                        <label htmlFor="pay-phone" className="mt-6 block text-[14px] font-medium">Numéro mobile money</label>
                        <div className="mt-2 flex gap-2">
                            <span className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-black/[0.08] bg-[#F6F5F1] px-3 text-[15px]">
                                <img src={`/images/flags/${country.code.toLowerCase()}.svg`} alt="" className="h-5 w-5 rounded-full object-cover" /> +{country.dial}
                            </span>
                            <input id="pay-phone" type="tel" inputMode="numeric" autoComplete="tel-national" required placeholder="6 71 23 45 67" value={phone}
                                onChange={(e) => setPhone(formatLocal(e.target.value))}
                                className="h-12 min-w-0 flex-1 rounded-xl border border-black/[0.08] bg-[#F6F5F1] px-3.5 text-[16px] tracking-wide focus:border-black/30 focus:bg-white focus:ring-0" />
                        </div>
                        {phoneOk && (
                            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[13px] text-[#5F5E58]">
                                {country.operators.map((o) => (
                                    <button key={o} type="button" onClick={() => setOperator(o)} aria-pressed={op === o}
                                        className={`inline-flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-2.5 transition-colors ${op === o ? 'border-[#141412] text-[#141412]' : 'border-black/10 hover:border-black/25'}`}>
                                        <OperatorLogo op={o} className="h-5 w-5" /> {OP_LABEL[o] || o}{op === o && <Check className="h-3.5 w-3.5" />}
                                    </button>
                                ))}
                            </div>
                        )}

                        <label htmlFor="pay-email" className="mt-5 block text-[14px] font-medium">Adresse e-mail <span className="font-normal text-[#8B8A83]">(facultatif, pour le reçu)</span></label>
                        <input id="pay-email" type="email" autoComplete="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="mt-2 h-12 w-full rounded-xl border border-black/[0.08] bg-[#F6F5F1] px-3.5 text-[15px] focus:border-black/30 focus:bg-white focus:ring-0" />

                        {error && (
                            <p role="alert" className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-[14px] text-[#B91C1C]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</p>
                        )}

                        <motion.button type="submit" disabled={busy || !phoneOk} whileTap={{ scale: 0.98 }}
                            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[16px] font-semibold shadow-[0_12px_24px_-14px_rgba(43,38,32,0.5)] transition-opacity disabled:opacity-50"
                            style={{ backgroundColor: color, color: onColor }}>
                            {busy ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />} {busy ? 'Envoi de la demande…' : `Payer ${formatFcfa(total)}`}
                        </motion.button>
                        <p className="mt-3 text-center text-[13px] text-[#5F5E58]">
                            Une demande de paiement arrive sur votre téléphone : validez-la avec votre code {OP_LABEL[op] || 'Mobile Money'}.
                        </p>
                        <p className="mt-2 text-center text-[12px] text-[#8B8A83]">
                            Paiement protégé : la boutique n’est payée qu’une fois votre commande reçue.
                        </p>
                    </motion.form>
                </section>
            </div>

            {/* Signature */}
            <div className="pointer-events-none flex justify-center pb-6 lg:fixed lg:inset-x-0 lg:bottom-4 lg:pb-0">
                <a href={site?.app_url || '/'} target="_blank" rel="noreferrer"
                    className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/95 px-3.5 py-1.5 text-[12px] text-[#5F5E58] shadow-[0_8px_20px_-12px_rgba(20,20,10,0.35)] backdrop-blur">
                    <Lock className="h-3 w-3" /> Sécurisé par
                    <span className="flex h-4 w-4 items-center justify-center overflow-hidden rounded bg-[#FFCC00]"><img src="/images/brand/logo-noir.svg" alt="" className="h-6 w-6 max-w-none" /></span>
                    <span className="font-semibold text-[#141412]">Biolinko</span>
                </a>
            </div>

            <PaymentStatus payment={payment} primaryColor={color} primaryTextColor={onColor}
                onPaid={() => { track('Purchase', { value: total }); }}
                onRetry={() => setPayment(null)} />
        </div>
    );
}
