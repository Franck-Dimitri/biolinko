<?php

namespace App\Models;

use Database\Factories\UserFactory;
use App\Mail\VendorOtpVerificationMail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Single source of truth for monthly plan prices (FCFA).
     */
    public const PLAN_PRICES = [
        'starter' => 0,
        'pro' => 2500,
        'growth' => 7000,
        'business' => 12000,
    ];

    /**
     * Limites de chaque plan : seule source utilisée par le code, la page Abonnement et la landing.
     * null = illimité.
     */
    public const PLAN_LIMITS = [
        'starter' => ['products' => 5, 'stock' => 50, 'images' => 2, 'smartlinks' => 2],
        'pro' => ['products' => 30, 'stock' => 300, 'images' => 5, 'smartlinks' => 10],
        'growth' => ['products' => 100, 'stock' => 1500, 'images' => 8, 'smartlinks' => null],
        'business' => ['products' => null, 'stock' => null, 'images' => 10, 'smartlinks' => null],
    ];

    public function planLimit(string $key): ?int
    {
        return (self::PLAN_LIMITS[$this->effectivePlan()] ?? self::PLAN_LIMITS['starter'])[$key];
    }

    public static function planPrice(string $plan): int
    {
        return self::PLAN_PRICES[strtolower($plan)] ?? 0;
    }

    protected $fillable = [
        'name',
        'email',
        'phone_whatsapp',
        'role',
        'is_banned',
        'plan',
        'subscription_expires_at',
        'email_otp',
        'email_otp_expires_at',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_otp',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
            'email_otp_expires_at' => 'datetime',
            'is_banned' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function store(): HasOne
    {
        return $this->hasOne(Store::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isSeller(): bool
    {
        return in_array($this->role, ['seller', 'vendor'], true) || empty($this->role);
    }

    public function generateEmailOtp(): string
    {
        $otp = (string) random_int(100000, 999999);
        $this->forceFill([
            'email_otp' => $otp,
            'email_otp_expires_at' => now()->addMinutes(15),
        ])->save();

        return $otp;
    }

    /**
     * La vérification passe par un code OTP à 6 chiffres plutôt que par le lien signé de Laravel.
     */
    public function sendEmailVerificationNotification(): void
    {
        $otp = $this->generateEmailOtp();
        try {
            Mail::to($this->email)->send(new VendorOtpVerificationMail($this, $otp));
        } catch (\Throwable $e) {
            Log::warning('Failed to send vendor OTP email', ['user_id' => $this->id, 'err' => $e->getMessage()]);
        }
    }

    public function verifyEmailOtp(string $otp): bool
    {
        if (empty($this->email_otp) || ! hash_equals((string) $this->email_otp, trim($otp))) {
            return false;
        }

        if (! $this->email_otp_expires_at || $this->email_otp_expires_at->isPast()) {
            return false;
        }

        $this->forceFill([
            'email_verified_at' => now(),
            'email_otp' => null,
            'email_otp_expires_at' => null,
        ])->save();

        return true;
    }

    public function isSubscriptionActive(): bool
    {
        if ($this->plan === 'starter' || empty($this->plan)) {
            return true; // Free lifetime starter plan
        }

        return $this->subscription_expires_at && $this->subscription_expires_at->isFuture();
    }

    /**
     * Changement de plan payant avant l'échéance : la valeur des jours restants de l'ancien plan
     * est convertie en jours offerts sur le nouveau (au prix mensuel de chacun). 0 si rien à convertir.
     */
    public function planConversionDays(string $targetPlan): int
    {
        $current = strtolower($this->plan ?? 'starter');
        $target = strtolower($targetPlan);
        $oldPrice = self::planPrice($current);
        $newPrice = self::planPrice($target);

        if ($current === $target || $oldPrice <= 0 || $newPrice <= 0
            || ! $this->subscription_expires_at || ! $this->subscription_expires_at->isFuture()) {
            return 0;
        }

        $remainingDays = now()->diffInSeconds($this->subscription_expires_at) / 86400;

        return (int) floor($remainingDays * $oldPrice / $newPrice);
    }

    /**
     * Plan qui aurait coûté le moins cher au vendeur sur ses 30 derniers jours de ventes
     * (commission + abonnement). null si son plan actuel est déjà le plus avantageux.
     */
    public function upgradeSavings(): ?array
    {
        $store = $this->store;
        if (! $store) {
            return null;
        }

        $sales = (float) Order::where('store_id', $store->id)->where('payment_status', 'paid')
            ->where('paid_at', '>=', now()->subDays(30))->sum('price_vendor');
        if ($sales <= 0) {
            return null;
        }

        $current = $this->effectivePlan();
        $rates = config('payments.commission_percent');
        $cost = fn (string $plan) => $sales * $rates[$plan] / 100 + self::planPrice($plan);
        $currentCost = $sales * $rates[$current] / 100; // l'abonnement en cours est déjà payé

        $best = collect(array_keys($rates))
            ->filter(fn ($p) => self::planPrice($p) > self::planPrice($current))
            ->map(fn ($p) => ['plan' => $p, 'cost' => $cost($p)])
            ->sortBy('cost')->first();

        if (! $best || $best['cost'] >= $currentCost) {
            return null;
        }

        return [
            'plan' => $best['plan'],
            'sales' => round($sales),
            'commission_paid' => round($currentCost),
            'would_pay' => round($best['cost']),
            'saving' => round($currentCost - $best['cost']),
        ];
    }

    public function getDaysRemaining(): int
    {
        if (! $this->subscription_expires_at) {
            return 30;
        }

        if ($this->subscription_expires_at->isPast()) {
            return 0;
        }

        return (int) now()->diffInDays($this->subscription_expires_at);
    }

    public function hasPlan(string $requiredPlan): bool
    {
        $tiers = [
            'starter' => 1,
            'pro' => 2,
            'growth' => 3,
            'business' => 4,
        ];

        $userPlan = strtolower($this->plan ?? 'starter');
        $targetPlan = strtolower($requiredPlan);

        $userRank = $tiers[$userPlan] ?? 1;
        $requiredRank = $tiers[$targetPlan] ?? 1;

        return $userRank >= $requiredRank && $this->isSubscriptionActive();
    }

    /**
     * Plan réellement appliqué : un abonnement payant expiré retombe sur les limites du Starter.
     */
    public function effectivePlan(): string
    {
        return $this->isSubscriptionActive() ? strtolower($this->plan ?? 'starter') : 'starter';
    }

    public function getPlanMaxProducts(): int
    {
        return $this->planLimit('products') ?? 99999;
    }

    public function getPlanMaxStock(): int
    {
        return $this->planLimit('stock') ?? 999999;
    }

    public function getPlanMaxImagesPerProduct(): int
    {
        return $this->planLimit('images') ?? 10;
    }

    public function getPlanMaxStores(): int
    {
        return 1; // Strict Rule: 1 Compte = 1 Vitrine
    }

    public function getPlanMaxTemplates(): int
    {
        return match ($this->effectivePlan()) {
            'pro' => 2,
            'growth' => 5,
            'business' => 10,
            default => 1,
        };
    }

    public function getWhatsappCampaignsQuota(): array
    {
        $plan = $this->effectivePlan();

        return match ($plan) {
            'pro' => ['max_campaigns_per_month' => 4, 'max_recipients_per_campaign' => 25, 'allow_smartlinks' => true, 'max_products' => 10],
            'growth' => ['max_campaigns_per_month' => 10, 'max_recipients_per_campaign' => 40, 'allow_smartlinks' => true, 'max_products' => 20],
            'business' => ['max_campaigns_per_month' => 25, 'max_recipients_per_campaign' => 100, 'allow_smartlinks' => true, 'max_products' => 50],
            default => ['max_campaigns_per_month' => 1, 'max_recipients_per_campaign' => 10, 'allow_smartlinks' => false, 'max_products' => 2],
        };
    }

    public function getUsedWhatsappCampaignsThisMonthCount(): int
    {
        return WhatsappCampaign::where('user_id', $this->id)
            ->whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();
    }
}
