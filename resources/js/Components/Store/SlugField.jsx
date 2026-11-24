import { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Loader2, X } from 'lucide-react';
import { storeAddress, storeAddressParts } from '@/Components/Storefront/storeUrl';

/** « Les Douceurs d'Awa » → « les-douceurs-d-awa », comme StoreSlug::normalize côté serveur. */
export const slugify = (v) => String(v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+/g, '').slice(0, 40);

const clean = (v) => slugify(v).replace(/-+$/g, '');

/**
 * Vérifie en direct si l'adresse <slug>.biolinko.store est libre ; sinon, le serveur propose 3 adresses proches.
 * `current` : l'adresse actuelle de la boutique (toujours libre pour elle).
 */
export function useSlugCheck(slug, current = null) {
    const [state, setState] = useState({ status: 'idle', suggestions: [] }); // idle | checking | free | taken | invalid
    const value = clean(slug);

    useEffect(() => {
        if (!value) { setState({ status: 'idle', suggestions: [] }); return undefined; }
        if (value.length < 3) { setState({ status: 'invalid', suggestions: [] }); return undefined; }
        if (current && value === current) { setState({ status: 'free', suggestions: [] }); return undefined; }
        setState((s) => ({ ...s, status: 'checking' }));
        const t = setTimeout(() => {
            axios.get(route('shop.available'), { params: { slug: value } })
                .then(({ data }) => setState(data.slug === value && data.available
                    ? { status: 'free', suggestions: [] }
                    : { status: 'taken', suggestions: data.suggestions || [] }))
                .catch(() => setState({ status: 'idle', suggestions: [] }));
        }, 400);
        return () => clearTimeout(t);
    }, [value, current]);

    return state;
}

/**
 * Champ d'adresse de boutique : préfixe/suffixe du domaine, état de disponibilité et, si l'adresse est prise,
 * 3 propositions à choisir d'un clic.
 */
export default function SlugField({ value, onChange, current = null, check, size = 'md', id = 'store_slug', note = null, placeholder = 'votre-boutique' }) {
    const parts = storeAddressParts();
    const { status, suggestions } = check;
    const text = size === 'sm' ? 'text-[14px]' : 'text-[15px]';
    const changed = current && clean(value) !== current;

    return (
        <div>
            {/* Le suffixe .biolinko.store suit directement le texte : la largeur du champ suit son contenu */}
            <div onClick={() => document.getElementById(id)?.focus()}
                className={`flex cursor-text items-center overflow-hidden rounded-xl border bg-white px-4 transition-colors focus-within:border-black/30 ${size === 'sm' ? 'h-[42px]' : 'h-12'} ${text} ${status === 'taken' ? 'border-[#DC2626]/50' : 'border-black/10'}`}>
                {parts.prefix && <span className="shrink-0 text-[#8B8A83]">{parts.prefix}</span>}
                <span className="inline-grid min-w-0">
                    <span aria-hidden className={`invisible col-start-1 row-start-1 overflow-hidden whitespace-pre pr-px ${text}`}>{value || placeholder}</span>
                    <input id={id} size={1} value={value} onChange={(e) => onChange(slugify(e.target.value))} onBlur={() => onChange(clean(value))}
                        aria-label="Adresse de la boutique" autoComplete="off" spellCheck={false} placeholder={placeholder}
                        className={`col-start-1 row-start-1 w-full min-w-0 border-0 bg-transparent p-0 font-[inherit] leading-normal text-[#141412] placeholder:text-[#8B8A83] focus:ring-0 ${text}`} />
                </span>
                {parts.suffix && <span className="shrink-0 text-[#8B8A83]">{parts.suffix}</span>}
            </div>

            <div className="mt-1.5 text-[13px]" aria-live="polite">
                {status === 'checking' && <span className="inline-flex items-center gap-1.5 text-[#8B8A83]"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Vérification…</span>}
                {status === 'invalid' && <span className="text-[#8B8A83]">3 caractères minimum : lettres, chiffres et tirets.</span>}
                {status === 'free' && (!current || changed) && (
                    <span className="inline-flex items-center gap-1.5 text-[#15803D]"><Check className="h-3.5 w-3.5" strokeWidth={3} /> {storeAddress(clean(value))} est disponible</span>
                )}
                {status === 'taken' && (
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-[#B91C1C]"><X className="h-3.5 w-3.5" strokeWidth={3} /> Cette adresse est déjà prise.{suggestions.length > 0 && ' Choisissez-en une :'}</span>
                        {suggestions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {suggestions.map((s) => (
                                    <button key={s} type="button" onClick={() => onChange(s)}
                                        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-[13px] font-medium text-[#141412] transition-colors hover:border-black/30 hover:bg-[#F6F5F1]">
                                        {storeAddress(s)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {changed && status !== 'taken' && status !== 'checking' && (
                    <p className="mt-1 text-[#8B8A83]">L’ancienne adresse {storeAddress(current)} renverra automatiquement vers la nouvelle.</p>
                )}
                {note && status === 'idle' && <span className="text-[#8B8A83]">{note}</span>}
            </div>
        </div>
    );
}
