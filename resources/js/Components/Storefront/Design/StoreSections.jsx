import { ANCHORS, CHROME, resolveSection } from './registry';
import { designVars } from './tokens';
import { usePreviewSelection } from '@/Components/Storefront/livePreview';
import { CATALOG_LABELS } from './labels';
import './storefront.css';

/**
 * Corps de la vitrine : les sections visibles, dans l'ordre choisi. Les sections du template sont rendues
 * dans .sfd (styles pilotés par les variables du template) ; les sections « classic » gardent leur apparence.
 */
export default function StoreSections({ design, ctx }) {
    const seen = new Set();
    const fullCtx = { ...ctx, design };
    // Dans l'éditeur : clic = sélection de la section (pas de navigation), section choisie entourée
    const { inFrame, selected, pick } = usePreviewSelection();
    return (
        <div data-template={design.template} style={designVars(design.style)}>
            {design.sections.map((section) => {
                if (!section.enabled || CHROME.includes(section.type)) return null;
                const resolved = resolveSection(section.type, section.variant);
                if (!resolved) return null;
                const anchorId = ANCHORS[section.type];
                const anchor = anchorId && !seen.has(anchorId) ? (seen.add(anchorId), anchorId) : section.id;
                const { Component, classic } = resolved;
                const el = <Component section={section} ctx={fullCtx} anchor={anchor} />;
                const edit = inFrame ? {
                    'data-sid': section.id,
                    onClickCapture: (e) => { e.preventDefault(); e.stopPropagation(); pick(section.id); },
                } : {};
                const cls = `${classic ? '' : 'sfd'} ${inFrame ? 'sfd-edit' : ''} ${selected === section.id ? 'sfd-sel' : ''}`.trim();
                return (
                    <div key={section.id} className={cls || undefined} {...edit}>
                        {inFrame && <span className="sfd-tag">{CATALOG_LABELS[section.type] || section.type}</span>}
                        {el}
                    </div>
                );
            })}
        </div>
    );
}

/** Page « Tout le catalogue » : la première section Produits (ou Prestations) du template, sans limite. */
export function StoreCatalog({ design, ctx }) {
    const section = design.sections.find((s) => s.type === 'products' && s.enabled)
        || design.sections.find((s) => s.type === 'services' && s.enabled)
        || { id: 'products', type: 'products', variant: 'classic', settings: {} };
    const resolved = resolveSection(section.type, section.variant);
    const { Component, classic } = resolved;
    const el = <Component section={section} ctx={{ ...ctx, design, fullCatalog: true }} anchor="catalog-grid" />;
    return <div style={designVars(design.style)}>{classic ? el : <div className="sfd">{el}</div>}</div>;
}
