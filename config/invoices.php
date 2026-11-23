<?php

return [
    /*
    | Polices du template de la boutique dans la facture PDF : téléchargées une fois depuis Google Fonts
    | (fichiers TTF gardés dans storage/fonts/google). false = police par défaut du PDF (tests, serveur sans Internet).
    */
    'remote_fonts' => env('INVOICE_REMOTE_FONTS', true),

    // Dossier des polices téléchargées (gardées d'une facture à l'autre)
    'font_path' => storage_path('fonts/google'),
];
