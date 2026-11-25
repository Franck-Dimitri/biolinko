<?php

namespace App\Providers;

use App\Models\User;
use App\Support\ManagedAccount;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Boutique gérée par l'équipe : un vendeur qui choisit son mot de passe par « Mot de passe oublié » prend la main
        Event::listen(PasswordReset::class, function ($event) {
            if ($event->user instanceof User && $event->user->isManaged()) {
                ManagedAccount::markClaimed($event->user);
            }
        });
    }
}
