import { CalendarCheck, PackageSearch, Palette, ShieldCheck, ShoppingBag, Smartphone, Sparkles, Truck } from 'lucide-react';
import { leadTimeLabel } from '@/Components/Storefront/useCart';

/*
 * Textes par défaut des sections, selon la façon de vendre de la boutique. Ils ne disent que ce que
 * Biolinko fait vraiment (paiement Mobile Money protégé, suivi, frais affichés avant de payer).
 * Le vendeur les remplace dans l'éditeur (réglages de la section).
 */

/** 'services' (réservation), 'order' (sur commande) ou 'stock' (articles disponibles). */
export function sellingKind(store) {
    if (store?.business_type === 'services') return 'services';
    if (store?.template?.fulfillment === 'made_to_order') return 'order';
    return 'stock';
}

export const PRODUCT_TITLES = {
    patisserie: 'Nos gâteaux', restauration: 'La carte', mode: 'Nouveautés', couture: 'Nos modèles', beaute: 'Nos soins',
    electronique: 'Nos appareils', accessoires: 'La sélection', alimentation: 'Au marché aujourd’hui', maison: 'Nos pièces',
    sante: 'Nos produits', enfants: 'Pour les petits', artisanat: 'Nos créations', services: 'Nos prestations', autre: 'Nos produits',
};

export function defaultSteps(store) {
    const kind = sellingKind(store);
    if (kind === 'services') {
        return [
            { icon: Sparkles, title: 'Choisissez la prestation', text: 'Prix et détails affichés, sans surprise.' },
            { icon: CalendarCheck, title: 'Choisissez la date et payez', text: 'Paiement Mobile Money, validé sur votre téléphone.' },
            { icon: ShieldCheck, title: 'C’est réservé', text: 'Vous recevez la confirmation et le suivi de votre réservation.' },
        ];
    }
    if (kind === 'order') {
        return [
            { icon: Palette, title: 'Choisissez et personnalisez', text: 'Modèle, options, message : tout se règle sur la fiche du produit.' },
            { icon: Smartphone, title: 'Choisissez la date et payez', text: 'Paiement Mobile Money, confirmé tout de suite.' },
            { icon: Truck, title: 'Recevez votre commande', text: 'Préparée pour la date choisie, livrée ou à retirer.' },
        ];
    }
    return [
        { icon: ShoppingBag, title: 'Choisissez vos articles', text: 'Ajoutez-les au panier depuis la boutique.' },
        { icon: Smartphone, title: 'Payez en Mobile Money', text: 'MTN MoMo ou Orange Money, validé sur votre téléphone.' },
        { icon: Truck, title: 'Recevez votre commande', text: 'Suivez la livraison avec le lien reçu après le paiement.' },
    ];
}

export function defaultFaq(store) {
    const kind = sellingKind(store);
    const lead = store?.template?.lead_time_hours;
    return [
        ...(kind !== 'stock' && lead ? [{ question: kind === 'services' ? 'Combien de temps à l’avance réserver ?' : 'Combien de temps à l’avance commander ?', answer: `Comptez au moins ${leadTimeLabel(lead)} : les dates proposées au paiement en tiennent compte.` }] : []),
        { question: 'Comment payer ?', answer: 'Par Mobile Money (MTN MoMo ou Orange Money), directement sur la boutique. Vous validez le paiement sur votre téléphone.' },
        { question: 'Mon argent est-il protégé ?', answer: 'Oui. Biolinko garde votre paiement et ne le verse au vendeur qu’après la livraison.' },
        ...(kind === 'services' ? [] : [{ question: 'Combien coûte la livraison ?', answer: 'Les frais de livraison s’affichent avant le paiement, selon votre ville.' }]),
        { question: 'Comment suivre ma commande ?', answer: 'Après le paiement, vous recevez un lien de suivi et votre reçu.' },
    ];
}

export function defaultCta(store) {
    const kind = sellingKind(store);
    if (kind === 'services') return { title: 'Réservez votre prochaine séance', text: 'Choisissez la prestation et payez en Mobile Money, en quelques minutes.', button: 'Réserver' };
    if (kind === 'order') return { title: 'Une commande en tête ?', text: 'Choisissez, personnalisez et payez en Mobile Money : on s’occupe du reste.', button: store?.template?.cta === 'Commander' ? 'Commander' : 'Voir les produits' };
    return { title: 'Trouvé votre bonheur ?', text: 'Payez en Mobile Money et suivez votre commande jusqu’à la livraison.', button: 'Voir les produits' };
}

/** « Livraison à Douala, Yaoundé » : zones du vendeur, sinon sa ville. */
export function deliveryText(store) {
    const zones = (store?.delivery_zones || []).map((z) => z?.name).filter(Boolean);
    if (zones.length) return `Livraison à ${zones.slice(0, 3).join(', ')}${zones.length > 3 ? '…' : ''}`;
    if (store?.city_location) return `Livraison à ${store.city_location}`;
    return 'Livraison à domicile';
}

export function trustItems(store) {
    return [
        { icon: Smartphone, title: 'Mobile Money', text: 'MTN MoMo et Orange Money' },
        { icon: Truck, title: 'Livraison', text: deliveryText(store) },
        { icon: PackageSearch, title: 'Suivi', text: 'Un lien pour suivre la commande' },
        { icon: ShieldCheck, title: 'Paiement protégé', text: 'Le vendeur est payé après la livraison' },
    ];
}
