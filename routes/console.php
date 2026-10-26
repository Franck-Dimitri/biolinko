<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Nécessite la tâche cron du serveur : * * * * * php artisan schedule:run
\Illuminate\Support\Facades\Schedule::command('orders:expire-unpaid')->hourly();
\Illuminate\Support\Facades\Schedule::command('orders:remind-unpaid')->everyFifteenMinutes()->withoutOverlapping();
\Illuminate\Support\Facades\Schedule::command('funds:release')->everyFifteenMinutes()->withoutOverlapping();
\Illuminate\Support\Facades\Schedule::command('payments:sync')->everyFiveMinutes()->withoutOverlapping();
