import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, BadgeCheck, Clock, Flag, KeyRound, Lock, Undo2 } from 'lucide-react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Section, reveal } from '@/Components/Landing/Frame';

const STEPS = [
    [BadgeCheck, 'Le paiement est confirmé par l’opérateur', 'Quand le client paie, une demande arrive sur son téléphone et il la valide avec son code secret. La commande n’est payée que lorsque MTN ou Orange a confirmé le paiement : une capture d’écran ne suffit jamais.'],
    [Clock, 'Un court délai de sécurité', 'Chaque vente payée apparaît tout de suite dans le solde du vendeur, puis devient retirable après 4 jours (2 jours une fois que la boutique a livré 10 commandes). Ce délai laisse le temps de livrer.'],
    [Flag, 'Un signalement en cas de problème', 'Pendant ce délai, le client peut signaler un problème depuis la page de suivi de sa commande. La vente concernée reste bloquée le temps que le vendeur et le client trouvent une solution.'],
    [Undo2, 'Un remboursement simple', 'Le vendeur peut rembourser tout ou partie d’une vente : le montant est renvoyé directement sur le Mobile Money du client.'],
];

const TIPS = [
    'Biolinko et les vendeurs ne vous demanderont jamais votre code secret Mobile Money par message ou par appel. Vous le tapez uniquement sur votre téléphone, pour valider une demande que vous avez lancée.',
    'Vérifiez l’adresse : les boutiques Biolinko s’ouvrent sur biolinko.link.',
    'Vérifiez le montant affiché sur la demande de paiement avant de la valider.',
    'Gardez votre lien de suivi : il contient votre facture et vous permet de signaler un problème.',
];

export default function Security() {
    return (
        <SiteLayout title="Paiement et sécurité" eyebrow="Paiement et sécurité" heading="Acheter et vendre en toute confiance"
            intro="Le Mobile Money, c’est pratique, mais les arnaques existent. Voici comment Biolinko protège les acheteurs et les vendeurs à chaque étape.">
            <Section top={false} className="bg-white py-20 sm:py-24">
                <ol className="grid gap-4 md:grid-cols-2">
                    {STEPS.map(([Icon, title, text], i) => (
                        <motion.li key={title} {...reveal(i * 0.06)} className="rounded-[24px] border border-black/[0.08] p-7">
                            <div className="flex items-center gap-3">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#141412] text-[#FFCC00]"><Icon className="h-5 w-5" /></span>
                                <span className="text-[13px] font-medium tabular-nums text-[#8B8A83]">0{i + 1}</span>
                            </div>
                            <h2 className="mt-5 text-[19px] font-medium">{title}</h2>
                            <p className="mt-2 text-[15px] leading-relaxed text-[#5F5E58]">{text}</p>
                        </motion.li>
                    ))}
                </ol>
                <motion.p {...reveal(0.2)} className="mt-6 text-[14px] text-[#8B8A83]">
                    Biolinko fournit l’outil de vente et de paiement ; la vente est conclue entre le vendeur et l’acheteur. Ces outils aident à la confiance mais ne constituent pas une garantie de remboursement. Détails dans les <Link href={route('legal.terms')} className="underline underline-offset-2">conditions d’utilisation</Link>.
                </motion.p>
            </Section>

            <Section className="bg-[#FBFAF6] py-20 sm:py-24" innerClassName="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <motion.div {...reveal()}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF3C4] text-[#7A5B00]"><AlertTriangle className="h-5 w-5" /></span>
                    <h2 className="mt-5 text-[28px] font-medium tracking-[-0.02em] sm:text-[34px]">Nos conseils anti-arnaque</h2>
                    <p className="mt-3 text-[16px] text-[#5F5E58]">Quelques réflexes simples pour payer sans risque.</p>
                </motion.div>
                <ul className="space-y-3">
                    {TIPS.map((t, i) => (
                        <motion.li key={t} {...reveal(i * 0.05)} className="flex gap-3 rounded-2xl border border-black/[0.08] bg-white p-5 text-[15px] leading-relaxed text-[#3D3C37]">
                            <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-[#141412]" /> {t}
                        </motion.li>
                    ))}
                </ul>
            </Section>

            <Section className="bg-white py-20 sm:py-24" innerClassName="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <motion.div {...reveal()}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#141412] text-white"><Lock className="h-5 w-5" /></span>
                    <h2 className="mt-5 text-[28px] font-medium tracking-[-0.02em] sm:text-[34px]">Vos données</h2>
                </motion.div>
                <motion.ul {...reveal(0.1)} className="space-y-3 text-[16px] leading-relaxed text-[#3D3C37]">
                    <li>Les échanges avec Biolinko sont chiffrés (HTTPS) et les mots de passe sont stockés sous forme hachée, jamais en clair.</li>
                    <li>Les paiements sont traités par notre prestataire de paiement et par les opérateurs Mobile Money : Biolinko ne voit jamais votre code secret.</li>
                    <li>Vos coordonnées ne sont transmises qu’au vendeur chez qui vous commandez, pour la livraison. Biolinko ne vend pas vos données. Plus de détails dans la <Link href={route('legal.privacy')} className="underline underline-offset-2">politique de confidentialité</Link>.</li>
                </motion.ul>
            </Section>
        </SiteLayout>
    );
}
