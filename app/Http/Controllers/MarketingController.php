<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\SmartLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MarketingController extends Controller
{
    /**
     * Espace de pilotage : indicateurs des 30 derniers jours et actions de croissance.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store;
        abort_unless($store, 404);

        $since = now()->subDays(30);
        $before = now()->subDays(60);
        $paidStatuses = ['paid', 'in_delivery', 'delivered'];

        $orders = Order::where('store_id', $store->id)->where('is_manual', false)->where('created_at', '>=', $before)->get();
        $current = $orders->where('created_at', '>=', $since);
        $previous = $orders->where('created_at', '<', $since);

        $revenue = (float) $current->whereIn('status', $paidStatuses)->sum('price_vendor');
        $previousRevenue = (float) $previous->whereIn('status', $paidStatuses)->sum('price_vendor');
        $paidCount = $current->whereIn('status', $paidStatuses)->count();
        $pending = $current->where('status', 'pending');

        $topProducts = OrderItem::select('product_title', DB::raw('SUM(quantity) as qty'), DB::raw('SUM(total_price_vendor) as revenue'))
            ->whereHas('order', fn ($q) => $q->where('store_id', $store->id)->whereIn('status', $paidStatuses)->where('created_at', '>=', $since))
            ->groupBy('product_title')->orderByDesc('revenue')->limit(5)->get();

        $customers = $store->customers()->get();
        $smartLinks = SmartLink::where('store_id', $store->id)->get();
        $quota = $user->getWhatsappCampaignsQuota();

        return Inertia::render('Seller/Marketing/Index', [
            'store' => $store,
            'user' => [
                'plan' => $user->effectivePlan(),
                'has_marketing' => $user->hasPlan('pro'),
            ],
            'stats' => [
                'revenue' => $revenue,
                'revenue_trend' => $previousRevenue > 0 ? round((($revenue - $previousRevenue) / $previousRevenue) * 100) : null,
                'orders' => $current->count(),
                'paid_orders' => $paidCount,
                'conversion' => $current->count() ? round(($paidCount / $current->count()) * 100) : 0,
                'average_basket' => $paidCount ? round($revenue / $paidCount) : 0,
                'abandoned_count' => $pending->count(),
                'abandoned_value' => (float) $pending->sum('price_vendor'),
                'customers' => $customers->count(),
                'repeat_customers' => $customers->filter(fn ($c) => $c->pivot->total_orders_count >= 2)->count(),
                'active_promos' => Product::where('store_id', $store->id)->where('is_promo', true)->count(),
                'products' => Product::where('store_id', $store->id)->count(),
                'active_packs' => $smartLinks->where('is_active', true)->count(),
                'pack_views' => (int) $smartLinks->sum('views_count'),
                'pack_sales' => (int) $smartLinks->sum('sales_count'),
                'campaigns_used' => $user->getUsedWhatsappCampaignsThisMonthCount(),
                'campaigns_quota' => $quota['max_campaigns_per_month'],
            ],
            'topProducts' => $topProducts,
            'marketing' => [
                'facebook_pixel_id' => $store->facebook_pixel_id ?? '',
                'tiktok_pixel_id' => $store->tiktok_pixel_id ?? '',
                'google_analytics_id' => $store->google_analytics_id ?? '',
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
            'facebook_pixel_id' => ['nullable', 'regex:/^\d{6,20}$/'],
            'tiktok_pixel_id' => ['nullable', 'regex:/^[A-Za-z0-9]{8,30}$/'],
            'google_analytics_id' => ['nullable', 'regex:/^(G|AW)-[A-Za-z0-9]{4,20}$/i'],
        ], [
            'facebook_pixel_id.regex' => 'L’identifiant du pixel Meta ne contient que des chiffres (ex. 123456789012345).',
            'tiktok_pixel_id.regex' => 'L’identifiant du pixel TikTok ne contient que des lettres et des chiffres (ex. C4ABCD123EFG).',
            'google_analytics_id.regex' => 'L’identifiant Google commence par G- (ex. G-AB12CD34EF).',
        ]);

        $store = $user->store;
        if ($store) {
            $store->update($validated);
        }

        return redirect()->back()->with('success', 'Paramètres marketing et pixels mis à jour avec succès.');
    }
}
