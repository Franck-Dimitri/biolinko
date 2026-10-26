import { useEffect, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Clock, RefreshCw, Smartphone } from 'lucide-react';
import { formatFcfa } from '@/Components/Storefront/useCart';

const POLL_MS = 3000;
const TIMEOUT_S = 120;

// Codes USSD pour retrouver une demande de paiement en attente.
const OPERATORS = {
    MTN: { label: 'MTN MoMo', ussd: '*126#', bg: '#FFCC00', fg: '#2B2620' },
    ORANGE: { label: 'Orange Money', ussd: '#150*50#', bg: '#FF7900', fg: '#FFFFFF' },
};

/**
 * Écran plein après l'envoi de la demande Mobile Money : attente guidée, succès, échec.
 * `payment` = { reference, tracking_code, amount, operator, phone, redirect_url }.
 */
export default function PaymentStatus({ payment, primaryColor, primaryTextColor, onRetry, onPaid }) {
    const [status, setStatus] = useState('PENDING'); // PENDING | SUCCESS | FAILED | TIMEOUT
    const [message, setMessage] = useState('');
    const [elapsed, setElapsed] = useState(0);
    const op = OPERATORS[payment?.operator] || OPERATORS.MTN;

    useEffect(() => {
        if (!payment) return;
        setStatus('PENDING');
        setElapsed(0);
    }, [payment?.reference]);

    useEffect(() => {
        if (!payment || status !== 'PENDING') return;
        const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
        const poll = setInterval(async () => {
            try {
                const { data } = await axios.get(route('checkout.status', payment.reference || payment.tracking_code));
                if (data.paid || data.status === 'SUCCESS') {
                    setStatus('SUCCESS');
                    onPaid?.();
                    setTimeout(() => { window.location.href = data.redirect_url || payment.redirect_url; }, 1800);
                } else if (data.status === 'FAILED') {
                    setStatus('FAILED');
                    setMessage(data.message || '');
                }
            } catch (e) { /* réseau instable : on réessaie au prochain tour */ }
        }, POLL_MS);
        return () => { clearInterval(tick); clearInterval(poll); };
    }, [payment?.reference, status]);

    useEffect(() => {
        if (status === 'PENDING' && elapsed >= TIMEOUT_S) setStatus('TIMEOUT');
    }, [elapsed, status]);

    const remaining = Math.max(0, TIMEOUT_S - elapsed);

    return (
        <AnimatePresence>
            {payment && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] flex items-end justify-center bg-[#141412]/55 backdrop-blur-sm sm:items-center sm:p-4"
                >
                    <motion.div
                        role="dialog" aria-modal="true" aria-labelledby="pay-title" aria-live="polite"
                        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full max-w-md rounded-t-xl bg-white p-6 pb-8 text-center shadow-2xl sm:rounded-xl sm:p-8"
                    >
                        {status === 'SUCCESS' && (
                            <div className="space-y-4">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#16A34A]">
                                    <Check className="h-10 w-10 text-white" />
                                </motion.div>
                                <h2 id="pay-title" className="text-xl font-bold text-[#141412]">Paiement confirmé</h2>
                                <p className="text-[#5F5E58]">Merci ! Nous ouvrons votre reçu et le suivi de commande…</p>
                            </div>
                        )}

                        {(status === 'FAILED' || status === 'TIMEOUT') && (
                            <div className="space-y-5">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                                    {status === 'FAILED' ? <AlertCircle className="h-8 w-8 text-[#B91C1C]" /> : <Clock className="h-8 w-8 text-[#5F5E58]" />}
                                </div>
                                <div className="space-y-1.5">
                                    <h2 id="pay-title" className="text-xl font-bold text-[#141412]">
                                        {status === 'FAILED' ? "Le paiement n'a pas abouti" : 'Toujours pas de confirmation'}
                                    </h2>
                                    <p className="text-[#5F5E58]">
                                        {status === 'FAILED'
                                            ? (message || 'Vérifiez votre solde ou votre code secret, puis réessayez.')
                                            : `Si vous avez déjà validé, patientez encore un peu. Sinon, composez ${op.ussd} pour retrouver la demande.`}
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    {status === 'TIMEOUT' && (
                                        <button type="button" onClick={() => { setElapsed(0); setStatus('PENDING'); }}
                                            className="flex h-12 items-center justify-center gap-2 rounded-full font-semibold"
                                            style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                                            <RefreshCw className="h-4 w-4" /> J'ai validé, vérifier à nouveau
                                        </button>
                                    )}
                                    <button type="button" onClick={onRetry}
                                        className={`flex h-12 items-center justify-center rounded-full font-semibold ${status === 'FAILED' ? '' : 'border border-black/15 text-[#141412]'}`}
                                        style={status === 'FAILED' ? { backgroundColor: primaryColor, color: primaryTextColor } : undefined}>
                                        Modifier le numéro ou réessayer
                                    </button>
                                </div>
                            </div>
                        )}

                        {status === 'PENDING' && (
                            <div className="space-y-6">
                                <div className="relative mx-auto h-24 w-24">
                                    <motion.span className="absolute inset-0 rounded-full" style={{ backgroundColor: op.bg }}
                                        animate={{ scale: [1, 1.4], opacity: [0.45, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
                                    <motion.span className="relative flex h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: op.bg }}
                                        animate={{ rotate: [0, -8, 8, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.6 }}>
                                        <Smartphone className="h-10 w-10" style={{ color: op.fg }} />
                                    </motion.span>
                                </div>

                                <div className="space-y-1.5">
                                    <h2 id="pay-title" className="text-xl font-bold text-[#141412]">Validez sur votre téléphone</h2>
                                    <p className="text-[#5F5E58]">
                                        Demande de <strong className="font-semibold text-[#141412]">{formatFcfa(payment.amount)}</strong> envoyée au <span className="whitespace-nowrap font-medium text-[#141412]">{payment.phone}</span> ({op.label}).
                                    </p>
                                </div>

                                <ol className="space-y-2.5 rounded-3xl bg-[#F6F5F1] p-4 text-left text-[15px] text-[#141412]">
                                    {['Un message apparaît sur votre téléphone', 'Tapez votre code secret Mobile Money', 'Votre commande est confirmée ici automatiquement'].map((t, i) => (
                                        <li key={t} className="flex items-start gap-3">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-xl text-xs font-semibold" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>{i + 1}</span>
                                            <span>{t}</span>
                                        </li>
                                    ))}
                                </ol>

                                <div className="space-y-1 text-sm text-[#5F5E58]">
                                    <div className="flex items-center justify-center gap-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" /> En attente de confirmation · {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
                                    </div>
                                    <p>Pas de message ? Composez <strong className="font-semibold text-[#141412]">{op.ussd}</strong></p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
