import { useMemo } from 'react';

const DEFAULT_STORES = [
    {
        name: 'Maison Kemi',
        sales: '420 ventes',
        logo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'Douala Sneakers',
        sales: '1.2k ventes',
        logo_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'AfroGlam Bio',
        sales: '680 ventes',
        logo_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'Sawa Délices',
        sales: '950 ventes',
        logo_url: 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'Yaoundé Tech Hub',
        sales: '840 ventes',
        logo_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'Atelier Cuir & Wax',
        sales: '310 ventes',
        logo_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'Kmer Streetwear',
        sales: '1.5k ventes',
        logo_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'Sahel Orfèvrerie',
        sales: '510 ventes',
        logo_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'Ebene Studio',
        sales: '390 ventes',
        logo_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'Kola Luxe',
        sales: '720 ventes',
        logo_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'Café & Épices',
        sales: '640 ventes',
        logo_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&auto=format&fit=crop&q=80',
    },
    {
        name: 'Bantu Handmade',
        sales: '580 ventes',
        logo_url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=120&auto=format&fit=crop&q=80',
    },
];

export default function StoresMarquee({ stores = [] }) {
    const list = useMemo(() => {
        if (Array.isArray(stores) && stores.length > 0) {
            return stores.map((s, idx) => ({
                name: s.name,
                sales: s.sales_count ? `${s.sales_count} ventes` : `${180 + (idx * 55)} ventes`,
                logo_url: s.logo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            }));
        }
        return DEFAULT_STORES;
    }, [stores]);

    return (
        <section className="relative overflow-hidden bg-white py-4 sm:py-5 border-y border-slate-100">
            {/* Conteneur avec défilement et masques flous gauche & droite */}
            <div className="relative w-full overflow-hidden">
                {/* Dégradé flouté bord gauche (Entrée) */}
                <div
                    className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent backdrop-blur-[2px]"
                    aria-hidden="true"
                />

                {/* Dégradé flouté bord droit (Sortie) */}
                <div
                    className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent backdrop-blur-[2px]"
                    aria-hidden="true"
                />

                {/* Bande défilante infinie de droite à gauche, sans divs arrondis, tailles réduites */}
                <div className="flex w-max animate-marquee will-change-transform">
                    {/* Première passe */}
                    <div className="flex shrink-0 items-center gap-8 sm:gap-12 pr-8 sm:pr-12">
                        {list.map((store, i) => (
                            <div
                                key={`${store.name}-${i}`}
                                className="group flex shrink-0 items-center gap-2.5 cursor-pointer grayscale opacity-50 contrast-100 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                            >
                                <img
                                    src={store.logo_url}
                                    alt={store.name}
                                    className="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                                    loading="lazy"
                                />
                                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap group-hover:text-slate-950 transition-colors">
                                    {store.name}
                                </span>
                                <span className="text-[11px] font-normal text-slate-400 whitespace-nowrap">
                                    {store.sales}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Seconde passe pour la boucle infinie parfaite */}
                    <div aria-hidden="true" className="flex shrink-0 items-center gap-8 sm:gap-12 pr-8 sm:pr-12">
                        {list.map((store, i) => (
                            <div
                                key={`${store.name}-dup-${i}`}
                                className="group flex shrink-0 items-center gap-2.5 cursor-pointer grayscale opacity-50 contrast-100 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                            >
                                <img
                                    src={store.logo_url}
                                    alt={store.name}
                                    className="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                                    loading="lazy"
                                />
                                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap group-hover:text-slate-950 transition-colors">
                                    {store.name}
                                </span>
                                <span className="text-[11px] font-normal text-slate-400 whitespace-nowrap">
                                    {store.sales}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
