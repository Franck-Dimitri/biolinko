<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use App\Support\BusinessTypes;
use App\Support\HelpCenter;
use App\Support\IndexNow;
use App\Support\Seo;
use App\Support\StoreTemplates;
use App\Support\StoreUrl;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;

/**
 * Plans du site, robots.txt et llms.txt pour les moteurs de recherche et les assistants IA.
 * Seules les boutiques publiées (vendeur non suspendu) et leurs produits actifs y figurent.
 */
class SeoController extends Controller
{
    /** Robots des moteurs de réponse IA : autorisés explicitement à lire les pages publiques. */
    public const AI_AGENTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'meta-externalagent', 'MistralAI-User'];

    private const PRIVATE_PATHS = ['/seller/', '/admin/', '/dashboard', '/profile', '/track/', '/checkout', '/api/', '/login', '/register', '/*?tab=cart', '/*?apercu'];

    private static function published(): Builder
    {
        return Store::where('is_published', true)->whereHas('user', fn ($q) => $q->where('is_banned', false)->orWhereNull('is_banned'));
    }

    private static function activeProducts(): array
    {
        return ['products' => fn ($q) => $q->where('is_active', true)->select('id', 'store_id', 'slug', 'image_url', 'images', 'title', 'updated_at')];
    }

    public function sitemap(Request $request): Response
    {
        // Domaine d'une boutique (<nom>.biolinko.store) : plan de cette boutique uniquement
        if ($slug = $request->attributes->get('store_host')) {
            return $this->storeSitemap($slug);
        }

        // Boutiques sur leur propre sous-domaine : index qui mène au plan des pages et à celui des boutiques
        if (StoreUrl::enabled()) {
            return $this->respond('<?xml version="1.0" encoding="UTF-8"?>'."\n"
                .'<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n"
                .'  <sitemap><loc>'.e(Seo::url('/sitemap-pages.xml')).'</loc></sitemap>'."\n"
                .'  <sitemap><loc>'.e(Seo::url('/sitemap-boutiques.xml')).'</loc></sitemap>'."\n"
                .'</sitemapindex>');
        }

        return $this->respond(Cache::remember('seo.sitemap', now()->addHour(), fn () => $this->xml([...$this->pageUrls(), ...$this->storeUrls()])));
    }

    public function pagesSitemap(): Response
    {
        return $this->respond(Cache::remember('seo.sitemap.pages', now()->addHour(), fn () => $this->xml($this->pageUrls())));
    }

    /** Toutes les boutiques et leurs produits (adresses sur les sous-domaines, autorisées par leur robots.txt). */
    public function storesSitemap(): Response
    {
        return $this->respond(Cache::remember('seo.sitemap.boutiques', now()->addHour(), fn () => $this->xml($this->storeUrls())));
    }

    private function pageUrls(): array
    {
        $urls = [[Seo::url('/'), null, '1.0']];
        foreach (['/a-propos' => '0.6', '/contact' => '0.5', '/paiement-et-securite' => '0.6', '/programme-pilote' => '0.6', '/aide' => '0.7', '/templates' => '0.8',
            '/conditions-generales' => '0.2', '/politique-de-confidentialite' => '0.2', '/politique-des-cookies' => '0.2', '/mentions-legales' => '0.2'] as $path => $priority) {
            $urls[] = [Seo::url($path), null, $priority];
        }
        foreach (array_keys(HelpCenter::ARTICLES) as $slug) {
            $urls[] = [Seo::url('/aide/'.$slug), null, '0.6'];
        }
        foreach (StoreTemplates::all() as $id => $template) {
            if (! in_array('*', $template['business_types'], true)) {
                $urls[] = [Seo::url('/templates/'.$id), null, '0.6'];
            }
        }

        return $urls;
    }

    private function storeUrls(): array
    {
        $urls = [];
        static::published()->with(static::activeProducts())->select('id', 'slug', 'name', 'updated_at')
            ->chunk(200, function ($stores) use (&$urls) {
                foreach ($stores as $store) {
                    $last = $store->products->max('updated_at') ?? $store->updated_at;
                    $urls[] = [StoreUrl::home($store), $last > $store->updated_at ? $last : $store->updated_at, '0.8'];
                    foreach ($store->products as $p) {
                        $image = $p->image_url ?: ($p->images[0] ?? null);
                        $urls[] = [StoreUrl::product($store, $p->slug), $p->updated_at, '0.7', $image ? Seo::url($image) : null, $p->title];
                    }
                }
            });

        return $urls;
    }

    private function storeSitemap(string $slug): Response
    {
        $xml = Cache::remember('seo.sitemap.'.$slug, now()->addHour(), function () use ($slug) {
            $store = static::published()->where('slug', $slug)->with(static::activeProducts())->first();
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

        return $this->respond($xml);
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

    private function respond(string $xml): Response
    {
        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function robots(Request $request): Response
    {
        $ai = collect(self::AI_AGENTS)->map(fn ($a) => "User-agent: {$a}")->all();

        if ($slug = $request->attributes->get('store_host')) {
            $private = ['Disallow: /track/', 'Disallow: /checkout', 'Disallow: /*?tab=cart', 'Disallow: /*?apercu'];
            $lines = ['User-agent: *', 'Allow: /', ...$private, '',
                '# Moteurs de réponse IA : bienvenus sur les pages publiques de la boutique', ...$ai, 'Allow: /', ...$private, '',
                'Sitemap: '.StoreUrl::home($slug, '/sitemap.xml'),
                // Plan de toutes les boutiques, hébergé sur le site principal : cette ligne l'autorise pour ce domaine
                ...(StoreUrl::enabled() ? ['Sitemap: '.Seo::url('/sitemap-boutiques.xml')] : []),
            ];

            return $this->text($lines);
        }

        $private = collect(self::PRIVATE_PATHS)->map(fn ($p) => "Disallow: {$p}")->all();
        $lines = [
            'User-agent: *', 'Allow: /', ...$private, '',
            '# Moteurs de réponse IA : bienvenus sur les pages publiques (résumé du site : /llms.txt)', ...$ai, 'Allow: /', ...$private, '',
            'Sitemap: '.Seo::url('/sitemap.xml'),
        ];

        return $this->text($lines);
    }

    /** Résumé lisible par les assistants IA (format llms.txt) : Biolinko, ou la boutique du sous-domaine. */
    public function llms(Request $request): Response
    {
        if ($slug = $request->attributes->get('store_host')) {
            $md = Cache::remember('seo.llms.'.$slug, now()->addHour(), fn () => $this->storeLlms($slug));

            return $md === null ? response('Boutique introuvable.', 404, ['Content-Type' => 'text/plain; charset=UTF-8']) : $this->text([$md]);
        }

        return $this->text([Cache::remember('seo.llms', now()->addHour(), fn () => $this->platformLlms())]);
    }

    private function platformLlms(): string
    {
        $landing = Seo::landing();
        $rates = (array) config('payments.commission_percent');
        $out = ['# Biolinko', '', '> '.$landing['description'], '',
            'Biolinko est une plateforme de commerce en ligne pour les vendeurs du Cameroun. Chaque vendeur a sa boutique à l’adresse <nom>.biolinko.store. Les acheteurs paient en Mobile Money sans installer d’application.', '',
            '## Formules (prix mensuels en FCFA)', ''];
        foreach (User::PLAN_PRICES as $plan => $price) {
            $out[] = '- '.ucfirst($plan).' : '.($price ? number_format($price, 0, ',', ' ').' FCFA par mois' : 'gratuit').(isset($rates[$plan]) ? ", commission de {$rates[$plan]} % par vente" : '');
        }
        $out[] = '- Frais de paiement Mobile Money payés par l’acheteur : '.str_replace('.', ',', (string) config('payments.client_fee_percent')).' %';
        $out = [...$out, '', '## Pages principales', '',
            '- [Accueil]('.Seo::url('/').') : présentation, fonctionnalités et tarifs',
            '- [Paiement et sécurité]('.Seo::url('/paiement-et-securite').') : comment les paiements des acheteurs sont protégés',
            '- [Templates de boutique]('.Seo::url('/templates').') : modèles de boutique par activité',
            '- [Programme pilote]('.Seo::url('/programme-pilote').')',
            '- [À propos]('.Seo::url('/a-propos').')',
            '- [Contact]('.Seo::url('/contact').') : '.Seo::CONTACT_EMAIL,
            '', '## Centre d’aide', ''];
        foreach (HelpCenter::list() as $a) {
            $out[] = "- [{$a['title']}](".Seo::url('/aide/'.$a['slug']).") : {$a['summary']}";
        }
        if (is_file($file = resource_path('data/faq.json'))) {
            $out = [...$out, '', '## Questions fréquentes', ''];
            foreach (json_decode(file_get_contents($file), true) ?: [] as $f) {
                $out[] = "### {$f['q']}";
                $out[] = $f['a'];
                $out[] = '';
            }
        }
        $out = [...$out, '', '## Documents', '',
            '- [Conditions générales]('.Seo::url('/conditions-generales').')',
            '- [Politique de confidentialité]('.Seo::url('/politique-de-confidentialite').')',
            '- [Plan du site]('.Seo::url('/sitemap.xml').')'];

        return implode("\n", $out);
    }

    private function storeLlms(string $slug): ?string
    {
        $store = static::published()->where('slug', $slug)
            ->with(['products' => fn ($q) => $q->where('is_active', true)->latest()->limit(200)])->first();
        if (! $store) {
            return null;
        }
        $activity = $store->business_type ? (BusinessTypes::get($store->business_type)['label'] ?? null) : null;
        $about = Seo::text($store->seo_description ?: ($store->description ?: $store->about_text), 400);
        $out = ["# {$store->name}", '', '> '.($about ?: "Boutique en ligne {$store->name} sur Biolinko."), ''];
        foreach (array_filter([
            'Boutique' => StoreUrl::home($store),
            'Activité' => $activity,
            'Ville' => $store->city_location,
            'Adresse' => $store->location_address,
            'WhatsApp' => $store->phone_whatsapp,
            'Horaires' => $store->opening_hours,
            'Paiement' => 'Mobile Money (MTN MoMo, Orange Money), paiement sécurisé par Biolinko',
        ]) as $label => $value) {
            $out[] = "- {$label} : {$value}";
        }
        $out = [...$out, '', '## Produits', ''];
        foreach ($store->products as $p) {
            $price = (float) ($p->promoActive() ? $p->promo_price : $p->price_vendor);
            $state = $p->fulfillment === 'made_to_order' ? 'sur commande' : ((int) $p->stock > 0 ? 'en stock' : 'épuisé');
            $desc = Seo::text($p->description, 140);
            $out[] = "- [{$p->title}](".StoreUrl::product($store, $p->slug).') : '.Seo::money($price).($p->promoActive() ? ' (promotion)' : '')." · {$state}".($desc ? " · {$desc}" : '');
        }
        if ($store->products->isEmpty()) {
            $out[] = 'Aucun produit en ligne pour le moment.';
        }

        return implode("\n", $out)."\n\nBoutique propulsée par Biolinko (".Seo::url('/').').';
    }

    /** Fichier de clé IndexNow (preuve que Biolinko gère ce domaine). */
    public function indexNowKey(string $key): Response
    {
        abort_unless(IndexNow::key() && hash_equals(IndexNow::key(), $key), 404);

        return $this->text([$key]);
    }

    private function text(array $lines): Response
    {
        return response(implode("\n", $lines)."\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
