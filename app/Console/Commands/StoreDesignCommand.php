<?php

namespace App\Console\Commands;

use App\Models\Store;
use App\Support\StoreDesign;
use App\Support\StoreTemplates;
use Illuminate\Console\Command;
use Illuminate\Validation\ValidationException;

/**
 * Moteur de vitrine d'une boutique : appliquer un template ou un fichier de vitrine, activer ou couper le moteur.
 * Sans moteur, la boutique garde le template « Classique » calculé depuis ses réglages actuels.
 */
class StoreDesignCommand extends Command
{
    protected $signature = 'store:design
        {slug : Adresse de la boutique}
        {--template= : Appliquer un template (ex. classique)}
        {--from= : Appliquer une vitrine depuis un fichier JSON}
        {--enable : Activer le moteur de vitrine}
        {--disable : Revenir au template Classique calculé depuis les réglages}';

    protected $description = 'Gère la vitrine (moteur de templates) d’une boutique';

    public function handle(): int
    {
        $store = Store::where('slug', $this->argument('slug'))->first();
        if (! $store) {
            $this->error('Boutique introuvable.');

            return self::FAILURE;
        }

        $design = null;
        if ($id = $this->option('template')) {
            $template = StoreTemplates::get($id);
            if (! $template) {
                $this->error("Template « {$id} » introuvable. Disponibles : ".implode(', ', array_keys(StoreTemplates::all())));

                return self::FAILURE;
            }
            $design = $template['design'];
        } elseif ($path = $this->option('from')) {
            if (! is_file($path)) {
                $this->error("Fichier introuvable : {$path}");

                return self::FAILURE;
            }
            $design = json_decode(file_get_contents($path), true);
            if (! is_array($design)) {
                $this->error('Le fichier n’est pas un JSON valide.');

                return self::FAILURE;
            }
        }

        if ($design) {
            try {
                StoreDesign::publish($store, $design);
            } catch (ValidationException $e) {
                $this->error('Vitrine refusée : '.StoreDesign::errorsOf($e));

                return self::FAILURE;
            }
            $this->info("Vitrine « {$store->design['template']} » enregistrée.");
        }

        if ($this->option('enable')) {
            $store->forceFill(['design_engine' => true])->save();
        } elseif ($this->option('disable')) {
            $store->forceFill(['design_engine' => false])->save();
        }

        $active = StoreDesign::forStore($store->refresh());
        $this->line($active
            ? "Moteur actif : la boutique affiche le template « {$active['template']} »."
            : 'Moteur inactif : la boutique affiche « Classique », calculé depuis ses réglages.');

        return self::SUCCESS;
    }
}
