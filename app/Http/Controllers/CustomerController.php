<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\SmartLink;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $store = $request->user()->store;

        if (!$store) {
            abort(404, 'Boutique introuvable pour cet utilisateur.');
        }

        // Get all customers linked to this store via store_customer pivot
        $customers = $store->customers()
            ->latest('store_customer.last_order_at')
            ->get();

        $totalCustomers = $customers->count();
        $repeatCustomersCount = $customers->filter(function ($c) {
            return $c->pivot->total_orders_count >= 2;
        })->count();

        // 3rd Card: Total Amount of Completed/Delivered Sales
        $completedSalesRevenue = (float) Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'delivered', 'completed'])
            ->sum('price_vendor');

        // Total Revenue across all customer pivots for Average Order Value
        $totalRevenueFromCustomers = $customers->sum(function ($c) {
            return (float) $c->pivot->total_spent;
        });
        $totalOrdersSum = max(1, $customers->sum('pivot.total_orders_count'));
        $averageOrderValue = $totalCustomers > 0 ? ($totalRevenueFromCustomers / $totalOrdersSum) : 0;

        // Top 5 Loyal Customers
        $top5Customers = $customers->sortByDesc(fn($c) => (float) $c->pivot->total_spent)
            ->take(5)
            ->values();

        // Abandoned Carts / Pending Orders
        $abandonedOrders = Order::with('items')
            ->where('store_id', $store->id)
            ->whereIn('status', ['pending'])
            ->latest()
            ->take(20)
            ->get();

        // Products & SmartLinks for WhatsApp Broadcast Attachment
        $products = Product::where('store_id', $store->id)
            ->get(['id', 'title', 'price_vendor', 'image_url']);

        $smartLinks = SmartLink::where('store_id', $store->id)
            ->where('is_active', true)
            ->get(['id', 'title', 'code', 'total_amount']);

        $whatsappQuota = $request->user()->getWhatsappCampaignsQuota();
        $usedCampaignsThisMonth = $request->user()->getUsedWhatsappCampaignsThisMonthCount();
        $campaignsHistory = \App\Models\WhatsappCampaign::where('store_id', $store->id)
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Customers/Index', [
            'store' => $store,
            'customers' => $customers,
            'top5Customers' => $top5Customers,
            'abandonedOrders' => $abandonedOrders,
            'products' => $products,
            'smartLinks' => $smartLinks,
            'whatsappQuota' => array_merge($whatsappQuota, [
                'used_campaigns_this_month' => $usedCampaignsThisMonth,
                'remaining_campaigns' => max(0, $whatsappQuota['max_campaigns_per_month'] - $usedCampaignsThisMonth),
            ]),
            'campaignsHistory' => $campaignsHistory,
            'metrics' => [
                'totalCustomers' => $totalCustomers,
                'repeatCustomersCount' => $repeatCustomersCount,
                'completedSalesRevenue' => $completedSalesRevenue,
                'averageOrderValue' => (float) $averageOrderValue,
            ],
        ]);
    }

    public function storeCampaign(Request $request)
    {
        $user = $request->user();
        $store = $user->store;

        if (!$store) {
            abort(404, 'Boutique introuvable.');
        }

        $quota = $user->getWhatsappCampaignsQuota();
        $usedThisMonth = $user->getUsedWhatsappCampaignsThisMonthCount();

        if ($usedThisMonth >= $quota['max_campaigns_per_month']) {
            return redirect()->back()->withErrors([
                'campaign' => "Quota mensuel atteint. Votre plan " . ucfirst($user->plan ?? 'Starter') . " autorise max " . $quota['max_campaigns_per_month'] . " campagne(s) 1-clic ce mois-ci."
            ]);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'message_template' => ['required', 'string'],
            'recipients' => ['required', 'array', 'min:1'],
            'attached_products' => ['nullable', 'array'],
            'smart_link_id' => ['nullable', 'integer', 'exists:smart_links,id'],
        ]);

        $recipientsCount = count($validated['recipients']);
        if ($recipientsCount > $quota['max_recipients_per_campaign']) {
            return redirect()->back()->withErrors([
                'recipients' => "Votre plan " . ucfirst($user->plan ?? 'Starter') . " autorise un maximum de " . $quota['max_recipients_per_campaign'] . " clients par campagne."
            ]);
        }

        if (!empty($validated['smart_link_id']) && !$quota['allow_smartlinks']) {
            return redirect()->back()->withErrors([
                'smart_link' => "L'envoi de SmartLinks en campagne est réservé aux plans payants (Pro, Growth, Business)."
            ]);
        }

        $attachedProductsCount = !empty($validated['attached_products']) ? count($validated['attached_products']) : 0;
        if ($attachedProductsCount > $quota['max_products']) {
            return redirect()->back()->withErrors([
                'products' => "Vous ne pouvez joindre que " . $quota['max_products'] . " produit(s) maximum par campagne sur votre plan."
            ]);
        }

        \App\Models\WhatsappCampaign::create([
            'store_id' => $store->id,
            'user_id' => $user->id,
            'title' => $validated['title'],
            'message_template' => $validated['message_template'],
            'recipients_count' => $recipientsCount,
            'sent_count' => $recipientsCount,
            'status' => 'completed',
            'recipients_json' => $validated['recipients'],
            'attached_products_json' => $validated['attached_products'] ?? [],
            'smart_link_id' => $validated['smart_link_id'] ?? null,
            'completed_at' => now(),
        ]);

        return redirect()->back()->with('message', 'Campagne WhatsApp 1-Clic exécutée avec succès !');
    }
}
