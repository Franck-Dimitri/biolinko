import { ShieldAlert, Sparkles, Store } from 'lucide-react';
import ErrorShell from '@/Components/ErrorShell';

export default function StoreUnavailable({ reason = 'not_found', storeName, slug }) {
    const config = {
        unpublished: {
            Icon: Sparkles,
            badge: 'Boutique en préparation',
            title: storeName ? `${storeName} ouvre très bientôt` : 'Cette boutique ouvre très bientôt',
            description: 'Le vendeur prépare ses produits et ses prix. Revenez dans quelques jours pour découvrir la boutique.',
            actions: [
                { label: 'Découvrir Biolinko', href: '/', primary: true },
                { label: 'Je suis le vendeur', href: '/login' },
            ],
        },
        banned: {
            Icon: ShieldAlert,
            badge: 'Boutique suspendue',
            title: 'Cette boutique est temporairement indisponible',
            description: 'L’accès à cette boutique a été suspendu suite à un contrôle de conformité.',
            actions: [
                { label: 'Retour à l’accueil', href: '/', primary: true },
                { label: 'Contacter le support', href: 'mailto:support@biolinko.link' },
            ],
        },
        not_found: {
            Icon: Store,
            badge: 'Boutique introuvable',
            title: `Aucune boutique à l’adresse « ${slug || 'inconnue'} »`,
            description: 'Le lien est peut-être incomplet, ou cette adresse est encore libre.',
            actions: [
                { label: slug ? `Créer la boutique « ${slug} »` : 'Créer ma boutique', href: '/register', primary: true },
                { label: 'Retour à l’accueil', href: '/' },
            ],
        },
    }[reason] || null;

    const c = config || {};
    return (
        <ErrorShell headTitle={`${c.badge || 'Boutique introuvable'}, Biolinko`} Icon={c.Icon || Store} badge={c.badge}
            title={c.title} description={c.description} actions={c.actions} />
    );
}
