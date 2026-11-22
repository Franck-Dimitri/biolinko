<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Signalement d'une boutique par un visiteur, traité par l'équipe Biolinko. */
class StoreReport extends Model
{
    public const REASONS = [
        'fake' => 'Fausse boutique ou usurpation',
        'scam' => 'Arnaque : payé mais rien reçu',
        'prohibited' => 'Produits interdits ou dangereux',
        'other' => 'Autre problème',
    ];

    protected $fillable = ['store_id', 'reason', 'message', 'contact', 'ip_hash', 'status', 'closed_at'];

    protected $casts = ['closed_at' => 'datetime'];

    protected $hidden = ['ip_hash'];

    protected $appends = ['reason_label'];

    public function getReasonLabelAttribute(): string
    {
        return self::REASONS[$this->reason] ?? 'Autre problème';
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
