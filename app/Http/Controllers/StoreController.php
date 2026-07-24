<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StoreController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $store = $request->user()->store;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('stores', 'slug')->ignore($store->id)],
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'about_text' => ['nullable', 'string'],
            'logo_url' => ['nullable', 'string'],
            'banner_url' => ['nullable', 'string'],
            'logo_file' => ['nullable', 'image', 'max:5120'],
            'banner_file' => ['nullable', 'image', 'max:5120'],
            'theme_color' => ['required', 'string', 'max:20'],
            'phone_whatsapp' => ['nullable', 'string', 'max:50'],
            'city_location' => ['nullable', 'string', 'max:255'],
            'opening_hours' => ['nullable', 'string', 'max:255'],
            'announcement_header' => ['nullable', 'string', 'max:255'],
            'instagram_link' => ['nullable', 'url', 'max:255'],
            'tiktok_link' => ['nullable', 'url', 'max:255'],
            'facebook_link' => ['nullable', 'url', 'max:255'],
        ]);

        if ($request->hasFile('logo_file')) {
            $logoPath = $request->file('logo_file')->store('stores/logos', 'public');
            $validated['logo_url'] = '/storage/' . $logoPath;
        }

        if ($request->hasFile('banner_file')) {
            $bannerPath = $request->file('banner_file')->store('stores/banners', 'public');
            $validated['banner_url'] = '/storage/' . $bannerPath;
        }

        $validated['is_configured'] = true;

        $store->update($validated);

        return redirect()->back()->with('message', 'Paramètres de la boutique mis à jour avec succès !');
    }
}
