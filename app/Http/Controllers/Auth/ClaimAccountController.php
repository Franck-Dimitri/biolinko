<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ManagedAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

/** Le vendeur ouvre son lien d'accès : il choisit son mot de passe, accepte les conditions et prend la main. */
class ClaimAccountController extends Controller
{
    public function show(Request $request, User $user): Response|RedirectResponse
    {
        if (! ManagedAccount::validNonce($user, $request->query('cle'))) {
            return redirect()->route('login')->with('error', 'Ce lien d’accès n’est plus valable. Demandez-en un nouveau à l’équipe Biolinko, ou utilisez « Mot de passe oublié ».');
        }

        return Inertia::render('Auth/ClaimAccount', [
            'name' => $user->name,
            'email' => $user->email,
            'storeName' => $user->store?->name,
            'action' => $request->fullUrl(),
        ]);
    }

    public function store(Request $request, User $user): RedirectResponse
    {
        if (! ManagedAccount::validNonce($user, $request->query('cle'))) {
            return redirect()->route('login')->with('error', 'Ce lien d’accès n’est plus valable. Demandez-en un nouveau à l’équipe Biolinko.');
        }

        $request->validate([
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'terms' => ['accepted'],
        ], [
            'password.confirmed' => 'Les deux mots de passe ne correspondent pas.',
            'terms.accepted' => 'Vous devez accepter les conditions d’utilisation et la politique de confidentialité.',
        ]);

        $user->forceFill(['password' => Hash::make($request->password), 'terms_accepted_at' => now()])->save();
        ManagedAccount::markClaimed($user);

        // Une autre session (celle de l'équipe, par exemple) n'a plus accès à ce navigateur
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('seller.dashboard')->with('success', 'Bienvenue sur Biolinko ! Votre boutique est à vous.');
    }
}
