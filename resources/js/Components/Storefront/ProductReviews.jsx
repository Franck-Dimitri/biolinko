import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck, Star } from 'lucide-react';
import { Reveal } from '@/Components/Motion';

const input = 'h-12 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 text-[16px] text-[#141412] placeholder:text-[#5F5E58]/60 focus:border-black/40 focus:ring-0';

function Stars({ value, size = 'h-4 w-4' }) {
    return (
        <span className="flex gap-0.5" aria-label={`${value} sur 5`}>
            {Array.from({ length: 5 }).map((_, s) => <Star key={s} className={`${size} shrink-0 ${s < Math.round(value) ? 'fill-[#F5B800] text-[#F5B800]' : 'text-black/10'}`} />)}
        </span>
    );
}

/** Avis d'un produit : moyenne, liste et formulaire. Un numéro de commande contenant ce produit donne le badge « Achat vérifié ». */
export default function ProductReviews({ store, product, reviews = [], rating, primaryColor, primaryTextColor }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ rating: 5, name: '', city: '', comment: '', tracking_code: '' });
    const [busy, setBusy] = useState(false);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = (e) => {
        e.preventDefault();
        if (!form.name.trim() || form.comment.trim().length < 5) return toast.error('Indiquez votre nom et quelques mots sur le produit.');
        setBusy(true);
        router.post(route('storefront.reviews.store', store.slug), {
            product_id: product.id, customer_name: form.name, customer_city: form.city || null, rating: form.rating,
            comment: form.comment, tracking_code: form.tracking_code || null,
        }, {
            preserveScroll: true,
            onSuccess: () => { setOpen(false); setForm({ rating: 5, name: '', city: '', comment: '', tracking_code: '' }); toast.success('Merci ! Votre avis est publié.'); },
            onError: (er) => toast.error(Object.values(er)[0] || 'Votre avis n’a pas pu être envoyé.'),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <section id="avis" className="scroll-mt-24 space-y-6">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-[28px] font-medium tracking-[-0.03em] text-[#141412]">Avis sur ce produit</h2>
                    {rating?.count > 0 ? (
                        <p className="mt-1 flex items-center gap-2 text-[15px] text-[#5F5E58]"><Stars value={rating.avg} /> {String(rating.avg).replace('.', ',')} sur 5, {rating.count} avis</p>
                    ) : <p className="mt-1 text-[15px] text-[#5F5E58]">Aucun avis pour l’instant. Vous l’avez acheté ? Soyez le premier à donner le vôtre.</p>}
                </div>
                {!open && (
                    <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-full border border-black/15 px-5 text-[15px] font-medium text-[#141412] hover:border-black/40">
                        <Star className="h-4 w-4" /> Donner mon avis
                    </button>
                )}
            </Reveal>

            {open && (
                <form onSubmit={submit} className="space-y-4 rounded-3xl border border-black/[0.08] p-5 sm:p-6">
                    <div>
                        <span className="mb-1.5 block text-sm font-medium text-[#141412]">Votre note</span>
                        <div className="flex gap-1" role="radiogroup" aria-label="Votre note">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={`${n} sur 5`} onClick={() => set('rating', n)} className="p-1">
                                    <Star className={`h-7 w-7 ${n <= form.rating ? 'fill-[#F5B800] text-[#F5B800]' : 'text-black/15'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><label htmlFor="rv-name" className="mb-1.5 block text-sm font-medium text-[#141412]">Votre prénom</label><input id="rv-name" maxLength={255} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex. Awa" className={input} /></div>
                        <div><label htmlFor="rv-city" className="mb-1.5 block text-sm font-medium text-[#141412]">Ville (facultatif)</label><input id="rv-city" maxLength={255} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Ex. Douala" className={input} /></div>
                    </div>
                    <div><label htmlFor="rv-comment" className="mb-1.5 block text-sm font-medium text-[#141412]">Votre avis</label><textarea id="rv-comment" rows={4} maxLength={1000} value={form.comment} onChange={(e) => set('comment', e.target.value)} placeholder="Qualité, taille, livraison…" className={`${input} h-auto py-3`} /></div>
                    <div>
                        <label htmlFor="rv-code" className="mb-1.5 block text-sm font-medium text-[#141412]">Numéro de commande (facultatif)</label>
                        <input id="rv-code" maxLength={100} value={form.tracking_code} onChange={(e) => set('tracking_code', e.target.value.toUpperCase().trim())} placeholder="Ex. BLK-CMD-…" className={`${input} font-mono`} />
                        <p className="mt-1.5 text-[13px] text-[#5F5E58]">Il affiche le badge « Achat vérifié » sur votre avis.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-full px-5 text-[15px] text-[#5F5E58] hover:text-[#141412]">Annuler</button>
                        <button type="submit" disabled={busy} className="h-11 rounded-full px-6 text-[15px] font-semibold disabled:opacity-60" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>{busy ? 'Envoi…' : 'Publier mon avis'}</button>
                    </div>
                </form>
            )}

            {reviews.length > 0 && (
                <ul className="grid gap-4 md:grid-cols-2">
                    {reviews.map((r) => (
                        <li key={r.id} className="space-y-3 overflow-hidden rounded-3xl border border-black/[0.08] p-5">
                            <div className="flex items-center justify-between gap-3">
                                <Stars value={r.rating} />
                                {r.is_verified && <span className="inline-flex items-center gap-1 text-[13px] text-[#15803D]"><BadgeCheck className="h-4 w-4" /> Achat vérifié</span>}
                            </div>
                            <p className="whitespace-pre-line break-words leading-relaxed text-[#141412]">{r.comment}</p>
                            <p className="truncate text-sm text-[#5F5E58]">{r.customer_name}{r.customer_city ? `, ${r.customer_city}` : ''} · {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
