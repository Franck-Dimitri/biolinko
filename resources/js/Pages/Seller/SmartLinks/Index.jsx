import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Copy, Eye, Link2, Minus, Package, Plus, ShoppingBag, Trash2, TrendingUp } from 'lucide-react';
import { WhatsappIcon } from '@/Components/BrandIcons';
import { Badge, Button, SubPage, Empty, Field, PageHeader, SearchInput, Stat, Tabs, fcfa, fieldClass, reveal, shortDate } from '@/Components/Dashboard/UI';

const linkUrl = (code) => `${window.location.origin}/pay/${code}`;

function linkState(l) {
    if (!l.is_active) return ['Désactivé', 'neutral'];
    if (l.expires_at && new Date(l.expires_at) < new Date()) return ['Expiré', 'danger'];
    if (l.max_uses && l.sales_count >= l.max_uses) return ['Épuisé', 'warning'];
    return ['Actif', 'success'];
}

function NewLinkDialog({ open, onClose, products }) {
    const { errors } = usePage().props;
    const [title, setTitle] = useState('');
    const [items, setItems] = useState({}); // product_id -> quantité
    const [discountType, setDiscountType] = useState('fixed');
    const [discount, setDiscount] = useState('');
    const [maxUses, setMaxUses] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [search, setSearch] = useState('');
    const [busy, setBusy] = useState(false);

    const subtotal = Object.entries(items).reduce((a, [id, q]) => a + (products.find((p) => p.id === Number(id))?.price || 0) * q, 0);
    const off = discountType === 'percent' ? subtotal * Math.min(100, Number(discount) || 0) / 100 : Math.min(subtotal, Number(discount) || 0);
    const total = Math.max(0, subtotal - off);
    const setQty = (id, q) => setItems((it) => { const n = { ...it }; if (q <= 0) delete n[id]; else n[id] = q; return n; });

    const submit = (e) => {
        e.preventDefault();
        setBusy(true);
        router.post(route('seller.smartlinks.store'), {
            title,
            items: Object.entries(items).map(([product_id, quantity]) => ({ product_id, quantity })),
            discount_type: discountType,
            discount_value: discount || 0,
            max_uses: maxUses || null,
            expires_at: expiresAt || null,
        }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Lien de paiement créé'); setTitle(''); setItems({}); setDiscount(''); setMaxUses(''); setExpiresAt(''); onClose(); },
            onFinish: () => setBusy(false),
        });
    };

    const list = products.filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <SubPage open={open} onClose={onClose} title="Nouveau lien de paiement" sub="Un produit ou un pack, à partager dans une conversation, une story ou une bio." width="max-w-3xl">
            <form onSubmit={submit} className="grid gap-6 md:grid-cols-[1fr_280px]">
                <div className="space-y-4">
                    <Field label="Nom du lien" error={errors?.title}>
                        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Pack fête des mères" className={fieldClass} />
                    </Field>
                    <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-[14px] font-medium text-[#141412]">Produits</span>
                            <SearchInput value={search} onChange={setSearch} placeholder="Rechercher" className="w-48" />
                        </div>
                        <ul className="max-h-72 divide-y divide-black/[0.05] overflow-y-auto rounded-2xl border border-black/[0.08]">
                            {list.map((p) => {
                                const q = items[p.id] || 0;
                                return (
                                    <li key={p.id} className={`flex items-center gap-3 px-3 py-2.5 ${q ? 'bg-[#FFFBEA]' : ''}`}>
                                        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#F6F5F1]">{p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <Package className="m-2.5 h-5 w-5 text-[#8B8A83]" />}</span>
                                        <span className="min-w-0 flex-1"><span className="block truncate text-[14px] text-[#141412]">{p.name}</span><span className="text-[13px] tabular-nums text-[#8B8A83]">{fcfa(p.price)}</span></span>
                                        {q ? (
                                            <span className="flex items-center rounded-full border border-black/10 bg-white">
                                                <button type="button" aria-label="Retirer un" onClick={() => setQty(p.id, q - 1)} className="flex h-8 w-8 items-center justify-center"><Minus className="h-3.5 w-3.5" /></button>
                                                <span className="w-6 text-center text-[14px] tabular-nums">{q}</span>
                                                <button type="button" aria-label="Ajouter un" onClick={() => setQty(p.id, q + 1)} className="flex h-8 w-8 items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                                            </span>
                                        ) : <Button size="sm" onClick={() => setQty(p.id, 1)}><Plus className="h-4 w-4" /> Ajouter</Button>}
                                    </li>
                                );
                            })}
                            {!list.length && <li className="p-6 text-center text-[14px] text-[#8B8A83]">Aucun produit.</li>}
                        </ul>
                        {errors?.items && <p className="mt-1.5 text-[13px] text-[#B91C1C]">Choisissez au moins un produit.</p>}
                    </div>
                </div>

                <div className="space-y-4">
                    <Field label="Remise (facultatif)">
                        <div className="flex gap-2">
                            <input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" className={fieldClass} />
                            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className={`${fieldClass} w-28`}>
                                <option value="fixed">FCFA</option><option value="percent">%</option>
                            </select>
                        </div>
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="Ventes max."><input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Illimité" className={fieldClass} /></Field>
                        <Field label="Expire le" error={errors?.expires_at}><input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={fieldClass} /></Field>
                    </div>
                    <dl className="space-y-1.5 rounded-2xl bg-[#F6F5F1] p-4 text-[14px]">
                        <div className="flex justify-between text-[#5F5E58]"><dt>Sous-total</dt><dd className="tabular-nums">{fcfa(subtotal)}</dd></div>
                        {off > 0 && <div className="flex justify-between text-[#15803D]"><dt>Remise</dt><dd className="tabular-nums">−{fcfa(off)}</dd></div>}
                        <div className="flex justify-between pt-1 text-[17px] font-medium text-[#141412]"><dt>Prix du lien</dt><dd className="tabular-nums">{fcfa(total)}</dd></div>
                        <p className="pt-1 text-[12px] text-[#8B8A83]">Le client paie ce prix + {String(usePage().props.payments?.client_fee_percent ?? 3.5).replace('.', ',')} % de frais de service.</p>
                    </dl>
                    <Button variant="primary" type="submit" className="w-full" disabled={busy || !Object.keys(items).length || !title}><Link2 className="h-4 w-4" /> Créer le lien</Button>
                </div>
            </form>
        </SubPage>
    );
}

