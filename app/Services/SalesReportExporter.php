<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Store;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Export CSV du rapport de ventes d'une boutique (1 ligne = 1 commande).
 * Format pensé pour Excel FR : séparateur ";", UTF-8 avec BOM, montants entiers en FCFA.
 */
class SalesReportExporter
{
    /** Statuts comptés comme ventes réelles (argent encaissé). */
    public const SALES_STATUSES = ['paid', 'in_delivery', 'delivered'];

    public const STATUS_LABELS = [
        'pending' => 'En attente de paiement',
        'paid' => 'Payée',
        'in_delivery' => 'En livraison',
        'delivered' => 'Livrée',
        'cancelled' => 'Annulée',
        'failed' => 'Échouée',
    ];

    private const HEADERS = [
        'Date commande',
        'N° commande',
        'Statut',
        'Client',
        'Téléphone',
        'Ville',
        'Articles',
        'Quantité totale',
        'Montant vendeur (FCFA)',
        'Frais de service (FCFA)',
        'Total payé client (FCFA)',
        'Opérateur',
        'Date paiement',
        'Type',
    ];

    public function query(Store $store, CarbonInterface $from, CarbonInterface $to, string $scope = 'sales'): Builder
    {
        return Order::query()
            ->with('items')
            ->where('store_id', $store->id)
            ->whereBetween('created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->when($scope === 'sales', fn (Builder $q) => $q->whereIn('status', self::SALES_STATUSES))
            ->orderBy('created_at');
    }

    public function download(Store $store, CarbonInterface $from, CarbonInterface $to, string $scope = 'sales'): StreamedResponse
    {
        $filename = sprintf(
            'ventes-%s-%s_%s.csv',
            $store->slug ?: 'boutique',
            $from->format('Y-m-d'),
            $to->format('Y-m-d')
        );

        return response()->streamDownload(function () use ($store, $from, $to, $scope) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM : accents corrects dans Excel

            fputcsv($out, self::HEADERS, ';');

            $totals = ['orders' => 0, 'quantity' => 0, 'vendor' => 0, 'fees' => 0, 'client' => 0];

            // lazy() lit par paquets : mémoire constante même avec des milliers de commandes
            foreach ($this->query($store, $from, $to, $scope)->lazy(500) as $order) {
                $row = $this->row($order);
                fputcsv($out, $row, ';');

                $totals['orders']++;
                $totals['quantity'] += $row[7];
                $totals['vendor'] += $row[8];
                $totals['fees'] += $row[9];
                $totals['client'] += $row[10];
            }

            fputcsv($out, [], ';');
            fputcsv($out, [
                'TOTAL', $totals['orders'].' commande(s)', '', '', '', '', '',
                $totals['quantity'], $totals['vendor'], $totals['fees'], $totals['client'], '', '', '',
            ], ';');

            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store',
        ]);
    }

    private function row(Order $order): array
    {
        $articles = $order->items
            ->map(fn ($item) => $item->quantity.'× '.$item->product_title.($item->variant_label ? ' ('.$item->variant_label.')' : ''))
            ->implode(' | ');

        $vendor = (int) round((float) $order->price_vendor);
        $client = (int) round((float) $order->total_client);

        return [
            $order->created_at?->format('d/m/Y H:i'),
            $order->tracking_code,
            self::STATUS_LABELS[$order->status] ?? $order->status,
            $this->safe($order->customer_name),
            $this->safe($order->customer_phone),
            $this->safe($order->city),
            $this->safe($articles),
            (int) $order->items->sum('quantity'),
            $vendor,
            max(0, $client - $vendor),
            $client,
            $order->payment_operator ?? '',
            $order->paid_at?->format('d/m/Y H:i') ?? '',
            $order->is_manual ? 'Manuelle' : 'En ligne',
        ];
    }

    /**
     * Protège contre l'injection de formules Excel (un client nommé "=HYPERLINK(...)").
     */
    private function safe(?string $value): string
    {
        $value = (string) $value;

        return $value !== '' && in_array($value[0], ['=', '+', '-', '@', "\t", "\r"], true)
            ? "'".$value
            : $value;
    }
}
