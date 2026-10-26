import { Clock, MapPin, Store } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/BrandIcons';
import { OperatorLogo } from '@/Components/Landing/Illustrations';
import { contrastColor } from '@/Components/Storefront/theme';

/**
 * Pied de page des vitrines : marque du vendeur, navigation, contact, moyens de paiement,
 * puis une ligne discrète avec les mentions et la signature Biolinko.
 */
export default function FooterBoutique({ store }) {
    if (!store) return null;
    const color = store.theme_color || '#FFCC00';
    const wa = store.phone_whatsapp?.replace(/[^0-9]/g, '');
    const waUrl = wa && wa.length >= 8 ? `https://wa.me/${wa}?text=${encodeURIComponent(`Bonjour ${store.name}, je vous contacte depuis votre boutique.`)}` : null;
    const socials = [
        [store.instagram_link, InstagramIcon, 'Instagram'],
        [store.tiktok_link, TiktokIcon, 'TikTok'],
        [store.facebook_link, FacebookIcon, 'Facebook'],
    ].filter(([href]) => href);
    const base = `/${store.slug}`;
    const links = [['Produits', `${base}#catalog-grid`], ['Promotions', `${base}#promotions`], ['Avis clients', `${base}#reviews`], ['À propos', `${base}#about`], ['Mon panier', `${base}?tab=cart`]];

    return (
        <footer className="mt-6 border-t border-black/[0.06] bg-[#FAFAF8] text-[#141412] print:hidden">
            <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-10 sm:grid-cols-2 sm:py-14 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
                {/* Marque */}
                <div className="min-w-0 max-w-sm">
                    <a href={base} className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl" style={{ backgroundColor: color, color: contrastColor(color) }}>
                            {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0 truncate text-[17px] font-semibold tracking-tight">{store.name}</span>
                    </a>
                    {store.description && <p className="mt-3 line-clamp-3 text-[14px] [overflow-wrap:anywhere] leading-relaxed text-[#5F5E58]">{store.description}</p>}
                    {(waUrl || socials.length > 0) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {waUrl && (
                                <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-full bg-[#16A34A] px-3.5 text-[13px] font-medium text-white hover:bg-[#15803D]">
                                    <WhatsappIcon className="h-4 w-4" /> WhatsApp
                                </a>
                            )}
                            {socials.map(([href, Icon, label]) => (
                                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white hover:border-black/30"><Icon className="h-4 w-4" /></a>
                            ))}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav aria-label="Boutique">
                    <h3 className="text-[13px] text-[#8B8A83]">La boutique</h3>
                    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[14px] sm:grid-cols-1">
                        {links.map(([label, href]) => <li key={label}><a href={href} className="text-[#3D3C37] hover:text-[#141412]">{label}</a></li>)}
                    </ul>
                </nav>

                {/* Infos pratiques */}
                <div>
                    <h3 className="text-[13px] text-[#8B8A83]">Infos pratiques</h3>
                    <ul className="mt-3 space-y-2 text-[14px] text-[#3D3C37]">
                        {store.city_location && <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8B8A83]" />{store.city_location}</li>}
                        {store.opening_hours && <li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#8B8A83]" />{store.opening_hours}</li>}
                    </ul>
                    <p className="mt-4 text-[13px] text-[#8B8A83]">Paiement sécurisé</p>
                    <div className="mt-2 flex items-center gap-2">
                        <OperatorLogo op="MTN" className="h-8 w-8" />
                        <OperatorLogo op="ORANGE" className="h-8 w-8" />
                        <span className="text-[13px] text-[#5F5E58]">MTN MoMo · Orange Money</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-black/[0.06]">
                <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-5 pb-24 pt-4 text-[12px] text-[#8B8A83] sm:flex-row sm:items-center sm:justify-between sm:pb-4 lg:px-8">
                    <p>© {new Date().getFullYear()} {store.name} · <a href={route('legal.terms')} className="hover:text-[#141412]">Conditions</a> · <a href={route('legal.privacy')} className="hover:text-[#141412]">Confidentialité</a></p>
                    <a href="/" className="inline-flex items-center gap-1.5 hover:text-[#141412]">
                        Boutique créée avec <span className="font-semibold text-[#141412]">Biolinko</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
