<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ImageUpload;
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
            'slug' => ['required', 'string', 'regex:/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/', Rule::unique('stores', 'slug')->ignore($store->id), Rule::notIn(User::RESERVED_SLUGS)],
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
        ], ['slug.regex' => 'L’adresse doit faire 3 à 40 caractères : lettres minuscules, chiffres et tirets, sans tiret au début ni à la fin.', 'slug.not_in' => 'Cette adresse est réservée, choisissez-en une autre.']);

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
        $store->is_published = ! $store->is_published;
        $store->save();

        $statusMsg = $store->is_published
            ? 'Félicitations ! Votre boutique est désormais officielle et publiée en ligne !'
            : 'Votre boutique a été repassée en mode brouillon (masquée du public).';

        return redirect()->back()->with('message', $statusMsg);
    }
}
