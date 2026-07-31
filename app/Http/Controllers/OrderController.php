<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Services\HrSkillsPayService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    protected HrSkillsPayService $hrSkillsPay;

    public function __construct(HrSkillsPayService $hrSkillsPay)
    {
        $this->hrSkillsPay = $hrSkillsPay;
    }

    public function index(Request $request): Response
    {
        $store = $request->user()->store;

        if (!$store) {
            abort(404, 'Boutique introuvable pour cet utilisateur.');
        }

        // Get or create wallet
        $wallet = $store->wallet ?: Wallet::create([
            'store_id' => $store->id,
            'balance_available' => 0,
            'balance_pending' => 0,
        ]);

        $statusFilter = $request->query('status', 'all');

        $ordersQuery = Order::with(['items'])->where('store_id', $store->id);

        if ($statusFilter !== 'all') {
            $ordersQuery->where('status', $statusFilter);
        }

        $orders = $ordersQuery->latest()->get();

        // Financial Metrics
        $totalRevenue = Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'in_delivery', 'delivered'])
            ->sum('price_vendor');

        $paidOrdersCount = Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'in_delivery', 'delivered'])
            ->count();

        $deliveredOrdersCount = Order::where('store_id', $store->id)
            ->where('status', 'delivered')
            ->count();

        $withdrawals = Withdrawal::where('wallet_id', $wallet->id)
            ->latest()
            ->get();

        return Inertia::render('Orders/Index', [
            'store' => $store,
            'orders' => $orders,
            'wallet' => $wallet,
            'withdrawals' => $withdrawals,
            'metrics' => [
                'totalRevenue' => (float) $totalRevenue,
                'totalOrdersCount' => Order::where('store_id', $store->id)->count(),
                'paidOrdersCount' => $paidOrdersCount,
                'deliveredOrdersCount' => $deliveredOrdersCount,
            ],
            'filters' => [
                'status' => $statusFilter,
            ],
            'appUrl' => config('app.url', 'http://localhost:8000'),
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

        $order->update([
            'status' => $validated['status'],
        ]);

        return back()->with('message', 'Statut de la commande mis à jour avec succès.');
    }

    public function requestWithdrawal(Request $request): RedirectResponse
    {
        $store = $request->user()->store;
        $wallet = $store->wallet;

        if (!$wallet) {
            return back()->withErrors(['amount' => 'Portefeuille introuvable.']);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1000'],
            'phone_momo' => ['required', 'string', 'max:50'],
            'operator' => ['nullable', 'string', 'in:MTN,ORANGE,mtn,orange'],
        ]);

        // Strictly validate Cameroon phone number
        try {
            $formattedPhone = $this->hrSkillsPay->formatCameroonPhone($validated['phone_momo']);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['phone_momo' => $e->getMessage()]);
        }

        $amount = (float) $validated['amount'];

        if ($amount > (float) $wallet->balance_available) {
            return back()->withErrors(['amount' => 'Solde disponible insuffisant pour ce retrait.']);
        }

        $operatorChoice = $validated['operator'] ?? $this->hrSkillsPay->detectOperator($formattedPhone);

        $withdrawal = Withdrawal::create([
            'wallet_id' => $wallet->id,
            'amount' => $amount,
            'operator' => $operatorChoice,
            'phone_number' => $formattedPhone,
            'payment_operator' => $operatorChoice,
            'status' => 'pending',
        ]);

        $wallet->decrement('balance_available', $amount);

        // Initiate Cash-Out via HR-Skills Pay
        try {
            $payoutData = $this->hrSkillsPay->initiatePayout($withdrawal, $formattedPhone, $operatorChoice);

            $withdrawal->update([
                'hrskills_reference' => $payoutData['reference'],
                'hrskills_transaction_id' => $payoutData['transaction_id'],
            ]);

            return back()->with('message', 'Demande de virement Mobile Money de ' . number_format($amount) . ' FCFA soumise vers ' . $formattedPhone . ' (' . $operatorChoice . ').');
        } catch (\Exception $e) {
            Log::error('Withdrawal HR-Skills Payout Error', ['withdrawal_id' => $withdrawal->id, 'err' => $e->getMessage()]);

            // Restore vendor wallet balance on error
            $wallet->increment('balance_available', $amount);
            $withdrawal->update(['status' => 'rejected']);

            return back()->withErrors(['phone_momo' => 'Échec de l\'envoi du virement Mobile Money : ' . $e->getMessage()]);
        }
    }
}
