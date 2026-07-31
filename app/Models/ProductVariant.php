<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'size',
        'color',
        'price',
        'sku',
        'stock_quantity',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function getLabelAttribute(): string
    {
        if (!empty($this->name)) {
            return $this->name;
        }

        $parts = array_filter([$this->size, $this->color]);
        return implode(' / ', $parts) ?: 'Standard';
    }

    /**
     * Get effective price for this variant (or product fallback).
     */
    public function getEffectivePrice(?Product $product = null): float
    {
        if ($this->price !== null && (float) $this->price > 0) {
            return (float) $this->price;
        }

        $targetProduct = $product ?? $this->product;
        if ($targetProduct) {
            return (float) ($targetProduct->is_promo && $targetProduct->promo_price ? $targetProduct->promo_price : $targetProduct->price_vendor);
        }

        return 0.00;
    }
}
