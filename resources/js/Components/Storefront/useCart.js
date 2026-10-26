import { track } from '@/Components/Storefront/pixels';
import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

// Frais de service ajoutés au prix vendeur, calculés sur le total (même règle que Order::clientFee).
export function serviceFee(subtotal, percent) {
    return Math.ceil(subtotal * (percent ?? 3.5) / 100);
}

export function useServiceFeePercent() {
    return usePage().props.payments?.client_fee_percent ?? 3.5;
}

export function formatFcfa(amount) {
    return `${Math.ceil(Number(amount) || 0).toLocaleString('fr-FR')} FCFA`;
}

const cartKey = (storeId) => `biolinko_cart_${storeId}`;
const CART_EVENT = 'biolinko:cart';

function readCart(storeId) {
    try {
        return JSON.parse(localStorage.getItem(cartKey(storeId)) || '[]') || [];
    } catch (e) {
        return [];
    }
}

// Prix unitaire réellement facturé : variante > promo > prix normal.
export function unitPrice(product, variant = null) {
    if (variant?.price && Number(variant.price) > 0) return Number(variant.price);
    const isPromo = product.is_promo && Number(product.promo_price) > 0 && Number(product.promo_price) < Number(product.price_vendor);
    return Number(isPromo ? product.promo_price : product.price_vendor);
}

export function variantLabel(v) {
    if (!v) return '';
    return v.name || [v.size, v.color].filter(Boolean).join(' · ');
}

/**
 * Panier d'une boutique, partagé entre toutes les pages (vitrine, fiche produit, en-tête)
 * via localStorage + un évènement pour synchroniser les composants montés.
 */
export default function useCart(storeId) {
    const [items, setItems] = useState([]);
    const feePercent = useServiceFeePercent();

    useEffect(() => {
        if (!storeId) return;
        setItems(readCart(storeId));
        const sync = (e) => {
            if (!e.detail || e.detail === storeId) setItems(readCart(storeId));
        };
        window.addEventListener(CART_EVENT, sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(CART_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, [storeId]);

    const save = useCallback((next) => {
        setItems(next);
        try {
            localStorage.setItem(cartKey(storeId), JSON.stringify(next));
        } catch (e) { /* stockage indisponible */ }
        window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: storeId }));
    }, [storeId]);

    const add = useCallback((product, quantity = null, variant = null) => {
        const minQ = product.min_order_quantity || 1;
        const qty = Math.max(quantity || minQ, minQ);
        const v = variant || product.variants?.[0] || null;
        const price = unitPrice(product, v);
        track('AddToCart', { value: price * qty, id: product.id, name: product.title });
        const current = readCart(storeId);
        const idx = current.findIndex((it) => it.product_id === product.id && it.variant_id === (v?.id ?? null));

        if (idx > -1) {
            current[idx] = { ...current[idx], quantity: current[idx].quantity + qty };
        } else {
            current.push({
                product_id: product.id,
                title: product.title,
                image_url: product.image_url || product.images?.[0] || null,
                variant_id: v?.id ?? null,
                variant_label: variantLabel(v),
                min_order_quantity: minQ,
                price_vendor: price,
                price_display: Math.ceil(price),
                quantity: qty,
            });
        }
        save(current);
    }, [storeId, save]);

    const setQuantity = useCallback((index, qty) => {
        const current = [...items];
        if (!current[index]) return;
        if (qty < (current[index].min_order_quantity || 1)) return;
        current[index] = { ...current[index], quantity: qty };
        save(current);
    }, [items, save]);

    const remove = useCallback((index) => save(items.filter((_, i) => i !== index)), [items, save]);
    const clear = useCallback(() => save([]), [save]);

    const count = items.reduce((acc, it) => acc + (it.quantity || 1), 0);
    const subtotal = items.reduce((acc, it) => acc + (it.price_display || it.price_vendor || 0) * (it.quantity || 1), 0);
    const fee = serviceFee(subtotal, feePercent);

    return { items, add, setQuantity, remove, clear, count, subtotal, fee, total: subtotal + fee };
}
