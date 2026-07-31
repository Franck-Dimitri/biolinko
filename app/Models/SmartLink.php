<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SmartLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'title',
        'code',
        'discount_type',
        'discount_value',
        'subtotal_amount',
        'total_amount',
        'items',
        'views_count',
        'sales_count',
        'max_uses',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'items' => 'array',
        'discount_value' => 'decimal:2',
        'subtotal_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Determine if the SmartLink is usable for checkout.
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses !== null && $this->sales_count >= $this->max_uses) {
            return false;
        }

        return true;
    }
}
