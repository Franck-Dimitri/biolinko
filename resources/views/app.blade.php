<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'BIOLINKO') }}</title>

        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="/branding/biolinko_black_on_yellow.ico">
        <link rel="shortcut icon" type="image/x-icon" href="/branding/biolinko_black_on_yellow.ico">
        <link rel="icon" type="image/png" sizes="32x32" href="/branding/biolinko_black_on_yellow.png">
        <link rel="apple-touch-icon" sizes="180x180" href="/branding/biolinko_black_on_yellow.png">

        <!-- Google Fonts: Nunito (Principale) & Montserrat (Secondaire) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700&family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased text-slate-900 bg-[#F8FAFC]">
        @inertia
    </body>
</html>
