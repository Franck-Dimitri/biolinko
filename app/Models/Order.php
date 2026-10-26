<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_provider',
        'payment_reference',
        'commission_rate',
        'commission_amount',
        'currency',
        'payment_country',
        'smart_link_id',
        'payment_reminded_at',
        'funds_release_at',
        'funds_released_at',
        'uuid',
        'tracking_code',
        'store_id',
        'customer_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'city',
        'address_details',
        'price_vendor',
        'saas_margin',
        'api_fee',
        'total_client',
        'status',
        'is_manual',
        'hrskills_reference',
        'hrskills_transaction_id',
        'payment_status',
        'payment_operator',
        'payment_phone',
        'paid_at',
        'invoice_number',
        'invoice_issued_at',
        'invoice_due_at',
        'invoice_notes',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'payment_reminded_at' => 'datetime',
        'funds_release_at' => 'datetime',
        'funds_released_at' => 'datetime',
        'is_manual' => 'boolean',
        'price_vendor' => 'decimal:2',
        'saas_margin' => 'decimal:2',
        'api_fee' => 'decimal:2',
        'total_client' => 'decimal:2',
        'paid_at' => 'datetime',
        'invoice_issued_at' => 'datetime',
        'invoice_due_at' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->uuid)) {
                $order->uuid = (string) Str::uuid();
            }
            if (empty($order->tracking_code)) {
                $order->tracking_code = 'BLK-CMD-' . strtoupper(Str::random(10));
            }
        });

        // Une facture est émise (et numérotée) à la création d'une facture manuelle ou au paiement d'une commande
        static::saving(function ($order) {
            $isPaid = $order->payment_status === 'paid' || in_array($order->status, ['paid', 'in_delivery', 'delivered'], true);
            if (empty($order->invoice_number) && ($order->is_manual || $isPaid) && $order->store_id) {
                $order->issueInvoiceNumber();
            }
        });
    }

    /**
     * Attribue le prochain numéro de facture de la boutique : F-AAAA-0001, F-AAAA-0002…
     */
    public function issueInvoiceNumber(): void
    {
        $year = now()->year;
        $prefix = "F-{$year}-";

        $last = static::where('store_id', $this->store_id)
            ->where('invoice_number', 'like', $prefix.'%')
            ->orderByDesc('invoice_number')
            ->lockForUpdate()
            ->value('invoice_number');

        $next = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;

        $this->invoice_number = $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
        $this->invoice_issued_at = $this->invoice_issued_at ?? now();
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Seul point d'entrée pour valider un paiement (webhook ou contrôle du client) :
     * verrouille la commande, crédite le portefeuille, décrémente le stock et met à jour la fiche client une seule fois.
     * Renvoie true si c'est cet appel qui a validé le paiement.
     */
    public function markAsPaid(?string $transactionId = null): bool
    {
        $paid = DB::transaction(function () use ($transactionId) {
            $order = static::whereKey($this->id)->lockForUpdate()->first();
            if (! $order || $order->payment_status === 'paid') {
                return false;
            }

            // Commission figée selon le plan du vendeur au moment du paiement
            $rate = static::commissionRateFor($order->store?->user);
            $order->update([
                'status' => 'paid',
                'payment_status' => 'paid',
                'paid_at' => now(),
                'hrskills_transaction_id' => $transactionId ?? $order->hrskills_transaction_id,
                'commission_rate' => $rate,
                'commission_amount' => round((float) $order->price_vendor * $rate / 100),
            ]);

            // La vente reste « en attente » le temps du délai de sécurité, puis devient retirable (releaseFunds)
            $order->update(['funds_release_at' => now()->addDays(static::holdDaysFor($order->store_id))]);
            $wallet = Wallet::where('store_id', $order->store_id)->lockForUpdate()->first()
                ?? Wallet::create(['store_id' => $order->store_id, 'balance_available' => 0, 'balance_pending' => 0]);
            $wallet->increment('balance_held', $order->sellerNet());

            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $q = (int) $item->quantity;
                    Product::whereKey($item->product_id)->update(['stock' => DB::raw("CASE WHEN stock > {$q} THEN stock - {$q} ELSE 0 END")]);
                }
                if ($item->variant_id) {
                    $q = (int) $item->quantity;
                    ProductVariant::whereKey($item->variant_id)->update(['stock_quantity' => DB::raw("CASE WHEN stock_quantity > {$q} THEN stock_quantity - {$q} ELSE 0 END")]);
                }
            }

            // Le compteur du lien de paiement (et sa limite d'utilisations) ne compte que les ventes payées
            if ($order->smart_link_id) {
                SmartLink::whereKey($order->smart_link_id)->increment('sales_count');
            }

            // Le fichier client ne compte que les commandes réellement payées
            if ($order->customer_id && $order->store) {
                $pivot = $order->store->customers()->where('customer_id', $order->customer_id)->first()?->pivot;
                $stats = [
                    'total_orders_count' => ($pivot->total_orders_count ?? 0) + 1,
                    'total_spent' => (float) ($pivot->total_spent ?? 0) + (float) $order->total_client,
                    'last_order_at' => now(),
                ];
                $pivot
                    ? $order->store->customers()->updateExistingPivot($order->customer_id, $stats)
                    : $order->store->customers()->attach($order->customer_id, $stats);
            }

            return true;
        });

        if ($paid) {
            $this->refresh();
            try {
                app(\App\Services\OrderInvoiceService::class)->sendOrderInvoiceEmails($this);
            } catch (\Throwable $e) {
                Log::warning('Invoice emails failed', ['order_id' => $this->id, 'err' => $e->getMessage()]);
            }
            try {
                app(\App\Services\WhatsappGatewayService::class)->notifyOrderPaid($this);
            } catch (\Throwable $e) {
                Log::warning('WhatsApp notifyOrderPaid failed', ['order_id' => $this->id, 'err' => $e->getMessage()]);
            }
        }

        return $paid;
    }

    /** Frais de service ajoutés au prix pour le client (arrondis à l'unité supérieure). */
    public static function clientFee(float $amount): float
    {
        return ceil($amount * config('payments.client_fee_percent') / 100);
    }

    /** Commission Biolinko selon le plan du vendeur (en %). */
    public static function commissionRateFor(?User $seller): float
    {
        $plan = $seller?->effectivePlan() ?? 'starter';

        return (float) (config('payments.commission_percent.'.$plan) ?? config('payments.commission_percent.starter'));
    }

    /** Ce que le vendeur touche sur la vente, commission déduite. */
    public function sellerNet(): float
    {
        return max(0, (float) $this->price_vendor - (float) $this->commission_amount);
    }

    /** Ventes livrées à partir desquelles un vendeur est considéré comme établi. */
    public const ESTABLISHED_AFTER_DELIVERED = 10;

    public const HOLD_DAYS_NEW = 4;

    public const HOLD_DAYS_ESTABLISHED = 2;

    /** Délai de sécurité avant que l'argent d'une vente soit retirable : 4 jours, puis 2 après 10 ventes livrées. */
    public static function holdDaysFor(int $storeId): int
    {
        $delivered = static::where('store_id', $storeId)->where('status', 'delivered')->count();

        return $delivered >= self::ESTABLISHED_AFTER_DELIVERED ? self::HOLD_DAYS_ESTABLISHED : self::HOLD_DAYS_NEW;
    }

    /**
     * Rend l'argent de la vente retirable (fin du délai ou signalement résolu). Une seule fois, verrouillé.
     */
    public function releaseFunds(): bool
    {
        return DB::transaction(function () {
            $order = static::whereKey($this->id)->lockForUpdate()->first();
            if (! $order || $order->payment_status !== 'paid' || $order->funds_released_at) {
                return false;
            }

            $order->update(['funds_released_at' => now()]);
            $wallet = Wallet::where('store_id', $order->store_id)->lockForUpdate()->first();
            if ($wallet) {
                $amount = $order->sellerNet();
                $wallet->update([
                    'balance_held' => max(0, (float) $wallet->balance_held - $amount),
                    'balance_available' => (float) $wallet->balance_available + $amount,
                ]);
            }

            return true;
        });
    }

    /** Pendant le délai de sécurité, le client peut encore signaler un problème. */
    public function canBeReported(): bool
    {
        return $this->payment_status === 'paid' && ! $this->funds_released_at && ! $this->is_manual
            && $this->funds_release_at && $this->funds_release_at->isFuture();
    }

    public function report(): HasOne
    {
        return $this->hasOne(OrderReport::class);
    }
}
