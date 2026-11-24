<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Ancienne adresse d'une boutique, redirigée vers l'adresse actuelle. */
class StoreSlugRedirect extends Model
{
    protected $fillable = ['old_slug', 'store_id'];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
