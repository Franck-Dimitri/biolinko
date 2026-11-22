import { useId } from 'react';
import {
    Activity, Apple, Armchair, Axe, Baby, Backpack, Banana, BedDouble, Briefcase, CakeSlice, Cake, CalendarCheck, Camera, Candy, Carrot,
    ChefHat, Citrus, Clock, CookingPot, Cookie, Cpu, Croissant, Crown, Donut, Droplets, Drumstick, Dumbbell, Egg, Feather, Flower, Flower2,
    Frame, Gem, Glasses, Grape, Hammer, Handshake, Headphones, Heart, HeartPulse, House, IceCreamCone, Key, Lamp, Laptop, Leaf, Milk,
    Palette, Paintbrush, PartyPopper, PenTool, Pencil, Phone, Pill, Pizza, Plug, Puzzle, Ribbon, Rocket, Ruler, Scissors, Settings, Shapes,
    Shell, Shirt, ShoppingBag, ShoppingBasket, Smartphone, Smile, Sofa, Soup, Sparkles, Speaker, Spool, SprayCan, Sprout, Star, Stethoscope,
    Tag, ToyBrick, Truck, Umbrella, Utensils, UtensilsCrossed, Watch, Wheat, Wrench, Zap,
} from 'lucide-react';

/*
 * Motifs des vitrines : chaque activité a ses propres motifs (au moins 3), faits de vraies icônes
 * disposées en mosaïque et colorées avec la couleur de la boutique. Aucun motif n'est partagé entre activités.
 * Les clés sont les mêmes que App\Support\BusinessTypes::PATTERNS_BY_TYPE.
 */

