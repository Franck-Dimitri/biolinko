<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\PilotApplication;
use App\Payments\Countries;
use App\Support\HelpCenter;
use App\Support\Seo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Pages d'information du site public : À propos, Contact, Paiement et sécurité, Centre d'aide,
 * Programme pilote et Mentions légales.
 */
class SiteController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('Site/About')
            ->withViewData(['meta' => Seo::page('À propos', 'Biolinko aide les commerçants du Cameroun à vendre en ligne et à encaisser en Mobile Money, depuis leur téléphone.', '/a-propos')]);
    }

    public function contact(): Response
    {
        return Inertia::render('Site/Contact')
            ->withViewData(['meta' => Seo::page('Contact', 'Une question sur Biolinko ? Écrivez à l’équipe par e-mail ou sur WhatsApp.', '/contact')]);
    }

    public function security(): Response
    {
        return Inertia::render('Site/Security')
            ->withViewData(['meta' => Seo::page('Paiement et sécurité', 'Comment Biolinko protège les paiements Mobile Money des acheteurs et l’argent des vendeurs.', '/paiement-et-securite')]);
    }

    public function help(): Response
    {
        return Inertia::render('Site/Help/Index', ['categories' => HelpCenter::CATEGORIES, 'articles' => HelpCenter::list()])
            ->withViewData(['meta' => Seo::page('Centre d’aide', 'Guides pas à pas pour créer votre boutique Biolinko, vendre, encaisser et retirer votre argent.', '/aide')]);
    }

    public function helpArticle(string $article): Response
    {
        $item = HelpCenter::find($article);
        abort_unless($item, 404);

        $related = collect(HelpCenter::list())->where('category', $item['category'])->where('slug', '!=', $article)->values();

        return Inertia::render('Site/Help/Article', [
            'article' => $item,
            'category' => HelpCenter::CATEGORIES[$item['category']],
            'related' => $related->isNotEmpty() ? $related : collect(HelpCenter::list())->where('slug', '!=', $article)->take(3)->values(),
        ])->withViewData(['meta' => Seo::helpArticle($item)]);
    }

    public function pilot(): Response
    {
        return Inertia::render('Site/Pilot', ['channels' => PilotApplication::CHANNELS, 'volumes' => PilotApplication::VOLUMES])
            ->withViewData(['meta' => Seo::page('Programme pilote', 'Rejoignez les premiers vendeurs Biolinko au Cameroun : boutique installée avec vous et accompagnement personnalisé.', '/programme-pilote')]);
    }

    public function storePilot(Request $request): RedirectResponse
    {
        // Champ piège invisible : rempli seulement par les robots
        if (filled($request->input('website'))) {
            return back()->with('pilot_sent', true);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'business_name' => ['required', 'string', 'max:120'],
            'phone_whatsapp' => ['required', 'string', 'max:30', function ($attr, $value, $fail) {
                try {
                    Countries::formatPhone('CM', (string) $value);
                } catch (\InvalidArgumentException $e) {
                    $fail('Entrez un numéro WhatsApp camerounais valide (9 chiffres, ex. 6XX XX XX XX).');
                }
            }],
            'email' => ['nullable', 'email', 'max:190'],
            'city' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', 'max:120'],
            'channels' => ['nullable', 'array'],
            'channels.*' => ['string', Rule::in(PilotApplication::CHANNELS)],
            'monthly_orders' => ['nullable', 'string', Rule::in(PilotApplication::VOLUMES)],
            'message' => ['nullable', 'string', 'max:1000'],
        ], [], [
            'name' => 'nom', 'business_name' => 'nom de la boutique', 'phone_whatsapp' => 'numéro WhatsApp', 'city' => 'ville', 'category' => 'ce que vous vendez',
        ]);

        $data['phone_whatsapp'] = '+'.Countries::formatPhone('CM', $data['phone_whatsapp']);
        PilotApplication::create($data);

        return back()->with('pilot_sent', true);
    }

    public function legalNotice(): Response
    {
        return Inertia::render('Legal/Notice', ['publisher' => config('biolinko.publisher'), 'host' => config('biolinko.host'), 'contact' => config('biolinko.contact')])
            ->withViewData(['meta' => Seo::page('Mentions légales', 'Éditeur, hébergeur et contact de la plateforme Biolinko.', '/mentions-legales')]);
    }
}
