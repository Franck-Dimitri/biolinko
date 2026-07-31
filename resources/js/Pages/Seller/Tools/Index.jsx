import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Layers2, CheckCircle2, Lock, ArrowRight, Zap, Smartphone, MessageSquare, FileText, Table, ExternalLink } from 'lucide-react';

export default function Index({ store, user, plugins }) {
    const getIconComponent = (name) => {
        switch (name) {
            case 'Smartphone': return <Smartphone className="w-6 h-6 text-amber-500" />;
            case 'MessageSquare': return <MessageSquare className="w-6 h-6 text-emerald-500" />;
            case 'FileText': return <FileText className="w-6 h-6 text-indigo-500" />;
            case 'Table': return <Table className="w-6 h-6 text-sky-500" />;
            default: return <Zap className="w-6 h-6 text-amber-500" />;
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Outils & Plugins — BIOLINKO" />

            <div className="w-full space-y-8 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                            <span>Outils & Extensions Plugins</span>
                            <Layers2 className="w-6 h-6 text-amber-500" />
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                            Découvrez le catalogue d'extensions connectées pour automatiser votre boutique et booster vos ventes.
                        </p>
                    </div>
                </div>

                {/* PLUGINS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plugins.map((p) => {
                        const isLocked = p.status === 'locked';

                        return (
                            <motion.div
                                key={p.id}
                                whileHover={{ y: -3 }}
                                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-2xs ${
                                    isLocked ? 'border-slate-200/60 opacity-90' : 'border-slate-200 hover:border-amber-300'
                                }`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            {getIconComponent(p.icon)}
                                        </div>

                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                            !isLocked
                                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                            {!isLocked ? 'Actif' : `Requis Plan ${p.required_plan}`}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            {p.category}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-950 mt-0.5">{p.name}</h3>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
                                            {p.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    {!isLocked ? (
                                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                            <CheckCircle2 className="w-4 h-4" /> Plugin Intégré
                                        </span>
                                    ) : (
                                        <a
                                            href={route('seller.subscriptions.index')}
                                            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                                        >
                                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Débloquer avec le Plan {p.required_plan}</span>
                                        </a>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
