<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Services\HrSkillsPayService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminWithdrawalController extends Controller
{
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status', 'all');
        $search = trim($request->query('search', ''));

        $query = Withdrawal::with('wallet.store.user');

        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('phone_number', 'like', "%{$search}%")
                  ->orWhere('hrskills_reference', 'like', "%{$search}%")
                  ->orWhereHas('wallet.store', function ($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $withdrawals = $query->latest()->paginate(15)->withQueryString();

        $metrics = [
            'total' => Withdrawal::count(),
            'pending' => Withdrawal::where('status', 'pending')->count(),
            'completed' => Withdrawal::where('status', 'completed')->count(),
            'rejected' => Withdrawal::where('status', 'rejected')->count(),
            'total_amount_paid' => (float) Withdrawal::where('status', 'completed')->sum('amount'),
            'total_amount_pending' => (float) Withdrawal::where('status', 'pending')->sum('amount'),
        ];

        return Inertia::render('Admin/Withdrawals/Index', [
            'withdrawals' => $withdrawals,
            'metrics' => $metrics,
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
            ],
        ]);
    }

    public function approve(Request $request, Withdrawal $withdrawal, HrSkillsPayService $hrSkillsPay): RedirectResponse
    {
        if ($withdrawal->status !== 'pending') {
            return redirect()->back()->withErrors(['withdrawal' => 'Ce retrait a déjà été traité.']);
        }

        try {
            $payoutResult = $hrSkillsPay->initiatePayout(
                $withdrawal->phone_number,
                (float) $withdrawal->amount,
                $withdrawal->operator ?? 'ORANGE',
                "Virement Portefeuille BIOLINKO #" . $withdrawal->id
            );

            if ($payoutResult['success'] ?? false) {
                $withdrawal->update([
                    'status' => 'completed',
                    'hrskills_reference' => $payoutResult['reference'] ?? null,
                    'processed_at' => now(),
                ]);

                return redirect()->back()->with('message', 'Retrait approuvé et virement Mobile Money déclenché avec succès !');
            }

            $withdrawal->update([
                'status' => 'completed',
                'processed_at' => now(),
            ]);

            return redirect()->back()->with('message', 'Retrait marqué comme payé avec succès.');
        } catch (\Exception $e) {
            Log::error('Admin withdrawal approval error', ['error' => $e->getMessage()]);

            $withdrawal->update([
                'status' => 'completed',
                'processed_at' => now(),
            ]);

            return redirect()->back()->with('message', 'Retrait approuvé et marqué comme traité.');
        }
    }

    public function reject(Request $request, Withdrawal $withdrawal): RedirectResponse
    {
        if ($withdrawal->status !== 'pending') {
            return redirect()->back()->withErrors(['withdrawal' => 'Ce retrait a déjà été traité.']);
        }

        $wallet = $withdrawal->wallet;
        if ($wallet) {
            $wallet->increment('balance_available', (float) $withdrawal->amount);
        }

        $withdrawal->update([
            'status' => 'rejected',
            'processed_at' => now(),
        ]);

        return redirect()->back()->with('message', 'Retrait rejeté et montant récrédité sur le solde du vendeur.');
    }
}
