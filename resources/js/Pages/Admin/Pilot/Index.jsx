import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { MessageCircle, Rocket } from 'lucide-react';
import { Badge, Card, Empty, PageHeader, Pagination, Tabs, dateTime } from '@/Components/Dashboard/UI';

const TONE = { new: 'brand', contacted: 'info', onboarded: 'success', declined: 'neutral' };

/** Candidatures au programme pilote : qui contacter, et où en est chacun. */
export default function Index({ applications, counts = {}, statuses = {}, filter = null }) {
    const total = Object.values(counts).reduce((a, n) => a + Number(n), 0);
    const tabs = [['', 'Toutes', total], ...Object.entries(statuses).map(([k, label]) => [k, label, Number(counts[k] || 0)])];

    const setStatus = (a, status) => router.patch(route('admin.pilot.update', a.id), { status }, {
        preserveScroll: true,
        onSuccess: () => toast.success(`${a.business_name} : ${statuses[status]}`),
    });

    return (
        <AuthenticatedLayout>
            <Head title="Programme pilote, Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Programme pilote" sub="Vendeurs qui ont demandé à être accompagnés au lancement." />
                <Tabs id="pilot" tabs={tabs} value={filter || ''} onChange={(v) => router.get(route('admin.pilot.index'), v ? { status: v } : {}, { preserveState: true })} />

                {applications.data.length === 0 ? (
                    <Empty Icon={Rocket} title="Aucune candidature" text="Les inscriptions du formulaire « Programme pilote » apparaîtront ici." />
                ) : (
                    <Card padded={false}>
                        <ul className="divide-y divide-black/[0.06]">
                            {applications.data.map((a) => {
                                const wa = a.phone_whatsapp.replace(/\D/g, '');
                                return (
                                    <li key={a.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 space-y-1.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-[15px] font-medium text-[#141412]">{a.business_name}</p>
                                                <Badge tone={TONE[a.status]}>{statuses[a.status]}</Badge>
                                            </div>
                                            <p className="text-[14px] text-[#5F5E58]">{a.name} · {a.city} · {a.category}</p>
                                            <p className="text-[13px] text-[#8B8A83]">
                                                {(a.channels || []).join(', ') || 'Canaux non précisés'}
                                                {a.monthly_orders ? ` · ${a.monthly_orders} commandes / mois` : ''} · {dateTime(a.created_at)}
                                            </p>
                                            {a.message && <p className="max-w-[640px] rounded-xl bg-[#F6F5F1] px-3 py-2 text-[14px] text-[#3D3C37]">{a.message}</p>}
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center gap-2">
                                            <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Bonjour ${a.name}, c’est l’équipe Biolinko. Merci pour votre inscription au programme pilote !`)}`}
                                                target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#16A34A] px-3.5 text-[13px] font-medium text-white hover:bg-[#15803D]">
                                                <MessageCircle className="h-4 w-4" /> {a.phone_whatsapp}
                                            </a>
                                            <select value={a.status} onChange={(e) => setStatus(a, e.target.value)} aria-label="Statut"
                                                className="h-9 rounded-full border border-black/10 bg-white py-0 pl-3 pr-8 text-[13px] text-[#141412] focus:border-black/30 focus:ring-0">
                                                {Object.entries(statuses).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                                            </select>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>
                )}
                <Pagination page={applications} label="candidatures" />
            </div>
        </AuthenticatedLayout>
    );
}
