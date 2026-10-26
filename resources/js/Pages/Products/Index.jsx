import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertTriangle, Copy, Eye, ImagePlus, MoreHorizontal, Package, Pencil, Percent, Plus, Trash2, X } from 'lucide-react';
import { compressImages } from '@/Utils/imageCompressor';
import { Badge, Button, Empty, Field, PageHeader, SubPage, PlanLock, SearchInput, Stat, Tabs, fcfa, fieldClass, reveal } from '@/Components/Dashboard/UI';

const LOW_STOCK = 3;
const isPromo = (p) => p.is_promo && Number(p.promo_price) > 0 && Number(p.promo_price) < Number(p.price_vendor);
const blank = { title: '', description: '', price_vendor: '', stock: 10, min_order_quantity: 1, is_promo: false, promo_price: '', promo_start_at: '', promo_end_at: '', is_active: true, images_files: [], kept_images: [], variants: [] };

function ProductEditor({ product, onClose, limits }) {
    const editing = !!product?.id;
    const starter = limits.plan === 'starter';
    const form = useForm(editing ? {
        ...blank,
        title: product.title || '', description: product.description || '', price_vendor: product.price_vendor != null ? Number(product.price_vendor) : '', stock: product.stock ?? 0,
        min_order_quantity: product.min_order_quantity || 1, is_promo: !!product.is_promo, promo_price: product.promo_price ? Number(product.promo_price) : '',
        promo_start_at: product.promo_start_at?.substring(0, 10) || '', promo_end_at: product.promo_end_at?.substring(0, 10) || '', is_active: !!product.is_active,
        kept_images: product.images?.length ? product.images : (product.image_url ? [product.image_url] : []),
        variants: (product.variants || []).map((v) => ({ id: v.id, name: v.name || '', size: v.size || '', color: v.color || '', price: v.price ? Number(v.price) : '', stock_quantity: v.stock_quantity ?? 10 })),
    } : blank);
    const { data, setData, errors, processing } = form;
    const [previews, setPreviews] = useState([]);
    const slots = limits.max_images - data.kept_images.length - data.images_files.length;

    const addFiles = async (e) => {
        const files = Array.from(e.target.files || []).slice(0, Math.max(0, slots));
        e.target.value = '';
        if (!files.length) return;
        setPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
        const compressed = await compressImages(files);
        setData('images_files', [...data.images_files, ...compressed]);
    };
    const removeNew = (i) => { setPreviews((p) => p.filter((_, j) => j !== i)); setData('images_files', data.images_files.filter((_, j) => j !== i)); };
    const removeKept = (url) => setData('kept_images', data.kept_images.filter((u) => u !== url));

    const setVariant = (i, k, v) => setData('variants', data.variants.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
    const addVariant = () => {
        if (starter && data.variants.length >= 1) return toast.error('Le plan Starter permet 1 variante par produit.');
        setData('variants', [...data.variants, { name: '', size: '', color: '', price: '', stock_quantity: 10 }]);
    };

    const submit = (e) => {
        e.preventDefault();
        const opts = { forceFormData: true, preserveScroll: true, onSuccess: () => { toast.success(editing ? 'Produit mis à jour' : 'Produit ajouté'); onClose(); } };
        // Un tableau vide n'est pas transmis en multipart : valeurs neutres pour « tout retirer »
        form.transform((d) => ({
            ...d,
            kept_images: d.kept_images.length ? d.kept_images : [''],
            variants: d.variants.length ? d.variants : [{ name: '' }],
        }));
        if (editing) form.post(route('products.update.post', product.id), opts);
        else form.post(route('products.store'), opts);
    };

    return (
        <SubPage onClose={onClose} backLabel="Retour au catalogue" title={editing ? 'Modifier le produit' : 'Nouveau produit'}
            sub={editing ? product.title : 'Une photo, un nom et un prix suffisent pour commencer à vendre.'}>
                <form id="product-form" onSubmit={submit} className="space-y-6">
                    {errors.title && errors.title.length > 60 && <div className="rounded-2xl bg-red-50 p-4 text-[14px] text-[#B91C1C]">{errors.title}</div>}

                    <section>
                        <div className="mb-2 flex items-baseline justify-between">
                            <span className="text-[14px] font-medium text-[#141412]">Photos</span>
                            <span className="text-[13px] text-[#8B8A83]">{data.kept_images.length + data.images_files.length} / {limits.max_images}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {data.kept_images.map((url, i) => (
                                <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-[#F6F5F1]">
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                    {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 text-[10px] text-[#141412]">Principale</span>}
                                    <button type="button" onClick={() => removeKept(url)} aria-label="Retirer la photo" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
                                </div>
                            ))}
                            {previews.map((url, i) => (
                                <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-[#F6F5F1]">
                                    <img src={url} alt="" className="h-full w-full object-cover" />
                                    <button type="button" onClick={() => removeNew(i)} aria-label="Retirer la photo" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90"><X className="h-3.5 w-3.5" /></button>
                                </div>
                            ))}
                            {slots > 0 && (
                                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-black/15 text-[12px] text-[#5F5E58] hover:border-black/30 hover:bg-[#FAFAF8]">
                                    <ImagePlus className="h-5 w-5" /> Ajouter
                                    <input type="file" accept="image/*" multiple onChange={addFiles} className="sr-only" />
                                </label>
                            )}
                        </div>
                        {slots <= 0 && starter && <p className="mt-2 text-[13px] text-[#8B8A83]">Plus de photos par produit avec le plan Pro.</p>}
                        {errors['images_files.0'] && <p className="mt-2 text-[13px] text-[#B91C1C]">{errors['images_files.0']}</p>}
                    </section>

                    <Field label="Nom du produit" error={errors.title && errors.title.length <= 60 ? errors.title : null}>
                        <input required value={data.title} onChange={(e) => setData('title', e.target.value)} placeholder="Ex. Robe pagne évasée" className={fieldClass} />
                    </Field>
                    <Field label="Description" error={errors.description}>
                        <textarea rows={4} value={data.description} onChange={(e) => setData('description', e.target.value)} placeholder="Matière, tailles, entretien, délai de livraison…" className={`${fieldClass} h-auto py-3`} />
                    </Field>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Prix" error={errors.price_vendor}>
                            <div className="relative"><input required type="number" min="0" value={data.price_vendor} onChange={(e) => setData('price_vendor', e.target.value)} className={`${fieldClass} pr-14`} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#8B8A83]">FCFA</span></div>
                        </Field>
                        <Field label="Stock" error={errors.stock}><input required type="number" min="0" value={data.stock} onChange={(e) => setData('stock', e.target.value)} className={fieldClass} /></Field>
                        <Field label="Quantité min." error={errors.min_order_quantity}><input required type="number" min="1" value={data.min_order_quantity} onChange={(e) => setData('min_order_quantity', e.target.value)} className={fieldClass} /></Field>
                    </div>

                    <section className="rounded-2xl border border-black/[0.08] p-4">
                        <label className="flex items-center justify-between gap-3">
                            <span><span className="block text-[15px] font-medium text-[#141412]">Promotion</span><span className="text-[13px] text-[#8B8A83]">Prix barré et compte à rebours sur la vitrine.</span></span>
                            <input type="checkbox" disabled={starter} checked={data.is_promo} onChange={(e) => setData('is_promo', e.target.checked)} className="h-5 w-5 rounded border-black/20 text-[#141412] focus:ring-0" />
                        </label>
                        {starter && <div className="mt-3"><PlanLock plan="Pro" text="Les promotions sont disponibles à partir du plan Pro." /></div>}
                        {data.is_promo && !starter && (
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <Field label="Prix promo" error={errors.promo_price}><input type="number" min="0" value={data.promo_price} onChange={(e) => setData('promo_price', e.target.value)} className={fieldClass} /></Field>
                                <Field label="Début"><input type="date" value={data.promo_start_at} onChange={(e) => setData('promo_start_at', e.target.value)} className={fieldClass} /></Field>
                                <Field label="Fin"><input type="date" value={data.promo_end_at} onChange={(e) => setData('promo_end_at', e.target.value)} className={fieldClass} /></Field>
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="mb-2 flex items-center justify-between">
                            <span><span className="block text-[14px] font-medium text-[#141412]">Variantes</span><span className="text-[13px] text-[#8B8A83]">Tailles, couleurs, avec un prix différent si besoin.</span></span>
                            <Button size="sm" onClick={addVariant}><Plus className="h-4 w-4" /> Ajouter</Button>
                        </div>
                        {data.variants.length > 0 && (
                            <div className="space-y-2">
                                {data.variants.map((v, i) => (
                                    <div key={v.id || i} className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F6F5F1] p-3 sm:grid-cols-[1fr_1fr_110px_80px_36px]">
                                        <input aria-label="Taille" value={v.size} onChange={(e) => setVariant(i, 'size', e.target.value)} placeholder="Taille (M, 42…)" className={fieldClass} />
                                        <input aria-label="Couleur" value={v.color} onChange={(e) => setVariant(i, 'color', e.target.value)} placeholder="Couleur" className={fieldClass} />
                                        <input aria-label="Prix de la variante" type="number" min="0" value={v.price} onChange={(e) => setVariant(i, 'price', e.target.value)} placeholder="Prix" className={fieldClass} />
                                        <input aria-label="Stock de la variante" type="number" min="0" value={v.stock_quantity} onChange={(e) => setVariant(i, 'stock_quantity', e.target.value)} className={fieldClass} />
                                        <button type="button" aria-label="Supprimer la variante" onClick={() => setData('variants', data.variants.filter((_, j) => j !== i))} className="flex h-11 w-9 items-center justify-center rounded-full text-[#8B8A83] hover:text-[#B91C1C]"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-black/[0.08] p-4">
                        <span><span className="block text-[15px] font-medium text-[#141412]">Visible sur la boutique</span><span className="text-[13px] text-[#8B8A83]">Décochez pour le masquer sans le supprimer.</span></span>
                        <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="h-5 w-5 rounded border-black/20 text-[#141412] focus:ring-0" />
                    </label>
                </form>

                <div className="mt-8 flex justify-end gap-2 border-t border-black/[0.06] pt-6">
                    <Button onClick={onClose}>Annuler</Button>
                    <Button variant="primary" type="submit" form="product-form" disabled={processing}>{editing ? 'Enregistrer' : 'Ajouter le produit'}</Button>
                </div>
        </SubPage>
    );
}

function ProductCard({ product, store, onEdit, index }) {
    const [menu, setMenu] = useState(false);
    const promo = isPromo(product);
    const low = Number(product.stock) <= LOW_STOCK;
    const url = `${window.location.origin}/${store.slug}/p/${product.slug}`;
    const image = product.image_url || product.images?.[0];

    const remove = () => {
        if (!confirm(`Supprimer « ${product.title} » ? Cette action est définitive.`)) return;
        router.delete(route('products.destroy', product.id), { preserveScroll: true, onSuccess: () => toast.success('Produit supprimé') });
    };
    const copy = async () => { try { await navigator.clipboard.writeText(url); toast.success('Lien du produit copié'); } catch (e) { /* indisponible */ } setMenu(false); };

    return (
        <motion.article {...reveal(Math.min(index, 10) * 0.03)} className={`group flex flex-col overflow-hidden rounded-3xl border border-black/[0.06] bg-white ${product.is_active ? '' : 'opacity-70'}`}>
            <button type="button" onClick={onEdit} className="relative aspect-[4/3] overflow-hidden bg-[#F6F5F1]">
                {image ? <img src={image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /> : <Package className="m-auto h-8 w-8 text-[#8B8A83]" />}
                <span className="absolute left-3 top-3 flex gap-1.5">
                    {!product.is_active && <Badge>Masqué</Badge>}
                    {promo && <Badge tone="brand">−{Math.round((1 - product.promo_price / product.price_vendor) * 100)} %</Badge>}
                </span>
            </button>
            <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-[15px] font-medium text-[#141412]">{product.title}</h3>
                    <div className="relative shrink-0">
                        <button type="button" onClick={() => setMenu((v) => !v)} aria-label="Plus d’actions" className="flex h-8 w-8 items-center justify-center rounded-full text-[#5F5E58] hover:bg-black/5"><MoreHorizontal className="h-4 w-4" /></button>
                        <AnimatePresence>
                            {menu && (
                                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onMouseLeave={() => setMenu(false)}
                                    className="absolute right-0 top-9 z-10 w-48 rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-lg">
                                    <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl px-3 py-2 text-[14px] text-[#141412] hover:bg-[#F6F5F1]"><Eye className="h-4 w-4" /> Voir sur la boutique</a>
                                    <button type="button" onClick={copy} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[14px] text-[#141412] hover:bg-[#F6F5F1]"><Copy className="h-4 w-4" /> Copier le lien</button>
                                    <button type="button" onClick={remove} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[14px] text-[#B91C1C] hover:bg-red-50"><Trash2 className="h-4 w-4" /> Supprimer</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-[16px] font-medium tabular-nums text-[#141412]">{fcfa(promo ? product.promo_price : product.price_vendor)}</span>
                    {promo && <span className="text-[13px] tabular-nums text-[#8B8A83] line-through">{Number(product.price_vendor).toLocaleString('fr-FR')}</span>}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4 text-[13px]">
                    <span className={low ? 'flex items-center gap-1 text-[#B45309]' : 'text-[#8B8A83]'}>
                        {low && <AlertTriangle className="h-3.5 w-3.5" />}{Number(product.stock) === 0 ? 'Épuisé' : `${product.stock} en stock`}
                        {product.variants?.length ? ` · ${product.variants.length} variante${product.variants.length > 1 ? 's' : ''}` : ''}
                    </span>
                    <Button size="sm" variant="ghost" onClick={onEdit}><Pencil className="h-4 w-4" /> Modifier</Button>
                </div>
            </div>
        </motion.article>
    );
}

export default function Index({ store, products = [], metrics, planLimits }) {
    const [editing, setEditing] = useState(null); // null | {} (nouveau) | produit
    const [tab, setTab] = useState('all');
    const [search, setSearch] = useState('');
    const limits = { max_products: 10, max_stock: 25, max_images: 2, plan: 'starter', ...planLimits };
    const atLimit = products.length >= limits.max_products;

    const counts = useMemo(() => ({
        active: products.filter((p) => p.is_active).length,
        promo: products.filter(isPromo).length,
        low: products.filter((p) => Number(p.stock) <= LOW_STOCK).length,
        hidden: products.filter((p) => !p.is_active).length,
    }), [products]);

    const shown = products.filter((p) => {
        if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (tab === 'promo') return isPromo(p);
        if (tab === 'low') return Number(p.stock) <= LOW_STOCK;
        if (tab === 'hidden') return !p.is_active;
        return true;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Produits, Biolinko" />
            {editing && <ProductEditor key={editing.id || 'new'} product={editing} limits={limits} onClose={() => setEditing(null)} />}
            <div className="space-y-6 pb-12" hidden={!!editing}>
                <PageHeader title="Produits" sub="Votre catalogue, vos prix, vos stocks et vos promotions."
                    actions={<Button variant="primary" onClick={() => setEditing({})} disabled={atLimit}><Plus className="h-4 w-4" /> Nouveau produit</Button>} />

                {atLimit && <PlanLock plan={limits.plan === 'starter' ? 'Pro' : 'Growth'} text={`Vous avez atteint la limite de ${limits.max_products} produits de votre plan.`} />}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Produits" value={`${products.length} / ${limits.max_products > 9999 ? '∞' : limits.max_products}`} hint={`${counts.active} visible${counts.active > 1 ? 's' : ''} sur la boutique`} Icon={Package} delay={0.03} />
                    <Stat label="Valeur du stock" value={fcfa(metrics?.totalStockValue)} hint="Prix × quantités" Icon={Package} delay={0.06} />
                    <Stat label="Stock faible" value={counts.low} hint={`${LOW_STOCK} unités ou moins`} Icon={AlertTriangle} accent={counts.low > 0} delay={0.09} />
                    <Stat label="En promotion" value={counts.promo} Icon={Percent} delay={0.12} />
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <Tabs id="products" value={tab} onChange={setTab} tabs={[['all', 'Tous', products.length], ['promo', 'En promotion', counts.promo], ['low', 'Stock faible', counts.low], ['hidden', 'Masqués', counts.hidden]]} />
                    <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un produit" className="lg:w-72" />
                </div>

                {shown.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {shown.map((p, i) => <ProductCard key={p.id} product={p} store={store} index={i} onEdit={() => setEditing(p)} />)}
                    </div>
                ) : (
                    <Empty Icon={Package} title={products.length ? 'Aucun produit ici' : 'Ajoutez votre premier produit'}
                        text={products.length ? 'Essayez un autre filtre ou une autre recherche.' : 'Une photo, un nom et un prix suffisent pour commencer à vendre.'}
                        action={!products.length && <Button variant="primary" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Nouveau produit</Button>} />
                )}
            </div>

        </AuthenticatedLayout>
    );
}
