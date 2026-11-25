import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * L'équipe configure la boutique d'un vendeur : rappel visible sur toutes ses pages (tableau de bord,
 * création, éditeur plein écran) et retour à l'administration.
 */
export default function ManagingBanner({ initialPage }) {
    const [managing, setManaging] = useState(initialPage?.props?.managing || null);
    useEffect(() => router.on('navigate', (e) => setManaging(e.detail.page.props.managing || null)), []);
    if (!managing) return null;

    return (
        <div role="status" className="fixed inset-x-0 bottom-0 z-[80] flex justify-center px-4 pb-[calc(12px+env(safe-area-inset-bottom,0px))] pointer-events-none">
            <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full bg-[#141412] px-4 py-2 text-center font-sans text-[13.5px] text-white shadow-lg">
                <span>Vous configurez <b className="font-semibold text-[#FFCC00]">{managing.store || managing.name}</b><span className="hidden sm:inline">. Argent, identité et mot de passe restent réservés au vendeur</span>.</span>
                <button type="button" onClick={() => router.post(route('managed.stop'))} className="font-semibold text-[#FFCC00] underline underline-offset-4">Terminer<span className="hidden sm:inline"> et revenir à l’admin</span></button>
            </div>
        </div>
    );
}
