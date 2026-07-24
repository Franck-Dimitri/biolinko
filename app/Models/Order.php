<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'tracking_code',
        'store_id',
        'customer_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'city',
        'address_details',
        'price_vendor',
        'saas_margin',
        'api_fee',
        'total_client',
        'status',
        'payment_status',
        'paid_at',
    ];

    protected $casts = [
        'price_vendor' => 'decimal:2',
        'saas_margin' => 'decimal:2',
        'api_fee' => 'decimal:2',
        'total_client' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->uuid)) {
                $order->uuid = (string) Str::uuid();
            }
            if (empty($order->tracking_code)) {
                $order->tracking_code = 'BLK-' . strtoupper(Str::random(8));
            }
        });
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
