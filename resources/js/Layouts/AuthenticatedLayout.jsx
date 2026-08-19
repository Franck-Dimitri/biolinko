import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { 
    LayoutDashboard, ShoppingBag, Wallet, Settings, ExternalLink, LogOut, 
    User as UserIcon, Menu, X, PackageCheck, Users, BarChart3, 
    Megaphone, Truck, MessageSquare, Bell, Search, ChevronDown, ChevronRight, Store, ArrowUpRight, Palette, ShieldCheck, Crown, CreditCard, FileText, Share2, Download, Eye, Zap
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const store = usePage().props.store || user.store;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col md:flex-row">
            <Toaster position="top-right" richColors closeButton />
            
            {/* Mobile Header Bar */}
            <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-[#FFCC00] text-slate-950 flex items-center justify-center shadow-2xs">
                        <ShoppingBag className="w-5 h-5 text-slate-950" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-950 font-sans">
                        biolinko
                    </span>
                </Link>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-xl text-slate-700 hover:bg-slate-100"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* LEFT SIDEBAR NAVIGATION */}
            <aside className={`
                fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200/80 
                flex flex-col justify-between p-4 transition-transform duration-300 overflow-y-auto shrink-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="space-y-6">
                    {/* Brand Logo */}
                    <div className="flex items-center justify-between px-2 pt-2">
                        <Link href="/dashboard" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-[#FFCC00] text-slate-950 flex items-center justify-center shadow-2xs">
                                <ShoppingBag className="w-5 h-5 text-slate-950" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-slate-950 font-sans">
                                biolinko
                            </span>
                        </Link>
                    </div>

                    {/* Store Switcher Box */}
                    {store && (
                        <div className="px-2">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                                Ma Boutique
                            </div>
                            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between group hover:border-amber-300 transition-all cursor-pointer">
                                <div className="flex items-center gap-2.5 truncate">
                                    <div className="w-8 h-8 rounded-xl bg-[#FFCC00] text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                                        {store.logo_url ? <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-4 h-4 text-slate-950" />}
                                    </div>
                                    <div className="truncate">
                                        <div className="text-xs font-semibold text-slate-950 truncate">{store.name}</div>
                                        <div className="text-[10px] text-amber-700 font-mono truncate">biolinko.app/{store.slug}</div>
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            </div>
                        </div>
                    )}

                    {/* NAV GROUP 0: SUPER-ADMIN CONSOLE (8 TABS) */}
                    {user?.role === 'admin' && (
                        <div className="space-y-1 border-b border-slate-200/80 pb-4">
                            <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                                <span>Supervision Admin (9 Vues)</span>
                            </div>

                            <Link
                                href={route('admin.dashboard')}
                                className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                    route().current('admin.dashboard')
                                        ? 'bg-[#FFCC00] text-slate-950 rounded-xl font-bold shadow-2xs'
                                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <LayoutDashboard className="w-4 h-4 text-slate-900" />
                                    <span>1. Dashboard Admin</span>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.stores.index')}
                                className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                    route().current('admin.stores.*')
                                        ? 'bg-[#FFCC00] text-slate-950 rounded-xl font-bold shadow-2xs'
                                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Store className="w-4 h-4 text-slate-900" />
                                    <span>2. Boutiques Réseau</span>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.users.index')}
                                className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                    route().current('admin.users.*')
                                        ? 'bg-[#FFCC00] text-slate-950 rounded-xl font-bold shadow-2xs'
                                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="w-4 h-4 text-slate-900" />
                                    <span>3. Vendeurs &amp; Users</span>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.subscriptions.index')}
                                className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                    route().current('admin.subscriptions.*')
                                        ? 'bg-[#FFCC00] text-slate-950 rounded-xl font-bold shadow-2xs'
                                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Crown className="w-4 h-4 text-amber-600" />
                                    <span>4. Abonnements SaaS</span>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.products.index')}
                                className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                    route().current('admin.products.*')
                                        ? 'bg-[#FFCC00] text-slate-950 rounded-xl font-bold shadow-2xs'
                                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <PackageCheck className="w-4 h-4 text-slate-900" />
                                    <span>5. Catalogue Réseau</span>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.withdrawals.index')}
                                className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                    route().current('admin.withdrawals.*')
                                        ? 'bg-[#FFCC00] text-slate-950 rounded-xl font-bold shadow-2xs'
                                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Wallet className="w-4 h-4 text-rose-600" />
                                    <span>6. Retraits MoMo</span>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.wallet.index')}
                                className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                    route().current('admin.wallet.*')
                                        ? 'bg-[#FFCC00] text-slate-950 rounded-xl font-bold shadow-2xs'
                                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard className="w-4 h-4 text-emerald-600" />
                                    <span>7. Portefeuille Admin</span>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.transactions.index')}
                                className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                    route().current('admin.transactions.*')
                                        ? 'bg-[#FFCC00] text-slate-950 rounded-xl font-bold shadow-2xs'
                                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="w-4 h-4 text-slate-900" />
                                    <span>8. Ventes &amp; Flux SaaS</span>
                                </div>
                            </Link>

                            <Link
                                href={route('admin.settings.index')}
                                className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                    route().current('admin.settings.*')
                                        ? 'bg-[#FFCC00] text-slate-950 rounded-xl font-bold shadow-2xs'
                                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Settings className="w-4 h-4 text-slate-900" />
                                    <span>9. Paramètres &amp; APIs</span>
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* NAV GROUP 1: ESPACE VENDEUR (Hidden for Admin) */}
                    {user?.role !== 'admin' && (
                        <>
                            <div className="space-y-1">
                                <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    Espace Vendeur
                                </div>

                                <Link
                                    href={route('dashboard')}
                                    className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                        route().current('dashboard') || route().current('seller.dashboard')
                                            ? 'bg-amber-50/80 text-slate-950 border-l-[3px] border-[#FFCC00] rounded-r-xl pl-3'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>Tableau de bord</span>
                                    </div>
                                </Link>

                                <Link
                                    href={route('products.index')}
                                    className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                        route().current('products.*')
                                            ? 'bg-amber-50/80 text-slate-950 border-l-[3px] border-[#FFCC00] rounded-r-xl pl-3'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag className="w-4 h-4" />
                                        <span>Catalogue Produits</span>
                                    </div>
                                </Link>

                                <Link
                                    href={route('orders.index')}
                                    className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                        route().current('orders.*')
                                            ? 'bg-amber-50/80 text-slate-950 border-l-[3px] border-[#FFCC00] rounded-r-xl pl-3'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <PackageCheck className="w-4 h-4" />
                                        <span>Commandes</span>
                                    </div>
                                </Link>

                                <Link
                                    href={route('seller.wallet.index')}
                                    className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                        route().current('seller.wallet.*')
                                            ? 'bg-amber-50/80 text-slate-950 border-l-[3px] border-[#FFCC00] rounded-r-xl pl-3'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Wallet className="w-4 h-4 text-emerald-600" />
                                        <span>Portefeuille MoMo</span>
                                    </div>
                                </Link>

                                <Link
                                    href={route('seller.invoices.index')}
                                    className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                        route().current('seller.invoices.*')
                                            ? 'bg-amber-50/80 text-slate-950 border-l-[3px] border-[#FFCC00] rounded-r-xl pl-3'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-4 h-4 text-amber-600" />
                                        <span>Factures</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-[#FFCC00]/20 text-slate-950 text-[10px] font-bold">PDF</span>
                                </Link>

                                <Link
                                    href={route('seller.smartlinks.index')}
                                    className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                        route().current('seller.smartlinks.*')
                                            ? 'bg-amber-50/80 text-slate-950 border-l-[3px] border-[#FFCC00] rounded-r-xl pl-3'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                                        <span>SmartLinks</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black tracking-tight">Express</span>
                                </Link>

                                <Link
                                    href={route('customers.index')}
                                    className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                        route().current('customers.*')
                                            ? 'bg-amber-50/80 text-slate-950 border-l-[3px] border-[#FFCC00] rounded-r-xl pl-3'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Users className="w-4 h-4" />
                                        <span>Répertoire Clients</span>
                                    </div>
                                </Link>

                                <Link
                                    href={route('seller.subscriptions.index')}
                                    className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                        route().current('seller.subscriptions.*')
                                            ? 'bg-amber-50/80 text-slate-950 border-l-[3px] border-[#FFCC00] rounded-r-xl pl-3'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Crown className="w-4 h-4 text-amber-500" />
                                        <span>Mon Abonnement</span>
                                    </div>
                                </Link>

                                <Link
                                    href={route('appearance.index')}
                                    className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                        route().current('appearance.*')
                                            ? 'bg-amber-50/80 text-slate-950 border-l-[3px] border-[#FFCC00] rounded-r-xl pl-3'
                                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Palette className="w-4 h-4" />
                                        <span>Apparence Boutique</span>
                                    </div>
                                </Link>
                            </div>
                        </>
                    )}
                </div>

                {/* BOTTOM USER PROFILE CARD */}
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
                    {user?.role === 'admin' && (
                        <Link
                            href={route('admin.dashboard')}
                            className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-semibold transition-all flex items-center justify-between shadow-2xs border border-slate-800"
                        >
                            <span className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                                <span>Console Super-Admin</span>
                            </span>
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    )}

                    {store && (
                        <a
                            href={`/${store.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 px-3 rounded-2xl bg-[#FFCC00] hover:bg-amber-300 text-slate-950 text-xs font-semibold transition-all flex items-center justify-between shadow-2xs"
                        >
                            <span>Voir ma vitrine client</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </a>
                    )}

                    <Dropdown>
                        <Dropdown.Trigger>
                            <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:bg-slate-100 transition-all cursor-pointer">
                                <div className="flex items-center gap-2.5 truncate">
                                    <div className="w-8 h-8 rounded-xl bg-[#FFCC00] text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="truncate text-left">
                                        <div className="text-xs font-semibold text-slate-950 truncate">{user.name}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            </div>
                        </Dropdown.Trigger>

                        <Dropdown.Content align="right" width="48">
                            {user?.role === 'admin' && (
                                <Dropdown.Link href={route('admin.dashboard')}>
                                    Console Super Admin
                                </Dropdown.Link>
                            )}
                            <Dropdown.Link href={route('profile.edit')}>
                                Mon Profil
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Déconnexion
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header Bar */}
                <header className="hidden md:flex bg-white border-b border-slate-200/80 px-8 py-3.5 items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="w-64 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Rechercher une commande, client..."
                                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-slate-400 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* NOTIFICATIONS DROPDOWN POPOVER */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-950 relative transition-colors cursor-pointer"
                                title="Notifications"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white absolute top-1.5 right-1.5 animate-pulse" />
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-slate-950 uppercase tracking-wider">Notifications (3)</span>
                                        <button 
                                            onClick={() => setShowNotifications(false)}
                                            className="text-[10px] font-bold text-amber-700 hover:underline"
                                        >
                                            Fermer
                                        </button>
                                    </div>
                                    <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto text-xs">
                                        <div className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <div className="font-bold text-slate-950 flex items-center justify-between">
                                                <span>Paiement MoMo Reçu</span>
                                                <span className="text-[10px] text-slate-400 font-normal">À l'instant</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Votre portefeuille a été crédité pour une commande validée.</p>
                                        </div>
                                        <div className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <div className="font-bold text-slate-950 flex items-center justify-between">
                                                <span>Boutique Biolinko Active</span>
                                                <span className="text-[10px] text-slate-400 font-normal">Il y a 10 min</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Votre catalogue et SmartLinks sont prêts pour les partages.</p>
                                        </div>
                                        <div className="p-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <div className="font-bold text-slate-950 flex items-center justify-between">
                                                <span>Système Réseau USSD</span>
                                                <span className="text-[10px] text-slate-400 font-normal">Aujourd'hui</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5">Service d'encaissement Mobile Money 100% opérationnel.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* DIRECT LOGOUT BUTTON */}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-200 transition-all cursor-pointer"
                            title="Se Déconnecter"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Déconnexion</span>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-8 max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>

        </div>
    );
}