const ink = (c) => ({ fill: 'none', stroke: c, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' });

// Motifs géométriques (sans icône)
const SHAPES = {
    wax: { size: 44, draw: (c) => (<>
        <path d="M22 4l18 18-18 18L4 22z" {...ink(c)} />
        <circle cx="22" cy="22" r="5" fill={c} />
        {[[0, 0], [44, 0], [0, 44], [44, 44]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3.5" fill={c} />)}
    </>) },
    buttons: { size: 64, draw: (c) => (<>
        {[[16, 16, 9], [48, 46, 7]].map(([x, y, r]) => (
            <g key={x}>
                <circle cx={x} cy={y} r={r} {...ink(c)} />
                {[[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]].map(([dx, dy]) => <circle key={`${dx}${dy}`} cx={x + dx * (r / 9)} cy={y + dy * (r / 9)} r={r / 9} fill={c} />)}
            </g>
        ))}
        <path d="M36 12l6 6M42 12l-6 6" {...ink(c)} />
    </>) },
    dots: { size: 20, draw: (c) => <circle cx="3" cy="3" r="1.6" fill={c} /> },
    grid: { size: 32, draw: (c) => <path d="M32 0H0V32" fill="none" stroke={c} strokeWidth="1" /> },
    waves: { size: 40, draw: (c) => <path d="M0 20c5 0 5-6 10-6s5 6 10 6 5-6 10-6 5 6 10 6" {...ink(c)} /> },
};

// [clé, nom affiché, icônes ou motif géométrique]
const DEFS = {
    // Pâtisserie
    'patisserie-croissants': ['Croissants', [Croissant, Cookie]],
    'patisserie-gateaux': ['Gâteaux', [CakeSlice, Cake]],
    'patisserie-gourmandises': ['Gourmandises', [Donut, IceCreamCone, Candy]],
    // Restauration
    'restauration-couverts': ['Couverts', [UtensilsCrossed, Utensils]],
    'restauration-cuisine': ['Cuisine', [ChefHat, CookingPot]],
    'restauration-plats': ['Plats', [Pizza, Soup, Drumstick]],
    // Mode
    'mode-vetements': ['Vêtements', [Shirt, ShoppingBag]],
    'mode-etiquettes': ['Étiquettes', [Tag, Ribbon]],
    'mode-wax': ['Wax', 'wax'],
    // Accessoires
    'accessoires-montres': ['Montres', [Watch, Glasses]],
    'accessoires-bijoux': ['Bijoux', [Gem, Crown]],
    'accessoires-sacs': ['Sacs', [Backpack, Briefcase, Umbrella]],
    // Beauté
    'beaute-fleurs': ['Fleurs', [Flower, Flower2]],
    'beaute-eclat': ['Éclat', [Sparkles, Star]],
    'beaute-soins': ['Soins', [Droplets, SprayCan, Heart]],
    // Électronique
    'electronique-appareils': ['Appareils', [Smartphone, Laptop]],
    'electronique-audio': ['Audio et photo', [Headphones, Speaker, Camera]],
    'electronique-tech': ['Tech', [Cpu, Zap, Plug]],
    // Alimentation
    'alimentation-fruits': ['Fruits', [Apple, Grape, Banana]],
    'alimentation-potager': ['Potager', [Carrot, Wheat, Citrus]],
    'alimentation-epicerie': ['Épicerie', [ShoppingBasket, Egg, Milk]],
    // Maison
    'maison-mobilier': ['Mobilier', [Sofa, Armchair]],
    'maison-deco': ['Déco', [Lamp, Frame]],
    'maison-foyer': ['Foyer', [House, Key, BedDouble]],
    // Santé
    'sante-nature': ['Nature', [Leaf, Sprout]],
    'sante-forme': ['Forme', [Dumbbell, Activity]],
    'sante-soin': ['Soin', [HeartPulse, Pill, Stethoscope]],
    // Enfants
    'enfants-jouets': ['Jouets', [ToyBrick, Puzzle]],
    'enfants-bebe': ['Bébé', [Baby, Smile]],
    'enfants-fete': ['Fête', [Rocket, PartyPopper, Shapes]],
    // Couture
    'couture-ciseaux': ['Ciseaux et fil', [Scissors, Spool]],
    'couture-mesure': ['Mesures', [Ruler, Pencil]],
    'couture-boutons': ['Boutons', 'buttons'],
    // Artisanat
    'artisanat-peinture': ['Peinture', [Palette, Paintbrush]],
    'artisanat-outils': ['Outils', [Hammer, Axe]],
    'artisanat-creation': ['Création', [Feather, PenTool, Shell]],
    // Services
    'services-reparation': ['Réparation', [Wrench, Settings]],
    'services-rendezvous': ['Rendez-vous', [CalendarCheck, Clock]],
    'services-contact': ['Contact', [Handshake, Phone, Truck]],
    // Autre activité
    'autre-points': ['Points', 'dots'],
    'autre-grille': ['Grille', 'grid'],
    'autre-vagues': ['Vagues', 'waves'],
};

export const patternLabel = (key) => (key === 'none' || !key ? 'Aucun' : DEFS[key]?.[0] || key);
export const hasPattern = (key) => !!DEFS[key];

// Emplacements des icônes dans une tuile de 88 px : [x, y, rotation, taille]
const TILE = 88;
const SLOTS = {
    2: [[10, 10, -14, 26], [50, 50, 12, 24]],
    3: [[8, 8, -14, 24], [56, 14, 12, 20], [30, 54, -6, 24]],
};

function Tile({ def, color }) {
    const [, content] = def;
    if (typeof content === 'string') return SHAPES[content].draw(color);
    const slots = SLOTS[content.length] || SLOTS[2];
    return content.map((Icon, i) => {
        const [x, y, r, s] = slots[i];
        return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r} ${s / 2} ${s / 2})`}>
                <Icon width={s} height={s} color={color} strokeWidth={1.5} absoluteStrokeWidth />
            </g>
        );
    });
}

/**
 * Calque de motif (absolute inset-0) : <PatternLayer pattern={store.pattern} color={couleur} opacity={0.14} />.
 * `scale` agrandit ou réduit la mosaïque (vignettes : 0.6).
 */
export function PatternLayer({ pattern, color = '#141412', opacity = 0.14, className = '', fade = true, scale = 1 }) {
    const rawId = useId();
    const def = DEFS[pattern];
    if (!def) return null;
    const id = `pat-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const size = (typeof def[1] === 'string' ? SHAPES[def[1]].size : TILE) * scale;
    const mask = fade ? { maskImage: 'linear-gradient(to bottom, black, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 90%)' } : {};

    return (
        <svg aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} style={{ opacity, ...mask }}>
            <defs>
                <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
                    <g transform={`scale(${scale})`}><Tile def={def} color={color} /></g>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
    );
}
