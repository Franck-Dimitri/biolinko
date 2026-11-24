<?php

namespace App\Support;

use App\Models\Product;
use App\Models\SmartLink;
use App\Models\Store;
use App\Models\User;
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
            'jsonld' => static::platformSchemas($description, true),
        ];
    }

    public static function page(string $title, string $description, string $path): array
    {
        return ['title' => "{$title} | Biolinko", 'description' => $description, 'canonical' => static::url($path), 'image' => static::url(static::DEFAULT_IMAGE), 'type' => 'website'];
    }

    public const CONTACT_EMAIL = 'contact@biolinko.app';

    /**
     * Biolinko pour les moteurs de recherche et les assistants IA : l'organisation, le site, le logiciel et ses
     * formules (prix et commissions tirés du code), et la FAQ affichée sur la page d'accueil.
     */
    public static function platformSchemas(string $description, bool $withFaq = false): array
    {
        $org = [
            '@context' => 'https://schema.org', '@type' => 'Organization', '@id' => static::url('/').'#organisation',
            'name' => 'Biolinko', 'url' => static::url('/'), 'logo' => static::url('/images/brand/logo-noir-hd.png'),
            'description' => $description, 'email' => static::CONTACT_EMAIL, 'areaServed' => ['@type' => 'Country', 'name' => 'Cameroun'],
            'contactPoint' => ['@type' => 'ContactPoint', 'contactType' => 'customer support', 'email' => static::CONTACT_EMAIL, 'availableLanguage' => 'French'],
        ];
        $site = [
            '@context' => 'https://schema.org', '@type' => 'WebSite', '@id' => static::url('/').'#site', 'name' => 'Biolinko',
            'url' => static::url('/'), 'inLanguage' => 'fr', 'description' => $description, 'publisher' => ['@id' => static::url('/').'#organisation'],
        ];
        $rates = (array) config('payments.commission_percent');
        $app = [
            '@context' => 'https://schema.org', '@type' => 'SoftwareApplication', 'name' => 'Biolinko',
            'applicationCategory' => 'BusinessApplication', 'operatingSystem' => 'Web', 'url' => static::url('/'),
            'description' => 'Boutique en ligne, catalogue, commandes, livraison, factures et paiements MTN MoMo et Orange Money pour les vendeurs du Cameroun.',
            'publisher' => ['@id' => static::url('/').'#organisation'],
            'offers' => collect(User::PLAN_PRICES)->map(fn ($price, $plan) => [
                '@type' => 'Offer', 'name' => ucfirst($plan), 'price' => (string) $price, 'priceCurrency' => 'XAF',
                'description' => ($price ? 'Abonnement mensuel' : 'Gratuit').(isset($rates[$plan]) ? ", commission de {$rates[$plan]} % par vente" : ''),
            ])->values()->all(),
        ];
        $faq = null;
        if ($withFaq && is_file($file = resource_path('data/faq.json'))) {
            $faq = [
                '@context' => 'https://schema.org', '@type' => 'FAQPage',
                'mainEntity' => collect(json_decode(file_get_contents($file), true) ?: [])->map(fn ($f) => [
                    '@type' => 'Question', 'name' => $f['q'], 'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f['a']],
                ])->all(),
            ];
        }

        return array_values(array_filter([$org, $site, $app, $faq]));
    }

    /** Article du centre d'aide : article et fil d'Ariane. */
    public static function helpArticle(array $item): array
    {
        $url = static::url('/aide/'.$item['slug']);

        return static::page($item['title'], $item['summary'], '/aide/'.$item['slug']) + ['jsonld' => [
            [
                '@context' => 'https://schema.org', '@type' => 'Article', 'headline' => $item['title'], 'description' => $item['summary'],
                'inLanguage' => 'fr', 'url' => $url, 'mainEntityOfPage' => $url, 'image' => static::url(static::DEFAULT_IMAGE),
                'author' => ['@type' => 'Organization', 'name' => 'Biolinko', 'url' => static::url('/')],
                'publisher' => ['@type' => 'Organization', 'name' => 'Biolinko', 'logo' => ['@type' => 'ImageObject', 'url' => static::url('/images/brand/logo-noir-hd.png')]],
            ],
            static::breadcrumb([['Biolinko', static::url('/')], ['Centre d’aide', static::url('/aide')], [$item['title'], $url]]),
        ]];
    }

    /** @param  array<int, array{0: string, 1: string}>  $items  [nom, adresse] */
    public static function breadcrumb(array $items): array
    {
        return [
            '@context' => 'https://schema.org', '@type' => 'BreadcrumbList',
            'itemListElement' => collect($items)->values()->map(fn ($c, $i) => ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $c[0], 'item' => $c[1]])->all(),
        ];
    }

    private const DAYS = ['mon' => 'Monday', 'tue' => 'Tuesday', 'wed' => 'Wednesday', 'thu' => 'Thursday', 'fri' => 'Friday', 'sat' => 'Saturday', 'sun' => 'Sunday'];

    /** Horaires saisis par le vendeur → openingHoursSpecification (jours fermés omis). */
    private static function openingHours(?array $schedule): ?array
    {
        $specs = collect($schedule ?: [])->filter(fn ($slot, $day) => isset(self::DAYS[$day]) && is_array($slot) && ! empty($slot['open']) && ! empty($slot['close']))
            ->map(fn ($slot, $day) => ['@type' => 'OpeningHoursSpecification', 'dayOfWeek' => 'https://schema.org/'.self::DAYS[$day], 'opens' => $slot['open'], 'closes' => $slot['close']])
            ->values()->all();

        return $specs ?: null;
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
        $url = StoreUrl::home($store);
        $place = $store->city_location ? " à {$store->city_location}" : '';
        $title = $store->seo_title ?: $store->name.($store->category ? " : {$store->category}{$place}" : $place);
        $description = $store->seo_description
            ?: static::text($store->description ?: $store->about_text
                ?: "{$store->name} : boutique en ligne{$place}. {$products->count()} article".($products->count() > 1 ? 's' : '').', paiement sécurisé MTN MoMo et Orange Money, livraison.');

        // Boutique avec une adresse ou des horaires : aussi un commerce local (Google Maps, recherches « près de moi »)
        $local = $store->location_address || $store->opening_schedule;
        $country = $store->country ?: 'CM';
        $org = array_filter([
            '@context' => 'https://schema.org', '@type' => $local ? ['OnlineStore', 'LocalBusiness'] : 'OnlineStore', '@id' => $url.'#boutique',
            'name' => $store->name, 'url' => $url, 'description' => static::text($store->description ?: $store->about_text, 300) ?: null,
            'logo' => $store->logo_url ? static::url($store->logo_url) : null,
            'image' => static::storeImage($store),
            'telephone' => $store->phone_whatsapp ?: null,
            'email' => $store->support_email ?: null,
            'address' => ($store->city_location || $store->location_address) ? array_filter([
                '@type' => 'PostalAddress', 'streetAddress' => $store->location_address ?: null,
                'addressLocality' => $store->city_location ?: null, 'addressCountry' => $country,
            ]) : null,
            'areaServed' => $store->city_location ? ['@type' => 'City', 'name' => $store->city_location] : ['@type' => 'Country', 'name' => $country === 'CM' ? 'Cameroun' : $country],
            'openingHoursSpecification' => static::openingHours($store->opening_schedule),
            'currenciesAccepted' => $store->currency ?: 'XAF',
            'paymentAccepted' => 'Mobile Money (MTN MoMo, Orange Money)',
            'sameAs' => array_values(array_filter([$store->instagram_link, $store->tiktok_link, $store->facebook_link], fn ($l) => $l && preg_match('#^https?://#', $l))) ?: null,
            'aggregateRating' => static::rating($reviews),
        ], fn ($v) => $v !== null && $v !== '');

        $list = $products->isEmpty() ? null : [
            '@context' => 'https://schema.org', '@type' => 'ItemList', 'name' => "Articles de {$store->name}",
            'itemListElement' => $products->take(30)->values()->map(fn ($p, $i) => [
                '@type' => 'ListItem', 'position' => $i + 1, 'url' => StoreUrl::product($store, $p->slug), 'name' => $p->title,
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
        $url = StoreUrl::product($store, $product->slug);
        $price = (float) ($product->price_display ?? $product->price_vendor);
        $images = collect($product->images ?: [])->prepend($product->image_url)->filter()->unique()->map(fn ($i) => static::url($i))->values();
        $inStock = (int) $product->stock > 0;

        $title = $product->seo_title ?: "{$product->title} | {$store->name}";
        $description = $product->seo_description
            ?: static::text("{$product->title} à ".static::money($price)." chez {$store->name}".($store->city_location ? " ({$store->city_location})" : '').'. '.($product->description ?: 'Paiement sécurisé MTN MoMo et Orange Money, livraison.'));

        // Préparé à la demande (gâteau, sur-mesure, prestation) : disponible sur commande, jamais « en rupture »
        $madeToOrder = $product->fulfillment === 'made_to_order';
        $availability = $madeToOrder ? 'https://schema.org/MadeToOrder' : ($inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock');
        $currency = $store->currency ?: 'XAF';
        // Variantes à des prix différents : fourchette de prix
        $prices = collect($product->relationLoaded('variants') ? $product->variants : [])->pluck('price')->filter(fn ($p) => (float) $p > 0)
            ->map(fn ($p) => (float) $p)->push($price)->unique()->values();
        $offer = $prices->count() > 1 ? [
            '@type' => 'AggregateOffer', 'url' => $url, 'lowPrice' => (string) round($prices->min()), 'highPrice' => (string) round($prices->max()),
            'offerCount' => $prices->count(), 'priceCurrency' => $currency, 'availability' => $availability,
            'seller' => ['@type' => 'Organization', 'name' => $store->name, 'url' => StoreUrl::home($store)],
        ] : array_filter([
            '@type' => 'Offer', 'url' => $url, 'price' => (string) round($price), 'priceCurrency' => $currency,
            'availability' => $availability,
            'itemCondition' => 'https://schema.org/NewCondition',
            'priceValidUntil' => $product->promoActive() && $product->promo_end_at ? $product->promo_end_at->toDateString() : null,
            'seller' => ['@type' => 'Organization', 'name' => $store->name, 'url' => StoreUrl::home($store)],
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

        $crumbs = [['Accueil', StoreUrl::home($store), $store->name]];
        if ($product->category) {
            $crumbs[] = ['Catégorie', StoreUrl::home($store).'?categorie='.rawurlencode($product->category), $product->category];
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
            'price' => ['amount' => (string) round($price), 'currency' => $currency, 'availability' => ($madeToOrder || $inStock) ? 'instock' : 'oos'],
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
