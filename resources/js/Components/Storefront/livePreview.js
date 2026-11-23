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

/*
 * Éditeur de vitrine : un clic sur une section de l'aperçu la sélectionne dans l'éditeur,
 * et la section choisie dans l'éditeur est entourée dans l'aperçu.
 */
export const SECTION_CLICK = 'biolinko:section-click';
export const SECTION_SELECT = 'biolinko:section-select';

export function usePreviewSelection() {
    const [selected, setSelected] = useState(null);
    const inFrame = inPreviewFrame();
    useEffect(() => {
        if (!inFrame) return undefined;
        const onMessage = (e) => {
            if (e.origin !== window.location.origin || e.data?.type !== SECTION_SELECT) return;
            setSelected(e.data.id || null);
            if (e.data.id && e.data.scroll) document.querySelector(`[data-sid="${e.data.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [inFrame]);
    const pick = (id) => window.parent.postMessage({ type: SECTION_CLICK, id }, window.location.origin);
    return { inFrame, selected, pick };
}

export function selectInPreview(frame, id, scroll = true) {
    try {
        frame?.contentWindow?.postMessage({ type: SECTION_SELECT, id, scroll }, window.location.origin);
    } catch (e) { /* aperçu pas encore chargé */ }
}
