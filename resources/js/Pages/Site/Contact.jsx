import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, LifeBuoy, Mail, MapPin, Rocket } from 'lucide-react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Section, reveal } from '@/Components/Landing/Frame';
import { WhatsappIcon } from '@/Components/UI/BrandIcons';

export default function Contact() {
    const contact = usePage().props.site?.contact || {};
    const wa = String(contact.whatsapp || '').replace(/\D/g, '');

    const channels = [
        contact.email && { Icon: Mail, title: 'E-mail', value: contact.email, href: `mailto:${contact.email}`, text: 'Pour toute question sur Biolinko, votre boutique ou un paiement.' },
        wa && { Icon: WhatsappIcon, title: 'WhatsApp', value: `+${wa}`, href: `https://wa.me/${wa}?text=${encodeURIComponent('Bonjour Biolinko, ')}`, text: 'Écrivez-nous directement, en français.' },
        { Icon: MapPin, title: 'Où nous trouver', value: contact.city || 'Douala, Cameroun', text: 'Biolinko est basé au Cameroun.' },
    ].filter(Boolean);

    return (
        <SiteLayout title="Contact" eyebrow="Contact" heading="Une question ? Parlons-en"
            intro="Vendeur, acheteur ou partenaire : écrivez-nous. Pour une commande passée sur une boutique, contactez d’abord le vendeur depuis votre page de suivi.">
            <Section top={false} className="bg-white py-20 sm:py-24">
                <div className="grid gap-4 md:grid-cols-3">
                    {channels.map(({ Icon, title, value, href, text }, i) => {
                        const Tag = href ? 'a' : 'div';
                        return (
                            <motion.div key={title} {...reveal(i * 0.06)}>
                                <Tag {...(href ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: 'noreferrer' } : {})}
                                    className={`flex h-full flex-col rounded-[24px] border border-black/[0.08] bg-white p-7 transition-colors ${href ? 'hover:border-black/30' : ''}`}>
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#141412] text-white"><Icon className="h-5 w-5" /></span>
                                    <p className="mt-5 text-[14px] text-[#8B8A83]">{title}</p>
                                    <p className="mt-1 break-words text-[18px] font-medium text-[#141412]">{value}</p>
                                    <p className="mt-2 text-[14px] leading-relaxed text-[#5F5E58]">{text}</p>
                                </Tag>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-2">
                    {[
                        [LifeBuoy, 'Centre d’aide', 'Des guides pas à pas pour créer votre boutique, encaisser et retirer votre argent.', route('site.help'), 'Voir les guides'],
                        [Rocket, 'Programme pilote', 'Vous vendez en ligne au Cameroun ? Nous installons votre boutique avec vous.', route('site.pilot'), 'Rejoindre le pilote'],
                    ].map(([Icon, title, text, href, cta], i) => (
                        <motion.div key={title} {...reveal(0.1 + i * 0.06)}>
                            <Link href={href} className="group flex h-full items-start gap-4 rounded-[24px] bg-[#FBFAF6] p-7 transition-colors hover:bg-[#F6F5F1]">
                                <Icon className="mt-0.5 h-6 w-6 shrink-0 text-[#141412]" />
                                <span>
                                    <span className="block text-[17px] font-medium text-[#141412]">{title}</span>
                                    <span className="mt-1 block text-[15px] text-[#5F5E58]">{text}</span>
                                    <span className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#141412]">{cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
                                </span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </Section>
        </SiteLayout>
    );
}
