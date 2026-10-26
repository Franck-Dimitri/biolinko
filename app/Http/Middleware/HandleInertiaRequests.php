<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'appUrl' => $request->getSchemeAndHttpHost() ?: config('app.url'),
            'planPrices' => User::PLAN_PRICES,
            'planLimits' => User::PLAN_LIMITS,
            // Frais et commissions (config/payments.php) affichés sur la landing, la caisse et le tableau de bord
            'payments' => [
                'client_fee_percent' => config('payments.client_fee_percent'),
                'withdrawal_fee_percent' => config('payments.withdrawal_fee_percent'),
                'commission_percent' => config('payments.commission_percent'),
                'min_withdrawal' => config('payments.min_withdrawal'),
            ],
            // Messages de confirmation (->with('message', …)) affichés en notification dans le tableau de bord
            'flash' => fn () => [
                'message' => $request->session()->get('message'),
                'success' => $request->session()->get('success'),
                'warning' => $request->session()->get('warning'),
                'error' => $request->session()->get('error'),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
