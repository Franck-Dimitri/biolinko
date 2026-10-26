import UpgradeHint from '@/Components/Dashboard/UpgradeHint';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowRight, ArrowUpRight, Check, Eye, FileText, Link2, MessageCircle, Package, PackageCheck, Palette, Plus, Rocket, ShoppingBag, TrendingUp, Wallet,
} from 'lucide-react';
import { EASE_OUT } from '@/Components/Motion';

const fcfa = (n) => `${Math.round(Number(n) || 0).toLocaleString('fr-FR')} FCFA`;

const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: EASE_OUT },
});

const ORDER_STATUS = {
    pending: ['En attente', 'bg-[#FFF3C4] text-[#7A5B00]'],
    paid: ['Payée', 'bg-[#DCFCE7] text-[#15803D]'],
    in_delivery: ['En livraison', 'bg-[#DBEAFE] text-[#1D4ED8]'],
    delivered: ['Livrée', 'bg-[#F2F1EC] text-[#5F5E58]'],
    cancelled: ['Annulée', 'bg-red-50 text-[#B91C1C]'],
};

function Card({ children, className = '', delay = 0 }) {
    return (
        <motion.section {...reveal(delay)} className={`rounded-3xl border border-black/[0.06] bg-white p-6 ${className}`}>
            {children}
        </motion.section>
    );
}

function CardHeader({ title, sub, href, linkLabel }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h2 className="text-[17px] font-medium text-[#141412]">{title}</h2>
                {sub && <p className="mt-0.5 text-[14px] text-[#8B8A83]">{sub}</p>}
            </div>
            {href && (
                <Link href={href} className="flex shrink-0 items-center gap-1 text-[14px] text-[#5F5E58] hover:text-[#141412]">
                    {linkLabel} <ArrowRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}

function Metric({ label, value, hint, Icon, href, delay }) {
    const body = (
        <motion.div {...reveal(delay)} className="group h-full rounded-3xl border border-black/[0.06] bg-white p-5 transition-colors hover:border-black/15">
            <div className="flex items-center justify-between text-[14px] text-[#5F5E58]">
                {label}
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F6F5F1] text-[#141412]"><Icon className="h-4 w-4" /></span>
            </div>
            <p className="mt-4 text-[26px] font-medium tracking-[-0.02em] tabular-nums text-[#141412]">{value}</p>
            {hint && <p className="mt-1 text-[13px] text-[#8B8A83]">{hint}</p>}
        </motion.div>
    );
    return href ? <Link href={href} className="block">{body}</Link> : body;
}

function SalesChart({ days }) {
    const max = Math.max(...days.map((d) => d.revenue), 1);
    const total = days.reduce((a, d) => a + d.revenue, 0);
    return (
        <div>
            <p className="text-[26px] font-medium tracking-[-0.02em] tabular-nums text-[#141412]">{fcfa(total)}</p>
            <div className="mt-6 flex h-44 items-end gap-1.5">
                {days.map((d, i) => {
                    const h = d.revenue > 0 ? Math.max(6, (d.revenue / max) * 100) : 3;
                    return (
                        <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
                            <span className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#141412] px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {d.date} · {fcfa(d.revenue)}
                            </span>
                            <motion.span initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.7, delay: i * 0.03, ease: EASE_OUT }}
                                className={`w-full rounded-md ${d.revenue > 0 ? 'bg-[#FFCC00] group-hover:bg-[#E6B800]' : 'bg-[#F2F1EC]'}`} />
                        </div>
                    );
                })}
            </div>
            <div className="mt-2 flex justify-between text-[12px] text-[#8B8A83]">
                <span>{days[0]?.date}</span><span>{days[days.length - 1]?.date}</span>
            </div>
        </div>
    );
}

