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
        $paidQuery = function ($q) {
            $q->where('payment_status', 'paid')
              ->orWhereIn('status', ['paid', 'delivered', 'completed']);
        };

        // 1. Gain Marge Nette d'Application sur les Ventes
        $paidOrdersCollection = Order::where($paidQuery)->get();
        $totalSaasMargin = (float) $paidOrdersCollection->sum('saas_margin');

        // 2. Gain 1% Frais de Retrait Mobile Money (1% prélevé sur les Payouts validés)
        $completedWithdrawalsSum = (float) Withdrawal::where('status', 'completed')->sum('amount');
        $totalWithdrawalFees = $completedWithdrawalsSum * 0.01;

        // 3. Gain Abonnements SaaS (Pro 2.5k, Growth 7k, Business 12k)
        $proRevenue = User::where('plan', 'pro')->count() * 2500;
        $growthRevenue = User::where('plan', 'growth')->count() * 7000;
        $businessRevenue = User::where('plan', 'business')->count() * 12000;
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
        $paidOrders = Order::with('store')->where($paidQuery)->latest()->take(10)->get();
        $completedWithdrawals = Withdrawal::with('wallet.store')->where('status', 'completed')->latest()->take(10)->get();

        return Inertia::render('Admin/Wallet/Index', [
            'metrics' => $metrics,
            'paidOrders' => $paidOrders,
            'completedWithdrawals' => $completedWithdrawals,
        ]);
    }
}
