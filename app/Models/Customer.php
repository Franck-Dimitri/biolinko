<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'whatsapp',
        'delivery_address',
        'city',
    ];

    public function stores(): BelongsToMany
    {
        return $this->belongsToMany(Store::class, 'store_customer')
            ->withPivot(['total_orders_count', 'total_spent', 'last_order_at'])
            ->withTimestamps();
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
