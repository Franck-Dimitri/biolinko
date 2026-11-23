import {
    AboutSection, BenefitsSection, PacksSection, ProductsSection, PromotionsSection, ReviewsSection, StoreCta, StoreHero,
} from '@/Components/Storefront/Sections';
import Hero from './sections/Hero';
import { BuilderSection, Cats, Products, Services } from './sections/Catalog';
import { Cta, FaqSection, GallerySection, Info, Packs, Promo, Reviews, Steps, Story, Trust } from './sections/Blocks';

/*
 * Registre des sections : « type + variante → composant ». Même catalogue que App\Support\StoreDesign.
 * Chaque composant reçoit { section, ctx, anchor } : la section (réglages), les données de la boutique
 * et l'ancre de navigation (#catalog-grid, #reviews…) pour la première section de son type.
 * Les variantes « classic » reprennent l'apparence Biolinko d'origine ; les autres suivent le style du template.
 */

// Rendues par la mise en page (StorefrontLayout), pas dans le corps de la vitrine
export const CHROME = ['announce', 'header', 'footer'];

// Ancres utilisées par l'en-tête et le pied de page
export const ANCHORS = { products: 'catalog-grid', services: 'catalog-grid', promo: 'promotions', packs: 'smartlinks', reviews: 'reviews', story: 'about' };

const CLASSIC = {
    hero: ({ ctx }) => <StoreHero store={ctx.store} products={ctx.products} theme={ctx.theme} onShop={ctx.onShop} />,
    products: ({ ctx }) => (
        <ProductsSection products={ctx.filteredProducts} total={ctx.products.length} categories={ctx.categories}
            selectedCategory={ctx.selectedCategory} onCategory={ctx.onCategory} search={ctx.search} onSearch={ctx.onSearch}
            cardProps={ctx.cardProps} onSeeAll={ctx.onSeeAll} limit={ctx.fullCatalog ? null : 8} />
    ),
    promo: ({ ctx }) => <PromotionsSection products={ctx.promoProducts} endsAt={ctx.promoEndsAt} theme={ctx.theme} cardProps={ctx.cardProps} />,
    packs: ({ ctx }) => <PacksSection packs={ctx.packs} theme={ctx.theme} />,
    trust: ({ ctx }) => <BenefitsSection store={ctx.store} benefits={ctx.benefits} theme={ctx.theme} />,
    reviews: ({ ctx }) => <ReviewsSection reviews={ctx.reviews} onReview={ctx.onReview} />,
    story: ({ ctx }) => <AboutSection store={ctx.store} />,
    cta: ({ ctx }) => <StoreCta theme={ctx.theme} onShop={ctx.onShop} />,
};

const REGISTRY = {
    hero: Hero,
    cats: Cats,
    products: Products,
    builder: BuilderSection,
    services: Services,
    steps: Steps,
    story: Story,
    gallery: GallerySection,
    reviews: Reviews,
    info: Info,
    promo: Promo,
    packs: Packs,
    trust: Trust,
    faq: FaqSection,
    cta: Cta,
};

/**
 * Composant d'une section : { Component, classic }. Une variante inconnue (vitrine plus récente que le code)
 * retombe sur la première variante de son type, pour qu'une vitrine valide s'affiche toujours entièrement.
 */
export function resolveSection(type, variant) {
    if (variant === 'classic' && CLASSIC[type]) return { Component: CLASSIC[type], classic: true };
    const variants = REGISTRY[type];
    if (variants?.[variant]) return { Component: variants[variant], classic: false };
    if (CLASSIC[type]) return { Component: CLASSIC[type], classic: true };
    const first = variants && Object.values(variants)[0];
    return first ? { Component: first, classic: false } : null;
}
