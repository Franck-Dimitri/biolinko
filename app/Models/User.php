<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone_whatsapp',
        'role',
        'plan',
        'subscription_expires_at',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'subscription_expires_at' => 'datetime',
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

    public function isSubscriptionActive(): bool
    {
        if ($this->plan === 'starter' || empty($this->plan)) {
            return true; // Free lifetime starter plan
        }

        return $this->subscription_expires_at && $this->subscription_expires_at->isFuture();
    }

    public function getDaysRemaining(): int
    {
        if (!$this->subscription_expires_at) {
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

    public function getPlanMaxProducts(): int
    {
        return match (strtolower($this->plan ?? 'starter')) {
            'pro' => 50,
            'growth' => 200,
            'business' => 99999,
            default => 10,
        };
    }

    public function getPlanMaxImagesPerProduct(): int
    {
        return match (strtolower($this->plan ?? 'starter')) {
            'pro', 'growth' => 5,
            'business' => 10,
            default => 2,
        };
    }
}
