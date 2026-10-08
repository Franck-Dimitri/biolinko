import { motion } from 'framer-motion';
import { MapPin, Store } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon } from '@/Components/BrandIcons';
import { contrastColor } from '@/Components/Storefront/theme';

export default function FooterBoutique({ store }) {
    const primaryColor = store?.theme_color || '#FFCC00';
    const primaryTextColor = contrastColor(primaryColor);
    const wa = store.phone_whatsapp ? `https://wa.me/${store.phone_whatsapp.replace(/[^0-9]/g, '')}` : null;
    const socials = [
        [store.instagram_link, InstagramIcon, 'Instagram'],
        [store.tiktok_link, TiktokIcon, 'TikTok'],
        [store.facebook_link, FacebookIcon, 'Facebook'],
        [wa, WhatsappIcon, 'WhatsApp'],
    ].filter(([href]) => href);

    return (
        <footer className="mt-20 border-t border-brand-line bg-brand-sand px-4 pb-8 pt-14 text-brand-muted sm:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                            {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-5 w-5" />}
                        </span>
                        <span className="text-lg font-bold text-brand-ink">{store.name}</span>
                    </div>
                    <p className="max-w-sm leading-relaxed">
                        {store.description || store.about_text || 'Commandez en ligne, payez par Mobile Money et recevez votre commande à domicile.'}
                    </p>
                    {socials.length > 0 && (
                        <div className="flex gap-2">
                            {socials.map(([href, Icon, label]) => (
                                <motion.a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} whileHover={{ y: -3 }} className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-line bg-white text-brand-ink">
                                    <Icon className="h-[18px] w-[18px]" />
                                </motion.a>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="font-semibold text-brand-ink">Paiement</div>
                    <p>Payez en toute sécurité depuis votre téléphone.</p>
                    <div className="flex gap-2">
                        <span className="rounded bg-[#FFCC00] px-2 py-1 text-xs font-medium text-brand-ink">MTN MoMo</span>
                        <span className="rounded bg-[#FF7900] px-2 py-1 text-xs font-medium text-white">Orange Money</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="font-semibold text-brand-ink">Contact</div>
                    {store.phone_whatsapp && (
                        <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-ink hover:underline">
                            <WhatsappIcon className="h-4 w-4 text-green-700" /> {store.phone_whatsapp}
                        </a>
                    )}
                    {(store.city_location || store.city) && (
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {store.city_location || store.city}</div>
                    )}
                    <a href={`/${store.slug}?tab=cart`} className="block hover:text-brand-ink">Mon panier</a>
                </div>
            </div>

            <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-brand-line pt-6 text-sm sm:flex-row">
                <span>© {new Date().getFullYear()} {store.name}</span>
                <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-brand-ink hover:underline">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-yellow">
                        <img src="/images/brand/logo-noir.png" alt="" className="h-4 w-4" />
                    </span>
                    Boutique créée avec Biolinko
                </a>
            </div>
        </footer>
    );
}
