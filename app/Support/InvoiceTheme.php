<?php

namespace App\Support;

use App\Models\Store;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * Apparence de la facture PDF selon la boutique : couleur, polices et motif de son template
 * (ou de ses réglages d'Apparence pour le template « Classique »). La facture reste sur papier blanc,
 * lisible à l'impression : une couleur trop claire pour du texte est remplacée par l'encre.
 */
class InvoiceTheme
{
    private const INK = '#141412';

    public static function for(?Store $store): array
    {
        $design = $store ? StoreDesign::forStore($store) : null;
        $hex = fn ($c) => is_string($c) && preg_match('/^#[0-9A-Fa-f]{6}$/', $c) ? strtoupper($c) : null;

        $primary = $hex($design['style']['primary'] ?? null) ?? $hex($store?->theme_color) ?? self::INK;
        $light = self::isLight($primary);
        $display = $design['style']['font_display'] ?? $store?->font_family;
        $body = $design['style']['font_body'] ?? $store?->font_family;
        $pattern = $design ? (($design['pattern']['intensity'] ?? 'soft') === 'none' ? null : ($design['pattern']['key'] ?? null)) : $store?->pattern;

        $displayFont = self::font('sf-display', $display);
        $bodyFont = $body === $display ? $displayFont : self::font('sf-body', $body);

        return [
            'accent' => $primary,
            // Couleur des titres et filets sur papier blanc
            'accent_ink' => $light ? self::INK : $primary,
            'on_accent' => $light ? self::INK : '#FFFFFF',
            'fonts' => array_values(array_unique(array_filter([$displayFont, $bodyFont]), SORT_REGULAR)),
            'display' => $displayFont['alias'] ?? null,
            'body' => $bodyFont['alias'] ?? null,
            'pattern' => $pattern && $pattern !== 'none' ? self::patternBand($pattern, $primary) : null,
        ];
    }

    /** Couleur claire (texte foncé lisible dessus), formule YIQ comme la vitrine. */
    public static function isLight(string $hex): bool
    {
        [$r, $g, $b] = sscanf($hex, '#%02x%02x%02x');

        return ($r * 299 + $g * 587 + $b * 114) / 1000 >= 165;
    }

    /** Police déclarée pour le PDF : fichiers TTF locaux (normal et gras), sinon null. */
    private static function font(string $alias, ?string $family): ?array
    {
        if (! $family || $family === 'DejaVu Sans' || ! in_array($family, StoreDesign::FONTS, true)) {
            return null;
        }
        $regular = self::fontFile($family, 400);
        if (! $regular) {
            return null;
        }

        return ['alias' => $alias, 'regular' => $regular, 'bold' => self::fontFile($family, 700) ?? $regular];
    }

    private static function fontFile(string $family, int $weight): ?string
    {
        $dir = config('invoices.font_path', storage_path('fonts/google'));
        $path = $dir.'/'.Str::slug($family).'-'.$weight.'.ttf';
        if (is_file($path)) {
            return $path;
        }
        $missing = $path.'.missing';
        if (! config('invoices.remote_fonts') || (is_file($missing) && filemtime($missing) > time() - 86400)) {
            return null;
        }

        try {
            // L'ancienne API Google Fonts renvoie des fichiers TTF, le seul format lu par le moteur PDF
            $css = Http::timeout(4)->withHeaders(['User-Agent' => 'Mozilla/4.0'])
                ->get('https://fonts.googleapis.com/css', ['family' => "{$family}:{$weight}"]);
            if ($css->successful() && preg_match('#url\((https://fonts\.gstatic\.com/[^)]+\.ttf)\)#', $css->body(), $m)) {
                $ttf = Http::timeout(8)->get($m[1]);
                if ($ttf->successful() && in_array(substr($ttf->body(), 0, 4), ["\x00\x01\x00\x00", 'true', 'OTTO'], true)) {
                    File::ensureDirectoryExists($dir);
                    File::put($path, $ttf->body());

                    return $path;
                }
            }
        } catch (\Throwable $e) {
            report($e);
        }
        File::ensureDirectoryExists($dir);
        File::put($missing, '');

        return null;
    }

    /**
     * Bandeau de motif (SVG, data URI) pour l'en-tête de la facture, dessiné par le moteur PDF
     * comme le QR code. Une teinte claire de la couleur remplace la transparence, mal rendue en PDF.
     */
    public static function patternBand(string $key, string $color): ?string
    {
        static $tiles = null;
        $tiles ??= json_decode((string) @file_get_contents(resource_path('data/pattern-tiles.json')), true) ?: [];
        $tile = $tiles[$key] ?? null;
        if (! $tile) {
            return null;
        }

        [$r, $g, $b] = sscanf($color, '#%02x%02x%02x');
        $tint = sprintf('#%02x%02x%02x', ...array_map(fn ($v) => (int) round($v * 0.45 + 255 * 0.55), [$r, $g, $b]));
        $scale = 0.55;
        $size = $tile['size'] * $scale;
        // Deux rangées décalées, sans tuile coupée : le moteur PDF ne rogne pas le dessin au cadre de l'image
        $cols = (int) floor(760 / $size);
        $w = (int) ceil($cols * $size + $size / 2);
        $h = (int) ceil($size * 2);
        $inner = str_replace('{{c}}', $tint, $tile['svg']);
        $cells = '';
        for ($row = 0; $row < 2; $row++) {
            for ($i = 0, $x = $row ? $size / 2 : 0; $i < $cols; $i++, $x += $size) {
                $cells .= '<g transform="translate('.round($x, 2).' '.round($row * $size, 2).') scale('.$scale.')">'.$inner.'</g>';
            }
        }
        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'.$w.'" height="'.$h.'" viewBox="0 0 '.$w.' '.$h.'">'.$cells.'</svg>';

        return 'data:image/svg+xml;base64,'.base64_encode($svg);
    }
}
