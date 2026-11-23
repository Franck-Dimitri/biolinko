<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreDesignVersion extends Model
{
    public const UPDATED_AT = null;

    /** Versions gardées par boutique. */
    public const KEEP = 10;

    protected $fillable = ['store_id', 'design'];

    protected $casts = ['design' => 'array', 'created_at' => 'datetime'];
}
