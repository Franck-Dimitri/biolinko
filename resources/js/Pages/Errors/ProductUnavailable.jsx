import { PackageSearch } from 'lucide-react';
import ErrorShell from '@/Components/ErrorShell';

export default function ProductUnavailable({ store }) {
    const storeName = store?.name || 'la boutique';

    return (
        <ErrorShell
            headTitle={`Produit indisponible, ${storeName}`}
            Icon={PackageSearch}
            badge="Produit indisponible"
            title="Ce produit n’est plus disponible"
            description={`Il est peut-être épuisé, retiré de la vente par ${storeName}, ou le lien est incorrect.`}
            actions={store?.slug
                ? [{ label: `Voir les produits de ${storeName}`, href: `/${store.slug}`, primary: true }, { label: 'Accueil Biolinko', href: '/' }]
                : [{ label: 'Accueil Biolinko', href: '/', primary: true }]}
        />
    );
}
