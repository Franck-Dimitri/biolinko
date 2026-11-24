import { motion } from 'framer-motion';

// Libellés lisibles des mesures de fréquentation
export const COUNTRY = {
    CM: 'Cameroun', GA: 'Gabon', CG: 'Congo', CD: 'RD Congo', TD: 'Tchad', CF: 'Centrafrique', GQ: 'Guinée équatoriale', NG: 'Nigeria',
    CI: 'Côte d’Ivoire', SN: 'Sénégal', BJ: 'Bénin', TG: 'Togo', BF: 'Burkina Faso', ML: 'Mali', GN: 'Guinée', NE: 'Niger',
    FR: 'France', BE: 'Belgique', CH: 'Suisse', CA: 'Canada', US: 'États-Unis', GB: 'Royaume-Uni', DE: 'Allemagne', MA: 'Maroc',
};
export const SOURCE = { whatsapp: 'WhatsApp', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', google: 'Google', direct: 'Accès direct', other: 'Autres sites' };
export const DEVICE = { mobile: 'Téléphone', tablet: 'Tablette', desktop: 'Ordinateur' };
export const PAGE = { home: 'Accueil de boutique', product: 'Fiches produits', checkout: 'Paiement', track: 'Suivi de commande', site: 'Site Biolinko' };

/** Courbe en barres : visiteurs par jour. */
export function VisitsChart({ series = [] }) {
    const max = Math.max(1, ...series.map((d) => d.visitors));
    return (
        <div>
            <div className="flex h-40 items-end gap-[3px]">
                {series.map((d, i) => (
                    <div key={d.date} className="group relative flex h-full flex-1 items-end">
                        <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(d.visitors ? 4 : 1.5, (d.visitors / max) * 100)}%` }} transition={{ duration: 0.5, delay: Math.min(i, 30) * 0.01 }}
                            className={`w-full rounded-t-[4px] ${d.visitors ? 'bg-[#FFCC00] group-hover:bg-[#F5C400]' : 'bg-[#F2F1EC]'}`} />
                        <span className="pointer-events-none absolute -top-9 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#141412] px-2 py-1 text-[11px] text-white group-hover:block">
                            {new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {d.visitors} visiteur{d.visitors > 1 ? 's' : ''}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-2 flex justify-between text-[12px] text-[#8B8A83]">
                <span>{series[0] && new Date(series[0].date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                <span>Aujourd’hui</span>
            </div>
        </div>
    );
}

/** Liste avec barre de proportion (pays, sources, appareils…). */
export function Breakdown({ rows = [], labels = {}, flag = false, empty = 'Pas encore de visites.' }) {
    const total = rows.reduce((a, r) => a + r.visitors, 0) || 1;
    if (!rows.length) return <p className="text-[13px] text-[#8B8A83]">{empty}</p>;
    return (
        <ul className="space-y-3">
            {rows.map((r) => {
                const pct = Math.round((r.visitors / total) * 100);
                const label = r.key ? (labels[r.key] || r.key) : 'Inconnu';
                return (
                    <li key={r.key || 'none'}>
                        <div className="flex items-center justify-between gap-3 text-[14px]">
                            <span className="flex min-w-0 items-center gap-2 text-[#141412]">
                                {flag && r.key && <img src={`/images/flags/${r.key.toLowerCase()}.svg`} alt="" className="h-4 w-4 rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                                <span className="truncate">{label}</span>
                            </span>
                            <span className="shrink-0 tabular-nums text-[#5F5E58]">{r.visitors} · {pct} %</span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F2F1EC]">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-[#141412]" />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
