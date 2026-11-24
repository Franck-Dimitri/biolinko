import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/** Bloc de chargement translucide. */
export function Skel({ className = '' }) {
    return <div aria-hidden="true" className={`skel rounded-xl ${className}`} />;
}

/**
 * Vrai quand une navigation vers une autre page dure plus de `delay` ms
 * (pas pour les filtres ou rechargements partiels, qui gardent la page affichée).
 */
export function useSlowNavigation(delay = 250) {
    const [slow, setSlow] = useState(false);
    useEffect(() => {
        let timer = null;
        const offStart = router.on('start', (e) => {
            const v = e.detail.visit;
            if (v.method !== 'get' || v.preserveState === true || v.only?.length || v.prefetch) return;
            clearTimeout(timer);
            timer = setTimeout(() => setSlow(true), delay);
        });
        const offFinish = router.on('finish', () => { clearTimeout(timer); setSlow(false); });
        return () => { clearTimeout(timer); offStart(); offFinish(); };
    }, [delay]);
    return slow;
}

/** Page de tableau de bord en cours de chargement : titre, chiffres clés, deux cartes. */
export function DashboardSkeleton() {
    return (
        <div role="status" aria-label="Chargement" className="space-y-6 text-[#141412]">
            <div className="space-y-2"><Skel className="h-7 w-56" /><Skel className="h-4 w-80 max-w-full" /></div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[0, 1, 2, 3].map((i) => <Skel key={i} className="h-[108px] rounded-3xl" />)}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <Skel className="h-72 rounded-3xl lg:col-span-2" />
                <Skel className="h-72 rounded-3xl" />
            </div>
            <Skel className="h-56 rounded-3xl" />
        </div>
    );
}

/** Page de boutique en cours de chargement : bannière et grille de produits (couleurs du thème). */
export function StorefrontPageSkeleton() {
    return (
        <div role="status" aria-label="Chargement" className="space-y-8">
            <Skel className="h-56 rounded-[var(--r,16px)] sm:h-72" />
            <Skel className="h-6 w-48" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skel className="aspect-[4/5] rounded-[var(--r,16px)]" />
                        <Skel className="h-4 w-4/5" />
                        <Skel className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        </div>
    );
}
