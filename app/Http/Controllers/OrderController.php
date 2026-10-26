<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Services\WhatsappGatewayService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{

    public function index(Request $request): Response
    {
        $store = $request->user()->store;

        if (! $store) {
            abort(404, 'Boutique introuvable pour cet utilisateur.');
        }

        // Get or create wallet
        $wallet = $store->wallet ?: Wallet::create([
            'store_id' => $store->id,
            'balance_available' => 0,
            'balance_pending' => 0,
        ]);

        $statusFilter = $request->query('status', 'all');
        $search = trim((string) $request->query('search', ''));

        $ordersQuery = Order::with(['items', 'report'])->where('store_id', $store->id);

        // Onglets de la vue : groupes de statuts
        $groups = [
            'to_deliver' => ['paid', 'in_delivery'],
            'delivered' => ['delivered'],
            'pending' => ['pending'],
            'cancelled' => ['cancelled', 'failed'],
        ];
        if (isset($groups[$statusFilter])) {
            $ordersQuery->whereIn('status', $groups[$statusFilter]);
        }

        if ($search !== '') {
            $ordersQuery->where(function ($q) use ($search) {
                $q->where('tracking_code', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        $orders = $ordersQuery->latest()->paginate(10)->withQueryString();

        // Metrics Counts
        $totalOrdersCount = Order::where('store_id', $store->id)->count();
        $abandonedOrdersCount = Order::where('store_id', $store->id)
            ->whereIn('status', ['pending', 'failed', 'cancelled'])
            ->count();

        $toDeliverOrdersCount = Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'in_delivery'])
            ->count();

        $deliveredOrdersCount = Order::where('store_id', $store->id)
            ->where('status', 'delivered')
            ->count();

        $totalRevenue = Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'in_delivery', 'delivered'])
            ->sum('price_vendor');

        return Inertia::render('Orders/Index', [
            'store' => $store,
            'orders' => $orders,
            'metrics' => [
                'totalOrdersCount' => $totalOrdersCount,
                'abandonedOrdersCount' => $abandonedOrdersCount,
                'toDeliverOrdersCount' => $toDeliverOrdersCount,
                'deliveredOrdersCount' => $deliveredOrdersCount,
                'totalRevenue' => (float) $totalRevenue,
            ],
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
            ],
            'canExportSales' => $request->user()->hasPlan('business'),
            'appUrl' => request()->getSchemeAndHttpHost() ?: config('app.url', 'http://localhost:8000'),
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $store = $request->user()->store;

        if ($order->store_id !== $store->id) {
            abort(403, 'Action non autorisée sur cette commande.');
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,paid,in_delivery,delivered,cancelled'],
        ]);

        // Enchaînement autorisé. Une commande en ligne ne devient « payée » que par la confirmation
        // de l'opérateur (sinon le solde ne serait pas crédité) : seules les factures manuelles se marquent payées à la main.
        $allowed = [
            'pending' => $order->is_manual ? ['paid', 'cancelled'] : ['cancelled'],
            'paid' => ['in_delivery', 'delivered'],
            'in_delivery' => ['delivered', 'paid'],
            'delivered' => ['in_delivery'],
            'cancelled' => [],
            'failed' => [],
        ];

        if (! in_array($validated['status'], $allowed[$order->status] ?? [], true)) {
            return back()->withErrors(['status' => 'Ce changement de statut n’est pas possible pour cette commande.']);
        }

        $order->update([
            'status' => $validated['status'],
        ]);

        // Send real-time WhatsApp shipping / delivery notification to customer
        try {
            app(WhatsappGatewayService::class)->notifyOrderShippingUpdate($order, $validated['status']);
        } catch (\Exception $e) {
            Log::warning('WhatsApp notifyOrderShippingUpdate failed', ['order_id' => $order->id, 'err' => $e->getMessage()]);
        }

        return back()->with('message', 'Statut de la commande mis à jour et notification WhatsApp envoyée !');

    }

    /** Réponse du vendeur à un signalement : sans réaction du client sous 3 jours, la vente est libérée. */
    public function respondToReport(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->store_id === $request->user()->store?->id, 403);

        $validated = $request->validate(['response' => ['required', 'string', 'min:5', 'max:1000']]);
        $report = $order->report;

        if (! $report || ! $report->isOpen()) {
            return back()->withErrors(['response' => 'Ce signalement est déjà clos.']);
        }

        $report->update(['status' => 'answered', 'seller_response' => $validated['response'], 'seller_responded_at' => now()]);

        return back()->with('success', 'Réponse envoyée. Sans réaction du client sous '.\App\Models\OrderReport::CUSTOMER_REPLY_DAYS.' jours, la vente sera libérée.');
    }
}
