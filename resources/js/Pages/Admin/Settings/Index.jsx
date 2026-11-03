import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { CheckCircle2, Clock, Loader2, RefreshCw, Send, XCircle } from 'lucide-react';
import { Badge, Button, Card, CardHeader, Field, PageHeader, Tabs, fcfa, fieldClass } from '@/Components/Dashboard/UI';

const pct = (n) => `${String(n).replace('.', ',')} %`;
const PROVIDER = { mercypay: 'Mercy Pay', pawapay: 'pawaPay', hrskills: 'HR-Skills Pay' };
const TEMPLATE_TONE = { APPROVED: ['Approuvé', 'success'], PENDING: ['En examen', 'warning'], REJECTED: ['Refusé', 'danger'], PAUSED: ['En pause', 'warning'], DISABLED: ['Désactivé', 'danger'] };

// Ligne « libellé : valeur », avec un voyant vert / rouge pour les éléments à configurer
function Row({ label, children, ok }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3 text-[14px]">
            <span className="text-[#5F5E58]">{label}</span>
            <span className="flex items-center gap-2 text-right text-[#141412]">
                {ok !== undefined && (ok ? <CheckCircle2 className="h-4 w-4 text-[#16A34A]" /> : <XCircle className="h-4 w-4 text-[#B91C1C]" />)}
                {children}
            </span>
        </div>
    );
}

