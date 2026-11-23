<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Support\HelpCenter;
use App\Support\Seo;
use App\Support\StoreTemplates;
use App\Support\StoreUrl;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

/**
 * Plan du site et robots.txt pour les moteurs de recherche.
 * Seules les boutiques publiées (vendeur non suspendu) et leurs produits actifs y figurent.
 */
class SeoController extends Controller
{
    public function sitemap(Request $request): Response
    {
        // Domaine d'une boutique (<nom>.biolinko.store) : plan de cette boutique uniquement
        if ($slug = $request->attributes->get('store_host')) {
            return $this->storeSitemap($slug);
        }

        $xml = Cache::remember('seo.sitemap', now()->addHour(), function () {
            $urls = [
                [Seo::url('/'), now(), '1.0'],
                [Seo::url('/a-propos'), null, '0.6'],
                [Seo::url('/contact'), null, '0.5'],
                [Seo::url('/paiement-et-securite'), null, '0.6'],
                [Seo::url('/programme-pilote'), null, '0.6'],
                [Seo::url('/aide'), null, '0.7'],
                [Seo::url('/conditions-generales'), null, '0.2'],
                [Seo::url('/politique-de-confidentialite'), null, '0.2'],
                [Seo::url('/mentions-legales'), null, '0.2'],
            ];
            foreach (array_keys(HelpCenter::ARTICLES) as $slug) {
                $urls[] = [Seo::url('/aide/'.$slug), null, '0.6'];
            }
            // Galerie des templates de boutique
            $urls[] = [Seo::url('/templates'), null, '0.8'];
            foreach (StoreTemplates::all() as $id => $template) {
                if (! in_array('*', $template['business_types'], true)) {
                    $urls[] = [Seo::url('/templates/'.$id), null, '0.6'];
                }
            }

            // Les boutiques sur leur propre domaine ont leur propre plan du site
            StoreUrl::enabled() || Store::where('is_published', true)
                ->whereHas('user', fn ($q) => $q->where('is_banned', false)->orWhereNull('is_banned'))
                ->with(['products' => fn ($q) => $q->where('is_active', true)->select('id', 'store_id', 'slug', 'image_url', 'images', 'title', 'updated_at')])
                ->select('id', 'slug', 'name', 'updated_at')
                ->chunk(200, function ($stores) use (&$urls) {
                    foreach ($stores as $store) {
                        $last = $store->products->max('updated_at') ?? $store->updated_at;
                        $urls[] = [Seo::url('/'.$store->slug), $last > $store->updated_at ? $last : $store->updated_at, '0.8'];
                        foreach ($store->products as $p) {
                            $image = $p->image_url ?: ($p->images[0] ?? null);
                            $urls[] = [Seo::url("/{$store->slug}/p/{$p->slug}"), $p->updated_at, '0.7', $image ? Seo::url($image) : null, $p->title];
                        }
                    }
                });

            return $this->xml($urls);
        });

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    private function storeSitemap(string $slug): Response
    {
        $xml = Cache::remember('seo.sitemap.'.$slug, now()->addHour(), function () use ($slug) {
            $store = Store::where('slug', $slug)->where('is_published', true)
                ->whereHas('user', fn ($q) => $q->where('is_banned', false)->orWhereNull('is_banned'))
                ->with(['products' => fn ($q) => $q->where('is_active', true)->select('id', 'store_id', 'slug', 'image_url', 'images', 'title', 'updated_at')])
                ->first();
            if (! $store) {
                return $this->xml([]);
            }
            $urls = [[StoreUrl::home($store), $store->products->max('updated_at') ?? $store->updated_at, '1.0']];
            foreach ($store->products as $p) {
                $image = $p->image_url ?: ($p->images[0] ?? null);
                $urls[] = [StoreUrl::product($store, $p->slug), $p->updated_at, '0.8', $image ? Seo::url($image) : null, $p->title];
            }

            return $this->xml($urls);
        });

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    private function xml(array $urls): string
    {
        $out = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'."\n";
        foreach ($urls as $u) {
            $out .= '  <url><loc>'.e($u[0]).'</loc>'
                .($u[1] ? '<lastmod>'.$u[1]->toAtomString().'</lastmod>' : '')
                .'<priority>'.$u[2].'</priority>'
                .(! empty($u[3]) ? '<image:image><image:loc>'.e($u[3]).'</image:loc><image:title>'.e($u[4]).'</image:title></image:image>' : '')
                ."</url>\n";
        }

        return $out.'</urlset>';
    }

    public function robots(Request $request): Response
    {
        if ($slug = $request->attributes->get('store_host')) {
            $lines = ['User-agent: *', 'Allow: /', 'Disallow: /track/', 'Disallow: /checkout', 'Disallow: /*?tab=cart', '',
                'Sitemap: '.StoreUrl::home($slug, '/sitemap.xml')];

            return response(implode("\n", $lines)."\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
        }

        $lines = [
            'User-agent: *',
            'Allow: /',
            // Espaces privés, tunnel d'achat et pages de commande : rien à indexer
            'Disallow: /seller/',
            'Disallow: /admin/',
            'Disallow: /dashboard',
            'Disallow: /profile',
            'Disallow: /track/',
            'Disallow: /checkout',
            'Disallow: /api/',
            'Disallow: /login',
            'Disallow: /register',
            'Disallow: /*?tab=cart',
            '',
            'Sitemap: '.Seo::url('/sitemap.xml'),
        ];

        return response(implode("\n", $lines)."\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
