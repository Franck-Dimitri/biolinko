import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import {
    ArrowUpRight, BarChart3, ChevronDown, Copy, CreditCard, Crown, FileText, LayoutDashboard, Link2, LogOut, Megaphone,
    Menu, Package, Palette, PackageCheck, Settings, ShieldCheck, Store, Users, Wallet, Wrench, X,
} from 'lucide-react';

const SELLER_NAV = [
    ['Principal', [
        ['Accueil', 'dashboard', LayoutDashboard, ['dashboard', 'seller.dashboard']],
        ['Commandes', 'orders.index', PackageCheck, ['orders.*']],
        ['Produits', 'products.index', Package, ['products.*']],
        ['Clients', 'customers.index', Users, ['customers.*']],
    ]],
    ['Ventes', [
        ['Factures', 'seller.invoices.index', FileText, ['seller.invoices.*']],
        ['Liens de paiement', 'seller.smartlinks.index', Link2, ['seller.smartlinks.*']],
        ['Portefeuille', 'seller.wallet.index', Wallet, ['seller.wallet.*']],
    ]],
    ['Croissance', [
        ['Marketing', 'seller.marketing.index', Megaphone, ['seller.marketing.*']],
        ['Outils', 'seller.tools.index', Wrench, ['seller.tools.*']],
    ]],
    ['Boutique', [
        ['Apparence', 'appearance.index', Palette, ['appearance.*']],
        ['Abonnement', 'seller.subscriptions.index', Crown, ['seller.subscriptions.*']],
    ]],
];

const ADMIN_NAV = [
    ['Supervision', [
        ['Vue d’ensemble', 'admin.dashboard', LayoutDashboard, ['admin.dashboard']],
        ['Boutiques', 'admin.stores.index', Store, ['admin.stores.*']],
        ['Vendeurs', 'admin.users.index', Users, ['admin.users.*']],
        ['Produits', 'admin.products.index', Package, ['admin.products.*']],
    ]],
    ['Finance', [
        ['Abonnements', 'admin.subscriptions.index', Crown, ['admin.subscriptions.*']],
        ['Transactions', 'admin.transactions.index', BarChart3, ['admin.transactions.*']],
        ['Retraits', 'admin.withdrawals.index', Wallet, ['admin.withdrawals.*']],
        ['Portefeuille', 'admin.wallet.index', CreditCard, ['admin.wallet.*']],
    ]],
    ['Système', [
        ['Paramètres', 'admin.settings.index', Settings, ['admin.settings.*']],
    ]],
];

const isActive = (patterns) => patterns.some((p) => route().current(p));

function NavLink({ label, name, Icon, patterns, onNavigate }) {
    const active = isActive(patterns);
    return (
        <Link href={route(name)} onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-xl px-2 py-1.5 text-[14px] transition-colors ${active ? 'font-medium text-[#141412]' : 'text-[#5F5E58] hover:bg-[#F6F5F1] hover:text-[#141412]'}`}>
            {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-[#FFF6CC]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            <span className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? 'bg-[#FFCC00] text-[#141412]' : 'text-[#8B8A83] group-hover:text-[#141412]'}`}>
                <Icon className="h-[17px] w-[17px]" />
            </span>
            <span className="relative truncate">{label}</span>
        </Link>
    );
}

