<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ToolPluginController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store;

        $plugins = [
            [
                'id' => 'hrskills_pay',
                'name' => 'HR-Skills Pay 🇨🇲',
                'category' => 'Paiement Mobile Money',
                'description' => 'Collecte directe Mobile Money MTN & Orange Money au Cameroun avec popup USSD instantané.',
                'status' => 'active',
                'icon' => 'Smartphone',
                'color' => 'amber',
            ],
            [
                'id' => 'whatsapp_bot',
                'name' => 'WhatsApp Relance Bot',
                'category' => 'Marketing & Ventes',
                'description' => 'Envoi automatique de notifications de paniers abandonnés et confirmations de commande par WhatsApp.',
                'status' => $user->hasPlan('pro') ? 'active' : 'locked',
                'required_plan' => 'pro',
                'icon' => 'MessageSquare',
                'color' => 'emerald',
            ],
            [
                'id' => 'pdf_invoices',
                'name' => 'Facturation PDF & QR Code',
                'category' => 'Facturation',
                'description' => 'Factures PDF professionnelles avec QR Code de vérification, à votre marque (sans mention BIOLINKO).',
                'status' => $user->hasPlan('pro') ? 'active' : 'locked',
                'required_plan' => 'pro',
                'icon' => 'FileText',
                'color' => 'indigo',
            ],
            [
                'id' => 'excel_exporter',
                'name' => 'Exportateur Data Excel / CSV',
                'category' => 'Analytics & Finance',
                'description' => 'Export en 1 clic du rapport de ventes (commandes, montants, clients) au format CSV pour votre comptabilité.',
                'status' => $user->hasPlan('business') ? 'active' : 'locked',
                'required_plan' => 'business',
                'icon' => 'Table',
                'color' => 'sky',
            ],
        ];

        return Inertia::render('Seller/Tools/Index', [
            'store' => $store,
            'user' => [
                'plan' => $user->plan,
            ],
            'plugins' => $plugins,
        ]);
    }
}
