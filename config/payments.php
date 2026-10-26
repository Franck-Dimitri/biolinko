<?php

/*
| Paiements Biolinko : agrégateur, frais, commissions et pays.
| Les montants en pourcentage sont des nombres (3.5 = 3,5 %).
*/

return [

    // Agrégateur utilisé pour les nouveaux paiements et retraits : pawapay | hrskills
    // Une opération déjà lancée reste toujours suivie chez l'agrégateur qui l'a traitée.
    'driver' => env('PAYMENT_DRIVER', 'pawapay'),
    'payout_driver' => env('PAYOUT_DRIVER', env('PAYMENT_DRIVER', 'pawapay')),

    // Frais de service ajoutés au panier de l'acheteur (couvrent l'encaissement de l'agrégateur)
    'client_fee_percent' => 3.5,

    // Frais prélevés sur chaque retrait du vendeur
    'withdrawal_fee_percent' => 3,
    'min_withdrawal' => 1000,

    // Commission Biolinko sur chaque vente, selon le plan du vendeur au moment du paiement
    'commission_percent' => [
        'starter' => 7,
        'pro' => 4,
        'growth' => 2.5,
        'business' => 1.5,
    ],

    'pawapay' => [
        'token' => env('PAWAPAY_API_TOKEN'),
        'env' => env('PAWAPAY_ENV', 'sandbox'), // sandbox | production
        'base_url' => env('PAWAPAY_ENV', 'sandbox') === 'production' ? 'https://api.pawapay.io' : 'https://api.sandbox.pawapay.io',
    ],

    /*
    | Pays : seuls ceux marqués "enabled" acceptent des boutiques et des paiements.
    | operators : code affiché dans l'app => code fournisseur pawaPay.
    | prefixes : début du numéro local (sans indicatif) pour deviner l'opérateur.
    */
    'countries' => [
        'CM' => ['enabled' => true, 'name' => 'Cameroun', 'iso3' => 'CMR', 'dial' => '237', 'currency' => 'XAF', 'digits' => 9,
            'operators' => ['MTN' => 'MTN_MOMO_CMR', 'ORANGE' => 'ORANGE_CMR'],
            'prefixes' => ['ORANGE' => ['69', '655', '656', '657', '658', '659', '640'], 'MTN' => ['67', '68', '650', '651', '652', '653', '654']]],
        'GA' => ['enabled' => false, 'name' => 'Gabon', 'iso3' => 'GAB', 'dial' => '241', 'currency' => 'XAF', 'digits' => 8,
            'operators' => ['AIRTEL' => 'AIRTEL_GAB']],
        'CI' => ['enabled' => false, 'name' => 'Côte d’Ivoire', 'iso3' => 'CIV', 'dial' => '225', 'currency' => 'XOF', 'digits' => 10,
            'operators' => ['MTN' => 'MTN_MOMO_CIV', 'ORANGE' => 'ORANGE_CIV', 'MOOV' => 'MOOV_CIV']],
        'SN' => ['enabled' => false, 'name' => 'Sénégal', 'iso3' => 'SEN', 'dial' => '221', 'currency' => 'XOF', 'digits' => 9,
            'operators' => ['ORANGE' => 'ORANGE_SEN', 'FREE' => 'FREE_SEN']],
        'BJ' => ['enabled' => false, 'name' => 'Bénin', 'iso3' => 'BEN', 'dial' => '229', 'currency' => 'XOF', 'digits' => 10,
            'operators' => ['MTN' => 'MTN_MOMO_BEN', 'MOOV' => 'MOOV_BEN']],
        'BF' => ['enabled' => false, 'name' => 'Burkina Faso', 'iso3' => 'BFA', 'dial' => '226', 'currency' => 'XOF', 'digits' => 8,
            'operators' => ['MOOV' => 'MOOV_BFA']],
        'CD' => ['enabled' => false, 'name' => 'RD Congo', 'iso3' => 'COD', 'dial' => '243', 'currency' => 'CDF', 'digits' => 9,
            'operators' => ['ORANGE' => 'ORANGE_COD', 'AIRTEL' => 'AIRTEL_COD', 'VODACOM' => 'VODACOM_MPESA_COD']],
        'RW' => ['enabled' => false, 'name' => 'Rwanda', 'iso3' => 'RWA', 'dial' => '250', 'currency' => 'RWF', 'digits' => 9,
            'operators' => ['MTN' => 'MTN_MOMO_RWA', 'AIRTEL' => 'AIRTEL_RWA']],
        'KE' => ['enabled' => false, 'name' => 'Kenya', 'iso3' => 'KEN', 'dial' => '254', 'currency' => 'KES', 'digits' => 9,
            'operators' => ['MPESA' => 'MPESA_KEN']],
        'TZ' => ['enabled' => false, 'name' => 'Tanzanie', 'iso3' => 'TZA', 'dial' => '255', 'currency' => 'TZS', 'digits' => 9,
            'operators' => ['VODACOM' => 'VODACOM_TZA', 'AIRTEL' => 'AIRTEL_TZA', 'TIGO' => 'TIGO_TZA', 'HALOTEL' => 'HALOTEL_TZA']],
        'UG' => ['enabled' => false, 'name' => 'Ouganda', 'iso3' => 'UGA', 'dial' => '256', 'currency' => 'UGX', 'digits' => 9,
            'operators' => ['MTN' => 'MTN_MOMO_UGA', 'AIRTEL' => 'AIRTEL_OAPI_UGA']],
    ],
];
