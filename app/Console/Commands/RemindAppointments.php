<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\Whatsapp\WhatsappGatewayService;
use App\Support\OpeningHours;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * Rappel WhatsApp la veille : commandes payées prévues pour demain (gâteau, tenue, prestation…).
 * Un seul rappel par commande ; lancé chaque soir à 18 h, heure du Cameroun.
 */
class RemindAppointments extends Command
{
    protected $signature = 'orders:remind-tomorrow';

    protected $description = 'Rappelle aux clients leur commande ou leur rendez-vous du lendemain';

    private const SLOTS = ['matin' => ', le matin', 'midi' => ', à midi', 'apres-midi' => ', l’après-midi', 'soir' => ', le soir'];

    public function handle(WhatsappGatewayService $whatsapp): int
    {
        if (! WhatsappGatewayService::automatic()) {
            $this->info('Notifications WhatsApp en veille, aucun rappel envoyé.');

            return self::SUCCESS;
        }

        $tomorrow = now(OpeningHours::TIMEZONE)->addDay()->toDateString();
        $sent = 0;
        Order::with('store')
            ->where('payment_status', 'paid')
            ->whereIn('status', ['paid', 'in_delivery'])
            ->whereDate('desired_date', $tomorrow)
            ->whereNull('reminder_sent_at')
            ->whereNull('parent_order_id') // un ajout part avec sa commande : un seul rappel
            ->chunkById(100, function ($orders) use ($whatsapp, &$sent) {
                foreach ($orders as $order) {
                    $order->update(['reminder_sent_at' => now()]);
                    $when = Carbon::parse($order->desired_date)->locale('fr')->translatedFormat('l j F')
                        .(self::SLOTS[$order->desired_slot] ?? '');
                    try {
                        $whatsapp->notifyAppointmentReminder($order, $when);
                        $sent++;
                    } catch (\Throwable $e) {
                        report($e);
                    }
                }
            });

        $this->info("{$sent} rappel(s) envoyé(s).");

        return self::SUCCESS;
    }
}
