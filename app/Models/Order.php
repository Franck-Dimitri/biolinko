<?php

namespace App\Models;

use App\Services\Sales\OrderInvoiceService;
use App\Services\Sales\RecurringBaskets;
use App\Services\Whatsapp\WhatsappGatewayService;
use App\Support\PilotOffer;
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
        'parent_order_id',
        'recurring_basket_id',
        'design_template',
        'reminder_sent_at',
        'payment_reminded_at',
        'funds_release_at',
        'funds_released_at',
        'delivered_at',
        'received_confirmed_at',
        'desired_date',
        'desired_slot',
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
        'subtotal',
        'discount_amount',
        'delivery_fee',
        'promo_code_id',
        'promo_code',
        'balance_due',
        'balance_collected_at',
        'refunded_amount',
        'customer_whatsapp',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'payment_reminded_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'funds_release_at' => 'datetime',
        'funds_released_at' => 'datetime',
        'delivered_at' => 'datetime',
        'desired_date' => 'date',
        'received_confirmed_at' => 'datetime',
        'is_manual' => 'boolean',
        'price_vendor' => 'decimal:2',
        'saas_margin' => 'decimal:2',
        'api_fee' => 'decimal:2',
        'total_client' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'delivery_fee' => 'decimal:2',
        'balance_due' => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'balance_collected_at' => 'datetime',
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
                $order->tracking_code = 'BLK-CMD-'.strtoupper(Str::random(10));
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
                // La livraison revient entièrement au vendeur : pas de commission dessus
                'commission_amount' => round(max(0, (float) $order->price_vendor - (float) $order->delivery_fee) * $rate / 100),
            ]);

            if ($order->promo_code_id) {
                PromoCode::whereKey($order->promo_code_id)->increment('used_count');
            }

            // La vente reste bloquée jusqu'à la livraison (voir markDelivered / confirmReceipt), au plus MAX_HOLD_DAYS jours
            $order->update(['funds_release_at' => now()->addDays(static::MAX_HOLD_DAYS)]);
            $wallet = Wallet::where('store_id', $order->store_id)->lockForUpdate()->first()
                ?? Wallet::create(['store_id' => $order->store_id, 'balance_available' => 0, 'balance_pending' => 0]);
            $wallet->increment('balance_held', $order->sellerNet());

            foreach ($order->items as $item) {
                if ($item->product_id) {
                    $q = (int) $item->quantity;
                    // Les produits sur commande n'ont pas de stock
                    Product::whereKey($item->product_id)->where('fulfillment', 'stock')->update(['stock' => DB::raw("CASE WHEN stock > {$q} THEN stock - {$q} ELSE 0 END")]);
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
            // Programme pilote : un palier de ventes payées dans l'app prolonge l'offre d'un mois
            try {
                PilotOffer::recordSale($this);
            } catch (\Throwable $e) {
                report($e);
            }
            // Panier de la semaine : le premier paiement le met en route
            try {
                app(RecurringBaskets::class)->activate($this);
            } catch (\Throwable $e) {
                report($e);
            }
            try {
                app(OrderInvoiceService::class)->sendOrderInvoiceEmails($this);
            } catch (\Throwable $e) {
                Log::warning('Invoice emails failed', ['order_id' => $this->id, 'err' => $e->getMessage()]);
            }
            try {
                app(WhatsappGatewayService::class)->notifyOrderPaid($this);
            } catch (\Throwable $e) {
                Log::warning('WhatsApp notifyOrderPaid failed', ['order_id' => $this->id, 'err' => $e->getMessage()]);
            }
        }

        return $paid;
    }

    /**
     * Ventes réellement encaissées, quel que soit leur avancement (payée, en livraison, livrée).
     * Seule définition à utiliser pour les chiffres d'affaires.
     */
    public function scopePaid($query)
    {
        return $query->where('payment_status', 'paid');
    }

    /** Frais de service ajoutés au prix pour le client (arrondis à l'unité supérieure). */
    /**
     * Part payée en ligne quand le client choisit l'acompte : au moins le minimum de paiement en ligne,
     * jamais plus que la commande. Couvre toujours la commission (acompte ≥ 20 %, commission ≤ 10 %).
     */
    public static function depositFor(float $vendorAmount, int $percent, float $minOnline): float
    {
        return min($vendorAmount, max(ceil($vendorAmount * $percent / 100), $minOnline));
    }

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
        // Avec un acompte, seule la part payée en ligne passe par le portefeuille ; le solde est encaissé par le vendeur
        return max(0, (float) $this->price_vendor - (float) $this->balance_due - (float) $this->refunded_amount - (float) $this->commission_amount);
    }

    /*
     * Protection de l'acheteur : l'argent d'une vente reste bloqué jusqu'à la livraison.
     * - le client confirme la réception → libéré tout de suite ;
     * - le vendeur marque « livrée » → libéré RELEASE_AFTER_DELIVERY_DAYS jours plus tard, sans signalement ;
     * - sinon → libéré au plus tard MAX_HOLD_DAYS jours après le paiement, sans signalement.
     * Un signalement ouvert gèle la vente jusqu'à ce qu'il soit réglé.
     */
    public const RELEASE_AFTER_DELIVERY_DAYS = 3;

    public const MAX_HOLD_DAYS = 14;

    /** Le vendeur marque la commande livrée : le client a quelques jours pour signaler un problème. */
    public function markDelivered(): void
    {
        $changes = ['delivered_at' => $this->delivered_at ?? now()];
        if ($this->payment_status === 'paid' && ! $this->funds_released_at && ! $this->is_manual) {
            $after = now()->addDays(self::RELEASE_AFTER_DELIVERY_DAYS);
            $changes['funds_release_at'] = $this->funds_release_at && $this->funds_release_at->lt($after) ? $this->funds_release_at : $after;
        }
        $this->update($changes);
    }

    /** Retour de « livrée » à « en livraison » : le délai repart sur le plafond après paiement. */
    public function unmarkDelivered(): void
    {
        $changes = ['delivered_at' => null];
        if ($this->payment_status === 'paid' && ! $this->funds_released_at && ! $this->is_manual && $this->paid_at) {
            $changes['funds_release_at'] = $this->paid_at->copy()->addDays(self::MAX_HOLD_DAYS);
        }
        $this->update($changes);
    }

    /** Le client confirme avoir reçu sa commande. */
    public function canConfirmReceipt(): bool
    {
        return $this->payment_status === 'paid' && ! $this->is_manual && ! $this->received_confirmed_at
            && ! in_array($this->status, ['cancelled', 'failed'], true)
            && ! ($this->report && $this->report->isOpen());
    }

    public function confirmReceipt(): bool
    {
        if (! $this->canConfirmReceipt()) {
            return false;
        }
        $this->update([
            'received_confirmed_at' => now(),
            'status' => 'delivered',
            'delivered_at' => $this->delivered_at ?? now(),
        ]);
        $this->releaseFunds();
        $this->syncAddons();

        return true;
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

    /** Jours pendant lesquels une commande non payée peut encore être payée (relance du vendeur). */
    public const RECOVERABLE_DAYS = 7;

    /**
     * Panier récupérable : commande en ligne jamais payée (en attente ou paiement échoué/expiré),
     * récente, et pas annulée par le vendeur.
     */
    public function isRecoverable(): bool
    {
        return ! $this->is_manual && ! $this->paid_at && (float) $this->refunded_amount === 0.0
            && $this->created_at && $this->created_at->gt(now()->subDays(static::RECOVERABLE_DAYS))
            && (($this->status === 'pending' && $this->payment_status === 'pending') || $this->payment_status === 'failed');
    }

    public function scopeRecoverable($query)
    {
        return $query->where(fn ($q) => $q->where('is_manual', false)->orWhereNull('is_manual'))
            ->whereNull('paid_at')->where('refunded_amount', 0)
            ->where('created_at', '>', now()->subDays(static::RECOVERABLE_DAYS))
            ->where(fn ($q) => $q->where(fn ($q) => $q->where('status', 'pending')->where('payment_status', 'pending'))->orWhere('payment_status', 'failed'));
    }

    /** Pendant le délai de sécurité, le client peut encore signaler un problème. */
    public function canBeReported(): bool
    {
        return $this->payment_status === 'paid' && ! $this->funds_released_at && ! $this->is_manual
            && $this->funds_release_at && $this->funds_release_at->isFuture();
    }

    public function recurringBasket(): BelongsTo
    {
        return $this->belongsTo(RecurringBasket::class);
    }

    /** Commande d'origine d'un ajout après paiement. */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'parent_order_id');
    }

    /** Ajouts après paiement, livrés avec cette commande. */
    public function addons(): HasMany
    {
        return $this->hasMany(Order::class, 'parent_order_id');
    }

    public function isAddon(): bool
    {
        return (bool) $this->parent_order_id;
    }

    /**
     * Le client peut encore ajouter un article livré avec la commande : payée en ligne,
     * pas encore partie en livraison, sans signalement, et au plus MAX_ADDONS ajouts payés.
     */
    public const MAX_ADDONS = 3;

    public function canTakeAddons(): bool
    {
        return ! $this->parent_order_id && ! $this->is_manual
            && $this->payment_status === 'paid' && $this->status === 'paid'
            && ! $this->delivered_at && ! $this->received_confirmed_at
            && ! ($this->report && $this->report->isOpen())
            && $this->addons()->where('payment_status', 'paid')->count() < self::MAX_ADDONS;
    }

    /**
     * Les ajouts payés suivent la commande d'origine : même statut de livraison, même délai avant
     * que le vendeur soit payé, et confirmés en même temps qu'elle.
     */
    public function syncAddons(): void
    {
        if ($this->parent_order_id) {
            return;
        }
        $this->addons()->where('payment_status', 'paid')->whereNotIn('status', ['cancelled', 'failed'])->get()
            ->each(function (Order $addon) {
                $wasDelivered = $addon->status === 'delivered';
                if (in_array($this->status, ['paid', 'in_delivery', 'delivered'], true) && $addon->status !== $this->status) {
                    $addon->update(['status' => $this->status]);
                }
                if ($this->status === 'delivered' && ! $addon->delivered_at) {
                    $addon->markDelivered();
                } elseif ($wasDelivered && $this->status !== 'delivered') {
                    $addon->unmarkDelivered();
                }
                if ($this->received_confirmed_at && ! $addon->received_confirmed_at) {
                    $addon->confirmReceipt();
                }
            });
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function report(): HasOne
    {
        return $this->hasOne(OrderReport::class);
    }
}
