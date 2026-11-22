<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Payments\Countries;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
            ->paid()
            ->with('report:id,order_id,status')
            ->get(['id', 'tracking_code', 'customer_name', 'price_vendor', 'commission_amount', 'commission_rate', 'paid_at', 'created_at', 'payment_operator', 'funds_release_at', 'funds_released_at', 'delivered_at']);

        // Ventes payées pas encore retirables (délai de sécurité ou signalement en cours)
        $held = $paidOrders->whereNull('funds_released_at')->sortBy('funds_release_at')->values()->map(fn ($o) => [
            'id' => $o->id,
            'tracking_code' => $o->tracking_code,
            'customer_name' => $o->customer_name,
            'amount' => $o->sellerNet(),
            'available_at' => $o->funds_release_at?->toIso8601String(),
            'delivered' => (bool) $o->delivered_at,
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
            ->merge(Subscription::where('user_id', $store->user_id)->where('payment_provider', 'wallet')->where('payment_status', 'paid')->get()->map(fn ($s) => [
                'id' => 's'.$s->id,
                'type' => 'subscription',
                'label' => 'Abonnement '.ucfirst($s->plan),
                'detail' => $s->billing_cycle.' mois · payé avec le solde',
                'amount' => -1 * (float) $s->amount,
                'status' => 'completed',
                'date' => $s->created_at->toIso8601String(),
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
            'protection' => ['after_delivery_days' => Order::RELEASE_AFTER_DELIVERY_DAYS, 'max_days' => Order::MAX_HOLD_DAYS],
            'verification' => $this->verificationStatus(Auth::user()),
            'payoutAccount' => Auth::user()->payoutAccount(),
            'payoutDelayHours' => User::PAYOUT_CHANGE_DELAY_HOURS,
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
        $user = Auth::user();
        $store = $user->store;
        abort_unless($store, 403);

        // Protection des clients : pas de retrait sans identité vérifiée ni numéro de retrait enregistré
        if (! $user->isVerified()) {
            return back()->withErrors(['amount' => 'Faites vérifier votre identité avant votre premier retrait.']);
        }
        $user->applyPendingPayout();
        if (! $user->payout_phone || ! $user->payout_operator) {
            return back()->withErrors(['amount' => 'Enregistrez d’abord votre numéro de retrait.']);
        }

        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:'.config('payments.min_withdrawal')],
        ]);
        // Les retraits partent uniquement vers le numéro enregistré, jamais vers un numéro saisi au moment du retrait
        $phone = $user->payout_phone;
        $validated['payment_operator'] = $user->payout_operator;

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

    /** État de la vérification d'identité, pour le portefeuille et le tableau de bord. */
    public static function verificationStatus(User $user): array
    {
        $v = $user->verification;

        return [
            'status' => $v?->status ?? 'none',
            'rejection_reason' => $v?->rejection_reason,
            'submitted_at' => $v?->submitted_at?->toIso8601String(),
        ];
    }

    /**
     * Enregistre le numéro de retrait. Le premier est immédiat ; un changement ne prend effet
     * qu'après User::PAYOUT_CHANGE_DELAY_HOURS heures et exige le mot de passe, pour qu'un compte volé ne puisse pas vider le solde.
     */
    public function savePayoutAccount(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $store = $user->store;
        abort_unless($store, 403);

        $country = $store->country ?: 'CM';
        $validated = $request->validate([
            'operator' => ['required', 'string', 'in:'.implode(',', array_keys(Countries::get($country)['operators']))],
            'phone' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'min:3', 'max:120'],
            'password' => ['required', 'current_password'],
        ], ['password.current_password' => 'Mot de passe incorrect.']);

        try {
            $phone = Countries::formatPhone($country, $validated['phone']);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['phone' => $e->getMessage()]);
        }
        $operator = strtoupper($validated['operator']);
        $name = trim($validated['name']);
        $user->applyPendingPayout();

        if (! $user->payout_phone) {
            $user->forceFill(['payout_phone' => $phone, 'payout_operator' => $operator, 'payout_name' => $name])->save();

            return back()->with('message', 'Numéro de retrait enregistré.');
        }

        if ($phone === $user->payout_phone && $operator === $user->payout_operator) {
            $user->forceFill(['payout_name' => $name, 'payout_pending_phone' => null, 'payout_pending_operator' => null, 'payout_pending_name' => null, 'payout_pending_effective_at' => null])->save();

            return back()->with('message', 'Numéro de retrait mis à jour.');
        }

        $effective = now()->addHours(User::PAYOUT_CHANGE_DELAY_HOURS);
        $user->forceFill([
            'payout_pending_phone' => $phone,
            'payout_pending_operator' => $operator,
            'payout_pending_name' => $name,
            'payout_pending_effective_at' => $effective,
        ])->save();

        // Le titulaire du compte est prévenu : s'il n'est pas à l'origine du changement, il peut l'annuler
        try {
            Mail::raw(
                "Bonjour {$user->name},\n\nUn nouveau numéro de retrait ({$phone}) a été demandé sur votre compte Biolinko. Il prendra effet le "
                .$effective->locale('fr')->translatedFormat('d F à H\hi').".\n\nSi vous n’êtes pas à l’origine de ce changement, annulez-le depuis votre portefeuille et changez votre mot de passe.\n\nL’équipe Biolinko",
                fn ($m) => $m->to($user->email)->subject('Changement de votre numéro de retrait Biolinko')
            );
        } catch (\Throwable $e) {
            Log::warning('Payout change mail failed', ['user_id' => $user->id, 'err' => $e->getMessage()]);
        }

        return back()->with('message', 'Nouveau numéro enregistré : il prendra effet dans '.User::PAYOUT_CHANGE_DELAY_HOURS.' h.');
    }

    /** Annule un changement de numéro de retrait en attente. */
    public function cancelPendingPayout(): RedirectResponse
    {
        Auth::user()->forceFill([
            'payout_pending_phone' => null, 'payout_pending_operator' => null, 'payout_pending_name' => null, 'payout_pending_effective_at' => null,
        ])->save();

        return back()->with('message', 'Changement de numéro annulé.');
    }
}