function LinkCard({ link, index }) {
    const [label, tone] = linkState(link);
    const url = linkUrl(link.code);
    const conversion = link.views_count ? Math.round((link.sales_count / link.views_count) * 100) : 0;
    const saving = Math.max(0, Number(link.subtotal_amount) - Number(link.total_amount));

    const copy = async () => { try { await navigator.clipboard.writeText(url); toast.success('Lien copié'); } catch (e) { /* indisponible */ } };
    const toggle = () => router.patch(route('seller.smartlinks.toggle', link.id), {}, { preserveScroll: true });
    const remove = () => { if (confirm(`Supprimer le lien « ${link.title} » ?`)) router.delete(route('seller.smartlinks.destroy', link.id), { preserveScroll: true }); };

    return (
        <motion.article {...reveal(Math.min(index, 8) * 0.03)} className="flex flex-col rounded-3xl border border-black/[0.06] bg-white p-5">
            <div className="flex items-start gap-4">
                <div className="flex shrink-0 -space-x-4">
                    {(link.items || []).slice(0, 3).map((it, i) => (
                        <span key={i} className="h-14 w-14 overflow-hidden rounded-2xl border-[3px] border-white bg-[#F6F5F1]">{it.image_url ? <img src={it.image_url} alt="" className="h-full w-full object-cover" /> : <Package className="m-3.5 h-5 w-5 text-[#8B8A83]" />}</span>
                    ))}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="line-clamp-2 text-[16px] font-medium text-[#141412]">{link.title}</h3>
                        <Badge tone={tone}>{label}</Badge>
                    </div>
                    <p className="mt-1 flex flex-wrap items-baseline gap-2">
                        <span className="text-[16px] font-medium tabular-nums text-[#141412]">{fcfa(link.total_amount)}</span>
                        {saving > 0 && <span className="text-[13px] tabular-nums text-[#8B8A83] line-through">{Number(link.subtotal_amount).toLocaleString('fr-FR')}</span>}
                        <span className="text-[13px] text-[#8B8A83]">· {(link.items || []).length} produit{(link.items || []).length > 1 ? 's' : ''}</span>
                    </p>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#F6F5F1] px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[#141412]">{url.replace(/^https?:\/\//, '')}</span>
                <Button size="sm" variant="ghost" onClick={copy}><Copy className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" href={`https://wa.me/?text=${encodeURIComponent(`${link.title} : ${url}`)}`} target="_blank" rel="noreferrer"><WhatsappIcon className="h-4 w-4 text-[#16A34A]" /></Button>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[['Vues', link.views_count || 0], ['Ventes', `${link.sales_count || 0}${link.max_uses ? ` / ${link.max_uses}` : ''}`], ['Conversion', `${conversion} %`]].map(([l, v]) => (
                    <div key={l}><dd className="text-[17px] font-medium tabular-nums text-[#141412]">{v}</dd><dt className="text-[12px] text-[#8B8A83]">{l}</dt></div>
                ))}
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-black/[0.05] pt-3 text-[13px] text-[#8B8A83]">
                <span>{link.expires_at ? `Expire le ${shortDate(link.expires_at)}` : `Créé le ${shortDate(link.created_at)}`}</span>
                <span className="flex gap-1">
                    <Button size="sm" variant="ghost" href={url} target="_blank" title="Voir"><Eye className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={toggle}>{link.is_active ? 'Désactiver' : 'Activer'}</Button>
                    <Button size="sm" variant="ghost" onClick={remove} title="Supprimer"><Trash2 className="h-4 w-4" /></Button>
                </span>
            </div>
        </motion.article>
    );
}

