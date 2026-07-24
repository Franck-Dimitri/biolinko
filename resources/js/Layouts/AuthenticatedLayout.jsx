import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    LayoutDashboard, ShoppingBag, Wallet, Settings, ExternalLink, LogOut, 
    User as UserIcon, Menu, X, PackageCheck, Users, BarChart3, 
    Megaphone, Truck, MessageSquare, Bell, Search, ChevronDown, ChevronRight, Store, ArrowUpRight, Palette
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const store = usePage().props.store || user.store;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col md:flex-row">
            
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

                    {/* NAV GROUP 1: GENERAL */}
                    <div className="space-y-1">
                        <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Général
                        </div>

                        <Link
                            href={route('dashboard')}
                            className={`flex items-center justify-between px-3.5 py-2.5 transition-all text-xs font-semibold ${
                                route().current('dashboard')
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
                                <span>Commandes & Wallet</span>
                            </div>
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

                    {/* NAV GROUP 2: TOOLS & WALLET */}
                    <div className="space-y-1">
                        <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                            Outils & Retraits
                        </div>

                        <Link
                            href={route('orders.index')}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <Wallet className="w-4 h-4 text-amber-600" />
                                <span>Portefeuille MoMo</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold">Retrait</span>
                        </Link>
                    </div>
                </div>

                {/* BOTTOM USER PROFILE CARD */}
                <div className="pt-4 border-t border-slate-200/80 space-y-3">
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

                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative">
                            <Bell className="w-5 h-5" />
                            <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-8 max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>

        </div>
    );
}
