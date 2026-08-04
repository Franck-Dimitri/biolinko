<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'user_id',
        'title',
        'message_template',
        'recipients_count',
        'sent_count',
        'status',
        'recipients_json',
        'attached_products_json',
        'smart_link_id',
        'completed_at',
    ];

    protected $casts = [
        'recipients_json' => 'array',
        'attached_products_json' => 'array',
        'completed_at' => 'datetime',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function smartLink(): BelongsTo
    {
        return $this->belongsTo(SmartLink::class);
    }
}
