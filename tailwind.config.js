import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Nunito"', ...defaultTheme.fontFamily.sans],
                display: ['"Montserrat"', '"Nunito"', ...defaultTheme.fontFamily.sans],
                secondary: ['"Montserrat"', ...defaultTheme.fontFamily.sans],
                heading: ['"Montserrat"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    yellow: '#FFCC00',
                    yellowHover: '#E6B800',
                    yellowLight: '#FFF8D6',
                    dark: '#18181B',
                    // Refonte vitrine & landing : encre chaude plutôt que noir pur
                    ink: '#2B2620',
                    muted: '#6F6757',
                    cream: '#FFFBEB',
                    sand: '#FBF6E9',
                    line: '#EDE5CF',
                    honey: '#FFE58A',
                },
            },
            keyframes: {
                marquee: {
                    from: { transform: 'translateX(0)' },
                    to: { transform: 'translateX(-50%)' },
                },
            },
            animation: {
                marquee: 'marquee 40s linear infinite',
            },
        },
    },

    plugins: [forms],
};
