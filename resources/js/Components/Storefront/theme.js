// Couleur de texte lisible sur la couleur de thème choisie par le vendeur (formule YIQ).
export function contrastColor(hexColor) {
    if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) return '#2B2620';
    const hex = hexColor.replace('#', '');
    if (hex.length < 6) return '#2B2620';
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return (r * 299 + g * 587 + b * 114) / 1000 >= 165 ? '#2B2620' : '#FFFFFF';
}
