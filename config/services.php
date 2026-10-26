<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'hrskills_pay' => [
        'base_url' => env('HRSKILLS_PAY_BASE_URL', 'https://api.hrskills-pay.com'),
        'public_key' => env('HRSKILLS_PAY_PUBLIC_KEY'),
        'secret_key' => env('HRSKILLS_PAY_SECRET_KEY'),
        'webhook_secret' => env('HRSKILLS_PAY_WEBHOOK_SECRET'),
        'country' => 'CM',
        'currency' => 'XAF',
        // 'simulation' : les abonnements sont confirmés sans appel à l'opérateur (aucun débit).
        // Passer à 'live' uniquement quand la passerelle est prête pour la production.
        'subscription_mode' => env('SUBSCRIPTION_PAYMENT_MODE', 'simulation'),
    ],

    // Passerelle utilisée pour les notifications : "cloud" (API officielle Meta) ou "evolution"
    'whatsapp_driver' => env('WHATSAPP_DRIVER', 'cloud'),

    'whatsapp_cloud' => [
        'token' => env('WHATSAPP_CLOUD_TOKEN'),
        'phone_number_id' => env('WHATSAPP_CLOUD_PHONE_NUMBER_ID'),
        'business_account_id' => env('WHATSAPP_CLOUD_BUSINESS_ACCOUNT_ID'),
        'app_secret' => env('WHATSAPP_CLOUD_APP_SECRET'),
        'verify_token' => env('WHATSAPP_CLOUD_VERIFY_TOKEN'),
        'version' => env('WHATSAPP_CLOUD_API_VERSION', 'v23.0'),
        'language' => env('WHATSAPP_CLOUD_LANGUAGE', 'fr'),
        // Domaine public des liens dans les modèles (Meta refuse localhost)
        'public_url' => env('WHATSAPP_CLOUD_PUBLIC_URL', 'https://biolinko.link'),
    ],

    'whatsapp_gateway' => [
        'enabled' => env('WHATSAPP_GATEWAY_ENABLED', false),
        'base_url' => env('WHATSAPP_GATEWAY_URL', env('EVOLUTION_API_URL')),
        'api_key' => env('WHATSAPP_GATEWAY_KEY', env('EVOLUTION_API_KEY')),
        'default_instance' => env('WHATSAPP_GATEWAY_DEFAULT_INSTANCE', env('EVOLUTION_INSTANCE', 'test_dims')),
    ],

];

