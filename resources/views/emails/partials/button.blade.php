{{-- Bouton à la couleur de la boutique --}}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 22px 0 8px;">
    <tr>
        <td style="border-radius: 8px; background: {{ $theme['accent'] }};">
            <a href="{{ $url }}" style="display: inline-block; padding: 12px 22px; font-size: 15px; font-weight: 600; color: {{ $theme['on_accent'] }}; text-decoration: none; border-radius: 8px;">{{ $label }}</a>
        </td>
    </tr>
</table>
