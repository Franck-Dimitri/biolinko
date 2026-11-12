import { motion } from 'framer-motion';

// Exemples de produits vendus sur une boutique Biolinko (prix illustratifs)
const ITEMS = [
    ['/images/landing/wall/robe-pagne.webp', 'Robe pagne', 18500, 'MTN'],
    ['/images/landing/wall/prod-sneakers.webp', 'Baskets', 25000, 'Orange'],
    ['/images/landing/wall/foulard.webp', 'Foulard wax', 6500, 'MTN'],
    ['/images/landing/wall/prod-perfume.webp', 'Parfum 100 ml', 12500, 'Orange'],
    ['/images/landing/wall/sac-cuir.webp', 'Sac à chaîne', 32000, 'MTN'],
    ['/images/landing/wall/prod-cake.webp', 'Gâteau d’anniversaire', 15000, 'Orange'],
    ['/images/landing/wall/tunique-orange.webp', 'Tunique', 14000, 'MTN'],
    ['/images/landing/wall/prod-smartwatch.webp', 'Montre connectée', 45000, 'Orange'],
    ['/images/landing/wall/jupe-soleil.webp', 'Robe soleil', 21000, 'MTN'],
    ['/images/landing/wall/prod-cosmetics.webp', 'Soins visage', 9500, 'Orange'],
    ['/images/landing/wall/robe-sirene.webp', 'Robe sirène', 27500, 'MTN'],
    ['/images/landing/wall/prod-iphone.webp', 'Smartphone', 369000, 'Orange'],
];

function Tile({ src, name, price, op }) {
    return (
        <figure className="relative overflow-hidden rounded-2xl bg-white/5">
            <img src={src} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
            <figcaption className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-xl bg-white/95 px-3 py-2 text-[#141412] shadow-sm">
                <span className="min-w-0">
                    <span className="block truncate text-[12px] font-medium">{name}</span>
                    <span className="block text-[12px] tabular-nums text-[#5F5E58]">{price.toLocaleString('fr-FR')} FCFA</span>
                </span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${op === 'MTN' ? 'bg-[#FFCC00] text-[#141412]' : 'bg-[#FF7900] text-white'}`}>Payé</span>
            </figcaption>
        </figure>
    );
}

/**
 * Mur de produits qui défile lentement vers le haut (une seule animation infinie pour tout le mur).
 * Les colonnes sont décalées entre elles pour casser l'effet de grille.
 */
export default function ProductWall({ className = '', intro = false }) {
    const cols = [0, 1, 2].map((c) => ITEMS.filter((_, i) => i % 3 === c));
    return (
        <div aria-hidden className={`relative overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_88%,transparent)] ${className}`}>
            <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-3" animate={{ y: ['0%', '-50%'] }} transition={{ duration: 60, ease: 'linear', repeat: Infinity }}>
                {cols.map((col, c) => (
                    <motion.div key={c} className={`space-y-3 ${c === 1 ? 'pt-16' : c === 2 ? 'hidden pt-8 sm:block' : ''}`}
                        initial={intro ? { opacity: 0, y: 120 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.35 + c * 0.15, ease: [0.22, 1, 0.36, 1] }}>
                        {[...col, ...col].map((it, i) => <Tile key={i} src={it[0]} name={it[1]} price={it[2]} op={it[3]} />)}
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
