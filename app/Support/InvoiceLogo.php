<?php

namespace App\Support;

use App\Models\Store;
use Illuminate\Support\Facades\Storage;

/**
 * Logo de la boutique prêt pour la facture PDF : le moteur PDF lit mal le WebP (format des logos optimisés)
 * et ne sait pas garder les proportions d'une image. On convertit donc en PNG intégré à la facture,
 * redimensionné dans un cadre de 150 × 54 sans déformation, en triple résolution pour rester net à l'impression.
 */
class InvoiceLogo
{
    public const MAX_WIDTH = 150;

    public const MAX_HEIGHT = 54;

    private const SCALE = 3;

    /** @return array{src: string, width: int, height: int}|null */
    public static function for(?Store $store): ?array
    {
        $logo = static::render($store, static::MAX_WIDTH, static::MAX_HEIGHT);

        return $logo ? ['src' => 'data:image/png;base64,'.base64_encode($logo['png']), 'width' => $logo['width'], 'height' => $logo['height']] : null;
    }

    /**
     * Logo des e-mails : PNG publié (Outlook n'affiche pas le WebP, Gmail bloque les images intégrées),
     * créé une fois par logo et réutilisé ensuite.
     *
     * @return array{url: string, width: int, height: int}|null
     */
    public static function forMail(?Store $store, int $maxWidth = 140, int $maxHeight = 48): ?array
    {
        if (! $store?->logo_url || ! static::localPath($store->logo_url)) {
            return null;
        }
        $disk = Storage::disk('public');
        $file = 'logos/mail/'.$store->id.'-'.substr(md5($store->logo_url.$maxWidth.'x'.$maxHeight), 0, 12).'.png';
        $meta = $file.'.json';
        if (! $disk->exists($file) || ! $disk->exists($meta)) {
            $logo = static::render($store, $maxWidth, $maxHeight);
            if (! $logo) {
                return null;
            }
            $disk->put($file, $logo['png']);
            $disk->put($meta, json_encode(['width' => $logo['width'], 'height' => $logo['height']]));
        }
        $size = json_decode((string) $disk->get($meta), true) ?: [];

        return ['url' => Seo::url($disk->url($file)), 'width' => (int) ($size['width'] ?? $maxHeight), 'height' => (int) ($size['height'] ?? $maxHeight)];
    }

    /** PNG redimensionné dans un cadre, sans déformation, en triple résolution. */
    private static function render(?Store $store, int $maxWidth, int $maxHeight): ?array
    {
        $path = static::localPath($store?->logo_url);
        if (! $path || ! function_exists('imagecreatefromstring')) {
            return null;
        }
        $source = @imagecreatefromstring((string) file_get_contents($path));
        if (! $source) {
            return null;
        }

        [$w, $h] = [imagesx($source), imagesy($source)];
        $ratio = min($maxWidth / $w, $maxHeight / $h);
        $width = max(1, (int) round($w * $ratio));
        $height = max(1, (int) round($h * $ratio));

        // Jamais agrandi au-delà de l'original : un petit logo reste net
        $pxW = min($w, $width * static::SCALE);
        $pxH = max(1, (int) round($pxW * $h / $w));
        $canvas = imagecreatetruecolor($pxW, $pxH);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagefill($canvas, 0, 0, imagecolorallocatealpha($canvas, 0, 0, 0, 127));
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $pxW, $pxH, $w, $h);

        ob_start();
        imagepng($canvas, null, 6);

        return ['png' => ob_get_clean(), 'width' => $width, 'height' => $height];
    }

    /** Fichier du logo sur le serveur (« /storage/… » = disque public), ou null s'il est ailleurs ou absent. */
    private static function localPath(?string $url): ?string
    {
        $path = ltrim((string) parse_url((string) $url, PHP_URL_PATH), '/');
        if ($path === '' || str_contains($path, '..')) {
            return null;
        }
        $file = str_starts_with($path, 'storage/') ? Storage::disk('public')->path(substr($path, 8)) : public_path($path);

        return is_file($file) ? $file : null;
    }
}