function Sidebar({ user, store, onNavigate }) {
    const [menu, setMenu] = useState(false);
    const groups = user?.role === 'admin' ? ADMIN_NAV : SELLER_NAV;
    const storeUrl = store ? `${window.location.origin}/${store.slug}` : null;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(storeUrl);
            toast.success('Lien de la boutique copié');
        } catch (e) { /* presse-papiers indisponible */ }
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-16 shrink-0 items-center px-5">
                <Link href={route('dashboard')} className="flex items-center gap-2" onClick={onNavigate}>
                    <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-[#FFCC00]">
                        <img src="/images/brand/logo-noir.png" alt="" className="h-12 w-12 max-w-none" />
                    </span>
                    <span className="text-[18px] font-semibold tracking-tight text-[#141412]">Biolinko</span>
                    {user?.role === 'admin' && <span className="rounded-full bg-[#141412] px-2 py-0.5 text-[10px] font-medium text-white">Admin</span>}
                </Link>
            </div>

            {store && user?.role !== 'admin' && (
                <div className="mx-3 mb-2 rounded-2xl border border-black/[0.06] bg-[#F6F5F1] p-3">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FFCC00]">
                            {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate text-[14px] font-medium text-[#141412]">{store.name}</span>
                            <span className="block truncate text-[12px] text-[#8B8A83]">biolinko.link/{store.slug}</span>
                        </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-1.5">
                        <a href={`/${store.slug}`} target="_blank" rel="noreferrer" className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white text-[12px] font-medium text-[#141412] ring-1 ring-black/[0.06] hover:ring-black/20">
                            Voir <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                        <button type="button" onClick={copyLink} className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white text-[12px] font-medium text-[#141412] ring-1 ring-black/[0.06] hover:ring-black/20">
                            Copier <Copy className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
                {groups.map(([title, links]) => (
                    <div key={title}>
                        <p className="px-3 pb-1.5 text-[12px] text-[#8B8A83]">{title}</p>
                        <div className="space-y-0.5">
                            {links.map(([label, name, Icon, patterns]) => (
                                <NavLink key={name} label={label} name={name} Icon={Icon} patterns={patterns} onNavigate={onNavigate} />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="relative border-t border-black/[0.06] p-3">
                <AnimatePresence>
                    {menu && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                            className="absolute inset-x-3 bottom-full mb-2 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-[0_20px_40px_-20px_rgba(20,20,10,0.35)]">
                            <Link href={route('profile.edit')} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] text-[#141412] hover:bg-[#F6F5F1]"><Settings className="h-4 w-4 text-[#8B8A83]" /> Mon compte</Link>
                            {user?.role === 'admin' && <Link href={route('admin.dashboard')} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] text-[#141412] hover:bg-[#F6F5F1]"><ShieldCheck className="h-4 w-4 text-[#8B8A83]" /> Console admin</Link>}
                            <Link href={route('logout')} method="post" as="button" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] text-[#B91C1C] hover:bg-red-50"><LogOut className="h-4 w-4" /> Déconnexion</Link>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button type="button" onClick={() => setMenu((v) => !v)} aria-expanded={menu}
                    className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left hover:bg-[#F6F5F1]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#141412] text-[13px] font-medium text-white">{user.name.charAt(0).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-[#141412]">{user.name}</span>
                        <span className="block truncate text-[12px] text-[#8B8A83]">{user.email}</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[#8B8A83] transition-transform ${menu ? 'rotate-180' : ''}`} />
                </button>
            </div>
        </div>
    );
}

const PLAN_LABELS = { starter: 'Starter', pro: 'Pro', growth: 'Growth', business: 'Business' };

// Titre de la page courante, déduit du menu
function currentSection(user) {
    const groups = user?.role === 'admin' ? ADMIN_NAV : SELLER_NAV;
    for (const [group, links] of groups) {
        const hit = links.find(([, , , patterns]) => isActive(patterns));
        if (hit) return [group, hit[0]];
    }
    if (route().current('profile.*')) return ['Compte', 'Mon compte'];
    return [null, null];
}

/** Barre du haut (ordinateur) : fil d'Ariane, plan, accès boutique et compte. */
function TopBar({ user, store }) {
    const [group, page] = currentSection(user);
    const plan = (user?.plan || 'starter').toLowerCase();
    const expires = user?.subscription_expires_at ? new Date(user.subscription_expires_at) : null;
    const daysLeft = expires ? Math.ceil((expires - Date.now()) / 86400000) : null;
    const isPaid = plan !== 'starter';
    const expired = isPaid && daysLeft !== null && daysLeft <= 0;

    return (
        <div className="sticky top-0 z-20 hidden h-16 items-center justify-between gap-4 border-b border-black/[0.06] bg-white/85 px-8 backdrop-blur-md md:flex 2xl:px-12">
            <nav aria-label="Fil d’Ariane" className="flex min-w-0 items-center gap-2 text-[14px]">
                {group && <span className="text-[#8B8A83]">{group}</span>}
                {group && <span className="text-[#8B8A83]">/</span>}
                <span className="truncate font-medium text-[#141412]">{page || 'Tableau de bord'}</span>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
                {user?.role !== 'admin' && (
                    <Link href={route('seller.subscriptions.index')}
                        className={`inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium transition-colors ${expired ? 'bg-red-50 text-[#B91C1C] hover:bg-red-100' : isPaid ? 'bg-[#FFF8D6] text-[#141412] hover:bg-[#FFF0B3]' : 'border border-black/10 text-[#141412] hover:border-black/30'}`}>
                        <Crown className="h-4 w-4" />
                        {expired
                            ? `Plan ${PLAN_LABELS[plan]} expiré · Renouveler`
                            : isPaid
                                ? `Plan ${PLAN_LABELS[plan]}${daysLeft !== null ? ` · ${daysLeft} j restants` : ''}`
                                : 'Starter · Passer au Pro'}
                    </Link>
                )}
                {store && user?.role !== 'admin' && (
                    <a href={`/${store.slug}`} target="_blank" rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#141412] px-3.5 text-[13px] font-medium text-white hover:bg-[#2B2A26]">
                        Ma boutique <ArrowUpRight className="h-4 w-4" />
                    </a>
                )}
                <Link href={route('profile.edit')} aria-label="Mon compte" title={user.name}
                    className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F1EC] text-[13px] font-medium text-[#141412] ring-1 ring-black/[0.06] hover:ring-black/20">
                    {user.name.charAt(0).toUpperCase()}
                </Link>
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const store = usePage().props.store || user.store;
    const [open, setOpen] = useState(false);

    // Confirmations envoyées par le serveur après une action
    useEffect(() => {
        if (flash?.message) toast.success(flash.message);
        if (flash?.success) toast.success(flash.success);
        if (flash?.warning) toast.warning(flash.warning);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <div className="min-h-screen bg-[#FAFAF8] font-poppins text-[#141412] antialiased">
            <Toaster position="top-right" richColors closeButton />

            {/* Barre mobile */}
            <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/[0.06] bg-white/90 px-4 backdrop-blur md:hidden">
                <Link href={route('dashboard')} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-[#FFCC00]">
                        <img src="/images/brand/logo-noir.png" alt="" className="h-10 w-10 max-w-none" />
                    </span>
                    <span className="text-[17px] font-semibold tracking-tight">Biolinko</span>
                </Link>
                <button type="button" onClick={() => setOpen(true)} aria-label="Ouvrir le menu" className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10">
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Menu latéral fixe (ordinateur) */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-black/[0.06] bg-white md:block">
                <Sidebar user={user} store={store} />
            </aside>

            {/* Menu latéral en tiroir (mobile) */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                            onClick={() => setOpen(false)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden" />
                        <motion.aside key="drawer" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 bg-white md:hidden">
                            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer le menu" className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/5">
                                <X className="h-5 w-5" />
                            </button>
                            <Sidebar user={user} store={store} onNavigate={() => setOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <div className="md:pl-64">
                <TopBar user={user} store={store} />
                {header && (
                    <header className="border-b border-black/[0.06] bg-white">
                        <div className="px-4 py-5 sm:px-8 2xl:px-12">{header}</div>
                    </header>
                )}
                <main className="w-full overflow-x-hidden px-4 py-6 sm:px-8 sm:py-8 2xl:px-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
