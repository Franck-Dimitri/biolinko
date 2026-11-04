<?php

namespace App\Support;

use App\Models\Product;
use App\Models\SmartLink;
use App\Models\Store;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Balises de référencement rendues côté serveur (Google, WhatsApp, Facebook et TikTok lisent le HTML brut,
 * sans exécuter le JavaScript) : titre, description, adresse canonique, aperçu de partage et données structurées.
 */
class Seo
{
    public const DEFAULT_IMAGE = '/images/brand/og-biolinko.jpg';

    public static function base(): string
    {
        return rtrim((string) config('app.url'), '/');
    }

    public static function url(?string $path = ''): string
    {
        if ($path && preg_match('#^https?://#i', $path)) {
            return $path;
        }

        return static::base().'/'.ltrim((string) $path, '/');
    }

    /** Texte propre pour une description : sans HTML, sans retours à la ligne, coupé proprement. */
    public static function text(?string $value, int $limit = 160): string
    {
        $plain = trim(preg_replace('/\s+/u', ' ', strip_tags((string) $value)));

        return Str::limit($plain, $limit, '…');
    }

    public static function money(float $amount): string
    {
        return number_format($amount, 0, ',', ' ').' FCFA';
    }

    /** Page à ne pas indexer (espace connecté, suivi de commande, erreurs, aperçus…). */
    public static function noindex(string $title = 'Biolinko'): array
    {
        return ['title' => $title, 'robots' => 'noindex, nofollow'];
    }

    public static function landing(): array
    {
        $description = 'Créez votre boutique en ligne en 5 minutes et encaissez en MTN MoMo et Orange Money. Liens de paiement, livraison, codes promo, factures : tout pour vendre sur WhatsApp, Instagram et TikTok.';

        return [
            'title' => 'Biolinko : votre boutique en ligne payée en Mobile Money',
            'description' => $description,
            'canonical' => static::url('/'),
            'image' => static::url(static::DEFAULT_IMAGE),
            'type' => 'website',
            'jsonld' => [
                [
                    '@context' => 'https://schema.org', '@type' => 'Organization', 'name' => 'Biolinko',
                    'url' => static::url('/'), 'logo' => static::url('/images/brand/logo-noir-hd.png'),
                ],
                [
                    '@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => 'Biolinko', 'url' => static::url('/'),
                    'inLanguage' => 'fr', 'description' => $description,
                ],
            ],
        ];
    }

    public static function page(string $title, string $description, string $path): array
    {
        return ['title' => "{$title} | Biolinko", 'description' => $description, 'canonical' => static::url($path), 'image' => static::url(static::DEFAULT_IMAGE), 'type' => 'website'];
    }

    public static function storeImage(Store $store): string
    {
        return static::url($store->banner_url ?: ($store->logo_url ?: static::DEFAULT_IMAGE));
    }

    /**
     * @param  Collection<int, Product>  $products  produits actifs
     * @param  Collection  $reviews  avis publiés de la boutique
     */
    public static function store(Store $store, Collection $products, Collection $reviews): array
    {
        $url = static::url('/'.$store->slug);
        $place = $store->city_location ? " à {$store->city_location}" : '';
        $title = $store->seo_title ?: $store->name.($store->category ? " : {$store->category}{$place}" : $place);
        $description = $store->seo_description
            ?: static::text($store->description ?: $store->about_text
                ?: "{$store->name} : boutique en ligne{$place}. {$products->count()} article".($products->count() > 1 ? 's' : '').', paiement sécurisé MTN MoMo et Orange Money, livraison.');

        $org = array_filter([
            '@context' => 'https://schema.org', '@type' => 'OnlineStore', '@id' => $url.'#boutique',
            'name' => $store->name, 'url' => $url, 'description' => static::text($store->description ?: $store->about_text, 300) ?: null,
            'logo' => $store->logo_url ? static::url($store->logo_url) : null,
            'image' => static::storeImage($store),
            'address' => $store->city_location ? ['@type' => 'PostalAddress', 'addressLocality' => $store->city_location, 'addressCountry' => $store->country ?: 'CM'] : null,
            'sameAs' => array_values(array_filter([$store->instagram_link, $store->tiktok_link, $store->facebook_link], fn ($l) => $l && preg_match('#^https?://#', $l))) ?: null,
            'aggregateRating' => static::rating($reviews),
        ], fn ($v) => $v !== null && $v !== '');

        $list = $products->isEmpty() ? null : [
            '@context' => 'https://schema.org', '@type' => 'ItemList', 'name' => "Articles de {$store->name}",
            'itemListElement' => $products->take(30)->values()->map(fn ($p, $i) => [
                '@type' => 'ListItem', 'position' => $i + 1, 'url' => static::url("/{$store->slug}/p/{$p->slug}"), 'name' => $p->title,
            ])->all(),
        ];

        return [
            'title' => Str::limit($title, 65, '…').' | Biolinko',
            'description' => $description,
            'canonical' => $url,
            'image' => static::storeImage($store),
            'type' => 'website',
            'site_name' => $store->name,
            'jsonld' => array_values(array_filter([$org, $list])),
        ];
    }

