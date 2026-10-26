import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, BarChart3, FileText, Globe, Lock, Repeat, Table, Truck, Wrench } from 'lucide-react';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import { Badge, Button, PageHeader, Tabs, reveal } from '@/Components/Dashboard/UI';

const ICONS = { FileText, BadgeCheck, BarChart3, Repeat, Table, Globe, Truck };
const PLAN_LABEL = { starter: 'Starter', pro: 'Pro', growth: 'Growth', business: 'Business' };

const STATUS = {
    included: ['Inclus', 'success'],
    connected: ['Connecté', 'success'],
    available: ['À configurer', 'warning'],
    locked: ['Plan supérieur', 'neutral'],
    soon: ['Bientôt', 'neutral'],
};

function ToolCard({ tool, index }) {
    const Icon = ICONS[tool.icon] || Wrench;
    const [label, tone] = STATUS[tool.status];
    const dim = tool.status === 'soon';

    return (
        <motion.article {...reveal(Math.min(index, 8) * 0.03)}
            className={`flex flex-col rounded-3xl border bg-white p-5 ${tool.status === 'available' ? 'border-[#FFCC00]/60' : 'border-black/[0.06]'}`}>
            <div className="flex items-start justify-between gap-3">
                <span className={dim ? 'opacity-50' : ''}>
                    {tool.logo
                        ? <OperatorLogo op={tool.logo} className="h-11 w-11" />
                        : <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F6F5F1]"><Icon className="h-5 w-5 text-[#141412]" /></span>}
                </span>
                <Badge tone={tone}>{tool.status === 'locked' && <Lock className="h-3 w-3" />}{label}</Badge>
            </div>
            <h3 className={`mt-4 text-[16px] font-medium ${dim ? 'text-[#5F5E58]' : 'text-[#141412]'}`}>{tool.name}</h3>
            <p className="mt-1 flex-1 text-[14px] leading-relaxed text-[#5F5E58]">{tool.description}</p>
            <div className="mt-4 flex items-center justify-between gap-2 border-t border-black/[0.05] pt-4">
                <span className="text-[13px] text-[#8B8A83]">{tool.category} · {PLAN_LABEL[tool.plan]}{tool.plan !== 'starter' ? ' et plus' : ''}</span>
                {tool.status === 'locked' && <Button size="sm" variant="primary" href={route('seller.subscriptions.index', { plan: tool.plan })}>Débloquer</Button>}
                {tool.status === 'available' && tool.route && <Button size="sm" variant="primary" href={route(tool.route)}>Configurer</Button>}
                {['connected', 'included'].includes(tool.status) && tool.route && <Button size="sm" href={route(tool.route)}>Ouvrir</Button>}
            </div>
        </motion.article>
    );
}

export default function Index({ plan, tools = [] }) {
    const [filter, setFilter] = useState('all');
    const active = tools.filter((t) => ['included', 'connected'].includes(t.status)).length;
    const shown = tools.filter((t) => {
        if (filter === 'active') return ['included', 'connected'].includes(t.status);
        if (filter === 'available') return ['available', 'locked'].includes(t.status);
        if (filter === 'soon') return t.status === 'soon';
        return true;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Outils, Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Outils" sub={`Connectez des services à votre boutique. ${active} outil${active > 1 ? 's' : ''} actif${active > 1 ? 's' : ''} avec votre plan ${PLAN_LABEL[plan] || 'Starter'}.`} />
                <Tabs id="tools" value={filter} onChange={setFilter} tabs={[
                    ['all', 'Tous', tools.length],
                    ['active', 'Actifs', active],
                    ['available', 'À activer', tools.filter((t) => ['available', 'locked'].includes(t.status)).length],
                    ['soon', 'Bientôt', tools.filter((t) => t.status === 'soon').length],
                ]} />
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {shown.map((t, i) => <ToolCard key={t.id} tool={t} index={i} />)}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
