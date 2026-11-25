@php
    /** @var array $theme MailTheme::for() */
    $t = $theme;
    $sans = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    $display = $t['font'] ? "'{$t['font']}', {$sans}" : $sans;
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <title>{{ $title ?? $t['name'] }}</title>
    @if ($t['font_url'])
        <link href="{{ $t['font_url'] }}" rel="stylesheet">
    @endif
    <style>
        body { margin: 0; padding: 0; background: #F4F3EF; }
        a { color: {{ $t['accent_ink'] }}; }
        @media (max-width: 600px) {
            .pad { padding-left: 20px !important; padding-right: 20px !important; }
            .outer { padding: 0 !important; }
            .card { border-radius: 0 !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background: #F4F3EF;">
    @if (! empty($preheader))
        <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent;">{{ $preheader }}</div>
    @endif
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F4F3EF;">
        <tr>
            <td align="center" class="outer" style="padding: 32px 12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="card" style="max-width: 560px; background: #FFFFFF; border-radius: 14px; overflow: hidden;">
                    <tr><td style="height: 4px; line-height: 4px; font-size: 0; background: {{ $t['accent'] }};">&nbsp;</td></tr>

                    {{-- En-tête : logo et nom de la boutique --}}
                    <tr>
                        <td class="pad" style="padding: 26px 36px 6px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding-right: 12px; vertical-align: middle;">
                                        @if ($t['logo'])
                                            <img src="{{ $t['logo']['url'] }}" width="{{ $t['logo']['width'] }}" height="{{ $t['logo']['height'] }}" alt="{{ $t['name'] }}" style="display: block; border: 0; border-radius: 6px;">
                                        @else
                                            <div style="width: 40px; height: 40px; line-height: 40px; border-radius: 10px; background: {{ $t['accent'] }}; color: {{ $t['on_accent'] }}; text-align: center; font-family: {!! $display !!}; font-size: 18px; font-weight: 700;">{{ mb_strtoupper(mb_substr($t['name'], 0, 1)) }}</div>
                                        @endif
                                    </td>
                                    <td style="vertical-align: middle; font-family: {!! $display !!}; font-size: 17px; font-weight: 700; color: {{ \App\Support\MailTheme::INK }};">{{ $t['name'] }}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Contenu --}}
                    <tr>
                        <td class="pad" style="padding: 18px 36px 30px; font-family: {!! $sans !!}; font-size: 15px; line-height: 1.6; color: {{ \App\Support\MailTheme::INK }};">
                            @if (! empty($heading))
                                <h1 style="margin: 0 0 14px; font-family: {!! $display !!}; font-size: 22px; line-height: 1.25; font-weight: 700; color: {{ \App\Support\MailTheme::INK }};">{{ $heading }}</h1>
                            @endif
                            @yield('content')
                        </td>
                    </tr>

                    {{-- Pied --}}
                    <tr>
                        <td class="pad" style="padding: 18px 36px 24px; border-top: 1px solid #ECEAE4; font-family: {!! $sans !!}; font-size: 12.5px; line-height: 1.6; color: #8B8A83;">
                            @hasSection('footer')
                                @yield('footer')
                            @elseif ($t['is_store'])
                                <a href="{{ $t['store_url'] }}" style="color: #5F5E58; text-decoration: none;">{{ $t['store_address'] }}</a>@if ($t['whatsapp']) · WhatsApp {{ $t['whatsapp'] }}@endif
                            @endif
                            @if ($t['show_biolinko'])
                                <div style="margin-top: 6px;">@if ($t['is_store'])Paiement sécurisé par @endif<a href="{{ \App\Support\Seo::url('/') }}" style="color: #8B8A83;">Biolinko</a></div>
                            @endif
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
