<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\WhatsappGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingController extends Controller
{
    public function index(Request $request, WhatsappGatewayService $gateway): Response
    {
        $whatsappStatus = $gateway->getInstanceStatus();

        $settings = [
            'platform_fee_percent' => 2.0,
            'momo_currency' => 'XAF',
            'momo_country' => 'CM',
            'whatsapp_gateway_url' => config('services.whatsapp_gateway.base_url', 'https://evolutionapi.mrdims.dev'),
            'whatsapp_default_instance' => config('services.whatsapp_gateway.default_instance', 'test_dims'),
            'hrskills_pay_url' => config('services.hrskills_pay.base_url', 'https://api.hrskills-pay.com'),
            'support_email' => 'support@biolinko.app',
            'system_status' => 'operational',
            'whatsapp_bot' => [
                'instance' => $whatsappStatus['instance'] ?? 'test_dims',
                'state' => $whatsappStatus['state'] ?? 'close',
            ],
            'anti_ban_shield' => [
                'human_presence' => true,
                'polymorphic_templates' => true,
                'anti_burst_jitter' => true,
                'two_way_trust' => true,
                'contextual_branding' => true,
            ],
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

    /**
     * Get live status of Biolinko WhatsApp Bot.
     */
    public function getWhatsappStatus(WhatsappGatewayService $gateway): JsonResponse
    {
        return response()->json($gateway->getInstanceStatus());
    }

    /**
     * Connect or retrieve QR code / pairing code for Biolinko WhatsApp Bot.
     */
    public function connectWhatsapp(Request $request, WhatsappGatewayService $gateway): JsonResponse
    {
        $phoneNumber = $request->input('phone');
        return response()->json($gateway->connectInstance(null, $phoneNumber));
    }

    /**
     * Disconnect Biolinko WhatsApp Bot.
     */
    public function disconnectWhatsapp(WhatsappGatewayService $gateway): JsonResponse
    {
        return response()->json($gateway->disconnectInstance());
    }

    /**
     * Test sending a message from Biolinko WhatsApp Bot.
     */
    public function testWhatsappMessage(Request $request, WhatsappGatewayService $gateway): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
            'message' => ['nullable', 'string'],
        ]);

        $phone = $request->input('phone');
        $customText = $request->input('message');
        
        $msg = $customText ?: "🚀 *Test Biolinko Bot Réussi !*\n\nLe Bot officiel Biolinko est 100% opérationnel et prêt à distribuer les notifications.";

        $res = $gateway->sendMessage($phone, $msg);

        return response()->json($res);
    }
}
