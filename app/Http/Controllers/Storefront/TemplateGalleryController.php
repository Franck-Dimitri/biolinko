<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Support\BusinessTypes;
use App\Support\Seo;
use App\Support\StoreTemplates;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Galerie publique des templates (biolinko.app/templates) : 3 templates par activité, chacun visible
 * en grand avec un contenu d'exemple. Ce contenu n'existe que dans la galerie, jamais dans une boutique.
 */
class TemplateGalleryController extends Controller
{
    public function index(): Response
    {
        $activities = collect(StoreTemplates::byBusinessType())
            ->filter()
            ->map(fn ($templates, $type) => [
                'key' => $type,
                'label' => BusinessTypes::get($type)['label'],
                'templates' => array_map(fn ($t) => [
                    'id' => $t['id'], 'name' => $t['name'], 'pitch' => $t['pitch'], 'who' => $t['who'],
                    'primary' => $t['design']['style']['primary'], 'background' => $t['design']['style']['background'],
                ], $templates),
            ])->values();

        return Inertia::render('Site/Templates/Index', [
            'activities' => $activities,
            'credits' => StoreTemplates::photoCredits(),
        ])->withViewData(['meta' => Seo::page(
            'Templates de boutique en ligne',
            '42 templates de boutique en ligne pensés par métier : pâtisserie, restaurant, mode, beauté, services… Choisissez le vôtre, ajoutez vos produits et encaissez en Mobile Money.',
            '/templates',
        )]);
    }

    public function show(string $template): Response
    {
        $t = StoreTemplates::get($template);
        $type = $t['business_types'][0] ?? null;
        $demo = $type && $type !== '*' ? StoreTemplates::demo($type) : null;
        abort_unless($t && $demo, 404);

        $activity = BusinessTypes::get($type);
        $design = $t['design'];
        // Textes d'exemple dans les sections encore vides (accueil, histoire, étapes, FAQ, appel à commander)
        $fill = ['hero' => $t['preview']['hero'] ?? []] + $demo['settings'];
        $design['sections'] = array_map(function ($s) use ($fill) {
            if (empty((array) ($s['settings'] ?? [])) && isset($fill[$s['type']])) {
                $s['settings'] = array_filter($fill[$s['type']], fn ($v) => $v !== '' && $v !== null);
            }

            return $s;
        }, $design['sections']);

        return Inertia::render('Site/Templates/Show', [
            'template' => ['id' => $t['id'], 'name' => $t['name'], 'pitch' => $t['pitch'], 'activity' => $activity['label'], 'activityKey' => $type],
            'siblings' => array_map(fn ($x) => ['id' => $x['id'], 'name' => $x['name']], StoreTemplates::byBusinessType()[$type] ?? []),
            'store' => [
                'id' => 0, 'slug' => 'exemple', 'name' => $demo['shop'], 'business_type' => $type, 'category' => $activity['label'],
                'city_location' => $demo['city'], 'opening_hours' => $demo['opening_hours'], 'location_address' => $demo['address'],
                'announcement_header' => $demo['announcement'], 'banner_url' => $demo['banner'], 'description' => $demo['about'], 'about_text' => $demo['about'],
                'delivery_zones' => [['name' => $demo['city'], 'fee' => 1000]], 'is_published' => true,
                'template' => ['cta' => $activity['cta'], 'date_label' => $activity['date_label'], 'fulfillment' => $activity['fulfillment'], 'lead_time_hours' => $activity['lead_time_hours'] ?? null],
                'trust' => ['verified' => true, 'since' => null, 'delivered' => 0],
                'reviews' => $demo['reviews'],
                'storefront_design' => $design,
            ],
            'products' => $demo['products'],
            'packs' => $demo['packs'],
        ])->withViewData(['meta' => request()->has('apercu')
            ? Seo::noindex("Template {$t['name']}")
            : Seo::page("Template {$t['name']} pour {$activity['label']}", $t['pitch'].' '.$t['who'], '/templates/'.$t['id'])]);
    }
}
