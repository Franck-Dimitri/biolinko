<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MarketingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store;

        return Inertia::render('Seller/Marketing/Index', [
            'store' => $store,
            'user' => [
                'plan' => $user->plan,
                'has_marketing' => $user->hasPlan('pro'),
            ],
            'marketing' => [
                'facebook_pixel_id' => $store->facebook_pixel_id ?? '',
                'tiktok_pixel_id' => $store->tiktok_pixel_id ?? '',
                'google_analytics_id' => $store->google_analytics_id ?? '',
                'whatsapp_abandoned_cart' => true,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (!$user->hasPlan('pro')) {
            return redirect()->route('seller.subscriptions.index')->with('warning', 'Le module Marketing & Pixels nécessite au minimum le Plan Pro.');
        }

        $validated = $request->validate([
            'facebook_pixel_id' => ['nullable', 'string', 'max:100'],
            'tiktok_pixel_id' => ['nullable', 'string', 'max:100'],
            'google_analytics_id' => ['nullable', 'string', 'max:100'],
        ]);

        $store = $user->store;
        if ($store) {
            $store->update($validated);
        }

        return redirect()->back()->with('success', 'Paramètres marketing et pixels mis à jour avec succès.');
    }
}
