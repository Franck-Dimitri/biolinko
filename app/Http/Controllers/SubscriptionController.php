<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Services\HrSkillsPayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    protected HrSkillsPayService $hrSkillsPay;

    public function __construct(HrSkillsPayService $hrSkillsPay)
    {
        $this->hrSkillsPay = $hrSkillsPay;
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store;

        $plans = [
            [
                'id' => 'starter',
                'name' => 'Starter',
                'price' => 0,
                'period' => 'Gratuit à vie',
                'badge' => 'Gratuit',
                'color' => 'slate',
                'max_products' => 10,
                'whatsapp_recovery' => false,
                'marketing_pixels' => false,
                'priority_support' => false,
                'features' => [
                    'Jusqu\'à 10 produits au catalogue',
                    'Vitrine e-commerce personnalisée',
                    'Factures & Checkout Mobile Money 🇨🇲',
                    'Support client standard',
                ],
            ],
            [
                'id' => 'pro',
                'name' => 'Pro',
                'price' => 7000,
                'period' => 'FCFA / mois',
                'badge' => 'Populaire',
                'color' => 'amber',
                'max_products' => 50,
                'whatsapp_recovery' => true,
                'marketing_pixels' => true,
                'priority_support' => true,
                'features' => [
                    'Jusqu\'à 50 produits au catalogue',
                    'Relance WhatsApp Paniers Abandonnés 💬',
                    'Pixels Facebook & TikTok Marketing',
                    'Support Vendeur Prioritaire 7j/7',
                ],
            ],
            [
                'id' => 'growth',
                'name' => 'Growth',
                'price' => 16000,
                'period' => 'FCFA / mois',
                'badge' => 'Croissance',
                'color' => 'indigo',
                'max_products' => 200,
                'whatsapp_recovery' => true,
                'marketing_pixels' => true,
                'priority_support' => true,
                'features' => [
                    'Jusqu\'à 200 produits au catalogue',
                    'Paniers abandonnés & Relances WhatsApp',
                    'Pixels Facebook, TikTok & Google Analytics',
                    'Factures PDF personnalisées avec QR Code',
                    'Support VIP Dédié 24h/24',
                ],
            ],
            [
                'id' => 'business',
                'name' => 'Business',
                'price' => 30000,
                'period' => 'FCFA / mois',
                'badge' => 'Illimité',
                'color' => 'emerald',
                'max_products' => 99999,
                'whatsapp_recovery' => true,
                'marketing_pixels' => true,
                'priority_support' => true,
                'features' => [
                    'Produits ILLIMITÉS au catalogue',
                    'Paniers abandonnés WhatsApp illimités',
                    'Multi-Pixels & API de Conversion',
                    'Accompagnement par un Chef de Projet Dédié',
                    'Rapports financiers avancés & Exporter Excel',
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
                'months' => 6,
                'label' => 'Semestriel (6 mois)',
                'discount_percent' => 14,
                'badge' => '-14% de réduction',
            ],
            [
                'months' => 12,
                'label' => 'Annuel (1 an)',
                'discount_percent' => 30,
                'badge' => '-30% de réduction 🔥',
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
            ],
            'plans' => $plans,
            'cycles' => $cycles,
            'history' => $history,
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:starter,pro,growth,business'],
            'phone_momo' => ['required', 'string', 'max:50'],
            'operator' => ['nullable', 'string', 'in:MTN,ORANGE,mtn,orange'],
            'cycle' => ['nullable', 'integer', 'in:1,6,12'],
        ]);

        $user = $request->user();
        $targetPlan = strtolower($validated['plan']);
        $cycleMonths = (int) ($validated['cycle'] ?? 1);

        $planPrices = [
            'starter' => 0,
            'pro' => 7000,
            'growth' => 16000,
            'business' => 30000,
        ];

        $monthlyPrice = $planPrices[$targetPlan] ?? 0;

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
            6 => 0.14,  // -14%
            12 => 0.30, // -30%
            default => 0.0,
        };

        $totalPrice = (int) round($monthlyPrice * $cycleMonths * (1.0 - $discountRate));

        // Validate Cameroon MoMo phone number
        try {
            $formattedPhone = $this->hrSkillsPay->formatCameroonPhone($validated['phone_momo']);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        $operatorChoice = $validated['operator'] ?? $this->hrSkillsPay->detectOperator($formattedPhone);

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

        // Initiate HR-Skills Pay Mobile Money Cash-In
        try {
            $url = config('services.hrskills_pay.base_url') . '/api/v1/payin/mobile-money';
            $token = $this->hrSkillsPay->getTransactionToken();
            $idempotencyKey = (string) Str::uuid();

            $cycleLabel = match ($cycleMonths) {
                6 => '6 mois (-14%)',
                12 => '1 an (-30%)',
                default => '1 mois',
            };

            $payload = [
                'operator' => $operatorChoice,
                'country' => 'CM',
                'phone_number' => $formattedPhone,
                'amount' => (int) $totalPrice,
                'currency' => 'XAF',
                'description' => 'Abonnement BIOLINKO Plan ' . ucfirst($targetPlan) . ' (' . $cycleLabel . ')',
                'metadata' => [
                    'subscription_id' => $subscription->id,
                    'user_id' => $user->id,
                    'plan' => $targetPlan,
                    'billing_cycle' => $cycleMonths,
                ],
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.hrskills_pay.public_key'),
                'X-Transaction-Token' => $token,
                'Idempotency-Key' => $idempotencyKey,
                'Content-Type' => 'application/json',
            ])->post($url, $payload);

            if ($response->failed()) {
                $resJson = $response->json();
                $msg = $resJson['message'] ?? $resJson['error'] ?? 'Échec d\'initiation du paiement Mobile Money.';
                throw new \RuntimeException($msg);
            }

            $resData = $response->json();
            $data = $resData['data'] ?? $resData;

            $subscription->update([
                'hrskills_reference' => $data['reference'] ?? null,
                'hrskills_transaction_id' => $data['transaction_id'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'requires_ussd' => true,
                'reference' => $data['reference'],
                'amount' => $totalPrice,
                'operator' => $operatorChoice,
                'phone' => $formattedPhone,
                'plan_name' => ucfirst($targetPlan),
                'cycle_months' => $cycleMonths,
            ]);

        } catch (\Exception $e) {
            Log::error('Subscription HR-Skills Payin Error', ['user_id' => $user->id, 'err' => $e->getMessage()]);
            $subscription->update(['payment_status' => 'failed']);

            return response()->json([
                'success' => false,
                'error' => 'Échec du paiement Mobile Money : ' . $e->getMessage(),
            ], 422);
        }
    }

    public function checkStatus(Request $request, string $reference): JsonResponse
    {
        $subscription = Subscription::where('hrskills_reference', $reference)->first();

        if (!$subscription) {
            return response()->json(['status' => 'NOT_FOUND', 'paid' => false], 404);
        }

        if ($subscription->payment_status === 'paid') {
            return response()->json([
                'status' => 'SUCCESS',
                'paid' => true,
                'message' => 'Abonnement activé avec succès !',
            ]);
        }

        // Poll HR-Skills Pay Status
        try {
            $liveData = $this->hrSkillsPay->checkPaymentStatus($reference);
            $liveStatus = strtoupper($liveData['status'] ?? 'PENDING');

            if ($liveStatus === 'SUCCESS') {
                $subscription->update([
                    'payment_status' => 'paid',
                ]);

                $user = $subscription->user;
                $months = $subscription->billing_cycle ?? 1;

                // Extend subscription expiration date from now (or current expiry if still active)
                $currentExpiry = ($user->subscription_expires_at && $user->subscription_expires_at->isFuture())
                    ? $user->subscription_expires_at
                    : now();

                $newExpiry = $currentExpiry->copy()->addMonths($months);

                $user->update([
                    'plan' => $subscription->plan,
                    'subscription_expires_at' => $newExpiry,
                ]);

                return response()->json([
                    'status' => 'SUCCESS',
                    'paid' => true,
                    'message' => 'Abonnement ' . ucfirst($subscription->plan) . ' activé avec succès pour ' . $months . ' mois !',
                ]);
            }

            if ($liveStatus === 'FAILED') {
                $subscription->update(['payment_status' => 'failed']);
                return response()->json([
                    'status' => 'FAILED',
                    'paid' => false,
                    'message' => 'Paiement d\'abonnement annulé ou décliné.',
                ]);
            }
        } catch (\Exception $e) {
            Log::warning('Subscription status poll error', ['ref' => $reference, 'err' => $e->getMessage()]);
        }

        return response()->json([
            'status' => 'PENDING',
            'paid' => false,
        ]);
    }
}
