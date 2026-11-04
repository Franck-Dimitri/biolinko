<?php

/*
| Paiements Biolinko : agrégateur, frais, commissions et pays.
| Les montants en pourcentage sont des nombres (3.5 = 3,5 %).
*/

return [

    // Agrégateur utilisé pour les nouveaux paiements et retraits : mercypay | pawapay | hrskills
    // Une opération déjà lancée reste toujours suivie chez l'agrégateur qui l'a traitée.
    'driver' => env('PAYMENT_DRIVER', 'mercypay'),
    'payout_driver' => env('PAYOUT_DRIVER', env('PAYMENT_DRIVER', 'mercypay')),

    // Frais de service ajoutés au panier de l'acheteur (couvrent l'encaissement de l'agrégateur)
    'client_fee_percent' => 3.5,

    // Montant minimum d'une commande payée en ligne (prix des articles, hors frais de service) :
    // en dessous, les frais fixes de l'agrégateur dépassent la marge
    'min_order' => 1000,

    // Frais prélevés sur chaque retrait du vendeur
    'withdrawal_fee_percent' => 0, // Retraits gratuits : le virement Mercy Pay (2 %) est couvert par la commission
    'min_withdrawal' => 1000,

    // Commission Biolinko sur chaque vente, selon le plan du vendeur au moment du paiement
    'commission_percent' => [
        'starter' => 10,
        'pro' => 7,
        'growth' => 4,
        'business' => 2,
    ],

    // Coût estimé de l'agrégateur (pour calculer la marge nette dans l'admin) : % encaissé / % viré
    // Mercy Pay : 3,5 % / 2 % — pawaPay en direct : environ 1,8 % / 1,3 %
    'gateway_cost_percent' => ['collection' => 3.5, 'payout' => 2],

    // Mercy Pay (revendeur pawaPay) : frais 3,5 % à l'encaissement, 2 % retenus sur chaque virement
    'mercypay' => [
        'key' => env('MERCYPAY_API_KEY'), // mp_sandbox_… ou mp_live_…
        'webhook_secret' => env('MERCYPAY_WEBHOOK_SECRET'),
        'base_url' => env('MERCYPAY_BASE_URL', 'https://mercy-pay.com'),
        'payout_fee_percent' => 2,
    ],

    'pawapay' => [
        'token' => env('PAWAPAY_API_TOKEN'),
        'env' => env('PAWAPAY_ENV', 'sandbox'), // sandbox | production
        'base_url' => env('PAWAPAY_ENV', 'sandbox') === 'production' ? 'https://api.pawapay.io' : 'https://api.sandbox.pawapay.io',
    ],

    /*
    | Pays couverts par Mercy Pay : seuls ceux marqués "enabled" acceptent des boutiques et des paiements.
    | operators : code affiché dans l'app => code fournisseur (identique chez Mercy Pay et pawaPay).
    | digits : chiffres du numéro local, sans indicatif (plusieurs longueurs possibles).
    | decimals : décimales de la devise (ISO 4217) ; Mercy Pay attend les montants en unités mineures.
    | min_order : minimum de commande dans la devise locale, environ l'équivalent de 1 000 FCFA (à ajuster).
    | prefixes : début du numéro local pour deviner l'opérateur.
    */
    'countries' => [
        'CM' => ['enabled' => true, 'name' => 'Cameroun', 'iso3' => 'CMR', 'dial' => '237', 'currency' => 'XAF', 'decimals' => 0, 'digits' => [9], 'min_order' => 1000,
            'operators' => ['MTN' => 'MTN_MOMO_CMR', 'ORANGE' => 'ORANGE_CMR'],
            'prefixes' => ['ORANGE' => ['69', '655', '656', '657', '658', '659', '640'], 'MTN' => ['67', '68', '650', '651', '652', '653', '654']]],
        'CG' => ['enabled' => false, 'name' => 'Congo', 'iso3' => 'COG', 'dial' => '242', 'currency' => 'XAF', 'decimals' => 0, 'digits' => [9], 'min_order' => 1000,
            'operators' => ['MTN' => 'MTN_MOMO_COG', 'AIRTEL' => 'AIRTEL_COG'],
            'prefixes' => ['MTN' => ['06'], 'AIRTEL' => ['05', '04']]],
        'BJ' => ['enabled' => false, 'name' => 'Bénin', 'iso3' => 'BEN', 'dial' => '229', 'currency' => 'XOF', 'decimals' => 0, 'digits' => [8, 10], 'min_order' => 1000,
            'operators' => ['MTN' => 'MTN_MOMO_BEN', 'MOOV' => 'MOOV_BEN'],
            // Anciens numéros à 8 chiffres, et nouveaux à 10 chiffres (01 + ancien numéro)
            'prefixes' => ['MOOV' => ['55', '58', '60', '63', '64', '65', '68', '94', '95', '98', '99', '0155', '0158', '0160', '0163', '0164', '0165', '0168', '0194', '0195', '0198', '0199'],
                'MTN' => ['51', '52', '53', '54', '56', '57', '59', '61', '62', '66', '67', '69', '90', '91', '96', '97', '01']]],
        'CI' => ['enabled' => false, 'name' => 'Côte d’Ivoire', 'iso3' => 'CIV', 'dial' => '225', 'currency' => 'XOF', 'decimals' => 0, 'digits' => [10], 'min_order' => 1000,
            'operators' => ['MTN' => 'MTN_MOMO_CIV', 'ORANGE' => 'ORANGE_CIV'],
            'prefixes' => ['MTN' => ['05'], 'ORANGE' => ['07']]],
        'SN' => ['enabled' => false, 'name' => 'Sénégal', 'iso3' => 'SEN', 'dial' => '221', 'currency' => 'XOF', 'decimals' => 0, 'digits' => [9], 'min_order' => 1000,
            'operators' => ['ORANGE' => 'ORANGE_SEN', 'FREE' => 'FREE_SEN'],
            'prefixes' => ['ORANGE' => ['77', '78'], 'FREE' => ['76']]],
        'CD' => ['enabled' => false, 'name' => 'RD Congo', 'iso3' => 'COD', 'dial' => '243', 'currency' => 'CDF', 'decimals' => 2, 'digits' => [9], 'min_order' => 4500,
            'operators' => ['VODACOM' => 'VODACOM_MPESA_COD', 'AIRTEL' => 'AIRTEL_COD', 'ORANGE' => 'ORANGE_COD'],
            'prefixes' => ['VODACOM' => ['81', '82', '83'], 'AIRTEL' => ['97', '98', '99'], 'ORANGE' => ['84', '85', '89']]],
        'RW' => ['enabled' => false, 'name' => 'Rwanda', 'iso3' => 'RWA', 'dial' => '250', 'currency' => 'RWF', 'decimals' => 0, 'digits' => [9], 'min_order' => 2300,
            'operators' => ['MTN' => 'MTN_MOMO_RWA', 'AIRTEL' => 'AIRTEL_RWA'],
            'prefixes' => ['MTN' => ['78', '79'], 'AIRTEL' => ['72', '73']]],
        'SL' => ['enabled' => false, 'name' => 'Sierra Leone', 'iso3' => 'SLE', 'dial' => '232', 'currency' => 'SLE', 'decimals' => 2, 'digits' => [8], 'min_order' => 37,
            'operators' => ['ORANGE' => 'ORANGE_SLE']],
        'UG' => ['enabled' => false, 'name' => 'Ouganda', 'iso3' => 'UGA', 'dial' => '256', 'currency' => 'UGX', 'decimals' => 0, 'digits' => [9], 'min_order' => 6000,
            'operators' => ['MTN' => 'MTN_MOMO_UGA', 'AIRTEL' => 'AIRTEL_OAPI_UGA'],
            'prefixes' => ['MTN' => ['77', '78', '76'], 'AIRTEL' => ['70', '75', '74']]],
        'ZM' => ['enabled' => false, 'name' => 'Zambie', 'iso3' => 'ZMB', 'dial' => '260', 'currency' => 'ZMW', 'decimals' => 2, 'digits' => [9], 'min_order' => 45,
            'operators' => ['MTN' => 'MTN_MOMO_ZMB', 'AIRTEL' => 'AIRTEL_OAPI_ZMB'],
            'prefixes' => ['MTN' => ['96', '76'], 'AIRTEL' => ['97', '77']]],
        'GH' => ['enabled' => false, 'name' => 'Ghana', 'iso3' => 'GHA', 'dial' => '233', 'currency' => 'GHS', 'decimals' => 2, 'digits' => [9], 'min_order' => 25,
            'operators' => ['MTN' => 'MTN_MOMO_GHA', 'TELECEL' => 'VODAFONE_GHA', 'AIRTELTIGO' => 'AIRTELTIGO_GHA'],
            'prefixes' => ['MTN' => ['24', '54', '55', '59'], 'TELECEL' => ['20', '50'], 'AIRTELTIGO' => ['27', '57', '26', '56']]],
    ],
];
