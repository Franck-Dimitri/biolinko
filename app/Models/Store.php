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
        'user_id',
        'name',
        'slug',
        'is_configured',
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
        'benefits_json' => 'array',
        'sections_json' => 'array',
    ];

    public static function getDefaultSections(): array
    {
        return [
            ['id' => 'banner', 'name' => "Bandeau d'Annonce Supérieur", 'enabled' => true],
            ['id' => 'hero', 'name' => "Section Héro & Slogan Boutique", 'enabled' => true],
            ['id' => 'products', 'name' => "Catalogue de Produits & Filtres", 'enabled' => true],
            ['id' => 'benefits', 'name' => "Engagements & Garanties Vendeur", 'enabled' => true],
            ['id' => 'reviews', 'name' => "Avis & Témoignages Clients", 'enabled' => true],
            ['id' => 'about', 'name' => "À propos & Informations de Contact", 'enabled' => true],
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
}
