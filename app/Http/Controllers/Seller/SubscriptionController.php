<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;

use App\Models\Subscription;
use App\Models\User;
use App\Payments\Countries;
use App\Payments\PaymentException;
use App\Payments\Subscriptions\SubscriptionPayments;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(protected SubscriptionPayments $subscriptionPayments)
    {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store;

        $L = User::PLAN_LIMITS;
        $C = config('payments.commission_percent');
        $pct = fn ($n) => str_replace('.', ',', (string) $n).' %';
        $fmt = fn ($n) => number_format($n, 0, ',', ' ');
        $plans = [
            [
                'id' => 'starter',
                'name' => 'Starter',
                'price' => 0,
                'tagline' => 'Pour faire vos premières ventes',
                'features' => [
                    'Commission de '.$pct($C['starter']).' par vente, tout compris',
                    'Retraits gratuits, livraison sans commission',
                    "Jusqu’à {$L['starter']['products']} produits, {$L['starter']['stock']} articles en stock",
                    "{$L['starter']['images']} photos par produit, {$L['starter']['smartlinks']} liens de paiement actifs",
                    'Boutique en ligne et lien unique',
                    'Paiement MTN MoMo et Orange Money',
                    'Factures automatiques',
                    'Notifications de commande par e-mail',
                    '1 campagne WhatsApp en 1 clic par mois',
                ],
            ],
            [
                'id' => 'pro',
                'name' => 'Pro',
                'price' => User::planPrice('pro'),
                'tagline' => 'Pour les commerçants actifs',
                'popular' => true,
                'features' => [
                    'Commission réduite à '.$pct($C['pro']),
                    "Jusqu’à {$L['pro']['products']} produits, {$L['pro']['stock']} articles en stock",
                    "{$L['pro']['images']} photos par produit, {$L['pro']['smartlinks']} liens de paiement actifs",
                    'Tailles, couleurs et promotions',
                    'Factures à votre marque, sans Biolinko',
                    'Pixels Facebook, TikTok et Google',
                    '4 campagnes WhatsApp en 1 clic par mois',
                    'Support prioritaire',
                ],
            ],
            [
                'id' => 'growth',
                'name' => 'Growth',
                'price' => User::planPrice('growth'),
                'tagline' => 'Pour accélérer vos ventes',
                'features' => [
                    'Tout le plan Pro',
                    'Commission réduite à '.$pct($C['growth']),
                    "Jusqu’à {$L['growth']['products']} produits, {$fmt($L['growth']['stock'])} articles en stock",
                    'Liens de paiement illimités',
                    'Relance automatique des paniers (bientôt)',
                    '10 campagnes WhatsApp en 1 clic par mois',
                ],
            ],
            [
                'id' => 'business',
                'name' => 'Business',
                'price' => User::planPrice('business'),
                'tagline' => 'Pour les marques établies',
                'features' => [
                    'Tout le plan Growth',
                    'Commission réduite à '.$pct($C['business']),
                    'Produits et stock illimités',
                    'Export comptable CSV et Excel',
                    '25 campagnes WhatsApp en 1 clic par mois',
                    'Conseiller dédié',
                ],
            ],
        ];

        $cycles = [
            [
                'months' => 1,
                'label' => 'Mensuel (1 mois)',
                'discount_percent' => 0,
                'badge' => null,
            ],
            [
                'months' => 12,
                'label' => 'Annuel (1 an)',
                'discount_percent' => 15,
                'badge' => '-15% de réduction',
            ],
            [
                'months' => 24,
                'label' => '2 ans',
                'discount_percent' => 20,
                'badge' => '-20% de réduction',
            ],
        ];

        $currentPlanId = strtolower($user->plan ?? 'starter');
        $currentPlan = collect($plans)->firstWhere('id', $currentPlanId) ?? $plans[0];

        $history = Subscription::where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Seller/Subscriptions/Index', [
            'store' => $store,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone_whatsapp' => $user->phone_whatsapp,
                'plan' => $currentPlanId,
                'plan_name' => $currentPlan['name'],
                'subscription_expires_at' => $user->subscription_expires_at ? $user->subscription_expires_at->format('Y-m-d H:i') : null,
                'days_remaining' => $user->getDaysRemaining(),
                'is_active' => $user->isSubscriptionActive(),
                'max_products' => $user->getPlanMaxProducts(),
                'products_count' => $store ? $store->products()->count() : 0,
                // Jours offerts si le vendeur passe à ce plan (conversion des jours restants)
                'auto_renew' => (bool) $user->auto_renew,
                'wallet_balance' => \App\Payments\Subscriptions\SubscriptionRenewals::balance($user),
                'conversion_days' => collect(['pro', 'growth', 'business'])->mapWithKeys(fn ($p) => [$p => $user->planConversionDays($p)]),
            ],
            'plans' => $plans,
            'upgradeHint' => $user->upgradeSavings(),
            'cycles' => $cycles,
            'history' => $history,
            // Plan choisi sur la landing (?plan=pro) : la page ouvre directement son paiement
            'intendedPlan' => in_array($request->query('plan'), ['pro', 'growth', 'business'], true) ? $request->query('plan') : null,
            'simulation' => $this->isSimulation(),
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:starter,pro,growth,business'],
            'method' => ['nullable', 'in:momo,wallet'],
            'phone_momo' => ['required_unless:method,wallet', 'nullable', 'string', 'max:50'],
            'operator' => ['nullable', 'string', 'in:MTN,ORANGE,mtn,orange'],
            'cycle' => ['nullable', 'integer', 'in:1,12,24'],
        ]);

        $user = $request->user();
        $targetPlan = strtolower($validated['plan']);
        $cycleMonths = (int) ($validated['cycle'] ?? 1);

        $monthlyPrice = User::planPrice($targetPlan);

        // Downgrade / Switch to Starter plan is free & instant
        if ($monthlyPrice === 0) {
            $user->update([
                'plan' => 'starter',
                'subscription_expires_at' => null,
            ]);

            return response()->json([
                'success' => true,
                'requires_ussd' => false,
                'message' => 'Votre plan a été basculé vers le Plan Starter gratuit.',
            ]);
        }

        // Apply discount percentage based on billing cycle
        $discountRate = match ($cycleMonths) {
            12 => 0.15, // -15 % sur 1 an
            24 => 0.20, // -20 % sur 2 ans
            default => 0.0,
        };

        $totalPrice = (int) round($monthlyPrice * $cycleMonths * (1.0 - $discountRate));

        // Paiement avec le solde du portefeuille : immédiat, sans demande sur le téléphone
        if (($validated['method'] ?? 'momo') === 'wallet') {
            try {
                $sub = app(\App\Payments\Subscriptions\SubscriptionRenewals::class)->payWithWallet($user, $targetPlan, $cycleMonths);
            } catch (PaymentException $e) {
                return response()->json(['error' => $e->getMessage()], 422);
            }

            return response()->json([
                'success' => true, 'requires_ussd' => false, 'paid' => true,
                'message' => 'Abonnement '.ucfirst($targetPlan).' activé jusqu’au '.$user->fresh()->subscription_expires_at->format('d/m/Y').'. '.number_format((float) $sub->amount, 0, ',', ' ').' FCFA prélevés sur votre solde.',
            ]);
        }

        // Validate Cameroon MoMo phone number
        try {
            $formattedPhone = Countries::formatPhone($user->store?->country ?: 'CM', $validated['phone_momo']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        $operatorChoice = $validated['operator'] ?? Countries::detectOperator($user->store?->country ?: 'CM', $formattedPhone);

        // Create Pending Subscription Record
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan' => $targetPlan,
            'billing_cycle' => $cycleMonths,
            'amount' => $totalPrice,
            'payment_status' => 'pending',
            'payment_phone' => $formattedPhone,
            'starts_at' => now(),
            'ends_at' => now()->addMonths($cycleMonths),
        ]);

        // Mode simulation : aucune demande n'est envoyée à l'opérateur, le paiement est confirmé au contrôle suivant
        if ($this->isSimulation()) {
            $reference = 'SIM-'.Str::upper(Str::random(12));
            $subscription->update(['payment_provider' => 'simulation', 'payment_reference' => $reference]);

            return response()->json([
                'success' => true,
                'requires_ussd' => true,
                'simulated' => true,
                'reference' => $reference,
                'amount' => $totalPrice,
                'operator' => strtoupper($operatorChoice),
                'phone' => $formattedPhone,
                'plan_name' => ucfirst($targetPlan),
                'cycle_months' => $cycleMonths,
            ]);
        }

        // Demande de paiement Mobile Money (agrégateur configuré)
        try {
            $result = $this->subscriptionPayments->start($subscription, $formattedPhone, strtoupper($operatorChoice));
        } catch (\Throwable $e) {
            Log::error('Subscription payment start failed', ['user_id' => $user->id, 'err' => $e->getMessage()]);
            $subscription->update(['payment_status' => 'failed']);

            return response()->json([
                'success' => false,
                'error' => $e instanceof PaymentException || $e instanceof \InvalidArgumentException ? $e->getMessage() : 'Le paiement n’a pas pu être lancé. Réessayez dans un instant.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'requires_ussd' => true,
            'reference' => $result['reference'],
            'amount' => $totalPrice,
            'operator' => strtoupper($operatorChoice),
            'phone' => $formattedPhone,
            'plan_name' => ucfirst($targetPlan),
            'cycle_months' => $cycleMonths,
        ]);
    }

    public function checkStatus(Request $request, string $reference): JsonResponse
    {
        $subscription = Subscription::where('payment_reference', $reference)->orWhere('hrskills_reference', $reference)->first();

        if (! $subscription || $subscription->user_id !== $request->user()->id) {
            return response()->json(['status' => 'NOT_FOUND', 'paid' => false], 404);
        }

        if ($subscription->payment_status === 'paid') {
            return response()->json([
                'status' => 'SUCCESS',
                'paid' => true,
                'message' => 'Abonnement activé avec succès !',
            ]);
        }

        // Paiement simulé : validé quelques secondes après la demande, comme une vraie confirmation USSD
        if (str_starts_with($reference, 'SIM-')) {
            if ($subscription->created_at->diffInSeconds(now()) < 4) {
                return response()->json(['status' => 'PENDING', 'paid' => false]);
            }

            return $this->activate($subscription);
        }

        $status = $this->subscriptionPayments->refresh($subscription);

        if ($status === 'SUCCESS') {
            return $this->activate($subscription->fresh());
        }
        if ($status === 'FAILED') {
            return response()->json(['status' => 'FAILED', 'paid' => false, 'message' => 'Paiement d’abonnement annulé ou refusé.']);
        }

        return response()->json(['status' => 'PENDING', 'paid' => false]);
    }

    private function isSimulation(): bool
    {
        // Jamais de paiement simulé en production, même si la variable est oubliée
        return config('services.hrskills_pay.subscription_mode') === 'simulation' && ! app()->environment('production');
    }

    private function activate(Subscription $subscription): JsonResponse
    {
        $subscription->activate();
        $months = $subscription->billing_cycle ?? 1;

        return response()->json([
            'status' => 'SUCCESS',
            'paid' => true,
            'message' => 'Abonnement '.ucfirst($subscription->plan).' activé pour '.$months.' mois !',
        ]);
    }

    /** Active ou désactive le prélèvement automatique sur le portefeuille à l'échéance. */
    public function toggleAutoRenew(Request $request): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user()->refresh();
        $user->update(['auto_renew' => ! $user->auto_renew]);

        return back()->with('message', $user->auto_renew
            ? 'Prélèvement automatique activé : votre abonnement sera renouvelé avec le solde de votre portefeuille.'
            : 'Prélèvement automatique désactivé : vous renouvellerez vous-même, par Mobile Money ou avec votre solde.');
    }
}
