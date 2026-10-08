import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Download, FileSpreadsheet, Lock, X } from 'lucide-react';
import Modal from '@/Components/Modal';

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
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="p-6 space-y-5 font-sans">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#FFCC00] text-slate-950 flex items-center justify-center shadow-2xs">
                            <FileSpreadsheet className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-slate-950 tracking-tight">Exporter le rapport de ventes</h2>
                            <p className="text-[11px] text-slate-500 font-medium">Fichier CSV compatible Excel & Google Sheets</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-all active:scale-95"
                        aria-label="Fermer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

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
                            className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-all active:scale-95"
                        >
                            Voir les plans
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Période</div>
                            <div className="grid grid-cols-2 gap-2">
                                {PRESETS.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => applyPreset(p)}
                                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                                            preset === p.id
                                                ? 'bg-slate-950 border-slate-950 text-white'
                                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <label className="space-y-1">
                                    <span className="text-[11px] font-medium text-slate-500">Du</span>
                                    <input
                                        type="date"
                                        value={from}
                                        max={to}
                                        onChange={(e) => { setFrom(e.target.value); setPreset('custom'); }}
                                        className="w-full rounded-xl border-slate-200 text-sm focus:border-amber-400 focus:ring-amber-400"
                                    />
                                </label>
                                <label className="space-y-1">
                                    <span className="text-[11px] font-medium text-slate-500">Au</span>
                                    <input
                                        type="date"
                                        value={to}
                                        min={from}
                                        onChange={(e) => { setTo(e.target.value); setPreset('custom'); }}
                                        className="w-full rounded-xl border-slate-200 text-sm focus:border-amber-400 focus:ring-amber-400"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Commandes incluses</div>
                            {[
                                { id: 'sales', label: 'Ventes encaissées', hint: 'Payées, en livraison et livrées' },
                                { id: 'all', label: 'Toutes les commandes', hint: 'Y compris en attente, annulées et échouées' },
                            ].map((option) => (
                                <label
                                    key={option.id}
                                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                                        scope === option.id ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 hover:border-slate-300'
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
                                        <span className="block text-xs font-bold text-slate-900">{option.label}</span>
                                        <span className="block text-[11px] text-slate-500 font-medium">{option.hint}</span>
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
                                    ? 'bg-[#FFCC00] hover:bg-[#E6B800] text-slate-950'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                            <Download className="w-4 h-4 stroke-[2.5]" /> Télécharger le CSV
                        </a>
                    </>
                )}
            </div>
        </Modal>
    );
}
