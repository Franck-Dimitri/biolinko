<!DOCTYPE html>
<html lang="fr">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $meta['title'] ?? config('app.name', 'Biolinko') }}</title>
        @include('partials.seo')

        <!-- Favicon -->
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">
        <link rel="icon" type="image/x-icon" href="/branding/biolinko_black_on_yellow.ico">
        <link rel="shortcut icon" type="image/x-icon" href="/branding/biolinko_black_on_yellow.ico">
        <link rel="icon" type="image/png" sizes="32x32" href="/branding/biolinko_black_on_yellow.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/branding/biolinko_black_on_yellow.png">

        <!-- Police de la marque : Poppins uniquement (charte docs/brand) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased text-slate-900 bg-[#F8FAFC]">
        @inertia
        {{-- Blocs de chargement tant que la page n'est pas affichée (réseau lent, sans rendu serveur) --}}
        <style>
            .boot-skel{display:none;max-width:1200px;margin:0 auto;padding:24px 20px;color:#2B2620}
            #app:empty~.boot-skel{display:block}
            .boot-skel i{display:block;background:currentColor;opacity:.07;border-radius:16px;animation:boot-pulse 1.4s ease-in-out infinite}
            .boot-skel .g{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:24px}
            @media(min-width:768px){.boot-skel .g{grid-template-columns:repeat(4,1fr)}}
            @keyframes boot-pulse{50%{opacity:.14}}
            @media(prefers-reduced-motion:reduce){.boot-skel i{animation:none}}
        </style>
        <div class="boot-skel" role="status" aria-label="Chargement">
            <i style="height:44px;width:160px;border-radius:999px"></i>
            <i style="height:220px;margin-top:24px"></i>
            <div class="g">@for ($i = 0; $i < 4; $i++)<div><i style="aspect-ratio:4/5"></i><i style="height:14px;width:80%;margin-top:12px"></i><i style="height:14px;width:50%;margin-top:8px"></i></div>@endfor</div>
        </div>
    </body>
</html>
