<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\StoreDesignVersion;
use App\Support\BusinessTypes;
use App\Support\ImageUpload;
use App\Support\StoreDesign;
use App\Support\StoreTemplates;
use App\Support\TemplatesRollout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Éditeur visuel de la vitrine : brouillon enregistré automatiquement, aperçu en direct, publication
 * et retour à une version précédente. Le contenu (produits, avis, textes de la boutique) ne bouge pas.
 */
class EditorController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if (! TemplatesRollout::openTo($request->user())) {
            return redirect()->route('appearance.index');
        }
        $store = $request->user()->ensureStore();
        $type = $store->business_type ?: 'autre';

        return Inertia::render('Seller/Editor', [
            'store' => $store->only(['id', 'name', 'slug', 'business_type', 'public_url', 'theme_color']),
            // Onglets « Infos » et « Avis » : tout se règle sur la même page
            'info' => $store->only(['name', 'slug', 'business_type', 'description', 'about_text', 'logo_url', 'banner_url', 'phone_whatsapp', 'city_location',
                'location_address', 'opening_hours', 'opening_schedule', 'min_order_amount', 'instagram_link', 'tiktok_link', 'facebook_link', 'support_email', 'theme_color']),
            'activities' => collect(BusinessTypes::all())->map(fn ($t) => $t['label']),
            'reviews' => $store->reviews()->with('product:id,title')->latest()->get(['id', 'product_id', 'customer_name', 'customer_city', 'rating', 'comment', 'is_featured', 'is_verified', 'created_at']),
            'draft' => $this->current($store, 'design_draft'),
            'published' => $store->design_engine ? $store->design : null,
            'catalog' => StoreDesign::catalog(),
            'fonts' => StoreDesign::FONTS,
            'patterns' => BusinessTypes::PATTERNS_BY_TYPE[$type] ?? [],
            'templates' => array_map(fn ($t) => ['id' => $t['id'], 'name' => $t['name'], 'pitch' => $t['pitch'], 'design' => $t['design']],
                StoreTemplates::forBusinessType($type)),
            'products' => $store->products()->where('is_active', true)->get(['id', 'title'])->values(),
            'versions' => $this->versions($store),
        ]);
    }

    /** Brouillon enregistré automatiquement (ne change rien pour les clients). */
    public function saveDraft(Request $request): JsonResponse
    {
        $store = $request->user()->ensureStore();
        try {
            $design = $this->validated($request);
        } catch (ValidationException $e) {
            // Appel en arrière-plan : une vraie erreur, pas une redirection
            return response()->json(['message' => StoreDesign::errorsOf($e), 'errors' => $e->errors()], 422);
        }
        $store->forceFill(['design_draft' => $design])->save();

        return response()->json(['saved' => true]);
    }

    /** Publie le brouillon : la version en ligne passe dans l'historique. */
    public function publish(Request $request): RedirectResponse
    {
        abort_unless(TemplatesRollout::openTo($request->user()), 403);
        $store = $request->user()->ensureStore();
        $design = $this->validated($request);
        if ($store->design_engine && $store->design) {
            StoreDesignVersion::create(['store_id' => $store->id, 'design' => $store->design]);
            $old = StoreDesignVersion::where('store_id', $store->id)->latest('id')->skip(StoreDesignVersion::KEEP)->take(100)->pluck('id');
            StoreDesignVersion::whereIn('id', $old)->delete();
        }
        StoreDesign::publish($store, $design);
        $store->forceFill([
            'design_engine' => true,
            'is_configured' => true,
            // Réglages d'origine alignés (pages qui les lisent encore)
            'theme_color' => $design['style']['primary'],
            'pattern' => $design['pattern']['key'] ?? 'none',
        ])->save();

        return back()->with('success', 'Votre vitrine est publiée.');
    }

    /** Revient à une version publiée précédemment (elle est republiée tout de suite). */
    public function restore(Request $request, StoreDesignVersion $version): RedirectResponse
    {
        $store = $request->user()->ensureStore();
        abort_unless($version->store_id === $store->id, 404);
        if ($store->design) {
            StoreDesignVersion::create(['store_id' => $store->id, 'design' => $store->design]);
        }
        StoreDesign::publish($store, $version->design);
        $store->forceFill(['design_engine' => true, 'theme_color' => $version->design['style']['primary']])->save();
        $version->delete();

        return back()->with('success', 'La version précédente est de nouveau en ligne.');
    }

    /** Étape 1 : l'activité décide des 3 templates proposés et des motifs. */
    public function activity(Request $request): RedirectResponse
    {
        $validated = $request->validate(['business_type' => ['required', \Illuminate\Validation\Rule::in(BusinessTypes::keys())]]);
        $request->user()->ensureStore()->forceFill([
            'business_type' => $validated['business_type'],
            'category' => BusinessTypes::get($validated['business_type'])['label'],
        ])->save();

        return back();
    }

    /** Photo d'une section (accueil, histoire…) : optimisée comme les photos de produits. */
    public function image(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), ['image' => ['required', 'image', 'max:6144']], ['image.*' => 'Choisissez une photo de 6 Mo au plus.']);
        if ($v->fails()) {
            return response()->json(['message' => $v->errors()->first(), 'errors' => $v->errors()], 422);
        }

        return response()->json(['path' => '/storage/'.ImageUpload::store($request->file('image'), 'designs')]);
    }

    private function validated(Request $request): array
    {
        $design = $request->input('design');
        if (! is_array($design)) {
            throw ValidationException::withMessages(['design' => 'Vitrine manquante.']);
        }

        return StoreDesign::validate($design);
    }

    /** Brouillon, sinon vitrine publiée, sinon « Classique » aux couleurs de la boutique (point de départ). */
    private function current($store, string $column): array
    {
        if (is_array($store->{$column}) && ! empty($store->{$column}['sections'])) {
            return $store->{$column};
        }
        if ($store->design_engine && is_array($store->design)) {
            return $store->design;
        }
        $design = StoreTemplates::get('classique')['design'];
        if (preg_match('/^#[0-9A-Fa-f]{6}$/', (string) $store->theme_color)) {
            $design['style']['primary'] = strtoupper($store->theme_color);
        }
        $design['pattern']['key'] = in_array($store->pattern, BusinessTypes::patterns(), true) && $store->pattern !== 'none' ? $store->pattern : null;

        return $design;
    }

    private function versions($store): array
    {
        return StoreDesignVersion::where('store_id', $store->id)->latest('id')->take(StoreDesignVersion::KEEP)->get()
            ->map(fn ($v) => ['id' => $v->id, 'template' => StoreTemplates::get($v->design['template'] ?? '')['name'] ?? $v->design['template'] ?? '', 'at' => $v->created_at->toIso8601String()])
            ->all();
    }
}
