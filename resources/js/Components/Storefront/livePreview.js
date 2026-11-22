import { useEffect, useState } from 'react';

/*
 * Aperçu en direct de l'éditeur « Apparence » : la page d'édition envoie le brouillon à l'aperçu
 * (iframe de la vitrine, même origine) à chaque modification, sans attendre l'enregistrement.
 */
export const PREVIEW_MESSAGE = 'biolinko:preview';
export const PREVIEW_READY = 'biolinko:preview-ready';

const inPreviewFrame = () => typeof window !== 'undefined' && window.parent !== window
    && new URLSearchParams(window.location.search).has('apercu');

/** Dans la vitrine : la boutique, complétée par le brouillon reçu de l'éditeur. */
export function usePreviewStore(store) {
    const [draft, setDraft] = useState(null);

    useEffect(() => {
        if (!inPreviewFrame()) return undefined;
        const onMessage = (e) => {
            if (e.origin !== window.location.origin || e.data?.type !== PREVIEW_MESSAGE) return;
            setDraft(e.data.store || null);
        };
        window.addEventListener('message', onMessage);
        // Demande le brouillon courant dès que l'aperçu est prêt
        window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
        return () => window.removeEventListener('message', onMessage);
    }, []);

    return draft ? { ...store, ...draft } : store;
}

/** Dans l'éditeur : envoie le brouillon à un aperçu. */
export function sendPreview(frame, draft) {
    try {
        frame?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, store: draft }, window.location.origin);
    } catch (e) { /* aperçu pas encore chargé */ }
}
