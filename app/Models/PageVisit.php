<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Une page vue sur une boutique ou sur le site Biolinko (sans donnée personnelle). */
class PageVisit extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['store_id', 'day', 'page', 'path', 'country', 'device', 'source', 'visitor'];

    protected $casts = ['day' => 'date'];
}
