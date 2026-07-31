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
                display: ['"Nunito"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: {
                    yellow: '#FFCC00',
                    yellowHover: '#E6B800',
                    yellowLight: '#FFF8D6',
                    dark: '#18181B',
                }
            }
        },
    },

    plugins: [forms],
};
