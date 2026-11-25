<?php

namespace App\Support;

use App\Models\Store;

/**
 * Habillage des e-mails : couleur, police des titres et logo du template de la boutique
 * (mêmes règles que la facture), ou l'identité Biolinko pour les e-mails du compte vendeur.
 */
class MailTheme
{
    public const INK = '#2B2620';

    public const BRAND = '#FFCC00';

    public static function for(?Store $store): array
    {
        $invoice = $store ? InvoiceTheme::for($store) : null;
        $accent = $invoice['accent'] ?? self::BRAND;
        $light = InvoiceTheme::isLight($accent);
        $design = $store ? StoreDesign::forStore($store) : null;
        $font = $design['style']['font_display'] ?? $store?->font_family;
        $font = $font && in_array($font, StoreDesign::FONTS, true) && $font !== 'DejaVu Sans' ? $font : null;
        $seller = $store?->user;

        return [
            'name' => $store?->name ?? 'Biolinko',
            'accent' => $accent,
            // Liens et titres sur fond blanc : une couleur claire (jaune…) n'y serait pas lisible
            'accent_ink' => $light ? self::INK : $accent,
            'on_accent' => $light ? self::INK : '#FFFFFF',
            'font' => $font,
            'font_url' => $font ? 'https://fonts.googleapis.com/css2?family='.str_replace(' ', '+', $font).':wght@600;700&display=swap' : null,
            'logo' => $store ? InvoiceLogo::forMail($store) : ['url' => Seo::url('/images/brand/logo-noir-hd.png'), 'width' => 36, 'height' => 36],
            'store_url' => $store?->slug ? StoreUrl::home($store) : Seo::url('/'),
            'store_address' => $store?->slug ? StoreUrl::display($store) : 'biolinko.app',
            'whatsapp' => $store ? ($store->phone_whatsapp ?: $seller?->phone_whatsapp) : null,
            // Formules payantes : e-mails 100 % à la marque de la boutique, comme la facture
            'show_biolinko' => ! $store || ! ($seller && $seller->hasPlan('pro')),
            'is_store' => (bool) $store,
        ];
    }
}
