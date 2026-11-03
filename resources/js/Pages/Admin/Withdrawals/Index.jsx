import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Banknote, Check, CheckCircle2, Clock, Hand, Send, Wallet, X } from 'lucide-react';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import { Badge, Button, Card, Empty, PageHeader, Pagination, SearchInput, Stat, Tabs, dateTime, fcfa } from '@/Components/Dashboard/UI';

const STATUS = { pending: ['À traiter', 'warning'], processing: ['Virement en cours', 'info'], completed: ['Payé', 'success'], rejected: ['Rejeté, remboursé', 'danger'] };

// Une demande de retrait : montant net, destinataire, et les actions possibles tant qu'elle est en attente
function Row({ w }) {
    const [confirm, setConfirm] = useState(null); // 'transfer' | 'manual' | 'reject'
    const [busy, setBusy] = useState(false);
    const store = w.wallet?.store;
    const [label, tone] = STATUS[w.status] || STATUS.pending;
    const reviewed = (store?.reports_count || 0) >= 3;

    const act = (kind) => {
        setBusy(true);
        const url = kind === 'reject' ? route('admin.withdrawals.reject', w.id) : route('admin.withdrawals.approve', w.id);
        router.post(url, kind === 'manual' ? { manual: 1 } : {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(kind === 'reject' ? 'Retrait rejeté, le montant est rendu au vendeur.' : kind === 'manual' ? 'Retrait marqué comme payé.' : 'Virement envoyé à l’opérateur.'),
            onFinish: () => { setBusy(false); setConfirm(null); },
        });
    };

    const text = {
        transfer: `Envoyer ${fcfa(w.net_amount ?? w.amount)} par Mobile Money au ${w.phone_number} ?`,
        manual: `Vous avez déjà envoyé ${fcfa(w.net_amount ?? w.amount)} au ${w.phone_number} vous-même ?`,
        reject: `Rejeter ce retrait ? ${fcfa(w.amount)} retournent sur le solde du vendeur.`,
    };

    return (
        <li className="space-y-3 p-4">
            <div className="flex flex-wrap items-center gap-4">
                <OperatorLogo op={w.operator} className="h-10 w-10 shrink-0" />
                <div className="min-w-0 flex-1">
                    <p className="text-[15px] text-[#141412]"><span className="font-medium tabular-nums">{fcfa(w.net_amount ?? w.amount)}</span> à envoyer au <span className="tabular-nums">{w.phone_number}</span></p>
                    <p className="text-[13px] text-[#8B8A83]">
                        {store ? <Link href={route('admin.users.show', store.user?.id || 0)} className="hover:underline">{store.name}</Link> : 'Boutique'}
                        {' · '}demandé {dateTime(w.created_at)}
                        {Number(w.fee) > 0 && <> · retrait {fcfa(w.amount)}, frais {fcfa(w.fee)}</>}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {reviewed && <Badge tone="danger"><AlertTriangle className="h-3.5 w-3.5" /> Sous contrôle · {store.reports_count} signalements</Badge>}
                    <Badge tone={tone}>{label}</Badge>
                </div>
            </div>

            {w.status === 'pending' && !confirm && (
                <div className="flex flex-wrap gap-2 sm:pl-14">
                    <Button size="sm" variant="primary" onClick={() => setConfirm('manual')}><Hand className="h-4 w-4" /> Marquer payé</Button>
                    <Button size="sm" onClick={() => setConfirm('transfer')}><Send className="h-4 w-4" /> Virer automatiquement</Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirm('reject')}><X className="h-4 w-4" /> Rejeter</Button>
                </div>
            )}
            {confirm && (
                <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-[#F6F5F1] p-3 text-[14px] sm:ml-14">
                    <span className="flex-1 text-[#141412]">{text[confirm]}</span>
                    <Button size="sm" variant={confirm === 'reject' ? 'danger' : 'dark'} disabled={busy} onClick={() => act(confirm)}><Check className="h-4 w-4" /> Confirmer</Button>
                    <Button size="sm" onClick={() => setConfirm(null)}>Annuler</Button>
                </div>
            )}
            {w.status === 'processing' && <p className="text-[13px] text-[#5F5E58] sm:pl-14">En attente de la confirmation de l’opérateur, mise à jour automatique.</p>}
        </li>
    );
}

export default function Index({ withdrawals, metrics = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const first = useRef(true);
    const list = withdrawals?.data || [];

    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = setTimeout(() => router.get(route('admin.withdrawals.index'), { search, status: filters.status }, { preserveState: true, replace: true }), 350);
        return () => clearTimeout(t);
    }, [search]);

    const setStatus = (status) => router.get(route('admin.withdrawals.index'), { search, status }, { preserveState: true, replace: true });

    return (
        <AuthenticatedLayout>
            <Head title="Retraits, Administration Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Retraits" sub="Les demandes des vendeurs vers leur Mobile Money. Le montant affiché est le net à envoyer, frais déduits." />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    <Stat label="À traiter" value={metrics.pending ?? 0} hint={fcfa(metrics.total_amount_pending)} Icon={Clock} accent={(metrics.pending ?? 0) > 0} />
                    <Stat label="Virements en cours" value={metrics.processing ?? 0} Icon={Send} delay={0.03} />
                    <Stat label="Versé aux vendeurs" value={fcfa(metrics.total_amount_paid)} hint={`${metrics.completed ?? 0} retraits payés`} Icon={CheckCircle2} delay={0.06} />
                    <Stat label="Frais de retrait perçus" value={fcfa(metrics.total_fees)} Icon={Banknote} delay={0.09} />
                </div>

                <Card padded={false}>
                    <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 lg:flex-row lg:items-center lg:justify-between">
                        <Tabs id="wd-status" value={filters.status || 'all'} onChange={setStatus}
                            tabs={[['all', 'Tous'], ['pending', 'À traiter'], ['processing', 'En cours'], ['completed', 'Payés'], ['rejected', 'Rejetés']]} />
                        <SearchInput value={search} onChange={setSearch} placeholder="Boutique, numéro ou référence" className="lg:w-72" />
                    </div>
                    {list.length
                        ? <ul className="divide-y divide-black/[0.05]">{list.map((w) => <Row key={w.id} w={w} />)}</ul>
                        : <div className="p-6"><Empty Icon={Wallet} title="Aucun retrait" text="Les demandes de retrait des vendeurs apparaîtront ici." /></div>}
                    <Pagination page={withdrawals} label="retraits" />
                </Card>

                <p className="text-[13px] text-[#8B8A83]">« Marquer payé » : vous avez fait le virement vous-même depuis votre téléphone. « Virer automatiquement » : Biolinko l’envoie par l’agrégateur de paiement.</p>
            </div>
        </AuthenticatedLayout>
    );
}
