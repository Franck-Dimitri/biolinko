export default function ApplicationLogo({
    className = 'h-10 w-10',
    variant = 'black_on_yellow', // 'black_on_yellow' | 'yellow_on_dark' | 'black_on_white' | 'black_transparent' | 'yellow_transparent'
    rounded = 'rounded-xl',
    alt = 'Biolinko Logo',
    ...props
}) {
    const srcMap = {
        black_on_yellow: '/branding/biolinko_black_on_yellow.png',
        yellow_on_dark: '/branding/biolinko_yellow_on_dark.png',
        black_on_white: '/branding/biolinko_black_on_white.png',
        black_transparent: '/branding/biolinko_icon_black_transparent.png',
        yellow_transparent: '/branding/biolinko_icon_yellow_transparent.png',
    };

    const logoSrc = srcMap[variant] || '/branding/biolinko_black_on_yellow.png';

    return (
        <img
            src={logoSrc}
            alt={alt}
            className={`${rounded} object-contain shrink-0 select-none shadow-2xs ${className}`}
            {...props}
        />
    );
}
