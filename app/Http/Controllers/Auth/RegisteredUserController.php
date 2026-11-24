<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Payments\Countries;
use App\Support\PlanIntent;
use App\Support\ShopIntent;
use App\Support\StoreSlug;
use App\Support\TemplateIntent;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(Request $request): Response
    {
        $shop = ShopIntent::remember($request);
        $template = TemplateIntent::remember($request);

        return Inertia::render('Auth/Register', [
            'intendedPlan' => PlanIntent::remember($request),
            'intendedShop' => $shop ? ['slug' => $shop, 'available' => ShopIntent::isAvailable($shop)] : null,
            'intendedTemplate' => $template ? ['id' => $template['id'], 'name' => $template['name']] : null,
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            // Le vendeur (nom complet) et sa boutique (nom + adresse <adresse>.biolinko.store) sont distincts
            'name' => 'required|string|max:255',
            'store_name' => ['required', 'string', 'max:60'],
            'store_slug' => StoreSlug::rules(),
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            // WhatsApp obligatoire : alertes de ventes, assistance et suivi du compte
            'phone_whatsapp' => ['required', 'string', 'max:50', function ($attr, $value, $fail) {
                try {
                    Countries::formatPhone('CM', (string) $value);
                } catch (\InvalidArgumentException $e) {
                    $fail('Entrez un numéro WhatsApp camerounais valide (9 chiffres, ex. 6XX XX XX XX).');
                }
            }],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'terms' => ['accepted'],
        ], StoreSlug::messages('store_slug') + [
            'name.required' => 'Indiquez votre nom complet.',
            'password.confirmed' => 'Les deux mots de passe ne correspondent pas.',
            'store_name.required' => 'Donnez un nom à votre boutique.',
            'store_slug.required' => 'Choisissez l’adresse de votre boutique.',
            'phone_whatsapp.required' => 'Votre numéro WhatsApp est obligatoire : il sert à vous alerter de vos ventes.', 'terms.accepted' => 'Vous devez accepter les conditions d’utilisation et la politique de confidentialité.']);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_whatsapp' => '+'.Countries::formatPhone('CM', (string) $request->phone_whatsapp),
            'role' => 'seller',
            'plan' => 'starter',
            'password' => Hash::make($request->password),
        ]);
        $user->forceFill(['terms_accepted_at' => now()])->save();

        $request->session()->forget(ShopIntent::SESSION_KEY);
        $user->ensureStore($request->store_slug, trim($request->store_name));

        // Le listener Registered appelle sendEmailVerificationNotification() → envoi de l'OTP
        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('verification.notice');
    }
}
