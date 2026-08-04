import { Store, MessageSquare } from 'lucide-react';

function getContrastColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) return '#0F172A';
    const hex = hexColor.replace('#', '');
    if (hex.length < 6) return '#0F172A';
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 165 ? '#0F172A' : '#FFFFFF';
}

export default function FooterBoutique({ store, setActiveTab }) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = getContrastColor(primaryColor);

    return (
        <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-8 mt-16 text-slate-600 text-xs font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl font-semibold flex items-center justify-center text-xs overflow-hidden" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                            {store.logo_url ? <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-4 h-4" style={{ color: primaryTextColor }} />}
                        </div>
                        <span className="font-bold text-slate-950 text-base">{store.name}</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed font-medium">
                        {store.description || "Boutique e-commerce officielle. Tous les produits sont authentiques et expédiés sous 24h-48h avec paiement Mobile Money sécurisé."}
                    </p>
                </div>

                <div className="space-y-2.5">
                    <h4 className="font-bold text-slate-950 uppercase text-xs">Navigation Boutique</h4>
                    <ul className="space-y-2 font-medium">
                        <li><a href={`/${store.slug}`} className="hover:text-slate-950 transition-colors">Accueil Boutique</a></li>
                        {setActiveTab && (
                            <>
                                <li><button onClick={() => setActiveTab('products')} className="hover:text-slate-950">Catalogue Produits</button></li>
                                <li><button onClick={() => setActiveTab('promo')} className="hover:text-slate-950">Promotions</button></li>
                                <li><button onClick={() => setActiveTab('reviews')} className="hover:text-slate-950">Avis Clients</button></li>
                            </>
                        )}
                    </ul>
                </div>

                <div className="space-y-2.5">
                    <h4 className="font-bold text-slate-950 uppercase text-xs">Modes de Paiement Acceptés</h4>
                    <div className="flex flex-wrap gap-2 pt-1 font-medium">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">MTN Mobile Money</span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">Moov Money</span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">Orange Money</span>
                    </div>
                </div>

                <div className="space-y-2.5">
                    <h4 className="font-bold text-slate-950 uppercase text-xs">Contact Vendeur Direct</h4>
                    {store.phone_whatsapp && (
                        <div className="text-slate-900 font-bold flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-emerald-600" />
                            <span>{store.phone_whatsapp}</span>
                        </div>
                    )}
                    <p className="text-slate-400 font-medium">Assistance client disponible 7j/7</p>

                    <div className="flex items-center gap-2 pt-2">
                        {store.tiktok_url && <a href={store.tiktok_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 font-bold text-[11px]">TikTok</a>}
                        {store.instagram_url && <a href={store.instagram_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 font-bold text-[11px]">Instagram</a>}
                        {store.facebook_url && <a href={store.facebook_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-900 font-bold text-[11px]">Facebook</a>}
                    </div>
                </div>

            </div>

            <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 font-medium text-[11px]">
                <div>© {new Date().getFullYear()} {store.name}. Tous droits réservés.</div>
                <div className="text-slate-500 font-semibold flex items-center gap-1">
                    <span>Propulsé avec passion par</span>
                    <span className="font-bold px-2 py-0.5 rounded text-[10px]" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>BIOLINKO SaaS</span>
                </div>
            </div>
        </footer>
    );
}
