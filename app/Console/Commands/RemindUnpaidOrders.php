<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\WhatsappGatewayService;
use Illuminate\Console\Command;

/**
 * Relance automatique des paniers (plan Growth et plus) : un seul rappel WhatsApp par commande non payée,
 * envoyé au moins une heure après la commande et avant son annulation automatique (24 h).
 */
class RemindUnpaidOrders extends Command
{
    protected $signature = 'orders:remind-unpaid {--after=60 : Minutes avant le rappel}';

    protected $description = 'Envoie un rappel WhatsApp aux clients dont la commande attend encore le paiement';

    public function handle(WhatsappGatewayService $whatsapp): int
    {
        $sent = 0;

        Order::with('store.user')
            ->where('payment_status', 'pending')
            ->where('status', 'pending')
            ->whereNull('payment_reminded_at')
            ->where(fn ($q) => $q->where('is_manual', false)->orWhereNull('is_manual'))
            ->whereBetween('created_at', [now()->subHours(20), now()->subMinutes((int) $this->option('after'))])
            ->chunkById(100, function ($orders) use ($whatsapp, &$sent) {
                foreach ($orders as $order) {
                    $store = $order->store;
                    if (! $store?->is_published || ! $store->user || $store->user->is_banned || ! $store->user->hasPlan('growth')) {
                        continue;
                    }

                    // Marqué avant l'envoi : jamais deux rappels, même si la passerelle répond mal
                    $order->update(['payment_reminded_at' => now()]);

                    try {
                        $result = $whatsapp->send1ClickReminder($order);
                        if ($result['success'] ?? false) {
                            $sent++;
                        }
                    } catch (\Throwable $e) {
                        report($e);
                    }
                }
            });

        $this->info("{$sent} rappel(s) envoyé(s).");

        return self::SUCCESS;
    }
}
