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
