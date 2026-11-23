/*
 * Génère resources/data/pattern-tiles.json : le dessin SVG d'une tuile de chaque motif de vitrine,
 * pour les documents rendus côté serveur (facture PDF). Mêmes icônes et mêmes positions que
 * resources/js/Components/Storefront/patterns.jsx, qui reste la référence.
 * Usage : node scripts/build-pattern-tiles.mjs (à relancer après une modification des motifs).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const root = new URL('..', import.meta.url);
const source = readFileSync(new URL('resources/js/Components/Storefront/patterns.jsx', root), 'utf8');

const C = '{{c}}';
const ink = `fill="none" stroke="${C}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;
const SHAPES = {
    wax: [44, `<path d="M22 4l18 18-18 18L4 22z" ${ink}/><circle cx="22" cy="22" r="5" fill="${C}"/>` + [[0, 0], [44, 0], [0, 44], [44, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${C}"/>`).join('')],
    buttons: [64, [[16, 16, 9], [48, 46, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" ${ink}/>` + [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]].map(([dx, dy]) => `<circle cx="${x + dx * r / 9}" cy="${y + dy * r / 9}" r="${r / 9}" fill="${C}"/>`).join('')).join('') + `<path d="M36 12l6 6M42 12l-6 6" ${ink}/>`],
    dots: [20, `<circle cx="3" cy="3" r="1.6" fill="${C}"/>`],
    grid: [32, `<path d="M32 0H0V32" fill="none" stroke="${C}" stroke-width="1"/>`],
    waves: [40, `<path d="M0 20c5 0 5-6 10-6s5 6 10 6 5-6 10-6 5 6 10 6" ${ink}/>`],
};
const SLOTS = { 2: [[10, 10, -14, 26], [50, 50, 12, 24]], 3: [[8, 8, -14, 24], [56, 14, 12, 20], [30, 54, -6, 24]] };
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Za-z])(\d)/g, '$1-$2').toLowerCase();

async function iconNode(name) {
    const file = new URL(`node_modules/lucide-react/dist/esm/icons/${kebab(name)}.mjs`, root);
    return (await import(pathToFileURL(file.pathname).href)).__iconNode;
}

const attrs = (o) => Object.entries(o).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${v}"`).join(' ');
const out = {};
for (const m of source.matchAll(/'([a-z]+-[a-z]+)': \['([^']+)', (?:\[([A-Za-z0-9, ]+)\]|'([a-z]+)')\]/g)) {
    const [, key, label, icons, shape] = m;
    if (shape) {
        out[key] = { label, size: SHAPES[shape][0], svg: SHAPES[shape][1] };
        continue;
    }
    const names = icons.split(',').map((s) => s.trim());
    const slots = SLOTS[names.length] || SLOTS[2];
    const parts = [];
    for (const [i, name] of names.entries()) {
        const [x, y, r, s] = slots[i];
        const node = await iconNode(name);
        // Trait de 1,5 px une fois l'icône (24 px) mise à l'échelle, comme absoluteStrokeWidth
        // Attributs répétés sur chaque forme : certains moteurs SVG (ImageMagick) n'héritent pas de ceux du groupe
        const paint = `fill="none" stroke="${C}" stroke-width="${(1.5 * 24 / s).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"`;
        parts.push(`<g transform="translate(${x} ${y}) rotate(${r} ${s / 2} ${s / 2}) scale(${s / 24})">${node.map(([tag, a]) => `<${tag} ${attrs(a)} ${paint}/>`).join('')}</g>`);
    }
    out[key] = { label, size: 88, svg: parts.join('') };
}
writeFileSync(new URL('resources/data/pattern-tiles.json', root), JSON.stringify(out, null, 1) + '\n');
console.log(`${Object.keys(out).length} motifs`);
