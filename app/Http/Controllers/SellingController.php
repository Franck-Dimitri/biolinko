<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PromoCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Livraison (zones et tarifs) et codes promo du vendeur.
 */
class SellingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store;
        abort_unless($store, 404);

        $promos = $store->promoCodes()->latest()->get();
        $sales = Order::where('store_id', $store->id)->paid()->whereNotNull('promo_code_id')
            ->selectRaw('promo_code_id, COUNT(*) as orders, SUM(discount_amount) as discount, SUM(price_vendor) as revenue')
            ->groupBy('promo_code_id')->get()->keyBy('promo_code_id');

        return Inertia::render('Seller/Selling/Index', [
            'delivery' => [
                'zones' => $store->delivery_zones ?? [],
                'other_fee' => $store->delivery_other_fee,
                'free_from' => $store->delivery_free_from,
            ],
            'depositPercent' => $store->deposit_percent,
            'promos' => $promos->map(fn (PromoCode $p) => [
                'id' => $p->id,
                'code' => $p->code,
                'type' => $p->type,
                'value' => (float) $p->value,
                'label' => $p->label(),
                'min_subtotal' => $p->min_subtotal !== null ? (float) $p->min_subtotal : null,
                'max_uses' => $p->max_uses,
                'used_count' => $p->used_count,
                'ends_at' => $p->ends_at?->toDateString(),
                'expired' => (bool) $p->ends_at?->isPast(),
                'is_active' => $p->is_active,
                'orders' => (int) ($sales[$p->id]->orders ?? 0),
                'discount' => (float) ($sales[$p->id]->discount ?? 0),
                'revenue' => (float) ($sales[$p->id]->revenue ?? 0),
            ]),
            'promoLimit' => $user->planLimit('promo_codes'),
            'plan' => $user->effectivePlan(),
        ]);
    }

    public function updateDelivery(Request $request): RedirectResponse
    {
        $store = $request->user()->store;
        abort_unless($store, 404);

        $data = $request->validate([
            'zones' => ['present', 'array', 'max:30'],
            'zones.*.name' => ['required', 'string', 'max:60', 'distinct:ignore_case'],
            'zones.*.fee' => ['required', 'numeric', 'min:0', 'max:100000'],
            'other_fee' => ['nullable', 'numeric', 'min:0', 'max:100000'],
            'free_from' => ['nullable', 'numeric', 'min:1', 'max:10000000'],
        ], [
            'zones.*.name.required' => 'Donnez un nom à chaque zone (ex. Douala).',
            'zones.*.name.distinct' => 'Deux zones portent le même nom.',
            'zones.*.fee.required' => 'Indiquez le prix de livraison de chaque zone (0 si gratuite).',
        ]);

        $store->update([
            'delivery_zones' => collect($data['zones'])->map(fn ($z) => ['name' => trim($z['name']), 'fee' => (float) $z['fee']])->values()->all(),
            'delivery_other_fee' => $data['other_fee'],
            'delivery_free_from' => $data['free_from'],
        ]);

        return back()->with('message', 'Tarifs de livraison enregistrés.');
    }

    public function updateDeposit(Request $request): RedirectResponse
    {
        $store = $request->user()->store;
        abort_unless($store, 404);

        $data = $request->validate(['deposit_percent' => ['nullable', 'integer', 'min:20', 'max:90']], [
            'deposit_percent.min' => 'L’acompte est d’au moins 20 % : il couvre la commission et protège des faux clients.',
        ]);
        $store->update($data);

        return back()->with('message', $data['deposit_percent'] ? "Acompte de {$data['deposit_percent']} % activé." : 'Paiement avec acompte désactivé.');
    }

    public function storePromo(Request $request): RedirectResponse
    {
        $user = $request->user();
        $store = $user->store;
        abort_unless($store, 404);

        $request->merge(['code' => PromoCode::normalize((string) $request->input('code'))]);
        $data = $request->validate([
            'code' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[A-Z0-9_-]+$/', Rule::unique('promo_codes')->where('store_id', $store->id)],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:1', $request->input('type') === 'percent' ? 'max:90' : 'max:10000000'],
            'min_subtotal' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:today'],
        ], [
            'code.regex' => 'Le code ne contient que des lettres, des chiffres, - ou _ (ex. NOEL10).',
            'code.unique' => 'Vous avez déjà un code avec ce nom.',
            'value.max' => 'Une remise en pourcentage ne dépasse pas 90 %.',
        ]);

        if ($error = $this->limitError($user)) {
            return back()->withErrors(['code' => $error]);
        }

        $store->promoCodes()->create($data + ['is_active' => true]);

        return back()->with('message', "Code {$data['code']} créé.");
    }

    public function togglePromo(Request $request, PromoCode $promoCode): RedirectResponse
    {
        abort_unless($promoCode->store_id === $request->user()->store?->id, 403);

        if (! $promoCode->is_active && ($error = $this->limitError($request->user()))) {
            return back()->withErrors(['code' => $error]);
        }

        $promoCode->update(['is_active' => ! $promoCode->is_active]);

        return back()->with('message', $promoCode->is_active ? "Code {$promoCode->code} activé." : "Code {$promoCode->code} désactivé.");
    }

    public function destroyPromo(Request $request, PromoCode $promoCode): RedirectResponse
    {
        abort_unless($promoCode->store_id === $request->user()->store?->id, 403);
        $promoCode->delete();

        return back()->with('message', 'Code supprimé.');
    }

    private function limitError($user): ?string
    {
        $limit = $user->planLimit('promo_codes');
        if ($limit === null) {
            return null;
        }
        $active = $user->store->promoCodes()->where('is_active', true)->count();

        return $active >= $limit
            ? "Votre plan ".ucfirst($user->effectivePlan())." permet {$limit} code(s) actif(s). Désactivez-en un ou passez au plan supérieur."
            : null;
    }
}
