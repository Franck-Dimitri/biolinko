import { AnimatePresence, motion } from 'framer-motion';
import { Ruler, X } from 'lucide-react';

/*
 * Guide des tailles (vêtements) et des pointures : correspondances standard en centimètres,
 * affichées sur les fiches dont les options sont des tailles ou des pointures.
 */
const CLOTHES = [
    ['XS', '34', '78 – 82', '60 – 64', '86 – 90'],
    ['S', '36 – 38', '83 – 89', '65 – 71', '91 – 97'],
    ['M', '40', '90 – 96', '72 – 78', '98 – 104'],
    ['L', '42 – 44', '97 – 104', '79 – 87', '105 – 112'],
    ['XL', '46', '105 – 112', '88 – 96', '113 – 120'],
    ['XXL', '48 – 50', '113 – 120', '97 – 105', '121 – 128'],
];
const SHOES = [['36', '23'], ['37', '23,5'], ['38', '24'], ['39', '25'], ['40', '25,5'], ['41', '26,5'], ['42', '27'], ['43', '27,5'], ['44', '28,5'], ['45', '29'], ['46', '30']];

export default function SizeGuide({ kind, open, onClose }) {
    const shoes = kind === 'Pointure';
    const head = shoes ? ['Pointure (EU)', 'Longueur du pied (cm)'] : ['Taille', 'EU', 'Poitrine (cm)', 'Taille (cm)', 'Hanches (cm)'];
    const rows = shoes ? SHOES : CLOTHES;
    return (
        <AnimatePresence>
            {open && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
                    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center sm:p-4">
                    <motion.div role="dialog" aria-modal="true" aria-labelledby="size-guide-title" onClick={(e) => e.stopPropagation()}
                        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-[var(--r,24px)] bg-[color:var(--bg,#FFFFFF)] p-6 text-[color:var(--ink,#141412)] sm:rounded-[var(--r,24px)]">
                        <div className="flex items-start justify-between gap-3">
                            <h2 id="size-guide-title" className="flex items-center gap-2 text-lg font-semibold"><Ruler className="h-5 w-5" /> {shoes ? 'Guide des pointures' : 'Guide des tailles'}</h2>
                            <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"><X className="h-5 w-5" /></button>
                        </div>
                        <p className="mt-2 text-sm text-[color:var(--mu,#5F5E58)]">
                            {shoes ? 'Mesurez votre pied du talon au bout du plus grand orteil, en fin de journée.' : 'Mesurez-vous sans serrer le mètre ruban. Entre deux tailles, prenez la plus grande.'}
                        </p>
                        <table className="mt-4 w-full text-left text-sm">
                            <thead><tr className="border-b border-[color:var(--ln,rgba(0,0,0,0.08))] text-[color:var(--mu,#5F5E58)]">{head.map((h) => <th key={h} className="py-2 pr-2 font-medium">{h}</th>)}</tr></thead>
                            <tbody>
                                {rows.map((r) => (
                                    <tr key={r[0]} className="border-b border-[color:var(--ln,rgba(0,0,0,0.08))]">
                                        {r.map((c, i) => <td key={i} className={`py-2 pr-2 tabular-nums ${i === 0 ? 'font-semibold' : ''}`}>{c}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <p className="mt-3 text-[12px] text-[color:var(--mu,#5F5E58)]">Correspondances indicatives : la coupe peut varier selon le modèle. Une question ? Contactez la boutique.</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
