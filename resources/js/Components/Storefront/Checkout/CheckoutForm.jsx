import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, ChevronDown, Lock, RefreshCw, ShieldCheck, Sparkles, Tag, X } from 'lucide-react';
import { EASE_OUT } from '@/Components/UI/Motion';
import { earliestDate, formatFcfa, leadTimeLabel, scheduleKey, serviceFee, useServiceFeePercent } from '@/Components/Storefront/useCart';
import PaymentStatus from '@/Components/Storefront/Checkout/PaymentStatus';
import { track } from '@/Components/Storefront/pixels';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import { storeTheme } from '@/Components/Storefront/Design/theme';

const CUSTOMER_KEY = 'biolinko_cust_info';
const DEFAULT_CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Kribi'];

/**
 * Livraison selon les tarifs du vendeur (même règle que Store::deliveryFeeFor).
 * undefined = pas de tarifs (à convenir), null = ville non livrée.
 */
function deliveryFor(store, city, goods) {
    const zones = store?.delivery_zones || [];
    const other = store?.delivery_other_fee;
    if (!zones.length && (other === null || other === undefined)) return undefined;
    const zone = zones.find((z) => z.name.trim().toLowerCase() === String(city || '').trim().toLowerCase());
    const fee = zone ? Number(zone.fee) : (other === null || other === undefined ? null : Number(other));
    if (fee === null) return null;
    if (store.delivery_free_from && goods >= Number(store.delivery_free_from)) return 0;
    return fee;
}

// Libellés et logos des moyens de paiement (les opérateurs proposés viennent de config/payments.php, par pays)
const OPERATOR_INFO = {
    MTN: { label: 'MTN Mobile Money', logo: 'MTN' },
    ORANGE: { label: 'Orange Money', logo: 'ORANGE' },
    AIRTEL: { label: 'Airtel Money', logo: 'AIRTEL' },
    MOOV: { label: 'Moov Money', logo: 'MOOV' },
    VODACOM: { label: 'M-Pesa', logo: 'MPESA' },
    FREE: { label: 'Free Money', logo: null },
};

// Même règle que HrSkillsPayService::detectOperator (69, 64, 655-659 = Orange).
export function detectOperator(rawPhone) {
    const digits = String(rawPhone || '').replace(/\D/g, '').replace(/^237/, '');
    if (digits.length < 2) return null;
    return /^6(9|4|5[5-9])/.test(digits) ? 'ORANGE' : 'MTN';
}

function formatLocalPhone(raw) {
    const d = String(raw || '').replace(/\D/g, '').replace(/^237/, '').slice(0, 9);
    return d.replace(/^(\d{3})(\d{0,2})(\d{0,2})(\d{0,2}).*/, (_, a, b, c, e) => [a, b, c, e].filter(Boolean).join(' '));
}

function readSaved() {
    try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || '{}') || {}; } catch (e) { return {}; }
}

const fieldClass = 'h-10 w-full rounded-full border border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:var(--bg,#FFFFFF)] px-3.5 text-sm text-[color:var(--ink,#141412)] placeholder:text-[color:var(--mu,#5F5E58)]/60 focus:border-[color:color-mix(in_srgb,var(--ink,#000000)_40%,transparent)] focus:ring-0';
const labelClass = 'mb-1.5 block text-sm font-medium text-[color:var(--ink,#141412)]';

function Step({ n, title, sub, done, primaryColor, primaryTextColor, children, delay = 0 }) {
    return (
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE_OUT, delay }}
            className="space-y-5 rounded-[var(--r,16px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:var(--bg,#FFFFFF)] p-4 sm:p-5">
            <header className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[min(var(--r,12px),12px)] text-sm font-semibold"
                    style={done ? { backgroundColor: '#16A34A', color: '#fff' } : { backgroundColor: primaryColor, color: primaryTextColor }}>
                    {done ? <Check className="h-4 w-4" /> : n}
                </span>
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-[color:var(--ink,#141412)]">{title}</h2>
                    {sub && <p className="text-sm text-[color:var(--mu,#5F5E58)]">{sub}</p>}
                </div>
            </header>
            {children}
        </motion.section>
    );
}

