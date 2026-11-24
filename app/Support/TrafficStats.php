<?php

namespace App\Support;

use App\Models\Order;
use App\Models\PageVisit;
use Illuminate\Support\Facades\DB;

/**
 * Chiffres de fréquentation pour une période : visiteurs uniques (par jour), pages vues,
 * pays, sources, appareils, pages et conversion en commandes payées.
 * $scope : 'all' (toute la plateforme), 'site' (pages Biolinko) ou un identifiant de boutique.
 */
class TrafficStats
{
    public static function summary(int|string $scope, int $days = 30): array
    {
        $from = now()->subDays($days - 1)->startOfDay();
        // Visiteur unique = même empreinte le même jour (expression compatible MySQL et SQLite)
        $key = fn (string $t = '') => DB::getDriverName() === 'sqlite' ? "{$t}day || {$t}visitor" : "CONCAT({$t}day, {$t}visitor)";
        $q = fn () => PageVisit::query()->where('day', '>=', $from->toDateString())
            ->when($scope === 'site', fn ($x) => $x->whereNull('store_id'))
            ->when(is_int($scope), fn ($x) => $x->where('store_id', $scope));

        $visitors = fn ($query) => (int) $query->select(DB::raw('COUNT(DISTINCT '.$key().') as n'))->value('n');
        $group = fn (string $col, int $limit) => $q()->select($col, DB::raw('COUNT(DISTINCT '.$key().') as visitors'))
            ->groupBy($col)->orderByDesc('visitors')->limit($limit)->get()->map(fn ($r) => ['key' => $r->{$col}, 'visitors' => (int) $r->visitors])->all();

        $daily = $q()->select('day', DB::raw('COUNT(*) as views'), DB::raw('COUNT(DISTINCT visitor) as visitors'))->groupBy('day')->get()->keyBy(fn ($r) => $r->day->toDateString());
        $series = collect(range($days - 1, 0))->map(function ($i) use ($daily) {
            $d = now()->subDays($i)->toDateString();

            return ['date' => $d, 'views' => (int) ($daily[$d]->views ?? 0), 'visitors' => (int) ($daily[$d]->visitors ?? 0)];
        })->values()->all();

        $totalVisitors = $visitors($q());
        $paid = $scope === 'site' ? 0 : Order::query()->where('payment_status', 'paid')->where('paid_at', '>=', $from)
            ->when(is_int($scope), fn ($x) => $x->where('store_id', $scope))->count();

        $out = [
            'days' => $days,
            'visitors' => $totalVisitors,
            'views' => $q()->count(),
            'paid_orders' => $paid,
            'conversion' => $totalVisitors > 0 && $scope !== 'site' ? round($paid / $totalVisitors * 100, 1) : null,
            'series' => $series,
            'countries' => $group('country', 8),
            'sources' => $group('source', 7),
            'devices' => $group('device', 3),
            'pages' => $group('page', 5),
        ];

        if ($scope === 'all') {
            $out['stores'] = PageVisit::query()->where('page_visits.day', '>=', $from->toDateString())->whereNotNull('store_id')
                ->join('stores', 'stores.id', '=', 'page_visits.store_id')
                ->select('stores.name', 'stores.slug', DB::raw('COUNT(DISTINCT '.$key('page_visits.').') as visitors'), DB::raw('COUNT(*) as views'))
                ->groupBy('stores.id', 'stores.name', 'stores.slug')->orderByDesc('visitors')->limit(10)->get()
                ->map(fn ($r) => ['name' => $r->name, 'slug' => $r->slug, 'visitors' => (int) $r->visitors, 'views' => (int) $r->views])->all();
        }

        return $out;
    }
}
