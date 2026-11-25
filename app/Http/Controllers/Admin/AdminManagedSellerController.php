<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Payments\Countries;
use App\Support\BusinessTypes;
use App\Support\ManagedAccount;
use App\Support\PilotOffer;
use App\Support\StoreSlug;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Boutiques créées par l'équipe pour un vendeur : création du compte, configuration de la boutique
 * à sa place, puis lien d'accès pour qu'il choisisse son mot de passe et prenne la main.
 */
class AdminManagedSellerController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'phone_whatsapp' => ['required', 'string', 'max:50', function ($attr, $value, $fail) {
                try {
                    Countries::formatPhone('CM', (string) $value);
                } catch (\InvalidArgumentException $e) {
                    $fail('Entrez un numéro WhatsApp camerounais valide (9 chiffres, ex. 6XX XX XX XX).');
                }
            }],
            'store_name' => ['required', 'string', 'max:60'],
            'store_slug' => StoreSlug::rules(),
            'business_type' => ['required', 'in:'.implode(',', BusinessTypes::keys())],
            'pilot' => ['boolean'],
        ], StoreSlug::messages('store_slug') + ['email.unique' => 'Un compte existe déjà avec cette adresse e-mail.']);

        $user = DB::transaction(function () use ($data, $request) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone_whatsapp' => '+'.Countries::formatPhone('CM', (string) $data['phone_whatsapp']),
                'role' => 'seller',
                'plan' => 'starter',
                // Mot de passe inconnu de tous : le vendeur choisit le sien avec son lien d'accès
                'password' => Hash::make(Str::random(48)),
                'managed_by' => $request->user()->id,
            ]);
            $user->forceFill(['email_verified_at' => now()])->save();
            $user->ensureStore($data['store_slug'], trim($data['store_name']))->update(['business_type' => $data['business_type']]);

            return $user;
        });

        if ($request->boolean('pilot', true)) {
            PilotOffer::start($user);
        }
        Log::info('Boutique gérée créée', ['admin_id' => $request->user()->id, 'user_id' => $user->id]);

        return redirect()->route('admin.users.show', $user)->with('success', "Compte et boutique de {$user->name} créés. Configurez la boutique, puis envoyez-lui son lien d’accès.");
    }

    /** L'admin ouvre l'espace du vendeur pour configurer sa boutique (tant que le vendeur n'a pas pris la main). */
    public function configure(Request $request, User $user): RedirectResponse
    {
        if (! $user->isManaged() || $user->isAdmin()) {
            return back()->with('error', 'Ce vendeur a pris la main sur son compte : lui seul peut le modifier désormais.');
        }

        $admin = $request->user();
        Auth::login($user);
        $request->session()->put(ManagedAccount::SESSION_KEY, $admin->id);
        Log::info('Configuration d’une boutique gérée', ['admin_id' => $admin->id, 'user_id' => $user->id]);

        return redirect()->route('seller.dashboard');
    }

    /** Nouveau lien d'accès (7 jours, un seul usage) : l'ancien ne marche plus. */
    public function accessLink(User $user): RedirectResponse
    {
        if (! $user->isManaged()) {
            return back()->with('error', 'Ce vendeur a déjà pris la main sur son compte.');
        }

        return back()->with('access_link', ManagedAccount::accessLink($user));
    }
}
