<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Payments\Countries;
use App\Support\BusinessTypes;
use App\Support\StoreDesign;
use App\Support\StoreTemplates;
use App\Support\TemplateIntent;
use App\Support\TemplatesRollout;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Création de la boutique en 3 étapes : activité, template (aperçu en direct), nom, adresse, ville et WhatsApp.
 * La boutique est en ligne tout de suite, avec 3 produits d'exemple en brouillon à remplacer.
 */
class CreationController extends Controller
{
    public const EXAMPLE_PRODUCTS = 3;

    public function show(Request $request): Response|RedirectResponse
    {
        if (! TemplatesRollout::openTo($request->user())) {
            return redirect()->route('appearance.index');
        }
        $store = $request->user()->ensureStore();
        $intent = TemplateIntent::get($request);
        $current = $store->design_engine ? ($store->design['template'] ?? null) : null;

        return Inertia::render('Seller/Creation', [
            'activities' => collect(StoreTemplates::byBusinessType())->filter(fn ($t, $type) => TemplatesRollout::activityOpen($type))->map(fn ($templates, $type) => [
                'key' => $type,
                'label' => BusinessTypes::get($type)['label'],
                'templates' => array_map(fn ($t) => ['id' => $t['id'], 'name' => $t['name'], 'pitch' => $t['pitch'], 'primary' => $t['design']['style']['primary']], $templates),
            ])->values(),
            'store' => $store->only(['name', 'slug', 'city_location', 'phone_whatsapp', 'business_type', 'is_published', 'public_url', 'public_address']),
            'initialTemplate' => $intent['id'] ?? $current,
            'initialActivity' => $intent['business_types'][0] ?? $store->business_type,
            'done' => $request->boolean('fini'),
            'examples' => $store->products()->where('is_active', false)->whereNotNull('example_of')->count(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless(TemplatesRollout::openTo($request->user()), 403);
        $store = $request->user()->ensureStore();
        $validated = $request->validate([
            'business_type' => ['required', Rule::in(array_values(array_filter(BusinessTypes::keys(), [TemplatesRollout::class, 'activityOpen'])))],
            'template' => ['required', 'string'],
            'name' => ['required', 'string', 'max:60'],
            'slug' => ['required', 'string', 'regex:/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/', Rule::unique('stores', 'slug')->ignore($store->id), Rule::notIn(User::RESERVED_SLUGS)],
            'city_location' => ['required', 'string', 'max:120'],
            'phone_whatsapp' => ['required', 'string', 'max:50'],
        ], [
            'slug.regex' => 'L’adresse doit faire 3 à 40 caractères : lettres minuscules, chiffres et tirets.',
            'slug.unique' => 'Cette adresse est déjà prise, choisissez-en une autre.',
            'slug.not_in' => 'Cette adresse est réservée, choisissez-en une autre.',
            'city_location.required' => 'Indiquez votre ville : elle s’affiche sur la vitrine.',
        ]);

        $template = StoreTemplates::get($validated['template']);
        if (! $template || ! in_array($validated['business_type'], $template['business_types'], true)) {
            return back()->withErrors(['template' => 'Choisissez un des templates proposés pour votre activité.']);
        }
        try {
            $phone = '+'.Countries::formatPhone($store->country ?: 'CM', $validated['phone_whatsapp']);
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['phone_whatsapp' => 'Entrez un numéro WhatsApp valide (9 chiffres, ex. 6XX XX XX XX).']);
        }

        $activity = BusinessTypes::get($validated['business_type']);
        DB::transaction(function () use ($store, $validated, $template, $activity, $phone) {
            $store->forceFill([
                'business_type' => $validated['business_type'],
                'category' => $activity['label'],
                'name' => trim($validated['name']),
                'slug' => $validated['slug'],
                'city_location' => trim($validated['city_location']),
                'phone_whatsapp' => $phone,
                // Réglages d'origine alignés sur le template (pages qui les lisent encore)
                'theme_color' => $template['design']['style']['primary'],
                'pattern' => $template['design']['pattern']['key'],
                'design_engine' => true,
                'is_configured' => true,
                'is_published' => true,
            ])->save();
            $store->forceFill($this->freshTexts($store, $activity))->save();
            StoreDesign::publish($store, $template['design']);
            $this->createExamples($store, $validated['business_type']);
        });
        TemplateIntent::forget($request);

        return redirect()->route('seller.creation', ['fini' => 1]);
    }

    /**
     * Valeurs génériques jamais choisies par le vendeur (défauts historiques) : textes d'accueil de l'activité
     * s'il y en a, sinon rien (la vitrine affiche alors le nom, la ville et des textes neutres). Jamais d'horaires inventés.
     */
    private function freshTexts($store, array $activity): array
    {
        $defaults = [
            'hero_badge_text' => 'PROMOTIONS & TENDANCES',
            'hero_title' => 'Découvrez nos Produits d\'Exception',
            'hero_cta_text' => 'Acheter Maintenant',
            'announcement_header' => '⚡ Bienvenue sur la boutique officielle !',
            'opening_hours' => 'Lun - Sam: 08h00 - 18h00',
        ];
        $hero = $activity['hero'] ?? [];
        $suggested = ['hero_badge_text' => $hero['badge'] ?? null, 'hero_title' => $hero['title'] ?? null, 'hero_subtitle' => $hero['subtitle'] ?? null, 'hero_cta_text' => $hero['cta'] ?? null];
        $out = [];
        foreach ($defaults as $field => $generic) {
            if (blank($store->{$field}) || $store->{$field} === $generic) {
                $out[$field] = $suggested[$field] ?? null;
            }
        }
        if (blank($store->hero_subtitle) && ! empty($suggested['hero_subtitle'])) {
            $out['hero_subtitle'] = $suggested['hero_subtitle'];
        }

        return $out;
    }

    /** Produits d'exemple de l'activité, en brouillon : jamais visibles des clients tant qu'ils ne sont pas modifiés et activés. */
    private function createExamples($store, string $type): void
    {
        if ($store->products()->exists()) {
            return;
        }
        $demo = StoreTemplates::demo($type);
        foreach (array_slice($demo['products'] ?? [], 0, self::EXAMPLE_PRODUCTS) as $p) {
            $store->products()->create([
                'title' => $p['title'],
                'slug' => Str::slug($p['title']).'-'.Str::random(4),
                'description' => $p['description'] ?: null,
                'category' => $p['category'],
                'price_vendor' => $p['price_vendor'],
                'stock' => 0,
                'min_order_quantity' => 1,
                'image_url' => $p['image_url'],
                'images' => $p['image_url'] ? [$p['image_url']] : [],
                'fulfillment' => $p['fulfillment'],
                'lead_time_hours' => $p['lead_time_hours'],
                'is_active' => false,
                'example_of' => $type,
            ]);
        }
    }
}