export default function Index({ smartLinks = [], products = [], stats }) {
    const [creating, setCreating] = useState(false);
    const [tab, setTab] = useState('active');
    const active = useMemo(() => smartLinks.filter((l) => linkState(l)[0] === 'Actif'), [smartLinks]);
    const inactive = smartLinks.filter((l) => linkState(l)[0] !== 'Actif');
    const views = smartLinks.reduce((a, l) => a + (l.views_count || 0), 0);
    const shown = tab === 'active' ? active : inactive;

    return (
        <AuthenticatedLayout>
            <Head title="Liens de paiement, Biolinko" />
            <NewLinkDialog open={creating} onClose={() => setCreating(false)} products={products} />
            <div className="space-y-6 pb-12" hidden={creating}>
                <PageHeader title="Liens de paiement" sub="Vendez un produit ou un pack avec un simple lien, sans passer par la boutique."
                    actions={<Button variant="primary" onClick={() => setCreating(true)} disabled={!products.length}><Plus className="h-4 w-4" /> Nouveau lien</Button>} />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Liens actifs" value={active.length} hint={`${smartLinks.length} au total`} Icon={Link2} delay={0.03} />
                    <Stat label="Vues" value={views} Icon={Eye} delay={0.06} />
                    <Stat label="Ventes" value={stats?.total_sales ?? 0} Icon={ShoppingBag} delay={0.09} />
                    <Stat label="Revenus des liens" value={fcfa(stats?.total_revenue)} Icon={TrendingUp} delay={0.12} />
                </div>

                <Tabs id="links" value={tab} onChange={setTab} tabs={[['active', 'Actifs', active.length], ['inactive', 'Inactifs et expirés', inactive.length]]} />

                {shown.length ? (
                    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{shown.map((l, i) => <LinkCard key={l.id} link={l} index={i} />)}</div>
                ) : (
                    <Empty Icon={Link2} title={tab === 'active' ? 'Aucun lien actif' : 'Rien ici'}
                        text={products.length ? 'Créez un lien pour un produit ou un pack à prix réduit, puis partagez-le sur WhatsApp.' : 'Ajoutez d’abord des produits à votre catalogue.'}
                        action={tab === 'active' && products.length > 0 && <Button variant="primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Nouveau lien</Button>} />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
