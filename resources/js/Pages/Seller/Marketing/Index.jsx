import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Check, Copy, Link2, Megaphone, Percent, Repeat, ShoppingBag, Target, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { FacebookIcon, TiktokIcon, WhatsappIcon } from '@/Components/BrandIcons';
import { Badge, Button, Card, CardHeader, Field, PageHeader, PlanLock, Stat, fcfa, fieldClass } from '@/Components/Dashboard/UI';

function Action({ done, title, text, href, cta, Icon, highlight }) {
    return (
        <li className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${highlight && !done ? 'border-[#FFCC00]/60 bg-[#FFFBEA]' : 'border-black/[0.06] bg-white'}`}>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${done ? 'bg-[#DCFCE7] text-[#15803D]' : highlight ? 'bg-[#FFCC00] text-[#141412]' : 'bg-[#F6F5F1] text-[#141412]'}`}>
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-[#141412]">{title}</span>
                <span className="block text-[14px] text-[#5F5E58]">{text}</span>
            </span>
            {href && <Button size="sm" variant={highlight && !done ? 'primary' : 'secondary'} href={href}>{cta} <ArrowRight className="h-4 w-4" /></Button>}
        </li>
    );
}

export default function Index({ store, user, stats = {}, topProducts = [], marketing }) {
    const { errors } = usePage().props;
    const [pixels, setPixels] = useState(marketing);
    const [saving, setSaving] = useState(false);
    const storeUrl = `${window.location.origin}/${store.slug}`;
    const trend = stats.revenue_trend;

    const copy = async () => {
        try { await navigator.clipboard.writeText(storeUrl); toast.success('Lien de la boutique copié'); } catch (e) { /* indisponible */ }
    };
    const save = (e) => {
        e.preventDefault();
        setSaving(true);
        router.post(route('seller.marketing.update'), pixels, { preserveScroll: true, onFinish: () => setSaving(false) });
    };

    const actions = [
        {
            done: stats.abandoned_count === 0, highlight: true, Icon: Repeat,
            title: stats.abandoned_count ? `Relancer ${stats.abandoned_count} commande${stats.abandoned_count > 1 ? 's' : ''} non payée${stats.abandoned_count > 1 ? 's' : ''}` : 'Aucune commande à relancer',
            text: stats.abandoned_count ? `${fcfa(stats.abandoned_value)} de ventes à récupérer par un simple message WhatsApp.` : 'Toutes vos commandes récentes ont été payées.',
            href: stats.abandoned_count ? route('customers.index') : null, cta: 'Relancer',
        },
        {
            done: stats.active_promos > 0, Icon: Percent,
            title: stats.active_promos ? `${stats.active_promos} produit${stats.active_promos > 1 ? 's' : ''} en promotion` : 'Lancer une promotion',
            text: 'Un prix barré et un compte à rebours s’affichent sur votre vitrine.',
            href: route('products.index'), cta: stats.active_promos ? 'Gérer' : 'Créer',
        },
        {
            done: stats.active_packs > 0, Icon: Link2,
            title: stats.active_packs ? `${stats.active_packs} pack${stats.active_packs > 1 ? 's' : ''} actif${stats.active_packs > 1 ? 's' : ''}` : 'Créer un pack ou un lien de paiement',
            text: stats.active_packs ? `${stats.pack_views} vues · ${stats.pack_sales} ventes depuis vos liens.` : 'Idéal à partager en story ou dans une conversation.',
            href: route('seller.smartlinks.index'), cta: stats.active_packs ? 'Voir' : 'Créer',
        },
        {
            done: stats.campaigns_used > 0, Icon: Megaphone,
            title: 'Envoyer une campagne WhatsApp',
            text: `${stats.campaigns_used} / ${stats.campaigns_quota} campagne${stats.campaigns_quota > 1 ? 's' : ''} utilisée${stats.campaigns_used > 1 ? 's' : ''} ce mois-ci. Annoncez vos nouveautés à vos ${stats.customers} clients.`,
            href: route('customers.index'), cta: 'Préparer',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Marketing, Biolinko" />
            <div className="space-y-6 pb-12">
                <PageHeader title="Marketing" sub="Vos chiffres des 30 derniers jours et les actions qui font vendre." />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label="Ventes (30 j)" value={fcfa(stats.revenue)} Icon={trend !== null && trend < 0 ? TrendingDown : TrendingUp} delay={0.03}
                        hint={trend === null || trend === undefined ? 'Pas de comparaison disponible' : `${trend >= 0 ? '+' : ''}${trend} % vs 30 jours précédents`} />
                    <Stat label="Commandes payées" value={`${stats.paid_orders ?? 0} / ${stats.orders ?? 0}`} hint="Payées sur passées" Icon={ShoppingBag} delay={0.06} />
                    <Stat label="Taux de paiement" value={`${stats.conversion ?? 0} %`} hint="Commandes réellement payées" Icon={Target} delay={0.09} />
                    <Stat label="Panier moyen" value={fcfa(stats.average_basket)} Icon={Percent} delay={0.12} />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
                    <Card delay={0.08}>
                        <CardHeader title="Actions recommandées" sub="Classées par impact sur vos ventes." />
                        <ul className="mt-5 space-y-2.5">{actions.map((a) => <Action key={a.title} {...a} />)}</ul>
                    </Card>

                    <div className="space-y-4">
                        <Card delay={0.1}>
                            <CardHeader title="Partager ma boutique" sub="Le geste qui rapporte le plus : votre lien partout." />
                            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[#F6F5F1] p-3">
                                <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#141412]">{storeUrl.replace(/^https?:\/\//, '')}</span>
                                <Button size="sm" onClick={copy}><Copy className="h-4 w-4" /> Copier</Button>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                <Button size="sm" href={`https://wa.me/?text=${encodeURIComponent(`Découvrez ma boutique : ${storeUrl}`)}`} target="_blank" rel="noreferrer"><WhatsappIcon className="h-4 w-4 text-[#16A34A]" /> Statut</Button>
                                <Button size="sm" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`} target="_blank" rel="noreferrer"><FacebookIcon className="h-4 w-4 text-[#1877F2]" /> Facebook</Button>
                                <Button size="sm" onClick={copy}><TiktokIcon className="h-4 w-4" /> Bio</Button>
                            </div>
                        </Card>

                        <Card delay={0.12}>
                            <CardHeader title="Audience" />
                            <dl className="mt-4 grid grid-cols-2 gap-3">
                                {[['Clients', stats.customers], ['Clients fidèles', stats.repeat_customers], ['Produits', stats.products], ['Vues des packs', stats.pack_views]].map(([l, v]) => (
                                    <div key={l} className="rounded-2xl bg-[#F6F5F1] p-4"><dd className="text-[22px] font-medium tabular-nums text-[#141412]">{v ?? 0}</dd><dt className="text-[13px] text-[#8B8A83]">{l}</dt></div>
                                ))}
                            </dl>
                            <Link href={route('customers.index')} className="mt-4 inline-flex items-center gap-1 text-[14px] text-[#5F5E58] hover:text-[#141412]"><Users className="h-4 w-4" /> Voir mes clients</Link>
                        </Card>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    <Card delay={0.12}>
                        <CardHeader title="Produits qui se vendent" sub="30 derniers jours" />
                        {topProducts.length ? (
                            <ol className="mt-4 space-y-3">
                                {topProducts.map((p, i) => (
                                    <li key={p.product_title} className="flex items-center gap-3">
                                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-medium ${i === 0 ? 'bg-[#FFCC00]' : 'bg-[#F6F5F1] text-[#5F5E58]'}`}>{i + 1}</span>
                                        <span className="min-w-0 flex-1 truncate text-[14px] text-[#141412]">{p.product_title}</span>
                                        <span className="text-[13px] text-[#8B8A83]">{p.qty} vendu{p.qty > 1 ? 's' : ''}</span>
                                        <span className="w-28 text-right text-[14px] tabular-nums text-[#141412]">{fcfa(p.revenue)}</span>
                                    </li>
                                ))}
                            </ol>
                        ) : <p className="mt-4 text-[14px] text-[#8B8A83]">Aucune vente sur les 30 derniers jours.</p>}
                    </Card>

                    <Card delay={0.14}>
                        <CardHeader title="Mesure publicitaire" sub="Suivez les ventes générées par vos publicités Facebook, Instagram, TikTok et Google." action={!user.has_marketing && <Badge tone="brand">Pro</Badge>} />
                        {user.has_marketing ? (
                            <form onSubmit={save} className="mt-4 space-y-3">
                                <Field label="Pixel Meta (Facebook / Instagram)" error={errors?.facebook_pixel_id}>
                                    <input value={pixels.facebook_pixel_id} onChange={(e) => setPixels((p) => ({ ...p, facebook_pixel_id: e.target.value }))} placeholder="Ex. 123456789012345" className={fieldClass} />
                                </Field>
                                <Field label="Pixel TikTok" error={errors?.tiktok_pixel_id}>
                                    <input value={pixels.tiktok_pixel_id} onChange={(e) => setPixels((p) => ({ ...p, tiktok_pixel_id: e.target.value }))} placeholder="Ex. C4ABC123DEF" className={fieldClass} />
                                </Field>
                                <Field label="Google Analytics" error={errors?.google_analytics_id}>
                                    <input value={pixels.google_analytics_id} onChange={(e) => setPixels((p) => ({ ...p, google_analytics_id: e.target.value }))} placeholder="Ex. G-XXXXXXXXXX" className={fieldClass} />
                                </Field>
                                <div className="flex justify-end"><Button variant="primary" type="submit" disabled={saving}>Enregistrer</Button></div>
                            </form>
                        ) : (
                            <div className="mt-4"><PlanLock plan="Pro" text="Connectez vos pixels publicitaires à partir du plan Pro." /></div>
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
