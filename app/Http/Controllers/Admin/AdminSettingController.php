<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingController extends Controller
{
    public function index(Request $request): Response
    {
        $settings = [
            'platform_fee_percent' => 2.0,
            'momo_currency' => 'XAF',
            'momo_country' => 'CM',
            'whatsapp_gateway_url' => config('services.whatsapp_gateway.base_url', 'http://127.0.0.1:8080'),
            'hrskills_pay_url' => config('services.hrskills_pay.base_url', 'https://api.hrskills-pay.com'),
            'support_email' => 'support@biolinko.app',
            'system_status' => 'operational',
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform_fee_percent' => ['required', 'numeric', 'min:0', 'max:50'],
            'support_email' => ['required', 'email'],
        ]);

        return redirect()->back()->with('message', 'Paramètres de la plateforme mis à jour avec succès !');
    }
}
