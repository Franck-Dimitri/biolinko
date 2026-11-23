<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Store;
use App\Support\BusinessTypes;
use App\Support\OpeningHours;
use App\Support\StoreTemplates;
use App\Support\TemplatesRollout;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Mesures de lancement par template : boutiques, visites, ajouts au panier, commandes payées
 * et chiffre d'affaires sur la période, pour décider quand ouvrir chaque activité à tous.
 */
class AdminTemplateController extends Controller
{
    public const PERIODS = [7, 30, 90];

    public function index(Request $request): Response
    {
        $days = in_array((int) $request->query('jours'), self::PERIODS, true) ? (int) $request->query('jours') : 30;
        $since = now(OpeningHours::TIMEZONE)->subDays($days - 1)->toDateString();

        $traffic = DB::table('template_stats')->where('day', '>=', $since)
            ->groupBy('template')->select('template', DB::raw('SUM(views) as views'), DB::raw('SUM(carts) as carts'))->get()->keyBy('template');
        $sales = Order::paid()->where('paid_at', '>=', now()->subDays($days))->whereNotNull('design_template')
            ->groupBy('design_template')->select('design_template', DB::raw('COUNT(*) as orders'), DB::raw('SUM(price_vendor) as revenue'))->get()->keyBy('design_template');
        $stores = Store::where('design_engine', true)->pluck('design')->map(fn ($d) => $d['template'] ?? null)->filter()->countBy();
        $legacy = Store::where(fn ($q) => $q->where('design_engine', false)->orWhereNull('design_engine'))->count();

        $rows = collect(StoreTemplates::all())->map(function ($t, $id) use ($traffic, $sales, $stores, $legacy) {
            $type = $t['business_types'][0] ?? '*';
            $views = (int) ($traffic[$id]->views ?? 0);
            $orders = (int) ($sales[$id]->orders ?? 0);

            return [
                'id' => $id,
                'name' => $t['name'],
                'activity' => $type === '*' ? 'Toutes (apparence d’origine)' : BusinessTypes::get($type)['label'],
                'activityKey' => $type,
                'stores' => (int) ($stores[$id] ?? 0) + ($id === 'classique' ? $legacy : 0),
                'views' => $views,
                'carts' => (int) ($traffic[$id]->carts ?? 0),
                'orders' => $orders,
                'revenue' => (float) ($sales[$id]->revenue ?? 0),
                'conversion' => $views > 0 ? round($orders / $views * 100, 1) : null,
            ];
        })->sortByDesc(fn ($r) => [$r['orders'], $r['views']])->values();

        return Inertia::render('Admin/Templates/Index', [
            'rows' => $rows,
            'days' => $days,
            'periods' => self::PERIODS,
            'rollout' => ['mode' => TemplatesRollout::mode(), 'activities' => TemplatesRollout::activities()],
            'totals' => ['views' => $rows->sum('views'), 'carts' => $rows->sum('carts'), 'orders' => $rows->sum('orders'), 'revenue' => $rows->sum('revenue')],
        ]);
    }
}