/**
 * Tunnel d'achat unique (panier, achat direct, pack SmartLink).
 * `payload` = champs propres à la commande (items, smart_link_code…), `endpoint` = route POST.
 * `summary` = récapitulatif affiché à droite (ou au-dessus sur mobile).
 */
const SLOTS = [['', 'Indifférent'], ['matin', 'Matin (8 h - 12 h)'], ['midi', 'Midi (12 h - 14 h)'], ['apres-midi', 'Après-midi (14 h - 18 h)'], ['soir', 'Soir (18 h - 21 h)']];

/**
 * `schedule` (produits sur commande) : { minHours, label } → le client choisit une date et un créneau.
 */
export default function CheckoutForm({ store, subtotal = 0, payload, endpoint = route('checkout.process'), summary, onPaid, disabled = false, allowPromo = true, schedule = null }) {
    const { primary: primaryColor, onPrimary: primaryTextColor } = storeTheme(store);
    const zones = store?.delivery_zones || [];
    const hasZones = zones.length > 0;
    const othersDelivered = !hasZones || (store?.delivery_other_fee !== null && store?.delivery_other_fee !== undefined);
    const CITIES = hasZones ? zones.map((z) => z.name) : DEFAULT_CITIES;

    const operators = (usePage().props.payments?.operators?.[store?.country || 'CM'] || ['MTN', 'ORANGE']).filter((o) => OPERATOR_INFO[o]);
    const [form, setForm] = useState({
        customer_phone: '', customer_name: '', customer_email: '',
        delivery_city: hasZones ? zones[0].name : 'Douala', delivery_address: '', notes: '', operator: '',
    });
    const [operatorTouched, setOperatorTouched] = useState(false);
    const minDate = schedule ? earliestDate(schedule.minHours) : null;
    // Date et moment déjà choisis sur la vitrine (accueil « Créneaux ») : repris ici
    const chosen = (() => {
        try { return JSON.parse(localStorage.getItem(scheduleKey(store?.id)) || 'null') || {}; } catch (e) { return {}; }
    })();
    const [desiredDate, setDesiredDate] = useState(schedule && chosen.date && chosen.date >= earliestDate(schedule.minHours) ? chosen.date : '');
    const [desiredSlot, setDesiredSlot] = useState(schedule && chosen.slot ? chosen.slot : '');
    // Panier de la semaine (alimentation) : la même commande revient chaque semaine, payée à chaque fois
    const [recurring, setRecurring] = useState(false);
    const canRecur = store?.business_type === 'alimentation' && !payload?.smart_link_code;
    // WhatsApp du client (contact du vendeur) ; le numéro à débiter est le même par défaut
    const [whatsapp, setWhatsapp] = useState('');
    const [samePhone, setSamePhone] = useState(true);
    const [otherCity, setOtherCity] = useState(false);
    const [showExtras, setShowExtras] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [welcome, setWelcome] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [payment, setPayment] = useState(null);
    const lookedUp = useRef('');
    const [promoInput, setPromoInput] = useState('');
    const [promo, setPromo] = useState(null);
    const [promoOpen, setPromoOpen] = useState(false);
    const [promoError, setPromoError] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);

    const applyPromo = async (code = promoInput) => {
        if (!code.trim()) return;
        setPromoLoading(true);
        setPromoError('');
        try {
            const { data } = await axios.post(route('checkout.promo'), { store_id: store.id, code, subtotal });
            if (data.valid) { setPromo({ code: data.code, discount: data.discount, label: data.label }); setPromoInput(''); }
            else { setPromo(null); setPromoError(data.message); }
        } catch (err) {
            setPromoError('Impossible de vérifier le code. Réessayez.');
        } finally {
            setPromoLoading(false);
        }
    };
    // Le panier change : la remise est recalculée sur le nouveau montant
    useEffect(() => { if (promo) applyPromo(promo.code); }, [subtotal]);

    const feePercent = useServiceFeePercent();
    const discount = promo?.discount || 0;
    const delivery = deliveryFor(store, form.delivery_city, subtotal - discount);
    const vendorAmount = subtotal - discount + (delivery || 0);
    // Acompte proposé par le vendeur (même calcul que Order::depositFor)
    const depositPercent = Number(store?.deposit_percent) || 0;
    const [payMode, setPayMode] = useState('full');
    const minOnline = usePage().props.payments?.min_order?.[store?.country || 'CM'] ?? 1000;
    const depositAmount = depositPercent ? Math.min(vendorAmount, Math.max(Math.ceil(vendorAmount * depositPercent / 100), minOnline)) : vendorAmount;
    const useDeposit = payMode === 'deposit' && depositAmount < vendorAmount;
    const onlineAmount = useDeposit ? depositAmount : vendorAmount;
    const balance = vendorAmount - onlineAmount;
    const fee = serviceFee(onlineAmount, feePercent);
    const total = onlineAmount + fee;
    const notDelivered = delivery === null && form.delivery_city.trim().length > 1;

    useEffect(() => {
        const saved = readSaved();
        if (saved.customer_phone) {
            setForm((f) => ({
                ...f,
                ...Object.fromEntries(Object.entries(saved).filter(([k, v]) => k in f && v)),
                customer_phone: formatLocalPhone(saved.customer_phone),
                operator: detectOperator(saved.customer_phone) || f.operator,
            }));
            const wa = formatLocalPhone(saved.customer_whatsapp || saved.customer_phone);
            setWhatsapp(wa);
            if (saved.customer_whatsapp && saved.customer_whatsapp.replace(/\D/g, '') !== saved.customer_phone.replace(/\D/g, '')) setSamePhone(false);
            if (saved.delivery_city && !CITIES.includes(saved.delivery_city)) {
                if (othersDelivered) setOtherCity(true); else saved.delivery_city = CITIES[0];
            }
            if (saved.customer_name) setWelcome(saved.customer_name.split(' ')[0]);
        }
    }, []);

    const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
    const waDigits = whatsapp.replace(/\D/g, '');
    const whatsappOk = waDigits.length === 9;
    // Numéro débité : celui du WhatsApp, sauf si le client en indique un autre
    const digits = samePhone ? waDigits : form.customer_phone.replace(/\D/g, '');
    const phoneOk = digits.length === 9;
    const contactOk = form.customer_name.trim().length > 1 && whatsappOk;
    const paymentOk = phoneOk && !!form.operator;
    const detailsOk = form.customer_name.trim().length > 1 && form.delivery_address.trim().length > 2 && form.delivery_city.trim()
        && (!schedule || (desiredDate && desiredDate >= minDate));

    // Client qui a déjà commandé dans cette boutique : on pré-remplit son nom et son adresse.
    useEffect(() => {
        if (!whatsappOk || lookedUp.current === waDigits) return;
        lookedUp.current = waDigits;
        axios.get(route('checkout.lookupCustomer'), { params: { phone: `237${waDigits}`, store_id: store?.id } })
            .then(({ data }) => {
                if (!data.found) return;
                const c = data.customer;
                setForm((f) => ({
                    ...f,
                    customer_name: f.customer_name || c.name || '',
                    customer_email: f.customer_email || c.email || '',
                    delivery_address: f.delivery_address || c.delivery_address || '',
                    delivery_city: c.city && c.city !== c.delivery_address && (othersDelivered || CITIES.includes(c.city)) ? c.city : f.delivery_city,
                }));
                if (othersDelivered && c.city && c.city !== c.delivery_address && !CITIES.includes(c.city)) setOtherCity(true);
                if (c.name) setWelcome(c.name.split(' ')[0]);
            })
            .catch(() => {});
    }, [waDigits, whatsappOk]);

    // L'opérateur est proposé d'après le numéro débité, tant que le client ne l'a pas choisi lui-même
    useEffect(() => {
        if (operatorTouched || !phoneOk) return;
        const guess = detectOperator(digits);
        if (guess && operators.includes(guess)) setForm((f) => ({ ...f, operator: guess }));
    }, [digits, phoneOk, operatorTouched]);

    const onPhone = (value) => set('customer_phone', formatLocalPhone(value));

    const submit = async (e) => {
        e.preventDefault();
        if (submitting || disabled || belowMin || notDelivered) return;
        if (!contactOk) return setError('Indiquez votre nom et votre numéro WhatsApp à 9 chiffres : le vendeur vous y contacte pour la livraison.');
        if (!detailsOk) return setError('Indiquez votre ville et votre quartier pour la livraison.');

        setError('');
        setSubmitting(true);
        try {
            localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ ...form, notes: '', customer_phone: digits, customer_whatsapp: waDigits }));
        } catch (err) { /* stockage indisponible */ }

        track('InitiateCheckout', { value: total });

        try {
            const { data } = await axios.post(endpoint, {
                store_id: store.id,
                ...form,
                // Le numéro à débiter et l'opérateur se choisissent sur la page de paiement (WhatsApp par défaut)
                customer_phone: `237${waDigits}`,
                customer_whatsapp: `237${waDigits}`,
                operator: null,
                defer_payment: true,
                promo_code: promo?.code || null,
                payment_mode: useDeposit ? 'deposit' : 'full',
                ...(schedule ? { desired_date: desiredDate || null, desired_slot: desiredSlot || null } : {}),
                ...(canRecur && recurring ? { recurring: true } : {}),
                ...payload,
            });
            // Commande créée : le client paie sur la page de paiement Biolinko
            if (data.payment_url) { onPaid?.(); window.location.href = data.payment_url; return; }
            if (data.checkout_url) { onPaid?.(); window.location.href = data.checkout_url; return; }
            if (data.reference || data.tracking_code) {
                setPayment({
                    reference: data.reference || data.tracking_code,
                    tracking_code: data.tracking_code,
                    redirect_url: data.redirect_url,
                    amount: data.amount || total,
                    operator: data.operator || form.operator,
                    phone: `+237 ${formatLocalPhone(digits)}`,
                });
            } else if (data.redirect_url) {
                onPaid?.();
                window.location.href = data.redirect_url;
            }
        } catch (err) {
            const res = err.response?.data;
            if (res?.errors?.promo_code) { setPromo(null); setPromoError(res.errors.promo_code[0]); }
            setError(res?.error || res?.message || Object.values(res?.errors || {})[0]?.[0] || 'La demande de paiement a échoué. Vérifiez votre connexion et réessayez.');
        } finally {
            setSubmitting(false);
        }
    };

    // Minimum de commande (articles remisés + livraison, hors frais) : en dessous, le paiement en ligne est refusé
    const minOrder = usePage().props.payments?.min_order?.[store?.country || 'CM'] ?? 1000;
    // Minimum de la boutique (articles, hors livraison) ou minimum d'un paiement
    const storeMin = Number(store?.min_order_amount) || 0;
    const belowStoreMin = storeMin > 0 && subtotal < storeMin;
    const belowMin = vendorAmount < minOrder || belowStoreMin;
    const summaryNode = typeof summary === 'function' ? summary({ fee, total, promo, delivery: delivery ?? undefined, balance }) : summary;
    // Sous le minimum, on déplie le récapitulatif (replié sur téléphone) pour que la quantité soit modifiable
    useEffect(() => { if (belowMin) setShowSummary(true); }, [belowMin]);
    const hosted = Boolean(usePage().props.payments?.hosted_checkout);
    const payLabel = submitting ? 'Préparation du paiement…' : `Continuer vers le paiement · ${formatFcfa(total)}`;
    const operatorLabel = OPERATOR_INFO[form.operator]?.label;

    return (
        <>
            <form onSubmit={submit} noValidate className="grid items-start gap-6 pb-28 lg:grid-cols-12 lg:gap-6 lg:pb-0">
                {summary && (
                    <div className="lg:order-2 lg:col-span-5 lg:sticky lg:top-24">
                        {/* Mobile : récapitulatif replié pour garder le formulaire en vue */}
                        <button type="button" onClick={() => setShowSummary((v) => !v)} aria-expanded={showSummary}
                            className="flex w-full items-center justify-between rounded-[var(--r,16px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:var(--sf,#F6F5F1)] px-4 py-3.5 text-sm text-[color:var(--ink,#141412)] lg:hidden">
                            <span className="flex items-center gap-2 font-medium">
                                <ChevronDown className={`h-4 w-4 transition-transform ${showSummary ? 'rotate-180' : ''}`} />
                                {showSummary ? 'Masquer le récapitulatif' : 'Voir le récapitulatif'}
                            </span>
                            <span className="font-bold tabular-nums">{formatFcfa(total)}</span>
                        </button>
                        <AnimatePresence initial={false}>
                            {showSummary && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-3 lg:hidden">
                                    {summaryNode}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="hidden lg:block">{summaryNode}</div>
                    </div>
                )}

                <div className="space-y-5 lg:order-1 lg:col-span-7">
                    <AnimatePresence>
                        {welcome && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-2 rounded-[min(var(--r,12px),12px)] bg-[#FFF8D6] px-4 py-3 text-sm text-[color:var(--ink,#141412)]">
                                <Sparkles className="h-4 w-4 shrink-0" /> Content de vous revoir, {welcome} ! Vos informations sont pré-remplies.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Step n={1} title="Vos coordonnées" sub="Le vendeur vous contacte sur WhatsApp pour la livraison" done={contactOk} primaryColor={primaryColor} primaryTextColor={primaryTextColor}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="co-name" className={labelClass}>Nom complet</label>
                                <input id="co-name" type="text" autoComplete="name" required autoFocus={!form.customer_name} placeholder="Ex. Awa Mbarga" value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} className={fieldClass} />
                            </div>
                            <div>
                                <label htmlFor="co-whatsapp" className={labelClass}>Numéro WhatsApp</label>
                                <div className="flex gap-2">
                                    <span className="flex h-10 items-center rounded-[var(--rb,9999px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:var(--sf,#F6F5F1)] px-3.5 text-sm text-[color:var(--mu,#5F5E58)]">+237</span>
                                    <input id="co-whatsapp" type="tel" inputMode="numeric" autoComplete="tel-national" required placeholder="6XX XX XX XX" value={whatsapp}
                                        onChange={(e) => setWhatsapp(formatLocalPhone(e.target.value))} className={`${fieldClass} tracking-wide`} />
                                </div>
                            </div>
                        </div>
                    </Step>

                    <Step n={2} title="Livraison" sub={schedule ? 'Quand et où le vendeur doit-il vous livrer ?' : 'Où le vendeur doit-il vous livrer ?'} done={!!detailsOk} primaryColor={primaryColor} primaryTextColor={primaryTextColor} delay={0.06}>
                        {schedule && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="co-date" className={labelClass}>{schedule.label}</label>
                                    <input id="co-date" type="date" required min={minDate} value={desiredDate} onChange={(e) => setDesiredDate(e.target.value)} className={fieldClass} />
                                    <p className="mt-1.5 text-[13px] text-[color:var(--mu,#5F5E58)]">
                                        {schedule.minHours > 0 ? `Préparé sur commande : délai de ${leadTimeLabel(schedule.minHours)} minimum.` : 'Préparé sur commande.'}
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="co-slot" className={labelClass}>Créneau</label>
                                    <select id="co-slot" value={desiredSlot} onChange={(e) => setDesiredSlot(e.target.value)} className={fieldClass}>
                                        {SLOTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                        <div>
                            <span className={labelClass}>Ville</span>
                            <div className="flex flex-wrap gap-2">
                                {CITIES.map((c) => {
                                    const on = !otherCity && form.delivery_city === c;
                                    return (
                                        <button key={c} type="button" aria-pressed={on} onClick={() => { setOtherCity(false); set('delivery_city', c); }}
                                            className={`h-10 rounded-[min(var(--r,12px),12px)] border px-3.5 text-sm transition-colors ${on ? 'border-transparent font-semibold' : 'border-[color:var(--ln,rgba(0,0,0,0.08))] text-[color:var(--ink,#141412)] hover:border-[color:color-mix(in_srgb,var(--ink,#000000)_30%,transparent)]'}`}
                                            style={on ? { backgroundColor: primaryColor, color: primaryTextColor } : undefined}>
                                            {c}
                                            {hasZones && (() => { const f = deliveryFor(store, c, subtotal - discount); return <span className="ml-1.5 text-[13px] font-normal opacity-75">{f > 0 ? `+${Number(f).toLocaleString('fr-FR')} F` : 'gratuit'}</span>; })()}
                                        </button>
                                    );
                                })}
                                {othersDelivered && <button type="button" aria-pressed={otherCity} onClick={() => { setOtherCity(true); set('delivery_city', ''); }}
                                    className={`h-10 rounded-[min(var(--r,12px),12px)] border px-3.5 text-sm transition-colors ${otherCity ? 'border-[color:color-mix(in_srgb,var(--ink,#000000)_60%,transparent)] bg-[color:var(--sf,#F6F5F1)] font-semibold text-[color:var(--ink,#141412)]' : 'border-[color:var(--ln,rgba(0,0,0,0.08))] text-[color:var(--ink,#141412)] hover:border-[color:color-mix(in_srgb,var(--ink,#000000)_30%,transparent)]'}`}>
                                    Autre ville
                                    {hasZones && <span className="ml-1.5 text-[13px] font-normal opacity-75">{Number(store.delivery_other_fee) > 0 ? `+${Number(store.delivery_other_fee).toLocaleString('fr-FR')} F` : 'gratuit'}</span>}
                                </button>}
                            </div>
                            {store?.delivery_free_from > 0 && (
                                <p className="mt-2 text-[14px] text-[#15803D]">Livraison offerte dès {formatFcfa(store.delivery_free_from)} d’achat.</p>
                            )}
                            {otherCity && (
                                <input type="text" aria-label="Votre ville" autoFocus placeholder="Ex. Limbé" value={form.delivery_city} onChange={(e) => set('delivery_city', e.target.value)} className={`${fieldClass} mt-3`} />
                            )}
                        </div>
                        <div>
                            <label htmlFor="co-addr" className={labelClass}>Quartier et point de repère</label>
                            <input id="co-addr" type="text" autoComplete="street-address" required placeholder="Ex. Bonamoussadi, près de la pharmacie" value={form.delivery_address} onChange={(e) => set('delivery_address', e.target.value)} className={fieldClass} />
                        </div>

                        {showExtras ? (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="co-email" className={labelClass}>E-mail <span className="font-normal text-[color:var(--mu,#5F5E58)]">(pour le reçu)</span></label>
                                    <input id="co-email" type="email" autoComplete="email" placeholder="vous@exemple.com" value={form.customer_email} onChange={(e) => set('customer_email', e.target.value)} className={fieldClass} />
                                </div>
                                <div>
                                    <label htmlFor="co-notes" className={labelClass}>Note au vendeur</label>
                                    <input id="co-notes" type="text" maxLength={500} placeholder="Ex. Appelez avant de venir" value={form.notes} onChange={(e) => set('notes', e.target.value)} className={fieldClass} />
                                </div>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setShowExtras(true)} className="text-sm font-medium text-[color:var(--ink,#141412)] underline underline-offset-4">
                                + Ajouter un e-mail ou une note au vendeur
                            </button>
                        )}
                    </Step>

                    {depositPercent > 0 && depositAmount < vendorAmount && (
                    <Step n={3} title="Montant à payer" sub="Tout maintenant, ou un acompte" done primaryColor={primaryColor} primaryTextColor={primaryTextColor} delay={0.12}>
                        {depositPercent > 0 && depositAmount < vendorAmount && (
                            <div className="space-y-2.5" role="radiogroup" aria-label="Montant à payer">
                                <span className={labelClass}>Montant à payer maintenant</span>
                                {[
                                    ['full', 'Tout payer maintenant', `${formatFcfa(vendorAmount + serviceFee(vendorAmount, feePercent))} en Mobile Money`],
                                    ['deposit', `Acompte de ${depositPercent} %, le reste à la livraison`, `${formatFcfa(depositAmount + serviceFee(depositAmount, feePercent))} maintenant, puis ${formatFcfa(vendorAmount - depositAmount)} en espèces au livreur`],
                                ].map(([key, label, sub]) => {
                                    const on = payMode === key;
                                    return (
                                        <button key={key} type="button" role="radio" aria-checked={on} onClick={() => setPayMode(key)}
                                            className={`flex w-full items-start gap-3 rounded-[min(var(--r,12px),12px)] border-2 p-3.5 text-left transition-colors ${on ? 'border-[color:color-mix(in_srgb,var(--ink,#000000)_70%,transparent)] bg-[color:var(--sf,#F6F5F1)]' : 'border-[color:var(--ln,rgba(0,0,0,0.08))] hover:border-[color:color-mix(in_srgb,var(--ink,#000000)_25%,transparent)]'}`}>
                                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${on ? 'border-[color:var(--ink,#141412)]' : 'border-[color:color-mix(in_srgb,var(--ink,#000000)_25%,transparent)]'}`}>{on && <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--ink,#141412)]" />}</span>
                                            <span className="min-w-0"><span className="block text-sm font-medium text-[color:var(--ink,#141412)]">{label}</span><span className="block text-sm text-[color:var(--mu,#5F5E58)]">{sub}</span></span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                    </Step>
                    )}

                    {allowPromo && (
                        <div className="rounded-[var(--r,16px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:var(--bg,#FFFFFF)] p-5">
                            {promo ? (
                                <div className="flex items-center justify-between gap-3">
                                    <span className="flex min-w-0 items-center gap-2 text-sm text-[#15803D]"><Tag className="h-4 w-4 shrink-0" /> Code <strong className="font-mono">{promo.code}</strong> appliqué : −{formatFcfa(promo.discount)}</span>
                                    <button type="button" onClick={() => setPromo(null)} aria-label="Retirer le code promo" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--mu,#5F5E58)] hover:bg-[color:var(--sf,#F6F5F1)]"><X className="h-4 w-4" /></button>
                                </div>
                            ) : promoOpen ? (
                                <div>
                                    <label htmlFor="co-promo" className={labelClass}>Code promo</label>
                                    <div className="flex gap-2">
                                        <input id="co-promo" type="text" autoCapitalize="characters" placeholder="Ex. NOEL10" value={promoInput}
                                            onChange={(e) => setPromoInput(e.target.value.toUpperCase().replace(/\s/g, ''))}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } }}
                                            className={`${fieldClass} font-mono uppercase`} />
                                        <button type="button" onClick={() => applyPromo()} disabled={promoLoading || !promoInput}
                                            className="h-10 shrink-0 rounded-[var(--rb,9999px)] border border-[color:var(--ln,rgba(0,0,0,0.12))] px-5 text-sm font-medium text-[color:var(--ink,#141412)] disabled:opacity-50">
                                            {promoLoading ? '…' : 'Appliquer'}
                                        </button>
                                    </div>
                                    {promoError && <p className="mt-2 text-[14px] text-[#B91C1C]">{promoError}</p>}
                                </div>
                            ) : (
                                <button type="button" onClick={() => setPromoOpen(true)} className="flex items-center gap-2 text-sm font-medium text-[color:var(--ink,#141412)] underline underline-offset-4">
                                    <Tag className="h-4 w-4" /> J’ai un code promo
                                </button>
                            )}
                        </div>
                    )}

                    <AnimatePresence>
                        {error && (
                            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert"
                                className="flex items-start gap-2 rounded-[min(var(--r,12px),12px)] bg-red-50 px-4 py-3 text-sm text-[#B91C1C]">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Paiement : barre collée en bas sur mobile, bouton dans le flux sur ordinateur */}
                    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:color-mix(in_srgb,var(--bg,#FFFFFF)_95%,transparent)] p-4 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
                        {notDelivered && (
                            <p className="mb-3 rounded-[var(--r,16px)] bg-red-50 p-3 text-center text-[14px] text-[#B91C1C]">
                                {store.name} ne livre pas à {form.delivery_city}. Choisissez une des villes proposées.
                            </p>
                        )}
                        {belowMin && (
                            <p className="mb-3 rounded-[var(--r,16px)] bg-[#FFFBEA] p-3 text-center text-[14px] text-[#7A5B00]">
                                {belowStoreMin
                                    ? <>Commande minimum chez {store.name} : {formatFcfa(storeMin)}. Ajoutez encore {formatFcfa(storeMin - subtotal)} d’articles.</>
                                    : <>Commande minimum : {formatFcfa(minOrder)}. Ajoutez encore {formatFcfa(minOrder - vendorAmount)} d’articles pour payer.</>}
                            </p>
                        )}
                        {canRecur && (
                            <label className="mb-3 flex cursor-pointer items-start gap-3 rounded-[var(--r,16px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:var(--bg,#FFFFFF)] p-3 text-[14px] text-[color:var(--ink,#141412)]">
                                <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-black/20 focus:ring-0" style={{ color: primaryColor }} />
                                <span>
                                    <span className="font-medium">Recevoir ce panier chaque semaine</span>
                                    <span className="block text-[13px] text-[color:var(--mu,#5F5E58)]">Chaque semaine, vous recevez sur WhatsApp un lien pour payer le même panier. Arrêtez quand vous voulez, depuis votre suivi de commande.</span>
                                </span>
                            </label>
                        )}
                        <motion.button type="submit" disabled={submitting || disabled || belowMin || notDelivered} whileTap={{ scale: 0.98 }}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-[var(--rb,9999px)] text-[15px] font-semibold shadow-[0_12px_24px_-14px_rgba(43,38,32,0.5)] disabled:opacity-60"
                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                            {submitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />} {payLabel}
                        </motion.button>
                        <div className="mt-3 flex gap-2.5 rounded-[var(--r,16px)] bg-[#F0FDF4] p-3 text-[13px] text-[#15803D]">
                            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                            <p><span className="font-medium">Paiement protégé par Biolinko.</span> La boutique n’est payée qu’une fois votre commande reçue. Un problème ? Signalez-le depuis votre suivi de commande.</p>
                        </div>
                    </div>
                </div>
            </form>

            <PaymentStatus
                payment={payment}
                primaryColor={primaryColor}
                primaryTextColor={primaryTextColor}
                onPaid={() => { track('Purchase', { value: payment?.amount ?? total }); onPaid?.(); }}
                onRetry={() => setPayment(null)}
            />
        </>
    );
}
