<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'title',
        'slug',
        'description',
        'category',
        'seo_title',
        'seo_description',
        'price_vendor',
        'is_promo',
        'promo_price',
        'promo_start_at',
        'promo_end_at',
        'min_order_quantity',
        'image_url',
        'images',
        'stock',
        'is_active',
    ];

    protected $casts = [
        'price_vendor' => 'decimal:2',
        'promo_price' => 'decimal:2',
        'is_promo' => 'boolean',
        'promo_start_at' => 'date',
        'promo_end_at' => 'date',
        'min_order_quantity' => 'integer',
        'stock' => 'integer',
        'is_active' => 'boolean',
        'images' => 'array',
    ];

    protected $appends = [
        'price_display',
        'promo_active',
    ];

    /**
     * Promo réellement en cours : activée, prix promo inférieur au prix normal, et date du jour
     * comprise entre promo_start_at et promo_end_at (bornes incluses, chacune facultative).
     * Seule source de vérité pour la vitrine ET le paiement.
     */
    public function promoActive(): bool
    {
        if (! $this->is_promo || (float) $this->promo_price <= 0 || (float) $this->promo_price >= (float) $this->price_vendor) {
            return false;
        }
        $today = now()->startOfDay();
        if ($this->promo_start_at && $this->promo_start_at->copy()->startOfDay()->gt($today)) {
            return false;
        }
        if ($this->promo_end_at && $this->promo_end_at->copy()->startOfDay()->lt($today)) {
            return false;
        }

        return true;
    }

    public function getPromoActiveAttribute(): bool
    {
        return $this->promoActive();
    }

    public function getPriceDisplayAttribute(): float
    {
        return (float) ($this->promoActive() ? $this->promo_price : $this->price_vendor);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
