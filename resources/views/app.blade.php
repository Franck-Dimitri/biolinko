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

        <!-- Google Fonts: Inter (Principale style Shopify) & Poppins (Titres modernes) & Roboto -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">

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
