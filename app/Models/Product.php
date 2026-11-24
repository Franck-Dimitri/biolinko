<?php

namespace App\Models;

use App\Support\IndexNow;
use App\Support\SeoCache;
use App\Support\StoreUrl;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected static function booted(): void
    {
        // Produit d'une boutique en ligne ajouté, modifié ou retiré : moteurs prévenus, plans du site rafraîchis
        $notify = function (Product $product) {
            $store = $product->store;
            if (! $store?->is_published || ! $store->slug || ! $product->slug) {
                return;
            }
            SeoCache::forget($store->slug);
            IndexNow::queue(StoreUrl::product($store, $product->slug), StoreUrl::home($store));
        };
        // Pas à chaque vente (le stock change) : seulement quand ce qui est affiché change
        static::saved(function (Product $product) use ($notify) {
            if ($product->wasRecentlyCreated || $product->wasChanged(['title', 'slug', 'description', 'price_vendor', 'promo_price', 'is_promo', 'is_active', 'image_url', 'images', 'seo_title', 'seo_description', 'category'])) {
                $notify($product);
            }
        });
        static::deleted($notify);
    }

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
        'fulfillment',
        'lead_time_hours',
        'daily_capacity',
        'custom_fields',
        'duration_minutes',
        'specs',
        'is_active',
        'example_of',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'specs' => 'array',
        'duration_minutes' => 'integer',
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

    /** Produit fabriqué ou préparé à la demande (pâtisserie, couture, prestation…) : pas de stock, une date souhaitée. */
    public function isMadeToOrder(): bool
    {
        return $this->fulfillment === 'made_to_order';
    }

    /** Champs que le client remplit pour ce produit (message, mensurations…). */
    public function customFields(): array
    {
        return array_values(array_filter($this->custom_fields ?? [], fn ($f) => filled($f['label'] ?? null)));
    }
}
