<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

/**
 * Soumet à Meta les modèles WhatsApp utilisés par Biolinko (WhatsappGatewayService) et affiche leur statut.
 * Un modèle déjà existant n'est pas recréé.
 */
class SyncWhatsappTemplates extends Command
{
    protected $signature = 'whatsapp:sync-templates {--status : Affiche seulement le statut des modèles}';

    protected $description = 'Crée les modèles WhatsApp Biolinko sur le compte Meta et affiche leur validation';

    public function handle(): int
    {
        $waba = config('services.whatsapp_cloud.business_account_id');
        $token = config('services.whatsapp_cloud.token');
        if (! $waba || ! $token) {
            $this->error('WHATSAPP_CLOUD_TOKEN et WHATSAPP_CLOUD_BUSINESS_ACCOUNT_ID sont requis.');

            return self::FAILURE;
        }

        $url = 'https://graph.facebook.com/'.config('services.whatsapp_cloud.version').'/'.$waba.'/message_templates';
        $existing = collect(Http::withToken($token)->get($url, ['fields' => 'name,status,language,rejected_reason', 'limit' => 200])->json('data', []))
            ->keyBy('name');

        if (! $this->option('status')) {
            foreach ($this->templates() as $tpl) {
                if ($existing->has($tpl['name'])) {
                    continue;
                }
                $res = Http::withToken($token)->post($url, $tpl);
                $res->successful()
                    ? $this->info("Soumis : {$tpl['name']}")
                    : $this->error("Refusé : {$tpl['name']} — ".($res->json('error.error_user_msg') ?? $res->json('error.message')));
            }
            $existing = collect(Http::withToken($token)->get($url, ['fields' => 'name,status,language,rejected_reason', 'limit' => 200])->json('data', []))->keyBy('name');
        }

        $this->table(['Modèle', 'Statut', 'Motif'], collect($this->templates())->map(fn ($t) => [
            $t['name'],
            $existing[$t['name']]['status'] ?? 'absent',
            ($existing[$t['name']]['rejected_reason'] ?? 'NONE') === 'NONE' ? '' : $existing[$t['name']]['rejected_reason'],
        ]));

        return self::SUCCESS;
    }

    private function templates(): array
    {
        $base = rtrim(config('services.whatsapp_cloud.public_url'), '/');
        $track = fn (string $label) => ['type' => 'BUTTONS', 'buttons' => [[
            'type' => 'URL', 'text' => $label, 'url' => $base.'/track/{{1}}', 'example' => [$base.'/track/BLK-CMD-AB12CD34EF'],
        ]]];
        $body = fn (string $text, array $example) => ['type' => 'BODY', 'text' => $text, 'example' => ['body_text' => [$example]]];
        $tpl = fn (string $name, string $category, array $components) => ['name' => $name, 'language' => 'fr', 'category' => $category, 'components' => $components];

        return [
            $tpl('biolinko_commande_enregistree', 'UTILITY', [
                $body('Bonjour {{1}}, votre commande {{2}} de {{3}} FCFA chez {{4}} est bien enregistrée. Validez la demande de paiement Mobile Money sur votre téléphone pour la confirmer.',
                    ['Paul', 'BLK-CMD-AB12CD34EF', '10 300', 'Chez Awa']),
                $track('Suivre ma commande'),
            ]),
            $tpl('biolinko_paiement_confirme', 'UTILITY', [
                $body('Bonjour {{1}}, votre paiement de {{2}} FCFA pour la commande {{3}} chez {{4}} est confirmé. Votre commande est en préparation.',
                    ['Paul', '10 300', 'BLK-CMD-AB12CD34EF', 'Chez Awa']),
                $track('Suivre ma commande'),
            ]),
            $tpl('biolinko_suivi_commande', 'UTILITY', [
                $body('Bonjour {{1}}, nous avons une nouvelle concernant votre commande {{2}} passée chez {{3}}. Son statut est désormais : {{4}}. Vous pouvez suivre chaque étape en direct depuis votre page de commande.',
                    ['Paul', 'BLK-CMD-AB12CD34EF', 'Chez Awa', 'en cours de livraison']),
                $track('Voir ma commande'),
            ]),
            $tpl('biolinko_rappel_paiement', 'UTILITY', [
                $body('Bonjour {{1}}, votre commande {{2}} de {{3}} FCFA chez {{4}} vous attend toujours. Vos articles sont réservés : vous pouvez payer en un clic par MTN MoMo ou Orange Money.',
                    ['Paul', 'BLK-CMD-AB12CD34EF', '10 300', 'Chez Awa']),
                $track('Payer ma commande'),
            ]),
            $tpl('biolinko_vente_payee', 'UTILITY', [
                $body('Nouvelle vente sur {{1}} : la commande {{2}} de {{3}} est payée. {{4}} FCFA ont été crédités sur votre portefeuille.',
                    ['Chez Awa', 'BLK-CMD-AB12CD34EF', 'Paul', '10 000']),
                ['type' => 'BUTTONS', 'buttons' => [['type' => 'URL', 'text' => 'Voir mes commandes', 'url' => $base.'/seller/orders']]],
            ]),
            $tpl('biolinko_signalement', 'UTILITY', [
                $body('Un client a signalé un problème sur la commande {{1}} : {{2}}, motif « {{3}} ». Contactez-le au {{4}} pour trouver une solution. La vente reste en attente jusqu’à votre réponse dans Biolinko.',
                    ['BLK-CMD-AB12CD34EF', 'Paul', 'Commande non reçue', '237699887766']),
                ['type' => 'BUTTONS', 'buttons' => [['type' => 'URL', 'text' => 'Répondre', 'url' => $base.'/seller/orders']]],
            ]),
            $tpl('biolinko_moderation', 'UTILITY', [
                $body('Bonjour {{1}}, {{2}} Motif : {{3}}. Pour toute question : support@biolinko.link',
                    ['Awa', 'Votre produit Robe wax a été retiré de la plateforme.', 'photo non conforme']),
            ]),
            $tpl('biolinko_campagne', 'MARKETING', [
                $body('Bonjour {{1}}, {{2}} a un message pour vous : {{3}} Rendez-vous sur la boutique pour en profiter.',
                    ['Paul', 'Chez Awa', 'nouvelle collection disponible, -20 % ce week-end sur toute la boutique.']),
            ]),
        ];
    }
}
