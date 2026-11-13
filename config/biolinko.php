<?php

/*
| Informations publiques de Biolinko : contact, réseaux sociaux et identité légale de l'éditeur.
| Tout se règle dans .env : une valeur vide n'est simplement pas affichée sur le site.
*/
return [
    'contact' => [
        'email' => env('BIOLINKO_CONTACT_EMAIL', 'contact@biolinko.link'),
        // Numéro WhatsApp Business du support, au format international sans + (ex. 2376XXXXXXXX)
        'whatsapp' => env('BIOLINKO_WHATSAPP'),
        'city' => env('BIOLINKO_CITY', 'Douala, Cameroun'),
    ],

    // Pages officielles : renseigner les liens quand elles sont créées
    'socials' => [
        'whatsapp' => env('BIOLINKO_SOCIAL_WHATSAPP'),
        'instagram' => env('BIOLINKO_SOCIAL_INSTAGRAM'),
        'tiktok' => env('BIOLINKO_SOCIAL_TIKTOK'),
        'facebook' => env('BIOLINKO_SOCIAL_FACEBOOK'),
        'linkedin' => env('BIOLINKO_SOCIAL_LINKEDIN'),
        'youtube' => env('BIOLINKO_SOCIAL_YOUTUBE'),
    ],

    // Mentions légales : à compléter une fois le statut juridique obtenu (entreprenant, société…)
    'publisher' => [
        'name' => env('BIOLINKO_PUBLISHER_NAME'),
        'status' => env('BIOLINKO_PUBLISHER_STATUS'),
        'registration' => env('BIOLINKO_PUBLISHER_REGISTRATION'), // RCCM, numéro de contribuable…
        'address' => env('BIOLINKO_PUBLISHER_ADDRESS'),
        'director' => env('BIOLINKO_PUBLISHER_DIRECTOR'), // responsable de la publication
    ],

    'host' => [
        'name' => env('BIOLINKO_HOST_NAME'),
        'address' => env('BIOLINKO_HOST_ADDRESS'),
    ],
];
