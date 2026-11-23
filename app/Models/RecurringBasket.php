<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Panier de la semaine (alimentation) : la même commande recréée chaque semaine, payée à chaque fois
 * par le client en Mobile Money (pas de prélèvement automatique). Le client l'arrête quand il veut.
 */
class RecurringBasket extends Model
{
    protected $fillable = [
        'store_id', 'customer_id', 'first_order_id', 'token', 'customer_name', 'customer_phone', 'customer_whatsapp', 'customer_email',
        'city', 'address_details', 'items', 'desired_slot', 'next_run_at', 'active', 'stopped_reason',
    ];

    protected $casts = [
        'items' => 'array',
        'next_run_at' => 'datetime',
        'active' => 'boolean',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
