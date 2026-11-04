<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\PlanIntent;
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
        return Inertia::render('Auth/Register', [
            'intendedPlan' => PlanIntent::remember($request),
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            // WhatsApp obligatoire : alertes de ventes, assistance et suivi du compte
            'phone_whatsapp' => ['required', 'string', 'max:50', function ($attr, $value, $fail) {
                try {
                    \App\Payments\Countries::formatPhone('CM', (string) $value);
                } catch (\InvalidArgumentException $e) {
                    $fail('Entrez un numéro WhatsApp camerounais valide (9 chiffres, ex. 6XX XX XX XX).');
                }
            }],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'terms' => ['accepted'],
        ], ['phone_whatsapp.required' => 'Votre numéro WhatsApp est obligatoire : il sert à vous alerter de vos ventes.', 'terms.accepted' => 'Vous devez accepter les conditions d’utilisation et la politique de confidentialité.']);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone_whatsapp' => '+'.\App\Payments\Countries::formatPhone('CM', (string) $request->phone_whatsapp),
            'role' => 'seller',
            'plan' => 'starter',
            'password' => Hash::make($request->password),
        ]);
        $user->forceFill(['terms_accepted_at' => now()])->save();

        $user->ensureStore();

        // Le listener Registered appelle sendEmailVerificationNotification() → envoi de l'OTP
        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('verification.notice');
    }
}
