<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ToolPluginController extends Controller
{
    /**
     * Catalogue des outils connectables à la boutique, selon le plan et la disponibilité.
     * status : included (inclus, actif) | connected | available (à configurer) | locked (plan insuffisant) | soon
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store;
        $plan = $user->effectivePlan();

        $tool = function (array $t) use ($user) {
            $unlocked = $user->hasPlan($t['plan']);
            if (($t['availability'] ?? 'available') === 'soon') {
                $status = 'soon';
            } elseif (! $unlocked) {
                $status = 'locked';
            } elseif ($t['included'] ?? false) {
                $status = 'included';
            } else {
                $status = ($t['connected'] ?? false) ? 'connected' : 'available';
            }

            return array_merge($t, ['status' => $status]);
        };

        $tools = collect([
            ['id' => 'momo', 'name' => 'Paiement Mobile Money', 'logo' => 'MTN', 'category' => 'Paiement', 'plan' => 'starter', 'included' => true,
                'description' => 'Vos clients paient par MTN MoMo et Orange Money directement sur votre boutique.'],
            ['id' => 'invoices', 'name' => 'Factures automatiques', 'icon' => 'FileText', 'category' => 'Gestion', 'plan' => 'starter', 'included' => true,
                'description' => 'Une facture numérotée est émise pour chaque vente payée et envoyée au client.', 'route' => 'seller.invoices.index'],
            ['id' => 'whatsapp_notifications', 'name' => 'Notifications WhatsApp', 'logo' => 'WHATSAPP', 'category' => 'Communication', 'plan' => 'starter', 'included' => true,
                'description' => 'Confirmation de commande, paiement et livraison envoyées automatiquement à vos clients.'],
            ['id' => 'branded_invoices', 'name' => 'Factures à votre marque', 'icon' => 'BadgeCheck', 'category' => 'Gestion', 'plan' => 'pro', 'included' => true,
                'description' => 'Vos factures sans mention Biolinko, avec uniquement votre identité.'],
            ['id' => 'meta_pixel', 'name' => 'Pixel Meta', 'logo' => 'FACEBOOK', 'category' => 'Publicité', 'plan' => 'pro', 'route' => 'seller.marketing.index',
                'connected' => ! empty($store?->facebook_pixel_id), 'description' => 'Mesurez les ventes issues de vos publicités Facebook et Instagram.'],
            ['id' => 'tiktok_pixel', 'name' => 'Pixel TikTok', 'logo' => 'TIKTOK', 'category' => 'Publicité', 'plan' => 'pro', 'route' => 'seller.marketing.index',
                'connected' => ! empty($store?->tiktok_pixel_id), 'description' => 'Suivez les achats générés par vos campagnes TikTok.'],
            ['id' => 'google_analytics', 'name' => 'Google Analytics', 'icon' => 'BarChart3', 'category' => 'Publicité', 'plan' => 'pro', 'route' => 'seller.marketing.index',
                'connected' => ! empty($store?->google_analytics_id), 'description' => 'Analysez la fréquentation et les parcours sur votre boutique.'],
            ['id' => 'abandoned_cart', 'name' => 'Relance automatique des paniers', 'icon' => 'Repeat', 'category' => 'Ventes', 'plan' => 'growth', 'included' => true,
                'description' => 'Une heure après une commande non payée, le client reçoit un rappel WhatsApp avec un lien pour payer en un clic.'],
            ['id' => 'accounting_export', 'name' => 'Export comptable', 'icon' => 'Table', 'category' => 'Gestion', 'plan' => 'business', 'route' => 'orders.index', 'included' => true,
                'description' => 'Exportez vos ventes en CSV ou Excel pour votre comptabilité.'],
            ['id' => 'custom_domain', 'name' => 'Nom de domaine', 'icon' => 'Globe', 'category' => 'Boutique', 'plan' => 'business', 'availability' => 'soon',
                'description' => 'Votre boutique sur votre propre adresse, par exemple maboutique.cm.'],
            ['id' => 'cards', 'name' => 'Carte bancaire', 'logo' => 'VISA', 'category' => 'Paiement', 'plan' => 'pro', 'availability' => 'soon',
                'description' => 'Acceptez Visa et Mastercard en plus du Mobile Money.'],
            ['id' => 'delivery', 'name' => 'Partenaires de livraison', 'icon' => 'Truck', 'category' => 'Logistique', 'plan' => 'pro', 'availability' => 'soon',
                'description' => 'Confiez vos livraisons à un coursier partenaire en un clic.'],
            ['id' => 'meta_catalog', 'name' => 'Catalogue Facebook et Instagram', 'logo' => 'INSTAGRAM', 'category' => 'Ventes', 'plan' => 'growth', 'availability' => 'soon',
                'description' => 'Synchronisez vos produits pour les identifier dans vos publications.'],
        ])->map($tool)->values();

        return Inertia::render('Seller/Tools/Index', [
            'store' => $store,
            'plan' => $plan,
            'tools' => $tools,
        ]);
    }
}
