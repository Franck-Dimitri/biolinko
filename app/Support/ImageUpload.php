<?php

namespace App\Support;

use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Photos envoyées par les vendeurs (produits, logo, bannière) : converties en WebP, en deux tailles
 * (1600 px et 640 px pour les téléphones), dans un dossier « opt ». La vitrine sert la petite taille
 * aux petits écrans (srcset). Si la photo ne peut pas être traitée, l'original est enregistré tel quel.
 */
class ImageUpload
{
    public const LARGE = 1600;

    public const SMALL = 640;

    private const QUALITY = 82;

    /** Enregistre la photo et renvoie son chemin sur le disque (comme UploadedFile::store). */
    public static function store(UploadedFile $file, string $dir, string $disk = 'public'): string
    {
        try {
            $image = self::read($file->getRealPath());
        } catch (\Throwable) {
            $image = null;
        }
        if (! $image) {
            return $file->store($dir, $disk);
        }

        $name = Str::random(40);
        $path = "{$dir}/opt/{$name}.webp";
        Storage::disk($disk)->put($path, self::encode($image, self::LARGE));
        Storage::disk($disk)->put("{$dir}/opt/{$name}-sm.webp", self::encode($image, self::SMALL));
        imagedestroy($image);

        return $path;
    }

    /** Petite version d'une photo optimisée (même dossier, suffixe -sm). */
    public static function small(string $path): ?string
    {
        return preg_match('#/opt/[A-Za-z0-9]{40}\.webp$#', $path) ? substr($path, 0, -5).'-sm.webp' : null;
    }

    private static function read(string $path): ?GdImage
    {
        if (! function_exists('imagewebp')) {
            return null;
        }
        $info = @getimagesize($path);
        if (! $info || ! self::fitsInMemory($info[0], $info[1])) {
            return null;
        }

        $image = match ($info[2]) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_WEBP => @imagecreatefromwebp($path),
            default => false, // GIF animé, HEIC… : gardés tels quels
        };
        if (! $image) {
            return null;
        }

        // Photos de téléphone : l'orientation est dans les données EXIF, pas dans les pixels
        if ($info[2] === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
            $angle = match ((int) (@exif_read_data($path)['Orientation'] ?? 1)) {
                3 => 180, 6 => -90, 8 => 90, default => 0,
            };
            if ($angle) {
                $image = imagerotate($image, $angle, 0) ?: $image;
            }
        }

        return $image;
    }

    private static function encode(GdImage $image, int $max): string
    {
        $w = imagesx($image);
        $h = imagesy($image);
        $scale = min(1, $max / max($w, $h));
        $nw = max(1, (int) round($w * $scale));
        $nh = max(1, (int) round($h * $scale));

        $out = imagecreatetruecolor($nw, $nh);
        imagealphablending($out, false);
        imagesavealpha($out, true);
        imagefill($out, 0, 0, imagecolorallocatealpha($out, 0, 0, 0, 127));
        imagecopyresampled($out, $image, 0, 0, 0, 0, $nw, $nh, $w, $h);

        ob_start();
        imagewebp($out, null, self::QUALITY);
        imagedestroy($out);

        return (string) ob_get_clean();
    }

    /**
     * Une photo décodée occupe environ 5 octets par pixel, plus la copie redimensionnée. Une photo de téléphone
     * (12 à 50 Mpx) dépasse souvent la limite par défaut : on la relève le temps du traitement, jusqu'à 1 Go.
     */
    private static function fitsInMemory(int $w, int $h): bool
    {
        if ($w * $h > 60_000_000) {
            return false;
        }
        $need = memory_get_usage(true) + $w * $h * 5 + self::LARGE * self::LARGE * 5 + 16 * 1024 ** 2;
        $limit = self::bytes((string) ini_get('memory_limit'));
        if ($limit < 0 || $need <= $limit) {
            return true;
        }

        return $need <= 1024 ** 3 && ini_set('memory_limit', (string) ceil($need / 1024 ** 2).'M') !== false;
    }

    private static function bytes(string $value): int
    {
        if (trim($value) === '-1') {
            return -1;
        }

        return (int) $value * match (strtolower(substr(trim($value), -1))) {
            'g' => 1024 ** 3, 'm' => 1024 ** 2, 'k' => 1024, default => 1,
        };
    }
}