function Onboarding({ store, checklist, percent, productsCount }) {
    const steps = [
        ['Compte créé', checklist?.store_created, null, Check],
        ['Logo et couleurs', checklist?.appearance_configured, route('appearance.index'), Palette],
        [`Premier produit${productsCount ? ` (${productsCount})` : ''}`, checklist?.first_product, route('products.index'), Package],
        ['Publier la boutique', store?.is_published, null, Rocket],
    ];
    return (
        <Card className="overflow-hidden">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div>
                    <p className="text-[14px] text-[#8B8A83]">Mise en route · {percent} %</p>
                    <h2 className="mt-1 text-[22px] font-medium tracking-[-0.02em] text-[#141412]">Encore quelques étapes avant votre première vente</h2>
                </div>
                <Link href={route('store.togglePublish')} method="post" as="button"
                    className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#141412] px-5 text-[14px] font-medium text-white hover:bg-[#2B2A26]">
                    <Rocket className="h-4 w-4" /> Publier ma boutique
                </Link>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#F2F1EC]">
                <motion.div className="h-full rounded-full bg-[#FFCC00]" initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.9, ease: EASE_OUT }} />
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {steps.map(([label, done, href, Icon]) => {
                    const inner = (
                        <span className={`flex items-center gap-3 rounded-2xl border p-3.5 text-[14px] ${done ? 'border-transparent bg-[#F0FDF4] text-[#15803D]' : 'border-black/[0.08] text-[#141412] hover:border-black/20'}`}>
                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? 'bg-[#16A34A] text-white' : 'bg-[#F6F5F1]'}`}>
                                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                            </span>
                            {label}
                        </span>
                    );
                    return href && !done ? <Link key={label} href={href}>{inner}</Link> : <div key={label}>{inner}</div>;
                })}
            </div>
        </Card>
    );
}

export default function Dashboard({ upgradeHint = null, store, wallet, productsCount, ordersCount, totalRevenue, recentOrders = [], setupChecklist, completionPercentage, analytics }) {
    const user = usePage().props.auth.user;
    const products = usePage().props.products || [];
    const dailySales = analytics?.dailySales || [];
    const topProducts = analytics?.topProducts || [];
    const ready = store?.is_published || completionPercentage >= 100;
    const hour = new Date().getHours();
    const hello = hour < 18 ? 'Bonjour' : 'Bonsoir';

    return (
        <AuthenticatedLayout>
            <Head title="Tableau de bord, Biolinko" />

            <div className="space-y-6 pb-12">
                {/* En-tête */}
                <motion.div {...reveal()} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="flex items-center gap-2 text-[14px] text-[#8B8A83]">
                            <span className={`h-2 w-2 rounded-full ${store?.is_published ? 'bg-[#16A34A]' : 'bg-[#F59E0B]'}`} />
                            {store?.is_published ? 'Boutique en ligne' : 'Boutique non publiée'}
                        </p>
                        <h1 className="mt-1 text-[30px] font-medium tracking-[-0.03em] text-[#141412]">{hello}, {(user?.name || '').split(' ')[0]}</h1>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('products.index')} className="inline-flex h-10 items-center gap-2 rounded-full bg-[#141412] px-4 text-[14px] font-medium text-white hover:bg-[#2B2A26]">
                            <Plus className="h-4 w-4" /> Ajouter un produit
                        </Link>
                        {store && (
                            <a href={`/${store.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[14px] font-medium text-[#141412] hover:border-black/30">
                                <Eye className="h-4 w-4" /> Voir ma boutique
                            </a>
                        )}
                    </div>
                </motion.div>

                <UpgradeHint hint={upgradeHint} />

                {!ready && store && <Onboarding store={store} checklist={setupChecklist} percent={completionPercentage} productsCount={productsCount} />}

                {analytics?.pendingFollowupsCount > 0 && (
                    <motion.div {...reveal(0.05)} className="flex flex-col justify-between gap-4 rounded-3xl border border-[#FFCC00]/50 bg-[#FFF8D6] p-5 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFCC00]"><MessageCircle className="h-5 w-5" /></span>
                            <div>
                                <p className="text-[15px] font-medium text-[#141412]">
                                    {analytics.pendingFollowupsCount} commande{analytics.pendingFollowupsCount > 1 ? 's' : ''} en attente de paiement
                                </p>
                                <p className="text-[14px] text-[#5F5E58]">Relancez vos clients sur WhatsApp pour finaliser ces ventes.</p>
                            </div>
                        </div>
                        <Link href={route('orders.index')} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#141412] px-4 text-[14px] font-medium text-white hover:bg-[#2B2A26]">
                            Voir les commandes <ArrowRight className="h-4 w-4" />
                        </Link>
                    </motion.div>
                )}

                {/* Indicateurs */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric label="Chiffre d’affaires" value={fcfa(totalRevenue)} hint="Total des ventes payées" Icon={TrendingUp} delay={0.04} />
                    <Metric label="Solde disponible" value={fcfa(wallet?.balance_available)} hint="Retirable vers Mobile Money" Icon={Wallet} href={route('seller.wallet.index')} delay={0.08} />
                    <Metric label="Commandes" value={(ordersCount || 0).toLocaleString('fr-FR')} hint={analytics?.pendingFollowupsCount ? `${analytics.pendingFollowupsCount} en attente` : 'Toutes périodes'} Icon={PackageCheck} href={route('orders.index')} delay={0.12} />
                    <Metric label="Produits" value={(productsCount || 0).toLocaleString('fr-FR')} hint="Dans votre catalogue" Icon={ShoppingBag} href={route('products.index')} delay={0.16} />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2" delay={0.1}>
                        <CardHeader title="Ventes des 14 derniers jours" sub="Revenus encaissés par jour" />
                        <div className="mt-5"><SalesChart days={dailySales} /></div>
                    </Card>

                    <Card delay={0.14} className="flex flex-col">
                        <CardHeader title="Liens de paiement" sub="Ventes depuis vos liens partagés" href={route('seller.smartlinks.index')} linkLabel="Gérer" />
                        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                            {[['Vues', analytics?.totalViews || 0], ['Ventes', analytics?.totalSmartSales || 0], ['Conversion', `${analytics?.conversionRate || 0} %`]].map(([l, v]) => (
                                <div key={l} className="rounded-2xl bg-[#F6F5F1] p-3">
                                    <p className="text-[20px] font-medium tabular-nums text-[#141412]">{v}</p>
                                    <p className="text-[12px] text-[#8B8A83]">{l}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-5">
                            <Link href={route('seller.smartlinks.index')} className="flex h-11 items-center justify-center gap-2 rounded-full border border-black/10 text-[14px] font-medium text-[#141412] hover:border-black/30">
                                <Link2 className="h-4 w-4" /> Créer un lien de paiement
                            </Link>
                        </div>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2" delay={0.12}>
                        <CardHeader title="Dernières commandes" href={route('orders.index')} linkLabel="Tout voir" />
                        {recentOrders.length ? (
                            <ul className="mt-4 divide-y divide-black/[0.06]">
                                {recentOrders.map((o) => {
                                    const [label, cls] = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
                                    return (
                                        <li key={o.id} className="flex items-center gap-3 py-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F6F5F1] text-[13px] font-medium text-[#141412]">{(o.customer_name || '?').charAt(0).toUpperCase()}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[14px] text-[#141412]">{o.customer_name}</p>
                                                <p className="truncate text-[13px] text-[#8B8A83]">
                                                    {(o.items || []).map((it) => it.product_title).filter(Boolean).join(', ') || o.tracking_code}
                                                </p>
                                            </div>
                                            <span className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-[12px] font-medium sm:inline ${cls}`}>{label}</span>
                                            <span className="w-28 shrink-0 text-right text-[14px] tabular-nums text-[#141412]">{fcfa(o.total_client)}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="mt-4 rounded-2xl bg-[#F6F5F1] p-8 text-center text-[14px] text-[#5F5E58]">
                                Aucune commande pour l’instant. Partagez le lien de votre boutique pour recevoir vos premières ventes.
                            </div>
                        )}
                    </Card>

                    <Card delay={0.16}>
                        <CardHeader title="Meilleures ventes" href={route('products.index')} linkLabel="Catalogue" />
                        {topProducts.length ? (
                            <ul className="mt-4 space-y-3">
                                {topProducts.map((p, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F6F5F1] text-[12px] font-medium text-[#5F5E58]">{i + 1}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[14px] text-[#141412]">{p.product_title}</span>
                                            <span className="text-[12px] text-[#8B8A83]">{p.total_qty} vendu{p.total_qty > 1 ? 's' : ''}</span>
                                        </span>
                                        <span className="shrink-0 text-[13px] tabular-nums text-[#141412]">{fcfa(p.total_revenue)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : products.length ? (
                            <ul className="mt-4 space-y-3">
                                {products.slice(0, 4).map((p) => (
                                    <li key={p.id} className="flex items-center gap-3">
                                        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#F6F5F1]">
                                            {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <ShoppingBag className="m-2.5 h-5 w-5 text-[#8B8A83]" />}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-[14px] text-[#141412]">{p.title}</span>
                                            <span className="text-[12px] text-[#8B8A83]">Stock : {p.stock}</span>
                                        </span>
                                        <span className="shrink-0 text-[13px] tabular-nums text-[#141412]">{fcfa(p.price_display || p.price_vendor)}</span>
                                    </li>
                                ))}
                                <li className="pt-1 text-[13px] text-[#8B8A83]">Le classement apparaîtra après vos premières ventes.</li>
                            </ul>
                        ) : (
                            <div className="mt-4 rounded-2xl bg-[#F6F5F1] p-6 text-center text-[14px] text-[#5F5E58]">Aucun produit pour l’instant.</div>
                        )}
                    </Card>
                </div>

                {/* Raccourcis */}
                <motion.div {...reveal(0.2)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        [FileText, 'Créer une facture', route('seller.invoices.index')],
                        [Wallet, 'Demander un retrait', route('seller.wallet.index')],
                        [Palette, 'Personnaliser la boutique', route('appearance.index')],
                        [ArrowUpRight, 'Voir mon abonnement', route('seller.subscriptions.index')],
                    ].map(([Icon, label, href]) => (
                        <Link key={label} href={href} className="group flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 text-[14px] text-[#141412] hover:border-black/20">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6F5F1]"><Icon className="h-4 w-4" /></span>
                            {label}
                            <ArrowRight className="ml-auto h-4 w-4 text-[#8B8A83] transition-transform group-hover:translate-x-0.5" />
                        </Link>
                    ))}
                </motion.div>
            </div>
        </AuthenticatedLayout>
    );
}