function Payments({ p }) {
    return (
        <div className="grid items-start gap-4 xl:grid-cols-2">
            <Card>
                <CardHeader title="Agrégateur" sub="Se règle dans le fichier .env (PAYMENT_DRIVER)." />
                <div className="mt-2 divide-y divide-black/[0.05]">
                    <Row label="Encaissements">{PROVIDER[p.driver] || p.driver}</Row>
                    <Row label="Virements aux vendeurs">{PROVIDER[p.payout_driver] || p.payout_driver}</Row>
                    <Row label="Mercy Pay" ok={p.mercypay_configured}>{p.mercypay_configured ? (p.mercypay_live ? 'Live' : 'Sandbox (test)') : 'Non configuré'}</Row>
                    <Row label="Signature des notifications Mercy Pay" ok={p.mercypay_webhook_secret}>{p.mercypay_webhook_secret ? 'Active' : 'Secret manquant'}</Row>
                    <Row label="pawaPay" ok={p.pawapay_configured}>{p.pawapay_configured ? (p.pawapay_env === 'production' ? 'Production' : 'Sandbox (test)') : 'Non configuré'}</Row>
                    <Row label="HR-Skills Pay (secours)" ok={p.hrskills_configured}>{p.hrskills_configured ? 'Clés présentes' : 'Non configuré'}</Row>
                    <Row label="Signature des notifications HR-Skills" ok={p.hrskills_webhook_secret}>{p.hrskills_webhook_secret ? 'Active' : 'Secret manquant'}</Row>
                    <Row label="Abonnements">{p.subscription_simulation ? <Badge tone="warning">Paiement simulé</Badge> : <Badge tone="success">Paiement réel</Badge>}</Row>
                </div>
            </Card>
            <Card>
                <CardHeader title="Frais et commissions" sub="Se règlent dans config/payments.php." />
                <div className="mt-2 divide-y divide-black/[0.05]">
                    <Row label="Frais de service client">{pct(p.client_fee_percent)}</Row>
                    <Row label="Frais de retrait">{pct(p.withdrawal_fee_percent)} · minimum {fcfa(p.min_withdrawal)}</Row>
                    {Object.entries(p.commission_percent || {}).map(([plan, rate]) => (
                        <Row key={plan} label={`Commission ${plan.replace(/^./, (c) => c.toUpperCase())}`}>{pct(rate)}</Row>
                    ))}
                </div>
            </Card>
            <Card className="xl:col-span-2">
                <CardHeader title="Pays" sub="Seuls les pays ouverts acceptent des boutiques et des paiements." />
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {(p.countries || []).map((c) => (
                        <li key={c.code} className={`rounded-2xl border p-3 text-[14px] ${c.enabled ? 'border-[#16A34A]/40 bg-[#F0FDF4]' : 'border-black/[0.06]'}`}>
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-[#141412]">{c.name}</span>
                                <Badge tone={c.enabled ? 'success' : 'neutral'}>{c.enabled ? 'Ouvert' : 'Prêt'}</Badge>
                            </div>
                            <p className="mt-1 text-[13px] text-[#8B8A83]">{c.currency} · {c.operators.join(', ')}</p>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}

function Whatsapp({ w }) {
    const [templates, setTemplates] = useState(null);
    const [phone, setPhone] = useState('');
    const [sending, setSending] = useState(false);

    const load = () => {
        setTemplates(null);
        axios.get(route('admin.settings.whatsapp.templates')).then(({ data }) => setTemplates(data)).catch(() => setTemplates({ templates: [], error: 'Impossible de joindre Meta.' }));
    };
    useEffect(load, []);

    const test = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const { data } = await axios.post(route('admin.settings.whatsapp.test'), { phone });
            data.success ? toast.success('Message de test envoyé.') : toast.error(data.error || 'Envoi refusé.');
        } catch (err) {
            toast.error('Envoi impossible.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="grid items-start gap-4 xl:grid-cols-2">
            <Card>
                <CardHeader title="API WhatsApp officielle (Meta)" sub="Se configure dans le fichier .env (WHATSAPP_CLOUD_*)." />
                <div className="mt-2 divide-y divide-black/[0.05]">
                    <Row label="Passerelle utilisée">{w.driver === 'cloud' ? 'API officielle Meta' : 'En veille (contact en 1 clic)'}</Row>
                    <Row label="Jeton et numéro" ok={w.configured}>{w.configured ? `Numéro ${w.phone_number_id}` : 'Non configuré'}</Row>
                    <Row label="Clé secrète de l’app (webhook)" ok={w.app_secret}>{w.app_secret ? 'Présente' : 'Manquante'}</Row>
                    <Row label="Jeton de vérification" ok={w.verify_token}>{w.verify_token ? 'Présent' : 'Manquant'}</Row>
                </div>
                <p className="mt-3 break-all rounded-xl bg-[#F6F5F1] p-3 font-mono text-[12px] text-[#3D3C37]">{w.webhook_url}</p>
                <form onSubmit={test} className="mt-4 space-y-3 border-t border-black/[0.06] pt-4">
                    <Field label="Envoyer un message de test" hint="Modèle « hello_world » de Meta. Avec le numéro de test, seuls les numéros autorisés le reçoivent.">
                        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="6XX XX XX XX" className={fieldClass} />
                    </Field>
                    <Button type="submit" variant="primary" disabled={sending || !w.configured}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Envoyer</Button>
                </form>
            </Card>
            <Card>
                <CardHeader title="Modèles de message" sub="Chaque notification part avec un modèle validé par Meta."
                    action={<Button size="sm" variant="ghost" onClick={load}><RefreshCw className="h-4 w-4" /> Actualiser</Button>} />
                {!templates ? <p className="mt-4 flex items-center gap-2 text-[14px] text-[#8B8A83]"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</p>
                    : templates.error ? <p className="mt-4 text-[14px] text-[#B91C1C]">{templates.error}</p>
                        : (
                            <ul className="mt-3 divide-y divide-black/[0.05]">
                                {templates.templates.map((t) => {
                                    const [label, tone] = TEMPLATE_TONE[t.status] || [t.status, 'neutral'];
                                    return (
                                        <li key={t.name} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                                            <span><span className="block font-mono text-[13px] text-[#141412]">{t.name}</span><span className="text-[12px] text-[#8B8A83]">{t.category === 'MARKETING' ? 'Marketing' : 'Utilitaire'} · {t.language}</span></span>
                                            <Badge tone={tone}>{label}</Badge>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                <p className="mt-3 text-[12px] text-[#8B8A83]">Pour soumettre les modèles manquants : php artisan whatsapp:sync-templates</p>
            </Card>
        </div>
    );
}

function System({ s }) {
    return (
        <div className="grid items-start gap-4 xl:grid-cols-2">
            <Card>
                <CardHeader title="Application" />
                <div className="mt-2 divide-y divide-black/[0.05]">
                    <Row label="Environnement" ok={s.env === 'production'}>{s.env}</Row>
                    <Row label="Mode débogage" ok={!s.debug}>{s.debug ? 'Activé (à couper en production)' : 'Désactivé'}</Row>
                    <Row label="Adresse publique">{s.url}</Row>
                    <Row label="Envoi des e-mails">{s.mailer} · {s.mail_from}</Row>
                    <Row label="File d’attente">{s.queue}</Row>
                </div>
            </Card>
            <Card>
                <CardHeader title="Tâches automatiques" sub="Le serveur doit lancer « php artisan schedule:run » chaque minute (cron)." />
                <ul className="mt-3 divide-y divide-black/[0.05]">
                    {s.schedule.map(([cmd, when, what]) => (
                        <li key={cmd} className="py-2.5 text-[14px]">
                            <span className="flex items-center justify-between gap-3"><span className="font-mono text-[13px] text-[#141412]">{cmd}</span><span className="flex items-center gap-1.5 text-[13px] text-[#8B8A83]"><Clock className="h-3.5 w-3.5" />{when}</span></span>
                            <span className="text-[13px] text-[#5F5E58]">{what}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}

export default function Index({ payments = {}, whatsapp = {}, system = { schedule: [] } }) {
    const [tab, setTab] = useState('payments');
    return (
        <AuthenticatedLayout>
            <Head title="Paramètres, Administration Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Paramètres" sub="L’état de la configuration de la plateforme. Les réglages se font dans les fichiers du serveur, pas depuis le navigateur." />
                <Tabs id="settings" value={tab} onChange={setTab} tabs={[['payments', 'Paiements'], ['whatsapp', 'WhatsApp'], ['system', 'Système']]} />
                {tab === 'payments' && <Payments p={payments} />}
                {tab === 'whatsapp' && <Whatsapp w={whatsapp} />}
                {tab === 'system' && <System s={system} />}
            </div>
        </AuthenticatedLayout>
    );
}
