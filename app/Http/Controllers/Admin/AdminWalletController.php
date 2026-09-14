<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Withdrawal;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminWalletController extends Controller
{
    public function index(Request $request): Response
    {
        // 1. Gain 3% Marge sur les Ventes
        $totalSaasMargin = (float) Order::where('status', 'paid')->sum('saas_margin');

        // 2. Gain 1,5% Frais de Retrait Mobile Money (1,5% prélevé sur les Payouts validés)
        $completedWithdrawalsSum = (float) Withdrawal::where('status', 'completed')->sum('amount');
        $totalWithdrawalFees = $completedWithdrawalsSum * 0.015;

        // 3. Gain Abonnements SaaS (Pro: 4 350, Growth: 8 250, Business: 14 700 FCFA/mois)
        $proRevenue = User::where('plan', 'pro')->count() * 4350;
        $growthRevenue = User::where('plan', 'growth')->count() * 8250;
        $businessRevenue = User::where('plan', 'business')->count() * 14700;
        $totalSubscriptionRevenue = (float) ($proRevenue + $growthRevenue + $businessRevenue);

        // 4. SOLDE TOTAL CUMULÉ DU PORTEFEUILLE ADMIN
        $totalPlatformWalletBalance = $totalSaasMargin + $totalWithdrawalFees + $totalSubscriptionRevenue;

        // Metrics breakdown in 4 Cards
        $metrics = [
            'total_wallet_balance' => $totalPlatformWalletBalance,
            'total_saas_margin' => $totalSaasMargin,
            'total_withdrawal_fees' => $totalWithdrawalFees,
            'total_subscription_revenue' => $totalSubscriptionRevenue,
        ];

        // Revenue Breakdown History List
        $paidOrders = Order::with('store')->where('status', 'paid')->latest()->take(10)->get();
        $completedWithdrawals = Withdrawal::with('wallet.store')->where('status', 'completed')->latest()->take(10)->get();

        return Inertia::render('Admin/Wallet/Index', [
            'metrics' => $metrics,
            'paidOrders' => $paidOrders,
            'completedWithdrawals' => $completedWithdrawals,
        ]);
    }
}
