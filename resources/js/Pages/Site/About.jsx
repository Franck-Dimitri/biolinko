import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, HandCoins, MapPin, ShieldCheck, Smartphone } from 'lucide-react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Section, reveal } from '@/Components/Landing/Frame';

const VALUES = [
    [Smartphone, 'Simple, depuis le téléphone', 'Tout se fait depuis un téléphone : créer sa boutique, ajouter ses produits, suivre ses ventes. Aucun ordinateur, aucune compétence technique.'],
    [HandCoins, 'Le paiement que tout le monde utilise', 'MTN Mobile Money et Orange Money, validés sur le téléphone du client. Pas de carte bancaire, pas d’application à installer.'],
    [ShieldCheck, 'La confiance d’abord', 'Un paiement n’est validé que lorsque l’opérateur l’a confirmé. Le client suit sa commande, et l’argent est protégé le temps de la livraison.'],
    [Eye, 'Des prix transparents', 'Une seule commission par vente, affichée avant de vendre. Pas de commission sur la livraison, retraits gratuits, aucun frais caché.'],
];

export default function About() {
    return (
        <SiteLayout title="À propos" eyebrow="À propos" heading="Aider chaque commerçant à vendre en ligne, simplement"
            intro="Biolinko est né d’un constat : au Cameroun, des milliers de commerçants vendent déjà sur WhatsApp, Instagram, TikTok et Facebook, mais tout se gère encore à la main, entre messages, captures d’écran et cahier de comptes.">
            <Section top={false} className="bg-white py-20 sm:py-24" innerClassName="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
                <motion.div {...reveal()}>
                    <h2 className="text-[28px] font-medium leading-tight tracking-[-0.02em] sm:text-[34px]">Ce que nous faisons</h2>
                </motion.div>
                <motion.div {...reveal(0.1)} className="space-y-5 text-[17px] leading-relaxed text-[#3D3C37]">
                    <p>Biolinko réunit en une seule application ce dont un commerçant a besoin pour vendre en ligne : une boutique à son image, un catalogue, les commandes, la livraison, les factures, le fichier client, le marketing et l’encaissement en Mobile Money.</p>
                    <p>Le vendeur partage un seul lien, <strong className="font-medium text-[#141412]">biolinko.link/sa-boutique</strong>, là où ses clients se trouvent déjà. Le client choisit, paie avec son téléphone et reçoit sa facture et un lien de suivi. Le vendeur retrouve l’argent sur son solde et le retire gratuitement vers son Mobile Money.</p>
                    <p>Biolinko ne vend aucun produit : nous fournissons l’outil, chaque vendeur reste maître de sa boutique, de ses prix et de ses clients.</p>
                </motion.div>
            </Section>

            <Section className="bg-[#FBFAF6] py-20 sm:py-24">
                <motion.h2 {...reveal()} className="text-[28px] font-medium tracking-[-0.02em] sm:text-[34px]">Nos principes</motion.h2>
                <div className="mt-10 grid gap-px overflow-hidden rounded-[24px] border border-black/[0.07] bg-black/[0.07] sm:grid-cols-2">
                    {VALUES.map(([Icon, title, text], i) => (
                        <motion.article key={title} {...reveal(i * 0.06)} className="bg-white p-7">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#141412] text-[#FFCC00]"><Icon className="h-5 w-5" /></span>
                            <h3 className="mt-5 text-[18px] font-medium">{title}</h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-[#5F5E58]">{text}</p>
                        </motion.article>
                    ))}
                </div>
            </Section>

            <Section className="bg-white py-20 sm:py-24" innerClassName="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
                <motion.div {...reveal()} className="space-y-4">
                    <p className="flex items-center gap-2 text-[14px] text-[#5F5E58]"><MapPin className="h-4 w-4" /> Douala, Cameroun</p>
                    <h2 className="text-[28px] font-medium tracking-[-0.02em] sm:text-[34px]">Le Cameroun d’abord</h2>
                    <p className="text-[17px] leading-relaxed text-[#5F5E58]">Biolinko ouvre d’abord au Cameroun, avec MTN Mobile Money et Orange Money, dans le cadre d’un programme pilote avec un petit groupe de vendeurs. D’autres pays d’Afrique centrale et de l’Ouest suivront, avec les opérateurs de chaque pays.</p>
                </motion.div>
                <motion.div {...reveal(0.1)} className="rounded-[24px] border border-black/[0.08] bg-[#FBFAF6] p-7 sm:p-9">
                    <p className="text-[18px] font-medium">Vous vendez déjà en ligne ?</p>
                    <p className="mt-2 text-[15px] text-[#5F5E58]">Rejoignez le programme pilote : nous installons votre boutique avec vous et vous accompagnons pendant vos premières ventes.</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link href={route('site.pilot')} className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#FFCC00] px-5 text-[15px] font-medium text-[#141412] hover:bg-[#FFD633]">
                            Rejoindre le pilote <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                        <Link href={route('site.contact')} className="inline-flex h-11 items-center rounded-full border border-black/15 px-5 text-[15px] font-medium text-[#141412] hover:border-black/40">Nous contacter</Link>
                    </div>
                </motion.div>
            </Section>
        </SiteLayout>
    );
}
