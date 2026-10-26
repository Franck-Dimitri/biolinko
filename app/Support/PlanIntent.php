<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * Plan payant choisi sur la landing par un visiteur, conservé en session
 * le temps qu'il se connecte ou crée son compte.
 */
class PlanIntent
{
    public const SESSION_KEY = 'intended_plan';

    public const PAID_PLANS = ['pro', 'growth', 'business'];

    public static function remember(Request $request): ?string
    {
        $plan = strtolower((string) $request->query('plan'));

        if (! in_array($plan, self::PAID_PLANS, true)) {
            return null;
        }

        $request->session()->put(self::SESSION_KEY, $plan);

        return $plan;
    }

    public static function pull(Request $request): ?string
    {
        return $request->session()->pull(self::SESSION_KEY);
    }
}
