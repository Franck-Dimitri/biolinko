<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Support\ImageUpload;
use App\Support\StoreSlug;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $store = $request->user()->store;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => StoreSlug::rules($store),
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'about_text' => ['nullable', 'string'],
            'logo_url' => ['nullable', 'string'],
            'banner_url' => ['nullable', 'string'],
            'logo_file' => ['nullable', 'image', 'max:5120'],
            'banner_file' => ['nullable', 'image', 'max:5120'],
            'theme_color' => ['required', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'phone_whatsapp' => ['nullable', 'string', 'max:50'],
            'city_location' => ['nullable', 'string', 'max:255'],
            'opening_hours' => ['nullable', 'string', 'max:255'],
            'announcement_header' => ['nullable', 'string', 'max:255'],
            'instagram_link' => ['nullable', 'url', 'max:255'],
            'tiktok_link' => ['nullable', 'url', 'max:255'],
            'facebook_link' => ['nullable', 'url', 'max:255'],
        ], StoreSlug::messages());

        if ($request->hasFile('logo_file')) {
            $logoPath = ImageUpload::store($request->file('logo_file'), 'stores/logos');
            $validated['logo_url'] = '/storage/'.$logoPath;
        }

        if ($request->hasFile('banner_file')) {
            $bannerPath = ImageUpload::store($request->file('banner_file'), 'stores/banners');
            $validated['banner_url'] = '/storage/'.$bannerPath;
        }

        $validated['is_configured'] = true;

        $store->update($validated);

        return redirect()->back()->with('message', 'Paramètres de la boutique mis à jour avec succès !');
    }

    public function togglePublish(Request $request): RedirectResponse
    {
        $store = $request->user()->store;
        // Pas de boutique vide en ligne : au moins un vrai produit actif avant de publier
        if (! $store->is_published && ! $store->products()->where('is_active', true)->whereNull('example_of')->exists()) {
            return redirect()->back()->with('error', 'Activez au moins un produit avant de publier : vos clients verraient une boutique vide.');
        }
        $store->is_published = ! $store->is_published;
        $store->save();

        $statusMsg = $store->is_published
            ? 'Félicitations ! Votre boutique est désormais officielle et publiée en ligne !'
            : 'Votre boutique a été repassée en mode brouillon (masquée du public).';

        return redirect()->back()->with('message', $statusMsg);
    }
}
