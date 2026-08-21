<?php

namespace App\Http\Controllers;

use App\Models\StoreReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $store = $user->store()->with('reviews')->first();

        return Inertia::render('Appearance/Index', [
            'store' => $store,
            'reviews' => $store ? $store->reviews : [],
            'appUrl' => config('app.url', 'http://localhost:8000'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $store = $request->user()->store;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'alpha_dash', 'unique:stores,slug,' . $store->id],
            'category' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'about_text' => ['nullable', 'string'],
            'theme_color' => ['required', 'string', 'max:20'],
            'accent_color' => ['nullable', 'string', 'max:20'],
            'font_family' => ['nullable', 'string', 'max:50'],
            'border_radius_style' => ['nullable', 'string', 'max:20'],
            'theme_mode' => ['nullable', 'string', 'max:20'],
            'phone_whatsapp' => ['nullable', 'string', 'max:50'],
            'city_location' => ['nullable', 'string', 'max:255'],
            'opening_hours' => ['nullable', 'string', 'max:255'],
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
        ]);

        if ($request->hasFile('logo_file')) {
            $path = $request->file('logo_file')->store('logos', 'public');
            $validated['logo_url'] = '/storage/' . $path;
        }

        if ($request->hasFile('banner_file')) {
            $path = $request->file('banner_file')->store('banners', 'public');
            $validated['banner_url'] = '/storage/' . $path;
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

        $store->update($validated);

        return redirect()->back()->with('message', 'Paramètres d\'apparence mis à jour avec succès !');
    }

    public function storeReview(Request $request): RedirectResponse
    {
        $store = $request->user()->store;

        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_city' => ['nullable', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string'],
            'is_verified' => ['boolean'],
            'is_featured' => ['boolean'],
        ]);

        $store->reviews()->create($validated);

        return redirect()->back()->with('message', 'Avis client ajouté avec succès !');
    }

    public function toggleReviewFeatured(StoreReview $review): RedirectResponse
    {
        $store = request()->user()->store;
        if ($review->store_id !== $store->id) {
            abort(403);
        }

        $review->update(['is_featured' => !$review->is_featured]);

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
