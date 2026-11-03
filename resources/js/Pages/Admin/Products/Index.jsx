import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Package, PackageX, Percent, Trash2 } from 'lucide-react';
import ModerationModal from '@/Components/Admin/ModerationModal';
import { Badge, Card, Empty, PageHeader, Pagination, SearchInput, Stat, Table, Tabs, fcfa } from '@/Components/Dashboard/UI';

export default function ProductsIndex({ products, metrics = {}, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [target, setTarget] = useState(null);
    const [busy, setBusy] = useState(false);
    const first = useRef(true);
    const list = products?.data || [];

    useEffect(() => {
        if (first.current) { first.current = false; return; }
        const t = setTimeout(() => router.get(route('admin.products.index'), { search, promo: filters.promo }, { preserveState: true, replace: true }), 350);
        return () => clearTimeout(t);
    }, [search]);

    const setPromo = (promo) => router.get(route('admin.products.index'), { search, promo }, { preserveState: true, replace: true });

    const remove = ({ reason }) => {
        setBusy(true);
        router.delete(route('admin.products.destroy', target.id), {
            data: { reason },
            preserveScroll: true,
            onSuccess: () => { toast.success(`« ${target.title} » est supprimé, le vendeur a été prévenu.`); setTarget(null); },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Produits, Administration Biolinko" />
            <div hidden={!!target} className="space-y-6 pb-12">
                <PageHeader title="Produits" sub="Le catalogue de toutes les boutiques, pour repérer et retirer ce qui n’a pas sa place." />

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    <Stat label="Produits" value={metrics.total_products ?? 0} Icon={Package} />
                    <Stat label="Visibles" value={metrics.active_products ?? 0} Icon={Eye} delay={0.03} />
                    <Stat label="En promotion" value={metrics.promo_products ?? 0} Icon={Percent} delay={0.06} />
                    <Stat label="En rupture" value={metrics.out_of_stock ?? 0} Icon={PackageX} delay={0.09} />
                </div>

                <Card padded={false}>
                    <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <Tabs id="promo" value={filters.promo || 'all'} onChange={setPromo} tabs={[['all', 'Tous'], ['promo', 'En promo'], ['regular', 'Prix normal']]} />
                        <SearchInput value={search} onChange={setSearch} placeholder="Produit ou boutique" className="sm:w-72" />
                    </div>

                    {list.length ? (
                        <Table head={[['Produit'], ['Boutique'], ['Prix', 'text-right'], ['Stock', 'text-right'], ['État'], ['', 'w-24']]}>
                            {list.map((p) => (
                                <tr key={p.id} className="transition-colors hover:bg-[#FAFAF8]">
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-3">
                                            <span className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#F6F5F1]">{(p.image_url || p.images?.[0]) && <img src={p.image_url || p.images[0]} alt="" loading="lazy" className="h-full w-full object-cover" />}</span>
                                            <span className="min-w-0">
                                                <a href={p.store ? `/${p.store.slug}/p/${p.slug}` : '#'} target="_blank" rel="noreferrer" className="block max-w-[240px] truncate text-[#141412] hover:underline">{p.title}</a>
                                                {p.variants?.length > 0 && <span className="text-[13px] text-[#8B8A83]">{p.variants.length} variante{p.variants.length > 1 ? 's' : ''}</span>}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.store?.user ? <Link href={route('admin.users.show', p.store.user.id)} className="block max-w-[160px] truncate text-[#141412] hover:underline">{p.store.name}</Link> : (p.store?.name || '—')}
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums">
                                        {p.is_promo && p.promo_price
                                            ? <><span className="block text-[#141412]">{fcfa(p.promo_price)}</span><span className="text-[12px] text-[#8B8A83] line-through">{fcfa(p.price_vendor)}</span></>
                                            : fcfa(p.price_vendor)}
                                    </td>
                                    <td className={`px-4 py-3 text-right tabular-nums ${Number(p.stock) === 0 ? 'text-[#B91C1C]' : ''}`}>{p.stock}</td>
                                    <td className="px-4 py-3">
                                        <span className="flex flex-wrap gap-1.5">
                                            <Badge tone={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'Visible' : 'Masqué'}</Badge>
                                            {p.is_promo && <Badge tone="brand">Promo</Badge>}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Link href={route('admin.products.toggleActive', p.id)} method="post" as="button" preserveScroll aria-label={p.is_active ? 'Masquer' : 'Rendre visible'}
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-[#5F5E58] hover:bg-[#F2F1EC]">{p.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Link>
                                            <button type="button" aria-label="Supprimer" onClick={() => setTarget(p)} className="flex h-8 w-8 items-center justify-center rounded-full text-[#B91C1C] hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    ) : <div className="p-6"><Empty Icon={Package} title="Aucun produit" text="Aucun produit ne correspond à ces filtres." /></div>}
                    <Pagination page={products} label="produits" />
                </Card>
            </div>

            <ModerationModal isOpen={!!target} onClose={() => setTarget(null)} onConfirm={remove} type="product" isLoading={busy}
                itemName={target?.title || ''} targetInfo={target ? `Boutique : ${target.store?.name || '—'} · ${target.store?.user?.email || ''}` : null} />
        </AuthenticatedLayout>
    );
}
