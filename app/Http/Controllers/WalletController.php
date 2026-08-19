<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store) {
            abort(404, 'Boutique introuvable.');
        }

        $wallet = Wallet::firstOrCreate(
            ['store_id' => $store->id],
            ['balance_available' => 0, 'balance_pending' => 0]
        );

        $withdrawals = Withdrawal::where('wallet_id', $wallet->id)
            ->latest()
            ->get();

        $completedOrders = Order::where('store_id', $store->id)
            ->whereIn('status', ['paid', 'PAID', 'in_delivery', 'delivered'])
            ->get();

        $lifetimeEarnings = (float) $completedOrders->sum('price_vendor');

        return Inertia::render('Seller/Wallet/Index', [
            'store' => $store,
            'wallet' => $wallet,
            'withdrawals' => $withdrawals,
            'metrics' => [
                'available_balance' => (float) $wallet->balance_available,
                'pending_balance' => (float) $wallet->balance_pending,
                'lifetime_earnings' => $lifetimeEarnings,
                'total_withdrawals' => (float) $withdrawals->filter(fn($w) => in_array(strtoupper($w->status), ['APPROVED', 'COMPLETED', 'VALIDE', 'PAYE']))->sum('amount'),
                'min_withdrawal' => 50100,
            ],
            'appUrl' => config('app.url', 'http://localhost:8000'),
        ]);
    }

    public function requestWithdrawal(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store) {
            abort(403);
        }

        $wallet = Wallet::firstOrCreate(
            ['store_id' => $store->id],
            ['balance_available' => 0, 'balance_pending' => 0]
        );

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:50100'],
            'payment_operator' => ['required', 'string', 'in:MTN,ORANGE,mtn,orange'],
            'phone' => ['required', 'string', 'max:50'],
        ]);

        $requestedAmount = (float) $validated['amount'];

        if ((float) $wallet->balance_available < $requestedAmount) {
            return redirect()->back()->withErrors([
                'amount' => "Solde insuffisant. Votre solde disponible est de " . number_format($wallet->balance_available, 0, ',', ' ') . " FCFA.",
            ]);
        }

        // Fee calculations: 1% BIOLINKO App Fee + 1% Mobile Money Cashout Fee (Total 2%)
        $appFee = round($requestedAmount * 0.01);
        $momoFee = round($requestedAmount * 0.01);
        $netPayout = $requestedAmount - ($appFee + $momoFee);

        // Deduct from available balance
        $wallet->balance_available -= $requestedAmount;
        $wallet->balance_pending += $requestedAmount;
        $wallet->save();

        Withdrawal::create([
            'wallet_id' => $wallet->id,
            'amount' => $requestedAmount,
            'phone_number' => $validated['phone'],
            'operator' => strtoupper($validated['payment_operator']),
            'status' => 'PENDING',
        ]);

        return redirect()->back()->with('message', 'Demande de retrait initiée avec succès ! Traitement sous 4h-24h.');
    }
}
