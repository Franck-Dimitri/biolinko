// Pixels publicitaires du vendeur (Meta, TikTok, Google). Chargés une fois par page, jamais en aperçu
// ni pour le vendeur lui-même, pour ne pas fausser ses statistiques.
const ids = { fb: null, tt: null, ga: null };

const clean = {
    fb: (v) => (/^\d{6,20}$/.test(v || '') ? v : null),
    tt: (v) => (/^[A-Z0-9]{8,30}$/i.test(v || '') ? v : null),
    ga: (v) => (/^(G|AW)-[A-Z0-9]{4,20}$/i.test(v || '') ? v : null),
};

function addScript(src) {
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
}

export function initPixels(store, { disabled = false } = {}) {
    if (typeof window === 'undefined' || disabled || !store) return;

    const fb = clean.fb(store.facebook_pixel_id);
    if (fb && !ids.fb) {
        ids.fb = fb;
        /* eslint-disable */
        !function(f,n){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window);
        /* eslint-enable */
        addScript('https://connect.facebook.net/en_US/fbevents.js');
        window.fbq('init', fb);
    }

    const tt = clean.tt(store.tiktok_pixel_id);
    if (tt && !ids.tt) {
        ids.tt = tt;
        const q = (window.ttq = window.ttq || []);
        ['page', 'track', 'identify'].forEach((m) => { q[m] = (...a) => q.push([m, ...a]); });
        addScript(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${tt}&lib=ttq`);
    }

    const ga = clean.ga(store.google_analytics_id);
    if (ga && !ids.ga) {
        ids.ga = ga;
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', ga, { send_page_view: false });
        addScript(`https://www.googletagmanager.com/gtag/js?id=${ga}`);
    }
}

const GA_NAMES = { PageView: 'page_view', ViewContent: 'view_item', AddToCart: 'add_to_cart', InitiateCheckout: 'begin_checkout', Purchase: 'purchase' };
const TT_NAMES = { ViewContent: 'ViewContent', AddToCart: 'AddToCart', InitiateCheckout: 'InitiateCheckout', Purchase: 'CompletePayment' };

/** Événement standard : PageView, ViewContent, AddToCart, InitiateCheckout, Purchase. value en FCFA. */
export function track(event, { value, id, name } = {}) {
    if (typeof window === 'undefined') return;
    const data = value != null ? { value: Number(value), currency: 'XAF' } : {};
    try {
        if (ids.fb && window.fbq) window.fbq('track', event, { ...data, ...(id ? { content_ids: [String(id)], content_type: 'product' } : {}) });
        if (ids.tt && window.ttq) event === 'PageView' ? window.ttq.page() : window.ttq.track(TT_NAMES[event], { ...data, ...(id ? { content_id: String(id), content_name: name } : {}) });
        if (ids.ga && window.gtag) window.gtag('event', GA_NAMES[event], { ...data, ...(id ? { items: [{ item_id: String(id), item_name: name }] } : {}) });
    } catch {
        // un bloqueur de pub ne doit jamais casser la boutique
    }
}
