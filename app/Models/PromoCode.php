<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromoCode extends Model
{
    protected $fillable = ['store_id', 'code', 'type', 'value', 'min_subtotal', 'max_uses', 'used_count', 'ends_at', 'is_active'];

    protected $casts = [
        'value' => 'decimal:2',
        'min_subtotal' => 'decimal:2',
        'ends_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public static function normalize(string $code): string
    {
        return strtoupper(preg_replace('/\s+/', '', $code));
    }

    /**
     * Remise accordée sur le montant des articles, ou message d'erreur pour le client.
     *
     * @return array{0: float, 1: ?string}
     */
    public function evaluate(float $goods): array
    {
        if (! $this->is_active) {
            return [0, 'Ce code promo n’est plus actif.'];
        }
        if ($this->ends_at && $this->ends_at->isPast()) {
            return [0, 'Ce code promo a expiré.'];
        }
        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return [0, 'Ce code promo a atteint son nombre maximum d’utilisations.'];
        }
        if ($this->min_subtotal !== null && $goods < (float) $this->min_subtotal) {
            return [0, 'Ce code est valable dès '.number_format((float) $this->min_subtotal, 0, ',', ' ').' FCFA d’achat.'];
        }

        $discount = $this->type === 'percent'
            ? floor($goods * min(100, (float) $this->value) / 100)
            : (float) $this->value;

        return [min($goods, $discount), null];
    }

    public function label(): string
    {
        return $this->type === 'percent'
            ? rtrim(rtrim(number_format((float) $this->value, 2, ',', ''), '0'), ',').' %'
            : number_format((float) $this->value, 0, ',', ' ').' FCFA';
    }
}
