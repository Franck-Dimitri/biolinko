<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Store extends Model
{
    use HasFactory;

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
        'description',
        'about_text',
        'logo_url',
        'banner_url',
        'theme_color',
        'accent_color',
        'font_family',
        'border_radius_style',
        'theme_mode',
        'plan_type',
        'phone_whatsapp',
        'city_location',
        'opening_hours',
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
    ];

    protected $casts = [
        'is_configured' => 'boolean',
        'is_published' => 'boolean',
        'benefits_json' => 'array',
        'sections_json' => 'array',
    ];

    public static function getDefaultSections(): array
    {
        return [
            ['id' => 'banner', 'name' => "Bandeau d'Annonce Supérieur", 'enabled' => true, 'locked' => true],
            ['id' => 'hero', 'name' => "Section Héro & Slogan Boutique", 'enabled' => true, 'locked' => true],
            ['id' => 'smartlinks', 'name' => "Offres SmartLinks Express", 'enabled' => true, 'locked' => false],
            ['id' => 'products', 'name' => "Catalogue de Produits", 'enabled' => true, 'locked' => true],
            ['id' => 'benefits', 'name' => "Engagements & Garanties Vendeur", 'enabled' => true, 'locked' => false],
            ['id' => 'reviews', 'name' => "Avis & Témoignages Clients", 'enabled' => true, 'locked' => false],
            ['id' => 'about', 'name' => "À propos & Contact Vendeur", 'enabled' => true, 'locked' => false],
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
        $this->unsetRelation('user');
        $this->makeHidden(['user']);
        if (! $pixels) {
            $this->makeHidden(['facebook_pixel_id', 'tiktok_pixel_id', 'google_analytics_id']);
        }

        return $this;
    }

    public function reports(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OrderReport::class);
    }

    /** À partir de 3 signalements, les retraits du vendeur sont examinés avec attention par l'admin. */
    public function isUnderReview(): bool
    {
        return $this->reports()->count() >= OrderReport::REVIEW_THRESHOLD;
    }
}
