<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Services\HrSkillsPayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
                'max_images' => 2,
                'whatsapp_recovery' => false,
                'marketing_pixels' => false,
                'priority_support' => false,
                'features' => [
                    'Jusqu\'à 10 produits au catalogue',
                    '2 visuels réels par produit',
                    'Vitrine e-commerce personnalisée',
                    'Factures & Checkout Mobile Money 🇨🇲',
                    'Support client standard',
                ],
            ],
            [
                'id' => 'pro',
                'name' => 'Pro',
                'price' => 15000,
                'period' => 'FCFA / mois',
                'badge' => 'Populaire',
                'color' => 'amber',
                'max_products' => 50,
                'max_images' => 5,
                'whatsapp_recovery' => true,
                'marketing_pixels' => true,
                'priority_support' => true,
                'features' => [
                    'Jusqu\'à 50 produits au catalogue',
                    '5 visuels réels par produit',
                    'Relance WhatsApp Paniers Abandonnés 💬',
                    'Pixels Facebook & TikTok Marketing',
                    'Support Vendeur Prioritaire 7j/7',
                ],
            ],
            [
                'id' => 'growth',
                'name' => 'Growth',
                'price' => 35000,
                'period' => 'FCFA / mois',
                'badge' => 'Croissance',
                'color' => 'indigo',
                'max_products' => 200,
                'max_images' => 5,
                'whatsapp_recovery' => true,
                'marketing_pixels' => true,
                'priority_support' => true,
                'features' => [
                    'Jusqu\'à 200 produits au catalogue',
                    '5 visuels réels par produit',
                    'Paniers abandonnés & Relances WhatsApp',
                    'Pixels Facebook, TikTok & Google Analytics',
                    'Factures PDF personnalisées avec QR Code',
                    'Support VIP Dédié 24h/24',
                ],
            ],
            [
                'id' => 'business',
                'name' => 'Business',
                'price' => 75000,
                'period' => 'FCFA / mois',
                'badge' => 'Illimité',
                'color' => 'emerald',
                'max_products' => 99999,
                'max_images' => 10,
                'whatsapp_recovery' => true,
                'marketing_pixels' => true,
                'priority_support' => true,
                'features' => [
                    'Produits ILLIMITÉS au catalogue',
                    '10 visuels réels par produit',
                    'Paniers abandonnés WhatsApp illimités',
                    'Multi-Pixels & API de Conversion',
                    'Accompagnement par un Chef de Projet Dédié',
                    'Rapports financiers avancés & Exporter Excel',
                ],
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
                'max_images' => $user->getPlanMaxImagesPerProduct(),
            ],
            'plans' => $plans,
            'history' => $history,
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'string', 'in:starter,pro,growth,business'],
            'phone_momo' => ['required', 'string', 'max:50'],
            'operator' => ['nullable', 'string', 'in:MTN,ORANGE,mtn,orange'],
        ]);

        $user = $request->user();
        $targetPlan = strtolower($validated['plan']);

        $planPrices = [
            'starter' => 0,
            'pro' => 15000,
            'growth' => 35000,
            'business' => 75000,
        ];

        $price = $planPrices[$targetPlan] ?? 0;

        // Downgrade / Switch to Starter plan is free & instant
        if ($price === 0) {
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
            'amount' => $price,
            'payment_status' => 'pending',
            'payment_phone' => $formattedPhone,
            'starts_at' => now(),
            'ends_at' => now()->addDays(30),
        ]);

        // Initiate HR-Skills Pay Mobile Money Cash-In
        try {
            $url = config('services.hrskills_pay.base_url') . '/api/v1/payin/mobile-money';
            $token = $this->hrSkillsPay->getTransactionToken();
            $idempotencyKey = (string) \Illuminate\Support\Str::uuid();

            $payload = [
                'operator' => $operatorChoice,
                'country' => 'CM',
                'phone_number' => $formattedPhone,
                'amount' => (int) $price,
                'currency' => 'XAF',
                'description' => 'Abonnement BIOLINKO SaaS Plan ' . ucfirst($targetPlan),
                'metadata' => [
                    'subscription_id' => $subscription->id,
                    'user_id' => $user->id,
                    'plan' => $targetPlan,
                ],
            ];

            $response = \Illuminate\Support\Facades\Http::withHeaders([
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
                'amount' => $price,
                'operator' => $operatorChoice,
                'phone' => $formattedPhone,
                'plan_name' => ucfirst($targetPlan),
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
                $user->update([
                    'plan' => $subscription->plan,
                    'subscription_expires_at' => now()->addDays(30),
                ]);

                return response()->json([
                    'status' => 'SUCCESS',
                    'paid' => true,
                    'message' => 'Abonnement ' . ucfirst($subscription->plan) . ' activé avec succès pour 30 jours !',
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
