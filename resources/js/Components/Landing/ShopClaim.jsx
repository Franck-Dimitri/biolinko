import { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { ArrowRight, Check, Loader2, X } from 'lucide-react';

/** « marché d'Awa » → « marche-d-awa », comme ShopIntent::normalize côté serveur. */
const slugify = (v) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/g, '');

/**
 * Champ « biolinko.link/votre-boutique » : vérifie en direct si l'adresse est libre,
 * puis envoie vers l'inscription avec l'adresse réservée (ShopIntent).
 */
export default function ShopClaim({ dark = false, className = '', autoFocus = false }) {
    const auth = usePage().props.auth;
    const [value, setValue] = useState('');
    const [state, setState] = useState({ status: 'idle', slug: '' }); // idle | checking | free | taken
    const timer = useRef(null);
    const slug = slugify(value);

    useEffect(() => {
        clearTimeout(timer.current);
        if (slug.length < 3) { setState({ status: 'idle', slug }); return undefined; }
        setState({ status: 'checking', slug });
        timer.current = setTimeout(() => {
            window.axios.get(route('shop.available'), { params: { slug } })
                .then(({ data }) => setState({ status: data.available ? 'free' : 'taken', slug }))
                .catch(() => setState({ status: 'idle', slug }));
        }, 350);
        return () => clearTimeout(timer.current);
    }, [slug]);

    const submit = (e) => {
        e.preventDefault();
        if (auth?.user) { router.visit(route('dashboard')); return; }
        router.visit(route('register', slug.length >= 3 ? { boutique: slug } : {}));
    };

    const shell = dark
        ? 'border-white/15 bg-white/[0.06] focus-within:border-[#FFCC00]/70'
        : 'border-black/10 bg-white focus-within:border-[#141412]/40 shadow-[0_10px_30px_-18px_rgba(20,20,18,0.35)]';
    const muted = dark ? 'text-white/45' : 'text-[#8B8A83]';
    const ink = dark ? 'text-white placeholder:text-white/35' : 'text-[#141412] placeholder:text-[#B5B3AB]';

    const hint = {
        idle: <span className={muted}>Choisissez l’adresse de votre boutique. Gratuit, sans carte bancaire.</span>,
        checking: <span className={`inline-flex items-center gap-1.5 ${muted}`}><Loader2 className="h-3.5 w-3.5 animate-spin" /> Vérification…</span>,
        free: <span className="inline-flex items-center gap-1.5 text-[#16A34A]"><Check className="h-3.5 w-3.5" strokeWidth={3} /> biolinko.link/{state.slug} est libre</span>,
        taken: <span className="inline-flex items-center gap-1.5 text-[#DC2626]"><X className="h-3.5 w-3.5" strokeWidth={3} /> Déjà prise : essayez une variante</span>,
    }[state.status];

    return (
        <form onSubmit={submit} className={className}>
            <div className={`flex flex-col gap-2 rounded-2xl border p-2 transition-colors sm:flex-row sm:items-center sm:rounded-full sm:pl-5 ${shell}`}>
                <label className="flex min-w-0 flex-1 items-center gap-0.5 px-3 py-2 sm:px-0 sm:py-0">
                    <span className={`shrink-0 text-[15px] ${muted}`}>biolinko.link/</span>
                    <input value={value} onChange={(e) => setValue(e.target.value)} autoFocus={autoFocus}
                        aria-label="Adresse de votre boutique" placeholder="votre-boutique" autoComplete="off" spellCheck={false}
                        className={`min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] font-medium focus:outline-none focus:ring-0 ${ink}`} />
                </label>
                <button type="submit"
                    className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#FFCC00] px-6 text-[15px] font-medium text-[#141412] transition-colors hover:bg-[#FFD633]">
                    {auth?.user ? 'Mon tableau de bord' : 'Créer ma boutique'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
            </div>
            <p aria-live="polite" className="mt-3 min-h-[20px] px-1 text-[13px]">{hint}</p>
        </form>
    );
}
