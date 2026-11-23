<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\StoreReview;
use App\Models\User;
use App\Support\BusinessTypes;
use App\Support\ImageUpload;
use App\Support\OpeningHours;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    public function index(Request $request): Response
    {
        $store = $request->user()->store()->with(['reviews' => fn ($q) => $q->with('product:id,title')->latest()])->first();
        abort_unless($store, 404);

        return Inertia::render('Appearance/Index', [
            'store' => $store,
            'reviews' => $store->reviews,
            'stats' => [
                'products' => $store->products()->count(),
                'promos' => $store->products()->where('is_promo', true)->count(),
                'packs' => $store->smartLinks()->where('is_active', true)->count(),
            ],
            // Activités proposées : chacune règle le vocabulaire de la vitrine et les produits par défaut
            'businessTypes' => collect(BusinessTypes::all())->map(fn ($t) => [
                'label' => $t['label'], 'made_to_order' => $t['fulfillment'] === 'made_to_order', 'cta' => $t['cta'],
                'style' => $t['style'], 'patterns' => $t['patterns'], 'sections' => $t['sections'], 'benefits' => $t['benefits'], 'hero' => $t['hero'],
            ]),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $store = $request->user()->store;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'regex:/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/', Rule::unique('stores', 'slug')->ignore($store->id), Rule::notIn(User::RESERVED_SLUGS)],
            'category' => ['nullable', 'string', 'max:255'],
            'business_type' => ['nullable', 'in:'.implode(',', BusinessTypes::keys())],
            'description' => ['nullable', 'string'],
            'about_text' => ['nullable', 'string'],
            'theme_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'accent_color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'font_family' => ['nullable', 'in:'.implode(',', BusinessTypes::FONTS)],
            'pattern' => ['nullable', 'in:'.implode(',', BusinessTypes::patterns())],
            'border_radius_style' => ['nullable', 'string', 'max:20'],
            'theme_mode' => ['nullable', 'string', 'max:20'],
            'phone_whatsapp' => ['nullable', 'string', 'max:50'],
            'city_location' => ['nullable', 'string', 'max:255'],
            'opening_hours' => ['nullable', 'string', 'max:255'],
            'opening_schedule' => ['nullable'], // JSON (formulaire multipart) ou tableau, vérifié par OpeningHours::normalize
            'min_order_amount' => ['nullable', 'numeric', 'min:0', 'max:10000000'],
            'announcement_header' => ['nullable', 'string', 'max:255'],
            'instagram_link' => ['nullable', 'string', 'max:255'],
            'tiktok_link' => ['nullable', 'string', 'max:255'],
            'facebook_link' => ['nullable', 'string', 'max:255'],
            'hero_badge_text' => ['nullable', 'string', 'max:255'],
            'hero_title' => ['nullable', 'string', 'max:255'],
            'hero_subtitle' => ['nullable', 'string'],
            'hero_cta_text' => ['nullable', 'string', 'max:255'],
            'benefits_json' => ['nullable'],
            'sections_json' => ['nullable'],
            'location_address' => ['nullable', 'string', 'max:255'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'logo_file' => ['nullable', 'image', 'max:5120'],
            'banner_file' => ['nullable', 'image', 'max:5120'],
        ], ['slug.regex' => 'L’adresse doit faire 3 à 40 caractères : lettres minuscules, chiffres et tirets, sans tiret au début ni à la fin.', 'slug.not_in' => 'Cette adresse est réservée, choisissez-en une autre.']);

        if ($request->hasFile('logo_file')) {
            $path = ImageUpload::store($request->file('logo_file'), 'logos');
            $validated['logo_url'] = '/storage/'.$path;
        }

        if ($request->hasFile('banner_file')) {
            $path = ImageUpload::store($request->file('banner_file'), 'banners');
            $validated['banner_url'] = '/storage/'.$path;
        }

        if ($request->has('sections_json')) {
            $sections = $request->input('sections_json');
            if (is_string($sections)) {
                $sections = json_decode($sections, true);
            }
            if (is_array($sections)) {
                $validated['sections_json'] = array_values(array_map(function ($sec) {
                    if (is_array($sec) && isset($sec['enabled'])) {
                        $sec['enabled'] = filter_var($sec['enabled'], FILTER_VALIDATE_BOOLEAN);
                    }

                    return $sec;
                }, $sections));
            }
        }

        if ($request->has('benefits_json')) {
            $benefits = $request->input('benefits_json');
            if (is_string($benefits)) {
                $benefits = json_decode($benefits, true);
            }
            if (is_array($benefits)) {
                $validated['benefits_json'] = $benefits;
            }
        }

        // Horaires par jour : le texte affiché (« Lun – Sam · 11 h – 23 h ») est déduit des horaires
        if ($request->has('opening_schedule')) {
            $schedule = $request->input('opening_schedule');
            $schedule = OpeningHours::normalize(is_string($schedule) ? json_decode($schedule, true) : $schedule);
            $validated['opening_schedule'] = $schedule;
            if ($schedule) {
                $validated['opening_hours'] = OpeningHours::summary($schedule);
            }
        }
        if (array_key_exists('min_order_amount', $validated)) {
            $validated['min_order_amount'] = (float) $validated['min_order_amount'] > 0 ? (float) $validated['min_order_amount'] : null;
        }

        // La catégorie affichée (vitrine, Google) suit l'activité choisie
        if (! empty($validated['business_type'])) {
            $validated['category'] = BusinessTypes::get($validated['business_type'])['label'];
        }

        $store->update($validated);

        return redirect()->back()->with('message', 'Paramètres d\'apparence mis à jour avec succès !');
    }

    public function toggleReviewFeatured(StoreReview $review): RedirectResponse
    {
        $store = request()->user()->store;
        if ($review->store_id !== $store->id) {
            abort(403);
        }

        $review->update(['is_featured' => ! $review->is_featured]);

        return redirect()->back()->with('message', 'Statut de l\'avis mis à jour !');
    }

    public function destroyReview(StoreReview $review): RedirectResponse
    {
        $store = request()->user()->store;
        if ($review->store_id !== $store->id) {
            abort(403);
        }

        $review->delete();

        return redirect()->back()->with('message', 'Avis client supprimé avec succès !');
    }
}
