<?php

namespace App\Models;

use App\Support\BusinessTypes;
use App\Support\OpeningHours;
use App\Support\StoreDesign;
use App\Support\StoreUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Store extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        // Changement d'adresse : l'ancienne redirige vers la nouvelle et reste réservée à la boutique
        static::updated(function (Store $store) {
            if (! $store->wasChanged('slug')) {
                return;
            }
            $old = $store->getOriginal('slug');
            if ($old) {
                StoreSlugRedirect::updateOrCreate(['old_slug' => $old], ['store_id' => $store->id]);
            }
            StoreSlugRedirect::where('old_slug', $store->slug)->delete();
        });
    }

    public function slugRedirects(): HasMany
    {
        return $this->hasMany(StoreSlugRedirect::class);
    }

    /** Adresse publique de la boutique (domaine des boutiques en production). */
    protected $appends = ['public_url', 'public_address'];

    public function getPublicUrlAttribute(): string
    {
        return StoreUrl::home($this);
    }

    public function getPublicAddressAttribute(): string
    {
        return StoreUrl::display($this);
    }

    protected $fillable = [
        'country',
        'currency',
        'facebook_pixel_id',
        'tiktok_pixel_id',
        'google_analytics_id',
        'user_id',
        'name',
        'slug',
        'is_configured',
        'is_published',
        'category',
        'business_type',
        'description',
        'about_text',
        'logo_url',
        'banner_url',
        'theme_color',
        'accent_color',
        'font_family',
        'border_radius_style',
        'pattern',
        'theme_mode',
        'plan_type',
        'phone_whatsapp',
        'city_location',
        'opening_hours',
        'opening_schedule',
        'min_order_amount',
        'announcement_header',
        'instagram_link',
        'tiktok_link',
        'facebook_link',
        'hero_badge_text',
        'hero_title',
        'hero_subtitle',
        'hero_cta_text',
        'benefits_json',
        'sections_json',
        'location_address',
        'support_email',
        'delivery_zones',
        'delivery_other_fee',
        'delivery_free_from',
        'deposit_percent',
        'seo_title',
        'seo_description',
    ];

    protected $casts = [
        'delivery_zones' => 'array',
        'delivery_other_fee' => 'float',
        'delivery_free_from' => 'float',
        'deposit_percent' => 'integer',
        'is_configured' => 'boolean',
        'is_published' => 'boolean',
        'benefits_json' => 'array',
        'sections_json' => 'array',
        'design' => 'array',
        'opening_schedule' => 'array',
        'min_order_amount' => 'float',
        'design_draft' => 'array',
        'design_engine' => 'boolean',
    ];

    public static function getDefaultSections(): array
    {
        return [
            ['id' => 'banner', 'name' => "Bandeau d'Annonce Supérieur", 'enabled' => true, 'locked' => true],
            ['id' => 'hero', 'name' => 'Section Héro & Slogan Boutique', 'enabled' => true, 'locked' => true],
            ['id' => 'smartlinks', 'name' => 'Offres SmartLinks Express', 'enabled' => true, 'locked' => false],
            ['id' => 'products', 'name' => 'Catalogue de Produits', 'enabled' => true, 'locked' => true],
            ['id' => 'benefits', 'name' => 'Engagements & Garanties Vendeur', 'enabled' => true, 'locked' => false],
            ['id' => 'reviews', 'name' => 'Avis & Témoignages Clients', 'enabled' => true, 'locked' => false],
            ['id' => 'about', 'name' => 'À propos & Contact Vendeur', 'enabled' => true, 'locked' => false],
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(StoreReview::class);
    }

    public function customers(): BelongsToMany
    {
        return $this->belongsToMany(Customer::class, 'store_customer')
            ->withPivot(['total_orders_count', 'total_spent', 'last_order_at'])
            ->withTimestamps();
    }

    public function smartLinks(): HasMany
    {
        return $this->hasMany(SmartLink::class);
    }

    /**
     * Prépare la boutique pour une page publique : retire le compte du vendeur (e-mail, téléphone, plan…)
     * et n'expose les pixels que si le plan du vendeur les inclut (Pro et plus).
     */
    public function forPublic(): static
    {
        $pixels = (bool) $this->user?->hasPlan('pro');
        // Repères de confiance affichés au client avant qu'il paie
        // Modèle de l'activité : vocabulaire de la vitrine (Commander, Réserver…)
        $template = BusinessTypes::get($this->business_type);
        $this->setAttribute('template', ['cta' => $template['cta'], 'date_label' => $template['date_label'], 'fulfillment' => $template['fulfillment'], 'lead_time_hours' => $template['lead_time_hours'] ?? null]);
        $this->setAttribute('trust', [
            'verified' => (bool) $this->user?->isVerified(),
            'since' => $this->created_at?->toIso8601String(),
            'delivered' => Order::where('store_id', $this->id)->where('status', 'delivered')->count(),
        ]);
        // Vitrine publiée (moteur de vitrine) ; null = template « Classique » calculé côté client depuis les réglages
        $this->setAttribute('storefront_design', StoreDesign::forStore($this));
        // Ouvert ou fermé maintenant, d'après les horaires par jour
        $this->setAttribute('opening_status', OpeningHours::status($this->opening_schedule));
        $this->unsetRelation('user');
        $this->makeHidden(['user', 'design', 'design_draft', 'design_engine']);
        if (! $pixels) {
            $this->makeHidden(['facebook_pixel_id', 'tiktok_pixel_id', 'google_analytics_id']);
        }

        return $this;
    }

    public function promoCodes(): HasMany
    {
        return $this->hasMany(PromoCode::class);
    }

    public function hasDelivery(): bool
    {
        return ! empty($this->delivery_zones) || $this->delivery_other_fee !== null;
    }

    /**
     * Frais de livraison pour une ville, selon les zones du vendeur.
     * null = le vendeur ne livre pas cette ville. Sans zones configurées : livraison non facturée (0).
     */
    public function deliveryFeeFor(string $city, float $goods): ?float
    {
        if (! $this->hasDelivery()) {
            return 0;
        }

        $key = mb_strtolower(trim($city));
        $zone = collect($this->delivery_zones ?? [])->first(fn ($z) => mb_strtolower(trim($z['name'] ?? '')) === $key);
        $fee = $zone ? (float) $zone['fee'] : $this->delivery_other_fee;

        if ($fee === null) {
            return null;
        }
        if ($this->delivery_free_from !== null && $goods >= $this->delivery_free_from) {
            return 0;
        }

        return $fee;
    }

    public function reports(): HasMany
    {
        return $this->hasMany(OrderReport::class);
    }

    /** À partir de 3 signalements, les retraits du vendeur sont examinés avec attention par l'admin. */
    public function isUnderReview(): bool
    {
        return $this->reports()->count() >= OrderReport::REVIEW_THRESHOLD;
    }
}
