import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Download, FileSpreadsheet, Lock, X } from 'lucide-react';
import { SubPage } from '@/Components/Dashboard/UI';

const toInput = (date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
};

const PRESETS = [
    { id: 'this_month', label: 'Ce mois', range: (now) => [new Date(now.getFullYear(), now.getMonth(), 1), now] },
    { id: 'last_month', label: 'Mois dernier', range: (now) => [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)] },
    { id: 'last_30', label: '30 derniers jours', range: (now) => [new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29), now] },
    { id: 'this_year', label: 'Cette année', range: (now) => [new Date(now.getFullYear(), 0, 1), now] },
];

export default function ExportSalesModal({ show, onClose, canExport }) {
    const now = new Date();
    const [preset, setPreset] = useState('this_month');
    const [from, setFrom] = useState(toInput(PRESETS[0].range(now)[0]));
    const [to, setTo] = useState(toInput(now));
    const [scope, setScope] = useState('sales');

    const applyPreset = (p) => {
        const [start, end] = p.range(new Date());
        setPreset(p.id);
        setFrom(toInput(start));
        setTo(toInput(end));
    };

    const isRangeValid = from && to && from <= to;
    const downloadUrl = route('orders.export', { from, to, scope });

    return (
        <SubPage open={show} onClose={onClose} backLabel="Retour aux commandes" width="max-w-xl" title="Exporter les ventes" sub="Fichier CSV compatible Excel et Google Sheets.">
            <div className="space-y-5">
                {!canExport ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                            <Lock className="w-4 h-4 text-amber-600" /> Fonctionnalité du plan Business
                        </div>
                        <p className="text-xs text-amber-800 font-medium">
                            L'export comptable de vos ventes (CSV / Excel) est inclus dans le plan Business.
                        </p>
                        <Link
                            href={route('seller.subscriptions.index')}
                            className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-[#141412] text-white text-xs font-bold hover:bg-[#141412] transition-all active:scale-95"
                        >
                            Voir les plans
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold  text-[#8B8A83]">Période</div>
                            <div className="grid grid-cols-2 gap-2">
                                {PRESETS.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                                            preset === p.id
                                                ? 'bg-[#141412] border-slate-950 text-white'
                                                : 'bg-white border-black/10 text-[#3D3C37] hover:border-black/10'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <label className="space-y-1">
                                    <span className="text-[11px] font-medium text-[#5F5E58]">Du</span>
                                    <input
                                        type="date"
                                        value={from}
                                        max={to}
                                        onChange={(e) => { setFrom(e.target.value); setPreset('custom'); }}
                                        className="w-full rounded-xl border-black/10 text-sm focus:border-amber-400 focus:ring-amber-400"
                                    />
                                </label>
                                <label className="space-y-1">
                                    <span className="text-[11px] font-medium text-[#5F5E58]">Au</span>
                                    <input
                                        type="date"
                                        value={to}
                                        min={from}
                                        onChange={(e) => { setTo(e.target.value); setPreset('custom'); }}
                                        className="w-full rounded-xl border-black/10 text-sm focus:border-amber-400 focus:ring-amber-400"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-[10px] font-bold  text-[#8B8A83]">Commandes incluses</div>
                            {[
                                { id: 'sales', label: 'Ventes encaissées', hint: 'Payées, en livraison et livrées' },
                                { id: 'all', label: 'Toutes les commandes', hint: 'Y compris en attente, annulées et échouées' },
                            ].map((option) => (
                                <label
                                    key={option.id}
                                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                                        scope === option.id ? 'border-amber-300 bg-amber-50/60' : 'border-black/10 hover:border-black/10'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="scope"
                                        value={option.id}
                                        checked={scope === option.id}
                                        onChange={() => setScope(option.id)}
                                        className="mt-0.5 text-amber-500 focus:ring-amber-400"
                                    />
                                    <span>
                                        <span className="block text-xs font-bold text-[#141412]">{option.label}</span>
                                        <span className="block text-[11px] text-[#5F5E58] font-medium">{option.hint}</span>
                                    </span>
                                </label>
                            ))}
                        </div>

                        <a
                            href={isRangeValid ? downloadUrl : undefined}
                            onClick={(e) => (isRangeValid ? setTimeout(onClose, 300) : e.preventDefault())}
                            aria-disabled={!isRangeValid}
                            className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                                isRangeValid
                                    ? 'bg-[#FFCC00] hover:bg-[#E6B800] text-[#141412]'
                                    : 'bg-[#F2F1EC] text-[#8B8A83] cursor-not-allowed'
                            }`}
                        >
                            <Download className="w-4 h-4 stroke-[2.5]" /> Télécharger le CSV
                        </a>
                    </>
                )}
            </div>
        </SubPage>
    );
}
