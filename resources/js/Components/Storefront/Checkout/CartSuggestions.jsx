import { Plus } from 'lucide-react';
import { ProductImage, productImage } from '@/Components/Storefront/ProductCard';
import { formatFcfa, unitPrice } from '@/Components/Storefront/useCart';
import { productUrl } from '@/Components/Storefront/storeUrl';

/**
 * « Souvent ajouté avec » : 3 produits de la boutique absents du panier, ajoutables en un geste
 * (en stock, sans précision obligatoire), de la même catégorie que le panier d'abord, les moins chers ensuite.
 */
export function pickSuggestions(products, cartItems, limit = 3) {
    const inCart = new Set(cartItems.map((it) => it.product_id));
    const cats = new Set(products.filter((p) => inCart.has(p.id)).map((p) => p.category).filter(Boolean));
    return products
        .filter((p) => !inCart.has(p.id))
        .filter((p) => p.fulfillment === 'made_to_order' || Number(p.stock) > 0)
        .filter((p) => !(p.custom_fields || []).some((f) => f.label && f.required))
        .map((p) => ({ p, rank: (cats.has(p.category) ? 0 : 1) * 1e9 + unitPrice(p) }))
        .sort((a, b) => a.rank - b.rank)
        .slice(0, limit)
        .map(({ p }) => p);
}

export default function CartSuggestions({ store, products, cartItems, onAdd, primaryColor, primaryTextColor }) {
    const list = pickSuggestions(products, cartItems);
    if (!list.length) return null;
    return (
        <section className="space-y-3" aria-labelledby="cart-suggestions">
            <h2 id="cart-suggestions" className="text-base font-semibold text-[color:var(--ink,#141412)]">Souvent ajouté avec</h2>
            <ul className="grid gap-2 sm:grid-cols-3">
                {list.map((p) => (
                    <li key={p.id} className="flex min-w-0 items-center gap-3 rounded-[var(--r,16px)] border border-[color:var(--ln,rgba(0,0,0,0.08))] bg-[color:var(--bg,#FFFFFF)] p-2.5">
                        <a href={productUrl(store.slug, p.slug)} className="shrink-0" aria-label={p.title}>
                            <ProductImage src={productImage(p)} alt="" className="h-14 w-14 rounded-[min(var(--r,12px),12px)]" sizes="56px" />
                        </a>
                        <span className="min-w-0 flex-1">
                            <a href={productUrl(store.slug, p.slug)} className="block truncate text-sm font-medium text-[color:var(--ink,#141412)]">{p.title}</a>
                            <span className="block text-sm tabular-nums text-[color:var(--mu,#5F5E58)]">{formatFcfa(unitPrice(p))}</span>
                        </span>
                        <button type="button" onClick={() => onAdd(p)} aria-label={`Ajouter ${p.title} au panier`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--rb,9999px)]" style={{ backgroundColor: primaryColor, color: primaryTextColor }}>
                            <Plus className="h-4 w-4" />
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}
