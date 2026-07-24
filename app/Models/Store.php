<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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
        'location_address',
        'support_email',
    ];

    protected $casts = [
        'is_configured' => 'boolean',
        'benefits_json' => 'array',
    ];

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
}