    public static function product(Store $store, Product $product, Collection $reviews): array
    {
        $url = static::url("/{$store->slug}/p/{$product->slug}");
        $price = (float) ($product->price_display ?? $product->price_vendor);
        $images = collect($product->images ?: [])->prepend($product->image_url)->filter()->unique()->map(fn ($i) => static::url($i))->values();
        $inStock = (int) $product->stock > 0;

        $title = $product->seo_title ?: "{$product->title} | {$store->name}";
        $description = $product->seo_description
            ?: static::text("{$product->title} à ".static::money($price)." chez {$store->name}".($store->city_location ? " ({$store->city_location})" : '').'. '.($product->description ?: 'Paiement sécurisé MTN MoMo et Orange Money, livraison.'));

        $offer = array_filter([
            '@type' => 'Offer', 'url' => $url, 'price' => (string) round($price), 'priceCurrency' => $store->currency ?: 'XAF',
            'availability' => $inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            'itemCondition' => 'https://schema.org/NewCondition',
            'priceValidUntil' => $product->is_promo && $product->promo_end_at ? $product->promo_end_at->toDateString() : null,
            'seller' => ['@type' => 'Organization', 'name' => $store->name, 'url' => static::url('/'.$store->slug)],
        ], fn ($v) => $v !== null);

        $schema = array_filter([
            '@context' => 'https://schema.org', '@type' => 'Product', '@id' => $url.'#produit',
            'name' => $product->title, 'url' => $url, 'sku' => (string) $product->id,
            'description' => static::text($product->description, 1000) ?: null,
            'image' => $images->all() ?: [static::storeImage($store)],
            'category' => $product->category ?: null,
            'brand' => ['@type' => 'Brand', 'name' => $store->name],
            'offers' => $offer,
            'aggregateRating' => static::rating($reviews),
            'review' => $reviews->take(5)->map(fn ($r) => [
                '@type' => 'Review', 'reviewRating' => ['@type' => 'Rating', 'ratingValue' => (int) $r->rating, 'bestRating' => 5],
                'author' => ['@type' => 'Person', 'name' => Str::limit((string) $r->customer_name, 60, '')],
                'reviewBody' => static::text($r->comment, 500), 'datePublished' => $r->created_at?->toDateString(),
            ])->values()->all() ?: null,
        ], fn ($v) => $v !== null && $v !== '');

        $crumbs = [['Accueil', static::url('/'.$store->slug), $store->name]];
        if ($product->category) {
            $crumbs[] = ['Catégorie', static::url('/'.$store->slug).'?categorie='.rawurlencode($product->category), $product->category];
        }
        $crumbs[] = ['Produit', $url, $product->title];
        $breadcrumb = [
            '@context' => 'https://schema.org', '@type' => 'BreadcrumbList',
            'itemListElement' => collect($crumbs)->values()->map(fn ($c, $i) => ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $c[2], 'item' => $c[1]])->all(),
        ];

        return [
            'title' => Str::limit($title, 70, '…'),
            'description' => $description,
            'canonical' => $url,
            'image' => $images->first() ?: static::storeImage($store),
            'type' => 'product',
            'site_name' => $store->name,
            'price' => ['amount' => (string) round($price), 'currency' => $store->currency ?: 'XAF', 'availability' => $inStock ? 'instock' : 'oos'],
            'jsonld' => [$schema, $breadcrumb],
        ];
    }

    /** Pack (lien de paiement) : partagé sur WhatsApp, mais pas indexé (offre temporaire). */
    public static function smartLink(Store $store, SmartLink $link, ?string $image = null): array
    {
        return [
            'title' => "{$link->title} | {$store->name}",
            'description' => static::text(($link->description ?? '') ?: "{$link->title} à ".static::money((float) $link->total_amount)." chez {$store->name}. Paiement sécurisé MTN MoMo et Orange Money."),
            'canonical' => static::url('/pay/'.$link->code),
            'image' => $image ? static::url($image) : static::storeImage($store),
            'type' => 'website',
            'site_name' => $store->name,
            'robots' => 'noindex, follow',
        ];
    }

    private static function rating(Collection $reviews): ?array
    {
        if ($reviews->isEmpty()) {
            return null;
        }

        return ['@type' => 'AggregateRating', 'ratingValue' => (string) round($reviews->avg('rating'), 1), 'reviewCount' => $reviews->count(), 'bestRating' => 5, 'worstRating' => 1];
    }
}
