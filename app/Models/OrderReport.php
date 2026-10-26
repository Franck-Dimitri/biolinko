<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Signalement d'un client pendant le délai de sécurité. Biolinko ne tranche pas :
 * la vente est gelée le temps que vendeur et client s'arrangent.
 */
class OrderReport extends Model
{
    public const REASONS = [
        'not_received' => 'Commande non reçue',
        'not_conform' => 'Article non conforme',
        'other' => 'Autre problème',
    ];

    /** Sans réaction du client après la réponse du vendeur, la vente est libérée. */
    public const CUSTOMER_REPLY_DAYS = 3;

    /** Signalements à partir desquels un vendeur passe en contrôle. */
    public const REVIEW_THRESHOLD = 3;

    protected $fillable = ['order_id', 'store_id', 'customer_phone', 'reason', 'message', 'status', 'seller_response', 'seller_responded_at', 'closed_at'];

    protected $casts = ['seller_responded_at' => 'datetime', 'closed_at' => 'datetime'];

    protected $appends = ['reason_label'];

    public function getReasonLabelAttribute(): string
    {
        return self::REASONS[$this->reason] ?? 'Autre problème';
    }

    public function isOpen(): bool
    {
        return in_array($this->status, ['open', 'answered'], true);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
