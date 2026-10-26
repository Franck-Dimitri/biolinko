import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, ChevronDown, Lock, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { EASE_OUT } from '@/Components/Motion';
import { formatFcfa } from '@/Components/Storefront/useCart';
import { contrastColor } from '@/Components/Storefront/theme';
import PaymentStatus from '@/Components/Storefront/Checkout/PaymentStatus';
import { track } from '@/Components/Storefront/pixels';

const CUSTOMER_KEY = 'biolinko_cust_info';
const CITIES = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Kribi'];

const OPERATORS = [
    { id: 'MTN', label: 'MTN MoMo', short: 'MTN', bg: '#FFCC00', fg: '#2B2620' },
    { id: 'ORANGE', label: 'Orange Money', short: 'OM', bg: '#FF7900', fg: '#FFFFFF' },
];

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

const fieldClass = 'h-12 w-full rounded-full border border-black/[0.08] bg-white px-3.5 text-[16px] text-[#141412] placeholder:text-[#5F5E58]/60 focus:border-black/40 focus:ring-0';
const labelClass = 'mb-1.5 block text-sm font-medium text-[#141412]';

function Step({ n, title, sub, done, primaryColor, primaryTextColor, children, delay = 0 }) {
    return (
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE_OUT, delay }}
            className="space-y-5 rounded-3xl border border-black/[0.08] bg-white p-5 sm:p-6">
            <header className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
                    style={done ? { backgroundColor: '#16A34A', color: '#fff' } : { backgroundColor: primaryColor, color: primaryTextColor }}>
                    {done ? <Check className="h-4 w-4" /> : n}
                </span>
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-[#141412]">{title}</h2>
                    {sub && <p className="text-sm text-[#5F5E58]">{sub}</p>}
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
export default function CheckoutForm({ store, total, payload, endpoint = route('checkout.process'), summary, onPaid, disabled = false }) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = contrastColor(primaryColor);

    const [form, setForm] = useState({
        customer_phone: '', customer_name: '', customer_email: '',
        delivery_city: 'Douala', delivery_address: '', notes: '', operator: 'MTN',
    });
    const [operatorTouched, setOperatorTouched] = useState(false);
    const [otherCity, setOtherCity] = useState(false);
    const [showExtras, setShowExtras] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [welcome, setWelcome] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [payment, setPayment] = useState(null);
    const lookedUp = useRef('');

    useEffect(() => {
        const saved = readSaved();
        if (saved.customer_phone) {
            setForm((f) => ({
                ...f,
                ...Object.fromEntries(Object.entries(saved).filter(([k, v]) => k in f && v)),
                customer_phone: formatLocalPhone(saved.customer_phone),
                operator: detectOperator(saved.customer_phone) || f.operator,
            }));
            if (saved.delivery_city && !CITIES.includes(saved.delivery_city)) setOtherCity(true);
            if (saved.customer_name) setWelcome(saved.customer_name.split(' ')[0]);
        }
    }, []);

    const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
    const digits = form.customer_phone.replace(/\D/g, '');
    const phoneOk = digits.length === 9;
    const detailsOk = form.customer_name.trim().length > 1 && form.delivery_address.trim().length > 2 && form.delivery_city.trim();

    // Client qui a déjà commandé dans cette boutique : on pré-remplit son nom et son adresse.
    useEffect(() => {
        if (!phoneOk || lookedUp.current === digits) return;
        lookedUp.current = digits;
        axios.get(route('checkout.lookupCustomer'), { params: { phone: `237${digits}`, store_id: store?.id } })
            .then(({ data }) => {
                if (!data.found) return;
                const c = data.customer;
                setForm((f) => ({
                    ...f,
                    customer_name: f.customer_name || c.name || '',
                    customer_email: f.customer_email || c.email || '',
                    delivery_address: f.delivery_address || c.delivery_address || '',
                    delivery_city: c.city && c.city !== c.delivery_address ? c.city : f.delivery_city,
                }));
                if (c.city && c.city !== c.delivery_address && !CITIES.includes(c.city)) setOtherCity(true);
                if (c.name) setWelcome(c.name.split(' ')[0]);
            })
            .catch(() => {});
    }, [digits, phoneOk]);

    const onPhone = (value) => {
        const formatted = formatLocalPhone(value);
        setForm((f) => ({ ...f, customer_phone: formatted, operator: operatorTouched ? f.operator : (detectOperator(formatted) || f.operator) }));
    };

    const submit = async (e) => {
        e.preventDefault();
        if (submitting || disabled) return;
        if (!phoneOk) return setError('Entrez un numéro Mobile Money camerounais à 9 chiffres.');
        if (!detailsOk) return setError('Indiquez votre nom, votre ville et votre quartier pour la livraison.');

        setError('');
        setSubmitting(true);
        try {
            localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ ...form, notes: '', customer_phone: digits }));
        } catch (err) { /* stockage indisponible */ }

        track('InitiateCheckout', { value: total });

        try {
            const { data } = await axios.post(endpoint, {
                store_id: store.id,
                ...form,
                customer_phone: `237${digits}`,
                customer_whatsapp: `+237${digits}`,
                ...payload,
            });
            if (data.reference || data.tracking_code) {
                setPayment({
                    reference: data.reference || data.tracking_code,
                    tracking_code: data.tracking_code,
                    redirect_url: data.redirect_url,
                    amount: data.amount || total,
                    operator: data.operator || form.operator,
                    phone: `+237 ${form.customer_phone}`,
                });
            } else if (data.redirect_url) {
                onPaid?.();
                window.location.href = data.redirect_url;
            }
        } catch (err) {
            const res = err.response?.data;
            setError(res?.error || res?.message || Object.values(res?.errors || {})[0]?.[0] || 'La demande de paiement a échoué. Vérifiez votre connexion et réessayez.');
        } finally {
            setSubmitting(false);
        }
    };

    const payLabel = submitting ? 'Envoi de la demande…' : `Payer ${formatFcfa(total)}`;
    const operator = OPERATORS.find((o) => o.id === form.operator) || OPERATORS[0];

    return (
        <>
            <form onSubmit={submit} noValidate className="grid items-start gap-6 pb-28 lg:grid-cols-12 lg:gap-8 lg:pb-0">
                {summary && (
                    <div className="lg:order-2 lg:col-span-5 lg:sticky lg:top-24">
                        {/* Mobile : récapitulatif replié pour garder le formulaire en vue */}
                        <button type="button" onClick={() => setShowSummary((v) => !v)} aria-expanded={showSummary}
                            className="flex w-full items-center justify-between rounded-3xl border border-black/[0.08] bg-[#F6F5F1] px-4 py-3.5 text-[15px] text-[#141412] lg:hidden">
                            <span className="flex items-center gap-2 font-medium">
                                <ChevronDown className={`h-4 w-4 transition-transform ${showSummary ? 'rotate-180' : ''}`} />
                                {showSummary ? 'Masquer le récapitulatif' : 'Voir le récapitulatif'}
                            </span>
                            <span className="font-bold tabular-nums">{formatFcfa(total)}</span>
                        </button>
                        <AnimatePresence initial={false}>
                            {showSummary && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-3 lg:hidden">
                                    {summary}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="hidden lg:block">{summary}</div>
                    </div>
                )}

                <div className="space-y-5 lg:order-1 lg:col-span-7">
                    <AnimatePresence>
                        {welcome && (
                            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-2 rounded-xl bg-[#FFF8D6] px-4 py-3 text-[15px] text-[#141412]">
                                <Sparkles className="h-4 w-4 shrink-0" /> Content de vous revoir, {welcome} ! Vos informations sont pré-remplies.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Step n={1} title="Votre numéro Mobile Money" sub="Vous recevrez la demande de paiement sur ce numéro" done={phoneOk} primaryColor={primaryColor} primaryTextColor={primaryTextColor}>
                        <div>
                            <label htmlFor="co-phone" className="sr-only">Numéro Mobile Money</label>
                            <div className="flex gap-2">
                                <span className="flex h-14 items-center rounded-full border border-black/[0.08] bg-[#F6F5F1] px-3.5 text-[17px] text-[#5F5E58]">+237</span>
                                <input id="co-phone" type="tel" inputMode="numeric" autoComplete="tel-national" required autoFocus={!form.customer_phone}
                                    placeholder="6XX XX XX XX" value={form.customer_phone} onChange={(e) => onPhone(e.target.value)}
                                    className={`${fieldClass} h-14 text-[19px] tracking-wide`} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Opérateur Mobile Money">
                            {OPERATORS.map((op) => {
                                const on = form.operator === op.id;
                                return (
                                    <motion.button key={op.id} type="button" role="radio" aria-checked={on} whileTap={{ scale: 0.98 }}
                                        onClick={() => { set('operator', op.id); setOperatorTouched(true); }}
                                        className={`relative flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${on ? 'border-black/70 bg-[#F6F5F1]' : 'border-black/[0.08] hover:border-black/25'}`}>
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold" style={{ backgroundColor: op.bg, color: op.fg }}>{op.short}</span>
                                        <span className="min-w-0 text-[15px] font-medium leading-tight text-[#141412]">{op.label}</span>
                                        {on && <motion.span layoutId="op-check" className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#141412]"><Check className="h-3 w-3 text-white" /></motion.span>}
                                    </motion.button>
                                );
                            })}
                        </div>
                        {phoneOk && !operatorTouched && <p className="-mt-2 text-sm text-[#5F5E58]">{operator.label} détecté d'après votre numéro.</p>}
                    </Step>

                    <Step n={2} title="Livraison" sub="Où le vendeur doit-il vous livrer ?" done={!!detailsOk} primaryColor={primaryColor} primaryTextColor={primaryTextColor} delay={0.06}>
                        <div>
                            <label htmlFor="co-name" className={labelClass}>Nom complet</label>
                            <input id="co-name" type="text" autoComplete="name" required placeholder="Ex. Awa Mbarga" value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} className={fieldClass} />
                        </div>
                        <div>
                            <span className={labelClass}>Ville</span>
                            <div className="flex flex-wrap gap-2">
                                {CITIES.map((c) => {
                                    const on = !otherCity && form.delivery_city === c;
                                    return (
                                        <button key={c} type="button" aria-pressed={on} onClick={() => { setOtherCity(false); set('delivery_city', c); }}
                                            className={`h-10 rounded-xl border px-3.5 text-[15px] transition-colors ${on ? 'border-transparent font-semibold' : 'border-black/[0.08] text-[#141412] hover:border-black/30'}`}
                                            style={on ? { backgroundColor: primaryColor, color: primaryTextColor } : undefined}>
                                            {c}
                                        </button>
                                    );
                                })}
                                <button type="button" aria-pressed={otherCity} onClick={() => { setOtherCity(true); set('delivery_city', ''); }}
                                    className={`h-10 rounded-xl border px-3.5 text-[15px] transition-colors ${otherCity ? 'border-black/60 bg-[#F6F5F1] font-semibold text-[#141412]' : 'border-black/[0.08] text-[#141412] hover:border-black/30'}`}>
                                    Autre ville
                                </button>
                            </div>
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
                                    <label htmlFor="co-email" className={labelClass}>E-mail <span className="font-normal text-[#5F5E58]">(pour le reçu)</span></label>
                                    <input id="co-email" type="email" autoComplete="email" placeholder="vous@exemple.com" value={form.customer_email} onChange={(e) => set('customer_email', e.target.value)} className={fieldClass} />
                                </div>
                                <div>
                                    <label htmlFor="co-notes" className={labelClass}>Note au vendeur</label>
                                    <input id="co-notes" type="text" maxLength={500} placeholder="Ex. Appelez avant de venir" value={form.notes} onChange={(e) => set('notes', e.target.value)} className={fieldClass} />
                                </div>
                            </div>
                        ) : (
                            <button type="button" onClick={() => setShowExtras(true)} className="text-[15px] font-medium text-[#141412] underline underline-offset-4">
                                + Ajouter un e-mail ou une note au vendeur
                            </button>
                        )}
                    </Step>

                    <AnimatePresence>
                        {error && (
                            <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert"
                                className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-[15px] text-[#B91C1C]">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Paiement : barre collée en bas sur mobile, bouton dans le flux sur ordinateur */}
                    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.08] bg-white/95 p-4 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
                        <motion.button type="submit" disabled={submitting || disabled} whileTap={{ scale: 0.98 }}
                            className="flex h-14 w-full items-center justify-center gap-2 rounded-full text-[17px] font-semibold shadow-[0_12px_24px_-14px_rgba(43,38,32,0.5)] disabled:opacity-60"
                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                            {submitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />} {payLabel}
                        </motion.button>
                        <p className="mt-2 flex items-center justify-center gap-1.5 text-[13px] text-[#5F5E58]">
                            <ShieldCheck className="h-4 w-4 text-[#16A34A]" /> Paiement sécurisé {operator.label} · Aucune carte bancaire
                        </p>
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
