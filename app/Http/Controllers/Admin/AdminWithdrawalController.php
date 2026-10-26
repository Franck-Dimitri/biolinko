<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Payments\Countries;
use App\Payments\PaymentManager;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminWithdrawalController extends Controller
{
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status', 'all');
        $search = trim($request->query('search', ''));

        $query = Withdrawal::with(['wallet.store.user', 'wallet.store' => fn ($q) => $q->withCount('reports')]);

        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('phone_number', 'like', "%{$search}%")
                  ->orWhere('payment_reference', 'like', "%{$search}%")
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

    /**
     * Valide un retrait : virement Mobile Money via la passerelle, ou confirmation d'un paiement déjà fait à la main.
     * En cas d'échec du virement, le retrait reste en attente (jamais marqué payé sans argent envoyé).
     */
    public function approve(Request $request, Withdrawal $withdrawal, PaymentManager $payments): RedirectResponse
    {
        if ($withdrawal->status !== 'pending') {
            return redirect()->back()->withErrors(['withdrawal' => 'Ce retrait a déjà été traité.']);
        }

        // Paiement fait à la main hors plateforme : on enregistre seulement la validation
        if ($request->boolean('manual')) {
            DB::transaction(function () use ($withdrawal) {
                $withdrawal->update(['status' => 'completed', 'processed_at' => now()]);
                $withdrawal->wallet?->decrement('balance_pending', (float) $withdrawal->amount);
            });

            return redirect()->back()->with('message', 'Retrait marqué comme payé.');
        }

        // Virement Mobile Money du montant net (frais de retrait déduits). Il reste « en cours »
        // jusqu'à la confirmation de l'agrégateur (notification ou contrôle planifié).
        $gateway = $payments->payoutDriver();
        $reference = $withdrawal->payment_reference ?: (string) Str::uuid();
        $withdrawal->update(['payment_provider' => $gateway->name(), 'payment_reference' => $reference, 'status' => 'processing']);

        try {
            $country = $withdrawal->wallet?->store?->country ?: 'CM';
            $result = $gateway->payout([
                'reference' => $reference,
                'amount' => (int) ($withdrawal->net_amount ?? $withdrawal->amount),
                'currency' => $withdrawal->wallet?->store?->currency ?: 'XAF',
                'country' => $country,
                'phone' => Countries::formatPhone($country, $withdrawal->phone_number),
                'operator' => $withdrawal->operator,
                'description' => 'Retrait Biolinko',
                'client_reference' => 'RETRAIT-'.$withdrawal->id,
                'metadata' => ['withdrawal' => (string) $withdrawal->id],
            ]);
            if ($result['reference'] !== $reference) {
                $withdrawal->update(['payment_reference' => $result['reference']]);
            }
        } catch (\Throwable $e) {
            Log::error('Admin withdrawal payout failed', ['withdrawal_id' => $withdrawal->id, 'error' => $e->getMessage()]);
            $withdrawal->update(['status' => 'pending']);

            return redirect()->back()->withErrors(['withdrawal' => 'Le virement Mobile Money a échoué : '.$e->getMessage().' Le retrait reste en attente.']);
        }

        return redirect()->back()->with('message', 'Virement envoyé. Il sera marqué payé dès la confirmation de l’opérateur.');
    }

    public function reject(Request $request, Withdrawal $withdrawal): RedirectResponse
    {
        if ($withdrawal->status !== 'pending') {
            return redirect()->back()->withErrors(['withdrawal' => 'Ce retrait a déjà été traité.']);
        }

        DB::transaction(function () use ($withdrawal) {
            if ($wallet = $withdrawal->wallet) {
                $wallet->decrement('balance_pending', (float) $withdrawal->amount);
                $wallet->increment('balance_available', (float) $withdrawal->amount);
            }
            $withdrawal->update(['status' => 'rejected', 'processed_at' => now()]);
        });

        return redirect()->back()->with('message', 'Retrait rejeté : le montant est revenu sur le solde du vendeur.');
    }
}
