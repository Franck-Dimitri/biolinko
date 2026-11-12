import { motion } from 'framer-motion';

/*
 * Carte de l'Afrique en points, dessinée à partir d'un contour simplifié (longitude, latitude).
 * Illustration : les zones colorées autour de chaque pays sont approximatives, pas des frontières.
 */

// Contour simplifié du continent, puis de Madagascar (degrés : [longitude, latitude])
const AFRICA = [
    [-5.9, 35.8], [-1.5, 35.1], [3, 36.8], [10.2, 37.2], [11.1, 33.2], [15, 32.3], [20, 30.9], [25, 31.6], [32.3, 31.3], [34.2, 27.8],
    [35.5, 24], [37.2, 21], [38.5, 18], [41.5, 14.8], [43.3, 12.6], [45, 10.4], [51.2, 11.8], [49, 6], [46, 2], [42, -1], [40, -3],
    [39.3, -6.8], [40.5, -10.5], [40.5, -15], [35.5, -22], [32.6, -25.9], [32.9, -28.8], [30.9, -30], [27.9, -33], [25.6, -34], [22, -34.4],
    [18.5, -34.4], [18, -31.5], [15.2, -27], [14.5, -22.9], [11.8, -17.2], [13.5, -12.5], [12.2, -6], [9.4, -0.6], [9.6, 2.9], [9.4, 4],
    [8.5, 4.6], [6, 4.3], [2.6, 6.3], [-1, 5.1], [-4, 5.2], [-7.5, 4.4], [-11, 6.8], [-13.3, 9], [-15.2, 11], [-16.8, 13], [-17.5, 14.7],
    [-16.5, 19.4], [-17, 21], [-15, 24.5], [-13, 27.6], [-9.8, 29.9], [-9.6, 32], [-6.8, 34],
];
const MADAGASCAR = [[49.3, -12], [50.4, -15.5], [49.5, -17.5], [47.3, -24.9], [45.2, -25.5], [43.7, -23], [44, -20], [44.3, -16.2], [47, -15]];

// Centre approximatif et rayon (degrés) de chaque pays couvert, pour la zone colorée
export const GEO = {
    cm: [12.7, 5.7, 3.2], ga: [11.6, -0.6, 2.2], cg: [15.2, -0.8, 2.6], td: [18.7, 15.4, 5], cd: [23.6, -2.9, 6.5],
    ci: [-5.5, 7.6, 2.8], sn: [-14.5, 14.4, 2], bj: [2.3, 9.3, 1.6], tg: [0.9, 8.6, 1.1], bf: [-1.6, 12.3, 2.6], ml: [-3.5, 17.5, 5], gn: [-10.9, 10.4, 2.4],
};

const LON0 = -20; const LAT0 = 38; const K = 10; const STEP = 1.25;
const px = (lon) => (lon - LON0) * K;
const py = (lat) => (LAT0 - lat) * K;

function inside([x, y], poly) {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i]; const [xj, yj] = poly[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
}

// Points calculés une seule fois au chargement du module
const DOTS = [];
for (let lat = 37; lat >= -35; lat -= STEP) {
    for (let lon = -18; lon <= 52; lon += STEP) {
        if (!inside([lon, lat], AFRICA) && !inside([lon, lat], MADAGASCAR)) continue;
        let country = null;
        for (const [code, [clon, clat, r]] of Object.entries(GEO)) {
            if (Math.hypot(lon - clon, lat - clat) <= r) { country = code; break; }
        }
        DOTS.push([px(lon), py(lat), country]);
    }
}

export default function AfricaMap({ countries, active, onHover, dark = false, className = '' }) {
    // Couleurs selon le fond : terre, pays prévu, pays survolé, repère
    const col = dark
        ? { land: '#2A2A27', soon: '#77766F', on: '#FFFFFF', pinFill: '#0F0F0E', pinStroke: '#FFFFFF', ring: '#FFCC00', tag: '#FFFFFF', tagText: '#141412' }
        : { land: '#E4E2DA', soon: '#8B8A83', on: '#141412', pinFill: '#FFFFFF', pinStroke: '#141412', ring: '#141412', tag: '#141412', tagText: '#FFFFFF' };
    const byCode = Object.fromEntries(countries.map((c) => [c.code, c]));
    return (
        <svg viewBox="0 0 720 740" className={className} role="img" aria-label="Carte des pays couverts par Biolinko en Afrique">
            {DOTS.map(([x, y, code], i) => {
                const c = code && byCode[code];
                const on = c && active === code;
                const fill = !c ? col.land : c.live ? '#FFCC00' : on ? col.on : col.soon;
                return <circle key={i} cx={x} cy={y} r={on ? 3.6 : 3.1} fill={fill} style={{ transition: 'fill .25s, r .25s' }} />;
            })}

            {countries.map((c) => {
                const [lon, lat] = GEO[c.code];
                const x = px(lon); const y = py(lat);
                const on = active === c.code;
                return (
                    <g key={c.code} onMouseEnter={() => onHover?.(c.code)} onFocus={() => onHover?.(c.code)} tabIndex={0} className="cursor-pointer outline-none">
                        {c.live && (
                            <motion.circle cx={x} cy={y} r={10} fill="none" stroke={col.ring} strokeWidth="1.5"
                                animate={{ r: [10, 26], opacity: [0.6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }} />
                        )}
                        <circle cx={x} cy={y} r={on ? 9 : 7} fill={c.live ? '#141412' : col.pinFill} stroke={c.live ? '#FFCC00' : col.pinStroke} strokeWidth="2" style={{ transition: 'r .2s' }} />
                        {c.live && <circle cx={x} cy={y} r={3} fill="#FFCC00" />}
                        {(on || c.live) && (
                            <g pointerEvents="none">
                                <rect x={x + 14} y={y - 15} width={c.name.length * 8.4 + 22} height={30} rx={8} fill={col.tag} />
                                <text x={x + 25} y={y + 5} fill={col.tagText} fontSize="14" fontWeight="500" fontFamily="Poppins, sans-serif">{c.name}</text>
                            </g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
