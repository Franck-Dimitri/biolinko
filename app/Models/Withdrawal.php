<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'wallet_id',
        'amount_requested',
        'fee_api',
        'fee_saas',
        'net_transferred',
        'phone_momo',
        'status',
    ];

    protected $casts = [
        'amount_requested' => 'decimal:2',
        'fee_api' => 'decimal:2',
        'fee_saas' => 'decimal:2',
        'net_transferred' => 'decimal:2',
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }
}
