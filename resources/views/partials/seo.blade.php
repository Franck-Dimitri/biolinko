@php
    $meta = $meta ?? null;
    // Par défaut (espace connecté, tunnel, suivi de commande…) : pas d'indexation
    $robots = $meta['robots'] ?? ($meta ? 'index, follow, max-image-preview:large' : 'noindex, nofollow');
    $siteName = $meta['site_name'] ?? 'Biolinko';
@endphp
<meta name="robots" content="{{ $robots }}">
@if ($meta)
    @if (! empty($meta['description']))
        <meta name="description" content="{{ $meta['description'] }}">
    @endif
    @if (! empty($meta['canonical']))
        <link rel="canonical" href="{{ $meta['canonical'] }}">
    @endif
    <meta property="og:locale" content="fr_FR">
    <meta property="og:site_name" content="{{ $siteName }}">
    <meta property="og:type" content="{{ $meta['type'] ?? 'website' }}">
    <meta property="og:title" content="{{ $meta['title'] }}">
    @if (! empty($meta['description']))
        <meta property="og:description" content="{{ $meta['description'] }}">
    @endif
    @if (! empty($meta['canonical']))
        <meta property="og:url" content="{{ $meta['canonical'] }}">
    @endif
    @if (! empty($meta['image']))
        <meta property="og:image" content="{{ $meta['image'] }}">
        <meta property="og:image:alt" content="{{ $meta['title'] }}">
        <meta name="twitter:image" content="{{ $meta['image'] }}">
    @endif
    @if (! empty($meta['price']))
        <meta property="product:price:amount" content="{{ $meta['price']['amount'] }}">
        <meta property="product:price:currency" content="{{ $meta['price']['currency'] }}">
        <meta property="product:availability" content="{{ $meta['price']['availability'] }}">
    @endif
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $meta['title'] }}">
    @if (! empty($meta['description']))
        <meta name="twitter:description" content="{{ $meta['description'] }}">
    @endif
    @foreach ($meta['jsonld'] ?? [] as $schema)
        <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP) !!}</script>
    @endforeach
@endif
@if (config('services.google.site_verification'))
    <meta name="google-site-verification" content="{{ config('services.google.site_verification') }}">
@endif
