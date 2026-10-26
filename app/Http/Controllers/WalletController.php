<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Payments\Countries;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public const MIN_WITHDRAWAL = 1000;

    /**
     * Pôle financier : solde, mouvements (ventes créditées et retraits), revenus par mois.
     */
    public function index(Request $request): Response
    {
        $store = Auth::user()->store;
        abort_unless($store, 404, 'Boutique introuvable.');

        $wallet = Wallet::firstOrCreate(['store_id' => $store->id], ['balance_available' => 0, 'balance_pending' => 0]);
        $withdrawals = Withdrawal::where('wallet_id', $wallet->id)->latest()->get();

        $paidOrders = Order::where('store_id', $store->id)
            ->where('is_manual', false)
            ->whereIn('status', ['paid', 'in_delivery', 'delivered'])
            ->with('report:id,order_id,status')
            ->get(['id', 'tracking_code', 'customer_name', 'price_vendor', 'commission_amount', 'commission_rate', 'paid_at', 'created_at', 'payment_operator', 'funds_release_at', 'funds_released_at']);

        // Ventes payées pas encore retirables (délai de sécurité ou signalement en cours)
        $held = $paidOrders->whereNull('funds_released_at')->sortBy('funds_release_at')->values()->map(fn ($o) => [
            'id' => $o->id,
            'tracking_code' => $o->tracking_code,
            'customer_name' => $o->customer_name,
            'amount' => $o->sellerNet(),
            'available_at' => $o->funds_release_at?->toIso8601String(),
            'frozen' => $o->report && in_array($o->report->status, ['open', 'answered'], true),
        ]);

        // Relevé : chaque vente en ligne crédite le solde, chaque retrait le débite
        $ledger = collect()
            ->merge($paidOrders->map(fn ($o) => [
                'id' => 'o'.$o->id,
                'type' => 'sale',
                'label' => 'Vente '.$o->tracking_code,
                'detail' => $o->customer_name.((float) $o->commission_amount > 0 ? ' · commission '.rtrim(rtrim(number_format((float) $o->commission_rate, 2, ',', ''), '0'), ',').' % déduite' : ''),
                'amount' => $o->sellerNet(),
                'status' => $o->funds_released_at ? 'completed' : 'held',
                'date' => ($o->paid_at ?? $o->created_at)->toIso8601String(),
            ]))
            ->merge($withdrawals->map(fn ($w) => [
                'id' => 'w'.$w->id,
                'type' => 'withdrawal',
                'label' => 'Retrait vers '.($w->operator === 'ORANGE' ? 'Orange Money' : 'MTN MoMo'),
                'detail' => $w->phone_number.((float) $w->fee > 0 ? ' · frais '.number_format((float) $w->fee, 0, ',', ' ').' FCFA' : ''),
                'amount' => -1 * (float) $w->amount,
                'status' => strtolower($w->status),
                'date' => $w->created_at->toIso8601String(),
            ]))
            ->sortByDesc('date')
            ->values()
            ->take(50);

        // Revenus des 6 derniers mois
        $monthly = collect(range(5, 0))->map(function ($i) use ($paidOrders) {
            $month = now()->startOfMonth()->subMonths($i);
            $total = $paidOrders->filter(fn ($o) => Carbon::parse($o->paid_at ?? $o->created_at)->isSameMonth($month))->sum(fn ($o) => $o->sellerNet());

            return ['label' => ucfirst($month->locale('fr')->translatedFormat('M')), 'total' => (float) $total];
        });

        $completed = $withdrawals->filter(fn ($w) => strtolower($w->status) === 'completed');

        return Inertia::render('Seller/Wallet/Index', [
            'store' => $store,
            'wallet' => $wallet,
            'ledger' => $ledger,
            'monthly' => $monthly,
            'heldSales' => $held,
            'holdRules' => ['new' => Order::HOLD_DAYS_NEW, 'established' => Order::HOLD_DAYS_ESTABLISHED, 'after' => Order::ESTABLISHED_AFTER_DELIVERED,
                'current' => Order::holdDaysFor($store->id), 'delivered' => Order::where('store_id', $store->id)->where('status', 'delivered')->count()],
            'pendingWithdrawals' => $withdrawals->filter(fn ($w) => strtolower($w->status) === 'pending')->values(),
            'metrics' => [
                'available_balance' => (float) $wallet->balance_available,
                'pending_balance' => (float) $wallet->balance_pending,
                'held_balance' => (float) $wallet->balance_held,
                'lifetime_earnings' => (float) $paidOrders->sum(fn ($o) => $o->sellerNet()),
                'commission_paid' => (float) $paidOrders->sum('commission_amount'),
                'this_month' => (float) $monthly->last()['total'],
                'total_withdrawals' => (float) $completed->sum('amount'),
                'min_withdrawal' => (int) config('payments.min_withdrawal'),
                'withdrawal_fee_percent' => (float) config('payments.withdrawal_fee_percent'),
            ],
            'defaultPhone' => Auth::user()->phone_whatsapp,
        ]);
    }

    /**
     * Demande de retrait du solde vers Mobile Money. Le montant passe en « en cours » jusqu'à son traitement.
     */
    public function requestWithdrawal(Request $request): RedirectResponse
    {
        $store = Auth::user()->store;
        abort_unless($store, 403);

        $country = $store->country ?: 'CM';
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:'.config('payments.min_withdrawal')],
            'payment_operator' => ['required', 'string', 'in:'.implode(',', array_keys(Countries::get($country)['operators']))],
            'phone' => ['required', 'string', 'max:50'],
        ]);

        try {
            $phone = Countries::formatPhone($country, $validated['phone']);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['phone' => $e->getMessage()]);
        }

        // Frais de retrait déduits du montant : le vendeur reçoit le net sur son Mobile Money
        $amount = (float) $validated['amount'];
        $fee = Withdrawal::feeFor($amount);

        $ok = DB::transaction(function () use ($store, $amount, $fee, $phone, $validated) {
            $wallet = Wallet::where('store_id', $store->id)->lockForUpdate()->first()
                ?? Wallet::create(['store_id' => $store->id, 'balance_available' => 0, 'balance_pending' => 0]);

            if ((float) $wallet->balance_available < $amount) {
                return false;
            }

            $wallet->decrement('balance_available', $amount);
            $wallet->increment('balance_pending', $amount);

            Withdrawal::create([
                'wallet_id' => $wallet->id,
                'amount' => $amount,
                'fee' => $fee,
                'net_amount' => $amount - $fee,
                'phone_number' => $phone,
                'operator' => strtoupper($validated['payment_operator']),
                'payment_operator' => strtoupper($validated['payment_operator']),
                'status' => 'pending',
            ]);

            return true;
        });

        if (! $ok) {
            return back()->withErrors(['amount' => 'Solde disponible insuffisant pour ce retrait.']);
        }

        return redirect()->back()->with('message', 'Demande de retrait envoyée : vous recevrez '.number_format($amount - $fee, 0, ',', ' ').' FCFA. Vous serez notifié dès le virement.');
    }
}
